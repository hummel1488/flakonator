
import React, { useState } from 'react';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Define a simple user type
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const UserManagement = () => {
  // Mock data for users
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'Администратор', email: 'admin@example.com', role: 'admin' },
    { id: '2', name: 'Менеджер', email: 'manager@example.com', role: 'manager' },
    { id: '3', name: 'Продавец', email: 'seller@example.com', role: 'seller' },
  ]);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to update user
  const updateUser = async (user: User) => {
    // Simulate API call
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
  };

  // Function to edit user - fixed based on the provided snippet
  const editUser = async () => {
    if (!editingUser) return;
    
    try {
      setIsSubmitting(true);
      // Make sure id is required
      const updatedUser = {
        ...editingUser,
        id: editingUser.id || '', // Ensure id is always set
      };
      
      // Call update user function
      await updateUser(updatedUser);
      
      // Update local state with new user info
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === updatedUser.id ? updatedUser : user
        )
      );
      
      // Close modal and reset form
      setIsEditModalOpen(false);
      setEditingUser(null);
      toast.success("Пользователь обновлен");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Ошибка при обновлении пользователя");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler to open edit modal
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6">Управление пользователями</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Список пользователей</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">Имя</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Роль</th>
                    <th className="px-4 py-2 text-left">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b">
                      <td className="px-4 py-2">{user.name}</td>
                      <td className="px-4 py-2">{user.email}</td>
                      <td className="px-4 py-2">{user.role}</td>
                      <td className="px-4 py-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditUser(user)}
                        >
                          Редактировать
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {isEditModalOpen && editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Редактирование пользователя</CardTitle>
              </CardHeader>
              <CardContent>
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
                      value={editingUser.email} 
                      onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Роль</Label>
                    <select 
                      id="role" 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                    >
                      <option value="admin">Администратор</option>
                      <option value="manager">Менеджер</option>
                      <option value="seller">Продавец</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
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
                      onClick={editUser}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
