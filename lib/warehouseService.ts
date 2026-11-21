import { connectToDatabase } from '@/lib/mongodb';
import { WarehouseEntry } from '@/lib/models/WarehouseEntry';
import { translateChineseCommodity, batchTranslateCommoditiesWithGenAI } from '@/lib/warehouseTranslation';

export interface WarehouseConfig {
  code: string; // e.g. "RS-21"
  password: string; // e.g. "123456"
  location: string; // "Guangzhou (GZ)" or "Yiwu (YW)"
  url?: string; // defaults to "https://zg.kuaisongkj.com"
}

export const DEFAULT_WAREHOUSE_CONFIGS: WarehouseConfig[] = [
  {
    code: process.env.GZ_WAREHOUSE_CODE || 'RS-21',
    password: process.env.GZ_WAREHOUSE_PASSWORD || '123456',
    location: 'Guangzhou (GZ)',
    url: 'https://zg.kuaisongkj.com',
  },
  {
    code: process.env.YW_WAREHOUSE_CODE || 'AS-14',
    password: process.env.YW_WAREHOUSE_PASSWORD || '123456',
    location: 'Yiwu (YW)',
    url: process.env.YW_WAREHOUSE_URL || 'https://zg.kuaisongkj.com',
  },
];

export interface RawWarehouseItem {
  id: string;
  stockState: number;
  code: string; // receipt number
  date: string; // received date "2026-11-21 13:02:28"
  commodity: string;
  mark: string;
  packaging?: string;
  actualQuantity: number;
  weight: number;
  volume: number;
  driver?: string;
  phone?: string;
  plate?: string;
  customerName?: string;
  networkName?: string;
  remark?: string;
  stockDay?: number;
  customField1?: string;
}

export async function fetchRemoteWarehouseData(config: WarehouseConfig, limit = 500): Promise<RawWarehouseItem[]> {
  const baseUrl = (config.url || 'https://zg.kuaisongkj.com').replace(/\/+$/, '');
  const loginUrl = `${baseUrl}/query`;
  const searchUrl = `${baseUrl}/search`;

  // 1. Submit login
  const loginBody = new URLSearchParams({
    code: config.code,
    password: config.password,
    language: 'zh_CN',
  });

  const loginRes = await fetch(loginUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    body: loginBody.toString(),
    cache: 'no-store',
  });

  const loginJson = await loginRes.json();
  if (loginJson.code !== 200) {
    throw new Error(`Warehouse login failed for [${config.code}]: ${loginJson.msg || 'Invalid code or password'}`);
  }

  // Get session cookie
  const setCookie = loginRes.headers.get('set-cookie');
  const cookieHeader = setCookie ? setCookie.split(';')[0] : '';

  // 2. Fetch list of entries
  const searchBody = new URLSearchParams({
    page: '1',
    limit: String(limit),
    stockState: '', // empty means all items (in-stock + delivered)
  });

  const searchRes = await fetch(searchUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: cookieHeader,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    body: searchBody.toString(),
    cache: 'no-store',
  });

  const searchJson = await searchRes.json();
  if (!searchJson || !Array.isArray(searchJson.data)) {
    return [];
  }

  return searchJson.data;
}

export function parseWarehouseDate(dateStr: string): Date | undefined {
  if (!dateStr) return undefined;
  // formats like "2026-11-21 13:02:28"
  const formatted = dateStr.replace(' ', 'T');
  const parsed = new Date(formatted);
  return isNaN(parsed.getTime()) ? undefined : parsed;
}

export async function syncSingleWarehouse(config: WarehouseConfig, limit = 500) {
  await connectToDatabase();
  const rawItems = await fetchRemoteWarehouseData(config, limit);

  if (!rawItems.length) {
    return {
      code: config.code,
      location: config.location,
      fetched: 0,
      upserted: 0,
      error: null,
    };
  }

  // 1. Extract all unique Chinese commodity names across the entire raw items batch
  const uniqueCommodities = Array.from(
    new Set(rawItems.map((item) => (item.commodity || '').trim()).filter(Boolean))
  );

  // 2. Translate ALL unique commodities using Gemini AI in EXACTLY ONE single batch API call
  console.log(`[Warehouse Sync] Translating ${uniqueCommodities.length} unique commodities with Gemini AI in 1 call...`);
  const translationMap = await batchTranslateCommoditiesWithGenAI(uniqueCommodities);
  console.log(`[Warehouse Sync] Gemini AI translation complete.`);

  const operations = rawItems.map((item) => {
    const commodityZh = (item.commodity || '').trim();
    const commodityEn = translationMap[commodityZh] || translateChineseCommodity(commodityZh);
    const dateReceivedAt = parseWarehouseDate(item.date);

    return {
      updateOne: {
        filter: { rawId: String(item.id), warehouseCode: config.code },
        update: {
          $set: {
            receiptCode: item.code || '',
            warehouseCode: config.code,
            warehouseLocation: config.location,
            networkName: item.networkName || '',
            dateReceived: item.date || '',
            dateReceivedAt,
            commodityZh,
            commodityEn,
            mark: item.mark || '',
            packaging: item.packaging || '',
            actualQuantity: Number(item.actualQuantity) || 0,
            weight: Number(item.weight) || 0,
            volume: Number(item.volume) || 0,
            stockState: Number(item.stockState) || 0,
            stockDay: Number(item.stockDay) || 0,
            driver: item.driver || '',
            phone: item.phone || '',
            plate: item.plate || '',
            customerName: item.customerName || '',
            remark: item.remark || '',
            customField1: item.customField1 || '',
            rawId: String(item.id),
            syncedAt: new Date(),
          },
        },
        upsert: true,
      },
    };
  });

  const bulkResult = await WarehouseEntry.bulkWrite(operations, { ordered: false });

  return {
    code: config.code,
    location: config.location,
    fetched: rawItems.length,
    upserted: (bulkResult.upsertedCount || 0) + (bulkResult.modifiedCount || 0),
    error: null,
  };
}

export async function syncAllWarehouses(configs: WarehouseConfig[] = DEFAULT_WAREHOUSE_CONFIGS) {
  const results = [];
  for (const cfg of configs) {
    try {
      const res = await syncSingleWarehouse(cfg);
      results.push(res);
    } catch (err: any) {
      results.push({
        code: cfg.code,
        location: cfg.location,
        fetched: 0,
        upserted: 0,
        error: err.message,
      });
    }
  }
  return results;
}
