import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2, Save, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  isLoading?: boolean;
}

/**
 * Reusable confirmation dialog component
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {variant === "destructive" && <AlertTriangle className="h-5 w-5 text-destructive" />}
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={variant === "destructive" ? "bg-destructive hover:bg-destructive/90" : ""}
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Hook for managing confirmation dialogs
 */
export function useConfirmDialog() {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<Omit<ConfirmDialogProps, "open" | "onOpenChange"> | null>(null);

  const confirm = (
    onConfirm: () => void,
    options: {
      title: string;
      description: string;
      confirmText?: string;
      cancelText?: string;
      variant?: "default" | "destructive";
    }
  ) => {
    setConfig({
      ...options,
      onConfirm: () => {
        onConfirm();
        setOpen(false);
      },
    });
    setOpen(true);
  };

  const Dialog = config ? (
    <ConfirmDialog
      {...config}
      open={open}
      onOpenChange={setOpen}
    />
  ) : null;

  return { confirm, Dialog };
}

