
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddProductDialogProps {
  showDialog: boolean;
  setShowDialog: (value: boolean) => void;
  locations: any[];
  onAddProduct: (formData: any) => void;
}

export const AddProductDialog = ({ 
  showDialog, 
  setShowDialog, 
  locations, 
  onAddProduct 
}: AddProductDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    size: "5 мл",
    type: "perfume",
    location: "",
    quantity: 1,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "quantity" ? parseInt(value) || 0 : value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = () => {
    onAddProduct(formData);
    setFormData({
      name: "",
      size: "5 мл",
      type: "perfume",
      location: "",
      quantity: 1,
    });
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Добавить товар</DialogTitle>
          <DialogDescription>
            Заполните форму для добавления нового товара в инвентарь
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="name">Название</Label>
            <Input
              id="name"
              name="name"
              placeholder="Название парфюма"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="size">Объем</Label>
              <Select 
                value={formData.size} 
                onValueChange={(value) => handleSelectChange("size", value)}
              >
                <SelectTrigger id="size">
                  <SelectValue placeholder="Выберите объем" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5 мл">5 мл</SelectItem>
                  <SelectItem value="16 мл">16 мл</SelectItem>
                  <SelectItem value="20 мл">20 мл</SelectItem>
                  <SelectItem value="25 мл">25 мл</SelectItem>
                  <SelectItem value="30 мл">30 мл</SelectItem>
                  <SelectItem value="Автофлакон">Автофлакон</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="type">Тип</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => handleSelectChange("type", value)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="perfume">Парфюм</SelectItem>
                  <SelectItem value="other">Другое</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="location">Точка продажи</Label>
              <Select 
                value={formData.location} 
                onValueChange={(value) => handleSelectChange("location", value)}
              >
                <SelectTrigger id="location">
                  <SelectValue placeholder="Выберите точку" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="quantity">Количество</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                placeholder="1"
                value={formData.quantity}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDialog(false)}>
            Отмена
          </Button>
          <Button onClick={handleSubmit}>Добавить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
