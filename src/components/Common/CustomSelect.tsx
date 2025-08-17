import React, { useState, useRef, useEffect } from 'react';
import { Button, Popover, List, ListItem, TextInput } from '@patternfly/react-core';
import { CaretDownIcon } from '@patternfly/react-icons';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface CustomSelectProps {
  variant?: 'single' | 'checkbox' | 'typeahead';
  selections?: string | string[];
  onSelect?: (event: any, selection: string) => void;
  placeholderText?: string;
  placeholder?: string; // Add support for placeholder prop
  isDisabled?: boolean;
  options?: SelectOption[];
  children?: React.ReactNode;
  className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  variant = 'single',
  selections = '',
  onSelect,
  placeholderText = 'Select...',
  placeholder,
  isDisabled = false,
  options = [],
  children,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>(
    Array.isArray(selections) ? selections : selections ? [selections] : []
  );
  const [searchValue, setSearchValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<SelectOption[]>([]);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Use placeholder prop if provided, otherwise use placeholderText
  const displayPlaceholder = placeholder || placeholderText;

  // Use options prop if provided, otherwise extract from children
  const allOptions: SelectOption[] = options.length > 0 ? options : React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === 'option') {
      return {
        value: child.props.value,
        label: child.props.children,
        disabled: child.props.disabled
      };
    }
    return null;
  }).filter(Boolean) as SelectOption[];

  useEffect(() => {
    if (variant === 'typeahead') {
      const filtered = allOptions.filter(option =>
        option.label.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(allOptions);
    }
  }, [allOptions, searchValue, variant]);

  const handleSelect = (value: string) => {
    if (variant === 'single') {
      setSelectedValues([value]);
      onSelect?.(null, value);
      setIsOpen(false);
    } else if (variant === 'checkbox') {
      const newSelection = selectedValues.includes(value)
        ? selectedValues.filter(v => v !== value)
        : [...selectedValues, value];
      setSelectedValues(newSelection);
      onSelect?.(null, value);
    }
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) return displayPlaceholder;
    if (variant === 'single') {
      const option = allOptions.find(opt => opt.value === selectedValues[0]);
      return option?.label || selectedValues[0];
    }
    if (variant === 'checkbox') {
      if (selectedValues.length === 1) {
        const option = allOptions.find(opt => opt.value === selectedValues[0]);
        return option?.label || selectedValues[0];
      }
      return `${selectedValues.length} items selected`;
    }
    return displayPlaceholder;
  };

  const toggle = () => {
    if (!isDisabled) {
      setIsOpen(!isOpen);
    }
  };

  const close = () => {
    setIsOpen(false);
  };

  return (
    <div className={`custom-select ${className}`}>
      <Button
        ref={triggerRef}
        variant="control"
        onClick={toggle}
        isDisabled={isDisabled}
        className="custom-select__toggle"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="custom-select__toggle-text">{getDisplayText()}</span>
        <CaretDownIcon className="custom-select__toggle-icon" />
      </Button>
      
      <Popover
        isVisible={isOpen}
        shouldClose={close}
        triggerRef={triggerRef}
        position="bottom-start"
        className="custom-select__popover"
      >
        <div className="custom-select__content">
          {variant === 'typeahead' && (
            <div className="custom-select__search">
              <TextInput
                value={searchValue}
                onChange={(_, value) => setSearchValue(value)}
                placeholder="Search..."
                aria-label="Search options"
              />
            </div>
          )}
          
          <List className="custom-select__list">
            {filteredOptions.map((option) => (
              <ListItem
                key={option.value}
                onClick={() => handleSelect(option.value)}
                isDisabled={option.disabled}
                className={`custom-select__option ${
                  selectedValues.includes(option.value) ? 'custom-select__option--selected' : ''
                }`}
              >
                {variant === 'checkbox' && (
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.value)}
                    readOnly
                    className="custom-select__checkbox"
                  />
                )}
                {option.label}
              </ListItem>
            ))}
          </List>
        </div>
      </Popover>
    </div>
  );
};

export default CustomSelect;
