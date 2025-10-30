import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCollectionSchema, updateCollectionSchema, type CreateCollectionInput, type UpdateCollectionInput, type Collection } from '@linkvault/shared';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateCollection, useUpdateCollection } from '@/hooks/useCollections';

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308',
  '#84CC16', '#22C55E', '#10B981', '#14B8A6',
  '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
  '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
];

interface ManageCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectionToEdit?: Collection | null;
}

export default function ManageCollectionModal({ isOpen, onClose, collectionToEdit }: ManageCollectionModalProps) {
  const createCollectionMutation = useCreateCollection();
  const updateCollectionMutation = useUpdateCollection();
  const isEditMode = !!collectionToEdit;
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreateCollectionInput | UpdateCollectionInput>({
    resolver: zodResolver(isEditMode ? updateCollectionSchema : createCollectionSchema),
    defaultValues: {
      title: '',
      description: '',
      color: PRESET_COLORS[0],
      isPrivate: false,
    },
  });

  const titleValue = watch('title') || '';
  const descriptionValue = watch('description') || '';
  const isPrivateValue = watch('isPrivate') || false;

  useEffect(() => {
    setValue('color', selectedColor);
  }, [selectedColor, setValue]);

  useEffect(() => {
    if (isOpen && collectionToEdit) {
      setValue('title', collectionToEdit.title);
      setValue('description', collectionToEdit.description || '');
      setValue('color', collectionToEdit.color);
      setValue('isPrivate', collectionToEdit.isPrivate || false);
      setSelectedColor(collectionToEdit.color);
    }
  }, [isOpen, collectionToEdit, setValue]);

  const onSubmit = async (data: CreateCollectionInput | UpdateCollectionInput) => {
    if (isEditMode && collectionToEdit) {
      updateCollectionMutation.mutate({ id: collectionToEdit.id, data: data as UpdateCollectionInput }, {
        onSuccess: () => {
          onClose();
          setTimeout(() => {
            reset();
            setSelectedColor(PRESET_COLORS[0]);
          }, 220);
        },
      });
    } else {
      createCollectionMutation.mutate(data as CreateCollectionInput, {
        onSuccess: () => {
          onClose();
          setTimeout(() => {
            reset();
            setSelectedColor(PRESET_COLORS[0]);
          }, 220);
        },
      });
    }
  };

  const handleClose = () => {
    if (!createCollectionMutation.isPending && !updateCollectionMutation.isPending) {
      onClose();
      setTimeout(() => {
        reset();
        setSelectedColor(PRESET_COLORS[0]);
      }, 220);
    }
  };

  const isPending = createCollectionMutation.isPending || updateCollectionMutation.isPending;
  const isFormValid = titleValue.trim().length > 0;

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'Edit Collection' : 'Create New Collection'}
      description={isEditMode ? 'Update your collection details' : 'Add a collection to group your public links'}
      actionButton={
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={isPending || !isFormValid}
          className="flex-1"
        >
          Save
        </Button>
      }
      onCancel={handleClose}
      cancelText="Cancel"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <div className="flex items-center gap-2">
            <Input
              id="title"
              type="text"
              placeholder="Reading List, Dev Articles..."
              disabled={isPending}
              autoFocus
              maxLength={50}
              {...register('title')}
            />
          </div>
          <p className="text-xs text-muted-foreground">Up to 50 characters</p>
          {errors.title && (
            <p className="text-sm font-medium text-destructive">
              {errors.title.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="description">Description (optional)</Label>
            <span className={`text-xs ${descriptionValue.length > 250 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {descriptionValue.length}/250
            </span>
          </div>
          <Textarea
            id="description"
            placeholder="Describe what goes in this collection..."
            disabled={isPending}
            maxLength={250}
            rows={3}
            {...register('description')}
          />
          {errors.description && (
            <p className="text-sm font-medium text-destructive">
              {errors.description.message}
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
                disabled={isPending}
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
          <p className="text-xs text-muted-foreground">Selected: {selectedColor}</p>
          {errors.color && (
            <p className="text-sm font-medium text-destructive">
              {errors.color.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPrivate"
              checked={isPrivateValue}
              onCheckedChange={(checked) => setValue('isPrivate', checked === true)}
              disabled={isPending}
            />
            <Label htmlFor="isPrivate" className="text-sm font-normal cursor-pointer">
              Private Collection
            </Label>
          </div>
          <p className="text-xs text-muted-foreground pl-6">
            Only you can view this collection. Public links only can be added.
          </p>
        </div>
      </form>
    </ResponsiveModal>
  );
}


