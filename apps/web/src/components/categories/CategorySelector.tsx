import { useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import CategoryBadge from './CategoryBadge';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';

interface CategorySelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

export default function CategorySelector({ selectedIds, onChange, disabled }: CategorySelectorProps) {
  const { data, isLoading } = useCategories();
  const [isExpanded, setIsExpanded] = useState(false);

  const availableCategories = data?.categories || [];
  const selectedCategories = availableCategories.filter(cat => selectedIds.includes(cat.id));
  const unselectedCategories = availableCategories.filter(cat => !selectedIds.includes(cat.id));

  const handleToggle = (categoryId: string) => {
    if (selectedIds.includes(categoryId)) {
      onChange(selectedIds.filter(id => id !== categoryId));
    } else {
      onChange([...selectedIds, categoryId]);
    }
  };

  const handleRemove = (categoryId: string) => {
    onChange(selectedIds.filter(id => id !== categoryId));
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Categories (optional)</Label>
        <div className="flex items-center gap-2 p-2 border rounded-md">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading categories...</span>
        </div>
      </div>
    );
  }

  if (availableCategories.length === 0) {
    return (
      <div className="space-y-2">
        <Label>Categories (optional)</Label>
        <p className="text-sm text-muted-foreground">
          No categories available. Create one first!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Categories (optional)</Label>
      
      {/* Selected categories */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedCategories.map(category => (
            <CategoryBadge
              key={category.id}
              category={category}
              size="md"
              onRemove={() => handleRemove(category.id)}
              disabled={disabled}
            />
          ))}
        </div>
      )}

      {/* Add category button / dropdown */}
      {unselectedCategories.length > 0 && (
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            disabled={disabled}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>

          {isExpanded && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsExpanded(false)}
              />
              <div className="absolute z-20 mt-1 w-full sm:w-64 p-2 bg-popover border rounded-md shadow-lg max-h-60 overflow-y-auto">
                <div className="space-y-1">
                  {unselectedCategories.map(category => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        handleToggle(category.id);
                        setIsExpanded(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-accent transition-colors"
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="flex-1 text-left truncate">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {selectedCategories.length === 0 && unselectedCategories.length === 0 && (
        <p className="text-sm text-muted-foreground">
          All categories are selected
        </p>
      )}
    </div>
  );
}

