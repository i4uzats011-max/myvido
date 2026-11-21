import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWarehouseEntry extends Document {
  receiptCode: string; // e.g. "261121020" (入仓号 / Code)
  warehouseCode: string; // e.g. "RS-21", "AS-14"
  warehouseLocation: string; // "Guangzhou (GZ)" or "Yiwu (YW)"
  networkName: string; // e.g. "九边仓库"
  dateReceived: string; // Original timestamp "2026-11-21 13:02:28"
  dateReceivedAt?: Date; // Parsed Date for queries & sorting
  commodityZh: string; // Chinese item name "LED车灯"
  commodityEn: string; // English translated name "LED Car Light"
  mark: string; // Shipping mark "BIL", "VIP"
  packaging?: string;
  actualQuantity: number; // Pieces count
  weight: number; // kg
  volume: number; // m³
  stockState: number; // 0 = In stock, 1 = Delivered
  stockDay: number; // Days stored
  driver?: string;
  phone?: string;
  plate?: string;
  customerName?: string;
  remark?: string;
  customField1?: string;
  rawId: string; // ID from kuaisongkj WMS
  syncedAt: Date;
}

const WarehouseEntrySchema: Schema = new Schema<IWarehouseEntry>(
  {
    receiptCode: { type: String, required: true, index: true },
    warehouseCode: { type: String, required: true, index: true },
    warehouseLocation: { type: String, default: 'Guangzhou (GZ)' },
    networkName: { type: String, default: '' },
    dateReceived: { type: String, required: true },
    dateReceivedAt: { type: Date, index: true },
    commodityZh: { type: String, default: '' },
    commodityEn: { type: String, default: '' },
    mark: { type: String, default: '', index: true },
    packaging: { type: String, default: '' },
    actualQuantity: { type: Number, default: 0 },
    weight: { type: Number, default: 0 },
    volume: { type: Number, default: 0 },
    stockState: { type: Number, default: 0, index: true },
    stockDay: { type: Number, default: 0 },
    driver: { type: String, default: '' },
    phone: { type: String, default: '' },
    plate: { type: String, default: '' },
    customerName: { type: String, default: '' },
    remark: { type: String, default: '' },
    customField1: { type: String, default: '' },
    rawId: { type: String, required: true, index: true },
    syncedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Compound index to guarantee uniqueness per warehouse
WarehouseEntrySchema.index({ rawId: 1, warehouseCode: 1 }, { unique: true });

export const WarehouseEntry: Model<IWarehouseEntry> =
  mongoose.models.WarehouseEntry ||
  mongoose.model<IWarehouseEntry>('WarehouseEntry', WarehouseEntrySchema);
