
import { useCallback } from 'react';
import { getCellId, getCellPosition, MAX_ROWS, MAX_COLS, DEFAULT_ROW_HEIGHT, DEFAULT_COL_WIDTH } from '../../utils/spreadsheetUtils';
import { SpreadsheetData } from '../../utils/spreadsheetUtils';

interface UseNavigationProps {
  gridRef: React.RefObject<HTMLDivElement>;
  onSelectCell: (cellId: string, isShiftKey: boolean) => void;
  onEditValueChange: (value: string) => void;
  data: SpreadsheetData;
}

export const useNavigation = ({ 
  gridRef, 
  onSelectCell,
  onEditValueChange,
  data
}: UseNavigationProps) => {
  // Navigate with arrow keys
  const navigateWithArrowKeys = useCallback((
    direction: 'up' | 'down' | 'left' | 'right',
    activeCell: string | null
  ) => {
    if (!activeCell) return activeCell;
    
    const { row, col } = getCellPosition(activeCell);
    
    let newRow = row;
    let newCol = col;
    
    switch (direction) {
      case 'up':
        newRow = Math.max(0, row - 1);
        break;
      case 'down':
        newRow = Math.min(MAX_ROWS - 1, row + 1);
        break;
      case 'left':
        newCol = Math.max(0, col - 1);
        break;
      case 'right':
        newCol = Math.min(MAX_COLS - 1, col + 1);
        break;
    }
    
    const newCellId = getCellId(newRow, newCol);
    
    // Ensure the new cell is visible
    if (gridRef.current) {
      const cellTop = newRow * DEFAULT_ROW_HEIGHT;
      const cellLeft = newCol * DEFAULT_COL_WIDTH;
      
      if (direction === 'up' || direction === 'down') {
        gridRef.current.scrollTop = cellTop - (gridRef.current.clientHeight / 2) + (DEFAULT_ROW_HEIGHT / 2);
      } else {
        gridRef.current.scrollLeft = cellLeft - (gridRef.current.clientWidth / 2) + (DEFAULT_COL_WIDTH / 2);
      }
    }
    
    // Update the active cell
    onSelectCell(newCellId, false);
    
    // Update the edit value
    const cellData = data[newCellId];
    onEditValueChange(cellData?.formula || cellData?.value || '');
    
    return newCellId;
  }, [gridRef, onSelectCell, onEditValueChange, data]);

  return {
    navigateWithArrowKeys
  };
};
