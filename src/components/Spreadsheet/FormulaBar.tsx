
import React, { useRef, useEffect } from 'react';
import { Input } from '../../components/ui/input';

interface FormulaBarProps {
  activeCellId: string | null;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (cellId: string, value: string) => void;
  isEditing: boolean;
}

const FormulaBar: React.FC<FormulaBarProps> = ({
  activeCellId,
  value,
  onChange,
  onSubmit,
  isEditing,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  // Handle key down events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && activeCellId) {
      e.preventDefault();
      onSubmit(activeCellId, value);
    }
  };

  return (
    <div className="formula-bar glass-morphism animate-fade-in flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-md p-1 shadow-sm border">
      <div className="cell-reference font-mono text-sm px-2 py-1 bg-muted/50 rounded min-w-[60px] text-center">
        {activeCellId || 'Select cell'}
      </div>
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={!activeCellId}
        placeholder="Enter value or formula (e.g., =A1+B1)"
        className="flex-1 transition-all duration-200 ease-in-out"
        aria-label="Formula input"
      />
    </div>
  );
};

export default React.memo(FormulaBar);
