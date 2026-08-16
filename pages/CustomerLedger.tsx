import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../App';
import { User, Calendar, ArrowLeft, ArrowUpRight, ArrowDownLeft, Wallet, History, Search, Filter, SortAsc, X } from 'lucide-react';
import { Transaction, Customer, TransactionType } from '../types';
import { motion, AnimatePresence } from 'motion/react';

type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
type TypeFilter = 'all' | TransactionType.UDHAAR_GIVEN | TransactionType.UDHAAR_RECEIVED;

export default function CustomerLedger() {
  const { store } = useAuth();
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!store || !customerId) return;

    // Fetch customer details
    const customerRef = doc(db, `stores/${store.id}/customers`, customerId);
    getDoc(customerRef).then((snap) => {
      if (snap.exists()) {
        setCustomer({ id: snap.id, ...snap.data() } as Customer);
      }
    });

    // Fetch customer transactions
    const txPath = `stores/${store.id}/transactions`;
    const q = query(
      collection(db, txPath),
      where('customerId', '==', customerId),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, txPath);
    });

    return () => unsubscribe();
  }, [store, customerId]);

  const processedTransactions = transactions
    .filter(tx => {
      const matchesSearch = (tx.item?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        !searchTerm);
      
      const matchesType = typeFilter === 'all' || tx.type === typeFilter;
      
      const txDate = tx.date?.toDate();
      const matchesDate = (!startDate || (txDate && txDate >= new Date(startDate))) &&
        (!endDate || (txDate && txDate <= new Date(endDate + 'T23:59:59')));
      
      return matchesSearch && matchesType && matchesDate;
    })
    .sort((a, b) => {
      if (sortBy === 'date-desc') return b.date?.toDate().getTime() - a.date?.toDate().getTime();
      if (sortBy === 'date-asc') return a.date?.toDate().getTime() - b.date?.toDate().getTime();
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });

  const clearFilters = () => {
    setTypeFilter('all');
    setSortBy('date-desc');
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kiryana-green"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Customer not found.</p>
        <button onClick={() => navigate('/udhaar')} className="mt-4 btn-primary">
          Go Back
        </button>
      </div>
    );
  }

  const activeFiltersCount = [
    typeFilter !== 'all',
    startDate !== '',
    endDate !== '',
    searchTerm !== ''
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/udhaar')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{customer.name}'s Ledger</h2>
            <p className="text-gray-500 font-urdu text-base" dir="rtl">{customer.name} کا کھاتہ</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all",
              showFilters || activeFiltersCount > 0 
                ? "bg-kiryana-green/10 border-kiryana-green text-kiryana-green" 
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
            )}
          >
            <Filter className="w-4 h-4" />
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="card bg-white p-6 grid grid-cols-1 md:grid-cols-4 gap-4 border border-kiryana-green/20">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Search Transactions</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Search item or note..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-kiryana-green outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Type</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-kiryana-green bg-white"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
                >
                  <option value="all">All Types</option>
                  <option value={TransactionType.UDHAAR_GIVEN}>Udhaar (Taken)</option>
                  <option value={TransactionType.UDHAAR_RECEIVED}>Payment (Given)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Start Date</label>
                <input 
                  type="date"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-kiryana-green bg-white"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">End Date</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="date"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-kiryana-green bg-white"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                  {activeFiltersCount > 0 && (
                    <button 
                      onClick={clearFilters}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      title="Clear All Filters"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="card bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-kiryana-green/10 flex items-center justify-center text-kiryana-green">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{customer.name}</h3>
                <p className="text-sm text-gray-500">Customer ID: {customer.id.slice(-6)}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1">Current Balance</p>
                <p className="text-2xl font-black text-red-700">Rs {customer.totalUdhaar.toLocaleString()}</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Last Activity</p>
                  <p className="text-sm font-medium text-gray-700">
                    {customer.lastTransactionAt?.toDate().toLocaleDateString('en-PK', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <History className="w-5 h-5 text-kiryana-green" />
              History {activeFiltersCount > 0 && <span className="text-xs font-normal text-gray-500">({processedTransactions.length} results)</span>}
            </h3>
            <div className="flex items-center gap-2">
              <SortAsc className="w-4 h-4 text-gray-400" />
              <select 
                className="text-sm font-medium text-gray-600 bg-transparent outline-none cursor-pointer border-none focus:ring-0"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="amount-desc">Amount (High to Low)</option>
                <option value="amount-asc">Amount (Low to High)</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {processedTransactions.length === 0 ? (
              <div className="p-12 text-center text-gray-500 card bg-white border-dashed border-2">
                {activeFiltersCount > 0 ? 'No results match your filters.' : 'No transactions found.'}
              </div>
            ) : (
              processedTransactions.map((tx) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={tx.id}
                  className="card bg-white p-4 flex items-center justify-between hover:border-kiryana-green/30 transition-all border border-gray-100 group"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      tx.type === TransactionType.UDHAAR_GIVEN ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                    )}>
                      {tx.type === TransactionType.UDHAAR_GIVEN ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{tx.item || (tx.type === TransactionType.UDHAAR_GIVEN ? 'Udhaar Added' : 'Payment Received')}</p>
                      <p className="text-xs text-gray-500">
                        {tx.date?.toDate().toLocaleDateString('en-PK', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {tx.description && <p className="text-xs text-gray-400 mt-1 italic">"{tx.description}"</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "font-bold text-lg",
                      tx.type === TransactionType.UDHAAR_GIVEN ? "text-red-600" : "text-green-600"
                    )}>
                      {tx.type === TransactionType.UDHAAR_GIVEN ? '+' : '-'} Rs {tx.amount.toLocaleString()}
                    </p>
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider",
                      tx.type === TransactionType.UDHAAR_GIVEN ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                    )}>
                      {tx.type === TransactionType.UDHAAR_GIVEN ? 'UDHAAR' : 'PAYMENT'}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
