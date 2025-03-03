
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  PlusCircle, 
  Search, 
  ArrowLeft, 
  Database, 
  Upload, 
  FileText, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Package,
  MoreVertical,
  Menu
} from "lucide-react";
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
  TableMobileCard,
  TableMobileField
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
import { 
  Card, 
  CardContent, 
  CardTitle, 
  CardHeader, 
  CardDescription, 
  CardFooter,
  CardGrid
} from "@/components/ui/card";
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
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";

const normalizePerfumeName = (text: string) => {
  return text.toLowerCase()
    .trim()
    .replace(/\s+/g, '') // Remove all spaces
    .replace(/[^\w\s]/gi, ''); // Remove special characters
};

const NAME_VARIATIONS = ['название', 'наименование', 'товар', 'продукт', 'name', 'product', 'title', 'item'];
const SIZE_VARIATIONS = ['объем', 'размер', 'size', 'volume', 'capacity'];
const TYPE_VARIATIONS = ['тип', 'вид', 'type', 'category', 'kind'];
const LOCATION_VARIATIONS = ['точка', 'магазин', 'место', 'расположение', 'location', 'store', 'shop', 'place'];
const QUANTITY_VARIATIONS = ['количество', 'остаток', 'кол-во', 'колво', 'число', 'штук', 'quantity', 'amount', 'count', 'qty', 'pcs'];

const PRICES: Record<string, number> = {
  "5": 500,
  "16": 1000,
  "20": 1300,
  "25": 1500,
  "30": 1800,
  "car": 500
};

