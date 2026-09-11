import { Product, OrderRecord } from '../types';

export function downloadProductsCSV(products: Product[]): void {
  const headers = [
    'SKU',
    'Product Name',
    'Category',
    'Unit Price (NGN)',
    'Original Price (NGN)',
    'Current Stock',
    'Low Stock Threshold',
    'Stock Status',
    'Total Valuation (NGN)',
    'Warranty',
    'Certification'
  ];

  const rows = products.map(p => {
    const status = p.stock === 0 ? 'Out of Stock' : p.stock <= p.lowStockThreshold ? 'Low Stock' : 'Healthy';
    const valuation = p.stock * p.price;
    return [
      `"${p.sku}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      p.price,
      p.originalPrice || '',
      p.stock,
      p.lowStockThreshold,
      `"${status}"`,
      valuation,
      `"${p.warranty}"`,
      `"${p.certification}"`
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  triggerDownload(csvContent, `securetech_inventory_valuation_${getTimestampString()}.csv`, 'text/csv;charset=utf-8;');
}

export function downloadOrdersCSV(orders: OrderRecord[]): void {
  const headers = [
    'Order ID',
    'Date',
    'Customer Name',
    'Customer Phone',
    'Delivery Address',
    'Items Summary',
    'Total Amount (NGN)',
    'Status'
  ];

  const rows = orders.map(o => {
    const itemsSummary = o.items.map(i => `${i.productName} (x${i.quantity})`).join('; ');
    return [
      `"${o.id}"`,
      `"${o.date}"`,
      `"${o.customer.name.replace(/"/g, '""')}"`,
      `"${o.customer.phone}"`,
      `"${o.customer.address.replace(/"/g, '""')}"`,
      `"${itemsSummary.replace(/"/g, '""')}"`,
      o.totalAmount,
      `"${o.status.toUpperCase()}"`
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  triggerDownload(csvContent, `securetech_orders_ledger_${getTimestampString()}.csv`, 'text/csv;charset=utf-8;');
}

function triggerDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getTimestampString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
