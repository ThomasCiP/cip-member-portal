import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "./brand";

interface AutocompleteInputProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
}

export function AutocompleteInput({ value, onChange, options, placeholder, disabled }: AutocompleteInputProps) {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    
    if (val.trim() === "") {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter(opt => opt.toLowerCase().includes(val.toLowerCase()));
      setFilteredOptions(filtered);
    }
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    if (value.trim() === "") {
      setFilteredOptions(options);
    } else {
      setFilteredOptions(options.filter(opt => opt.toLowerCase().includes(value.toLowerCase())));
    }
    setIsOpen(true);
  };

  const handleSelectOption = (opt: string) => {
    onChange(opt);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors"
        style={{
          background: theme.bg,
          border: `1px solid ${theme.inputBorder}`,
          color: theme.text,
          opacity: disabled ? 0.6 : 1,
        }}
      />
      
      {isOpen && filteredOptions.length > 0 && (
        <ul
          className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto rounded-lg shadow-lg border"
          style={{
            background: theme.cardBg,
            borderColor: theme.cardBorder,
          }}
        >
          {filteredOptions.map((opt, index) => (
            <li
              key={index}
              onClick={() => handleSelectOption(opt)}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-black/5"
              style={{
                color: theme.text,
                borderBottom: index < filteredOptions.length - 1 ? `1px solid ${theme.divider}` : 'none'
              }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
