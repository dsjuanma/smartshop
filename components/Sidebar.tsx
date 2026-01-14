
import React from 'react';
import { ICONS } from '../constants';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tablero', icon: ICONS.Inventory },
    { id: 'pos', label: 'Venta (POS)', icon: ICONS.POS },
    { id: 'inventory', label: 'Inventario', icon: ICONS.Inventory },
    { id: 'balance', label: 'Balance Diario', icon: ICONS.Balance },
    { id: 'suppliers', label: 'Proveedores', icon: ICONS.Suppliers },
    { id: 'ai', label: 'Asistente IA', icon: ICONS.AI },
    { id: 'settings', label: 'Configuración', icon: ICONS.Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 hidden md:flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
            <ICONS.AI />
          </div>
          SmartShop
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-1 mt-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === item.id
                ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-sm'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-100">
        <div className="bg-indigo-900 rounded-2xl p-4 text-white">
          <p className="text-xs text-indigo-200 uppercase font-bold mb-1">Tu Asistente</p>
          <p className="text-sm font-medium">Gemini Pro está activo para ayudarte.</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
