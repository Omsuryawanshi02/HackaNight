import React, { useState } from 'react';
<<<<<<< HEAD
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
=======
import { Search, ChevronLeft, ChevronRight, Download, Filter } from 'lucide-react';
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a

export default function DataTable({
  columns = [],
  data = [],
  searchable = true,
  searchPlaceholder = 'Search records...',
<<<<<<< HEAD
  pageSize = 10,
  emptyMessage = 'No records found.'
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = data.filter((row) => {
    if (!searchTerm) return true;
    return columns.some((col) => {
      const val = row[col.accessorKey || col.key];
      if (val == null) return false;
      return String(val).toLowerCase().includes(searchTerm.toLowerCase());
=======
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
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
    });
  });

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
<<<<<<< HEAD
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  return (
    <div className="bg-[#FFFDF8] rounded-2xl border border-[#E4D8BE] overflow-hidden shadow-xs">
      {searchable && (
        <div className="p-4 border-b border-[#E4D8BE] bg-[#F7F3EA]/50 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6F7889]" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#FFFDF8] border border-[#E4D8BE] rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-[#29231D] placeholder-[#6F7889] focus:outline-none focus:border-[#D6B238]"
            />
          </div>
          <span className="text-[11px] text-[#6F7889] font-medium hidden sm:inline">
            Showing <strong className="text-[#29231D]">{filteredData.length}</strong> entries
          </span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#F7F3EA] text-[#6F7889] font-bold uppercase tracking-wider text-[10px] border-b border-[#E4D8BE] font-['Outfit']">
            <tr>
              {columns.map((col, idx) => (
                <th key={col.key || col.accessorKey || idx} className="px-4 py-3">
=======
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
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
<<<<<<< HEAD
          <tbody className="divide-y divide-[#E4D8BE]">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-[#6F7889] font-medium">
=======
          <tbody className="divide-y divide-white/4">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-[#8b8c8e]">
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => (
<<<<<<< HEAD
                <tr key={row.id || rowIdx} className="hover:bg-[#EDE5D6]/40 transition">
                  {columns.map((col, colIdx) => (
                    <td key={col.key || col.accessorKey || colIdx} className="px-4 py-3 font-medium text-[#29231D]">
                      {col.cell ? col.cell(row) : row[col.accessorKey || col.key]}
=======
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
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

<<<<<<< HEAD
      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-3 border-t border-[#E4D8BE] bg-[#F7F3EA]/30 flex items-center justify-between text-xs text-[#6F7889]">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-[#E4D8BE] bg-[#FFFDF8] disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-[#E4D8BE] bg-[#FFFDF8] disabled:opacity-40 cursor-pointer"
=======
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
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
