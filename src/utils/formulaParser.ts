
import { SpreadsheetData, getCellPosition } from './spreadsheetUtils';

// Basic formula parser for the spreadsheet

// Check if a string is a valid cell reference (e.g., A1, B2, etc.)
const isCellReference = (str: string): boolean => {
  return /^[A-Z]+\d+$/.test(str);
};

// Get the value of a cell reference
const getCellValue = (cellRef: string, data: SpreadsheetData): number => {
  const cell = data[cellRef];
  
  if (!cell) return 0;
  
  if (cell.type === 'number') {
    return parseFloat(cell.value) || 0;
  } else if (cell.type === 'formula') {
    return parseFloat(cell.displayValue || '0') || 0;
  }
  
  return 0;
};

// Check if a cell reference contains a circular reference
const hasCircularReference = (
  currentCell: string,
  checkCell: string,
  data: SpreadsheetData,
  visited: Set<string> = new Set()
): boolean => {
  if (visited.has(checkCell)) return false;
  visited.add(checkCell);
  
  const cell = data[checkCell];
  if (!cell || cell.type !== 'formula' || !cell.formula) return false;
  
  const formula = cell.formula.slice(1); // Remove '='
  const cellRefs = formula.match(/[A-Z]+\d+/g) || [];
  
  for (const ref of cellRefs) {
    if (ref === currentCell) return true;
    if (hasCircularReference(currentCell, ref, data, visited)) return true;
  }
  
  return false;
};

// Tokenize a formula string
const tokenize = (formula: string): string[] => {
  // Basic tokenizer for mathematical expressions
  const tokens: string[] = [];
  let current = '';
  
  for (let i = 0; i < formula.length; i++) {
    const char = formula[i];
    
    if ('+-*/()'.includes(char)) {
      if (current) {
        tokens.push(current);
        current = '';
      }
      tokens.push(char);
    } else if (char === ' ') {
      if (current) {
        tokens.push(current);
        current = '';
      }
    } else {
      current += char;
    }
  }
  
  if (current) {
    tokens.push(current);
  }
  
  return tokens;
};

// Evaluate a formula
export const evaluateFormula = (
  formula: string,
  data: SpreadsheetData,
  currentCellId: string
): { result: number | string; error: boolean } => {
  try {
    if (!formula.startsWith('=')) {
      return { result: formula, error: false };
    }
    
    // Remove the '=' prefix
    const expression = formula.slice(1);
    
    // Check for circular references
    const cellRefs = expression.match(/[A-Z]+\d+/g) || [];
    for (const ref of cellRefs) {
      if (ref === currentCellId || hasCircularReference(currentCellId, ref, data)) {
        return { result: '#CIRCULAR!', error: true };
      }
    }
    
    // Tokenize the formula
    const tokens = tokenize(expression);
    
    // Replace cell references with values
    const parsedTokens = tokens.map(token => {
      if (isCellReference(token)) {
        return getCellValue(token, data).toString();
      }
      return token;
    });
    
    // Reconstruct the formula with values
    const evaluableExpr = parsedTokens.join(' ');
    
    // Use Function constructor to evaluate the expression (safer than eval)
    // eslint-disable-next-line no-new-func
    const result = Function(`'use strict'; return (${evaluableExpr})`)();
    
    if (isNaN(result)) {
      return { result: '#ERROR!', error: true };
    }
    
    return { result, error: false };
  } catch (error) {
    console.error('Formula evaluation error:', error);
    return { result: '#ERROR!', error: true };
  }
};

// Update all dependent cells when a cell changes
export const updateDependentCells = (
  changedCellId: string,
  data: SpreadsheetData
): SpreadsheetData => {
  const updatedData = { ...data };
  const cellsToUpdate: string[] = [];
  
  // Find all cells that reference the changed cell
  Object.entries(updatedData).forEach(([cellId, cellData]) => {
    if (cellData.type === 'formula' && cellData.formula) {
      const formula = cellData.formula;
      if (formula.includes(changedCellId)) {
        cellsToUpdate.push(cellId);
      }
    }
  });
  
  // Update each dependent cell
  cellsToUpdate.forEach(cellId => {
    const cell = updatedData[cellId];
    if (cell && cell.formula) {
      const { result, error } = evaluateFormula(cell.formula, updatedData, cellId);
      updatedData[cellId] = {
        ...cell,
        displayValue: error ? result.toString() : result.toString(),
        type: error ? 'error' : 'formula'
      };
    }
  });
  
  // Check if any of the updated cells have dependencies themselves
  if (cellsToUpdate.length > 0) {
    for (const cellId of cellsToUpdate) {
      // Update cells that depend on the cells we just updated
      const nestedUpdates = updateDependentCells(cellId, updatedData);
      Object.assign(updatedData, nestedUpdates);
    }
  }
  
  return updatedData;
};
