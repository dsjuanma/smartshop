
import React, { useState, useEffect } from 'react';
import { Product, StoreState, Sale, Supplier, StoreSettings, Expense } from './types';
import Sidebar from './components/Sidebar';
import ProductForm from './components/ProductForm';
import POS from './components/POS';
import AIAssistant from './components/AIAssistant';
import SuppliersManager from './components/SuppliersManager';
import SettingsManager from './components/SettingsManager';
import DailyBalance from './components/DailyBalance';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, ICONS } from './constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [state, setState] = useState<StoreState>(() => {
    const saved = localStorage.getItem('smartshop_state');
    const defaultState: StoreState = { 
      products: INITIAL_PRODUCTS, 
      sales: [], 
      suppliers: [], 
      categories: INITIAL_CATEGORIES,
      settings: { defaultMinStock: 5 },
      expenses: []
    };
    if (!saved) return defaultState;
    const parsed = JSON.parse(saved);
    return { ...defaultState, ...parsed };
  });
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();

  useEffect(() => {
    localStorage.setItem('smartshop_state', JSON.stringify(state));
  }, [state]);

  const handleAddProduct = (product: Product) => {
    setState(prev => {
      const exists = prev.products.find(p => p.id === product.id);
      const newProducts = exists 
        ? prev.products.map(p => p.id === product.id ? product : p)
        : [...prev.products, product];
      return { ...prev, products: newProducts };
    });
    setIsAddingProduct(false);
    setEditingProduct(undefined);
  };

  const handleSale = (sale: Sale) => {
    setState(prev => {
      const updatedProducts = prev.products.map(p => {
        const saleItem = sale.items.find(si => si.productId === p.id);
        if (saleItem) {
          return { ...p, stock: Math.max(0, p.stock - saleItem.quantity) };
        }
        return p;
      });
      return { ...prev, products: updatedProducts, sales: [...prev.sales, sale] };
    });
    alert('Venta procesada con éxito');
  };

  const handleSaveSupplier = (supplier: Supplier) => {
    setState(prev => {
      const exists = prev.suppliers.find(s => s.id === supplier.id);
      const newSuppliers = exists
        ? prev.suppliers.map(s => s.id === supplier.id ? supplier : s)
        : [...prev.suppliers, supplier];
      return { ...prev, suppliers: newSuppliers };
    });
  };

  const handleDeleteSupplier = (id: string) => {
    setState(prev => ({ ...prev, suppliers: prev.suppliers.filter(s => s.id !== id) }));
  };

  const handleAddCategory = (name: string) => {
    if (state.categories.includes(name)) return;
    setState(prev => ({ ...prev, categories: [...prev.categories, name] }));
  };

  const handleUpdateCategory = (oldName: string, newName: string) => {
    setState(prev => {
      const newCategories = prev.categories.map(c => c === oldName ? newName : c);
      const newProducts = prev.products.map(p => 
        p.category === oldName ? { ...p, category: newName } : p
      );
      return { ...prev, categories: newCategories, products: newProducts };
    });
  };

  const handleRemoveCategory = (name: string) => {
    setState(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== name)
    }));
  };

  const handleAddExpense = (expense: Expense) => {
    setState(prev => ({ ...prev, expenses: [...prev.expenses, expense] }));
  };

  const handleDeleteExpense = (id: string) => {
    setState(prev => ({ ...prev, expenses: prev.expenses.filter(e => e.id !== id) }));
  };

  const lowStockCount = state.products.filter(p => p.stock <= (p.minStock || state.settings.defaultMinStock)).length;
  const today = new Date().toDateString();
  const todaySales = state.sales
    .filter(s => new Date(s.timestamp).toDateString() === today)
    .reduce((acc, s) => acc + s.total, 0);
  const todayExpenses = state.expenses
    .filter(e => new Date(e.timestamp).toDateString() === today)
    .reduce((acc, e) => acc + e.amount, 0);

  const salesByCategory = state.categories.map(cat => ({
    name: cat,
    total: state.sales.reduce((acc, s) => {
      const categoryItems = s.items.filter(si => {
        const prod = state.products.find(p => p.id === si.productId);
        return prod?.category === cat;
      });
      return acc + categoryItems.reduce((sum, item) => sum + item.subtotal, 0);
    }, 0)
  }));

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="flex min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center mb-6 px-2">
          <h1 className="text-2xl font-black text-indigo-600 tracking-tight">SmartShop</h1>
          <button 
            onClick={() => setIsAddingProduct(true)} 
            className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Caja Hoy (Ventas)</p>
                <p className="text-3xl font-black text-green-600">${todaySales.toFixed(2)}</p>
              </div>
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Stock Bajo</p>
                <p className={`text-3xl font-black ${lowStockCount > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {lowStockCount}
                </p>
              </div>
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Proveedores</p>
                <p className="text-3xl font-black text-gray-900">{state.suppliers.length}</p>
              </div>
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Gastos Hoy</p>
                <p className="text-3xl font-black text-red-500">${todayExpenses.toFixed(2)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-8">Ventas por Categoría</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesByCategory}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="total" radius={[10, 10, 0, 0]} barSize={40}>
                        {salesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Alertas Críticas</h3>
                <div className="space-y-4">
                  {state.products.filter(p => p.stock <= (p.minStock || state.settings.defaultMinStock)).slice(0, 5).map(p => (
                    <div key={p.id} className="flex items-center justify-between p-4 rounded-3xl bg-red-50/50 border border-red-100/50">
                      <div>
                        <p className="font-bold text-red-900 text-sm">{p.name}</p>
                        <p className="text-xs text-red-600 font-medium">Stock: {p.stock} (Límite: {p.minStock || state.settings.defaultMinStock})</p>
                      </div>
                      <button onClick={() => { setEditingProduct(p); setActiveTab('inventory'); }} className="bg-white text-red-600 px-4 py-1.5 rounded-xl text-xs font-bold shadow-sm border border-red-100">Editar</button>
                    </div>
                  ))}
                  {lowStockCount === 0 && (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <p className="text-gray-400 font-medium">Inventario saludable</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pos' && <POS products={state.products} onSaleComplete={handleSale} />}

        {activeTab === 'inventory' && (
          <div className="animate-in slide-in-from-bottom duration-500">
             <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Inventario</h2>
              <button onClick={() => setIsAddingProduct(true)} className="bg-indigo-600 text-white px-6 py-2 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2">+ Producto</button>
            </div>
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Producto</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Categoría</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Precio</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Stock</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {state.products.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-6 py-5"><p className="font-bold text-gray-800">{product.name}</p></td>
                      <td className="px-6 py-5"><span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600">{product.category}</span></td>
                      <td className="px-6 py-5"><p className="font-black text-gray-900">${product.price.toFixed(2)}</p></td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 font-bold">
                          <span className={product.stock <= (product.minStock || state.settings.defaultMinStock) ? 'text-red-500' : 'text-gray-800'}>{product.stock}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => setEditingProduct(product)} className="text-indigo-400 hover:text-indigo-600 font-bold text-xs uppercase">Editar</button>
                          <button onClick={() => setState(prev => ({...prev, products: prev.products.filter(p => p.id !== product.id)}))} className="text-red-300 hover:text-red-500 font-bold text-xs uppercase">Borrar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'balance' && (
          <DailyBalance 
            sales={state.sales} 
            expenses={state.expenses} 
            suppliers={state.suppliers}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeTab === 'suppliers' && (
          <SuppliersManager 
            suppliers={state.suppliers} 
            onSave={handleSaveSupplier} 
            onDelete={handleDeleteSupplier} 
          />
        )}

        {activeTab === 'settings' && (
          <SettingsManager 
            categories={state.categories} 
            settings={state.settings} 
            onAddCategory={handleAddCategory}
            onUpdateCategories={handleUpdateCategory}
            onRemoveCategory={handleRemoveCategory}
          />
        )}

        {activeTab === 'ai' && (
          <div className="max-w-2xl mx-auto py-20 text-center animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-[2.5rem] shadow-2xl flex items-center justify-center mx-auto mb-10 rotate-3">
              <ICONS.AI />
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-6 tracking-tight">Potencia IA</h2>
            <p className="text-gray-500 text-lg mb-10 leading-relaxed">Soy tu asistente avanzado. Puedo decirte cuánto cobrar, qué proveedor llamar según el stock bajo, o analizar tus balances del día.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-8 bg-white rounded-[2rem] border border-gray-100 shadow-sm text-left"><h4 className="font-bold text-indigo-600 mb-2">Balances</h4><p className="text-sm text-gray-500">"¿Cómo va mi balance hoy?"</p></div>
              <div className="p-8 bg-white rounded-[2rem] border border-gray-100 shadow-sm text-left"><h4 className="font-bold text-green-600 mb-2">Estrategia</h4><p className="text-sm text-gray-500">"¿Qué categoría vende más?"</p></div>
            </div>
          </div>
        )}

        {/* Modal ProductForm */}
        {(isAddingProduct || editingProduct) && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-[200] animate-in fade-in duration-300">
            <div className="w-full max-w-lg">
              <ProductForm 
                onSave={handleAddProduct}
                initialProduct={editingProduct}
                onCancel={() => { setIsAddingProduct(false); setEditingProduct(undefined); }}
                categories={state.categories}
              />
            </div>
          </div>
        )}

        <AIAssistant state={state} />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 px-6 py-4 flex justify-between items-center z-[100] shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <button onClick={() => setActiveTab('dashboard')} className={`p-2 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400'}`}><ICONS.Inventory /></button>
        <button onClick={() => setActiveTab('pos')} className={`p-2 rounded-xl transition-all ${activeTab === 'pos' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400'}`}><ICONS.POS /></button>
        <button onClick={() => setActiveTab('inventory')} className={`p-2 rounded-xl transition-all ${activeTab === 'inventory' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400'}`}><ICONS.Inventory /></button>
        <button onClick={() => setActiveTab('balance')} className={`p-2 rounded-xl transition-all ${activeTab === 'balance' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400'}`}><ICONS.Balance /></button>
        <button onClick={() => setActiveTab('suppliers')} className={`p-2 rounded-xl transition-all ${activeTab === 'suppliers' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400'}`}><ICONS.Suppliers /></button>
      </nav>
    </div>
  );
};

export default App;
