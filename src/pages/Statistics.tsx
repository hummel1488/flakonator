
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { format, subDays, isAfter, formatDistance } from "date-fns";
import { ru } from "date-fns/locale";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import { 
  ArrowLeft, Calendar, TrendingUp, Store, ArrowUpRight, BarChart3, 
  Download, ArrowDown, AlertCircle, ChevronRight, Package, PlusCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useSales } from "@/hooks/use-sales";
import { useLocations } from "@/hooks/use-locations";
import { LowStockAlert } from "@/components/LowStockAlert";
import { useInventory } from "@/hooks/use-inventory";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

type DateRangeType = "7days" | "30days" | "90days" | "all";
type ChartDataType = "revenue" | "quantity";

const COLORS = ["#E2B393", "#1A3B41", "#C89978", "#F0D4B4", "#0D2B31", "#3A3A3A"];

const Statistics = () => {
  const navigate = useNavigate();
  const { sales } = useSales();
  const { locations } = useLocations();
  const { inventory, updateProductQuantity } = useInventory();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [dateRange, setDateRange] = useState<DateRangeType>("30days");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [chartDataType, setChartDataType] = useState<ChartDataType>("revenue");
  const [showStockDialog, setShowStockDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantityToAdd, setQuantityToAdd] = useState(1);
  const [isLowStockExpanded, setIsLowStockExpanded] = useState(!isMobile);

  const getDateRangeStart = (range: DateRangeType): Date => {
    const now = new Date();
    switch (range) {
      case "7days":
        return subDays(now, 7);
      case "30days":
        return subDays(now, 30);
      case "90days":
        return subDays(now, 90);
      case "all":
        return new Date(0); // Beginning of time
    }
  };

  const filteredSales = useMemo(() => {
    const startDate = getDateRangeStart(dateRange);
    return sales.filter(sale => 
      isAfter(new Date(sale.date), startDate)
    );
  }, [sales, dateRange]);

  // Total revenue for the period
  const totalRevenue = useMemo(() => 
    filteredSales.reduce((sum, sale) => sum + sale.total, 0),
  [filteredSales]);

  // Total number of sales for the period
  const totalSales = filteredSales.length;

  // Average sale value
  const averageSale = totalSales > 0 
    ? totalRevenue / totalSales 
    : 0;

  // Average items per sale
  const averageItemsPerSale = useMemo(() => {
    if (totalSales === 0) return 0;
    const totalItems = filteredSales.reduce((sum, sale) => sum + sale.items.length, 0);
    return totalItems / totalSales;
  }, [filteredSales, totalSales]);

  // Previous period data for comparison
  const previousPeriodData = useMemo(() => {
    const currentStartDate = getDateRangeStart(dateRange);
    const periodLength = new Date().getTime() - currentStartDate.getTime();
    
    const previousStartDate = new Date(currentStartDate.getTime() - periodLength);
    const previousEndDate = new Date(currentStartDate.getTime() - 1); // 1 ms before current period
    
    const previousSales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= previousStartDate && saleDate <= previousEndDate;
    });
    
    const previousRevenue = previousSales.reduce((sum, sale) => sum + sale.total, 0);
    const revenueDifference = totalRevenue - previousRevenue;
    const revenueChangePercent = previousRevenue > 0 
      ? (revenueDifference / previousRevenue) * 100 
      : (totalRevenue > 0 ? 100 : 0);
    
    const previousSalesCount = previousSales.length;
    const salesDifference = totalSales - previousSalesCount;
    const salesChangePercent = previousSalesCount > 0 
      ? (salesDifference / previousSalesCount) * 100 
      : (totalSales > 0 ? 100 : 0);
    
    return { 
      previousRevenue, 
      revenueChangePercent, 
      previousSalesCount, 
      salesChangePercent 
    };
  }, [sales, dateRange, totalRevenue, totalSales]);

  // Sales by location
  const salesByLocation = useMemo(() => {
    const dataMap = new Map<string, { value: number, prevValue: number, changePercent: number }>();
    
    // Get date range for current and previous periods
    const currentStartDate = getDateRangeStart(dateRange);
    const periodLength = new Date().getTime() - currentStartDate.getTime();
    const previousStartDate = new Date(currentStartDate.getTime() - periodLength);
    
    // Initialize with all locations (even those without sales)
    locations.forEach(location => {
      dataMap.set(location.id, { value: 0, prevValue: 0, changePercent: 0 });
    });
    
    // Add current period sales data
    filteredSales.forEach(sale => {
      const locationData = dataMap.get(sale.locationId) || { value: 0, prevValue: 0, changePercent: 0 };
      locationData.value += sale.total;
      dataMap.set(sale.locationId, locationData);
    });
    
    // Add previous period sales data
    sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= previousStartDate && saleDate < currentStartDate;
    }).forEach(sale => {
      const locationData = dataMap.get(sale.locationId) || { value: 0, prevValue: 0, changePercent: 0 };
      locationData.prevValue += sale.total;
      dataMap.set(sale.locationId, locationData);
    });
    
    // Calculate change percentages
    dataMap.forEach((data, locationId) => {
      data.changePercent = data.prevValue > 0 
        ? ((data.value - data.prevValue) / data.prevValue) * 100 
        : (data.value > 0 ? 100 : 0);
    });
    
    // Convert to array for chart and sort by value
    return Array.from(dataMap).map(([locationId, data]) => {
      const location = locations.find(loc => loc.id === locationId);
      return {
        id: locationId,
        name: location?.name || "Неизвестно",
        value: data.value,
        prevValue: data.prevValue,
        changePercent: data.changePercent
      };
    }).sort((a, b) => b.value - a.value);
  }, [filteredSales, locations, dateRange, sales]);

  // Sales by product type
  const salesByProductType = useMemo(() => {
    const dataMap = new Map<string, { value: number, quantity: number }>();
    
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const size = item.size;
        const sizeLabel = size === "car" ? "Автофлакон" : `${size} мл`;
        
        if (!dataMap.has(sizeLabel)) {
          dataMap.set(sizeLabel, { value: 0, quantity: 0 });
        }
        
        const data = dataMap.get(sizeLabel)!;
        data.value += (item.price || 0) * item.quantity;
        data.quantity += item.quantity;
        dataMap.set(sizeLabel, data);
      });
    });
    
    return Array.from(dataMap).map(([size, data]) => ({
      name: size,
      value: data.value,
      quantity: data.quantity
    })).sort((a, b) => b.value - a.value);
  }, [filteredSales]);

  // Sales over time
  const salesOverTime = useMemo(() => {
    const dataMap = new Map<string, { value: number, quantity: number }>();
    const days = dateRange === "7days" ? 7 
               : dateRange === "30days" ? 30 
               : dateRange === "90days" ? 90 
               : 180; // Limit "all" to 180 days for visualization
    
    // Initialize all dates in range
    for (let i = 0; i < days; i++) {
      const date = subDays(new Date(), i);
      const dateKey = format(date, "yyyy-MM-dd");
      dataMap.set(dateKey, { value: 0, quantity: 0 });
    }
    
    // Add sales data
    filteredSales.forEach(sale => {
      const saleDate = new Date(sale.date);
      const startDate = subDays(new Date(), days);
      
      if (isAfter(saleDate, startDate)) {
        const dateKey = format(saleDate, "yyyy-MM-dd");
        const currentData = dataMap.get(dateKey) || { value: 0, quantity: 0 };
        
        // Add revenue
        currentData.value += sale.total;
        
        // Add quantity
        sale.items.forEach(item => {
          currentData.quantity += item.quantity;
        });
        
        dataMap.set(dateKey, currentData);
      }
    });
    
    // Convert to array and sort by date
    return Array.from(dataMap)
      .map(([date, data]) => ({
        date,
        revenue: data.value,
        quantity: data.quantity,
        // Format date for display (different formats based on range)
        displayDate: dateRange === "7days" 
          ? format(new Date(date), "EEE", { locale: ru }) 
          : format(new Date(date), "d MMM", { locale: ru }),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredSales, dateRange]);

  // Top selling products
  const topProducts = useMemo(() => {
    const dataMap = new Map<string, { name: string, quantity: number, revenue: number }>();
    
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const key = `${item.name} (${item.size === "car" ? "Автофлакон" : `${item.size} мл`})`;
        const current = dataMap.get(key) || { name: key, quantity: 0, revenue: 0 };
        dataMap.set(key, {
          name: key,
          quantity: current.quantity + item.quantity,
          revenue: current.revenue + (item.price || 0) * item.quantity,
        });
      });
    });
    
    return Array.from(dataMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredSales]);

  // Latest sales
  const latestSales = useMemo(() => {
    return [...filteredSales]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [filteredSales]);

  // Low stock analysis with daily sales and forecast
  const lowStockAnalysis = useMemo(() => {
    if (selectedLocation === "all") return [];
    
    // Get products for the selected location
    const locationProducts = inventory.filter(item => item.locationId === selectedLocation);
    
    // Calculate average daily sales for each product
    const dailySalesMap = new Map<string, number>();
    
    // Calculate the date 30 days ago to analyze recent sales
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Get sales for this location in the last 30 days
    const recentSales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return sale.locationId === selectedLocation && saleDate >= thirtyDaysAgo;
    });
    
    // Calculate daily sales rate for each product
    locationProducts.forEach(product => {
      const productKey = `${product.name}-${product.size}`;
      
      // Count total sales of this product in the last 30 days
      let totalSold = 0;
      recentSales.forEach(sale => {
        sale.items.forEach(item => {
          if (item.name === product.name && item.size === product.size) {
            totalSold += item.quantity;
          }
        });
      });
      
      // Calculate average daily sales (items sold per day)
      const dailySales = totalSold / 30;
      dailySalesMap.set(productKey, dailySales);
    });
    
    // Find products with low stock (3 or fewer)
    const lowStock = locationProducts
      .filter(item => item.quantity <= 3)
      .sort((a, b) => a.quantity - b.quantity) // Sort by quantity ascending
      .map(product => {
        const productKey = `${product.name}-${product.size}`;
        const dailySales = dailySalesMap.get(productKey) || 0;
        
        // Calculate days until stockout (0 if no sales)
        const daysLeft = dailySales > 0 
          ? Math.floor(product.quantity / dailySales) 
          : (product.quantity === 0 ? 0 : 999); // If no sales but has stock, mark as plentiful
        
        // Determine risk level
        let riskLevel: 'critical' | 'warning' | 'normal' = 'normal';
        if (product.quantity === 0) {
          riskLevel = 'critical';
        } else if (daysLeft <= 3) {
          riskLevel = 'critical';
        } else if (daysLeft <= 7) {
          riskLevel = 'warning';
        }
        
        return {
          ...product,
          dailySales,
          daysLeft,
          riskLevel
        };
      });
    
    return lowStock;
  }, [inventory, selectedLocation, sales]);

  // Format currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString("ru-RU") + " ₽";
  };

  // Export data to Excel (simplified CSV export)
  const exportToCSV = () => {
    // Create headers for the CSV file
    const headers = [
      "Дата",
      "Точка продажи",
      "Общая сумма",
      "Проданные товары"
    ].join(',');
    
    // Create rows for each sale
    const rows = filteredSales.map(sale => {
      const locationName = locations.find(loc => loc.id === sale.locationId)?.name || "Неизвестно";
      const itemsList = sale.items.map(item => `${item.name} (${item.size}) x${item.quantity}`).join('; ');
      
      return [
        format(new Date(sale.date), "dd.MM.yyyy"),
        locationName,
        sale.total,
        itemsList
      ].join(',');
    });
    
    // Combine headers and rows
    const csvContent = `${headers}\n${rows.join('\n')}`;
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sales_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Экспорт завершен",
      description: "Данные экспортированы в формате CSV"
    });
  };

  // Update stock quantity
  const handleUpdateStock = () => {
    if (!selectedProduct) return;
    
    updateProductQuantity(
      selectedProduct.id, 
      selectedProduct.quantity + quantityToAdd
    );
    
    toast({
      title: "Остаток обновлен",
      description: `Добавлено ${quantityToAdd} шт. аромата "${selectedProduct.name}"`,
      variant: "default"
    });
    
    setShowStockDialog(false);
    setSelectedProduct(null);
    setQuantityToAdd(1);
  };

  // Open stock update dialog
  const openStockUpdateDialog = (product: any) => {
    setSelectedProduct(product);
    setQuantityToAdd(1);
    setShowStockDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4"
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
            <div className="flex items-center">
              <h1 className="text-3xl font-semibold">Статистика</h1>
              <BarChart3 className="h-7 w-7 ml-2 text-primary" />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 items-center">
            <Button 
              variant="outline" 
              className="gap-2" 
              onClick={exportToCSV}
            >
              <Download className="h-4 w-4" />
              Экспорт данных
            </Button>
            
            <div className="flex items-center gap-2">
              <Label htmlFor="date-range" className="hidden md:inline mr-2">Период:</Label>
              <Select
                value={dateRange}
                onValueChange={(value) => setDateRange(value as DateRangeType)}
              >
                <SelectTrigger id="date-range" className="w-[140px]">
                  <SelectValue placeholder="Выберите период" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">7 дней</SelectItem>
                  <SelectItem value="30days">30 дней</SelectItem>
                  <SelectItem value="90days">90 дней</SelectItem>
                  <SelectItem value="all">Все время</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          {isMobile ? (
            <Collapsible 
              open={isLowStockExpanded} 
              onOpenChange={setIsLowStockExpanded}
              className="mb-6 bg-white rounded-lg shadow-md p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <h2 className="text-lg font-medium">Ароматы с низким остатком</h2>
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <ChevronRight className={`h-5 w-5 transition-transform ${isLowStockExpanded ? 'rotate-90' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
              </div>
              
              <CollapsibleContent className="mt-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    Отслеживание товаров, требующих пополнения
                  </p>
                  <Select
                    value={selectedLocation}
                    onValueChange={setSelectedLocation}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Все точки" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все точки</SelectItem>
                      {locations.map(location => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedLocation !== "all" ? (
                  lowStockAnalysis.length > 0 ? (
                    <div className="space-y-3">
                      {lowStockAnalysis.map(product => (
                        <Card key={product.id} className={`border-l-4 ${
                          product.riskLevel === 'critical' ? 'border-l-red-500' :
                          product.riskLevel === 'warning' ? 'border-l-amber-500' :
                          'border-l-gray-300'
                        }`}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{product.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {product.size === "car" ? "Автофлакон" : `${product.size} мл`}
                                </p>
                                <div className="mt-2 flex items-center gap-3">
                                  <Badge variant={product.quantity === 0 ? "destructive" : "outline"} className="rounded-sm">
                                    Остаток: {product.quantity} шт.
                                  </Badge>
                                  <div className="text-sm">
                                    <span className="text-muted-foreground">Продажи: </span>
                                    <span className="font-medium">{product.dailySales.toFixed(1)} шт./день</span>
                                  </div>
                                </div>
                                {product.daysLeft < 999 && (
                                  <p className={`text-sm mt-2 ${
                                    product.riskLevel === 'critical' ? 'text-red-600' :
                                    product.riskLevel === 'warning' ? 'text-amber-600' :
                                    'text-muted-foreground'
                                  }`}>
                                    {product.quantity === 0 
                                      ? "Закончился!" 
                                      : `Осталось на ${product.daysLeft} ${
                                        product.daysLeft === 1 ? 'день' : 
                                        product.daysLeft < 5 ? 'дня' : 'дней'
                                      }`}
                                  </p>
                                )}
                              </div>
                              <Button 
                                size="sm" 
                                className="gap-1"
                                onClick={() => openStockUpdateDialog(product)}
                              >
                                <PlusCircle className="h-4 w-4" />
                                Пополнить
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 text-muted-foreground">
                      Нет ароматов с низким остатком
                    </div>
                  )
                ) : (
                  <div className="text-center p-6 text-muted-foreground">
                    Выберите точку продажи для анализа остатков
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <div className="mb-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    <h2 className="text-lg font-medium">Ароматы с низким остатком</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Отслеживание товаров, требующих пополнения
                  </p>
                </div>
                <div className="mt-2 md:mt-0">
                  <Select
                    value={selectedLocation}
                    onValueChange={setSelectedLocation}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Все точки" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все точки</SelectItem>
                      {locations.map(location => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {selectedLocation !== "all" ? (
                lowStockAnalysis.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lowStockAnalysis.map(product => (
                      <Card key={product.id} className={`border-l-4 ${
                        product.riskLevel === 'critical' ? 'border-l-red-500' :
                        product.riskLevel === 'warning' ? 'border-l-amber-500' :
                        'border-l-gray-300'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{product.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {product.size === "car" ? "Автофлакон" : `${product.size} мл`}
                              </p>
                              <div className="mt-2 flex items-center gap-3">
                                <Badge variant={product.quantity === 0 ? "destructive" : "outline"} className="rounded-sm">
                                  Остаток: {product.quantity} шт.
                                </Badge>
                                <div className="text-sm">
                                  <span className="text-muted-foreground">Продажи: </span>
                                  <span className="font-medium">{product.dailySales.toFixed(1)} шт./день</span>
                                </div>
                              </div>
                              {product.daysLeft < 999 && (
                                <p className={`text-sm mt-2 ${
                                  product.riskLevel === 'critical' ? 'text-red-600' :
                                  product.riskLevel === 'warning' ? 'text-amber-600' :
                                  'text-muted-foreground'
                                }`}>
                                  {product.quantity === 0 
                                    ? "Закончился!" 
                                    : `Осталось на ${product.daysLeft} ${
                                      product.daysLeft === 1 ? 'день' : 
                                      product.daysLeft < 5 ? 'дня' : 'дней'
                                    }`}
                                </p>
                              )}
                            </div>
                            <Button 
                              size="sm" 
                              className="gap-1"
                              onClick={() => openStockUpdateDialog(product)}
                            >
                              <PlusCircle className="h-4 w-4" />
                              Пополнить
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 bg-white rounded-lg shadow-sm text-muted-foreground">
                    Нет ароматов с низким остатком
                  </div>
                )
              ) : (
                <div className="text-center p-6 bg-white rounded-lg shadow-sm text-muted-foreground">
                  Выберите точку продажи для анализа остатков
                </div>
              )}
            </div>
          )}
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="details">Детали</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Общая выручка
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-brand-gold" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                    <div className="flex items-center mt-2">
                      <div className={`flex items-center gap-1 text-sm font-medium ${
                        previousPeriodData.revenueChangePercent >= 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {previousPeriodData.revenueChangePercent >= 0 ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDown className="h-4 w-4" />
                        )}
                        {Math.abs(previousPeriodData.revenueChangePercent).toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground ml-2">
                        По сравнению с пред. периодом
                      </p>
                    </div>
                    <Progress 
                      className="h-1 mt-2" 
                      value={100}
                      indicatorClassName={previousPeriodData.revenueChangePercent >= 0 
                        ? "bg-green-500" 
                        : "bg-red-500"
                      }
                    />
                    <p className="text-xs text-muted-foreground mt-3">
                      За период: {dateRange === "7days" ? "7 дней" : dateRange === "30days" ? "30 дней" : dateRange === "90days" ? "90 дней" : "всё время"}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Количество продаж
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-brand-gold" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalSales}</div>
                    <div className="flex items-center mt-2">
                      <div className={`flex items-center gap-1 text-sm font-medium ${
                        previousPeriodData.salesChangePercent >= 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {previousPeriodData.salesChangePercent >= 0 ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDown className="h-4 w-4" />
                        )}
                        {Math.abs(previousPeriodData.salesChangePercent).toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground ml-2">
                        По сравнению с пред. периодом
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Средний чек:</p>
                        <p className="text-sm font-medium">{formatCurrency(averageSale)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Флаконов в чеке:</p>
                        <p className="text-sm font-medium">{averageItemsPerSale.toFixed(1)} шт.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Лидер продаж
                    </CardTitle>
                    <Store className="h-4 w-4 text-brand-gold" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {salesByLocation.length > 0 ? salesByLocation[0].name : "Нет данных"}
                    </div>
                    {salesByLocation.length > 0 && (
                      <div className="flex items-center mt-2">
                        <div className={`flex items-center gap-1 text-sm font-medium ${
                          salesByLocation[0].changePercent >= 0 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {salesByLocation[0].changePercent >= 0 ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          )}
                          {Math.abs(salesByLocation[0].changePercent).toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground ml-2">
                          За период
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {salesByLocation.length > 0 
                        ? `Выручка: ${formatCurrency(salesByLocation[0].value)}`
                        : "Нет данных о продажах"
                      }
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      className="px-0 h-6 mt-2"
                      onClick={() => salesByLocation.length > 0 && navigate(`/locations?id=${salesByLocation[0].id}`)}
                      disabled={salesByLocation.length === 0}
                    >
                      Подробная статистика
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="row-span-2"
              >
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>Продажи по времени</CardTitle>
                      <div className="flex gap-1">
                        <Button 
                          variant={chartDataType === "revenue" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setChartDataType("revenue")}
                          className="h-8 px-3"
                        >
                          Выручка
                        </Button>
                        <Button 
                          variant={chartDataType === "quantity" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setChartDataType("quantity")}
                          className="h-8 px-3"
                        >
                          Флаконы
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] md:h-[380px]">
                      {salesOverTime.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={salesOverTime}
                            margin={{
                              top: 10,
                              right: 30,
                              left: 20,
                              bottom: 30,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                            <XAxis 
                              dataKey="displayDate" 
                              tickLine={false}
                              axisLine={false}
                              tick={{ fontSize: 12 }}
                            />
                            <YAxis 
                              tickFormatter={(value) => value.toLocaleString()}
                              tick={{ fontSize: 12 }}
                              tickLine={false}
                              axisLine={false}
                              label={{ 
                                value: chartDataType === "revenue" ? "Выручка (₽)" : "Количество (шт.)",
                                angle: -90, 
                                position: 'insideLeft',
                                style: { 
                                  textAnchor: 'middle',
                                  fontSize: 12,
                                  fill: '#888'
                                }
                              }}
                            />
                            <RechartsTooltip 
                              formatter={(value, name) => {
                                if (name === "revenue") {
                                  return [formatCurrency(value as number), "Выручка"];
                                }
                                return [`${value} шт.`, "Количество"];
                              }}
                              labelFormatter={(label) => `Дата: ${label}`}
                            />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey={chartDataType === "revenue" ? "revenue" : "quantity"}
                              name={chartDataType === "revenue" ? "Выручка" : "Флаконы"} 
                              stroke={chartDataType === "revenue" ? "#E2B393" : "#3A6EA5"} 
                              activeDot={{ r: 8 }} 
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                          Нет данных за выбранный период
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                key="locations-chart"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Продажи по точкам</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      {salesByLocation.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={salesByLocation}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 30,
                            }}
                            layout="vertical"
                          >
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
                            <XAxis 
                              type="number" 
                              tickFormatter={(value) => value.toLocaleString()}
                              tick={{ fontSize: 12 }}
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis 
                              dataKey="name" 
                              type="category" 
                              tickLine={false}
                              axisLine={false}
                              width={isMobile ? 70 : 120}
                              tick={{ fontSize: 12 }}
                            />
                            <RechartsTooltip 
                              formatter={(value, name, props) => {
                                const item = props.payload;
                                return [
                                  <div>
                                    <div>{formatCurrency(value as number)}</div>
                                    <div className={`text-xs ${
                                      item.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                      {item.changePercent >= 0 ? '▲' : '▼'} {Math.abs(item.changePercent).toFixed(1)}%
                                    </div>
                                  </div>,
                                  "Выручка"
                                ];
                              }}
                              labelFormatter={(label) => `Точка: ${label}`}
                            />
                            <Bar 
                              dataKey="value" 
                              fill="#E2B393" 
                              radius={[0, 4, 4, 0]} 
                              onClick={(data) => {
                                navigate(`/locations?id=${data.id}`);
                              }}
                              cursor="pointer"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                          Нет данных за выбранный период
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                key="product-types-chart"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Продажи по типам</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      {salesByProductType.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={salesByProductType}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={90}
                              dataKey={chartDataType === "revenue" ? "value" : "quantity"}
                              nameKey="name"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {salesByProductType.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip 
                              formatter={(value, name, props) => {
                                if (name === "value") {
                                  return [formatCurrency(value as number), "Выручка"];
                                }
                                return [`${value} шт.`, "Количество"];
                              }}
                              labelFormatter={(label) => `Тип: ${label}`}
                            />
                            <Legend 
                              formatter={(value) => <span style={{ fontSize: '12px' }}>{value}</span>}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                          Нет данных за выбранный период
                        </div>
                      )}
                      {salesByProductType.length === 1 && (
                        <div className="text-center text-xs text-muted-foreground mt-2 p-2 bg-gray-50 rounded">
                          Недостаточно данных для полноценного анализа
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                key="top-products"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Топ продуктов</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {topProducts.length > 0 ? (
                      <div className="space-y-4">
                        {topProducts.map((product, index) => (
                          <div key={`product-${index}`} className="flex items-center justify-between">
                            <div className="flex items-start gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-accent/20">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Продано: {product.quantity} шт.
                                </p>
                              </div>
                            </div>
                            <div className="font-medium">
                              {formatCurrency(product.revenue)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        Нет данных за выбранный период
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                key="latest-sales"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Последние продажи</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {latestSales.length > 0 ? (
                      <div className="space-y-4">
                        {latestSales.map((sale) => {
                          const location = locations.find(loc => loc.id === sale.locationId);
                          return (
                            <div key={`sale-${sale.id}`} className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="rounded-sm">
                                    {format(new Date(sale.date), "dd.MM.yyyy")}
                                  </Badge>
                                  <Badge className="bg-brand-accent text-brand-DEFAULT hover:bg-brand-dark-gold rounded-sm">
                                    {location?.name || "Неизвестно"}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {sale.items.length} {sale.items.length === 1 ? "товар" : 
                                    sale.items.length < 5 ? "товара" : "товаров"}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDistance(new Date(sale.date), new Date(), { 
                                    addSuffix: true,
                                    locale: ru
                                  })}
                                </p>
                              </div>
                              <div className="font-medium">
                                {formatCurrency(sale.total)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        Нет данных за выбранный период
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showStockDialog} onOpenChange={setShowStockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Пополнение остатка</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4 py-4">
              <div>
                <Label>Аромат</Label>
                <div className="font-medium mt-1">{selectedProduct.name}</div>
                <div className="text-sm text-muted-foreground">
                  {selectedProduct.size === "car" ? "Автофлакон" : `${selectedProduct.size} мл`}
                </div>
              </div>
              
              <div>
                <Label>Текущий остаток</Label>
                <div className="font-medium mt-1">{selectedProduct.quantity} шт.</div>
              </div>
              
              <div>
                <Label htmlFor="quantity-to-add">Добавить количество</Label>
                <Input
                  id="quantity-to-add"
                  type="number"
                  min="1"
                  value={quantityToAdd}
                  onChange={(e) => setQuantityToAdd(parseInt(e.target.value) || 1)}
                  className="mt-1"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStockDialog(false)}>Отмена</Button>
            <Button onClick={handleUpdateStock}>Пополнить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Statistics;
