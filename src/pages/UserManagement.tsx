
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocations } from "@/hooks/use-locations";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { UserPlus, ArrowLeft, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

type UserFormData = {
  name: string;
  password: string;
  role: "admin" | "seller" | "manager";
  locationId?: string;
};

const UserManagement = () => {
  const navigate = useNavigate();
  const { user, isAdmin, MOCK_USERS, addUser } = useAuth();
  const { locations } = useLocations();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    password: "",
    role: "seller",
  });
  
  const [users, setUsers] = useState(MOCK_USERS || []);
  
  useEffect(() => {
    if (!isAdmin()) {
      navigate("/unauthorized");
    }
    
    // Update users when MOCK_USERS changes
    if (MOCK_USERS) {
      setUsers(MOCK_USERS);
    }
  }, [isAdmin, navigate, MOCK_USERS]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleRoleChange = (role: "admin" | "seller" | "manager") => {
    setFormData((prev) => ({ ...prev, role }));
  };
  
  const handleLocationChange = (locationId: string) => {
    setFormData((prev) => ({ ...prev, locationId }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.password) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все обязательные поля",
        variant: "destructive"
      });
      return;
    }
    
    // Additional validation for sellers requiring location
    if (formData.role === "seller" && !formData.locationId) {
      toast({
        title: "Требуется точка продаж",
        description: "Для продавца необходимо выбрать точку продаж",
        variant: "destructive"
      });
      return;
    }
    
    const newUser = {
      id: Date.now().toString(),
      ...formData,
    };
    
    addUser(newUser);
    
    toast({
      title: "Пользователь создан",
      description: `Пользователь ${formData.name} успешно создан`,
    });
    
    // Reset form
    setFormData({
      name: "",
      password: "",
      role: "seller",
      locationId: undefined,
    });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      <div className="p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              className="mr-4"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Назад
            </Button>
            <h1 className="text-2xl font-bold">Управление пользователями</h1>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* User creation form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-1"
            >
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Создать пользователя
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Имя пользователя</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Введите имя пользователя"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Пароль</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Введите пароль"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Роль</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => 
                        handleRoleChange(value as "admin" | "seller" | "manager")
                      }
                    >
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Выберите роль" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Администратор</SelectItem>
                        <SelectItem value="seller">Продавец</SelectItem>
                        <SelectItem value="manager">Управляющий</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {formData.role === "seller" && (
                    <div className="space-y-2">
                      <Label htmlFor="location">Точка продаж</Label>
                      <Select
                        value={formData.locationId}
                        onValueChange={handleLocationChange}
                      >
                        <SelectTrigger id="location">
                          <SelectValue placeholder="Выберите точку продаж" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <Button type="submit" className="w-full mt-6">
                    Создать пользователя
                  </Button>
                </form>
              </Card>
            </motion.div>
            
            {/* Users list */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-2"
            >
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">
                  Список пользователей
                </h2>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Имя</TableHead>
                      <TableHead>Роль</TableHead>
                      <TableHead>Точка продаж</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => {
                      const userLocation = locations.find(
                        (location) => location.id === user.locationId
                      );
                      
                      return (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>
                            {user.role === "admin" && "Администратор"}
                            {user.role === "seller" && "Продавец"}
                            {user.role === "manager" && "Управляющий"}
                          </TableCell>
                          <TableCell>
                            {userLocation ? userLocation.name : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    
                    {users.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                          Нет пользователей для отображения
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
