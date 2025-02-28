
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, MapPin, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLocations } from "@/hooks/use-locations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

const Locations = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { locations, addLocation, updateLocation, deleteLocation } = useLocations();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    address: "",
    contact: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddLocation = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Ошибка",
        description: "Укажите название точки продажи",
        variant: "destructive",
      });
      return;
    }

    addLocation({
      id: Date.now().toString(),
      name: formData.name,
      address: formData.address,
      contact: formData.contact,
    });

    toast({
      title: "Точка добавлена",
      description: "Новая точка продажи успешно добавлена",
    });

    setShowAddDialog(false);
    setFormData({
      id: "",
      name: "",
      address: "",
      contact: "",
    });
  };

  const handleEditClick = (location: any) => {
    setSelectedLocation(location);
    setFormData({
      id: location.id,
      name: location.name,
      address: location.address || "",
      contact: location.contact || "",
    });
    setShowEditDialog(true);
  };

  const handleDeleteClick = (location: any) => {
    setSelectedLocation(location);
    setShowDeleteDialog(true);
  };

  const handleUpdateLocation = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Ошибка",
        description: "Укажите название точки продажи",
        variant: "destructive",
      });
      return;
    }

    updateLocation({
      id: formData.id,
      name: formData.name,
      address: formData.address,
      contact: formData.contact,
    });

    toast({
      title: "Точка обновлена",
      description: "Информация о точке продажи успешно обновлена",
    });

    setShowEditDialog(false);
  };

  const handleDeleteLocation = () => {
    if (selectedLocation) {
      deleteLocation(selectedLocation.id);

      toast({
        title: "Точка удалена",
        description: "Точка продажи успешно удалена",
      });

      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-medium">Точки продаж</h1>
          </div>
          <Button
            onClick={() => {
              setFormData({ id: "", name: "", address: "", contact: "" });
              setShowAddDialog(true);
            }}
            className="bg-gray-900 hover:bg-black text-white gap-2"
          >
            <Plus className="h-4 w-4" />
            Добавить точку
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {locations.length === 0 ? (
            <div className="md:col-span-2">
              <Card className="shadow-sm border border-gray-100">
                <CardContent className="flex flex-col items-center justify-center p-10">
                  <MapPin className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Нет точек продаж</h3>
                  <p className="text-gray-500 text-center mb-6">
                    Добавьте вашу первую точку продажи, чтобы начать учет товаров
                  </p>
                  <Button
                    onClick={() => {
                      setFormData({ id: "", name: "", address: "", contact: "" });
                      setShowAddDialog(true);
                    }}
                  >
                    Добавить точку
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            locations.map((location) => (
              <Card key={location.id} className="shadow-sm border border-gray-100">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium">{location.name}</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500"
                        onClick={() => handleEditClick(location)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500"
                        onClick={() => handleDeleteClick(location)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Separator className="my-3" />
                  <div className="space-y-2 mt-4">
                    {location.address && (
                      <div>
                        <p className="text-sm text-gray-500">Адрес</p>
                        <p>{location.address}</p>
                      </div>
                    )}
                    {location.contact && (
                      <div>
                        <p className="text-sm text-gray-500">Контакт</p>
                        <p>{location.contact}</p>
                      </div>
                    )}
                    {!location.address && !location.contact && (
                      <p className="text-gray-500 italic">Нет дополнительной информации</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </motion.div>
      </div>

      {/* Add Location Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Добавить точку продажи</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="name">Название *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Название точки продажи"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="address">Адрес</Label>
              <Input
                id="address"
                name="address"
                placeholder="Адрес (необязательно)"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="contact">Контакт</Label>
              <Input
                id="contact"
                name="contact"
                placeholder="Телефон или имя контактного лица (необязательно)"
                value={formData.contact}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleAddLocation}>Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Location Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Редактировать точку продажи</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="edit-name">Название *</Label>
              <Input
                id="edit-name"
                name="name"
                placeholder="Название точки продажи"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="edit-address">Адрес</Label>
              <Input
                id="edit-address"
                name="address"
                placeholder="Адрес (необязательно)"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="edit-contact">Контакт</Label>
              <Input
                id="edit-contact"
                name="contact"
                placeholder="Телефон или имя контактного лица (необязательно)"
                value={formData.contact}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleUpdateLocation}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Location Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтвердите удаление</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить точку продажи "{selectedLocation?.name}"? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteLocation}
              className="bg-red-500 hover:bg-red-600"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Locations;
