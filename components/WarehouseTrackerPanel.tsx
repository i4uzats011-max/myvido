'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Boxes,
  RefreshCw,
  Download,
  Search,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  Edit2,
  Check,
  X,
  AlertCircle,
  Building2,
  Layers,
  Scale,
  Box,
  KeyRound,
  ExternalLink,
} from 'lucide-react';

interface WarehouseEntryItem {
  _id: string;
  receiptCode: string;
  warehouseCode: string;
  warehouseLocation: string;
  networkName: string;
  dateReceived: string;
  commodityZh: string;
  commodityEn: string;
  mark: string;
  packaging?: string;
  actualQuantity: number;
  weight: number;
  volume: number;
  stockState: number;
  stockDay: number;
  driver?: string;
  phone?: string;
  plate?: string;
  customerName?: string;
  remark?: string;
  syncedAt: string;
}

interface StatsData {
  totalPackages: number;
  totalQuantity: number;
  totalWeight: number;
  totalVolume: number;
  inStockCount: number;
  deliveredCount: number;
}

export default function WarehouseTrackerPanel() {
  const [entries, setEntries] = useState<WarehouseEntryItem[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalPackages: 0,
    totalQuantity: 0,
    totalWeight: 0,
    totalVolume: 0,
    inStockCount: 0,
    deliveredCount: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Filters
  const [warehouseFilter, setWarehouseFilter] = useState<'ALL' | 'RS-21' | 'AS-14'>('ALL');
  const [stockStateFilter, setStockStateFilter] = useState<string>(''); // '' = all, '0' = in stock, '1' = delivered
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Inline editing of English commodity translation
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Settings modal for warehouse credentials (GZ & YW)
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [ywPassword, setYwPassword] = useState('');
  const [ywUrl, setYwUrl] = useState('https://zg.kuaisongkj.com');
  const [isTestingYw, setIsTestingYw] = useState(false);
  const [ywTestResult, setYwTestResult] = useState<string | null>(null);

  // Fetch entries from backend
  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: '50',
      });

      if (warehouseFilter !== 'ALL') params.append('warehouse', warehouseFilter);
      if (stockStateFilter !== '') params.append('stockState', stockStateFilter);
      if (searchQuery.trim()) params.append('q', searchQuery.trim());
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`/api/warehouse/entries?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setEntries(json.data || []);
        setStats(json.stats || {
          totalPackages: 0,
          totalQuantity: 0,
          totalWeight: 0,
          totalVolume: 0,
          inStockCount: 0,
          deliveredCount: 0,
        });
        setTotalPages(json.totalPages || 1);
      }
    } catch (err: any) {
      console.error('Failed to load warehouse data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, warehouseFilter, stockStateFilter, searchQuery, startDate, endDate]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Sync warehouse on demand
  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch('/api/warehouse/sync', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        const gzResult = json.results?.find((r: any) => r.code === 'RS-21');
        const ywResult = json.results?.find((r: any) => r.code === 'AS-14');

        let msg = `GZ (RS-21): ${gzResult?.fetched || 0} items fetched.`;
        if (ywResult?.error) {
          msg += ` YW (AS-14): ${ywResult.error}`;
        } else if (ywResult?.fetched) {
          msg += ` YW (AS-14): ${ywResult.fetched} items.`;
        }
        setSyncMessage(msg);
        await loadEntries();
      } else {
        setSyncMessage(json.error || 'Sync failed');
      }
    } catch (err: any) {
      setSyncMessage(err.message || 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    const params = new URLSearchParams();
    if (warehouseFilter !== 'ALL') params.append('warehouse', warehouseFilter);
    if (stockStateFilter !== '') params.append('stockState', stockStateFilter);
    if (searchQuery.trim()) params.append('q', searchQuery.trim());
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    window.open(`/api/warehouse/export?${params.toString()}`, '_blank');
  };

  // Save edited translation
  const handleSaveTranslation = async (id: string) => {
    if (!editValue.trim()) return;
    setIsSavingEdit(true);
    try {
      const res = await fetch('/api/warehouse/entries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, commodityEn: editValue.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setEntries((prev) =>
          prev.map((item) => (item._id === id ? { ...item, commodityEn: editValue.trim() } : item))
        );
        setEditingId(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Test custom YW credentials
  const handleTestYw = async () => {
    if (!ywPassword) {
      setYwTestResult('Please enter password for AS-14');
      return;
    }
    setIsTestingYw(true);
    setYwTestResult(null);
    try {
      const res = await fetch('/api/warehouse/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'AS-14',
          password: ywPassword,
          location: 'Yiwu (YW)',
          url: ywUrl.trim(),
        }),
      });
      const json = await res.json();
      if (json.success && json.results?.[0]?.fetched > 0) {
        setYwTestResult(`Success! Connected and fetched ${json.results[0].fetched} items for AS-14.`);
        await loadEntries();
      } else {
        setYwTestResult(json.results?.[0]?.error || 'Failed to authenticate AS-14');
      }
    } catch (err: any) {
      setYwTestResult(err.message || 'Connection error');
    } finally {
      setIsTestingYw(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#181818] p-5 rounded-2xl border border-neutral-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                Warehouse Tracker &amp; Entry Dates
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium">
                  入仓单查询
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400">
                Direct connection to <span className="text-neutral-200 font-mono">zg.kuaisongkj.com</span> • Auto-translated items to English • Live received dates
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsConfigOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#262626] hover:bg-[#333333] text-neutral-300 border border-neutral-700 transition"
          >
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>Accounts (GZ / YW)</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 transition active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30 transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Warehouse Now'}</span>
          </button>
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncMessage && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-neutral-900/90 border border-neutral-700 rounded-xl text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-neutral-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{syncMessage}</span>
          </div>
          <button
            onClick={() => setSyncMessage(null)}
            className="text-neutral-500 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Key Metrics Dashboard Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#181818] border border-neutral-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            Total Entries
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white mt-1">
            {stats.totalPackages.toLocaleString()}
          </div>
        </div>

        <div className="bg-[#181818] border border-emerald-900/30 bg-emerald-950/10 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            In Stock (在库)
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-300 mt-1">
            {stats.inStockCount.toLocaleString()}
          </div>
        </div>

        <div className="bg-[#181818] border border-neutral-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-zinc-400" />
            Delivered (出库)
          </div>
          <div className="text-xl sm:text-2xl font-bold text-neutral-300 mt-1">
            {stats.deliveredCount.toLocaleString()}
          </div>
        </div>

        <div className="bg-[#181818] border border-neutral-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5 text-amber-400" />
            Total Pieces
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-300 mt-1">
            {stats.totalQuantity.toLocaleString()}
          </div>
        </div>

        <div className="bg-[#181818] border border-neutral-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-purple-400" />
            Weight (KG)
          </div>
          <div className="text-xl sm:text-2xl font-bold text-purple-300 mt-1">
            {stats.totalWeight.toLocaleString()} kg
          </div>
        </div>

        <div className="bg-[#181818] border border-neutral-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <Boxes className="w-3.5 h-3.5 text-cyan-400" />
            Volume (M³)
          </div>
          <div className="text-xl sm:text-2xl font-bold text-cyan-300 mt-1">
            {stats.totalVolume.toLocaleString()} m³
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#181818] border border-neutral-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search box */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search Receipt #, Mark (唛头), English/Chinese commodity, Driver, Plate..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#121212] border border-neutral-700/80 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Warehouse Selector */}
          <div className="flex items-center gap-2">
            <select
              value={warehouseFilter}
              onChange={(e) => {
                setWarehouseFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="bg-[#121212] border border-neutral-700/80 rounded-xl px-3 py-2 text-xs sm:text-sm text-neutral-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Warehouses (全部)</option>
              <option value="RS-21">Guangzhou (GZ: RS-21)</option>
              <option value="AS-14">Yiwu (YW: AS-14)</option>
            </select>

            {/* Stock State Selector */}
            <select
              value={stockStateFilter}
              onChange={(e) => {
                setStockStateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#121212] border border-neutral-700/80 rounded-xl px-3 py-2 text-xs sm:text-sm text-neutral-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Status (全部状态)</option>
              <option value="0">In Stock (在库)</option>
              <option value="1">Delivered (已出库)</option>
            </select>
          </div>
        </div>

        {/* Date Filter Bar */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-neutral-800 text-xs text-neutral-400">
          <span className="flex items-center gap-1 font-medium text-neutral-300">
            <Calendar className="w-3.5 h-3.5 text-blue-400" /> Date Received:
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#121212] border border-neutral-700/80 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
          />
          <span>to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#121212] border border-neutral-700/80 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
          />
          {(startDate || endDate || searchQuery) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="ml-auto text-xs text-neutral-400 hover:text-white underline underline-offset-2"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-[#181818] border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#141414] border-b border-neutral-800 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Warehouse</th>
                <th className="py-3.5 px-4">Receipt #</th>
                <th className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5 text-blue-400">
                    <Clock className="w-3.5 h-3.5" />
                    Date Received (入仓时间)
                  </div>
                </th>
                <th className="py-3.5 px-4">Mark (唛头)</th>
                <th className="py-3.5 px-4">Item Name (English / 中文)</th>
                <th className="py-3.5 px-4 text-right">Qty</th>
                <th className="py-3.5 px-4 text-right">Weight</th>
                <th className="py-3.5 px-4 text-right">Vol (m³)</th>
                <th className="py-3.5 px-4">Driver / Plate</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-neutral-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-400" />
                    Loading warehouse packages...
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-14 text-center text-neutral-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-neutral-600" />
                    <div className="font-semibold text-neutral-400">No warehouse entries found</div>
                    <p className="text-xs text-neutral-500 mt-1">
                      Click &quot;Sync Warehouse Now&quot; above to fetch live packages from the warehouse.
                    </p>
                  </td>
                </tr>
              ) : (
                entries.map((item) => (
                  <tr key={item._id} className="hover:bg-[#1f1f1f] transition">
                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      {item.stockState === 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          In Stock (在库)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700">
                          Delivered (出库)
                        </span>
                      )}
                    </td>

                    {/* Warehouse Code & Location */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-white">{item.warehouseLocation || 'GZ'}</div>
                      <div className="text-[11px] font-mono text-neutral-500">{item.warehouseCode}</div>
                    </td>

                    {/* Receipt Code */}
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#242424] text-neutral-200 border border-neutral-700/60">
                        {item.receiptCode}
                      </span>
                    </td>

                    {/* Received Date & Time (CRITICAL FIELD REQUESTED) */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-blue-300 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                        <span>{item.dateReceived}</span>
                      </div>
                      {item.stockDay > 0 && (
                        <div className="text-[10px] text-neutral-500">
                          {item.stockDay} day{item.stockDay > 1 ? 's' : ''} in warehouse
                        </div>
                      )}
                    </td>

                    {/* Mark */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-amber-400">{item.mark || '-'}</span>
                    </td>

                    {/* Commodity (English + Chinese Translation) */}
                    <td className="py-3 px-4 max-w-xs">
                      {editingId === item._id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="bg-[#121212] border border-blue-500 rounded px-2 py-1 text-xs text-white focus:outline-none w-full"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveTranslation(item._id)}
                            disabled={isSavingEdit}
                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-500"
                            title="Save"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 bg-neutral-700 text-neutral-300 rounded hover:bg-neutral-600"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            <span>{item.commodityEn || item.commodityZh}</span>
                          </div>
                          {item.commodityZh && item.commodityZh !== item.commodityEn && (
                            <div className="text-[11px] text-neutral-400 font-normal">
                              {item.commodityZh}
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Quantity */}
                    <td className="py-3 px-4 text-right font-medium text-neutral-200">
                      {item.actualQuantity}
                    </td>

                    {/* Weight */}
                    <td className="py-3 px-4 text-right font-medium text-neutral-300">
                      {item.weight} kg
                    </td>

                    {/* Volume */}
                    <td className="py-3 px-4 text-right font-medium text-neutral-300">
                      {item.volume} m³
                    </td>

                    {/* Driver & Plate */}
                    <td className="py-3 px-4 text-neutral-300">
                      <div>{item.driver || '-'}</div>
                      {item.plate && (
                        <div className="text-[10px] text-neutral-500 font-mono">{item.plate}</div>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          setEditingId(item._id);
                          setEditValue(item.commodityEn || item.commodityZh);
                        }}
                        className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
                        title="Edit English Translation"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-[#141414] border-t border-neutral-800 text-xs text-neutral-400">
            <div>
              Page <span className="text-white font-semibold">{currentPage}</span> of{' '}
              <span className="text-white font-semibold">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg bg-[#242424] text-neutral-300 hover:bg-[#333333] disabled:opacity-40 transition"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg bg-[#242424] text-neutral-300 hover:bg-[#333333] disabled:opacity-40 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Warehouse Accounts & Credentials Modal */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#181818] border border-neutral-800 w-full max-w-lg rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Warehouse Portals &amp; Credentials</h3>
              </div>
              <button
                onClick={() => setIsConfigOpen(false)}
                className="p-1 text-neutral-400 hover:text-white rounded-full bg-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Account 1: Guangzhou (GZ) */}
            <div className="p-4 rounded-xl bg-[#141414] border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Guangzhou Warehouse (GZ)</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Active &amp; Connected
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-neutral-400">
                <div>Entry UID: <span className="font-mono text-white">RS-21</span></div>
                <div>Portal: <span className="font-mono text-white">zg.kuaisongkj.com</span></div>
              </div>
            </div>

            {/* Account 2: Yiwu (YW) */}
            <div className="p-4 rounded-xl bg-[#141414] border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Yiwu Warehouse (YW)</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Setup Required
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-neutral-400 block mb-1">UID: <span className="font-mono text-white">AS-14</span></label>
                  <label className="text-neutral-400 block mb-1">Password for AS-14:</label>
                  <input
                    type="password"
                    placeholder="Enter AS-14 warehouse password"
                    value={ywPassword}
                    onChange={(e) => setYwPassword(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Warehouse Portal URL (if different from zg):</label>
                  <input
                    type="text"
                    value={ywUrl}
                    onChange={(e) => setYwUrl(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono text-xs"
                  />
                </div>
              </div>

              {ywTestResult && (
                <div
                  className={`p-2.5 rounded-lg text-xs ${
                    ywTestResult.startsWith('Success')
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                      : 'bg-red-950/60 text-red-300 border border-red-800'
                  }`}
                >
                  {ywTestResult}
                </div>
              )}

              <button
                onClick={handleTestYw}
                disabled={isTestingYw}
                className="w-full py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition disabled:opacity-50"
              >
                {isTestingYw ? 'Connecting to YW Warehouse...' : 'Test & Sync AS-14'}
              </button>
            </div>

            <div className="text-[11px] text-neutral-500">
              Automatic background sync is active on Vercel via Cron every 2 hours.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
