
import React, { useEffect, useCallback, useMemo } from 'react';
import SpreadsheetCell from './SpreadsheetCell';
import { CornerHeader, ColHeaders, RowHeaders } from './SpreadsheetHeader';
import CellSelector from './CellSelector';
import {
  getCellId,
  DEFAULT_COL_WIDTH,
  DEFAULT_ROW_HEIGHT,
  HEADER_COL_WIDTH,
  HEADER_ROW_HEIGHT,
  SpreadsheetData,
  VisibleRange,
} from '../../utils/spreadsheetUtils';

interface SpreadsheetGridProps {
  data: SpreadsheetData;
  activeCell: string | null;
  selectedRange: { startCell: string; endCell: string } | null;
  editValue: string;
  isEditing: boolean;
  visibleRange: VisibleRange;
  gridRef: React.RefObject<HTMLDivElement>;
  onSelectCell: (cellId: string, isShiftKey: boolean) => void;
  onCellValueChange: (cellId: string, value: string) => void;
  onEditValueChange: (value: string) => void;
  onStartEditing: () => void;
  onScroll: () => void;
}

const SpreadsheetGrid: React.FC<SpreadsheetGridProps> = ({
  data,
  activeCell,
  selectedRange,
  editValue,
  isEditing,
  visibleRange,
  gridRef,
  onSelectCell,
  onCellValueChange,
  onEditValueChange,
  onStartEditing,
  onScroll,
}) => {
  // Generate visible rows and columns based on the visible range - only compute when visibleRange changes
  const visibleRows = useMemo(() => 
    Array.from(
      { length: visibleRange.endRow - visibleRange.startRow + 1 },
      (_, i) => visibleRange.startRow + i
    ), 
    [visibleRange.startRow, visibleRange.endRow]
  );

  const visibleCols = useMemo(() => 
    Array.from(
      { length: visibleRange.endCol - visibleRange.startCol + 1 },
      (_, i) => visibleRange.startCol + i
    ),
    [visibleRange.startCol, visibleRange.endCol]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!activeCell) return;

      // Prevent default for arrow keys and Enter to avoid scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Tab'].includes(e.key)) {
        e.preventDefault();
      }

      // Enter edit mode
      if (e.key === 'Enter' && !isEditing) {
        onStartEditing();
      }
      
      // Exit edit mode and save
      if (e.key === 'Enter' && isEditing) {
        onCellValueChange(activeCell, editValue);
      }
    },
    [activeCell, isEditing, editValue, onStartEditing, onCellValueChange]
  );

  // Add keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Check if a cell is selected in the range
  const isCellInSelectedRange = useCallback(
    (cellId: string): boolean => {
      if (!selectedRange) return false;
      
      // Logic to determine if cell is in selected range
      // ... (implementation would compare row/col with range bounds)
      
      return false; // Placeholder
    },
    [selectedRange]
  );

  // Generate virtualized cells - only cells in the visible range are rendered
  const renderVirtualizedCells = useMemo(() => {
    return visibleRows.flatMap(rowIndex => 
      visibleCols.map(colIndex => {
        const cellId = getCellId(rowIndex, colIndex);
        const cellData = data[cellId];
        const isActive = activeCell === cellId;
        const isSelected = isCellInSelectedRange(cellId);
        
        return (
          <SpreadsheetCell
            key={cellId}
            cellId={cellId}
            rowIndex={rowIndex}
            colIndex={colIndex}
            cellData={cellData}
            isActive={isActive}
            isSelected={isSelected}
            top={(rowIndex * DEFAULT_ROW_HEIGHT) + HEADER_ROW_HEIGHT}
            left={(colIndex * DEFAULT_COL_WIDTH) + HEADER_COL_WIDTH}
            onSelect={onSelectCell}
            onDoubleClick={onStartEditing}
            onValueChange={onCellValueChange}
            isEditing={isActive && isEditing}
            editValue={editValue}
            onEditValueChange={onEditValueChange}
          />
        );
      })
    );
  }, [
    visibleRows, 
    visibleCols, 
    data, 
    activeCell, 
    isCellInSelectedRange, 
    editValue, 
    isEditing, 
    onSelectCell, 
    onStartEditing, 
    onCellValueChange, 
    onEditValueChange
  ]);

  return (
    <div
      ref={gridRef}
      className="spreadsheet-grid hide-scrollbar"
      onScroll={onScroll}
    >
      {/* The inner container for positioning */}
      <div
        className="spreadsheet-grid-inner"
        style={{
          width: `${(10000 * DEFAULT_COL_WIDTH) + HEADER_COL_WIDTH}px`,
          height: `${(10000 * DEFAULT_ROW_HEIGHT) + HEADER_ROW_HEIGHT}px`,
          position: 'relative',
        }}
      >
        {/* Corner header (top-left cell) */}
        <CornerHeader />

        {/* Column headers */}
        <ColHeaders visibleCols={visibleCols} />

        {/* Row headers */}
        <RowHeaders visibleRows={visibleRows} />

        {/* Virtualized cells - only render visible cells */}
        {renderVirtualizedCells}

        {/* Cell selector overlay */}
        <CellSelector
          activeCell={activeCell}
          selectedRange={selectedRange}
        />
      </div>
    </div>
  );
};

export default React.memo(SpreadsheetGrid);
