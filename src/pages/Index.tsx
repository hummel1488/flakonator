import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthProvider';
import { Button } from "@/components/ui/button"

const Index = () => {
  const { user, login, logout, isAdmin, isSeller, isManager, session } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    // Здесь должна быть логика для обработки входа пользователя
    // Например, перенаправление на страницу входа или вызов функции из AuthProvider
    const success = await login('test@test.com', '123456');
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Главная страница</h1>
      {user ? (
        <div className="text-center">
          <p className="mb-4">Привет, {user.name}!</p>
          <p className="mb-4">Роль: {user.role}</p>
          {user.locationId && (
            <p className="mb-4">Location ID: {user.locationId}</p>
          )}
          <Button onClick={handleLogout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
            Выйти
          </Button>
          {isAdmin() && <p>Вы администратор.</p>}
          {isSeller() && <p>Вы продавец.</p>}
          {isManager() && <p>Вы менеджер.</p>}
          {session && <p>Session expires: {session.expires_at}</p>}
        </div>
      ) : (
        <div className="text-center">
          <p className="mb-4">Вы не вошли в систему.</p>
          <Button onClick={handleLogin} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Войти
          </Button>
        </div>
      )}
    </div>
  );
};

export default Index;
