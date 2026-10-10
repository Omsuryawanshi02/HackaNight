import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
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
      </div>
    </div>
  );
}
