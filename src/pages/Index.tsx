
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  PlusCircle, 
  BarChart3, 
  Store, 
  ShoppingBag, 
  Users, 
  Megaphone, 
  GraduationCap,
  SparklesIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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
    {
      id: "clients",
      title: "Клиенты",
      description: "База клиентов и программа лояльности",
      icon: <Users className="h-6 w-6" />,
      path: "/clients",
      isNew: true,
    },
    {
      id: "marketing",
      title: "Маркетинг",
      description: "Кампании, акции и продвижение",
      icon: <Megaphone className="h-6 w-6" />,
      path: "/marketing",
      isNew: true,
    },
    {
      id: "training",
      title: "Обучение",
      description: "Материалы для команды продаж",
      icon: <GraduationCap className="h-6 w-6" />,
      path: "/training",
      isNew: true,
    },
  ];

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
    <div className="min-h-screen bg-gradient-to-b from-white to-brand-purple/5 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center mb-6">
              <img 
                src="/lovable-uploads/68b9ed5b-c4d4-44be-bf47-99958ce5197f.png" 
                alt="âme logo" 
                className="h-24 md:h-32"
              />
            </div>
            <h2 className="text-sm uppercase font-light tracking-widest text-brand-gray mb-8">
              когда аромат говорит за вас
            </h2>
            <div className="bg-gradient-to-r from-brand-purple/20 to-brand-purple/10 p-4 rounded-lg max-w-xl mx-auto mb-8">
              <p className="text-gray-700">
                Система управления инвентаризацией и продажами парфюмерии
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
                    className="absolute inset-0 bg-gradient-to-r from-brand-purple/5 to-brand-light-purple/10 opacity-60 z-0"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: hoveredCard === item.id ? 0.8 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-1 bg-brand-purple"
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={{
                      scaleX: hoveredCard === item.id ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  <div className="p-6 relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-brand-purple/10 p-2 rounded-full">
                        {item.icon}
                      </div>
                      {item.isNew && (
                        <Badge className="bg-brand-purple text-white">Новое</Badge>
                      )}
                    </div>
                    <h2 className="text-xl font-medium mb-2">{item.title}</h2>
                    <p className="text-gray-500 mb-6 text-sm">
                      {item.description}
                    </p>
                    <Button
                      onClick={() => navigate(item.path)}
                      className="w-full bg-brand-purple hover:bg-brand-dark-purple text-white transition-colors"
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
          <div className="flex items-center justify-center gap-2 mb-2">
            <SparklesIcon className="h-4 w-4 text-brand-purple" />
            <p className="font-serif text-lg text-brand-purple">âme</p>
            <SparklesIcon className="h-4 w-4 text-brand-purple" />
          </div>
          <p>Система управления парфюмерным бизнесом</p>
        </motion.footer>
      </div>
    </div>
  );
};

export default Index;
