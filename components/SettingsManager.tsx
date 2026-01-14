
import React, { useState } from 'react';
import { StoreSettings } from '../types';

interface SettingsManagerProps {
  categories: string[];
  settings: StoreSettings;
  onUpdateCategories: (oldName: string, newName: string) => void;
  onAddCategory: (name: string) => void;
  onRemoveCategory: (name: string) => void;
}

const SettingsManager: React.FC<SettingsManagerProps> = ({ 
  categories, 
  onUpdateCategories, 
  onAddCategory, 
  onRemoveCategory 
}) => {
  const [newCat, setNewCat] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAdd = () => {
    if (!newCat.trim()) return;
    onAddCategory(newCat.trim());
    setNewCat('');
  };

  const startEditing = (index: number, value: string) => {
    setEditingIndex(index);
    setEditValue(value);
  };

  const saveEdit = (oldName: string) => {
    if (editValue.trim() && editValue !== oldName) {
      onUpdateCategories(oldName, editValue.trim());
    }
    setEditingIndex(null);
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in slide-in-from-right duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-black text-gray-900">Configuración del Comercio</h2>
        <p className="text-gray-500">Administra las bases de tu negocio.</p>
      </div>

      <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </span>
            Gestión de Categorías
          </h3>
        </div>

        <div className="space-y-6">
          <div className="flex gap-3">
            <input 
              type="text"
              placeholder="Nueva categoría (ej: Lácteos)"
              className="flex-1 px-5 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50/50"
              value={newCat}
              onChange={e => setNewCat(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <button 
              onClick={handleAdd}
              className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
            >
              Añadir
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map((cat, index) => (
              <div 
                key={cat} 
                className="group flex items-center justify-between gap-3 px-5 py-4 bg-white rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all"
              >
                {editingIndex === index ? (
                  <input
                    autoFocus
                    className="flex-1 font-bold text-gray-800 outline-none bg-indigo-50 px-2 py-1 rounded-lg"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onBlur={() => saveEdit(cat)}
                    onKeyDown={e => e.key === 'Enter' && saveEdit(cat)}
                  />
                ) : (
                  <span className="font-bold text-gray-700">{cat}</span>
                )}

                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => startEditing(index, cat)}
                    className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                    title="Editar nombre"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => onRemoveCategory(cat)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Eliminar categoría"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <div className="p-8 bg-indigo-50 rounded-[2.5rem] border border-indigo-100">
        <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Sobre el Stock Crítico
        </h4>
        <p className="text-sm text-indigo-700/80 leading-relaxed">
          Hemos simplificado la interfaz. Ahora puedes definir el nivel de alerta directamente en la ficha de cada producto en el <strong>Inventario</strong>, permitiéndote tener un control más granular para productos de alta rotación.
        </p>
      </div>
    </div>
  );
};

export default SettingsManager;
