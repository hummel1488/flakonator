
import { motion } from "framer-motion";
import { Megaphone, PlusCircle, Flame, Percent, Calendar, TrendingUp, Instagram, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const Marketing = () => {
  const { toast } = useToast();

  const campaigns = [
    {
      id: "1",
      name: "Летняя распродажа",
      type: "Скидка",
      status: "Активна",
      reach: 2500,
      conversion: 15,
      startDate: "2023-06-15",
      endDate: "2023-08-15",
      budget: 15000,
      spent: 7500,
      channels: ["Email", "Instagram", "Флаеры"]
    },
    {
      id: "2",
      name: "Новая коллекция осень",
      type: "Анонс",
      status: "Подготовка",
      reach: 0,
      conversion: 0,
      startDate: "2023-09-01",
      endDate: "2023-10-01",
      budget: 20000,
      spent: 0,
      channels: ["Instagram", "Сайт"]
    },
    {
      id: "3",
      name: "Программа лояльности",
      type: "Бонусная",
      status: "Активна",
      reach: 1200,
      conversion: 22,
      startDate: "2023-01-01",
      endDate: "2023-12-31",
      budget: 50000,
      spent: 25000,
      channels: ["Email", "SMS", "В магазине"]
    }
  ];

  const channelStats = {
    Instagram: 65,
    Email: 45,
    SMS: 30,
    "В магазине": 80,
    Флаеры: 25,
    Сайт: 50
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Активна":
        return <Badge className="bg-green-500">Активна</Badge>;
      case "Подготовка":
        return <Badge className="bg-yellow-500">Подготовка</Badge>;
      case "Завершена":
        return <Badge variant="outline">Завершена</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Скидка":
        return <Percent className="h-4 w-4" />;
      case "Анонс":
        return <TrendingUp className="h-4 w-4" />;
      case "Бонусная":
        return <Flame className="h-4 w-4" />;
      default:
        return <Megaphone className="h-4 w-4" />;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "Instagram":
        return <Instagram className="h-4 w-4" />;
      case "Email":
        return <Mail className="h-4 w-4" />;
      default:
        return <Megaphone className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-serif mb-2 flex items-center gap-2">
              <Megaphone className="h-8 w-8 text-brand-purple" />
              Маркетинг
            </h1>
            <p className="text-muted-foreground max-w-xl">
              Управление маркетинговыми кампаниями, акциями и программами лояльности
            </p>
          </div>
          <Button className="mt-4 md:mt-0" onClick={() => toast({ 
            title: "Новая кампания", 
            description: "Функция создания новой маркетинговой кампании" 
          })}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Создать кампанию
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Текущие кампании</CardTitle>
              <CardDescription>Общая статистика</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-brand-purple">{campaigns.filter(c => c.status === "Активна").length}</div>
              <p className="text-muted-foreground">из {campaigns.length} всего</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Охват</CardTitle>
              <CardDescription>За последние 30 дней</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-brand-purple">
                {campaigns.reduce((acc, campaign) => acc + campaign.reach, 0).toLocaleString()}
              </div>
              <p className="text-muted-foreground">контактов</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Конверсия</CardTitle>
              <CardDescription>Средний показатель</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-brand-purple">
                {Math.round(campaigns.reduce((acc, campaign) => acc + campaign.conversion, 0) / campaigns.length)}%
              </div>
              <p className="text-muted-foreground">продаж с кампаний</p>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-xl font-medium mb-4">Список кампаний</h2>
        
        <div className="grid grid-cols-1 gap-6">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="overflow-hidden">
              <CardHeader className="bg-brand-purple/5 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{campaign.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      {getTypeIcon(campaign.type)} {campaign.type}
                    </CardDescription>
                  </div>
                  {getStatusBadge(campaign.status)}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Период</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-brand-purple" />
                      <span>
                        {new Date(campaign.startDate).toLocaleDateString('ru-RU')} — 
                        {new Date(campaign.endDate).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Охват / Конверсия</p>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-brand-purple" />
                      <span>{campaign.reach.toLocaleString()} / {campaign.conversion}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Бюджет</p>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{campaign.spent.toLocaleString()} ₽</span>
                        <span className="text-sm text-muted-foreground">{campaign.budget.toLocaleString()} ₽</span>
                      </div>
                      <Progress value={(campaign.spent / campaign.budget) * 100} className="h-2" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Каналы</p>
                  <div className="flex flex-wrap gap-2">
                    {campaign.channels.map((channel) => (
                      <Badge key={channel} variant="outline" className="flex items-center gap-1">
                        {getChannelIcon(channel)}
                        {channel}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end border-t pt-4">
                <Button variant="outline" size="sm" className="mr-2" onClick={() => toast({ 
                  title: "Аналитика", 
                  description: `Подробная аналитика кампании "${campaign.name}"` 
                })}>
                  Аналитика
                </Button>
                <Button size="sm" className="bg-brand-purple hover:bg-brand-dark-purple" onClick={() => toast({ 
                  title: "Редактирование", 
                  description: `Открыто редактирование кампании "${campaign.name}"` 
                })}>
                  Редактировать
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <h2 className="text-xl font-medium mt-8 mb-4">Эффективность каналов</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(channelStats).map(([channel, value]) => (
            <Card key={channel} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {getChannelIcon(channel)}
                  <span className="ml-2">{channel}</span>
                </div>
                <span className="font-medium">{value}%</span>
              </div>
              <Progress value={value} className="h-2" />
            </Card>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Marketing;
