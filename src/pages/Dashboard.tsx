
import React from 'react';
import Navigation from '@/components/Navigation';
import { Dashboard } from '@/components/Dashboard';

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6">Панель управления</h1>
        <Dashboard />
      </div>
    </div>
  );
};

export default DashboardPage;
