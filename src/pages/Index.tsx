
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  PlusCircle, 
  BarChart3, 
  Store, 
  ShoppingBag, 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dashboard } from "@/components/Dashboard";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAdmin, isSeller, isManager } = useAuth();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const getMenuItems = () => {
    const items = [
      {
        id: "inventory",
        title: "Инвентарь",
        description: "Управление остатками парфюмерии",
        icon: <PlusCircle className="h-6 w-6" />,
        path: "/inventory",
        roles: ["admin", "manager"],
        variant: isAdmin() ? "admin" : "manager"
      },
      {
        id: "sales",
        title: "Продажи",
        description: "Проведение транзакций продаж",
        icon: <ShoppingBag className="h-6 w-6" />,
        path: "/sales",
        roles: ["admin", "seller"],
        variant: isAdmin() ? "admin" : "seller"
      },
      {
        id: "locations",
        title: "Точки продаж",
        description: "Управление торговыми точками",
        icon: <Store className="h-6 w-6" />,
        path: "/locations",
        roles: ["admin"],
        variant: "admin" as const
      },
      {
        id: "statistics",
        title: "Статистика",
        description: "Анализ продаж и лидеров",
        icon: <BarChart3 className="h-6 w-6" />,
        path: "/statistics",
        roles: ["admin"],
        variant: "admin" as const
      },
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

  const menuItems = getMenuItems();

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
      <div className="p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-12"
          >
            <Dashboard />
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {menuItems.map((item) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                onHoverStart={() => setHoveredCard(item.id)}
                onHoverEnd={() => setHoveredCard(null)}
              >
                <Card
                  className={`relative overflow-hidden border glass-card transition-all duration-300 ${
                    hoveredCard === item.id
                      ? "shadow-lg scale-[1.02]"
                      : "shadow-sm"
                  }`}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 opacity-60 z-0"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: hoveredCard === item.id ? 0.8 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.div
                    className={`absolute bottom-0 left-0 right-0 h-1 ${
                      item.variant === "admin" ? "bg-indigo-500" :
                      item.variant === "seller" ? "bg-blue-500" :
                      "bg-teal-500"
                    }`}
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={{
                      scaleX: hoveredCard === item.id ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  <div className="p-6 relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`
                        ${item.variant === "admin" ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300" :
                          item.variant === "seller" ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300" :
                          "bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-300"
                        } p-2 rounded-full`
                      }>
                        {item.icon}
                      </div>
                    </div>
                    <h2 className="text-xl font-medium mb-2">{item.title}</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                      {item.description}
                    </p>
                    <Button
                      onClick={() => navigate(item.path)}
                      className="w-full"
                      variant={item.variant}
                    >
                      Перейти
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Index;
