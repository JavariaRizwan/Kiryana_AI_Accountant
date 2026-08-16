import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../App';
import { User, Users, Calendar, ArrowRight, AlertCircle, Search, Wallet, HandCoins, History, Trash2, SortAsc, Filter } from 'lucide-react';
import { Customer } from '../types';
import { motion } from 'motion/react';
import OnboardingGuide from '../components/OnboardingGuide';

type SortOption = 'udhaar-desc' | 'udhaar-asc' | 'name-asc' | 'date-desc';
type FilterOption = 'all' | 'overdue';

export default function UdhaarKhata() {
  const { store } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('udhaar-desc');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  const deleteCustomer = async (id: string) => {
    if (!store) return;
    try {
      await deleteDoc(doc(db, `stores/${store.id}/customers`, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'customers');
    }
  };

  useEffect(() => {
    if (!store) return;

    const customersPath = `stores/${store.id}/customers`;
    const q = query(collection(db, customersPath));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
      setCustomers(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, customersPath);
    });

    return () => unsubscribe();
  }, [store]);

  const getStatusColor = (days: number) => {
    if (days < 7) return 'bg-green-100 text-green-700 border-green-200';
    if (days < 14) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  const processedCustomers = customers
    .filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (filterBy === 'overdue') {
        const lastDate = c.lastTransactionAt?.toDate() || new Date();
        const daysOverdue = Math.floor((new Date().getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
        return matchesSearch && daysOverdue >= 14;
      }
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'udhaar-desc') return b.totalUdhaar - a.totalUdhaar;
      if (sortBy === 'udhaar-asc') return a.totalUdhaar - b.totalUdhaar;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'date-desc') {
        const dateA = a.lastTransactionAt?.toDate()?.getTime() || 0;
        const dateB = b.lastTransactionAt?.toDate()?.getTime() || 0;
        return dateB - dateA;
      }
      return 0;
    });

  if (loading) return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Udhaar Khata</h2>
          <p className="text-gray-500 font-urdu text-base" dir="rtl">ادھار کھاتہ</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search person..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-kiryana-green outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-kiryana-green bg-white cursor-pointer"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <option value="udhaar-desc">Udhaar (High to Low)</option>
            <option value="udhaar-asc">Udhaar (Low to High)</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="date-desc">Recent Activity</option>
          </select>

          <select 
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-kiryana-green bg-white cursor-pointer"
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as FilterOption)}
          >
            <option value="all">All Customers</option>
            <option value="overdue">Overdue Only</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.length === 0 ? (
          <div className="col-span-full">
            <OnboardingGuide 
              mainIcon={Wallet}
              mainTitle="Manage Udhaar Like a Pro"
              mainUrTitle="ادھار کھاتہ سنبھالیں"
              mainDesc="Never forget a payment again. Track who owes you money and send reminders with one tap."
              ctaText="Record your first udhaar using the AI button"
              steps={[
                {
                  title: "Add Customers",
                  urTitle: "گاہکوں کو شامل کریں",
                  desc: "Say 'Imran Bhai took 500 udhaar' and Kiryana AI will create a profile for him.",
                  urDesc: "کہیں 'عمران بھائی نے 500 روپے ادھار لیے' اور اے آئی خود بخود ان کا کھاتہ بنا دے گا۔",
                  icon: User,
                  color: "bg-red-50 text-red-600"
                },
                {
                  title: "Track History",
                  urTitle: "تاریخ دیکھیں",
                  desc: "View full transaction history for every customer to avoid confusion.",
                  urDesc: "کسی بھی گاہک کی لین دین کی مکمل ہسٹری دیکھیں تاکہ کوئی غلط فہمی نہ ہو۔",
                  icon: History,
                  color: "bg-blue-50 text-blue-600"
                },
                {
                  title: "Easy Collection",
                  urTitle: "رقم کی واپسی",
                  desc: "Kiryana AI shows you who has been owing money for the longest time.",
                  urDesc: "کریانہ اے آئی آپ کو بتاتا ہے کہ کس گاہک کا ادھار سب سے پرانا ہو گیا ہے۔",
                  icon: HandCoins,
                  color: "bg-green-50 text-green-600"
                }
              ]}
            />
          </div>
        ) : processedCustomers.length === 0 ? (
          <div className="col-span-full p-12 text-center text-gray-500 card bg-white">
            {filterBy === 'overdue' ? 'No overdue customers found!' : 'No one found with that filter.'}
          </div>
        ) : (
          processedCustomers.map((customer) => {
            const lastDate = customer.lastTransactionAt?.toDate() || new Date();
            const daysOverdue = Math.floor((new Date().getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
            
            return (
              <motion.div
                layout
                key={customer.id}
                className="card flex flex-col justify-between group overflow-hidden relative"
              >
                {daysOverdue >= 14 && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-2 py-1 rounded-bl-lg font-bold uppercase tracking-wider">
                    Overdue
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-kiryana-green/10 group-hover:text-kiryana-green transition-colors">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{customer.name}</h3>
                      <p className="text-sm text-gray-500">Last activity: {daysOverdue} days ago</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Balance</span>
                    <span className="text-xl font-bold text-gray-900">Rs {customer.totalUdhaar.toLocaleString()}</span>
                  </div>

                  <div className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold uppercase tracking-tight",
                    getStatusColor(daysOverdue)
                  )}>
                    <Calendar className="w-4 h-4" />
                    {daysOverdue < 7 ? 'Recent' : daysOverdue < 14 ? '1 Week Old' : '2+ Weeks Overdue'}
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  <button 
                    onClick={() => navigate(`/udhaar/${customer.id}/ledger`)}
                    className="flex-1 btn-primary py-2 text-sm"
                  >
                    View Ledger
                  </button>
                  <button 
                    onClick={() => deleteCustomer(customer.id)}
                    className="p-2 border border-red-100 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {daysOverdue >= 14 && (
                  <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100 flex gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-red-800 leading-tight">
                      <span className="font-bold">AI Tip:</span> Consider calling {customer.name.split(' ')[0]} bhai for recovery.
                    </p>
                  </div>
                )}
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
