import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../App';
import { TrendingUp, ShoppingCart, Users, Package, ArrowUpRight, ArrowDownLeft, AlertCircle, MessageSquare, Zap, BarChart, Trash2, Plus } from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { motion } from 'motion/react';
import OnboardingGuide from '../components/OnboardingGuide';

export default function Dashboard() {
  const { store } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({
    todaySales: 0,
    netProfit: 0,
    stockPurchased: 0,
    totalUdhaar: 0
  });
  const [loading, setLoading] = useState(true);

  const deleteTransaction = async (id: string) => {
    if (!store) return;
    try {
      await deleteDoc(doc(db, `stores/${store.id}/transactions`, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'transactions');
    }
  };

  useEffect(() => {
    if (!store) return;

    const txPath = `stores/${store.id}/transactions`;
    const q = query(collection(db, txPath), orderBy('date', 'desc'), limit(10));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(txs);
      
      let sales = 0;
      let stock = 0;
      txs.forEach(tx => {
        if (tx.type === TransactionType.SALE) sales += tx.amount;
        if (tx.type === TransactionType.STOCK_IN) stock += tx.amount;
      });
      
      setStats(prev => ({
        ...prev,
        todaySales: sales,
        stockPurchased: stock,
        netProfit: sales - (stock * 0.8)
      }));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, txPath);
    });

    const customersPath = `stores/${store.id}/customers`;
    getDocs(collection(db, customersPath)).then(snapshot => {
      let total = 0;
      snapshot.docs.forEach(doc => {
        total += doc.data().totalUdhaar || 0;
      });
      setStats(prev => ({ ...prev, totalUdhaar: total }));
    });

    return () => unsubscribe();
  }, [store]);

  if (loading) return null;

  return (
    <div className="space-y-8">
      {/* Header Info */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Assalam-o-Alaikum, {store?.ownerName}!</h2>
            <p className="text-gray-500 font-urdu text-base" dir="rtl">السلام علیکم، {store?.ownerName} بھائی!</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-500 capitalize">{new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <button 
              onClick={() => navigate('/entry')}
              className="btn-primary"
            >
              <Plus className="w-5 h-5" />
              <span>Add Item</span>
            </button>
          </div>
        </div>

      {transactions.length === 0 ? (
        <OnboardingGuide 
          mainIcon={Zap}
          mainTitle="Welcome to your Smart Shop!"
          mainUrTitle="آپ کے اسمارٹ دکان میں خوش آمدید!"
          mainDesc="Your dashboard is currently empty. Follow these simple steps to start your digital bookkeeping journey."
          ctaText="Tap the AI button below to start"
          steps={[
            {
              title: "Add your first entry",
              urTitle: "پہلا اندراج کریں",
              desc: "Tap the AI entry button and say 'Sold 1kg sugar for 150 cash'",
              urDesc: "اے آئی انٹری بٹن دبائیں اور کہیں '150 روپے کی چینی نقد بیچی'",
              icon: MessageSquare,
              color: "bg-blue-50 text-blue-600"
            },
            {
              title: "AI handles the rest",
              urTitle: "اے آئی باقی کام کرے گا",
              desc: "Kiryana AI automatically updates your Stock and Sales records.",
              urDesc: "کریانہ اے آئی خود بخود آپ کا اسٹاک اور سیلز ریکارڈ اپ ڈیٹ کر دیتا ہے۔",
              icon: Zap,
              color: "bg-amber-50 text-amber-600"
            },
            {
              title: "Watch your business grow",
              urTitle: "کاروبار کو بڑھتے ہوئے دیکھیں",
              desc: "Get daily reports, profit analysis, and stock warnings automatically.",
              urDesc: "روزانہ کی رپورٹ، منافع کا تجزیہ اور اسٹاک وارننگ حاصل کریں۔",
              icon: BarChart,
              color: "bg-green-50 text-green-600"
            }
          ]}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Transactions */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Recent Transactions</h3>
                <span className="text-sm font-urdu text-gray-500" dir="rtl">حالیہ لین دین</span>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          tx.type === TransactionType.SALE ? "bg-green-50 text-green-600" :
                          tx.type === TransactionType.STOCK_IN ? "bg-blue-50 text-blue-600" :
                          tx.type === TransactionType.UDHAAR_GIVEN ? "bg-red-50 text-red-600" : "bg-purple-50 text-purple-600"
                        )}>
                          {tx.type === TransactionType.SALE ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {tx.item || tx.customerName || (
                              tx.type === TransactionType.SALE ? 'Daily Sales' : 
                              tx.type === TransactionType.UDHAAR_GIVEN ? 'Udhaar GIVEN' : 
                              tx.type === TransactionType.UDHAAR_RECEIVED ? 'Payment RECEIVED' :
                              'General Transaction'
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            {tx.date?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <div>
                          <p className="font-bold text-gray-900">Rs {tx.amount.toLocaleString()}</p>
                          <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-medium uppercase",
                            tx.type === TransactionType.SALE ? "bg-green-100 text-green-700" :
                            tx.type === TransactionType.STOCK_IN ? "bg-blue-100 text-blue-700" :
                            tx.type === TransactionType.UDHAAR_GIVEN ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                          )}>
                            {tx.type === TransactionType.SALE ? 'Sale' : 
                             tx.type === TransactionType.STOCK_IN ? 'Stock' :
                             tx.type === TransactionType.UDHAAR_GIVEN ? 'Udhaar Added' : 'Payment Received'}
                          </span>
                        </div>
                        <button 
                          onClick={() => deleteTransaction(tx.id)}
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Insights Panel */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">AI Insights</h3>
                <span className="text-sm font-urdu text-gray-500" dir="rtl">اے آئی مشورے</span>
              </div>
              <div className="space-y-3">
                {transactions.length > 5 ? (
                  // Future: Add real dynamic insights here
                  null
                ) : (
                  <div className="p-8 text-center border-2 border-dashed border-gray-100 rounded-2xl text-gray-400">
                    <Zap className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Record more transactions to see AI insights.</p>
                    <p className="text-xs font-urdu" dir="rtl">اے آئی مشورے دیکھنے کے لیے مزید اندراج کریں۔</p>
                  </div>
                )}
              </div>
            </div>
          </div>
      )}
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

