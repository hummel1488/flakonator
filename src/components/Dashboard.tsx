
import { useMemo, useState } from "react";
import { useSales } from "@/hooks/use-sales";
import { useInventory } from "@/hooks/use-inventory";
import { useLocations } from "@/hooks/use-locations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, Calendar, AlertTriangle, ShoppingBag, Database, BarChart3, Package, DollarSign, Bookmark, Droplet, TrendingDown } from "lucide-react";
import { formatDistance, subDays, startOfMonth } from "date-fns";
import { ru } from "date-fns/locale";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "./ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { Progress } from "@/components/ui/progress";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { sales } = useSales();
  const { inventory } = useInventory();
  const { locations } = useLocations();
  const { isAdmin, isManager, isSeller } = useAuth();
  const isMobile = useIsMobile();
  const [showChart, setShowChart] = useState(!isMobile);

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
    const sizeStats: Record<string, { count: number, value: number, color: string, startCount: number }> = {
      "5": { count: 0, value: 0, color: "#8884d8", startCount: 0 },
      "16": { count: 0, value: 0, color: "#83a6ed", startCount: 0 },
      "20": { count: 0, value: 0, color: "#8dd1e1", startCount: 0 },
      "25": { count: 0, value: 0, color: "#82ca9d", startCount: 0 },
      "30": { count: 0, value: 0, color: "#a4de6c", startCount: 0 },
      "car": { count: 0, value: 0, color: "#d0ed57", startCount: 0 },
    };

    // Simulate start of month data (for demonstration purposes)
    const startOfMonthData = {
      "5": 30,
      "16": 25,
      "20": 20,
      "25": 15,
      "30": 10,
      "car": 20
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

    // Проверяем каждый элемент инвентаря
    inventory.forEach(item => {
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
        // For demonstration, set the start of month count
        sizeStats[size].startCount = startOfMonthData[size];
      } else {
        console.log(`Неизвестный размер: ${size} для товара: ${item.name}`);
      }
    });

    const totalCount = Object.values(sizeStats).reduce((sum, stat) => sum + stat.count, 0);
    const totalValue = Object.values(sizeStats).reduce((sum, stat) => sum + stat.value, 0);
    const totalStartCount = Object.values(sizeStats).reduce((sum, stat) => sum + stat.startCount, 0);

    // Convert to format suitable for charts - only include sizes with non-zero counts
    const pieChartData = Object.entries(sizeStats)
      .filter(([_, data]) => data.count > 0) // Only include non-zero items
      .map(([size, data]) => ({
        name: size === "car" ? "Автофлакон" : `${size} мл`,
        value: data.count,
        size,
        color: data.color
      }));

    // Sort sizes by count (ascending) for display
    const sortedSizes = Object.entries(sizeStats)
      .sort(([_, a], [__, b]) => a.count - b.count)
      .filter(([_, data]) => data.count > 0); // Only include non-zero items

    return { 
      sizeStats, 
      totalCount, 
      totalValue, 
      pieChartData, 
      sortedSizes,
      totalStartCount 
    };
  }, [inventory]);

  // Calculate recommendations
  const recommendations = useMemo(() => {
    const result = [];
    const threshold = 0.05; // 5% threshold
    
    if (inventoryStats.totalCount > 0) {
      for (const [size, data] of Object.entries(inventoryStats.sizeStats)) {
        const percentage = data.count / inventoryStats.totalCount;
        if (percentage < threshold && data.count > 0) {
          const recommendedAmount = Math.ceil(inventoryStats.totalCount * 0.1); // recommend 10% of total
          result.push({
            size,
            currentCount: data.count,
            recommendedAmount
          });
        }
      }
    }
    
    return result;
  }, [inventoryStats]);

  // Форматирование валюты
  const formatCurrency = (value: number) => {
    return value.toLocaleString("ru-RU") + " ₽";
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

  const getSizeLabel = (size: string) => {
    return size === "car" ? "Автофлакон" : `${size} мл`;
  };

  // Calculate percentage change
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return (current - previous) / previous * 100;
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
        <Card className="bg-white shadow-lg border border-gray-100">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-amber-500" />
              <CardTitle className="text-3xl">Статистика инвентаря</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="shadow-md p-2 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-500 mb-1">Общее количество</div>
                    <Package className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="text-3xl font-bold">{inventoryStats.totalCount} шт.</div>
                </CardContent>
              </Card>
              <Card className="shadow-md p-2 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-500 mb-1">Общая стоимость</div>
                    <DollarSign className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="text-3xl font-bold">{formatCurrency(inventoryStats.totalValue)}</div>
                </CardContent>
              </Card>
              <Card className="shadow-md p-2 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-500 mb-1">Количество наименований</div>
                    <Bookmark className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="text-3xl font-bold">{inventory.length} шт.</div>
                </CardContent>
              </Card>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div className="text-xl font-semibold mb-2">Динамика</div>
              </div>
              <Card className="shadow-sm p-4 mb-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <span className="text-gray-500">Было в начале месяца:</span>
                    <span className="font-bold ml-2">{inventoryStats.totalStartCount} флаконов</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Осталось сейчас:</span>
                    <span className="font-bold ml-2">{inventoryStats.totalCount} флаконов</span>
                  </div>
                  <div>
                    {calculateChange(inventoryStats.totalCount, inventoryStats.totalStartCount) < -20 ? (
                      <div className="flex items-center text-red-500">
                        <span>Спад</span>
                        <TrendingDown className="h-4 w-4 ml-1" />
                      </div>
                    ) : calculateChange(inventoryStats.totalCount, inventoryStats.totalStartCount) > 20 ? (
                      <div className="flex items-center text-green-500">
                        <span>Рост</span>
                        <TrendingUp className="h-4 w-4 ml-1" />
                      </div>
                    ) : (
                      <span className="text-gray-500">Стабильно</span>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Распределение по объемам</h3>
                {isMobile ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowChart(!showChart)}
                    className="w-full mb-4"
                  >
                    {showChart ? "Скрыть диаграмму" : "Показать диаграмму"}
                  </Button>
                ) : null}
                
                {(!isMobile || showChart) && (
                  <div className="h-[350px]">
                    {inventoryStats.pieChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={inventoryStats.pieChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {inventoryStats.pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => [`${value} шт.`, "Количество"]}
                          />
                          <Legend
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        Нет данных о товарах
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Остатки по объемам</h3>
                <div className="space-y-4 px-2">
                  {inventoryStats.sortedSizes.map(([size, { count, value, color, startCount }]) => {
                    const percentage = (count / inventoryStats.totalCount) * 100;
                    const changePercent = calculateChange(count, startCount);
                    
                    return (
                      <div key={size} className="p-4 border rounded-md shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <Droplet className="h-4 w-4" style={{ color }} />
                            <div className="font-medium">{getSizeLabel(size)}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{count} шт.</Badge>
                            <Badge variant="secondary">{formatCurrency(value)}</Badge>
                            {changePercent < -20 && (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                            {changePercent > 20 && (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" style={{ 
                          '--tw-gradient-from': color,
                          '--tw-gradient-to': `${color}99`
                        } as React.CSSProperties} />
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-gray-500">Было: {startCount} шт.</span>
                          <span className="text-xs text-gray-500">{percentage.toFixed(1)}% от общего</span>
                        </div>
                      </div>
                    );
                  })}
                  {inventoryStats.sortedSizes.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      Нет данных о товарах
                    </div>
                  )}
                </div>
              </div>
            </div>

            {recommendations.length > 0 && (
              <div className="mt-8">
                <Card className="bg-amber-50 border-amber-200">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      Рекомендуемые действия
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {recommendations.map((rec) => (
                        <li key={rec.size} className="text-sm">
                          Рекомендуем заказать <strong>{rec.recommendedAmount}</strong> флаконов 
                          <strong> {getSizeLabel(rec.size)}</strong>, иначе к концу недели может возникнуть дефицит.
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}
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
                                {item.size === "car" ? "Автофлакон" : `${item.size}`}
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
