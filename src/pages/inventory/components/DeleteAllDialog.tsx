
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface DeleteAllDialogProps {
  showDialog: boolean;
  setShowDialog: (value: boolean) => void;
  onConfirmDelete: () => void;
}

export const DeleteAllDialog = ({ 
  showDialog, 
  setShowDialog, 
  onConfirmDelete 
}: DeleteAllDialogProps) => {
  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить все товары?</AlertDialogTitle>
          <AlertDialogDescription>
            Вы уверены, что хотите удалить все товары из инвентаря? Это действие невозможно отменить.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Удалить все
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
