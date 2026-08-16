import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../App';
import { Package, AlertTriangle, TrendingDown, Plus, Minus, Search, ShoppingCart, Activity, RefreshCcw, Trash2 } from 'lucide-react';
import { InventoryItem } from '../types';
import { motion } from 'motion/react';
import OnboardingGuide from '../components/OnboardingGuide';

export default function StockRegister() {
  const { store } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const deleteItem = async (id: string, name: string) => {
    if (!store) return;
    try {
      await deleteDoc(doc(db, `stores/${store.id}/inventory`, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'inventory');
    }
  };

  useEffect(() => {
    if (!store) return;

    const inventoryPath = `stores/${store.id}/inventory`;
    const q = query(collection(db, inventoryPath), orderBy('name', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
      setItems(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, inventoryPath);
    });

    return () => unsubscribe();
  }, [store]);

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Stock Register</h2>
          <p className="text-gray-500 font-urdu text-base" dir="rtl">سٹاک رجسٹر</p>
        </div>
        <div className="flex gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search item..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-kiryana-green outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => navigate('/entry')}
            className="btn-primary"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Item</span>
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <OnboardingGuide 
          mainIcon={Package}
          mainTitle="Master Your Inventory"
          mainUrTitle="اپنے اسٹاک کو کنٹرول کریں"
          mainDesc="Keep track of every item in your shop. Know exactly what you have and what's running low."
          ctaText="Add your first item using the button above or AI"
          steps={[
            {
              title: "List your products",
              urTitle: "مصنوعات کی فہرست بنائیں",
              desc: "Add items like Atta, Ghee, or Sugar with their current quantities.",
              urDesc: "آٹا، گھی یا چینی جیسی چیزیں ان کی موجودہ مقدار کے ساتھ شامل کریں۔",
              icon: Plus,
              color: "bg-blue-50 text-blue-600"
            },
            {
              title: "Automatic Updates",
              urTitle: "خودکار اپ ڈیٹس",
              desc: "When you record a sale with AI, your stock levels decrease automatically.",
              urDesc: "جب آپ اے آئی سے فروخت درج کرتے ہیں، تو آپ کا اسٹاک خود بخود کم ہو جاتا ہے۔",
              icon: RefreshCcw,
              color: "bg-purple-50 text-purple-600"
            },
            {
              title: "Low Stock Alerts",
              urTitle: "اسٹاک کم ہونے کی وارننگ",
              desc: "Kiryana AI warns you when an item is about to finish so you can restock.",
              urDesc: "کریانہ اے آئی آپ کو بتاتا ہے جب کوئی چیز ختم ہونے والی ہو تاکہ آپ اسے دوبارہ خرید سکیں۔",
              icon: AlertTriangle,
              color: "bg-amber-50 text-amber-600"
            }
          ]}
        />
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Item Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Quantity</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Last Price</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            item.quantity <= item.minLevel ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600"
                          )}>
                            <Package className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-400 font-urdu" dir="rtl">{item.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-lg text-gray-900">{item.quantity}</span>
                        <span className="text-xs text-gray-500 ml-1">{item.unit || 'units'}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-600">
                        Rs {item.lastPrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {item.quantity <= item.minLevel ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wide">
                            <AlertTriangle className="w-3 h-3" />
                            Low Stock
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wide">
                            In Stock
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => deleteItem(item.id, item.name)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-gray-400 hover:text-kiryana-green hover:bg-kiryana-green/5 rounded-lg transition-all">
                            <Minus className="w-5 h-5" />
                          </button>
                          <button className="p-1.5 text-gray-400 hover:text-kiryana-green hover:bg-kiryana-green/5 rounded-lg transition-all">
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Prediction Section */}
          {items.some(i => i.quantity <= i.minLevel) && (
            <div className="card bg-kiryana-green/5 border-kiryana-green/10">
              <div className="flex items-start gap-4">
                <div className="bg-kiryana-green/10 p-3 rounded-2xl">
                  <TrendingDown className="w-8 h-8 text-kiryana-green" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-kiryana-green text-lg">AI Stock Warning</h3>
                  <p className="text-gray-700 text-sm">
                    Some items are reaching critical levels. Please check the "Low Stock" items in your list.
                  </p>
                  <p className="text-xs font-urdu text-gray-500 mt-2" dir="rtl">
                    کچھ اشیاء ختم ہونے والی ہیں۔ براہ کرم اپنی فہرست میں "کم اسٹاک" والی چیزیں دیکھیں۔
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

