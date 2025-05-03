import React, { ReactNode } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DialogWrapperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  onCancel?: () => void;
  onSubmit?: (e: React.FormEvent) => void;
  submitLabel?: string;
  cancelLabel?: string;
  size?: 'sm' | 'md' | 'lg';
}

const DialogWrapper: React.FC<DialogWrapperProps> = ({
  open,
  onOpenChange,
  title,
  children,
  onCancel,
  onSubmit,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  size = 'md',
}) => {
  const widthClasses = {
    sm: 'sm:max-w-[425px]',
    md: 'sm:max-w-[550px]',
    lg: 'sm:max-w-[700px]',
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onOpenChange(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={widthClasses[size]}>
        {onSubmit ? (
          <form onSubmit={onSubmit}>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            {children}
            <DialogFooter className="mt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
              >
                {cancelLabel}
              </Button>
              <Button type="submit">
                {submitLabel}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            {children}
            {(onCancel || onSubmit) && (
              <DialogFooter className="mt-4">
                {onCancel && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancel}
                  >
                    {cancelLabel}
                  </Button>
                )}
                {onSubmit && (
                  <Button 
                    type="button" 
                    onClick={handleSubmit}
                  >
                    {submitLabel}
                  </Button>
                )}
              </DialogFooter>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DialogWrapper; 