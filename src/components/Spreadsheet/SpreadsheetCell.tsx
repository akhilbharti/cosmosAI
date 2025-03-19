
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { CellData, formatDisplayValue } from '../../utils/spreadsheetUtils';

interface SpreadsheetCellProps {
  cellId: string;
  rowIndex: number;
  colIndex: number;
  cellData?: CellData;
  isActive: boolean;
  isSelected: boolean;
  top: number;
  left: number;
  onSelect: (cellId: string, isShiftKey: boolean) => void;
  onDoubleClick: () => void;
  onValueChange: (cellId: string, value: string) => void;
  isEditing: boolean;
  editValue: string;
  onEditValueChange: (value: string) => void;
}

const SpreadsheetCell: React.FC<SpreadsheetCellProps> = ({
  cellId,
  rowIndex,
  colIndex,
  cellData,
  isActive,
  isSelected,
  top,
  left,
  onSelect,
  onDoubleClick,
  onValueChange,
  isEditing,
  editValue,
  onEditValueChange,
}) => {
  const cellRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUpdated, setIsUpdated] = useState(false);

  // Cell content based on edit mode and data
  const cellContent = useMemo(() => {
    if (!cellData) return '';
    return formatDisplayValue(cellData);
  }, [cellData]);

  // Handle cell click
  const handleClick = useCallback((e: React.MouseEvent) => {
    onSelect(cellId, e.shiftKey);
  }, [cellId, onSelect]);

  // Handle cell double click to enter edit mode
  const handleDoubleClick = useCallback(() => {
    onDoubleClick();
  }, [onDoubleClick]);

  // Handle key down in edit mode
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onValueChange(cellId, editValue);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onValueChange(cellId, cellData?.value || '');
    }
  }, [cellId, editValue, onValueChange, cellData]);

  // Focus input when entering edit mode
  React.useEffect(() => {
    if (isActive && isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive, isEditing]);

  // Animation when cell values update
  React.useEffect(() => {
    if (cellData && !isEditing) {
      setIsUpdated(true);
      const timer = setTimeout(() => {
        setIsUpdated(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [cellData, isEditing]);

  // Handle input change for editing
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onEditValueChange(e.target.value);
  }, [onEditValueChange]);

  // Cell type class based on data
  const cellTypeClass = useMemo(() => {
    if (!cellData) return '';
    return `cell-${cellData.type || 'text'}`;
  }, [cellData]);

  // Determine text alignment based on cell type
  const alignmentClass = useMemo(() => {
    if (!cellData) return 'text-left';
    return cellData.type === 'number' ? 'text-right' : 'text-left';
  }, [cellData]);

  return (
    <div
      ref={cellRef}
      className={`cell ${cellTypeClass} ${isActive ? 'active' : ''} ${isSelected ? 'bg-primary/10' : ''} ${isUpdated ? 'cell-updated' : ''} flex items-center ${alignmentClass}`}
      style={{ top: `${top}px`, left: `${left}px` }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      data-cell-id={cellId}
    >
      {isActive && isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={() => onValueChange(cellId, editValue)}
          className="w-full h-full outline-none border-none bg-transparent px-1"
        />
      ) : (
        <span className="w-full px-1">{cellContent}</span>
      )}
    </div>
  );
};

export default React.memo(SpreadsheetCell);
