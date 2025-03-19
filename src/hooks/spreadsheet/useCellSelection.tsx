
import { useState, useCallback } from 'react';
import { SpreadsheetData, CellData } from '../../utils/spreadsheetUtils';

interface CellSelectionState {
  activeCell: string | null;
  selectedRange: { startCell: string; endCell: string } | null;
}

interface UseCellSelectionProps {
  data: SpreadsheetData;
  onEditValueChange: (value: string) => void;
}

export const useCellSelection = ({ data, onEditValueChange }: UseCellSelectionProps) => {
  const [state, setState] = useState<CellSelectionState>({
    activeCell: null,
    selectedRange: null
  });

  // Handle cell selection
  const selectCell = useCallback((cellId: string, isShiftKey = false) => {
    setState(prev => {
      const newState = { ...prev };
      
      if (isShiftKey && prev.activeCell) {
        // Extending selection with shift key
        newState.selectedRange = {
          startCell: prev.activeCell,
          endCell: cellId
        };
      } else {
        // New single cell selection
        newState.activeCell = cellId;
        newState.selectedRange = null;
        
        // Set edit value to the current cell value
        const cellData = data[cellId];
        onEditValueChange(cellData?.formula || cellData?.value || '');
      }
      
      return newState;
    });
  }, [data, onEditValueChange]);

  return {
    ...state,
    selectCell
  };
};
