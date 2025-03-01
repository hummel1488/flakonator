import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { format, subDays, isAfter, formatDistance, startOfMonth, endOfMonth, isSameMonth, subMonths } from "date-fns";
import { ru } from "date-fns/locale";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import { 
  ArrowLeft, Calendar, TrendingUp, Store, ArrowUpRight, Package, DollarSign, 
  BarChart3, PieChart as PieChartIcon, AlertTriangle, Bookmark
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { useSales } from "@/hooks/use-sales";
import { useLocations } from "@/hooks/use-locations";
import { useInventory } from "@/hooks/use-inventory"; 
import { LowStockAlert } from "@/components/LowStockAlert";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";

type DateRangeType = "7days" | "30days" | "90days" | "all";

const COLORS = ["#5aa6ff", "#394049", "#6c747f", "#4a5568", "#e6eaef", "#8a9ead"];

const Statistics = () => {
  const navigate = useNavigate();
  const { sales } = useSales();
  const { locations } = useLocations();
  const { inventory } = useInventory();
  const [dateRange, setDateRange] = useState<DateRangeType>("30days");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const isMobile = useIsMobile();
  const [showChart, setShowChart] = useState(!isMobile);

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
    let filtered = sales.filter(sale => 
      isAfter(new Date(sale.date), startDate)
    );
    
    // Filter by location if selected
    if (selectedLocation !== "all") {
      filtered = filtered.filter(sale => sale.locationId === selectedLocation);
    }
    
    return filtered;
  }, [sales, dateRange, selectedLocation]);

  // Current month revenue
  const currentMonthRevenue = useMemo(() => {
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    
    return filteredSales
      .filter(sale => isAfter(new Date(sale.date), startOfCurrentMonth))
      .reduce((sum, sale) => sum + sale.total, 0);
  }, [filteredSales]);

  // Previous month revenue
  const previousMonthRevenue = useMemo(() => {
    const now = new Date();
    const previousMonthStart = startOfMonth(subMonths(now, 1));
    const previousMonthEnd = endOfMonth(subMonths(now, 1));
    
    return sales
      .filter(sale => {
        const saleDate = new Date(sale.date);
        return isAfter(saleDate, previousMonthStart) && 
               !isAfter(saleDate, previousMonthEnd) &&
               (selectedLocation === "all" || sale.locationId === selectedLocation);
      })
      .reduce((sum, sale) => sum + sale.total, 0);
  }, [sales, selectedLocation]);

  // Calculate revenue dynamics
  const revenueDynamics = useMemo(() => {
    if (previousMonthRevenue === 0) return 100; // If no previous data, consider it 100% growth
    
    return ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
  }, [currentMonthRevenue, previousMonthRevenue]);

  const totalRevenue = useMemo(() => 
    filteredSales.reduce((sum, sale) => sum + sale.total, 0),
  [filteredSales]);

  const totalSales = filteredSales.length;

  const averageSale = totalSales > 0 
    ? totalRevenue / totalSales 
    : 0;

  const salesByLocation = useMemo(() => {
    if (selectedLocation !== "all") {
      // If we're filtering by location, show subdivisions by product size
      const sizeMap = new Map<string, number>();
      
      filteredSales.forEach(sale => {
        sale.items.forEach(item => {
          const sizeKey = item.size === "car" ? "Автофлакон" : `${item.size} мл`;
          const currentValue = sizeMap.get(sizeKey) || 0;
          sizeMap.set(sizeKey, currentValue + (item.price * item.quantity));
        });
      });
      
      return Array.from(sizeMap).map(([size, value]) => ({
        name: size,
        value,
      })).sort((a, b) => b.value - a.value);
    } else {
      // Default behavior - show by location
      const dataMap = new Map<string, number>();
      
      locations.forEach(location => {
        dataMap.set(location.id, 0);
      });
      
      filteredSales.forEach(sale => {
        const currentValue = dataMap.get(sale.locationId) || 0;
        dataMap.set(sale.locationId, currentValue + sale.total);
      });
      
      return Array.from(dataMap).map(([locationId, value]) => {
        const location = locations.find(loc => loc.id === locationId);
        return {
          name: location?.name || "Неизвестно",
          value,
        };
      }).sort((a, b) => b.value - a.value);
    }
  }, [filteredSales, locations, selectedLocation]);

  // Find locations with negative dynamics (more than 20% decrease)
  const locationsWithNegativeDynamics = useMemo(() => {
    if (selectedLocation !== "all") return []; // Only relevant for all locations view
    
    const result = [];
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const previousMonthStart = startOfMonth(subMonths(now, 1));
    const previousMonthEnd = endOfMonth(subMonths(now, 1));
    
    for (const location of locations) {
      // Current month revenue for this location
      const currentRevenue = sales
        .filter(sale => 
          sale.locationId === location.id && 
          isAfter(new Date(sale.date), currentMonthStart)
        )
        .reduce((sum, sale) => sum + sale.total, 0);
      
      // Previous month revenue for this location
      const previousRevenue = sales
        .filter(sale => {
          const saleDate = new Date(sale.date);
          return sale.locationId === location.id && 
                 isAfter(saleDate, previousMonthStart) && 
                 !isAfter(saleDate, previousMonthEnd);
        })
        .reduce((sum, sale) => sum + sale.total, 0);
      
      // Calculate dynamics
      if (previousRevenue > 0) {
        const dynamics = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
        
        if (dynamics < -20) {
          result.push({
            location,
            dynamics,
            currentRevenue,
            previousRevenue
          });
        }
      }
    }
    
    return result.sort((a, b) => a.dynamics - b.dynamics);
  }, [sales, locations, selectedLocation]);

  const salesByProductType = useMemo(() => {
    const dataMap = new Map<string, number>();
    
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const size = item.size;
        const sizeLabel = size === "car" ? "Автофлакон" : `${item.size} мл`;
        const currentValue = dataMap.get(sizeLabel) || 0;
        dataMap.set(sizeLabel, currentValue + (item.price * item.quantity));
      });
    });
    
    return Array.from(dataMap).map(([size, value]) => ({
      name: size,
      value,
    })).sort((a, b) => b.value - a.value);
  }, [filteredSales]);

  const salesOverTime = useMemo(() => {
    const dataMap = new Map<string, number>();
    const days = dateRange === "7days" ? 7 
               : dateRange === "30days" ? 30 
               : dateRange === "90days" ? 90 
               : 180; // Limit "all" to 180 days for visualization
    
    for (let i = 0; i < days; i++) {
      const date = subDays(new Date(), i);
      const dateKey = format(date, "yyyy-MM-dd");
      dataMap.set(dateKey, 0);
    }
    
    filteredSales.forEach(sale => {
      const saleDate = new Date(sale.date);
      const startDate = subDays(new Date(), days);
      
      if (isAfter(saleDate, startDate)) {
        const dateKey = format(saleDate, "yyyy-MM-dd");
        const currentValue = dataMap.get(dateKey) || 0;
        dataMap.set(dateKey, currentValue + sale.total);
      }
    });
    
    return Array.from(dataMap)
      .map(([date, value]) => ({
        date,
        value,
        displayDate: dateRange === "7days" 
          ? format(new Date(date), "EEE", { locale: ru }) 
          : format(new Date(date), "d MMM", { locale: ru }),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredSales, dateRange]);

  // Calculate weekly sales data for growth tracking
  const weeklySalesData = useMemo(() => {
    const sevenDaysAgo = subDays(new Date(), 7);
    const fourteenDaysAgo = subDays(new Date(), 14);
    
    // Sales for the last 7 days
    const salesLastWeek = sales.filter(sale => 
      isAfter(new Date(sale.date), sevenDaysAgo) &&
      (selectedLocation === "all" || sale.locationId === selectedLocation)
    );
    
    // Sales for the previous 7 days
    const salesPreviousWeek = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return isAfter(saleDate, fourteenDaysAgo) && 
             !isAfter(saleDate, sevenDaysAgo) &&
             (selectedLocation === "all" || sale.locationId === selectedLocation);
    });
    
    // Calculate product sales for last week
    const lastWeekSales = new Map<string, number>();
    salesLastWeek.forEach(sale => {
      sale.items.forEach(item => {
        const key = `${item.name} (${item.size === "car" ? "Автофлакон" : `${item.size} мл`})`;
        const current = lastWeekSales.get(key) || 0;
        lastWeekSales.set(key, current + (item.price * item.quantity));
      });
    });
    
    // Calculate product sales for previous week
    const previousWeekSales = new Map<string, number>();
    salesPreviousWeek.forEach(sale => {
      sale.items.forEach(item => {
        const key = `${item.name} (${item.size === "car" ? "Автофлакон" : `${item.size} мл`})`;
        const current = previousWeekSales.get(key) || 0;
        previousWeekSales.set(key, current + (item.price * item.quantity));
      });
    });
    
    return { lastWeekSales, previousWeekSales };
  }, [sales, selectedLocation]);

  const { lastWeekSales, previousWeekSales } = weeklySalesData;

  const topProducts = useMemo(() => {
    const dataMap = new Map<string, { name: string, quantity: number, revenue: number, growing: boolean }>();
    
    // Get sales from the last 30 days
    const thirtyDaysAgo = subDays(new Date(), 30);
    const sevenDaysAgo = subDays(new Date(), 7);
    
    // Sales for the last 30 days
    const last30DaysSales = sales.filter(sale => 
      isAfter(new Date(sale.date), thirtyDaysAgo) &&
      (selectedLocation === "all" || sale.locationId === selectedLocation)
    );
    
    // Process 30-day data
    last30DaysSales.forEach(sale => {
      sale.items.forEach(item => {
        const key = `${item.name} (${item.size === "car" ? "Автофлакон" : `${item.size} мл`})`;
        const current = dataMap.get(key) || { name: key, quantity: 0, revenue: 0, growing: false };
        
        // Check if product has significant growth
        const lastWeekRev = lastWeekSales.get(key) || 0;
        const prevWeekRev = previousWeekSales.get(key) || 0;
        const isGrowing = prevWeekRev > 0 && lastWeekRev > prevWeekRev && 
                           ((lastWeekRev - prevWeekRev) / prevWeekRev) > 0.25; // 25% growth
        
        dataMap.set(key, {
          name: key,
          quantity: current.quantity + item.quantity,
          revenue: current.revenue + (item.price * item.quantity),
          growing: current.growing || isGrowing
        });
      });
    });
    
    return Array.from(dataMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [sales, selectedLocation, lastWeekSales, previousWeekSales]);

  // Get product recommendations for selected location
  const productRecommendations = useMemo(() => {
    if (selectedLocation === "all") return [];
    
    const recommendations = [];
    const stockThreshold = 3; // Low stock threshold
    
    // Get current inventory for this location
    const locationInventory = inventory.filter(product => 
      product.locationId === selectedLocation
    );
    
    // Map inventory by name and size for quick lookup
    const inventoryMap = new Map();
    locationInventory.forEach(product => {
      const key = `${product.name}${product.size}`;
      inventoryMap.set(key, product);
    });
    
    // Add recommendations based on top sellers with low stock
    for (const product of topProducts) {
      const [name, sizeWithParens] = product.name.split(" (");
      const size = sizeWithParens.replace(")", "");
      const formattedSize = size === "Автофлакон" ? "car" : size.replace(" мл", "");
      
      const inventoryKey = `${name}${formattedSize}`;
      const inventoryItem = Array.from(inventoryMap.values()).find(
        item => item.name === name && (item.size === formattedSize || 
                (item.size === "car" && formattedSize === "Автофлакон"))
      );
      
      if (inventoryItem && inventoryItem.quantity <= stockThreshold) {
        const growthMessage = product.growing 
          ? `+${((lastWeekSales.get(product.name) || 0) / (previousWeekSales.get(product.name) || 1) * 100 - 100).toFixed(0)}% продаж за неделю` 
          : "стабильный бестселлер, остаток ниже нормы";
          
        recommendations.push({
          type: "low_stock",
          name,
          size: formattedSize === "car" ? "Автофлакон" : `${formattedSize} мл`,
          growing: product.growing,
          message: growthMessage
        });
      } else if (product.growing) {
        recommendations.push({
          type: "trending",
          name,
          size: formattedSize === "car" ? "Автофлакон" : `${formattedSize} мл`,
          growing: true,
          message: "новая популярность среди клиентов"
        });
      }
    }
    
    return recommendations.slice(0, 5);
  }, [topProducts, inventory, selectedLocation, lastWeekSales, previousWeekSales]);

  const latestSales = useMemo(() => {
    return [...filteredSales]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [filteredSales]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString("ru-RU") + " ₽";
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
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
            <h1 className="text-3xl font-medium flex items-center gap-2">
              <BarChart3 className="h-7 w-7 text-primary" />
              Статистика
            </h1>
          </div>
          <div className="flex flex-col md:flex-row items-end md:items-center gap-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="date-range" className="mr-2">Период:</Label>
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
            <div className="flex items-center gap-2">
              <Label htmlFor="location" className="mr-2">Точка:</Label>
              <Select
                value={selectedLocation}
                onValueChange={setSelectedLocation}
              >
                <SelectTrigger id="location" className="w-[200px]">
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-medium">Ароматы с низким остатком</h2>
              <p className="text-sm text-muted-foreground">Отслеживание товаров, требующих пополнения</p>
            </div>
          </div>
          <LowStockAlert locationId={selectedLocation !== "all" ? selectedLocation : undefined} threshold={3} />
        </motion.div>

        {/* Revenue Dynamics Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Динамика выручки
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Выручка за прошлый месяц:</p>
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    {formatCurrency(previousMonthRevenue)}
                  </h3>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Выручка за текущий месяц:</p>
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    {formatCurrency(currentMonthRevenue)}
                  </h3>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Динамика:</p>
                  <h3 className={`text-2xl font-bold flex items-center gap-2 ${revenueDynamics >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {revenueDynamics >= 0 ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-down">
                        <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline>
                        <polyline points="16 17 22 17 22 11"></polyline>
                      </svg>
                    )}
                    {revenueDynamics >= 0 ? '+' : ''}{revenueDynamics.toFixed(1)}%
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Product Recommendations for Selected Location */}
        {selectedLocation !== "all" && productRecommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Рекомендуем поставить
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-3">
                  {productRecommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary flex-shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{rec.name} {rec.size}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          {rec.growing && (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          )}
                          {!rec.growing && rec.type === "low_stock" && (
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          )}
                          {rec.message}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Risk Locations Section */}
        {selectedLocation === "all" && locationsWithNegativeDynamics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Точки с риском падения продаж
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-4">
                  {locationsWithNegativeDynamics.map((item, index) => (
                    <li key={index} className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{item.location.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.previousRevenue)} → {formatCurrency(item.currentRevenue)}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-red-600 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-down">
                          <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline>
                          <polyline points="16 17 22 17 22 11"></polyline>
                        </svg>
                        {item.dynamics.toFixed(1)}%
                      </Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="details">Детали</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      Общая выручка
                      <DollarSign className="h-4 w-4 text-primary" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
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
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      Количество продаж
                      <Package className="h-4 w-4 text-primary" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold">{totalSales}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Средний чек: {formatCurrency(averageSale)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      {selectedLocation === "all" ? "Лидер продаж" : "Популярный размер"}
                      <Store className="h-4 w-4 text-primary" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold">
                      {salesByLocation.length > 0 ? salesByLocation[0].name : "Нет данных"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {salesByLocation.length > 0 
                        ? `Выручка: ${formatCurrency(salesByLocation[0].value)}`
                        : "Нет данных о продажах"
                      }
                    </p>
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
                  <CardHeader className="border-b flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Продажи по времени
                    </CardTitle>
                    {isMobile && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowChart(!showChart)}
                      >
                        {showChart ? "Скрыть график" : "Показать график"}
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="pt-4">
                    {showChart ? (
                      <div className="h-[300px]">
                        {salesOverTime.length > 0 ? (
                          <ScrollArea className="h-[300px]">
                            <div className="min-w-[600px] h-[300px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                  data={salesOverTime}
                                  margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                  }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} stroke="#999" />
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
                                  />
                                  <RechartsTooltip 
                                    formatter={(value) => [formatCurrency(value as number), "Выручка"]}
                                    labelFormatter={(label) => `Дата: ${label}`}
                                  />
                                  <Line 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="#5aa6ff" 
                                    activeDot={{ r: 8, fill: "#5aa6ff" }} 
                                    strokeWidth={2}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </ScrollArea>
                        ) : (
                          <div className="h-full flex items-center justify-center text-muted-foreground">
                            Нет данных за выбранный период
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-[100px] flex items-center justify-center">
                        <Button 
                          variant="outline" 
                          onClick={() => setShowChart(true)}
                        >
                          Показать график
                        </Button>
                      </div>
                    )}
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
                  <CardHeader className="border-b">
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5 text-primary" />
                      {selectedLocation === "all" ? "Продажи по точкам" : "Продажи по объемам"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="h-[300px]">
                      {salesByLocation.length > 0 ? (
                        <ScrollArea className="h-[300px]">
                          <div className="min-w-[500px] h-[300px]">
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
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.1} stroke="#999" />
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
                                  width={120}
                                  tick={{ fontSize: 12 }}
                                />
                                <RechartsTooltip 
                                  formatter={(value) => [formatCurrency(value as number), "Выручка"]}
                                  labelFormatter={(label) => `${selectedLocation === "all" ? "Точка" : "Объем"}: ${label}`}
                                />
                                <Bar dataKey="value" fill="#5aa6ff" radius={[0, 4, 4, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </ScrollArea>
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
                  <CardHeader className="border-b">
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5 text-primary" />
                      Продажи по типам
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
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
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {salesByProductType.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip 
                              formatter={(value) => [formatCurrency(value as number), "Выручка"]}
                              labelFormatter={(label, payload) => {
                                return payload && payload.length > 0 ? `Тип: ${payload[0].name}` : label;
                              }}
                            />
                          </PieChart>
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
            </div>
          </TabsContent>

          <TabsContent value="details" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                key="top-products"
              >
                <Card>
                  <CardHeader className="border-b">
                    <CardTitle className="flex items-center gap-2">
                      <Bookmark className="h-5 w-5 text-primary" />
                      Топ продуктов
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {topProducts.length > 0 ? (
                      <div className="space-y-4">
                        {topProducts.map((product, index) => (
                          <div key={`product-${index}`} className="flex items-center justify-between">
                            <div className="flex items-start gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium flex items-center gap-1">
                                  {product.name}
                                  {product.growing && (
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                  )}
                                </p>
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
                  <CardHeader className="border-b">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Последние продажи
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
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
                                  <Badge className="rounded-sm">
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
    </div>
  );
};

export default Statistics;