const Inventory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { inventory, addProduct, loading, updateProductQuantity, importProducts, importFromCSV, deleteAllProducts, getSizeStatKey } = useInventory();
  const { locations } = useLocations();
  const { isAdmin, isManager } = useAuth();
  const { isMobile, screenWidth } = useIsMobile();
  
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
  
  useEffect(() => {
    if (locations.length > 0 && !manualLocationId) {
      setManualLocationId(locations[0].id);
    }
  }, [locations]);

  useEffect(() => {
    console.log("Available locations for import:", locations.map(loc => ({ id: loc.id, name: loc.name })));
  }, [locations]);

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
    
    const cleanSize = size.replace(/\s*мл\s*/i, "").trim();
    return `${cleanSize} мл`;
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

    const prices: Record<string, number> = PRICES;

    const uniquePerfumeNames = new Set<string>();

    inventoryToCalculate.forEach(item => {
      uniquePerfumeNames.add(normalizePerfumeName(item.name));
      
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
    const uniqueNamesCount = uniquePerfumeNames.size;

    return { sizeStats, totalCount, totalValue, uniqueNamesCount };
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

  const openImportDialog = () => {
    console.log("Opening import dialog, available locations:", locations);
    if (locations.length > 0) {
      setManualLocationId(locations[0].id);
    }
    setShowImportDialog(true);
  };

  const StatCard = ({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) => (
    <Card className="shadow-sm">
      <CardContent className="p-4 flex items-center space-x-4">
        <div className="text-primary w-10 h-10 flex items-center justify-center rounded-full bg-primary/10">
          {icon}
        </div>
        <div>
          <div className="text-sm text-gray-500 mb-1">{title}</div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />
      <div className="p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${isMobile ? 'flex-col' : 'items-center'} justify-between mb-6 sm:mb-8 gap-4`}
          >
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl sm:text-2xl font-medium truncate">Инвентарь</h1>
            </div>
            
            {isMobile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="ml-auto">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Действия</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowStats(!showStats)}>
                    <Database className="h-4 w-4 mr-2" />
                    {showStats ? "Скрыть статистику" : "Показать статистику"}
                  </DropdownMenuItem>
                  
                  {(isAdmin() || isManager()) && (
                    <>
                      <DropdownMenuItem onClick={() => setShowAddDialog(true)}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Добавить товар
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={openImportDialog}>
                        <Upload className="h-4 w-4 mr-2" />
                        Импорт
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  {isAdmin() && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive" 
                        onClick={() => setShowDeleteAllDialog(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Удалить все
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
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
                      onClick={openImportDialog}
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
            )}
          </motion.div>

          {showStats && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 sm:mb-8 space-y-4 sm:space-y-6"
            >
              <Card className="shadow-md border border-gray-100 bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg sm:text-xl md:text-2xl">
                    Статистика инвентаря {filterLocation !== "all" && `- ${getLocationName(filterLocation)}`}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <StatCard 
                      title="Общее количество"
                      value={`${stats.totalCount} шт.`}
                      icon={<Package className="h-5 w-5" />}
                    />
                    
                    <StatCard 
                      title="Общая стоимость"
                      value={`${stats.totalValue.toLocaleString()} ₽`}
                      icon={<Database className="h-5 w-5" />}
                    />
                    
                    <StatCard 
                      title="Количество наименований"
                      value={`${stats.uniqueNamesCount} шт.`}
                      icon={<FileText className="h-5 w-5" />}
                    />
                  </div>

                  <Separator className="my-4 sm:my-6" />

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {Object.entries(stats.sizeStats).map(([size, { count, value }]) => (
                      <Card key={size} className="shadow-sm">
                        <CardContent className="p-3 sm:p-4">
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
            className="bg-white rounded-lg shadow-md border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6"
          >
            <div className="flex flex-col gap-4">
              <div className="w-full">
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
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
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
                
                <div>
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
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden"
          >
            {isMobile ? (
              <div className="p-4">
                {loading ? (
                  <div className="text-center py-10 text-gray-500">
                    Загрузка...
                  </div>
                ) : filteredInventory.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    {searchTerm || filterLocation !== "all" || filterSize !== "all"
                      ? "Нет товаров, соответствующих фильтрам"
                      : "Нет товаров в инвентаре. Добавьте товар, нажав кнопку выше."}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredInventory.map((item) => (
                      <TableMobileCard key={item.id}>
                        <div className="font-medium text-base mb-3">{item.name}</div>
                        <TableMobileField label="Объем">
                          {getSizeLabel(item.size)}
                        </TableMobileField>
                        <TableMobileField label="Тип">
                          {item.type === "perfume" ? "Парфюм" : "Другое"}
                        </TableMobileField>
                        <TableMobileField label="Точка продажи">
                          {getLocationName(item.locationId)}
                        </TableMobileField>
                        <TableMobileField 
                          label="Количество" 
                          badgeValue 
                          badgePositive={item.quantity > 0}
                        >
                          {item.quantity}
                        </TableMobileField>
                        
                        {(isAdmin() || isManager()) && (
                          <div className="mt-3 pt-3 border-t flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openUpdateDialog(item)}
                            >
                              Изменить
                            </Button>
                          </div>
                        )}
                      </TableMobileCard>
                    ))}
                  </div>
                )}
              </div>
            ) : (
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
            )}
          </motion.div>
        </div>
      </div>

      {/* Add Product Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px] max-w-[90vw]">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <DialogFooter className={isMobile ? "flex-col space-y-2" : undefined}>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} className={isMobile ? "w-full" : undefined}>
              Отмена
            </Button>
            <Button onClick={handleAddProduct} className={isMobile ? "w-full" : undefined}>Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Quantity Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent className="sm:max-w-[425px] max-w-[90vw]">
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
          <DialogFooter className={isMobile ? "flex-col space-y-2" : undefined}>
            <Button variant="outline" onClick={() => setShowUpdateDialog(false)} className={isMobile ? "w-full" : undefined}>
              Отмена
            </Button>
            <Button onClick={handleUpdateProduct} className={isMobile ? "w-full" : undefined}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete All Confirmation Dialog */}
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

      {/* Import Dialog */}
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
                
                {locations.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor="import-location">Точка продажи</Label>
                    <Select 
                      value={manualLocationId} 
                      onValueChange={handleLocationChange}
                    >
                      <SelectTrigger id="import-location">
                        <SelectValue placeholder="Выберите точку продажи" />
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
                ) : (
                  <div className="text-red-500 p-4 bg-red-50 rounded-md">
                    Ошибка: Нет доступных точек продаж. Пожалуйста, добавьте точки продаж перед импортом.
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="zero-existing" 
                    checked={zeroNonExisting}
                    onCheckedChange={(checked) => setZeroNonExisting(!!checked)}
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
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-2">
                  <Label>Предпросмотр данных</Label>
                  <div className="border rounded-md p-4 bg-gray-50 min-h-[200px] max-h-[400px] overflow-auto">
                    <pre className="text-xs whitespace-pre-wrap font-mono">
                      {importData ? importData.slice(0, 1000) + (importData.length > 1000 ? '...' : '') : 'Нет данных для просмотра'}
                    </pre>
                  </div>
                </div>
                
                <div className="border-t pt-4 flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setImportTab("upload")}
                  >
                    Назад
                  </Button>
                  <Button onClick={handleImportData}>
                    Импортировать данные
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="results" className="pt-4">
              {importStats && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Результаты импорта</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="border rounded-md p-4 text-center">
                          <div className="text-sm text-gray-500 mb-1">Всего обработано</div>
                          <div className="text-xl font-bold">
                            {importStats.importedCount + importStats.skippedCount} строк
                          </div>
                        </div>
                        <div className="border rounded-md p-4 text-center">
                          <div className="text-sm text-gray-500 mb-1">Успешно импортировано</div>
                          <div className="text-xl font-bold text-green-600">
                            {importStats.importedCount} товаров
                          </div>
                        </div>
                        <div className="border rounded-md p-4 text-center">
                          <div className="text-sm text-gray-500 mb-1">Пропущено</div>
                          <div className="text-xl font-bold text-amber-600">
                            {importStats.skippedCount} строк
                          </div>
                        </div>
                        <div className="border rounded-md p-4 text-center">
                          <div className="text-sm text-gray-500 mb-1">Новых товаров</div>
                          <div className="text-xl font-bold text-blue-600">
                            {importStats.newItemsCount} шт.
                          </div>
                        </div>
                        <div className="border rounded-md p-4 text-center">
                          <div className="text-sm text-gray-500 mb-1">Обновлено товаров</div>
                          <div className="text-xl font-bold text-purple-600">
                            {importStats.updatedItemsCount} шт.
                          </div>
                        </div>
                        <div className="border rounded-md p-4 text-center">
                          <div className="text-sm text-gray-500 mb-1">Обнулено товаров</div>
                          <div className="text-xl font-bold text-red-600">
                            {importStats.zeroedItemsCount} шт.
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Журнал импорта</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px] rounded border">
                        <div className="p-4 space-y-2">
                          {importResultLogs.length > 0 ? (
                            importResultLogs.map((log, index) => (
                              <div 
                                key={index} 
                                className={`flex items-start gap-2 p-2 rounded text-sm ${
                                  log.type === 'success' 
                                    ? 'bg-green-50' 
                                    : log.type === 'warning' 
                                    ? 'bg-amber-50' 
                                    : 'bg-red-50'
                                }`}
                              >
                                <div className="mt-0.5">{getLogTypeIcon(log.type)}</div>
                                <div>
                                  <div className={`font-medium ${
                                    log.type === 'success' 
                                      ? 'text-green-700' 
                                      : log.type === 'warning' 
                                      ? 'text-amber-700' 
                                      : 'text-red-700'
                                  }`}>
                                    {log.message}
                                  </div>
                                  {log.details && (
                                    <div className="text-xs mt-1 text-gray-500">
                                      {typeof log.details === 'object' 
                                        ? JSON.stringify(log.details) 
                                        : String(log.details)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              Нет доступных логов импорта
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                  
                  <div className="border-t pt-4 flex justify-end">
                    <Button onClick={closeImportDialog}>
                      Закрыть
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
