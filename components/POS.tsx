
import React, { useState } from 'react';
import { Product, StoreState, Sale } from '../types';
import BarcodeScanner from './BarcodeScanner';

interface POSProps {
  products: Product[];
  onSaleComplete: (sale: Sale) => void;
}

const POS: React.FC<POSProps> = ({ products, onSaleComplete }) => {
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.product.id !== id));
  };

  const handleBarcodeDetected = (code: string) => {
    // Aquí podrías tener un campo "barcode" en tu tipo Product
    // Por ahora simularemos buscando por ID o parte del nombre
    const found = products.find(p => p.id === code || p.name.includes(code));
    if (found) {
      addToCart(found);
      setIsScanning(false);
      // Vibración opcional si el navegador lo permite
      if ('vibrate' in navigator) navigator.vibrate(200);
    } else {
      alert(`Producto con código ${code} no encontrado.`);
    }
  };

  const total = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    const sale: Sale = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      total,
      items: cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        subtotal: item.product.price * item.quantity,
      })),
    };

    onSaleComplete(sale);
    setCart([]);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full pb-20 md:pb-0">
      {isScanning && (
        <BarcodeScanner 
          onDetected={handleBarcodeDetected} 
          onClose={() => setIsScanning(false)} 
        />
      )}

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Buscar producto..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button 
            onClick={() => setIsScanning(true)}
            className="px-4 py-3 bg-indigo-100 text-indigo-600 rounded-2xl hover:bg-indigo-200 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <span className="hidden md:inline font-bold">Escanear</span>
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-4 px-1">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all text-left group flex flex-col"
            >
              <span className="inline-block self-start px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2 bg-indigo-50 text-indigo-600">
                {product.category}
              </span>
              <h3 className="font-semibold text-gray-800 line-clamp-2 group-hover:text-indigo-600 flex-1">{product.name}</h3>
              <div className="mt-4">
                <p className="text-xl font-black text-gray-900">${product.price.toFixed(2)}</p>
                <div className="flex justify-between items-center mt-1">
                   <p className={`text-[10px] font-bold ${product.stock <= product.minStock ? 'text-red-500' : 'text-gray-400'}`}>
                    STOCK: {product.stock}
                  </p>
                  <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center scale-0 group-hover:scale-100 transition-transform">
                    +
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-96 bg-white rounded-t-3xl md:rounded-3xl shadow-2xl border border-gray-100 flex flex-col fixed bottom-0 left-0 right-0 md:static md:max-h-[calc(100vh-8rem)] z-40">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Carrito ({cart.length})</h2>
          {cart.length > 0 && (
            <button onClick={() => setCart([])} className="text-xs text-red-500 font-bold uppercase">Vaciar</button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-60 md:max-h-none">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-gray-400 font-medium">No hay productos</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="bg-gray-50 p-3 rounded-2xl flex flex-col gap-2 border border-transparent hover:border-indigo-100 transition-all">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-gray-800 text-sm leading-tight flex-1">{item.product.name}</h4>
                  <button 
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <button onClick={() => updateQuantity(item.product.id, -1)} className="px-3 py-1 hover:bg-gray-50 text-gray-500 font-bold">-</button>
                    <span className="px-3 py-1 text-sm font-bold text-gray-800 bg-gray-50/50">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, 1)} className="px-3 py-1 hover:bg-gray-50 text-gray-500 font-bold">+</button>
                  </div>
                  <span className="font-black text-gray-900">${(item.quantity * item.product.price).toFixed(2)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-indigo-900 text-white md:rounded-b-3xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-indigo-200 font-bold uppercase text-xs tracking-wider">Total a Cobrar</span>
            <span className="text-3xl font-black">${total.toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-3 ${
              cart.length > 0 
                ? 'bg-white text-indigo-900 hover:scale-[1.02] active:scale-[0.98]' 
                : 'bg-indigo-800 text-indigo-400 cursor-not-allowed opacity-50'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            Finalizar Venta
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS;
