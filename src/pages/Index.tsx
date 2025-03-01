
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { 
  PlusCircle, 
  BarChart3, 
  Store, 
  ShoppingBag,
  DollarSign,
  Receipt,
  PackageX,
  MapPin,
  Package2,
  Wallet,
  AreaChart,
  Trophy,
  CalendarCheck,
  Truck,
  ClipboardList,
  Megaphone,
  Upload,
  Flower,
  ExternalLink,
  FileText,
  Newspaper,
  AlertTriangle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useInventory } from "@/hooks/use-inventory";
import { useSales } from "@/hooks/use-sales";
import { useLocations } from "@/hooks/use-locations";
import { Separator } from "@/components/ui/separator";

const Index = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isSeller, isManager } = useAuth();
  const { inventory, loading: inventoryLoading } = useInventory();
  const { sales, loading: salesLoading } = useSales();
  const { locations, loading: locationsLoading } = useLocations();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Current date formatted in Russian locale
  const currentDate = format(new Date(), "d MMMM yyyy", { locale: ru });
  
  // Business overview calculations
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthSales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
  });
  
  const totalRevenue = currentMonthSales.reduce((sum, sale) => sum + sale.total, 0);
  const salesCount = currentMonthSales.length;
  const averageCheck = salesCount > 0 ? totalRevenue / salesCount : 0;
  
  // Critical inventory (less than 3 units)
  const criticalInventory = inventory.filter(product => product.quantity < 3 && product.quantity > 0);
  
  // Top 3 locations by revenue
  const locationSales = locations.map(location => {
    const locationSales = currentMonthSales.filter(sale => sale.locationId === location.id);
    const revenue = locationSales.reduce((sum, sale) => sum + sale.total, 0);
    
    // Calculate best selling product for this location
    const productSales: Record<string, number> = {};
    locationSales.forEach(sale => {
      sale.items.forEach(item => {
        const key = item.name;
        productSales[key] = (productSales[key] || 0) + item.quantity;
      });
    });
    
    let bestSellingProduct = "Нет данных";
    let maxSales = 0;
    
    Object.entries(productSales).forEach(([product, sales]) => {
      if (sales > maxSales) {
        maxSales = sales;
        bestSellingProduct = product;
      }
    });
    
    // Calculate inventory count for this location
    const inventoryCount = inventory
      .filter(product => product.locationId === location.id)
      .reduce((sum, product) => sum + product.quantity, 0);
    
    return {
      ...location,
      revenue,
      inventoryCount,
      bestSellingProduct
    };
  })
  .sort((a, b) => b.revenue - a.revenue)
  .slice(0, 3);
  
  // Warehouse statistics
  const totalInventory = inventory.reduce((sum, product) => sum + product.quantity, 0);
  const totalInventoryCost = inventory.reduce((sum, product) => sum + (product.quantity * (product.price || 0)), 0);
  
  // Most popular size calculation
  const sizesSold: Record<string, number> = {};
  sales.forEach(sale => {
    sale.items.forEach(item => {
      const key = item.size;
      sizesSold[key] = (sizesSold[key] || 0) + item.quantity;
    });
  });
  
  let mostPopularSize = "Нет данных";
  let maxSizeCount = 0;
  
  Object.entries(sizesSold).forEach(([size, count]) => {
    if (count > maxSizeCount) {
      maxSizeCount = count;
      mostPopularSize = size;
    }
  });
  
  // Network best seller calculation
  const productSales: Record<string, number> = {};
  sales.forEach(sale => {
    sale.items.forEach(item => {
      const key = item.name;
      productSales[key] = (productSales[key] || 0) + item.quantity;
    });
  });
  
  let networkBestSeller = "Нет данных";
  let maxProductSales = 0;
  
  Object.entries(productSales).forEach(([product, sales]) => {
    if (sales > maxProductSales) {
      maxProductSales = sales;
      networkBestSeller = product;
    }
  });
  
  // Mock tasks and notifications for calendar
  const tasks = [
    { id: 1, title: "Поставка товара", date: "15 июня 2024", icon: <Truck className="h-4 w-4" /> },
    { id: 2, title: "Инвентаризация в ТЦ Галерея", date: "20 июня 2024", icon: <ClipboardList className="h-4 w-4" /> },
    { id: 3, title: "Запуск летней акции", date: "1 июля 2024", icon: <Megaphone className="h-4 w-4" /> }
  ];
  
  // Mock news and updates
  const news = [
    { id: 1, title: "Изменение цен с 1 июля", date: "10 июня 2024", content: "Уважаемые коллеги, с 1 июля 2024 года вступают в силу новые цены на товары." },
    { id: 2, title: "Обновление системы: новая форма отчёта", date: "5 июня 2024", content: "Мы обновили систему формирования отчётов. Теперь можно выгружать данные по проданным ароматам." },
    { id: 3, title: "Важное напоминание: инвентаризация", date: "1 июня 2024", content: "Напоминаем о необходимости провести инвентаризацию на всех точках до конца месяца." }
  ];

  // Actions menu items
  const getActionItems = () => {
    const items = [
      {
        id: "upload-inventory",
        title: "Загрузить остатки",
        description: "Импорт данных об остатках",
        icon: <Upload className="h-6 w-6" />,
        path: "/inventory/import",
        roles: ["admin", "manager"],
        variant: "default" as const
      },
      {
        id: "add-product",
        title: "Добавить аромат",
        description: "Новый товар в каталог",
        icon: <Flower className="h-6 w-6" />,
        path: "/inventory/add",
        roles: ["admin", "manager"],
        variant: "default" as const
      },
      {
        id: "statistics",
        title: "Полная статистика",
        description: "Расширенный анализ данных",
        icon: <ExternalLink className="h-6 w-6" />,
        path: "/statistics",
        roles: ["admin"],
        variant: "default" as const
      },
      {
        id: "operations-log",
        title: "Журнал операций",
        description: "История всех транзакций",
        icon: <FileText className="h-6 w-6" />,
        path: "/sales/history",
        roles: ["admin"],
        variant: "default" as const
      }
    ];

    // Filter items based on user role
    if (isAdmin()) {
      return items;
    } else if (isSeller()) {
      return items.filter(item => item.roles.includes("seller"));
    } else if (isManager()) {
      return items.filter(item => item.roles.includes("manager"));
    }
    
    return [];
  };

  const actionItems = getActionItems();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      <div className="p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-3xl font-bold">
                  Привет, {user?.name || "пользователь"}!
                </h1>
                <p className="text-muted-foreground">{currentDate}</p>
                {user?.locationId && (
                  <div className="flex items-center mt-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    {locations.find(loc => loc.id === user.locationId)?.name || "Точка не указана"}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Business Overview */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-8"
          >
            <h2 className="text-xl font-semibold mb-4">Обзор бизнеса</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div variants={itemVariants}>
                <Card className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 p-2 rounded-full">
                        <DollarSign className="h-5 w-5" />
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-2">Выручка за месяц</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{totalRevenue.toLocaleString()} ₽</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-300 p-2 rounded-full">
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-2">Количество продаж</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{salesCount}</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300 p-2 rounded-full">
                        <Receipt className="h-5 w-5" />
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-2">Средний чек</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{averageCheck.toLocaleString(undefined, { maximumFractionDigits: 0 })} ₽</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="bg-rose-100 text-rose-600 dark:bg-rose-900 dark:text-rose-300 p-2 rounded-full">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-2">Критические остатки</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{criticalInventory.length}</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Top 3 Locations */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-2"
            >
              <h2 className="text-xl font-semibold mb-4">Топ-3 точки продаж</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {locationSales.map((location, index) => (
                  <motion.div key={location.id} variants={itemVariants}>
                    <Card className="overflow-hidden h-full">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className={`
                            ${index === 0 ? "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300" : 
                              index === 1 ? "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300" : 
                              "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300"} 
                            p-2 rounded-full`}
                          >
                            <Store className="h-5 w-5" />
                          </div>
                        </div>
                        <CardTitle className="text-lg mt-2">{location.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Выручка:</span>
                            <span className="font-medium">{location.revenue.toLocaleString()} ₽</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Остаток:</span>
                            <span className="font-medium">{location.inventoryCount} шт.</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Хит продаж:</span>
                            <span className="font-medium truncate max-w-[120px]" title={location.bestSellingProduct}>
                              {location.bestSellingProduct}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Tasks & Calendar */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <h2 className="text-xl font-semibold mb-4">Календарь задач</h2>
              <Card className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {tasks.map((task) => (
                      <motion.div
                        key={task.id}
                        variants={itemVariants}
                        className="flex items-start space-x-3 border-b last:border-0 pb-3 last:pb-0"
                      >
                        <div className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300 p-2 rounded-full">
                          {task.icon}
                        </div>
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-muted-foreground">{task.date}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Warehouse Statistics */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-2"
            >
              <h2 className="text-xl font-semibold mb-4">Статистика по складу</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div variants={itemVariants}>
                  <Card className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300 p-2 rounded-full">
                          <Package2 className="h-5 w-5" />
                        </div>
                      </div>
                      <CardTitle className="text-lg mt-2">Общий остаток</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{totalInventory} шт.</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="bg-cyan-100 text-cyan-600 dark:bg-cyan-900 dark:text-cyan-300 p-2 rounded-full">
                          <Wallet className="h-5 w-5" />
                        </div>
                      </div>
                      <CardTitle className="text-lg mt-2">Стоимость остатков</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{totalInventoryCost.toLocaleString()} ₽</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 p-2 rounded-full">
                          <AreaChart className="h-5 w-5" />
                        </div>
                      </div>
                      <CardTitle className="text-lg mt-2">Популярный объём</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{mostPopularSize}</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300 p-2 rounded-full">
                          <Trophy className="h-5 w-5" />
                        </div>
                      </div>
                      <CardTitle className="text-lg mt-2">Хит продаж</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold truncate" title={networkBestSeller}>
                        {networkBestSeller}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <h2 className="text-xl font-semibold mb-4">Быстрые действия</h2>
              <Card className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {actionItems.map((item) => (
                      <motion.div key={item.id} variants={itemVariants}>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start text-left h-auto py-3"
                          onClick={() => navigate(item.path)}
                        >
                          <div className={`
                            ${item.id === "upload-inventory" ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300" :
                              item.id === "add-product" ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300" :
                              item.id === "statistics" ? "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300" :
                              "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300"
                            } p-2 rounded-full mr-3`
                          }>
                            {item.icon}
                          </div>
                          <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          </div>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* News and Updates */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-8"
          >
            <h2 className="text-xl font-semibold mb-4">Новости и обновления</h2>
            <Card>
              <CardContent className="p-6">
                {news.map((item, index) => (
                  <motion.div 
                    key={item.id} 
                    variants={itemVariants}
                    className={`${index !== news.length - 1 ? 'border-b mb-4 pb-4' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 p-2 rounded-full mt-1">
                        <Newspaper className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-lg">{item.title}</p>
                        <p className="text-sm text-muted-foreground mb-2">{item.date}</p>
                        <p className="text-sm">{item.content}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Index;
