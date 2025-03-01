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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

type UserRole = "admin" | "seller" | "manager";

type UserFormData = {
  id?: string;
  name: string;
  password: string;
  role: UserRole;
  locationId?: string;
};

const UserManagement = () => {
  const navigate = useNavigate();
  const { user, isAdmin, MOCK_USERS, addUser, updateUser, deleteUser } = useAuth();
  const { locations } = useLocations();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    password: "",
    role: "seller",
  });

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserFormData | null>(null);
  
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
  
  const handleRoleChange = (role: UserRole) => {
    setFormData((prev) => ({ ...prev, role }));
  };
  
  const handleLocationChange = (locationId: string) => {
    setFormData((prev) => ({ ...prev, locationId }));
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editingUser) {
      setEditingUser({ ...editingUser, [name]: value });
    }
  };

  const handleEditRoleChange = (role: UserRole) => {
    if (editingUser) {
      setEditingUser({ ...editingUser, role });
    }
  };

  const handleEditLocationChange = (locationId: string) => {
    if (editingUser) {
      setEditingUser({ ...editingUser, locationId });
    }
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

  const handleEditUser = (userId: string) => {
    const userToEdit = users.find(u => u.id === userId);
    if (userToEdit) {
      // Don't expose password in the form for security
      setEditingUser({
        id: userToEdit.id,
        name: userToEdit.name,
        password: "", // Empty password initially
        role: userToEdit.role as UserRole,
        locationId: userToEdit.locationId
      });
      setEditDialogOpen(true);
    }
  };

  const handleSaveEdit = () => {
    if (!editingUser) return;

    // Basic validation
    if (!editingUser.name) {
      toast({
        title: "Ошибка",
        description: "Имя пользователя не может быть пустым",
        variant: "destructive"
      });
      return;
    }

    // Validate location for sellers
    if (editingUser.role === "seller" && !editingUser.locationId) {
      toast({
        title: "Требуется точка продаж",
        description: "Для продавца необходимо выбрать точку продаж",
        variant: "destructive"
      });
      return;
    }

    // Get the original user to preserve password if not changed
    const originalUser = users.find(u => u.id === editingUser.id);
    if (!originalUser) return;

    const updatedUser = {
      ...editingUser,
      // Keep the original password if not modified
      password: editingUser.password.trim() === "" ? originalUser.password : editingUser.password
    };

    updateUser(updatedUser);
    setEditDialogOpen(false);
    
    toast({
      title: "Пользователь обновлен",
      description: `Изменения для пользователя ${editingUser.name} сохранены`,
    });
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    
    // Prevent deleting current user
    if (user && user.id === userId) {
      toast({
        title: "Невозможно удалить",
        description: "Вы не можете удалить текущего пользователя",
        variant: "destructive"
      });
      return;
    }

    if (window.confirm(`Вы уверены, что хотите удалить пользователя ${userToDelete?.name}?`)) {
      deleteUser(userId);
      
      toast({
        title: "Пользователь удален",
        description: `Пользователь ${userToDelete?.name} был успешно удален`,
      });
    }
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
                        handleRoleChange(value as UserRole)
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
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleEditUser(user.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDeleteUser(user.id)}
                              >
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

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Редактирование пользователя</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Имя пользователя</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={editingUser.name}
                  onChange={handleEditInputChange}
                  placeholder="Введите имя пользователя"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-password">Пароль</Label>
                <Input
                  id="edit-password"
                  name="password"
                  type="password"
                  value={editingUser.password}
                  onChange={handleEditInputChange}
                  placeholder="Оставьте пустым, чтобы не менять"
                />
                <p className="text-xs text-muted-foreground">
                  Оставьте поле пустым, чтобы сохранить текущий пароль
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-role">Роль</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value) => 
                    handleEditRoleChange(value as UserRole)
                  }
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue placeholder="Выберите роль" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Администратор</SelectItem>
                    <SelectItem value="seller">Продавец</SelectItem>
                    <SelectItem value="manager">Управляющий</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {editingUser.role === "seller" && (
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Точка продаж</Label>
                  <Select
                    value={editingUser.locationId}
                    onValueChange={handleEditLocationChange}
                  >
                    <SelectTrigger id="edit-location">
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
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Отмена</Button>
            </DialogClose>
            <Button onClick={handleSaveEdit}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
