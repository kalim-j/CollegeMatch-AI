"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectFieldProps {
  options: { label: string; value: string; disabled?: boolean }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  disabled?: boolean;
}

export function SelectField({ options, value, onChange, placeholder = "Select an option", className, label, disabled }: SelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {label && (
        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest mb-2">
          {label}
        </label>
      )}
      <div
        className={cn(
          "flex items-center justify-between w-full p-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1f3a] text-slate-800 dark:text-[rgba(255,255,255,0.9)] cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none"
        )}
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        <span className={!selectedOption ? "text-slate-400 dark:text-slate-500" : ""}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} className={cn("transition-transform", isOpen && "rotate-180")} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1f3a] shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-60 overflow-y-auto">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                className={cn(
                  "px-4 py-3 cursor-pointer text-sm transition-colors",
                  "text-slate-700 dark:text-[rgba(255,255,255,0.9)] hover:bg-slate-50 dark:hover:bg-white/5",
                  isSelected && "bg-indigo-50/50 dark:bg-indigo-500/10 border-l-2 border-indigo-500 font-medium"
                )}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SelectField;
