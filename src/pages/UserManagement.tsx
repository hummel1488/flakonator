
// Fix the editUser function and add the default export
import React from 'react';
import { toast } from 'sonner';

// Add default export to the file (add at the end)
export default UserManagement;

// In the editUser function, ensure the id property is always set:
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
