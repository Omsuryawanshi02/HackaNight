import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Download, Filter } from 'lucide-react';

export default function DataTable({
  columns = [],
  data = [],
  searchable = true,
  searchPlaceholder = 'Search records...',
  filterKey,
  filterOptions = [],
  pageSize = 8,
  title,
  subtitle,
  onExportCsv,
  emptyMessage = 'No matching records found'
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter & Search
  const filteredData = data.filter((row) => {
    // Filter by dropdown
    if (filterKey && filterValue !== 'ALL') {
      const val = row[filterKey];
      if (val !== filterValue) return false;
    }

    // Search query
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase();
    return columns.some((col) => {
      const cellVal = col.accessor ? row[col.accessor] : col.cell ? col.cell(row) : null;
      if (cellVal === null || cellVal === undefined) return false;
      return String(cellVal).toLowerCase().includes(query);
    });
  });

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  return (
    <div className="glass-card overflow-hidden">
      {/* Header Bar */}
      {(title || searchable || filterKey || onExportCsv) && (
        <div className="p-5 border-b border-white/6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div>
            {title && <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-[#8b8c8e] mt-0.5">{subtitle}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {searchable && (
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder={searchPlaceholder}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white/4 border border-white/8 rounded-xl text-white placeholder-[#8b8c8e] focus:outline-none focus:ring-1 focus:ring-[#FFE14F] focus:bg-white/8 transition"
                />
              </div>
            )}

            {filterKey && filterOptions.length > 0 && (
              <div className="flex items-center gap-1.5 glass-chip rounded-xl px-2.5 py-1.5 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={filterValue}
                  onChange={(e) => {
                    setFilterValue(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-[#1e3264] text-white">All Categories</option>
                  {filterOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-[#1e3264] text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {onExportCsv && (
              <button
                onClick={() => onExportCsv(filteredData)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium glass-chip rounded-xl transition cursor-pointer"
                title="Export filtered records to CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-300" />
                <span>Export CSV</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#c8c8cb]">
          <thead className="bg-white/3 border-b border-white/6 text-[#8b8c8e] font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-4 py-3.5 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/4">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-[#8b8c8e]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  className="hover:bg-white/4 transition-colors"
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={`px-4 py-3.5 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                    >
                      {col.cell ? col.cell(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-white/6 bg-white/2 flex items-center justify-between text-xs text-[#8b8c8e]">
          <span>
            Showing <strong className="text-white">{filteredData.length === 0 ? 0 : startIndex + 1}</strong> to{' '}
            <strong className="text-white">{Math.min(startIndex + pageSize, filteredData.length)}</strong> of{' '}
            <strong className="text-white">{filteredData.length}</strong> records
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="p-1 rounded-lg border border-white/10 bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 text-white transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium text-white">
              Page {safePage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="p-1 rounded-lg border border-white/10 bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 text-white transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
