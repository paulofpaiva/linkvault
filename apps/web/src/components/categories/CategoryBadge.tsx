import type { Category } from '@linkvault/shared';

interface CategoryBadgeProps {
  category: Category;
  onRemove?: () => void;
  size?: 'sm' | 'md';
  className?: string;
  disabled?: boolean;
}

export default function CategoryBadge({ category, onRemove, size = 'sm', className = '', disabled = false }: CategoryBadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs';
  
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium border ${sizeClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      style={{ 
        backgroundColor: `${category.color}20`,
        borderColor: `${category.color}60`,
        color: category.color
      }}
    >
      {category.name}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className="hover:opacity-70 transition-opacity disabled:cursor-not-allowed disabled:hover:opacity-100"
          aria-label="Remove category"
        >
          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </span>
  );
}

