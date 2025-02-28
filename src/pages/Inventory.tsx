import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Search, ArrowLeft, Filter, Database, Upload, FileText, Trash2, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
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
  TableRow,
  TableFooter
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { Card, CardContent, CardTitle, CardHeader, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useInventory, ImportLogItem } from "@/hooks/use-inventory";
import { useLocations } from "@/hooks/use-locations";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tabs,
  TabsContent, 
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area"; 

const normalizeText = (text: string) => {
  return text.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^\w\s]/gi, '');
};

const NAME_VARIATIONS = ['название', 'наименование', 'товар', 'продукт', 'name', 'product', 'title', 'item'];
const SIZE_VARIATIONS = ['объем', 'размер', 'size', 'volume', 'capacity'];
const TYPE_VARIATIONS = ['тип', 'вид', 'type', 'category', 'kind'];
const LOCATION_VARIATIONS = ['точка', 'магазин', 'место', 'расположение', 'location', 'store', 'shop', 'place'];
const QUANTITY_VARIATIONS = ['количество', 'остаток', 'кол-во', 'колво', 'число', 'штук', 'quantity', 'amount', 'count', 'qty', 'pcs'];

const Inventory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { inventory, addProduct, loading, updateProductQuantity, importProducts, importFromCSV, deleteAllProducts, getSizeStatKey } = useInventory();
  const { locations } = useLocations();
  const { isAdmin, isManager } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterSize, setFilterSize] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showStats, setShowStats] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importData, setImportData] = useState<string>("");
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [fullImportData, setFullImportData] = useState<any[]>([]);
  const [manualLocationId, setManualLocationId] = useState<string>("");
  const [importResultLogs, setImportResultLogs] = useState<ImportLogItem[]>([]);
  const [importStats, setImportStats] = useState<any>(null);
  const [importTab, setImportTab] = useState<string>("upload");
  const [zeroNonExisting, setZeroNonExisting] = useState<boolean>(true);
  const [showImportResults, setShowImportResults] = useState<boolean>(false);

  console.log("Current manualLocationId:", manualLocationId);
  console.log("Available locations:", locations.map(loc => ({ id: loc.id, name: loc.name })));

  const [formData, setFormData] = useState({
    name: "",
    size: "5 мл",
    type: "perfume",
    location: "",
    quantity: 1,
  });

  const [updateFormData, setUpdateFormData] = useState({
    quantity: 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "quantity" ? parseInt(value) || 0 : value,
    });
  };

  const handleUpdateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setUpdateFormData({
      ...updateFormData,
      quantity: parseInt(value) || 0,
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
      size: "5 мл",
      type: "perfume",
      location: "",
      quantity: 1,
    });
  };

  const handleUpdateProduct = () => {
    if (!selectedProduct) return;

    updateProductQuantity(selectedProduct.id, updateFormData.quantity);

    toast({
      title: "Остаток обновлен",
      description: "Количество товара успешно обновлено",
    });

    setShowUpdateDialog(false);
    setSelectedProduct(null);
    setUpdateFormData({ quantity: 0 });
  };

  const handleDeleteAllProducts = () => {
    deleteAllProducts();
    
    toast({
      title: "Инвентарь очищен",
      description: "Все ароматы успешно удалены из инвентаря",
    });
    
    setShowDeleteAllDialog(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportData(content);
      setImportTab("preview");
      
      setImportResultLogs([]);
      setImportStats(null);
      setShowImportResults(false);
    };
    reader.readAsText(file);
  };

  const handleImportData = () => {
    try {
      if (!importData) {
        toast({
          title: "Ошибка",
          description: "Нет данных для импорта",
          variant: "destructive",
        });
        return;
      }
      
      if (!manualLocationId) {
        toast({
          title: "Ошибка",
          description: "Выберите точку продажи для импорта",
          variant: "destructive",
        });
        return;
      }
        
      console.log(`Importing data for location ${manualLocationId}, zero non-existing: ${zeroNonExisting}`);
      
      const result = importFromCSV(importData, manualLocationId, zeroNonExisting);
      
      setImportResultLogs(result.logs);
      setImportStats({
        importedCount: result.importedCount,
        skippedCount: result.skippedCount,
        newItemsCount: result.newItemsCount,
        updatedItemsCount: result.updatedItemsCount,
        zeroedItemsCount: result.zeroedItemsCount
      });
      
      setImportTab("results");
      setShowImportResults(true);
      
      toast({
        title: "Импорт завершен",
        description: `Успешно импортировано ${result.importedCount} товаров`,
      });
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error during import:", error);
      toast({
        title: "Ошибка импорта",
        description: error instanceof Error ? error.message : "Произошла ошибка при импорте данных",
        variant: "destructive",
      });
    }
  };

  const closeImportDialog = () => {
    setShowImportDialog(false);
    setImportData("");
    setImportPreview([]);
    setFullImportData([]);
    setManualLocationId("");
    setImportResultLogs([]);
    setImportStats(null);
    setShowImportResults(false);
    setImportTab("upload");
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openUpdateDialog = (product: any) => {
    setSelectedProduct(product);
    setUpdateFormData({ quantity: product.quantity });
    setShowUpdateDialog(true);
  };

  const getSizeLabel = (size: string) => {
    if (size === "Автофлакон" || size === "car") return "Автофлакон";
    return size.includes("мл") ? size : `${size} мл`;
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = filterLocation === "all" || item.locationId === filterLocation;
    const matchesSize = filterSize === "all" || getSizeStatKey(item.size) === filterSize;
    return matchesSearch && matchesLocation && matchesSize;
  });

  const getLocationName = (id: string) => {
    const location = locations.find(loc => loc.id === id);
    return location ? location.name : "Неизвестно";
  };

  const calculateInventoryStats = () => {
    const inventoryToCalculate = filterLocation === "all" 
      ? inventory 
      : inventory.filter(item => item.locationId === filterLocation);

    const sizeStats: Record<string, { count: number, value: number }> = {
      "5": { count: 0, value: 0 },
      "16": { count: 0, value: 0 },
      "20": { count: 0, value: 0 },
      "25": { count: 0, value: 0 },
      "30": { count: 0, value: 0 },
      "car": { count: 0, value: 0 },
    };

    const prices: Record<string, number> = {
      "5": 500,
      "16": 1000,
      "20": 1300,
      "25": 1500,
      "30": 1800,
      "car": 500
    };

    inventoryToCalculate.forEach(item => {
      const statKey = getSizeStatKey(item.size);
      
      if (sizeStats[statKey]) {
        sizeStats[statKey].count += item.quantity;
        const itemPrice = item.price || prices[statKey];
        sizeStats[statKey].value += item.quantity * itemPrice;
      } else {
        console.log(`Неизвестный размер: ${item.size} (ключ: ${statKey}) для товара: ${item.name}`);
      }
    });

    const totalCount = Object.values(sizeStats).reduce((sum, stat) => sum + stat.count, 0);
    const totalValue = Object.values(sizeStats).reduce((sum, stat) => sum + stat.value, 0);

    return { sizeStats, totalCount, totalValue };
  };

  const getLogTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const stats = calculateInventoryStats();

  const handleLocationChange = (locationId: string) => {
    console.log("Setting location to:", locationId);
    setManualLocationId(locationId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />
      <div className="p-6">
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
            <div className="flex gap-2">
              <Button
                onClick={() => setShowStats(!showStats)}
                variant="outline"
                className="gap-2"
              >
                <Database className="h-4 w-4" />
                {showStats ? "Скрыть статистику" : "Показать статистику"}
              </Button>
              {isAdmin() && (
                <Button
                  onClick={() => setShowDeleteAllDialog(true)}
                  variant="destructive"
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Удалить все
                </Button>
              )}
              {(isAdmin() || isManager()) && (
                <>
                  <Button
                    onClick={() => setShowImportDialog(true)}
                    variant="outline"
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Импорт
                  </Button>
                  <Button
                    onClick={() => setShowAddDialog(true)}
                    variant={isAdmin() ? "admin" : "manager"}
                    className="gap-2"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Добавить товар
                  </Button>
                </>
              )}
            </div>
          </motion.div>

          {showStats && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="shadow-md border border-gray-100 bg-white">
                <CardHeader>
                  <CardTitle>Статистика инвентаря {filterLocation !== "all" && `- ${getLocationName(filterLocation)}`}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="shadow-sm">
                      <CardContent className="p-4">
                        <div className="text-sm text-gray-500 mb-1">Общее количество</div>
                        <div className="text-2xl font-bold">{stats.totalCount} шт.</div>
                      </CardContent>
                    </Card>
                    <Card className="shadow-sm">
                      <CardContent className="p-4">
                        <div className="text-sm text-gray-500 mb-1">Общая стоимость</div>
                        <div className="text-2xl font-bold">{stats.totalValue.toLocaleString()} ₽</div>
                      </CardContent>
                    </Card>
                    <Card className="shadow-sm">
                      <CardContent className="p-4">
                        <div className="text-sm text-gray-500 mb-1">Количество наименований</div>
                        <div className="text-2xl font-bold">{filteredInventory.length} шт.</div>
                      </CardContent>
                    </Card>
                  </div>

                  <Separator className="my-6" />

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(stats.sizeStats).map(([size, { count, value }]) => (
                      <Card key={size} className="shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <div className="text-sm font-medium">{getSizeLabel(size)}</div>
                            <Badge variant="outline">{count} шт.</Badge>
                          </div>
                          <div className="text-right text-amber-600 font-semibold">
                            {value.toLocaleString()} ₽
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-md border border-gray-100 p-6 mb-6"
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
                    <SelectItem value="25">25 мл</SelectItem>
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
            className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden"
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
                    {(isAdmin() || isManager()) && (
                      <TableHead className="text-right">Действия</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                        Загрузка...
                      </TableCell>
                    </TableRow>
                  ) : filteredInventory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-gray-500">
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
                          <Badge className={`font-medium ${item.quantity > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            {item.quantity}
                          </Badge>
                        </TableCell>
                        {(isAdmin() || isManager()) && (
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openUpdateDialog(item)}
                            >
                              Изменить
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </motion.div>
        </div>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
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
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleAddProduct}>Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Обновить количество</DialogTitle>
            <DialogDescription>
              {selectedProduct && (
                <>
                  {selectedProduct.name} ({getSizeLabel(selectedProduct.size)})
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
            <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleUpdateProduct}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить все товары?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить все товары из инвентаря? Это действие невозможно отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAllProducts} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Удалить все
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showImportDialog} onOpenChange={closeImportDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Импорт товаров</DialogTitle>
            <DialogDescription>
              Загрузите файл CSV для импорта товаров
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={importTab} onValueChange={setImportTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">Загрузка файла</TabsTrigger>
              <TabsTrigger value="preview" disabled={!importData}>Предпросмотр</TabsTrigger>
              <TabsTrigger value="results" disabled={!showImportResults}>Результаты</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="pt-4">
              <div className="grid gap-6">
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="file-upload">Выберите CSV-файл</Label>
                  <Input 
                    id="file-upload" 
                    type="file" 
                    accept=".csv,.txt" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Поддерживаемые форматы: CSV, TXT с разделителями (запятая, точка с запятой или табуляция)
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="import-location">Точка продажи</Label>
                  <Select 
                    value={manualLocationId} 
                    onValueChange={handleLocationChange}
                  >
                    <SelectTrigger id="import-location">
                      <SelectValue placeholder="Выберите точку продажи" />
                    </SelectTrigger>
                    <SelectContent className="z-[9999] bg-white">
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="zero-existing" 
                    checked={zeroNonExisting}
                    onCheckedChange={(checked) => setZeroNonExisting(checked as boolean)}
                  />
                  <Label htmlFor="zero-existing">
                    Обнулить остатки товаров, отсутствующих в файле импорта
                  </Label>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Требования к формату</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Первая строка должна содержать заголовки колонок</li>
                      <li>Обязательные колонки: <strong>Название</strong> и <strong>Остаток</strong></li>
                      <li>Колонка <strong>Объем</strong> опциональна (по умолчанию "5 мл")</li>
                      <li>Поддерживаемые объемы: 5 мл, 16 мл, 20 мл, 25 мл, 30 мл, Автофлакон</li>
                      <li>Остаток должен быть числом больше нуля</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="pt-4">
              <div className="grid gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Предпросмотр импорта</CardTitle>
                    <CardDescription>
                      Проверьте правильность данных перед импортом
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-gray-50 p-4 rounded-md overflow-auto max-h-[200px]">
                      {importData.slice(0, 500)}
                      {importData.length > 500 && '...'}
                    </pre>
                  </CardContent>
                  <CardFooter>
                    <p className="text-sm text-gray-500">
                      Файл будет импортирован в локацию: <strong>{
                        getLocationName(manualLocationId)
                      }</strong>
                    </p>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="results" className="pt-4">
              {importStats && (
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Результаты импорта</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="bg-green-50 p-3 rounded-md">
                          <div className="text-sm text-green-700">Импортировано</div>
                          <div className="text
