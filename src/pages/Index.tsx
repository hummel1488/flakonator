
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PlusCircle, BarChart3, Store, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const Index = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const menuItems = [
    {
      id: "inventory",
      title: "Инвентарь",
      description: "Управление остатками парфюмерии",
      icon: <PlusCircle className="h-6 w-6" />,
      path: "/inventory",
    },
    {
      id: "sales",
      title: "Продажи",
      description: "Проведение транзакций продаж",
      icon: <ShoppingBag className="h-6 w-6" />,
      path: "/sales",
    },
    {
      id: "locations",
      title: "Точки продаж",
      description: "Управление торговыми точками",
      icon: <Store className="h-6 w-6" />,
      path: "/locations",
    },
    {
      id: "statistics",
      title: "Статистика",
      description: "Анализ продаж и лидеров",
      icon: <BarChart3 className="h-6 w-6" />,
      path: "/statistics",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-light tracking-tight mb-2">
              Scent<span className="font-medium">Track</span>
            </h1>
            <p className="text-gray-500 max-w-md mx-auto">
              Система управления инвентаризацией и продажами парфюмерии
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {menuItems.map((item) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                onHoverStart={() => setHoveredCard(item.id)}
                onHoverEnd={() => setHoveredCard(null)}
              >
                <Card
                  className={`relative overflow-hidden border border-gray-100 transition-all duration-300 ${
                    hoveredCard === item.id
                      ? "shadow-lg scale-[1.02]"
                      : "shadow-sm"
                  }`}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-gray-50 to-white opacity-60 z-0"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: hoveredCard === item.id ? 0.8 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800"
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={{
                      scaleX: hoveredCard === item.id ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  <div className="p-6 relative z-10">
                    <div className="mb-4">{item.icon}</div>
                    <h2 className="text-xl font-medium mb-2">{item.title}</h2>
                    <p className="text-gray-500 mb-6 text-sm">
                      {item.description}
                    </p>
                    <Button
                      onClick={() => navigate(item.path)}
                      className="w-full bg-gray-900 hover:bg-black text-white transition-colors"
                    >
                      Перейти
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        <Separator className="my-12 opacity-30" />

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-gray-400 text-sm"
        >
          <p>ScentTrack | Система управления парфюмерией</p>
        </motion.footer>
      </div>
    </div>
  );
};

export default Index;
