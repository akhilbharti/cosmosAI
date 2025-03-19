
import { useState, useCallback } from 'react';
import { SpreadsheetData, CellData, detectCellType } from '../../utils/spreadsheetUtils';
import { evaluateFormula, updateDependentCells } from '../../utils/formulaParser';

interface CellEditingState {
  isEditing: boolean;
  editValue: string;
}

export const useCellEditing = () => {
  const [state, setState] = useState<CellEditingState>({
    isEditing: false,
    editValue: ''
  });

  // Start editing the active cell
  const startEditing = useCallback(() => {
    setState(prev => ({
      ...prev,
      isEditing: true
    }));
  }, []);

  // Update edit value
  const updateEditValue = useCallback((value: string) => {
    setState(prev => ({
      ...prev,
      editValue: value
    }));
  }, []);

  // Handle cell value changes
  const updateCellValue = useCallback((cellId: string, value: string, data: SpreadsheetData) => {
    // Create new data object with the updated cell
    const type = detectCellType(value);
    const newData = { ...data };
    
    let cellData: CellData = {
      value: type === 'formula' ? value.substring(1) : value,
      type
    };
    
    // For formulas, evaluate and store the result
    if (type === 'formula') {
      cellData.formula = value;
      const { result, error } = evaluateFormula(value, newData, cellId);
      cellData.displayValue = result.toString();
      if (error) cellData.type = 'error';
    }
    
    // Update the cell
    newData[cellId] = cellData;
    
    // Update dependent cells
    const updatedData = updateDependentCells(cellId, newData);
    
    setState(prev => ({
      ...prev,
      isEditing: false
    }));
    
    return updatedData;
  }, []);

  return {
    ...state,
    startEditing,
    updateEditValue,
    updateCellValue
  };
};
