
import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Search, ArrowLeft, Filter, Database, Upload, FileText, Trash2, AlertTriangle, CheckCircle, XCircle, TrendingUp, TrendingDown, Package } from "lucide-react";
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
  TableFooter,
  ResponsiveTable
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
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
import { useInventory, ImportLogItem, Product } from "@/hooks/use-inventory";
import { useLocations } from "@/hooks/use-locations";
import { useAuth } from "@/contexts/AuthContext";
import { useSales, SaleItem } from "@/hooks/use-sales";
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
import { Progress } from "@/components/ui/progress";
import { ProductRecommendations } from "@/components/ProductRecommendations";
import { StatCard } from "@/components/StatCard";
import { LowStockAlert } from "@/components/LowStockAlert";

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
  const { sales, loading: salesLoading } = useSales();
  
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
  
  // Revenue calculation data
  const PRICES: Record<string, number> = {
    "5": 500,
    "5 мл": 500,
    "16": 1000,
    "16 мл": 1000,
    "20": 1300,
    "20 мл": 1300,
    "25": 1500,
    "25 мл": 1500,
    "30": 1800,
    "30 мл": 1800,
    "car": 500,
    "Автофлакон": 500
  };
  
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

  // Weekly and monthly sales data calculation
  const currentDate = new Date();
  
  const weeklySalesData = useMemo(() => {
    // Calculate dates for current and previous periods
    const oneWeekAgo = new Date(currentDate);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const twoWeeksAgo = new Date(oneWeekAgo);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 7);
    
    // Filter sales for the current location if one is selected
    const locationSales = filterLocation !== "all" 
      ? sales.filter(sale => sale.locationId === filterLocation)
      : sales;
    
    // Last week sales (last 7 days)
    const lastWeekSales = locationSales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= oneWeekAgo && saleDate <= currentDate;
    });
    
    // Previous week sales (7 days before last week)
    const previousWeekSales = locationSales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= twoWeeksAgo && saleDate < oneWeekAgo;
    });
    
    return { lastWeekSales, previousWeekSales, oneWeekAgo, twoWeeksAgo };
  }, [sales, filterLocation, currentDate]);
  
  const { lastWeekSales, previousWeekSales, oneWeekAgo, twoWeeksAgo } = weeklySalesData;
  
  const monthlySalesData = useMemo(() => {
    // Calculate dates for current and previous months
    const oneMonthAgo = new Date(currentDate);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const twoMonthsAgo = new Date(oneMonthAgo);
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 1);
    
    // Filter sales for the current location if one is selected
    const locationSales = filterLocation !== "all" 
      ? sales.filter(sale => sale.locationId === filterLocation)
      : sales;
    
    // Current month sales
    const currentMonthSales = locationSales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= oneMonthAgo && saleDate <= currentDate;
    });
    
    // Previous month sales
    const previousMonthSales = locationSales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= twoMonthsAgo && saleDate < oneMonthAgo;
    });
    
    // Calculate revenue for each period
    const currentMonthRevenue = currentMonthSales.reduce((total, sale) => {
      return total + sale.items.reduce((subtotal, item) => {
        const sizeKey = getSizeStatKey(item.size);
        const price = item.price || PRICES[sizeKey] || 0;
        return subtotal + (item.quantity * price);
      }, 0);
    }, 0);
    
    const previousMonthRevenue = previousMonthSales.reduce((total, sale) => {
      return total + sale.items.reduce((subtotal, item) => {
        const sizeKey = getSizeStatKey(item.size);
        const price = item.price || PRICES[sizeKey] || 0;
        return subtotal + (item.quantity * price);
      }, 0);
    }, 0);
    
    // Calculate change percentage
    const revenueDifference = currentMonthRevenue - previousMonthRevenue;
    const revenueChangePercent = previousMonthRevenue > 0 
      ? (revenueDifference / previousMonthRevenue) * 100 
      : 0;
    
    return {
      currentMonthRevenue,
      previousMonthRevenue,
      revenueChangePercent
    };
  }, [sales, filterLocation, currentDate, getSizeStatKey]);
  
  // Product recommendations
  const productRecommendations = useMemo(() => {
    if (filterLocation === "all" || salesLoading || !lastWeekSales || !previousWeekSales) {
      return [];
    }
    
    // Find products with significant sales and look for trends
    const oneMonthAgo = new Date(currentDate);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    // Get last 30 days sales for this location
    const lastMonthSales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return sale.locationId === filterLocation && 
        saleDate >= oneMonthAgo && 
        saleDate <= currentDate;
    });
    
    // Group by product name and calculate total sales
    const productSales = new Map();
    
    lastMonthSales.forEach(sale => {
      sale.items.forEach(item => {
        const key = `${item.name}-${item.size}`;
        if (!productSales.has(key)) {
          productSales.set(key, {
            name: item.name,
            size: item.size,
            totalQuantity: 0,
            weeklyQuantity: 0,
            previousWeekQuantity: 0,
            revenue: 0
          });
        }
        
        const saleDate = new Date(sale.date);
        const product = productSales.get(key);
        const sizeKey = getSizeStatKey(item.size);
        const price = item.price || PRICES[sizeKey] || 0;
        
        // Add to total quantity
        product.totalQuantity += item.quantity;
        product.revenue += item.quantity * price;
        
        // Check if sale was in the last week
        if (saleDate >= oneWeekAgo) {
          product.weeklyQuantity += item.quantity;
        } 
        // Check if sale was in the previous week
        else if (saleDate >= twoWeeksAgo && saleDate < oneWeekAgo) {
          product.previousWeekQuantity += item.quantity;
        }
      });
    });
    
    // Convert to array and sort by total quantity
    const sortedProducts = Array.from(productSales.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity);
    
    // Calculate growth percentage for each product
    const productsWithGrowth = sortedProducts.map(product => {
      let growthPercentage = 0;
      if (product.previousWeekQuantity > 0) {
        const difference = product.weeklyQuantity - product.previousWeekQuantity;
        growthPercentage = (difference / product.previousWeekQuantity) * 100;
      } else if (product.weeklyQuantity > 0) {
        growthPercentage = 100; // New product that didn't sell before
      }
      
      // Current inventory for this product at this location
      const inventoryItem = inventory.find(item => 
        item.name === product.name && 
        item.size === product.size && 
        item.locationId === filterLocation
      );
      
      const currentStock = inventoryItem ? inventoryItem.quantity : 0;
      const isLowStock = currentStock <= 2; // Define low stock as 2 or fewer items
      
      // Check if this is a trending product (significant growth)
      const isTrending = growthPercentage >= 30;
      
      // Check if this is a bestseller
      const isBestseller = product.totalQuantity >= 5;
      
      return {
        ...product,
        growthPercentage,
        currentStock,
        isLowStock,
        isTrending,
        isBestseller
      };
    });
    
    // Filter to products that are: trending OR bestsellers OR low in stock
    const recommendedProducts = productsWithGrowth.filter(product => 
      product.isTrending || product.isBestseller || product.isLowStock
    );
    
    // Return top 5 products
    return recommendedProducts.slice(0, 5);
  }, [sales, filterLocation, inventory, lastWeekSales, previousWeekSales, currentDate, getSizeStatKey, oneWeekAgo, twoWeeksAgo]);
  
  // Low stock products
  const lowStockProducts = useMemo(() => {
    if (filterLocation === "all") {
      return [];
    }
    
    // Get products for the selected location
    const locationProducts = inventory.filter(item => item.locationId === filterLocation);
    
    // Find products with low stock (2 or fewer)
    const lowStock = locationProducts
      .filter(item => item.quantity <= 2)
      .sort((a, b) => a.quantity - b.quantity); // Sort by quantity ascending
    
    return lowStock;
  }, [inventory, filterLocation]);
  
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

    const prices: Record<string, number> = PRICES;

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

  const openImportDialog = () => {
    console.log("Opening import dialog, available locations:", locations);
    if (locations.length > 0) {
      setManualLocationId(locations[0].id);
    }
    setShowImportDialog(true);
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
          </motion.div>

          {showStats && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 space-y-6"
            >
              <Card className="shadow-md border border-gray-100 bg-white" gradient>
                <CardHeader>
                  <CardTitle>Статистика инвентаря {filterLocation !== "all" && `- ${getLocationName(filterLocation)}`}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard 
                      title="Общее количество"
                      value={`${stats.totalCount} шт.`}
                      icon={<Package className="h-5 w-5 text-blue-500" />}
                    />
                    
                    <StatCard 
                      title="Общая стоимость"
                      value={`${stats.totalValue.toLocaleString()} ₽`}
                      icon={<Database className="h-5 w-5 text-amber-500" />}
                    />
                    
                    <StatCard 
                      title="Количество наименований"
                      value={`${filteredInventory.length} шт.`}
                      icon={<FileText className="h-5 w-5 text-purple-500" />}
                    />
                  </div>

                  {!salesLoading && filterLocation !== "all" && (
                    <>
                      <Separator className="my-6" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Выручка за текущий месяц</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex justify-between items-center">
                              <div className="text-2xl font-bold">
                                {monthlySalesData.currentMonthRevenue.toLocaleString()} ₽
                              </div>
                              <div className={`flex items-center gap-1 text-sm font-medium ${
                                monthlySalesData.revenueChangePercent >= 0 
                                  ? 'text-green-600' 
                                  : 'text-red-600'
                              }`}>
                                {monthlySalesData.revenueChangePercent >= 0 ? (
                                  <TrendingUp className="h-4 w-4" />
                                ) : (
                                  <TrendingDown className="h-4 w-4" />
                                )}
                                {Math.abs(monthlySalesData.revenueChangePercent).toFixed(1)}%
                              </div>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              По сравнению с {monthlySalesData.previousMonthRevenue.toLocaleString()} ₽ в прошлом месяце
                            </div>

                            <Progress 
                              className="h-2 mt-4" 
                              value={
                                monthlySalesData.previousMonthRevenue > 0 
                                  ? (monthlySalesData.currentMonthRevenue / monthlySalesData.previousMonthRevenue) * 100 
                                  : 100
                              }
                              indicatorClassName={monthlySalesData.revenueChangePercent >= 0 
                                ? "bg-green-500" 
                                : "bg-red-500"
                              }
                            />
                          </CardContent>
                        </Card>

                        {lowStockProducts.length > 0 && (
                          <LowStockAlert products={lowStockProducts} getLocationName={getLocationName} />
                        )}
                      </div>
                    </>
                  )}

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
                          <Progress 
                            className="h-1.5 mt-2" 
                            value={Math.min(100, (count / Math.max(stats.totalCount, 1)) * 300)} 
                            indicatorClassName="bg-amber-500"
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {filterLocation !== "all" && productRecommendations.length > 0 && (
                <ProductRecommendations products={productRecommendations} locationName={getLocationName(filterLocation)} />
              )}
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
            <ResponsiveTable>
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
                        Ничего не найдено
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{getSizeLabel(item.size)}</TableCell>
                        <TableCell>
                          {item.type === "perfume" ? "Парфюм" : item.type === "cosmetics" ? "Косметика" : item.type}
                        </TableCell>
                        <TableCell>{getLocationName(item.locationId)}</TableCell>
                        <TableCell className="text-right">
                          <span
                            className={
                              item.quantity <= 2
                                ? "text-red-600 font-bold"
                                : item.quantity <= 5
                                ? "text-amber-600 font-medium"
                                : ""
                            }
                          >
                            {item.quantity}
                          </span>
                        </TableCell>
                        {(isAdmin() || isManager()) && (
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
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
            </ResponsiveTable>
          </motion.div>
        </div>
      </div>

      {/* Add Product Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить товар</DialogTitle>
            <DialogDescription>
              Добавьте новый товар в инвентарь
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Название
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="size" className="text-right">
                Объем
              </Label>
              <Select
                value={formData.size}
                onValueChange={(value) => handleSelectChange("size", value)}
              >
                <SelectTrigger id="size" className="col-span-3">
                  <SelectValue placeholder="Выберите размер" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5 мл">5 мл</SelectItem>
                  <SelectItem value="16 мл">16 мл</SelectItem>
                  <SelectItem value="20 мл">20 мл</SelectItem>
                  <SelectItem value="25 мл">25 мл</SelectItem>
                  <SelectItem value="30 мл">30 мл</SelectItem>
                  <SelectItem value="car">Автофлакон</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Тип
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelectChange("type", value)}
              >
                <SelectTrigger id="type" className="col-span-3">
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="perfume">Парфюм</SelectItem>
                  <SelectItem value="cosmetics">Косметика</SelectItem>
                  <SelectItem value="accessories">Аксессуары</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Точка продажи
              </Label>
              <Select
                value={formData.location}
                onValueChange={(value) => handleSelectChange("location", value)}
              >
                <SelectTrigger id="location" className="col-span-3">
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Количество
              </Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min={0}
                value={formData.quantity}
                onChange={handleInputChange}
                className="col-span-3"
              />
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

      {/* Update Product Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Обновить количество</DialogTitle>
            <DialogDescription>
              {selectedProduct && `${selectedProduct.name} (${getSizeLabel(selectedProduct.size)})`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="update-quantity" className="text-right">
                Количество
              </Label>
              <Input
                id="update-quantity"
                type="number"
                min={0}
                value={updateFormData.quantity}
                onChange={handleUpdateInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleUpdateProduct}>Обновить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Импорт товаров</DialogTitle>
            <DialogDescription>
              Загрузите файл CSV с данными инвентаря
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={importTab} onValueChange={setImportTab} className="mt-4">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="upload">Загрузка</TabsTrigger>
              <TabsTrigger value="preview" disabled={!importData}>Предпросмотр</TabsTrigger>
              <TabsTrigger value="results" disabled={!showImportResults}>Результаты</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload">
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="import-location" className="block mb-2">
                    Точка продажи для импорта
                  </Label>
                  <Select
                    value={manualLocationId}
                    onValueChange={handleLocationChange}
                  >
                    <SelectTrigger className="w-full">
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
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="zero-non-existing" 
                      checked={zeroNonExisting} 
                      onCheckedChange={(checked) => setZeroNonExisting(!!checked)} 
                    />
                    <Label htmlFor="zero-non-existing">
                      Обнулять отсутствующие позиции в импорте
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Если товар есть в точке, но его нет в импорте, количество будет установлено на 0
                  </p>
                </div>
                
                <div className="border border-dashed border-gray-300 rounded-md p-6 text-center">
                  <label className="block cursor-pointer">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center space-y-2">
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="text-sm font-medium">
                        Нажмите для выбора файла или перетащите его сюда
                      </span>
                      <span className="text-xs text-gray-500">
                        CSV или TXT, разделители - запятая или точка с запятой
                      </span>
                    </div>
                  </label>
                </div>
                
                <div className="bg-muted/50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Формат файла:</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    CSV файл должен содержать колонки: название, размер, количество.
                    Порядок колонок и названия могут быть любыми.
                  </p>
                  <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                    название,объем,количество{"\n"}
                    LIBRE,5 мл,12{"\n"}
                    BLACK OPIUM,16 мл,5{"\n"}
                    SAUVAGE,30 мл,2
                  </pre>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="preview">
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Предварительная информация об импорте:</h4>
                  <p className="text-sm text-muted-foreground">
                    Точка продажи: <span className="font-medium">{getLocationName(manualLocationId)}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {zeroNonExisting 
                      ? "Отсутствующие позиции будут обнулены" 
                      : "Отсутствующие позиции останутся неизменными"}
                  </p>
                </div>
                
                <Button onClick={handleImportData} className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Импортировать
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="results">
              {importStats && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Card className="bg-green-50">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {importStats.importedCount}
                          </div>
                          <p className="text-sm text-muted-foreground">Всего импортировано</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-blue-50">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {importStats.newItemsCount}
                          </div>
                          <p className="text-sm text-muted-foreground">Новых позиций</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-amber-50">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-amber-600">
                            {importStats.updatedItemsCount}
                          </div>
                          <p className="text-sm text-muted-foreground">Обновлено</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {zeroNonExisting && importStats.zeroedItemsCount > 0 && (
                    <Card className="bg-red-50">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {importStats.zeroedItemsCount}
                          </div>
                          <p className="text-sm text-muted-foreground">Позиций обнулено</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Журнал импорта</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-2">
                          {importResultLogs.map((log, index) => (
                            <div key={index} className="flex items-start space-x-2 border-b pb-2">
                              <div className="mt-0.5">{getLogTypeIcon(log.type)}</div>
                              <div>
                                <p className="text-sm font-medium">{log.message}</p>
                                {log.detail && (
                                  <p className="text-xs text-muted-foreground">{log.detail}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                  
                  <div className="flex justify-end">
                    <Button onClick={closeImportDialog}>Закрыть</Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      {/* Delete All Dialog */}
      <AlertDialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить все товары?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы собираетесь удалить все товары из инвентаря. Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAllProducts}
              className="bg-red-600 hover:bg-red-700"
            >
              Удалить все
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Inventory;
