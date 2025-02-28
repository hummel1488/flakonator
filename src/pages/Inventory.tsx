
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Search, ArrowLeft, Filter, Database, Upload, FileText } from "lucide-react";
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
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useInventory } from "@/hooks/use-inventory";
import { useLocations } from "@/hooks/use-locations";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Helper function to normalize text for better matching
const normalizeText = (text: string) => {
  return text.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^\w\s]/gi, '');
};

// Common variations of column names
const NAME_VARIATIONS = ['название', 'наименование', 'товар', 'продукт', 'name', 'product', 'title', 'item'];
const SIZE_VARIATIONS = ['объем', 'размер', 'size', 'volume', 'capacity'];
const TYPE_VARIATIONS = ['тип', 'вид', 'type', 'category', 'kind'];
const LOCATION_VARIATIONS = ['точка', 'магазин', 'место', 'расположение', 'location', 'store', 'shop', 'place'];
const QUANTITY_VARIATIONS = ['количество', 'остаток', 'кол-во', 'колво', 'число', 'штук', 'quantity', 'amount', 'count', 'qty', 'pcs'];

const Inventory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { inventory, addProduct, loading, updateProductQuantity, importProducts } = useInventory();
  const { locations } = useLocations();
  const { isAdmin, isManager } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterSize, setFilterSize] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showStats, setShowStats] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importData, setImportData] = useState<string>("");
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [manualLocationId, setManualLocationId] = useState<string>("");

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    size: "5",
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
      size: "5",
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

  // Find the most likely column index based on header variations
  const findColumnIndex = (headers: string[], variations: string[]) => {
    for (const header of headers) {
      const normalizedHeader = normalizeText(header);
      for (const variation of variations) {
        if (normalizedHeader.includes(normalizeText(variation))) {
          return headers.indexOf(header);
        }
      }
    }
    return -1;
  };

  // Handle file upload for import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportData(content);
      parseImportData(content);
    };
    reader.readAsText(file);
  };

  // Parse imported data from CSV or other formats
  const parseImportData = (data: string) => {
    try {
      // This handles various formats including CSV, TSV, or even pasted data from Excel
      const lines = data.trim().split(/\r?\n/);
      
      if (lines.length <= 1) {
        throw new Error('Файл пуст или содержит только заголовок');
      }
      
      // Detect separator used in the file
      let separator = ',';
      const firstLine = lines[0];
      
      if (firstLine.includes('\t')) {
        separator = '\t';
      } else if (firstLine.includes(';')) {
        separator = ';';
      } else if (firstLine.split(',').length > 1) {
        separator = ',';
      } else {
        // If no common separator is found, try to detect based on pattern
        if (firstLine.match(/[^\w\s"']/)) {
          // Use the first non-alphanumeric character as separator
          separator = firstLine.match(/[^\w\s"']/)?.[0] || ',';
        }
      }
      
      console.log("Detected separator:", separator);
      console.log("First line:", firstLine);
      
      // Parse header line to find column indexes
      const headers = firstLine.split(separator).map(h => h.trim());
      console.log("Headers:", headers);
      
      // Try to find column indices based on variations
      const nameIndex = findColumnIndex(headers, NAME_VARIATIONS);
      const sizeIndex = findColumnIndex(headers, SIZE_VARIATIONS);
      const typeIndex = findColumnIndex(headers, TYPE_VARIATIONS);
      const locationIndex = findColumnIndex(headers, LOCATION_VARIATIONS);
      const quantityIndex = findColumnIndex(headers, QUANTITY_VARIATIONS);
      
      console.log("Column indices:", { nameIndex, sizeIndex, typeIndex, locationIndex, quantityIndex });
      
      // Check if we have at least the essential columns
      if (nameIndex === -1) {
        throw new Error('Не удалось найти столбец с названием товара');
      }
      
      if (quantityIndex === -1) {
        throw new Error('Не удалось найти столбец с количеством товара');
      }
      
      // Parse data lines
      const preview = [];
      for (let i = 1; i < Math.min(lines.length, 11); i++) {
        const line = lines[i].split(separator).map(item => item.trim());
        
        // Skip empty lines
        if (line.length <= 1 || !line[nameIndex]?.trim()) continue;
        
        const name = line[nameIndex]?.trim() || '';
        const size = line[sizeIndex] ? line[sizeIndex].trim() : '5';
        const type = line[typeIndex] ? line[typeIndex].trim() : 'perfume';
        
        // If location column exists, try to find by name, otherwise use manually selected location
        let locationId = manualLocationId;
        let locationName = '';
        
        if (locationIndex !== -1 && line[locationIndex]?.trim()) {
          const locationText = line[locationIndex].trim();
          const location = locations.find(loc => 
            normalizeText(loc.name).includes(normalizeText(locationText)) || 
            normalizeText(locationText).includes(normalizeText(loc.name))
          );
          
          if (location) {
            locationId = location.id;
            locationName = location.name;
          }
        }
        
        // If we don't have a location yet, use the selected manual location
        if (!locationId && manualLocationId) {
          locationId = manualLocationId;
          const location = locations.find(loc => loc.id === manualLocationId);
          locationName = location ? location.name : '';
        }
        
        // Parse quantity - search for first number in the quantity field
        let quantity = 0;
        if (quantityIndex !== -1) {
          const quantityText = line[quantityIndex];
          const match = quantityText.match(/\d+/);
          quantity = match ? parseInt(match[0], 10) : 0;
        }
        
        if (name && locationId) {
          preview.push({
            name,
            size: mapSize(size),
            type: mapType(type),
            locationId,
            locationName,
            quantity
          });
        }
      }
      
      setImportPreview(preview);
      
      if (preview.length === 0) {
        throw new Error('Не удалось найти данные для импорта');
      }
      
    } catch (error) {
      console.error("Error parsing import data:", error);
      toast({
        title: "Ошибка импорта",
        description: error instanceof Error ? error.message : "Не удалось разобрать данные из файла. Проверьте формат.",
        variant: "destructive",
      });
      setImportPreview([]);
    }
  };
  
  // Map size values from text to valid values
  const mapSize = (size: string): string => {
    const normalizedSize = normalizeText(size);
    
    if (normalizedSize.includes('автофлакон') || 
        normalizedSize.includes('авто') || 
        normalizedSize.includes('car') ||
        normalizedSize.includes('дифф')) {
      return 'car';
    }
    
    // Extract numbers from size string
    const match = size.match(/\d+/);
    if (match) {
      const num = parseInt(match[0], 10);
      if ([5, 16, 20, 25, 30].includes(num)) {
        return num.toString();
      }
    }
    
    return '5'; // Default fallback
  };
  
  // Map type values from text to valid values
  const mapType = (type: string): string => {
    const normalizedType = normalizeText(type);
    
    if (normalizedType.includes('парфюм') || 
        normalizedType.includes('духи') || 
        normalizedType.includes('аромат') || 
        normalizedType.includes('perfume')) {
      return 'perfume';
    }
    return 'other';
  };

  // Import all data
  const handleImportData = () => {
    try {
      if (importData.trim() === '' && importPreview.length === 0) {
        toast({
          title: "Ошибка",
          description: "Нет данных для импорта",
          variant: "destructive",
        });
        return;
      }
      
      // If we have a preview, use that directly
      if (importPreview.length > 0) {
        // Parse all lines, not just the preview
        const productsToImport = [...importPreview];
        
        // For files with more than 10 lines
        if (importData.trim() !== '') {
          const lines = importData.trim().split(/\r?\n/);
          
          // Detect separator
          let separator = ',';
          if (lines[0].includes('\t')) {
            separator = '\t';
          } else if (lines[0].includes(';')) {
            separator = ';';
          }
          
          // Parse header line
          const headers = lines[0].split(separator).map(h => h.trim());
          
          // Find column indices
          const nameIndex = findColumnIndex(headers, NAME_VARIATIONS);
          const sizeIndex = findColumnIndex(headers, SIZE_VARIATIONS);
          const typeIndex = findColumnIndex(headers, TYPE_VARIATIONS);
          const locationIndex = findColumnIndex(headers, LOCATION_VARIATIONS);
          const quantityIndex = findColumnIndex(headers, QUANTITY_VARIATIONS);
          
          // Only proceed if we found the required columns
          if (nameIndex !== -1 && quantityIndex !== -1) {
            // Start from line 11 (if we already have 10 in preview)
            for (let i = Math.min(lines.length, 11); i < lines.length; i++) {
              const line = lines[i].split(separator).map(item => item.trim());
              
              // Skip empty lines
              if (line.length <= 1 || !line[nameIndex]?.trim()) continue;
              
              const name = line[nameIndex]?.trim() || '';
              const size = line[sizeIndex] ? line[sizeIndex].trim() : '5';
              const type = line[typeIndex] ? line[typeIndex].trim() : 'perfume';
              
              // Handle location
              let locationId = manualLocationId;
              let locationName = '';
              
              if (locationIndex !== -1 && line[locationIndex]?.trim()) {
                const locationText = line[locationIndex].trim();
                const location = locations.find(loc => 
                  normalizeText(loc.name).includes(normalizeText(locationText)) || 
                  normalizeText(locationText).includes(normalizeText(loc.name))
                );
                
                if (location) {
                  locationId = location.id;
                  locationName = location.name;
                }
              }
              
              // If we don't have a location yet, use the selected manual location
              if (!locationId && manualLocationId) {
                locationId = manualLocationId;
                const location = locations.find(loc => loc.id === manualLocationId);
                locationName = location ? location.name : '';
              }
              
              // Parse quantity
              let quantity = 0;
              if (quantityIndex !== -1) {
                const quantityText = line[quantityIndex];
                const match = quantityText.match(/\d+/);
                quantity = match ? parseInt(match[0], 10) : 0;
              }
              
              if (name && locationId) {
                productsToImport.push({
                  name,
                  size: mapSize(size),
                  type: mapType(type),
                  locationId,
                  locationName,
                  quantity
                });
              }
            }
          }
        }
        
        // Import all products
        const importedCount = importProducts(productsToImport.map(({ locationName, ...product }) => product));
        
        toast({
          title: "Импорт завершен",
          description: `Успешно импортировано ${importedCount} товаров`,
        });
        
        setShowImportDialog(false);
        setImportData("");
        setImportPreview([]);
        setManualLocationId("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
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

  const openUpdateDialog = (product: any) => {
    setSelectedProduct(product);
    setUpdateFormData({ quantity: product.quantity });
    setShowUpdateDialog(true);
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

  // Calculate inventory statistics
  const calculateInventoryStats = () => {
    const sizeStats: Record<string, { count: number, value: number }> = {
      "5": { count: 0, value: 0 },
      "16": { count: 0, value: 0 },
      "20": { count: 0, value: 0 },
      "25": { count: 0, value: 0 },
      "30": { count: 0, value: 0 },
      "car": { count: 0, value: 0 },
    };

    // Price mapping for each size
    const prices: Record<string, number> = {
      "5": 500,
      "16": 1000,
      "20": 1300,
      "25": 1500,
      "30": 1800,
      "car": 500
    };

    inventory.forEach(item => {
      if (sizeStats[item.size]) {
        sizeStats[item.size].count += item.quantity;
        sizeStats[item.size].value += item.quantity * prices[item.size];
      }
    });

    const totalCount = Object.values(sizeStats).reduce((sum, stat) => sum + stat.count, 0);
    const totalValue = Object.values(sizeStats).reduce((sum, stat) => sum + stat.value, 0);

    return { sizeStats, totalCount, totalValue };
  };

  const stats = calculateInventoryStats();

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
                  <CardTitle>Статистика инвентаря</CardTitle>
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
                        <div className="text-2xl font-bold">{inventory.length} шт.</div>
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

      {/* Add product dialog */}
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
                    <SelectItem value="5">5 мл</SelectItem>
                    <SelectItem value="16">16 мл</SelectItem>
                    <SelectItem value="20">20 мл</SelectItem>
                    <SelectItem value="25">25 мл</SelectItem>
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
            <Button 
              onClick={handleAddProduct} 
              variant={isAdmin() ? "admin" : "manager"}
            >
              Добавить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update product dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Изменить количество</DialogTitle>
            <DialogDescription>
              Укажите новое количество товара
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-1">
                <p className="font-medium">{selectedProduct.name}</p>
                <p className="text-sm text-gray-500">
                  {getSizeLabel(selectedProduct.size)} • {getLocationName(selectedProduct.locationId)}
                </p>
              </div>
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
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>
              Отмена
            </Button>
            <Button 
              onClick={handleUpdateProduct} 
              variant={isAdmin() ? "admin" : "manager"}
            >
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import data dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Импорт инвентаря</DialogTitle>
            <DialogDescription>
              Загрузите файл с данными или укажите точку продажи для импорта
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="flex flex-col gap-3">
              <div>
                <Label htmlFor="manual-location" className="mb-2 block">Точка продажи для всех товаров</Label>
                <Select 
                  value={manualLocationId} 
                  onValueChange={setManualLocationId}
                >
                  <SelectTrigger id="manual-location">
                    <SelectValue placeholder="Выберите точку" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Использовать из файла</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  Если в файле нет информации о точке продажи, выберите её здесь
                </p>
              </div>
              
              <div className="flex items-center gap-4 mt-4">
                <div className="flex-1">
                  <Label htmlFor="file-upload">Загрузить файл (CSV, TSV, Excel)</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".csv,.tsv,.txt,.xls,.xlsx"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="text-sm text-gray-500 mt-2">
                <p className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Требуемый формат файла должен содержать столбцы:
                </p>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Название товара (обязательно)</li>
                  <li>Количество (обязательно)</li>
                  <li>Опционально: Точка продажи (или выберите выше)</li>
                  <li>Опционально: Объем (5, 16, 20, 25, 30 мл или Автофлакон)</li>
                  <li>Опционально: Тип (Парфюм или Другое)</li>
                </ul>
              </div>
            </div>

            {importPreview.length > 0 && (
              <div className="border rounded-md overflow-hidden">
                <div className="font-medium p-3 bg-gray-50 border-b">
                  Предпросмотр (первые 10 товаров):
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Название</TableHead>
                        <TableHead>Объем</TableHead>
                        <TableHead>Тип</TableHead>
                        <TableHead>Точка</TableHead>
                        <TableHead className="text-right">Количество</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importPreview.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{getSizeLabel(item.size)}</TableCell>
                          <TableCell>
                            {item.type === "perfume" ? "Парфюм" : "Другое"}
                          </TableCell>
                          <TableCell>{item.locationName}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Отмена
            </Button>
            <Button 
              onClick={handleImportData} 
              variant={isAdmin() ? "admin" : "manager"}
              disabled={importPreview.length === 0}
            >
              Импортировать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
