import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createLinkSchema, updateLinkSchema, type CreateLinkInput, type UpdateLinkInput, type Link } from '@linkvault/shared';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCreateLink, useUpdateLink } from '@/hooks/useLinks';
import { useFetchLinkTitle } from '@/hooks/useFetchLinkTitle';
import CategorySelector from '@/components/categories/CategorySelector';
import { Loader2 } from 'lucide-react';

interface ManageLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkToEdit?: Link | null;
}

export default function ManageLinkModal({ isOpen, onClose, linkToEdit }: ManageLinkModalProps) {
  const createLinkMutation = useCreateLink();
  const updateLinkMutation = useUpdateLink();
  const isEditMode = !!linkToEdit;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreateLinkInput | UpdateLinkInput>({
    resolver: zodResolver(isEditMode ? updateLinkSchema : createLinkSchema),
    defaultValues: {
      url: '',
      title: '',
      notes: '',
      categoryIds: [],
    },
  });

  const urlValue = watch('url');
  const titleValue = watch('title');
  const notesValue = watch('notes') || '';
  const categoryIds = watch('categoryIds') || [];

  const { fetchedTitle, isFetching } = useFetchLinkTitle(isEditMode ? '' : (urlValue || ''));

  const isFormValid = urlValue?.trim() && titleValue?.trim();

  useEffect(() => {
    if (fetchedTitle && !isEditMode) {
      setValue('title', fetchedTitle);
    }
  }, [fetchedTitle, setValue, isEditMode]);

  useEffect(() => {
    if (isOpen && linkToEdit) {
      setValue('url', linkToEdit.url);
      setValue('title', linkToEdit.title);
      setValue('notes', linkToEdit.notes || '');
      setValue('categoryIds', linkToEdit.categories?.map(c => c.id) || []);
    }
  }, [isOpen, linkToEdit, setValue]);

  const onSubmit = async (data: CreateLinkInput | UpdateLinkInput) => {
    if (isEditMode && linkToEdit) {
      updateLinkMutation.mutate({ id: linkToEdit.id, data: data as UpdateLinkInput }, {
        onSuccess: () => {
          onClose();
          setTimeout(() => {
            reset();
          }, 220);
        },
      });
    } else {
      createLinkMutation.mutate(data as CreateLinkInput, {
        onSuccess: () => {
          onClose();
          setTimeout(() => {
            reset();
          }, 220);
        },
      });
    }
  };

  const handleClose = () => {
    if (!createLinkMutation.isPending && !updateLinkMutation.isPending) {
      onClose();
      setTimeout(() => {
        reset();
      }, 220);
    }
  };

  const isPending = createLinkMutation.isPending || updateLinkMutation.isPending;

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? "Edit Link" : "Create New Link"}
      description={isEditMode ? "Update your link details" : "Add a new link to your collection"}
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
          <Label htmlFor="url">URL</Label>
          <Input
            id="url"
            type="url"
            placeholder="https://example.com"
            disabled={isPending}
            autoFocus={!isEditMode}
            {...register('url')}
          />
          {errors.url && (
            <p className="text-sm font-medium text-destructive">
              {errors.url.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <div className="relative">
            <Input
              id="title"
              type="text"
              placeholder="My awesome article"
              disabled={isPending || isFetching}
              className={isFetching ? 'pr-10' : ''}
              {...register('title')}
            />
            {isFetching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Title will be auto-filled from the webpage
          </p>
          {errors.title && (
            <p className="text-sm font-medium text-destructive">
              {errors.title.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="notes">Notes (optional)</Label>
            <span className={`text-xs ${notesValue.length > 250 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {notesValue.length}/250
            </span>
          </div>
          <Textarea
            id="notes"
            placeholder="Add any notes or description about this link..."
            disabled={isPending}
            maxLength={250}
            rows={3}
            {...register('notes')}
          />
          {errors.notes && (
            <p className="text-sm font-medium text-destructive">
              {errors.notes.message}
            </p>
          )}
        </div>

        <CategorySelector
          selectedIds={categoryIds}
          onChange={(ids) => setValue('categoryIds', ids)}
          disabled={isPending}
        />
      </form>
    </ResponsiveModal>
  );
}

