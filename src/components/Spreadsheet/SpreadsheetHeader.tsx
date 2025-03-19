
import React from 'react';
import { colIndexToName } from '../../utils/spreadsheetUtils';

interface RowHeaderProps {
  rowIndex: number;
  top: number;
}

interface ColHeaderProps {
  colIndex: number;
  left: number;
}

// Row header component
export const RowHeader: React.FC<RowHeaderProps> = ({ rowIndex, top }) => {
  return (
    <div
      className="header-cell row-header"
      style={{ top: `${top}px` }}
    >
      {rowIndex + 1}
    </div>
  );
};

// Column header component
export const ColHeader: React.FC<ColHeaderProps> = ({ colIndex, left }) => {
  return (
    <div
      className="header-cell col-header"
      style={{ left: `${left}px` }}
    >
      {colIndexToName(colIndex)}
    </div>
  );
};

// Corner header (top-left cell)
export const CornerHeader: React.FC = () => {
  return (
    <div className="header-cell corner-header" />
  );
};

// Row headers component
export const RowHeaders: React.FC<{ visibleRows: number[]; }> = ({ visibleRows }) => {
  return (
    <>
      {visibleRows.map(rowIndex => (
        <RowHeader
          key={`row-${rowIndex}`}
          rowIndex={rowIndex}
          top={rowIndex * 24 + 24} // 24px row height + 24px for column header
        />
      ))}
    </>
  );
};

// Column headers component
export const ColHeaders: React.FC<{ visibleCols: number[]; }> = ({ visibleCols }) => {
  return (
    <>
      {visibleCols.map(colIndex => (
        <ColHeader
          key={`col-${colIndex}`}
          colIndex={colIndex}
          left={colIndex * 100 + 50} // 100px column width + 50px for row header
        />
      ))}
    </>
  );
};

export default { RowHeader, ColHeader, CornerHeader, RowHeaders, ColHeaders };
