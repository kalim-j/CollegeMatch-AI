'use client';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  note?: string;
}

export default function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select...',
  note,
}: SelectFieldProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const inputStyle = {
    width: '100%',
    padding: '13px 40px 13px 16px',
    borderRadius: '12px',
    border: isDark
      ? open
        ? '1px solid rgba(127,119,221,0.6)'
        : '1px solid rgba(255,255,255,0.10)'
      : open
        ? '1px solid rgba(127,119,221,0.6)'
        : '1px solid rgba(127,119,221,0.2)',
    background: isDark
      ? open
        ? 'rgba(127,119,221,0.10)'
        : 'rgba(255,255,255,0.06)'
      : open
        ? 'rgba(127,119,221,0.06)'
        : '#f0eeff',
    color: value
      ? isDark ? 'rgba(255,255,255,0.92)' : '#1a1340'
      : isDark ? 'rgba(255,255,255,0.35)' : 'rgba(83,74,183,0.5)',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: open
      ? '0 0 0 3px rgba(127,119,221,0.12)'
      : 'none',
    userSelect: 'none' as const,
  };

  const dropdownStyle = {
    position: 'absolute' as const,
    top: 'calc(100% + 6px)',
    left: 0,
    right: 0,
    background: isDark ? '#1a1f3a' : '#ffffff',
    border: isDark
      ? '1px solid rgba(127,119,221,0.25)'
      : '1px solid rgba(127,119,221,0.15)',
    borderRadius: '12px',
    overflow: 'hidden',
    zIndex: 999,
    boxShadow: isDark
      ? '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(127,119,221,0.1)'
      : '0 8px 24px rgba(83,74,183,0.12)',
    maxHeight: '240px',
    overflowY: 'auto' as const,
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      {label && (
        <p style={{
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: isDark ? '#a89ef8' : '#534AB7',
          marginBottom: '8px',
        }}>
          {label}
        </p>
      )}

      <div ref={ref} style={{ position: 'relative' }}>
        {/* Trigger */}
        <div
          style={inputStyle}
          onClick={() => setOpen(prev => !prev)}
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setOpen(prev => !prev);
            }
            if (e.key === 'Escape') setOpen(false);
          }}
        >
          <span>{selected?.label || placeholder}</span>
          <span style={{
            fontSize: '11px',
            color: isDark
              ? 'rgba(255,255,255,0.4)'
              : '#7F77DD',
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s ease',
            flexShrink: 0,
          }}>▼</span>
        </div>

        {/* Dropdown panel */}
        {open && (
          <div className="select-dropdown" style={dropdownStyle} role="listbox">
            {options.map(opt => (
              <div
                key={opt.value}
                role="option"
                aria-selected={value === opt.value}
                aria-disabled={opt.disabled}
                onClick={() => {
                  if (!opt.disabled) {
                    onChange(opt.value);
                    setOpen(false);
                  }
                }}
                style={{
                  padding: '11px 16px',
                  fontSize: '14px',
                  cursor: opt.disabled ? 'not-allowed' : 'pointer',
                  color: opt.disabled
                    ? isDark
                      ? 'rgba(255,255,255,0.25)'
                      : 'rgba(83,74,183,0.3)'
                    : value === opt.value
                      ? isDark ? '#a89ef8' : '#534AB7'
                      : isDark
                        ? 'rgba(255,255,255,0.85)'
                        : '#1a1340',
                  background: value === opt.value
                    ? isDark
                      ? 'rgba(127,119,221,0.18)'
                      : 'rgba(127,119,221,0.08)'
                    : 'transparent',
                  borderLeft: value === opt.value
                    ? '2px solid #7F77DD'
                    : '2px solid transparent',
                  transition: 'all 0.15s ease',
                  fontWeight: value === opt.value ? 500 : 400,
                }}
                onMouseEnter={e => {
                  if (!opt.disabled && value !== opt.value) {
                    (e.currentTarget as HTMLDivElement).style.background =
                      isDark
                        ? 'rgba(127,119,221,0.10)'
                        : 'rgba(127,119,221,0.05)';
                  }
                }}
                onMouseLeave={e => {
                  if (value !== opt.value) {
                    (e.currentTarget as HTMLDivElement).style.background =
                      'transparent';
                  }
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {note && (
        <p style={{
          fontSize: '11px',
          color: isDark
            ? 'rgba(255,255,255,0.35)'
            : '#7a7399',
          marginTop: '5px',
          lineHeight: 1.5,
        }}>
          {note}
        </p>
      )}
    </div>
  );
}
