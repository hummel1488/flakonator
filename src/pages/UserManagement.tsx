
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Plus, Edit, Eye, Trash } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Define a log entry type
interface LogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
  details?: string;
}

const UserManagement = () => {
  const { user: currentUser, isAdmin } = useAuth();
  
  const [users, setUsers] = useState<any[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedUserLogs, setSelectedUserLogs] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка пользователей из Supabase
  useEffect(() => {
    fetchUsers();
    
    // Загрузка логов
    const storedLogs = localStorage.getItem('userLogs');
    if (storedLogs) {
      setLogs(JSON.parse(storedLogs));
    } else {
      // Create some demo logs for testing
      const demoLogs: LogEntry[] = [
        {
          id: '1',
          userId: '1',
          userName: 'Администратор',
          action: 'Вход в систему',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '2',
          userId: '2',
          userName: 'Продавец',
          action: 'Создание продажи',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          details: 'Продажа #12345 на сумму 5000 р.'
        },
        {
          id: '3',
          userId: '3',
          userName: 'Управляющий',
          action: 'Обновление инвентаря',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          details: 'Добавлено 10 единиц товара "Рубашка"'
        }
      ];
      setLogs(demoLogs);
      localStorage.setItem('userLogs', JSON.stringify(demoLogs));
    }
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*');

      if (error) {
        throw error;
      }

      if (data) {
        setUsers(data);
      }
    } catch (error: any) {
      console.error('Ошибка при загрузке пользователей:', error.message);
      toast.error('Не удалось загрузить пользователей');
      
      // Если не удалось загрузить из Supabase, используем демо-данные
      const demoUsers = [
        { id: "1", name: "Администратор", role: "admin", email: "admin@example.com" },
        { id: "2", name: "Продавец", role: "seller", email: "seller@example.com" },
        { id: "3", name: "Управляющий", role: "manager", email: "manager@example.com" },
      ];
      setUsers(demoUsers);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle user editing
  const handleEditUser = (user: any) => {
    setEditingUser({...user});
    setIsEditModalOpen(true);
  };

  // Function to handle user addition
  const handleAddUser = () => {
    setEditingUser({
      id: '',
      name: '',
      role: 'seller',
      email: '',
      password: ''
    });
    setIsAddModalOpen(true);
  };

  // Function to save edited user
  const saveUser = async () => {
    if (!editingUser) return;
    
    try {
      setIsSubmitting(true);
      
      // Check if required fields are filled
      if (!editingUser.name || !editingUser.role) {
        toast.error("Пожалуйста, заполните все обязательные поля");
        setIsSubmitting(false);
        return;
      }
      
      if (isAddModalOpen) {
        if (!editingUser.email || !editingUser.password) {
          toast.error("Пожалуйста, укажите email и пароль для нового пользователя");
          setIsSubmitting(false);
          return;
        }
        
        // Регистрация пользователя через Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: editingUser.email,
          password: editingUser.password,
        });
        
        if (authError) {
          throw authError;
        }
        
        if (authData.user) {
          // Создание профиля пользователя
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert([
              { 
                id: authData.user.id,
                name: editingUser.name,
                role: editingUser.role
              }
            ]);
            
          if (profileError) {
            throw profileError;
          }
          
          // Перезагрузка списка пользователей
          fetchUsers();
          
          // Add log entry for creating a user
          addLogEntry({
            userId: currentUser?.id || '',
            userName: currentUser?.name || '',
            action: 'Создание пользователя',
            details: `Создан пользователь ${editingUser.name} с ролью ${translateRole(editingUser.role)}`
          });
          
          toast.success("Пользователь создан");
          setIsAddModalOpen(false);
        }
      } else {
        // Обновление профиля пользователя
        const { error } = await supabase
          .from('user_profiles')
          .update({ 
            name: editingUser.name,
            role: editingUser.role
          })
          .eq('id', editingUser.id);
          
        if (error) {
          throw error;
        }
        
        // Перезагрузка списка пользователей
        fetchUsers();
        
        // Add log entry for updating a user
        addLogEntry({
          userId: currentUser?.id || '',
          userName: currentUser?.name || '',
          action: 'Обновление пользователя',
          details: `Обновлена информация пользователя ${editingUser.name}`
        });
        
        toast.success("Пользователь обновлен");
        setIsEditModalOpen(false);
      }
      
      setEditingUser(null);
    } catch (error: any) {
      console.error("Error saving user:", error.message);
      toast.error(error.message || "Ошибка при сохранении пользователя");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to delete user
  const handleDeleteUser = async (userId: string) => {
    try {
      const userToDelete = users.find(u => u.id === userId);
      if (!userToDelete) return;
      
      if (userId === currentUser?.id) {
        toast.error("Невозможно удалить собственную учетную запись");
        return;
      }
      
      // Удаление пользователя из Supabase
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);
        
      if (error) {
        throw error;
      }
      
      // Перезагрузка списка пользователей
      fetchUsers();
      
      // Add log entry for deleting a user
      addLogEntry({
        userId: currentUser?.id || '',
        userName: currentUser?.name || '',
        action: 'Удаление пользователя',
        details: `Удален пользователь ${userToDelete.name}`
      });
      
      toast.success("Пользователь удален");
    } catch (error: any) {
      console.error("Error deleting user:", error.message);
      toast.error(error.message || "Ошибка при удалении пользователя");
    }
  };

  // Function to add a log entry
  const addLogEntry = (logData: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...logData
    };
    
    const updatedLogs = [...logs, newLog];
    setLogs(updatedLogs);
    localStorage.setItem('userLogs', JSON.stringify(updatedLogs));
  };

  // Function to view user logs
  const handleViewLogs = (userId: string | null = null) => {
    setSelectedUserLogs(userId);
    setIsLogsModalOpen(true);
  };

  // Helper function to translate role to Russian
  const translateRole = (role: string): string => {
    switch (role) {
      case 'admin': return 'Администратор';
      case 'seller': return 'Продавец';
      case 'manager': return 'Управляющий';
      default: return role;
    }
  };

  // Filter logs based on selected user
  const filteredLogs = selectedUserLogs 
    ? logs.filter(log => log.userId === selectedUserLogs)
    : logs;

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold mb-6">Управление пользователями</h1>
          <div className="flex justify-center items-center h-64">
            <p>Загрузка данных...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6">Управление пользователями</h1>
        
        <div className="flex justify-between mb-6">
          <Button onClick={handleAddUser} className="flex items-center gap-2">
            <Plus size={16} />
            Добавить пользователя
          </Button>
          
          {isAdmin && (
            <Button variant="outline" onClick={() => handleViewLogs()} className="flex items-center gap-2">
              <Eye size={16} />
              Журнал операций
            </Button>
          )}
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Список пользователей</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Имя</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{translateRole(user.role || '')}</TableCell>
                    <TableCell>{user.email || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit size={16} />
                        </Button>
                        {isAdmin && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewLogs(user.id)}
                          >
                            <Eye size={16} />
                          </Button>
                        )}
                        {user.id !== currentUser?.id && (
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash size={16} />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Редактирование пользователя</DialogTitle>
            </DialogHeader>
            {editingUser && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Имя</Label>
                  <Input 
                    id="name" 
                    value={editingUser.name} 
                    onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Роль</Label>
                  <select 
                    id="role" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                  >
                    <option value="admin">Администратор</option>
                    <option value="manager">Управляющий</option>
                    <option value="seller">Продавец</option>
                  </select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingUser(null);
                }}
              >
                Отмена
              </Button>
              <Button 
                onClick={saveUser}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add User Dialog */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавление пользователя</DialogTitle>
            </DialogHeader>
            {editingUser && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Имя</Label>
                  <Input 
                    id="name" 
                    value={editingUser.name} 
                    onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={editingUser.email || ''} 
                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Роль</Label>
                  <select 
                    id="role" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                  >
                    <option value="admin">Администратор</option>
                    <option value="manager">Управляющий</option>
                    <option value="seller">Продавец</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={editingUser.password || ''} 
                    onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingUser(null);
                }}
              >
                Отмена
              </Button>
              <Button 
                onClick={saveUser}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Создание...' : 'Создать'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Logs Dialog */}
        <Dialog open={isLogsModalOpen} onOpenChange={setIsLogsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedUserLogs 
                  ? `Журнал операций: ${users.find(u => u.id === selectedUserLogs)?.name || 'Пользователь'}`
                  : 'Журнал всех операций'}
              </DialogTitle>
            </DialogHeader>
            
            {filteredLogs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата и время</TableHead>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Действие</TableHead>
                    <TableHead>Детали</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map(log => (
                      <TableRow key={log.id}>
                        <TableCell>{formatDate(log.timestamp)}</TableCell>
                        <TableCell>{log.userName}</TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>{log.details || '-'}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            ) : (
              <Alert>
                <AlertTitle>Записи отсутствуют</AlertTitle>
                <AlertDescription>
                  В журнале операций пока нет записей для отображения.
                </AlertDescription>
              </Alert>
            )}
            
            <DialogFooter>
              <Button onClick={() => setIsLogsModalOpen(false)}>
                Закрыть
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default UserManagement;
