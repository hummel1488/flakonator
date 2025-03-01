import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Clock,
  Download,
  FileSpreadsheet,
  FilePlus2,
  MapPin,
  Plus,
  RefreshCw,
  Calendar,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart as RechartBarChart,
  Bar,
  Legend
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useInventory } from "@/hooks/use-inventory";
import { useLocations } from "@/hooks/use-locations";
import { useSales } from "@/hooks/use-sales";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";

const salesData = [
  { name: "01/03", value: 42000 },
  { name: "02/03", value: 38000 },
  { name: "03/03", value: 45000 },
  { name: "04/03", value: 37000 },
  { name: "05/03", value: 41000 },
  { name: "06/03", value: 52000 },
  { name: "07/03", value: 72000 },
];

const locationPerformance = [
  { name: "Ботаника", sales: 82, revenue: 98000 },
  { name: "Гагарин", sales: 75, revenue: 85000 },
  { name: "Карнавал", sales: 62, revenue: 72000 },
  { name: "Башня", sales: 58, revenue: 65000 },
  { name: "Соболева", sales: 45, revenue: 53000 },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { inventory } = useInventory();
  const { locations } = useLocations();
  const { sales } = useSales();
  const { toast } = useToast();
  const [period, setPeriod] = useState("week");

  const totalInventory = inventory.reduce((sum, item) => sum + item.quantity, 0);

  const inventoryBySize = inventory.reduce((acc, item) => {
    const { size, quantity } = item;
    acc[size] = (acc[size] || 0) + quantity;
    return acc;
  }, {} as Record<string, number>);

  const sortedInventory = [...inventory].sort((a, b) => a.quantity - b.quantity);
  const lowStockProducts = sortedInventory.slice(0, 5);
  const highStockProducts = [...sortedInventory].reverse().slice(0, 5);

  const todaySales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    const today = new Date();
    return saleDate.toDateString() === today.toDateString();
  });

  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const todayItems = todaySales.reduce((sum, sale) => 
    sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

  const productSalesMap = new Map<string, number>();
  
  sales.forEach(sale => {
    sale.items.forEach(item => {
      const key = item.name;
      productSalesMap.set(key, (productSalesMap.get(key) || 0) + item.quantity);
    });
  });

  const topSellingProducts = Array.from(productSalesMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, quantity]) => ({ name, quantity }));

  const locationSalesMap = new Map<string, number>();
  
  sales.forEach(sale => {
    const locationId = sale.locationId;
    locationSalesMap.set(locationId, (locationSalesMap.get(locationId) || 0) + sale.total);
  });

  const topLocations = Array.from(locationSalesMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([locationId, revenue]) => {
      const location = locations.find(loc => loc.id === locationId);
      return { 
        name: location ? location.name : "Неизвестная точка", 
        revenue 
      };
    });

  const activityLog = [
    { id: 1, type: "import", user: "Администратор", action: "Импорт остатков", date: "01.03.2025 14:23" },
    { id: 2, type: "adjust", user: "Менеджер", action: "Корректировка количества", date: "01.03.2025 12:10" },
    { id: 3, type: "add", user: "Администратор", action: "Добавление товара", date: "28.02.2025 16:45" },
    { id: 4, type: "sale", user: "Продавец", action: "Продажа товара", date: "28.02.2025 15:32" },
  ];

  const handleUploadInventory = () => {
    navigate("/data-management");
    toast({
      title: "Переход к управлению данными",
      description: "Вы можете загрузить остатки товаров здесь",
    });
  };

  const handleAddProduct = () => {
    navigate("/inventory");
    toast({
      title: "Переход к инвентарю",
      description: "Вы можете добавить новый аромат здесь",
    });
  };

  const handleManageLocations = () => {
    navigate("/locations");
    toast({
      title: "Управление точками продаж",
      description: "Вы можете редактировать точки продаж здесь",
    });
  };

  const handleDownloadReport = () => {
    toast({
      title: "Скачивание отчета",
      description: "Функция скачивания отчета будет доступна в ближайшее время",
    });
  };

  const handleShowAllLowStock = () => {
    navigate("/inventory", { state: { filter: "low-stock" } });
  };

  const handleShowAllHighStock = () => {
    navigate("/inventory", { state: { filter: "high-stock" } });
  };

  const handleShowAllSales = () => {
    navigate("/sales");
  };

  const handleRefreshActivityLog = () => {
    toast({
      title: "Обновление журнала",
      description: "Журнал операций обновлен",
    });
  };

  const handleShowFullLog = () => {
    toast({
      title: "Полный журнал",
      description: "Функция просмотра полного журнала будет доступна в ближайшее время",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">Панель управления</h1>
            <p className="text-gray-500">
              Обзор ключевых показателей и аналитика по продажам и остаткам
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Общий остаток</CardTitle>
                  <CardDescription>По всем точкам продаж</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-2">{totalInventory} флаконов</div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {Object.entries(inventoryBySize).map(([size, count]) => (
                      <div key={size} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm font-medium">
                          {size === "car" ? "Автофлакон" : `${size} мл`}:
                        </span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Продажи за сегодня</CardTitle>
                  <CardDescription>Общие показатели</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Продано</p>
                      <p className="text-2xl font-bold">{todayItems} флаконов</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Выручка</p>
                      <p className="text-2xl font-bold">{todayRevenue.toLocaleString()} ₽</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Select defaultValue={period} onValueChange={setPeriod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите период" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">За сегодня</SelectItem>
                        <SelectItem value="week">За неделю</SelectItem>
                        <SelectItem value="month">За месяц</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Быстрые действия</CardTitle>
                  <CardDescription>Часто используемые операции</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={handleUploadInventory}
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Загрузить остатки
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={handleAddProduct}
                  >
                    <FilePlus2 className="mr-2 h-4 w-4" />
                    Добавить аромат
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline" 
                    onClick={handleManageLocations}
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Управление точками
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={handleDownloadReport}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Скачать отчет
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-amber-600 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Заканчиваются
                  </CardTitle>
                  <CardDescription>Товары с минимальными остатками</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {lowStockProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-2 rounded bg-amber-50"
                      >
                        <span className="font-medium text-sm">{product.name}</span>
                        <Badge variant="outline" className="bg-white">
                          {product.quantity} шт
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    variant="link" 
                    className="w-full" 
                    size="sm"
                    onClick={handleShowAllLowStock}
                  >
                    Показать все
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">ТОП-5 по остаткам</CardTitle>
                  <CardDescription>Товары с максимальными остатками</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {highStockProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-2 rounded bg-gray-50"
                      >
                        <span className="font-medium text-sm">{product.name}</span>
                        <Badge variant="outline" className="bg-white">
                          {product.quantity} шт
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    variant="link" 
                    className="w-full" 
                    size="sm"
                    onClick={handleShowAllHighStock}
                  >
                    Показать все
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">ТОП-5 продаж</CardTitle>
                  <CardDescription>Самые популярные ароматы</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {topSellingProducts.map((product, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded bg-gray-50"
                      >
                        <span className="font-medium text-sm">{product.name}</span>
                        <Badge variant="outline" className="bg-white">
                          {product.quantity} шт
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    variant="link" 
                    className="w-full" 
                    size="sm"
                    onClick={handleShowAllSales}
                  >
                    Показать все
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Динамика продаж</CardTitle>
                  <CardDescription>За последнюю неделю</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={salesData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">ТОП точек продаж</CardTitle>
                  <CardDescription>Лидеры по выручке</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartBarChart
                        data={locationPerformance}
                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="sales" name="Продажи (шт)" fill="#8884d8" />
                        <Bar dataKey="revenue" name="Выручка (₽)" fill="#82ca9d" />
                      </RechartBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 gap-6 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-medium">Журнал операций</CardTitle>
                    <CardDescription>История действий в системе</CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-auto"
                    onClick={handleRefreshActivityLog}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Обновить
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activityLog.map((log) => (
                      <div key={log.id} className="flex items-start space-x-4 p-3 rounded-md bg-gray-50">
                        <div className="flex-shrink-0">
                          {log.type === "import" && (
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                            </div>
                          )}
                          {log.type === "adjust" && (
                            <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                              <RefreshCw className="h-5 w-5 text-yellow-600" />
                            </div>
                          )}
                          {log.type === "add" && (
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <Plus className="h-5 w-5 text-green-600" />
                            </div>
                          )}
                          {log.type === "sale" && (
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <BarChart className="h-5 w-5 text-purple-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="text-sm font-medium">{log.action}</h4>
                            <span className="text-xs text-gray-500">{log.date}</span>
                          </div>
                          <p className="text-sm text-gray-500">Пользователь: {log.user}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="link" 
                    className="w-full" 
                    size="sm"
                    onClick={handleShowFullLog}
                  >
                    Показать полный журнал
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-6 mb-12"
          >
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Системная информация</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="h-5 w-5 text-gray-500" />
                      <h3 className="text-sm font-medium">Последний импорт</h3>
                    </div>
                    <p className="text-lg">01.03.2025 14:23</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <h3 className="text-sm font-medium">Последняя инвентаризация</h3>
                    </div>
                    <p className="text-lg">25.02.2025</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-2 mb-2">
                      <BarChart className="h-5 w-5 text-gray-500" />
                      <h3 className="text-sm font-medium">Средний чек</h3>
                    </div>
                    <p className="text-lg">1 850 ₽</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
