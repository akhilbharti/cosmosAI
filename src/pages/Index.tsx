
import React, { useEffect } from 'react';
import FormulaBar from '../components/Spreadsheet/FormulaBar';
import SpreadsheetGrid from '../components/Spreadsheet/SpreadsheetGrid';
import { useSpreadsheet } from '../hooks/useSpreadsheet';

const Index: React.FC = () => {
  const {
    data,
    activeCell,
    selectedRange,
    editValue,
    isEditing,
    visibleRange,
    gridRef,
    selectCell,
    startEditing,
    updateCellValue,
    navigateWithArrowKeys,
    handleScroll,
    updateEditValue
  } = useSpreadsheet();

  // Set up keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeCell) return;

      if (isEditing) return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          navigateWithArrowKeys('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          navigateWithArrowKeys('down');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          navigateWithArrowKeys('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          navigateWithArrowKeys('right');
          break;
        case 'Tab':
          e.preventDefault();
          navigateWithArrowKeys(e.shiftKey ? 'left' : 'right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeCell, isEditing, navigateWithArrowKeys]);

  return (
    <div className="spreadsheet-container bg-background animate-fade-in">
      {/* Title and formula bar */}
      <div className="p-4 flex flex-col space-y-2">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight animate-slide-down">
            Excel Sheet Clone
          </h1>
          <p className="text-muted-foreground text-sm animate-slide-down" style={{ animationDelay: '0.1s' }}>
            Edit cells and create formulas with cell references (e.g., =A1+B1)
          </p>
        </div>
        
        <FormulaBar
          activeCellId={activeCell}
          value={editValue}
          onChange={updateEditValue}
          onSubmit={updateCellValue}
          isEditing={isEditing}
        />
      </div>

      {/* Spreadsheet grid */}
      <SpreadsheetGrid
        data={data}
        activeCell={activeCell}
        selectedRange={selectedRange}
        editValue={editValue}
        isEditing={isEditing}
        visibleRange={visibleRange}
        gridRef={gridRef}
        onSelectCell={selectCell}
        onCellValueChange={updateCellValue}
        onEditValueChange={updateEditValue}
        onStartEditing={startEditing}
        onScroll={handleScroll}
      />
    </div>
  );
};

export default Index;
