import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";

const CustomDropdown = ({
  options,
  value,
  onChange,
  label,
  icon
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Get selected option label
  const selectedOption = options.find(opt => opt.value === value);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <DropdownContainer ref={dropdownRef}>
      {label && (
        <Label>
          {icon && <span className="icon">{icon}</span>}
          {label}
        </Label>
      )}

      <DropdownTrigger
        onClick={() => setIsOpen(!isOpen)}
        $isOpen={isOpen}
      >
        <span className="selected-text">
          {selectedOption?.icon && <span className="option-icon">{selectedOption.icon}</span>}
          {selectedOption?.label || "Select..."}
        </span>
        <ChevronIcon $isOpen={isOpen}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </ChevronIcon>
      </DropdownTrigger>

      {isOpen && (
        <DropdownMenu>
          {options.map((option, index) => (
            <DropdownOption
              key={option.value}
              onClick={() => handleSelect(option.value)}
              $isSelected={option.value === value}
            >
              {option.icon && <span className="option-icon">{option.icon}</span>}
              <span className="option-label">{option.label}</span>
              {option.value === value && <CheckMark>✓</CheckMark>}
            </DropdownOption>
          ))}
        </DropdownMenu>
      )}
    </DropdownContainer>
  );
};

export default CustomDropdown;

/* ================= STYLES ================= */

const DropdownContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Label = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);

  .icon {
    font-size: 14px;
  }

  @media (max-width: 600px) {
    display: none;
  }
`;

const DropdownTrigger = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  min-width: auto;
  border-radius: 10px;
  border: 1px solid ${props => props.$isOpen ? 'var(--primary)' : 'var(--border)'};
  background: var(--bg-secondary);
  color: var(--text);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;

  .selected-text {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .option-icon {
    font-size: 13px;
  }

  &:hover {
    border-color: var(--primary);
  }

  ${props => props.$isOpen && `
    box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.15);
  `}
`;

const ChevronIcon = styled.span`
  display: flex;
  align-items: right;
  color: var(--text-muted);
  transition: transform 0.2s ease;
  transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  left: 31%;
  min-width: 75%;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 4px;
  z-index: 1000;
  box-shadow: var(--shadow-lg);
`;

const DropdownOption = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: ${props => props.$isSelected ? 'var(--primary)' : 'var(--text)'};
  background: ${props => props.$isSelected ? 'rgba(14, 165, 233, 0.1)' : 'transparent'};
  transition: background 0.15s ease;

  .option-icon {
    font-size: 14px;
  }

  .option-label {
    flex: 1;
  }

  &:hover {
    background: ${props => props.$isSelected
    ? 'rgba(14, 165, 233, 0.15)'
    : 'var(--bg-tertiary)'};
  }
`;

const CheckMark = styled.span`
  color: var(--primary);
  font-weight: 700;
  font-size: 14px;
`;
