import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

export default function DataTable({
  columns = [],
  data = [],
  searchable = true,
  searchPlaceholder = 'Search records...',
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
    });
  });

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
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
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4D8BE]">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-[#6F7889] font-medium">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => (
                <tr key={row.id || rowIdx} className="hover:bg-[#EDE5D6]/40 transition">
                  {columns.map((col, colIdx) => (
                    <td key={col.key || col.accessorKey || colIdx} className="px-4 py-3 font-medium text-[#29231D]">
                      {col.cell ? col.cell(row) : row[col.accessorKey || col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
