import { CartItem, Product, CustomerDetails } from '../types';
import { formatNaira } from './currency';

export const DEFAULT_WHATSAPP_NUMBER = '15557328732'; // Sample verified store number

export function getStoredWhatsAppNumber(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('securetech_whatsapp_number') || DEFAULT_WHATSAPP_NUMBER;
  }
  return DEFAULT_WHATSAPP_NUMBER;
}

export function saveStoredWhatsAppNumber(num: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('securetech_whatsapp_number', num.replace(/[^0-9]/g, ''));
  }
}

/**
 * Builds a structured, professional order message for a single "Buy Now" item
 */
export function buildSingleProductWhatsAppMessage(
  product: Product,
  quantity: number = 1,
  customer?: Partial<CustomerDetails>
): string {
  const subtotal = product.price * quantity;
  const now = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  let message = `🔒 *NEW SECURE ORDER REQUEST - SECURETECH ELECTRONICS*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📅 *Date:* ${now}\n`;
  message += `📦 *Product:* ${product.name}\n`;
  message += `🏷️ *SKU:* \`${product.sku}\`\n`;
  message += `💰 *Unit Price:* ${formatNaira(product.price)}\n`;
  message += `🔢 *Quantity:* ${quantity} unit${quantity > 1 ? 's' : ''}\n`;
  message += `💵 *Total Amount:* *${formatNaira(subtotal)} NGN*\n`;
  message += `🛡️ *Warranty/Seal:* ${product.warranty} (Tamper Verified)\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

  if (customer && (customer.name || customer.address || customer.phone)) {
    message += `👤 *CUSTOMER DETAILS:*\n`;
    if (customer.name) message += `• *Name:* ${customer.name}\n`;
    if (customer.phone) message += `• *Phone:* ${customer.phone}\n`;
    if (customer.address) message += `• *Delivery Address:* ${customer.address}\n`;
    if (customer.deliveryNotes) message += `• *Instructions:* ${customer.deliveryNotes}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  }

  message += `💬 *Inquiry / Dispatch Request:*\n`;
  message += `"Hello SecureTech team! Please confirm availability for SKU ${product.sku} and provide encrypted payment & dispatch details."`;

  return message;
}

/**
 * Builds a structured order message for all cart items
 */
export function buildCartWhatsAppMessage(
  cartItems: CartItem[],
  customer?: Partial<CustomerDetails>
): string {
  const total = cartItems
    .reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalUnits = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const now = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  let message = `🔒 *NEW SECURE ORDER (MULTI-ITEM) - SECURETECH ELECTRONICS*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📅 *Date:* ${now}\n`;
  message += `📋 *ORDER SUMMARY (${totalUnits} items):*\n`;

  cartItems.forEach((item, index) => {
    const itemTotal = item.product.price * item.quantity;
    message += `\n${index + 1}. *${item.product.name}*\n`;
    message += `   • SKU: \`${item.product.sku}\`\n`;
    message += `   • Qty: ${item.quantity} × ${formatNaira(item.product.price)} = *${formatNaira(itemTotal)}*\n`;
  });

  message += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `💵 *TOTAL ORDER VALUE:* *${formatNaira(total)} NGN*\n`;
  message += `🛡️ *Hardware Authentication:* Certified Anti-Tamper Delivery\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

  if (customer && (customer.name || customer.address || customer.phone)) {
    message += `👤 *CUSTOMER DETAILS:*\n`;
    if (customer.name) message += `• *Name:* ${customer.name}\n`;
    if (customer.phone) message += `• *Phone:* ${customer.phone}\n`;
    if (customer.address) message += `• *Delivery Address:* ${customer.address}\n`;
    if (customer.deliveryNotes) message += `• *Instructions:* ${customer.deliveryNotes}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  }

  message += `💬 *Inquiry / Dispatch Request:*\n`;
  message += `"Hello SecureTech team! I have finalized my cart. Please review my order and provide secure escrow/payment instructions for immediate dispatch."`;

  return message;
}

/**
 * Creates the standard WhatsApp URL
 */
export function createWhatsAppUrl(phoneNumber: string, text: string): string {
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  const encoded = encodeURIComponent(text);
  return `https://wa.me/${cleanNumber}?text=${encoded}`;
}

export interface RestockItemRequest {
  product: Product;
  requestedQty: number;
}

/**
 * Builds a structured wholesale restock request message to send to electronics suppliers
 */
export function buildSupplierRestockWhatsAppMessage(
  items: RestockItemRequest[],
  warehouseNote?: string,
  supplierDeskName: string = 'Secure Hardware Supplier Logistics Desk'
): string {
  const totalUnits = items.reduce((sum, item) => sum + item.requestedQty, 0);
  const now = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  let message = `📦 *WHOLESALE RESTOCK ORDER REQUEST*\n`;
  message += `🏢 *From:* SecureTech Electronics Inventory Control\n`;
  message += `🎯 *To:* ${supplierDeskName}\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📅 *Date:* ${now}\n`;
  message += `📋 *BULK RESTOCK BATCH (${items.length} SKUs | ${totalUnits} total units):*\n`;

  items.forEach((item, index) => {
    const isOut = item.product.stock <= 0;
    const isLow = item.product.stock > 0 && item.product.stock <= item.product.lowStockThreshold;
    const statusNote = isOut 
      ? '❌ OUT OF STOCK' 
      : isLow 
        ? `⚠️ LOW STOCK (${item.product.stock} left)` 
        : `✅ In Stock (${item.product.stock} left)`;

    message += `\n${index + 1}. *${item.product.name}*\n`;
    message += `   • SKU: \`${item.product.sku}\`\n`;
    message += `   • Current Warehouse Stock: ${item.product.stock} units [${statusNote}]\n`;
    message += `   • *Requested Batch Restock: +${item.requestedQty} units*\n`;
    message += `   • Spec Cert: ${item.product.certification}\n`;
  });

  message += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `🔢 *TOTAL RESTOCK UNITS REQUESTED:* *${totalUnits} units*\n`;
  message += `🛡️ *Delivery Standard:* Tamper-Evident Sealed Packaging (Anti-Static Vacuum Pack)\n`;
  message += `📍 *Destination Warehouse:* SecureTech Electronics Central Fulfillment Hub\n`;
  
  if (warehouseNote && warehouseNote.trim()) {
    message += `📝 *Internal Dispatch Note:* ${warehouseNote.trim()}\n`;
  }
  
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `💬 *Supplier Request:*\n`;
  message += `"Hello! Please confirm procurement lead-time, wholesale batch availability for these ${items.length} SKUs, and forward the proforma invoice for wire settlement."`;

  return message;
}

