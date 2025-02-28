
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { format, subDays, isAfter, formatDistance } from "date-fns";
import { ru } from "date-fns/locale";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import { ArrowLeft, Calendar, TrendingUp, Store, ArrowUpRight } from "lucide-react";
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

type DateRangeType = "7days" | "30days" | "90days" | "all";

const COLORS = ["#E2B393", "#1A3B41", "#C89978", "#F0D4B4", "#0D2B31", "#3A3A3A"];

const Statistics = () => {
  const navigate = useNavigate();
  const { sales } = useSales();
  const { locations } = useLocations();
  const [dateRange, setDateRange] = useState<DateRangeType>("30days");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedLocation, setSelectedLocation] = useState<string>("");

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

  // Sales by location
  const salesByLocation = useMemo(() => {
    const dataMap = new Map<string, number>();
    
    // Initialize with all locations (even those without sales)
    locations.forEach(location => {
      dataMap.set(location.id, 0);
    });
    
    // Add sales data
    filteredSales.forEach(sale => {
      const currentValue = dataMap.get(sale.locationId) || 0;
      dataMap.set(sale.locationId, currentValue + sale.total);
    });
    
    // Convert to array for chart
    return Array.from(dataMap).map(([locationId, value]) => {
      const location = locations.find(loc => loc.id === locationId);
      return {
        name: location?.name || "Неизвестно",
        value,
      };
    }).sort((a, b) => b.value - a.value);
  }, [filteredSales, locations]);

  // Sales by product type
  const salesByProductType = useMemo(() => {
    const dataMap = new Map<string, number>();
    
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const size = item.size;
        const sizeLabel = size === "car" ? "Автофлакон" : `${size} мл`;
        const currentValue = dataMap.get(sizeLabel) || 0;
        dataMap.set(sizeLabel, currentValue + (item.price * item.quantity));
      });
    });
    
    return Array.from(dataMap).map(([size, value]) => ({
      name: size,
      value,
    })).sort((a, b) => b.value - a.value);
  }, [filteredSales]);

  // Sales over time
  const salesOverTime = useMemo(() => {
    const dataMap = new Map<string, number>();
    const days = dateRange === "7days" ? 7 
               : dateRange === "30days" ? 30 
               : dateRange === "90days" ? 90 
               : 180; // Limit "all" to 180 days for visualization
    
    // Initialize all dates in range
    for (let i = 0; i < days; i++) {
      const date = subDays(new Date(), i);
      const dateKey = format(date, "yyyy-MM-dd");
      dataMap.set(dateKey, 0);
    }
    
    // Add sales data
    filteredSales.forEach(sale => {
      const saleDate = new Date(sale.date);
      const startDate = subDays(new Date(), days);
      
      if (isAfter(saleDate, startDate)) {
        const dateKey = format(saleDate, "yyyy-MM-dd");
        const currentValue = dataMap.get(dateKey) || 0;
        dataMap.set(dateKey, currentValue + sale.total);
      }
    });
    
    // Convert to array and sort by date
    return Array.from(dataMap)
      .map(([date, value]) => ({
        date,
        value,
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
          revenue: current.revenue + (item.price * item.quantity),
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

  // Format currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString("ru-RU") + " ₽";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
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
            <h1 className="text-2xl font-medium">Статистика</h1>
          </div>
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
            <div className="mt-2 md:mt-0">
              <Select
                value={selectedLocation}
                onValueChange={setSelectedLocation}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Все точки" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Все точки</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <LowStockAlert locationId={selectedLocation || undefined} threshold={3} />
        </motion.div>

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
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Общая выручка
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-brand-gold" />
                  </CardHeader>
                  <CardContent>
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
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Количество продаж
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-brand-gold" />
                  </CardHeader>
                  <CardContent>
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
                  <CardHeader>
                    <CardTitle>Продажи по времени</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      {salesOverTime.length > 0 ? (
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
                            />
                            <RechartsTooltip 
                              formatter={(value) => [formatCurrency(value as number), "Выручка"]}
                              labelFormatter={(label) => `Дата: ${label}`}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke="#E2B393" 
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
                              width={120}
                              tick={{ fontSize: 12 }}
                            />
                            <RechartsTooltip 
                              formatter={(value) => [formatCurrency(value as number), "Выручка"]}
                              labelFormatter={(label) => `Точка: ${label}`}
                            />
                            <Bar dataKey="value" fill="#E2B393" radius={[0, 4, 4, 0]} />
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
    </div>
  );
};

export default Statistics;
