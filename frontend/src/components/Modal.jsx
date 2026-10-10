import React, { useEffect } from 'react';
import { X } from 'lucide-react';

<<<<<<< HEAD
export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
=======
export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl', footer }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
<<<<<<< HEAD
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />
      <div className={`relative w-full ${maxWidth} bg-[#FFFDF8] border border-[#E4D8BE] rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200`}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E4D8BE] flex items-center justify-between bg-[#F7F3EA]/60">
          <h3 className="text-sm font-bold text-[#29231D] font-['Outfit']">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6F7889] hover:text-[#29231D] hover:bg-[#EDE5D6] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
=======
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#192853]/80 backdrop-blur-md overflow-y-auto">
      <div 
        className={`bg-[#1e3264]/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/12 w-full ${maxWidth} my-8 overflow-hidden transform transition-all`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/6 flex items-center justify-between bg-white/2">
          <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/6 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[calc(85vh-130px)] overflow-y-auto text-[#c8c8cb]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-white/6 bg-white/2 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
      </div>
    </div>
  );
}
