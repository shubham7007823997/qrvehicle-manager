import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const AdminLayout: React.FC = () => (
  <div className="flex h-screen bg-gray-50 overflow-hidden">
    <Sidebar />
    <main className="flex-1 overflow-y-auto">
      <div className="p-4 md:p-8 max-w-7xl">
        <Outlet />
      </div>
    </main>
  </div>
);

export default AdminLayout;
