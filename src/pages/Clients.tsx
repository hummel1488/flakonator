
import { useState } from "react";
import { motion } from "framer-motion";
import { UsersIcon, Search, UserPlus, Gift, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Clients = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Демо-данные клиентов
  const clients = [
    {
      id: "1",
      name: "Анна Смирнова",
      email: "anna@example.com",
      phone: "+7 (912) 345-67-89",
      purchaseCount: 12,
      totalSpent: 15600,
      loyaltyPoints: 350,
      lastPurchase: "2023-08-15",
      preferences: ["Цветочные", "Сладкие"]
    },
    {
      id: "2",
      name: "Иван Петров",
      email: "ivan@example.com",
      phone: "+7 (923) 456-78-90",
      purchaseCount: 5,
      totalSpent: 6200,
      loyaltyPoints: 120,
      lastPurchase: "2023-09-22",
      preferences: ["Древесные", "Цитрусовые"]
    },
    {
      id: "3",
      name: "Екатерина Иванова",
      email: "ekaterina@example.com",
      phone: "+7 (934) 567-89-01",
      purchaseCount: 8,
      totalSpent: 12400,
      loyaltyPoints: 200,
      lastPurchase: "2023-10-05",
      preferences: ["Ориентальные", "Пряные"]
    }
  ];

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery)
  );

  const sendMessage = (clientId: string) => {
    toast({
      title: "Сообщение отправлено",
      description: `Отправлено напоминание клиенту ID: ${clientId}`,
    });
  };

  const addLoyaltyPoints = (clientId: string) => {
    toast({
      title: "Баллы начислены",
      description: `Бонусные баллы добавлены клиенту ID: ${clientId}`,
    });
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
              <UsersIcon className="h-8 w-8 text-brand-purple" />
              Клиенты
            </h1>
            <p className="text-muted-foreground max-w-xl">
              Управление базой клиентов, программа лояльности и история покупок
            </p>
          </div>
          <Button className="mt-4 md:mt-0" onClick={() => toast({ 
            title: "Новый клиент", 
            description: "Функция добавления нового клиента" 
          })}>
            <UserPlus className="mr-2 h-4 w-4" />
            Добавить клиента
          </Button>
        </div>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Поиск по имени, email или телефону..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <Card key={client.id} className="overflow-hidden">
              <CardHeader className="bg-brand-purple/5 pb-4">
                <CardTitle>{client.name}</CardTitle>
                <CardDescription className="flex flex-col">
                  <span>{client.email}</span>
                  <span>{client.phone}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground text-xs">Покупки</Label>
                      <p className="font-medium">{client.purchaseCount}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Сумма</Label>
                      <p className="font-medium">{client.totalSpent} ₽</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Баллы</Label>
                      <p className="font-medium">{client.loyaltyPoints}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Посл. покупка</Label>
                      <p className="font-medium">
                        {new Date(client.lastPurchase).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Предпочтения</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {client.preferences.map((pref) => (
                        <Badge key={pref} variant="secondary" className="bg-brand-purple/10 text-brand-purple">
                          {pref}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <Button variant="outline" size="sm" onClick={() => sendMessage(client.id)}>
                  <Mail className="h-4 w-4 mr-1" />
                  Написать
                </Button>
                <Button size="sm" className="bg-brand-purple hover:bg-brand-dark-purple" onClick={() => addLoyaltyPoints(client.id)}>
                  <Gift className="h-4 w-4 mr-1" />
                  Начислить баллы
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Clients;
