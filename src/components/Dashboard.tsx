
import { useMemo } from "react";
import { useSales } from "@/hooks/use-sales";
import { useInventory } from "@/hooks/use-inventory";
import { useLocations } from "@/hooks/use-locations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Calendar, AlertTriangle, ShoppingBag } from "lucide-react";
import { formatDistance, subDays } from "date-fns";
import { ru } from "date-fns/locale";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { sales } = useSales();
  const { inventory } = useInventory();
  const { locations } = useLocations();

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

  // Форматирование валюты
  const formatCurrency = (value: number) => {
    return value.toLocaleString("ru-RU") + " ₽";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Обзор бизнеса</h2>
          <p className="text-muted-foreground">Анализ продаж за последние 7 дней</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="gold" 
            onClick={() => navigate("/statistics")}
          >
            <TrendingUp className="h-4 w-4" />
            Полная статистика
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate("/inventory")}
          >
            <ShoppingBag className="h-4 w-4" />
            Управление инвентарем
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              За последние 7 дней
            </p>
          </CardContent>
        </Card>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Товары на исходе
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-brand-gold" />
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
        <Card className="col-span-1">
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
                    <Bar dataKey="value" fill="#E2B393" radius={[0, 4, 4, 0]} />
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

        <Card className="col-span-1">
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
                          <Badge className="bg-brand-light-gold text-brand-DEFAULT">
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
        <Card>
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
                  <Badge className="bg-brand-light-gold text-brand-DEFAULT">
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
                  variant="outline" 
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
    </div>
  );
};
