export interface Product {
  id: string;
  name: string;
  sku: string;
  category: 'Encrypted Storage' | 'Hardware Security' | 'Privacy Devices' | 'Secure Networking' | 'Smart Surveillance';
  price: number;
  originalPrice?: number;
  stock: number;
  lowStockThreshold: number;
  description: string;
  securitySpecs: string[];
  certification: string;
  warranty: string;
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  address: string;
  deliveryNotes?: string;
}

export interface OrderRecord {
  id: string;
  date: string;
  items: {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  customer: CustomerDetails;
  status: 'whatsapp_sent' | 'processing' | 'shipped' | 'delivered';
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'Super Admin' | 'Inventory Specialist' | 'Compliance Auditor';
  avatar?: string;
  lastLogin: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  sku?: string;
  type: 'stock' | 'price' | 'product_crud' | 'status_change' | 'auth';
}
