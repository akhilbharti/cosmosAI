
import React from 'react';
import { getCellPosition, DEFAULT_COL_WIDTH, DEFAULT_ROW_HEIGHT, HEADER_COL_WIDTH, HEADER_ROW_HEIGHT } from '../../utils/spreadsheetUtils';

interface CellSelectorProps {
  activeCell: string | null;
  selectedRange: { startCell: string; endCell: string } | null;
}

const CellSelector: React.FC<CellSelectorProps> = ({
  activeCell,
  selectedRange,
}) => {
  // If no active cell or selected range, don't render anything
  if (!activeCell && !selectedRange) return null;

  if (activeCell && !selectedRange) {
    // Single cell selection
    const { row, col } = getCellPosition(activeCell);
    const top = row * DEFAULT_ROW_HEIGHT + HEADER_ROW_HEIGHT;
    const left = col * DEFAULT_COL_WIDTH + HEADER_COL_WIDTH;

    return (
      <div
        className="cell-selector animate-fade-in"
        style={{
          top: `${top}px`,
          left: `${left}px`,
          width: `${DEFAULT_COL_WIDTH}px`,
          height: `${DEFAULT_ROW_HEIGHT}px`,
        }}
      >
        <div className="cell-selector-handle" />
      </div>
    );
  }

  if (selectedRange) {
    // Range selection
    const startPos = getCellPosition(selectedRange.startCell);
    const endPos = getCellPosition(selectedRange.endCell);

    const startRow = Math.min(startPos.row, endPos.row);
    const endRow = Math.max(startPos.row, endPos.row);
    const startCol = Math.min(startPos.col, endPos.col);
    const endCol = Math.max(startPos.col, endPos.col);

    const top = startRow * DEFAULT_ROW_HEIGHT + HEADER_ROW_HEIGHT;
    const left = startCol * DEFAULT_COL_WIDTH + HEADER_COL_WIDTH;
    const width = (endCol - startCol + 1) * DEFAULT_COL_WIDTH;
    const height = (endRow - startRow + 1) * DEFAULT_ROW_HEIGHT;

    return (
      <div
        className="cell-selector animate-fade-in"
        style={{
          top: `${top}px`,
          left: `${left}px`,
          width: `${width}px`,
          height: `${height}px`,
        }}
      >
        <div className="cell-selector-handle" />
      </div>
    );
  }

  return null;
};

export default CellSelector;
