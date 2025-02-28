
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, Users, ShieldAlert, Store, UserCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const UserManagement = () => {
  const navigate = useNavigate();
  const { user, users, createUser, isAdmin } = useAuth();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"seller" | "manager">("seller");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if not admin
  React.useEffect(() => {
    if (!isAdmin()) {
      navigate("/unauthorized");
    }
  }, [isAdmin, navigate]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!newUserName || !newUserPassword) {
        toast({
          title: "Ошибка",
          description: "Пожалуйста, заполните все поля",
          variant: "destructive",
        });
        return;
      }

      const success = await createUser(newUserName, newUserPassword, newUserRole);
      
      if (success) {
        toast({
          title: "Успешно",
          description: `Пользователь ${newUserName} успешно создан`,
        });
        setNewUserName("");
        setNewUserPassword("");
        setNewUserRole("seller");
        setIsDialogOpen(false);
      } else {
        toast({
          title: "Ошибка",
          description: "Пользователь с таким именем уже существует",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при создании пользователя",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch(role) {
      case "admin": return "admin";
      case "seller": return "seller";
      case "manager": return "manager";
      default: return "default";
    }
  };

  const getRoleIcon = (role: string) => {
    switch(role) {
      case "admin": return <ShieldAlert className="h-4 w-4 mr-1" />;
      case "seller": return <Store className="h-4 w-4 mr-1" />;
      case "manager": return <UserCircle className="h-4 w-4 mr-1" />;
      default: return null;
    }
  };

  const getRoleText = (role: string) => {
    switch(role) {
      case "admin": return "Администратор";
      case "seller": return "Продавец";
      case "manager": return "Управляющий";
      default: return role;
    }
  };

  // Filter out the password for display
  const displayUsers = users.map(({ password, ...user }) => user);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Управление пользователями</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="admin">
              <UserPlus className="mr-2 h-4 w-4" /> Создать пользователя
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Создать нового пользователя</DialogTitle>
              <DialogDescription>
                Создайте учетную запись для нового продавца или управляющего.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Имя
                  </Label>
                  <Input
                    id="name"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Пароль
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Роль
                  </Label>
                  <Select
                    value={newUserRole}
                    onValueChange={(value: "seller" | "manager") => setNewUserRole(value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Выберите роль" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seller">Продавец</SelectItem>
                      <SelectItem value="manager">Управляющий</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Создание..." : "Создать"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" /> Список пользователей
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Список всех пользователей системы</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Имя</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Точка продажи</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role as string)} className="flex items-center w-fit">
                      {getRoleIcon(user.role as string)}
                      {getRoleText(user.role as string)}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.locationId || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UserManagement;
