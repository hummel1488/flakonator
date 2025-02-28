
import { useMemo } from "react";
import { useSales } from "@/hooks/use-sales";
import { useInventory } from "@/hooks/use-inventory";
import { useLocations } from "@/hooks/use-locations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, Calendar, AlertTriangle, ShoppingBag, Database, BarChart3 } from "lucide-react";
import { formatDistance, subDays } from "date-fns";
import { ru } from "date-fns/locale";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "./ui/separator";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { sales } = useSales();
  const { inventory } = useInventory();
  const { locations } = useLocations();
  const { isAdmin, isManager, isSeller } = useAuth();

  // Последние 7 дней продаж
  const recentSales = useMemo(() => {
    const today = new Date();
    const sevenDaysAgo = subDays(today, 7);
    return sales.filter(sale => new Date(sale.date) >= sevenDaysAgo);
  }, [sales]);

  // Общая выручка за последние 7 дней
  const totalRevenue = useMemo(() => 
    recentSales.reduce((sum, sale) => sum + sale.total, 0),
  [recentSales]);

  // Общее количество продаж за последние 7 дней
  const totalSales = recentSales.length;

  // Средний чек
  const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;

  // Продажи по точкам
  const salesByLocation = useMemo(() => {
    const dataMap = new Map<string, number>();
    
    // Инициализация со всеми локациями
    locations.forEach(location => {
      dataMap.set(location.id, 0);
    });
    
    // Добавление данных о продажах
    recentSales.forEach(sale => {
      const currentValue = dataMap.get(sale.locationId) || 0;
      dataMap.set(sale.locationId, currentValue + sale.total);
    });
    
    // Преобразование в массив для графика
    return Array.from(dataMap).map(([locationId, value]) => {
      const location = locations.find(loc => loc.id === locationId);
      return {
        name: location?.name || "Неизвестно",
        value,
      };
    }).sort((a, b) => b.value - a.value);
  }, [recentSales, locations]);

  // Товары с низким остатком
  const lowStockItems = useMemo(() => {
    return inventory.filter(item => item.quantity < 3);
  }, [inventory]);

  // Последняя продажа
  const lastSale = useMemo(() => {
    return sales.length > 0 
      ? sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
      : null;
  }, [sales]);

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

    inventory.forEach(item => {
      if (sizeStats[item.size]) {
        sizeStats[item.size].count += item.quantity;
        sizeStats[item.size].value += item.quantity * prices[item.size];
      }
    });

    const totalCount = Object.values(sizeStats).reduce((sum, stat) => sum + stat.count, 0);
    const totalValue = Object.values(sizeStats).reduce((sum, stat) => sum + stat.value, 0);

    // Convert to format suitable for charts - only include sizes with non-zero counts
    const pieChartData = Object.entries(sizeStats)
      .filter(([_, data]) => data.count > 0) // Only include non-zero items
      .map(([size, data]) => ({
        name: size === "car" ? "Автофлакон" : `${size} мл`,
        value: data.count,
        size
      }));

    return { sizeStats, totalCount, totalValue, pieChartData };
  }, [inventory]);

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
          <div className="flex gap-2">
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

      {/* Inventory Statistics - Only visible for admin */}
      {isAdmin() && (
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
                  <div className="text-2xl font-bold">{inventory.length} шт.</div>
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
                <h3 className="text-sm font-medium mb-3">Остатки по объемам</h3>
                <div className="space-y-3">
                  {Object.entries(inventoryStats.sizeStats)
                    .filter(([_, { count }]) => count > 0) // Only show sizes with products
                    .map(([size, { count, value }]) => (
                    <div key={size} className="flex justify-between items-center p-2 border rounded-md">
                      <div className="font-medium">{getSizeLabel(size)}</div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{count} шт.</Badge>
                        <Badge variant="secondary">{formatCurrency(value)}</Badge>
                      </div>
                    </div>
                  ))}
                  {Object.values(inventoryStats.sizeStats).every(({ count }) => count === 0) && (
                    <div className="text-center py-4 text-muted-foreground">
                      Нет данных о товарах
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Show sales stats only for admin */}
      {isAdmin() && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white shadow-md border border-gray-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Общая выручка
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  За последние 7 дней
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-md border border-gray-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Количество продаж
                </CardTitle>
                <Calendar className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSales}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Средний чек: {formatCurrency(averageSale)}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-md border border-gray-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Товары на исходе
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{lowStockItems.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Количество товаров с остатком &lt; 3
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="col-span-1 bg-white shadow-md border border-gray-100">
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
                        <Tooltip 
                          formatter={(value) => [formatCurrency(value as number), "Выручка"]}
                          labelFormatter={(label) => `Точка: ${label}`}
                        />
                        <Bar dataKey="value" fill="#EFBE7D" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      Нет данных о продажах за последние 7 дней
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1 bg-white shadow-md border border-gray-100">
              <CardHeader>
                <CardTitle>Товары с низким остатком</CardTitle>
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
                                {item.size === "car" ? "Автофлакон" : `${item.size} мл`}
                              </Badge>
                              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                                {location?.name || "Неизвестная точка"}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <Badge variant={item.quantity === 0 ? "destructive" : "secondary"}>
                              Остаток: {item.quantity} шт.
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Все товары в достаточном количестве
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {lastSale && (
            <Card className="bg-white shadow-md border border-gray-100">
              <CardHeader>
                <CardTitle>Последняя продажа</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <p className="font-medium">{formatCurrency(lastSale.total)}</p>
                    <p className="text-sm text-muted-foreground">
                      {lastSale.items.length} {lastSale.items.length === 1 ? "товар" : 
                        lastSale.items.length < 5 ? "товара" : "товаров"}
                    </p>
                  </div>
                  <div>
                    <div className="flex gap-2">
                      <Badge variant="outline">
                        {new Date(lastSale.date).toLocaleDateString("ru-RU")}
                      </Badge>
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                        {locations.find(loc => loc.id === lastSale.locationId)?.name || "Неизвестная точка"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDistance(new Date(lastSale.date), new Date(), { 
                        addSuffix: true,
                        locale: ru
                      })}
                    </p>
                  </div>
                  <div>
                    <Button 
                      variant="admin" 
                      size="sm" 
                      onClick={() => navigate("/sales")}
                    >
                      Новая продажа
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
