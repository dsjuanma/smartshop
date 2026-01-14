
import React, { useState } from 'react';
import { Sale, Expense, Supplier } from '../types';

interface DailyBalanceProps {
  sales: Sale[];
  expenses: Expense[];
  suppliers: Supplier[];
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

const DailyBalance: React.FC<DailyBalanceProps> = ({ sales, expenses, suppliers, onAddExpense, onDeleteExpense }) => {
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    description: '',
    amount: 0,
    category: 'Proveedor',
    supplierId: ''
  });

  const today = new Date().toDateString();
  const todaysSales = sales.filter(s => new Date(s.timestamp).toDateString() === today);
  const todaysExpenses = expenses.filter(e => new Date(e.timestamp).toDateString() === today);

  const totalSales = todaysSales.reduce((acc, s) => acc + s.total, 0);
  const totalExpenses = todaysExpenses.reduce((acc, e) => acc + e.amount, 0);
  const netBalance = totalSales - totalExpenses;

  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount) return;
    
    onAddExpense({
      ...newExpense as Expense,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    });
    
    setIsAddingExpense(false);
    setNewExpense({ description: '', amount: 0, category: 'Proveedor', supplierId: '' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Balance Diario</h2>
          <p className="text-gray-500 font-medium">Cierre de caja y registro de gastos para hoy.</p>
        </div>
        <button 
          onClick={() => setIsAddingExpense(true)}
          className="bg-red-500 text-white px-8 py-3 rounded-2xl font-bold shadow-xl shadow-red-100 hover:bg-red-600 active:scale-95 transition-all flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
          </svg>
          Registrar Gasto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Ventas del Día (+)</p>
          <p className="text-4xl font-black text-green-600">${totalSales.toFixed(2)}</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Gastos / Pagos (-)</p>
          <p className="text-4xl font-black text-red-500">${totalExpenses.toFixed(2)}</p>
        </div>
        <div className={`p-8 rounded-[2.5rem] shadow-xl border ${netBalance >= 0 ? 'bg-indigo-900 text-white' : 'bg-red-900 text-white'}`}>
          <p className="text-indigo-200/60 text-xs font-black uppercase tracking-widest mb-2">Balance Neto</p>
          <p className="text-4xl font-black">${netBalance.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-50">
            <h3 className="font-bold text-gray-800">Ventas de Hoy</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Hora</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {todaysSales.length === 0 ? (
                  <tr><td colSpan={2} className="px-6 py-10 text-center text-gray-400">Sin ventas hoy</td></tr>
                ) : (
                  todaysSales.map(s => (
                    <tr key={s.id}>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 font-bold text-green-600">${s.total.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Gastos y Pagos de Hoy</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Concepto</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Monto</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {todaysExpenses.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-10 text-center text-gray-400">Sin gastos hoy</td></tr>
                ) : (
                  todaysExpenses.map(e => (
                    <tr key={e.id}>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-800 text-sm leading-tight">{e.description}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{e.category}</p>
                      </td>
                      <td className="px-6 py-4 font-bold text-red-500">-${e.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => onDeleteExpense(e.id)} className="text-red-300 hover:text-red-500">✕</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isAddingExpense && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-[200] animate-in fade-in duration-300">
          <form onSubmit={handleSubmitExpense} className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-gray-900">Registrar Pago/Gasto</h3>
              <button type="button" onClick={() => setIsAddingExpense(false)} className="text-gray-400">✕</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Monto ($)</label>
                <input 
                  type="number" step="0.01" required autoFocus
                  className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none bg-gray-50/50 text-2xl font-black"
                  value={newExpense.amount}
                  onChange={e => setNewExpense({...newExpense, amount: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Categoría</label>
                <select 
                  className="w-full px-5 py-3 rounded-2xl border border-gray-200 outline-none bg-gray-50/50 font-bold"
                  value={newExpense.category}
                  onChange={e => setNewExpense({...newExpense, category: e.target.value as any})}
                >
                  <option value="Proveedor">Pago a Proveedor</option>
                  <option value="Servicio">Servicios (Luz, Agua, etc)</option>
                  <option value="Sueldo">Sueldos</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>
              {newExpense.category === 'Proveedor' && (
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Seleccionar Proveedor</label>
                  <select 
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 outline-none bg-gray-50/50 font-bold"
                    value={newExpense.supplierId}
                    onChange={e => {
                      const sup = suppliers.find(s => s.id === e.target.value);
                      setNewExpense({...newExpense, supplierId: e.target.value, description: sup ? `Pago a ${sup.name}` : ''});
                    }}
                  >
                    <option value="">-- Elegir Proveedor --</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Descripción</label>
                <input 
                  type="text" required
                  className="w-full px-5 py-3 rounded-2xl border border-gray-200 outline-none bg-gray-50/50 font-bold"
                  placeholder="Ej: Pago de flete, Compra de bebidas..."
                  value={newExpense.description}
                  onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                type="button" 
                onClick={() => setIsAddingExpense(false)}
                className="flex-1 py-4 border border-gray-200 rounded-2xl font-bold text-gray-500"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black shadow-lg shadow-red-100"
              >
                Registrar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default DailyBalance;
