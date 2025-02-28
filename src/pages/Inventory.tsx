
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Search, ArrowLeft, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useInventory } from "@/hooks/use-inventory";
import { useLocations } from "@/hooks/use-locations";

const Inventory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { inventory, addProduct, loading } = useInventory();
  const { locations } = useLocations();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterSize, setFilterSize] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    size: "5",
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

  const handleAddProduct = () => {
    if (!formData.name.trim() || !formData.location) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    addProduct({
      id: Date.now().toString(),
      name: formData.name,
      size: formData.size,
      type: formData.type,
      locationId: formData.location,
      quantity: formData.quantity,
    });

    toast({
      title: "Продукт добавлен",
      description: "Новый продукт успешно добавлен в инвентарь",
    });

    setShowAddDialog(false);
    setFormData({
      name: "",
      size: "5",
      type: "perfume",
      location: "",
      quantity: 1,
    });
  };

  const getSizeLabel = (size: string) => {
    return size === "car" ? "Автофлакон" : `${size} мл`;
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = filterLocation === "all" || item.locationId === filterLocation;
    const matchesSize = filterSize === "all" || item.size === filterSize;
    return matchesSearch && matchesLocation && matchesSize;
  });

  // Get location name by ID
  const getLocationName = (id: string) => {
    const location = locations.find(loc => loc.id === id);
    return location ? location.name : "Неизвестно";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
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
            <h1 className="text-2xl font-medium">Инвентарь</h1>
          </div>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-gray-900 hover:bg-black text-white gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Добавить товар
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">Поиск</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Поиск по названию..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-64">
              <Label htmlFor="location-filter">Точка продажи</Label>
              <Select
                value={filterLocation}
                onValueChange={(value) => setFilterLocation(value)}
              >
                <SelectTrigger id="location-filter" className="w-full">
                  <SelectValue placeholder="Все точки" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все точки</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="size-filter">Объем</Label>
              <Select
                value={filterSize}
                onValueChange={(value) => setFilterSize(value)}
              >
                <SelectTrigger id="size-filter" className="w-full">
                  <SelectValue placeholder="Все размеры" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все размеры</SelectItem>
                  <SelectItem value="5">5 мл</SelectItem>
                  <SelectItem value="16">16 мл</SelectItem>
                  <SelectItem value="20">20 мл</SelectItem>
                  <SelectItem value="30">30 мл</SelectItem>
                  <SelectItem value="car">Автофлакон</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Название</TableHead>
                  <TableHead>Объем</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Точка продажи</TableHead>
                  <TableHead className="text-right">Количество</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                      Загрузка...
                    </TableCell>
                  </TableRow>
                ) : filteredInventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                      {searchTerm || filterLocation !== "all" || filterSize !== "all"
                        ? "Нет товаров, соответствующих фильтрам"
                        : "Нет товаров в инвентаре. Добавьте товар, нажав кнопку выше."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{getSizeLabel(item.size)}</TableCell>
                      <TableCell>
                        {item.type === "perfume" ? "Парфюм" : "Другое"}
                      </TableCell>
                      <TableCell>{getLocationName(item.locationId)}</TableCell>
                      <TableCell className="text-right">
                        <span className={`font-medium ${item.quantity > 0 ? "text-green-600" : "text-red-600"}`}>
                          {item.quantity}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Добавить товар</DialogTitle>
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
                    <SelectItem value="5">5 мл</SelectItem>
                    <SelectItem value="16">16 мл</SelectItem>
                    <SelectItem value="20">20 мл</SelectItem>
                    <SelectItem value="30">30 мл</SelectItem>
                    <SelectItem value="car">Автофлакон</SelectItem>
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
                    {locations.length === 0 ? (
                      <SelectItem value="" disabled>
                        Нет доступных точек
                      </SelectItem>
                    ) : (
                      locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))
                    )}
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
                  value={formData.quantity}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleAddProduct}>Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
