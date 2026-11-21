import { NextRequest, NextResponse } from 'next/server';
import { syncAllWarehouses, syncSingleWarehouse, DEFAULT_WAREHOUSE_CONFIGS, WarehouseConfig } from '@/lib/warehouseService';

// Vercel Cron or Manual GET trigger
export async function GET(req: NextRequest) {
  try {
    const results = await syncAllWarehouses();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to sync warehouse' },
      { status: 500 }
    );
  }
}

// Custom manual sync with custom credentials if user updates them from UI
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // If specific warehouse config passed:
    if (body.code && body.password) {
      const customConfig: WarehouseConfig = {
        code: body.code,
        password: body.password,
        location: body.location || (body.code.startsWith('RS') ? 'Guangzhou (GZ)' : 'Yiwu (YW)'),
        url: body.url || 'https://zg.kuaisongkj.com',
      };
      const result = await syncSingleWarehouse(customConfig, body.limit || 500);
      return NextResponse.json({ success: true, results: [result] });
    }

    // Otherwise run default sync
    const results = await syncAllWarehouses();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to sync warehouse' },
      { status: 500 }
    );
  }
}
