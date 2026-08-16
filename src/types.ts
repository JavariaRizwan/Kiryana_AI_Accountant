export enum TransactionType {
  SALE = "SALE",
  STOCK_IN = "STOCK_IN",
  UDHAAR_GIVEN = "UDHAAR_GIVEN",
  UDHAAR_RECEIVED = "UDHAAR_RECEIVED",
}

export interface Store {
  id: string;
  nameEn: string;
  nameUr: string;
  ownerName: string;
  ownerId: string;
  createdAt: any;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  item?: string;
  quantity?: string;
  amount: number;
  customerName?: string;
  customerId?: string;
  date: any;
  description?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  lastPrice: number;
  minLevel: number;
  unit: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  totalUdhaar: number;
  lastTransactionAt: any;
}
