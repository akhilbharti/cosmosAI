
import { useState, useCallback, useEffect } from 'react';
import { SpreadsheetData } from '../utils/spreadsheetUtils';
import { 
  useCellSelection, 
  useCellEditing, 
  useNavigation, 
  useVirtualization 
} from './spreadsheet';

export const useSpreadsheet = () => {
  // State for the spreadsheet data
  const [data, setData] = useState<SpreadsheetData>({});
  
  // Cell editing hooks
  const { 
    isEditing, 
    editValue, 
    startEditing, 
    updateEditValue, 
    updateCellValue 
  } = useCellEditing();
  
  // Virtualization hooks
  const { visibleRange, gridRef, handleScroll } = useVirtualization();
  
  // Cell selection hooks - depends on data and updateEditValue
  const { 
    activeCell, 
    selectedRange, 
    selectCell 
  } = useCellSelection({ 
    data, 
    onEditValueChange: updateEditValue 
  });
  
  // Navigation hooks - depends on gridRef, selectCell, and updateEditValue
  const { navigateWithArrowKeys: navigate } = useNavigation({
    gridRef,
    onSelectCell: selectCell,
    onEditValueChange: updateEditValue,
    data
  });

  // Handle cell value changes wrapper
  const handleUpdateCellValue = useCallback((cellId: string, value: string) => {
    const updatedData = updateCellValue(cellId, value, data);
    setData(updatedData);
  }, [data, updateCellValue]);
  
  // Navigate with arrow keys wrapper
  const navigateWithArrowKeys = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    navigate(direction, activeCell);
  }, [navigate, activeCell]);
  
  // Set up keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeCell) return;
      if (isEditing) return;
      
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          startEditing();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeCell, isEditing, startEditing]);
  
  // Return the state and functions
  return {
    data,
    activeCell,
    selectedRange,
    editValue,
    isEditing,
    visibleRange,
    gridRef,
    selectCell,
    startEditing,
    updateCellValue: handleUpdateCellValue,
    navigateWithArrowKeys,
    handleScroll,
    updateEditValue
  };
};
