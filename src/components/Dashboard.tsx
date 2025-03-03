
import { useMemo, useState } from "react";
import { useSales } from "@/hooks/use-sales";
import { useInventory } from "@/hooks/use-inventory";
import { useLocations } from "@/hooks/use-locations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area 
} from "recharts";
import { 
  TrendingUp, TrendingDown, Calendar, AlertTriangle, ShoppingBag, 
  Database, BarChart3, Package, DollarSign, Store, Clock, FileDown, 
  Plus, Upload, History
} from "lucide-react";
import { formatDistance, subDays, subMonths, format, startOfMonth, endOfMonth, differenceInMonths } from "date-fns";
import { ru } from "date-fns/locale";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";
import { Separator } from "./ui/separator";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Helper function to normalize perfume names
const normalizePerfumeName = (name: string) => {
  return name.toLowerCase()
    .trim()
    .replace(/\s+/g, '') // Remove all spaces
    .replace(/[^\w\s]/gi, ''); // Remove special characters
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const { sales } = useSales();
  const { inventory } = useInventory();
  const { locations } = useLocations();
  const { isAdmin, isManager, isSeller } = useAuth();
  
  // State for filters
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedSize, setSelectedSize] = useState<string>("all");

  // Calculate date ranges
  const today = new Date();
  const periodRanges = useMemo(() => {
    const currentMonth = {
      start: startOfMonth(today),
      end: today
    };
    
    const previousMonth = {
      start: startOfMonth(subMonths(today, 1)),
      end: endOfMonth(subMonths(today, 1))
    };

    const week = {
      start: subDays(today, 7),
      end: today
    };

    const quarter = {
      start: subMonths(today, 3),
      end: today
    };

    return {
      currentMonth,
      previousMonth,
      week,
      quarter
    };
  }, [today]);

  // Get period dates based on selected period
  const getPeriodDates = () => {
    switch(period) {
      case 'week':
        return periodRanges.week;
      case 'quarter':
        return periodRanges.quarter;
      case 'month':
      default:
        return periodRanges.currentMonth;
    }
  };

  // Filter sales by period
  const filteredSales = useMemo(() => {
    const { start, end } = getPeriodDates();
    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= start && saleDate <= end;
    });
  }, [sales, period]);

  // Filter sales by location if needed
  const locationFilteredSales = useMemo(() => {
    if (selectedLocation === "all") return filteredSales;
    return filteredSales.filter(sale => sale.locationId === selectedLocation);
  }, [filteredSales, selectedLocation]);

  // Выручка за текущий месяц
  const currentMonthRevenue = useMemo(() => {
    return locationFilteredSales.reduce((sum, sale) => sum + sale.total, 0);
  }, [locationFilteredSales]);

  // Выручка за предыдущий месяц
  const previousMonthRevenue = useMemo(() => {
    const { start, end } = periodRanges.previousMonth;
    const prevSales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= start && saleDate <= end;
    });
    
    const filteredPrevSales = selectedLocation === "all" 
      ? prevSales 
      : prevSales.filter(sale => sale.locationId === selectedLocation);
    
    return filteredPrevSales.reduce((sum, sale) => sum + sale.total, 0);
  }, [sales, periodRanges.previousMonth, selectedLocation]);

  // Процент изменения выручки
  const revenueChangePercent = useMemo(() => {
    if (previousMonthRevenue === 0) return 100;
    return ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
  }, [currentMonthRevenue, previousMonthRevenue]);

  // Количество продаж за период
  const salesCount = locationFilteredSales.length;

  // Средний чек
  const averageSale = salesCount > 0 ? currentMonthRevenue / salesCount : 0;

  // Фильтрация инвентаря по локации
  const locationFilteredInventory = useMemo(() => {
    if (selectedLocation === "all") return inventory;
    return inventory.filter(item => item.locationId === selectedLocation);
  }, [inventory, selectedLocation]);

  // Calculate inventory statistics
  const inventoryStats = useMemo(() => {
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

    // Get a set of unique perfume names using proper normalization
    const uniquePerfumeNamesSet = new Set<string>();
    
    // Проверяем каждый элемент инвентаря
    locationFilteredInventory.forEach(item => {
      // Add normalized name to the unique names set
      uniquePerfumeNamesSet.add(normalizePerfumeName(item.name));
      
      // Нормализуем размер к одному из поддерживаемых ключей
      let size = item.size;
      
      // Преобразование значений размера в ключи для статистики
      if (size === "5 мл") size = "5";
      else if (size === "16 мл") size = "16";
      else if (size === "20 мл") size = "20";
      else if (size === "25 мл") size = "25";
      else if (size === "30 мл") size = "30";
      else if (size === "Автофлакон") size = "car";
      
      // Проверяем, что размер существует в нашей статистике
      if (sizeStats[size]) {
        sizeStats[size].count += item.quantity;
        sizeStats[size].value += item.quantity * prices[size];
      } else {
        console.log(`Неизвестный размер: ${size} для товара: ${item.name}`);
      }
    });

    const totalCount = Object.values(sizeStats).reduce((sum, stat) => sum + stat.count, 0);
    const totalValue = Object.values(sizeStats).reduce((sum, stat) => sum + stat.value, 0);
    const uniqueNamesCount = uniquePerfumeNamesSet.size;

    // Convert to format suitable for charts - only include sizes with non-zero counts
    const pieChartData = Object.entries(sizeStats)
      .filter(([_, data]) => data.count > 0) // Only include non-zero items
      .map(([size, data]) => ({
        name: size === "car" ? "Автофлакон" : `${size} мл`,
        value: data.count,
        size
      }));

    // Calculate stock by location
    const stockByLocation = locations.map(location => {
      const locationStock = inventory.filter(item => item.locationId === location.id);
      const totalCount = locationStock.reduce((sum, item) => sum + item.quantity, 0);
      const totalValue = locationStock.reduce((sum, item) => {
        let price = 0;
        let size = item.size;
        
        if (size === "5 мл") price = prices["5"];
        else if (size === "16 мл") price = prices["16"];
        else if (size === "20 мл") price = prices["20"];
        else if (size === "25 мл") price = prices["25"];
        else if (size === "30 мл") price = prices["30"];
        else if (size === "Автофлакон") price = prices["car"];
        
        return sum + (item.quantity * price);
      }, 0);
      
      return {
        id: location.id,
        name: location.name,
        count: totalCount,
        value: totalValue
      };
    });

    return { sizeStats, totalCount, totalValue, uniqueNamesCount, pieChartData, stockByLocation };
  }, [locationFilteredInventory, locations, inventory]);

  // Get sales by perfume name for top 5
  const topPerfumes = useMemo(() => {
    // Create a map to aggregate sales by normalized perfume name
    const perfumeMap = new Map<string, {
      name: string,
      revenue: number,
      quantity: number,
      sizes: Record<string, number>
    }>();
    
    // Process all sales items
    locationFilteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const normalizedName = normalizePerfumeName(item.name);
        
        if (!perfumeMap.has(normalizedName)) {
          perfumeMap.set(normalizedName, {
            name: item.name, // Use the original name for display
            revenue: 0,
            quantity: 0,
            sizes: {}
          });
        }
        
        const perfume = perfumeMap.get(normalizedName)!;
        perfume.revenue += (item.price || 0) * item.quantity;
        perfume.quantity += item.quantity;
        
        // Track which sizes are sold
        if (!perfume.sizes[item.size]) {
          perfume.sizes[item.size] = 0;
        }
        perfume.sizes[item.size] += item.quantity;
      });
    });
    
    // Convert to array and sort by revenue
    return Array.from(perfumeMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5) // Take top 5
      .map(perfume => ({
        ...perfume,
        // Find the most popular size
        popularSize: Object.entries(perfume.sizes)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || ''
      }));
  }, [locationFilteredSales]);

  // Get top 3 locations by sales
  const topLocations = useMemo(() => {
    const locationMap = new Map<string, {
      id: string,
      name: string,
      revenue: number,
      salesCount: number,
      previousRevenue: number
    }>();
    
    // Initialize all locations
    locations.forEach(location => {
      locationMap.set(location.id, {
        id: location.id,
        name: location.name,
        revenue: 0,
        salesCount: 0,
        previousRevenue: 0
      });
    });
    
    // Current period sales
    filteredSales.forEach(sale => {
      const location = locationMap.get(sale.locationId);
      if (location) {
        location.revenue += sale.total;
        location.salesCount++;
      }
    });
    
    // Previous period sales
    const { start: prevStart, end: prevEnd } = periodRanges.previousMonth;
    const prevSales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= prevStart && saleDate <= prevEnd;
    });
    
    prevSales.forEach(sale => {
      const location = locationMap.get(sale.locationId);
      if (location) {
        location.previousRevenue += sale.total;
      }
    });
    
    // Calculate metrics and sort
    return Array.from(locationMap.values())
      .map(location => ({
        ...location,
        averageSale: location.salesCount > 0 ? location.revenue / location.salesCount : 0,
        changePercent: location.previousRevenue > 0 
          ? ((location.revenue - location.previousRevenue) / location.previousRevenue) * 100
          : 0
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3); // Take top 3
  }, [filteredSales, locations, sales, periodRanges]);

  // Items with low stock - фильтруем по выбранной локации
  const lowStockItems = useMemo(() => {
    if (selectedLocation === "all") {
      return inventory.filter(item => item.quantity < 3);
    } else {
      return inventory.filter(item => item.locationId === selectedLocation && item.quantity < 3);
    }
  }, [inventory, selectedLocation]);

  // Get sales data for time chart
  const getSalesTimeData = useMemo(() => {
    const dataMap = new Map<string, { date: string, bottles: number, revenue: number }>();
    
    // Group by date
    locationFilteredSales.forEach(sale => {
      const dateKey = format(new Date(sale.date), 'yyyy-MM-dd');
      
      if (!dataMap.has(dateKey)) {
        dataMap.set(dateKey, {
          date: format(new Date(sale.date), 'dd.MM'),
          bottles: 0,
          revenue: 0
        });
      }
      
      const dateData = dataMap.get(dateKey)!;
      
      // Count bottles
      sale.items.forEach(item => {
        dateData.bottles += item.quantity;
      });
      
      // Add revenue
      dateData.revenue += sale.total;
    });
    
    // Convert to array and sort by date
    return Array.from(dataMap.values())
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [locationFilteredSales]);

  // Форматирование валюты
  const formatCurrency = (value: number) => {
    return value.toLocaleString("ru-RU") + " ₽";
  };

  // Colors for pie chart
  const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57'];

  const getSizeLabel = (size: string) => {
    return size === "car" ? "Автофлакон" : `${size} мл`;
  };

  // Custom label renderer for pie chart to avoid overlap
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.4;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="#333" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
      >
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      {/* Business Overview Section - Only visible for admin */}
      {isAdmin() && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Обзор бизнеса</h2>
            <p className="text-muted-foreground">Анализ данных и статистика</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="admin" 
              onClick={() => navigate("/statistics")}
              className="gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Полная статистика
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/inventory")}
              className="gap-2"
            >
              <ShoppingBag className="h-4 w-4" />
              Управление инвентарем
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/sales")}
              className="gap-2"
            >
              <ShoppingBag className="h-4 w-4" />
              Продажи
            </Button>
          </div>
        </div>
      )}

      {/* Non-admin action buttons */}
      {!isAdmin() && (
        <div className="flex gap-2 mb-6">
          {isManager() && (
            <Button 
              variant="manager" 
              onClick={() => navigate("/inventory")}
              className="gap-2"
            >
              <ShoppingBag className="h-4 w-4" />
              Управление инвентарем
            </Button>
          )}
          {isSeller() && (
            <Button 
              variant="seller" 
              onClick={() => navigate("/sales")}
              className="gap-2"
            >
              <ShoppingBag className="h-4 w-4" />
              Продажи
            </Button>
          )}
        </div>
      )}

      {/* Filters - Only visible for admin */}
      {isAdmin() && (
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Период:</span>
            <Select defaultValue={period} onValueChange={(value: any) => setPeriod(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Выберите период" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Неделя</SelectItem>
                <SelectItem value="month">Месяц</SelectItem>
                <SelectItem value="quarter">Квартал</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Точка:</span>
            <Select defaultValue={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Выберите точку" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все точки</SelectItem>
                {locations.map(location => (
                  <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Main dashboard content for admin */}
      {isAdmin() && (
        <>
          {/* Row 1: Key metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Общая выручка */}
            <Card className="bg-white shadow-md border border-gray-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Общая выручка
                </CardTitle>
                <DollarSign className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(currentMonthRevenue)}</div>
                <div className="flex items-center gap-1 mt-2">
                  <Badge className={revenueChangePercent >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {revenueChangePercent >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(revenueChangePercent).toFixed(1)}%
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    от прошлого {period === 'month' ? 'месяца' : period === 'week' ? 'периода' : 'квартала'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Количество проданных товаров */}
            <Card className="bg-white shadow-md border border-gray-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Количество продаж
                </CardTitle>
                <ShoppingBag className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{salesCount}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Средний чек: {formatCurrency(averageSale)}
                </p>
              </CardContent>
            </Card>

            {/* Товары на исходе */}
            <Card className="bg-white shadow-md border border-gray-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Товары на исходе
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{lowStockItems.length}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Количество товаров с остатком &lt; 3{selectedLocation !== "all" && " в выбранной точке"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Row 2: Inventory Statistics */}
          <Card className="bg-white shadow-md border border-gray-100">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Статистика инвентаря</CardTitle>
              <Database className="h-5 w-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-500 mb-1">Общее количество</div>
                    <div className="text-2xl font-bold">{inventoryStats.totalCount} шт.</div>
                  </CardContent>
                </Card>
                <Card className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-500 mb-1">Общая стоимость</div>
                    <div className="text-2xl font-bold">{formatCurrency(inventoryStats.totalValue)}</div>
                  </CardContent>
                </Card>
                <Card className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-500 mb-1">Количество наименований</div>
                    <div className="text-2xl font-bold">{inventoryStats.uniqueNamesCount} шт.</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Распределение по объемам</h3>
                  <div className="h-[250px]">
                    {inventoryStats.pieChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={inventoryStats.pieChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={renderCustomizedLabel}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {inventoryStats.pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => [`${value} шт.`, "Количество"]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        Нет данных о товарах
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-3">Остатки по точкам</h3>
                  <div className="space-y-3 max-h-[250px] overflow-auto pr-2">
                    {inventoryStats.stockByLocation.map(location => (
                      <div key={location.id} className="flex justify-between items-center p-2 border rounded-md">
                        <div className="font-medium truncate max-w-[200px]">{location.name}</div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{location.count} шт.</Badge>
                          <Badge variant="secondary">{formatCurrency(location.value)}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Row 3: Sales Data */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Perfumes */}
            <Card className="bg-white shadow-md border border-gray-100">
              <CardHeader>
                <CardTitle>ТОП-5 ароматов по продажам</CardTitle>
              </CardHeader>
              <CardContent>
                {topPerfumes.length > 0 ? (
                  <div className="space-y-4">
                    {topPerfumes.map((perfume, index) => (
                      <div key={index} className="flex justify-between items-start border-b pb-3">
                        <div>
                          <p className="font-medium">{perfume.name}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">
                              Продано: {perfume.quantity} шт.
                            </Badge>
                            <Badge variant="outline">
                              Популярный объем: {perfume.popularSize}
                            </Badge>
                          </div>
                        </div>
                        <Badge className="bg-amber-100 text-amber-800">
                          {formatCurrency(perfume.revenue)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    Нет данных о продажах за выбранный период
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Locations */}
            <Card className="bg-white shadow-md border border-gray-100">
              <CardHeader>
                <CardTitle>ТОП-3 точки по продажам</CardTitle>
              </CardHeader>
              <CardContent>
                {topLocations.length > 0 ? (
                  <div className="space-y-4">
                    {topLocations.map((location) => (
                      <div key={location.id} className="flex justify-between items-start border-b pb-3">
                        <div>
                          <p className="font-medium">{location.name}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">
                              Продаж: {location.salesCount}
                            </Badge>
                            <Badge variant="outline">
                              Ср. чек: {formatCurrency(location.averageSale)}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge className="bg-amber-100 text-amber-800">
                            {formatCurrency(location.revenue)}
                          </Badge>
                          {location.previousRevenue > 0 && (
                            <Badge className={location.changePercent >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                              {location.changePercent >= 0 ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                              ) : (
                                <TrendingDown className="h-3 w-3 mr-1" />
                              )}
                              {Math.abs(location.changePercent).toFixed(1)}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    Нет данных о продажах по точкам
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Row 4: Sales Chart */}
          <Card className="bg-white shadow-md border border-gray-100">
            <CardHeader>
              <CardTitle>Динамика продаж</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="revenue">
                <TabsList className="mb-4">
                  <TabsTrigger value="revenue">По выручке</TabsTrigger>
                  <TabsTrigger value="bottles">По флаконам</TabsTrigger>
                </TabsList>
                
                <TabsContent value="revenue">
                  <div className="h-[300px]">
                    {getSalesTimeData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={getSalesTimeData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                          <XAxis dataKey="date" />
                          <YAxis tickFormatter={(value) => `${value / 1000}K`} />
                          <Tooltip formatter={(value) => [formatCurrency(value as number), "Выручка"]} />
                          <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        Нет данных о продажах за выбранный период
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="bottles">
                  <div className="h-[300px]">
                    {getSalesTimeData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={getSalesTimeData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`${value} шт.`, "Флаконов"]} />
                          <Line type="monotone" dataKey="bottles" stroke="#82ca9d" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        Нет данных о продажах за выбранный период
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Row 5: Low Stock Items */}
          <Card className="bg-white shadow-md border border-gray-100">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Товары с критическим остатком</CardTitle>
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              {lowStockItems.length > 0 ? (
                <div className="space-y-4 max-h-[300px] overflow-auto pr-2">
                  {lowStockItems.map((item) => {
                    const location = locations.find(loc => loc.id === item.locationId);
                    return (
                      <div key={item.id} className="flex items-start justify-between border-b pb-3">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">
                              {item.size === "car" ? "Автофлакон" : item.size}
                            </Badge>
                            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                              {location?.name || "Неизвестная точка"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant={item.quantity === 0 ? "destructive" : "secondary"}>
                            Остаток: {item.quantity} шт.
                          </Badge>
                          <Badge variant="outline">
                            Рекомендуется заказать: {Math.max(5 - item.quantity, 0)} шт.
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-[100px] flex items-center justify-center text-muted-foreground">
                  {selectedLocation === "all" 
                    ? "Все товары в достаточном количестве"
                    : "В данной точке все товары в достаточном количестве"
                  }
                </div>
              )}
            </CardContent>
          </Card>

          {/* Row 6: Quick Actions */}
          <Card className="bg-white shadow-md border border-gray-100">
            <CardHeader>
              <CardTitle>Быстрые действия</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button className="gap-2" onClick={() => navigate("/inventory")}>
                  <Upload className="h-4 w-4" />
                  Загрузить остатки
                </Button>
                <Button className="gap-2" variant="outline" onClick={() => navigate("/inventory")}>
                  <Plus className="h-4 w-4" />
                  Добавить новый аромат
                </Button>
                <Button className="gap-2" variant="outline" onClick={() => navigate("/locations")}>
                  <Store className="h-4 w-4" />
                  Добавить точку
                </Button>
                <Button className="gap-2" variant="outline">
                  <FileDown className="h-4 w-4" />
                  Скачать отчёт
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Dashboard;
