import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCategorySchema, type CreateCategoryInput } from '@linkvault/shared';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCategories, useDeleteCategory, useCreateCategory } from '@/hooks/useCategories';
import type { Category } from '@linkvault/shared';
import CategorySkeleton from '@/components/skeletons/CategorySkeleton';
import { Plus, Trash2 } from 'lucide-react';

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308',
  '#84CC16', '#22C55E', '#10B981', '#14B8A6',
  '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
  '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
];

export default function ManageCategoriesModal({ isOpen, onClose }: ManageCategoriesModalProps) {
  const { data, isLoading } = useCategories();
  const deleteCategoryMutation = useDeleteCategory();
  const createCategoryMutation = useCreateCategory();
  const [view, setView] = useState<'list' | 'create'>('list');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: '',
      color: PRESET_COLORS[0],
    },
  });

  const nameValue = watch('name');
  const isFormValid = nameValue?.trim();

  useEffect(() => {
    if (isOpen) {
    }
  }, [isOpen]);

  useEffect(() => {
    setValue('color', selectedColor);
  }, [selectedColor, setValue]);

  const handleDelete = (categoryId: string) => {
    deleteCategoryMutation.mutate(categoryId);
  };

  const onSubmit = async (data: CreateCategoryInput) => {
    createCategoryMutation.mutate(data, {
      onSuccess: () => {
        reset();
        setSelectedColor(PRESET_COLORS[0]);
        setView('list');
      },
    });
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setView('list');
      reset();
      setSelectedColor(PRESET_COLORS[0]);
    }, 220);
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={handleClose}
      title={view === 'list' ? 'Manage Categories' : 'Create New Category'}
      description={view === 'list' ? 'Create, edit, and delete your categories' : 'Add a new category to organize your links'}
      actionButton={view === 'create' ? (
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={createCategoryMutation.isPending || !isFormValid}
          className="flex-1"
        >
          Save
        </Button>
      ) : undefined}
      onCancel={view === 'create' ? () => setView('list') : undefined}
      cancelText={view === 'create' ? 'Cancel' : undefined}
    >
      {view === 'list' ? (
        <div className="space-y-4">
          <Button
            onClick={() => setView('create')}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Category
          </Button>

          {isLoading ? (
            <CategorySkeleton count={5} />
          ) : data?.categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No categories yet</p>
              <p className="text-sm">Create your first category to get started</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {data?.categories.map((category: Category) => (
                <div
                  key={category.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="flex-1 font-medium truncate">{category.name}</span>
                  <button
                    onClick={() => handleDelete(category.id)}
                    disabled={deleteCategoryMutation.isPending}
                    className="p-1 hover:bg-destructive/10 rounded transition-colors disabled:opacity-50"
                    aria-label="Delete category"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Work, Personal, Reading..."
              disabled={createCategoryMutation.isPending}
              autoFocus
              maxLength={50}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm font-medium text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="grid grid-cols-8 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  disabled={createCategoryMutation.isPending}
                  className={`w-8 h-8 rounded-full transition-all ${
                    selectedColor === color
                      ? 'ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110'
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Selected: {selectedColor}
            </p>
            {errors.color && (
              <p className="text-sm font-medium text-destructive">
                {errors.color.message}
              </p>
            )}
          </div>
        </form>
      )}
    </ResponsiveModal>
  );
}

