
export interface Supplier {
  id: string;
  name: string;
  phone: string;
  description: string;
}

export interface StoreSettings {
  defaultMinStock: number;
}

export interface Expense {
  id: string;
  timestamp: number;
  description: string;
  amount: number;
  category: 'Proveedor' | 'Servicio' | 'Sueldo' | 'Otros';
  supplierId?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  barcode?: string;
  description?: string;
}

export interface SaleItem {
  productId: string;
  quantity: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  timestamp: number;
  items: SaleItem[];
  total: number;
}

export interface StoreState {
  products: Product[];
  sales: Sale[];
  suppliers: Supplier[];
  categories: string[];
  settings: StoreSettings;
  expenses: Expense[];
}
