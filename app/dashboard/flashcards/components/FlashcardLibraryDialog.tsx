import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FlashcardLibrary } from './types';
import DialogWrapper from './ui/DialogWrapper';

interface FlashcardLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  library?: FlashcardLibrary | null;
  onSave: (library: Partial<FlashcardLibrary>) => void;
}

const FlashcardLibraryDialog: React.FC<FlashcardLibraryDialogProps> = ({
  open,
  onOpenChange,
  library,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const isEditing = !!library;

  useEffect(() => {
    if (library) {
      setName(library.name);
      setDescription(library.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [library, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: library?.id,
      name,
      description: description || undefined,
    });
  };

  return (
    <DialogWrapper
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit Library' : 'Create Library'}
      onSubmit={handleSubmit}
      submitLabel={isEditing ? 'Save Changes' : 'Create Library'}
      size="sm"
    >
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter library name"
            required
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter optional description"
            rows={3}
          />
        </div>
      </div>
    </DialogWrapper>
  );
};

export default FlashcardLibraryDialog; 