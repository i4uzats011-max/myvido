import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { WarehouseEntry } from '@/lib/models/WarehouseEntry';
import * as XLSX from 'xlsx';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const warehouseCode = searchParams.get('warehouse');
    const stockState = searchParams.get('stockState');
    const query = searchParams.get('q');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

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
      ];
    }

    const items = await WarehouseEntry.find(filter).sort({ dateReceived: -1 }).lean();

    // Map to spreadsheet rows
    const rows = items.map((item, index) => ({
      'No.': index + 1,
      'Status': item.stockState === 0 ? 'In Stock (在库)' : 'Delivered (已出库)',
      'Warehouse': item.warehouseLocation || 'Guangzhou',
      'Entry Code': item.warehouseCode,
      'Receipt No. (入仓号)': item.receiptCode,
      'Date Received (入仓时间)': item.dateReceived,
      'Item (English)': item.commodityEn || item.commodityZh,
      'Item (Chinese)': item.commodityZh,
      'Shipping Mark (唛头)': item.mark,
      'Quantity (件数)': item.actualQuantity,
      'Weight kg (重量)': item.weight,
      'Volume m³ (体积)': item.volume,
      'Stock Days': item.stockDay,
      'Driver': item.driver,
      'Phone': item.phone,
      'License Plate': item.plate,
      'Remark': item.remark,
    }));

    // Generate Excel Workbook
    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Auto-adjust column widths
    const colWidths = [
      { wch: 6 },  // No.
      { wch: 18 }, // Status
      { wch: 18 }, // Warehouse
      { wch: 12 }, // Entry Code
      { wch: 16 }, // Receipt No.
      { wch: 22 }, // Date Received
      { wch: 32 }, // Item (English)
      { wch: 20 }, // Item (Chinese)
      { wch: 18 }, // Mark
      { wch: 12 }, // Quantity
      { wch: 14 }, // Weight
      { wch: 14 }, // Volume
      { wch: 12 }, // Stock Days
      { wch: 16 }, // Driver
      { wch: 16 }, // Phone
      { wch: 14 }, // Plate
      { wch: 20 }, // Remark
    ];
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Warehouse Packages');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    const filename = `warehouse_receipts_${new Date().toISOString().slice(0, 10)}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to export excel' },
      { status: 500 }
    );
  }
}
