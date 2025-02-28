
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UpdateProductDialogProps {
  showDialog: boolean;
  setShowDialog: (value: boolean) => void;
  product: any;
  onUpdateProduct: (productId: string, quantity: number) => void;
}

export const UpdateProductDialog = ({ 
  showDialog, 
  setShowDialog, 
  product, 
  onUpdateProduct 
}: UpdateProductDialogProps) => {
  const [updateFormData, setUpdateFormData] = useState({
    quantity: 0,
  });

  useEffect(() => {
    if (product) {
      setUpdateFormData({ quantity: product.quantity });
    }
  }, [product]);

  const handleUpdateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setUpdateFormData({
      ...updateFormData,
      quantity: parseInt(value) || 0,
    });
  };

  const getSizeLabel = (size: string) => {
    if (size === "Автофлакон" || size === "car") return "Автофлакон";
    return size.includes("мл") ? size : `${size} мл`;
  };

  const handleSubmit = () => {
    onUpdateProduct(product.id, updateFormData.quantity);
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Обновить количество</DialogTitle>
          <DialogDescription>
            {product && (
              <>
                {product.name} ({getSizeLabel(product.size)})
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="update-quantity">Новое количество</Label>
            <Input
              id="update-quantity"
              type="number"
              min="0"
              value={updateFormData.quantity}
              onChange={handleUpdateInputChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDialog(false)}>
            Отмена
          </Button>
          <Button onClick={handleSubmit}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
