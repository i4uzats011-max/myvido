import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { WarehouseEntry } from '@/lib/models/WarehouseEntry';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const warehouseCode = searchParams.get('warehouse'); // e.g. "RS-21" or "AS-14"
    const stockState = searchParams.get('stockState'); // "0" (in stock), "1" (delivered), or empty (all)
    const query = searchParams.get('q'); // Search query
    const startDate = searchParams.get('startDate'); // "2026-11-01"
    const endDate = searchParams.get('endDate'); // "2026-11-22"
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(200, Math.max(10, parseInt(searchParams.get('limit') || '50', 10)));

    const filter: Record<string, any> = {};

    if (warehouseCode && warehouseCode !== 'ALL') {
      filter.warehouseCode = warehouseCode;
    }

    if (stockState !== null && stockState !== undefined && stockState !== '') {
      filter.stockState = parseInt(stockState, 10);
    }

    if (startDate || endDate) {
      filter.dateReceived = {};
      if (startDate) {
        filter.dateReceived.$gte = `${startDate} 00:00:00`;
      }
      if (endDate) {
        filter.dateReceived.$lte = `${endDate} 23:59:59`;
      }
    }

    if (query && query.trim()) {
      const q = query.trim();
      const regex = new RegExp(q, 'i');
      filter.$or = [
        { receiptCode: regex },
        { mark: regex },
        { commodityZh: regex },
        { commodityEn: regex },
        { driver: regex },
        { plate: regex },
        { networkName: regex },
      ];
    }

    const skip = (page - 1) * limit;

    const [items, totalCount, statsAgg] = await Promise.all([
      WarehouseEntry.find(filter)
        .sort({ dateReceived: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      WarehouseEntry.countDocuments(filter),
      WarehouseEntry.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalQuantity: { $sum: '$actualQuantity' },
            totalWeight: { $sum: '$weight' },
            totalVolume: { $sum: '$volume' },
            inStockCount: {
              $sum: { $cond: [{ $eq: ['$stockState', 0] }, 1, 0] },
            },
            deliveredCount: {
              $sum: { $cond: [{ $eq: ['$stockState', 1] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    const stats = statsAgg[0] || {
      totalQuantity: 0,
      totalWeight: 0,
      totalVolume: 0,
      inStockCount: 0,
      deliveredCount: 0,
    };

    return NextResponse.json({
      success: true,
      data: items,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      stats: {
        totalPackages: totalCount,
        totalQuantity: stats.totalQuantity || 0,
        totalWeight: Number((stats.totalWeight || 0).toFixed(2)),
        totalVolume: Number((stats.totalVolume || 0).toFixed(3)),
        inStockCount: stats.inStockCount || 0,
        deliveredCount: stats.deliveredCount || 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch warehouse entries' },
      { status: 500 }
    );
  }
}

// Update commodity English translation or custom notes
export async function PATCH(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { id, commodityEn, remark } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    const updateFields: Record<string, any> = {};
    if (typeof commodityEn === 'string') updateFields.commodityEn = commodityEn.trim();
    if (typeof remark === 'string') updateFields.remark = remark.trim();

    const updated = await WarehouseEntry.findByIdAndUpdate(id, { $set: updateFields }, { new: true });

    return NextResponse.json({ success: true, item: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update entry' },
      { status: 500 }
    );
  }
}
