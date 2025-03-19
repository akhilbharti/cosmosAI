
// Helper functions and constants for the spreadsheet

// Constants for the spreadsheet
export const MAX_ROWS = 10000;
export const MAX_COLS = 10000;
export const DEFAULT_COL_WIDTH = 100;
export const DEFAULT_ROW_HEIGHT = 24;
export const HEADER_ROW_HEIGHT = 24;
export const HEADER_COL_WIDTH = 50;

// Types
export interface CellData {
  value: string;
  displayValue?: string;
  formula?: string;
  type?: 'text' | 'number' | 'formula' | 'error';
}

export interface SpreadsheetData {
  [key: string]: CellData;
}

// Coordinate utils
export const colIndexToName = (index: number): string => {
  let name = '';
  
  while (index >= 0) {
    name = String.fromCharCode(65 + (index % 26)) + name;
    index = Math.floor(index / 26) - 1;
  }
  
  return name;
};

export const colNameToIndex = (name: string): number => {
  let index = -1;
  
  for (let i = 0; i < name.length; i++) {
    index = (index + 1) * 26 + (name.charCodeAt(i) - 65);
  }
  
  return index;
};

export const getCellId = (row: number, col: number): string => {
  return `${colIndexToName(col)}${row + 1}`;
};

export const getCellPosition = (cellId: string): { row: number; col: number } => {
  const matches = cellId.match(/([A-Z]+)(\d+)/);
  if (!matches) return { row: 0, col: 0 };
  
  const colName = matches[1];
  const row = parseInt(matches[2]) - 1;
  const col = colNameToIndex(colName);
  
  return { row, col };
};

// Cell range utils
export const getCellsInRange = (startCellId: string, endCellId: string): string[] => {
  const start = getCellPosition(startCellId);
  const end = getCellPosition(endCellId);
  
  const startRow = Math.min(start.row, end.row);
  const endRow = Math.max(start.row, end.row);
  const startCol = Math.min(start.col, end.col);
  const endCol = Math.max(start.col, end.col);
  
  const cellIds: string[] = [];
  
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      cellIds.push(getCellId(row, col));
    }
  }
  
  return cellIds;
};

// Detect cell type
export const detectCellType = (value: string): 'text' | 'number' | 'formula' => {
  if (value.startsWith('=')) return 'formula';
  
  // Check if it's a number (including decimals)
  if (!isNaN(Number(value)) && value.trim() !== '') return 'number';
  
  return 'text';
};

// Virtualization helpers
export interface VisibleRange {
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
}

export const calculateVisibleRange = (
  scrollLeft: number,
  scrollTop: number,
  viewportWidth: number,
  viewportHeight: number
): VisibleRange => {
  const startCol = Math.max(0, Math.floor(scrollLeft / DEFAULT_COL_WIDTH));
  const startRow = Math.max(0, Math.floor(scrollTop / DEFAULT_ROW_HEIGHT));
  
  const endCol = Math.min(
    MAX_COLS - 1,
    startCol + Math.ceil(viewportWidth / DEFAULT_COL_WIDTH) + 1
  );
  const endRow = Math.min(
    MAX_ROWS - 1,
    startRow + Math.ceil(viewportHeight / DEFAULT_ROW_HEIGHT) + 1
  );
  
  return { startRow, endRow, startCol, endCol };
};

// Helper to update the display value based on cell type
export const formatDisplayValue = (cellData: CellData): string => {
  if (!cellData) return '';
  
  if (cellData.type === 'number') {
    // Format number with appropriate decimal places
    const num = parseFloat(cellData.value);
    return isNaN(num) ? '' : num.toString();
  } else if (cellData.type === 'formula') {
    return cellData.displayValue || '';
  }
  
  return cellData.value;
};
