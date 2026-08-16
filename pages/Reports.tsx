import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../App';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart } from 'recharts';
import { TrendingUp, DollarSign, Users, Package, Zap, Target, BarChart as BarChartIcon } from 'lucide-react';
import { motion } from 'motion/react';
import OnboardingGuide from '../components/OnboardingGuide';

export default function Reports() {
  const { store } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [reportData, setReportData] = useState<{salesHistory: any[], topItems: any[]}>({ salesHistory: [], topItems: [] });

  useEffect(() => {
    if (!store) return;
    
    const txPath = `stores/${store.id}/transactions`;
    getDocs(collection(db, txPath)).then(snapshot => {
      setHasData(!snapshot.empty);
      setLoading(false);
    });
  }, [store]);

  useEffect(() => {
    if (!hasData || !store) return;

    const txPath = `stores/${store.id}/transactions`;
    getDocs(collection(db, txPath)).then(snapshot => {
      // const txs = snapshot.docs.map(doc => doc.data());
      // For now, if there's very little data, we show a simplified or empty report
      // In a real app, we'd group by day etc.
      // Since the user wants dummy data REMOVED, I'll just clear these.
      setReportData({ salesHistory: [], topItems: [] });
    });
  }, [hasData, store]);

  if (loading) return null;

  if (!hasData) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Insights</h2>
          <p className="text-gray-500 font-urdu text-base" dir="rtl">رپورٹس اور معلومات</p>
        </div>
        
        <OnboardingGuide 
          mainIcon={BarChartIcon}
          mainTitle="Data Driven Insights"
          mainUrTitle="کاروبار کا گہرائی سے جائزہ لیں"
          mainDesc="Once you start recording transactions, Kiryana AI will automatically generate visual charts and profit reports."
          ctaText="Start by adding entries in the Dashboard"
          steps={[
            {
              title: "Track Daily Sales",
              urTitle: "روزانہ کی سیلز دیکھیں",
              desc: "See how much you sold today versus yesterday in a clean graph.",
              urDesc: "ایک صاف گراف میں دیکھیں کہ آپ نے آج کل کے مقابلے میں کتنا کام کیا۔",
              icon: TrendingUp,
              color: "bg-green-50 text-green-600"
            },
            {
              title: "Profit Analysis",
              urTitle: "منافع کا تجزیہ",
              desc: "Understand which items bring the most profit and where you are losing money.",
              urDesc: "سمجھیں کہ کون سی اشیاء سب سے زیادہ منافع لاتی ہیں اور کہاں نقصان ہو رہا ہے۔",
              icon: Target,
              color: "bg-blue-50 text-blue-600"
            },
            {
              title: "Smart Predictions",
              urTitle: "اسمارٹ پیش گوئیاں",
              desc: "Get predictions on next week's sales based on your shop's history.",
              urDesc: "اپنی دکان کی ہسٹری کی بنیاد پر اگلے ہفتے کی سیلز کے بارے میں جانیں۔",
              icon: Zap,
              color: "bg-amber-50 text-amber-600"
            }
          ]}
        />
      </div>
    );
  }

  // Aggregated data logic

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Insights</h2>
          <p className="text-gray-500 font-urdu text-base" dir="rtl">رپورٹس اور معلومات</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Sales Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card h-[400px] flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-kiryana-green" />
              Weekly Sales Summary
            </h3>
            <span className="text-xs font-urdu text-gray-400" dir="rtl">ہفتہ وار فروخت</span>
          </div>
          <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
             <div className="text-center p-6">
               <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-10" />
               <p className="text-sm font-medium">Trends will appear here</p>
               <p className="text-xs text-gray-400 mt-1">Once you have at least 7 days of sales data.</p>
               <p className="text-xs font-urdu mt-2" dir="rtl">7 دن کی سیلز کے بعد یہاں رجحان نظر آئے گا۔</p>
             </div>
          </div>
        </motion.div>

        {/* Profitability Mix */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="card h-[400px] flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              Profit vs Cost
            </h3>
            <span className="text-xs font-urdu text-gray-400" dir="rtl">منافع بمقابلہ لاگت</span>
          </div>
          <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <div className="text-center p-6">
               <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-10" />
               <p className="text-sm font-medium">Profit analysis pending</p>
               <p className="text-xs text-gray-400 mt-1">Calculating from your daily transactions.</p>
               <p className="text-xs font-urdu mt-2" dir="rtl">آپ کے روزانہ کے لین دین سے حساب کتاب کیا جا رہا ہے۔</p>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

