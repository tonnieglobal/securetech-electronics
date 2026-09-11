import { OrderRecord, AuditLogEntry } from '../types';

export const INITIAL_ORDERS: OrderRecord[] = [
  {
    id: 'ORD-NG-2026-8941',
    date: '2026-09-10 16:42',
    items: [
      {
        productId: 'prod-1',
        productName: 'AegisPadlock Encrypted NVMe SSD 2TB',
        sku: 'SEC-SSD-2048',
        quantity: 2,
        price: 420000,
      },
      {
        productId: 'prod-2',
        productName: 'Sentinel Pro FIDO2 Biometric Security Key',
        sku: 'SEC-FIDO-PRO',
        quantity: 3,
        price: 125000,
      }
    ],
    totalAmount: 1215000,
    customer: {
      name: 'Dr. Babatunde Adeleke',
      phone: '+234 803 456 7890',
      address: 'Plot 14, Victoria Island Financial District, Lagos',
      deliveryNotes: 'Tamper seal must be inspected at executive reception before handover.'
    },
    status: 'shipped'
  },
  {
    id: 'ORD-NG-2026-8940',
    date: '2026-09-09 11:15',
    items: [
      {
        productId: 'prod-3',
        productName: 'CipherMesh Hardened WireGuard Router',
        sku: 'SEC-NET-GW01',
        quantity: 1,
        price: 545000,
      }
    ],
    totalAmount: 545000,
    customer: {
      name: 'Ngozi Okonjo-Eze',
      phone: '+234 802 112 3344',
      address: 'Maitama Diplomatic Zone, Abuja FCT',
      deliveryNotes: 'Please call 15 minutes ahead for security clearance at the gate.'
    },
    status: 'delivered'
  },
  {
    id: 'ORD-NG-2026-8939',
    date: '2026-09-08 14:20',
    items: [
      {
        productId: 'prod-5',
        productName: 'Krypton 14 Hardened Privacy Ultrabook',
        sku: 'SEC-LPT-K14',
        quantity: 1,
        price: 2350000,
      }
    ],
    totalAmount: 2350000,
    customer: {
      name: 'Chukwuma Obi',
      phone: '+234 818 998 7766',
      address: 'Trans-Amadi Industrial Layout, Port Harcourt, Rivers State',
      deliveryNotes: 'Direct delivery to Cyber Defense Lab Unit 4.'
    },
    status: 'processing'
  },
  {
    id: 'ORD-NG-2026-8938',
    date: '2026-09-07 09:35',
    items: [
      {
        productId: 'prod-4',
        productName: 'VaultX Air-Gapped Hardware Crypto Wallet',
        sku: 'SEC-WLT-V4X',
        quantity: 2,
        price: 295000,
      },
      {
        productId: 'prod-6',
        productName: 'IronKey Locker+ Encrypted USB-C 128GB',
        sku: 'SEC-USB-128G',
        quantity: 4,
        price: 135000,
      }
    ],
    totalAmount: 1130000,
    customer: {
      name: 'Folake Balogun',
      phone: '+234 809 334 5511',
      address: 'Bodija Estate, Ibadan, Oyo State',
      deliveryNotes: 'Leave with personal assistant if unavailable.'
    },
    status: 'delivered'
  },
  {
    id: 'ORD-NG-2026-8937',
    date: '2026-09-06 18:05',
    items: [
      {
        productId: 'prod-7',
        productName: 'SpectreShield RF & EMP Shielded Faraday Briefcase',
        sku: 'SEC-BAG-FAR01',
        quantity: 1,
        price: 385000,
      }
    ],
    totalAmount: 385000,
    customer: {
      name: 'Emeka Nwosu',
      phone: '+234 812 776 5432',
      address: 'Independence Layout, Enugu',
      deliveryNotes: 'Urgent transit required for audit committee.'
    },
    status: 'whatsapp_sent'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-001',
    timestamp: '2026-09-11 08:30:15',
    user: 'Anthony O. (Super Admin)',
    action: 'Currency Transition Complete',
    details: 'Converted store catalog base currency to Nigerian Naira (₦ NGN).',
    type: 'price'
  },
  {
    id: 'log-002',
    timestamp: '2026-09-10 14:12:00',
    user: 'Anthony O. (Super Admin)',
    action: 'Bulk Restock Batch Sent',
    details: 'Initiated supplier WhatsApp replenishment for 3 low-stock SKUs (+40 units).',
    sku: 'SEC-NET-GW01, SEC-LPT-K14',
    type: 'stock'
  },
  {
    id: 'log-003',
    timestamp: '2026-09-09 11:45:22',
    user: 'Logistics Supervisor',
    action: 'Order Status Dispatched',
    details: 'Order ORD-NG-2026-8941 marked as Dispatched via Secure Courier.',
    type: 'status_change'
  },
  {
    id: 'log-004',
    timestamp: '2026-09-08 17:00:10',
    user: 'System Sentinel',
    action: 'Inventory Audit Check',
    details: 'Daily automated stock reconciliation: zero discrepancy across 8 SKUs.',
    type: 'stock'
  }
];
