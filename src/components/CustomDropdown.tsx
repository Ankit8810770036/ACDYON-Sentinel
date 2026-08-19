import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption<T extends string> {
  value: T;
  label: string;
}

interface CustomDropdownProps<T extends string> {
  options: DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  className?: string;
}

export function CustomDropdown<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: CustomDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative w-full ${className}`}>
      {/* Light Mode Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white border border-[#CBD5E1] rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-[#0F172A] hover:border-[#0066FF] transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
      >
        <span className="truncate text-[#0F172A] font-bold">{selectedOption?.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#0066FF] transition-transform shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Light Mode Popover Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 z-[100] mt-1.5 w-full bg-white border border-[#CBD5E1] rounded-xl shadow-xl overflow-hidden py-1 max-h-56 overflow-y-auto">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-mono text-left transition-colors border-b border-[#E2E8F0] last:border-b-0 ${
                  isSelected
                    ? 'bg-[#0066FF] text-white font-bold'
                    : 'bg-white text-[#0F172A] hover:bg-[#F1F5F9] font-semibold'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
