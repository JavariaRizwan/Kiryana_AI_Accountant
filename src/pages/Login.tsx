import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../App';
import { Store as StoreIcon, LogIn, UserPlus, MessageSquare, Users, Package, BarChart, CheckCircle, ArrowRight, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type AuthView = 'landing' | 'login' | 'register';

export default function Login() {
  const { login, setStore } = useAuth();
  const [view, setView] = useState<AuthView>('landing');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formData, setFormData] = useState({
    nameEn: '',
    nameUr: '',
    ownerName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    setError('');
    try {
      const storeId = username.toLowerCase().trim();
      const storeRef = doc(db, 'stores', storeId);
      const storeSnap = await getDoc(storeRef);

      if (storeSnap.exists()) {
        const data = storeSnap.data();
        if (data.password === password) {
          login(storeId);
          setStore({ id: storeId, ...data } as any);
        } else {
          setError('Incorrect username or password. Check your details and try again.');
        }
      } else {
        setError('Incorrect username or password. Check your details and try again.');
      }
    } catch (err: any) {
      handleFirestoreError(err, OperationType.GET, 'stores');
      setError('Login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const storeId = username.toLowerCase().trim();
      const storeRef = doc(db, 'stores', storeId);
      const storeSnap = await getDoc(storeRef);

      if (storeSnap.exists()) {
        setError('This username is already taken. Please choose another.');
        setLoading(false);
        return;
      }

      const storeData = {
        nameEn: formData.nameEn,
        nameUr: formData.nameUr,
        ownerName: formData.ownerName,
        ownerId: storeId,
        password: password, // Note: In a real app, hash this!
        createdAt: serverTimestamp()
      };
      
      await setDoc(storeRef, storeData);
      
      setPassword('');
      setError('Account created successfully! Please login with your credentials.');
      setView('login');
      
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, 'stores');
      setError('Registration failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      title: "AI Voice & Text Entry",
      urTitle: "اے آئی انٹری",
      desc: "Speak or type in Urdu/English. AI understands your business.",
      urDesc: "اردو یا انگریزی میں بولیں یا لکھیں۔ اے آئی آپ کے کاروبار کو سمجھتا ہے۔",
      icon: MessageSquare,
      color: "bg-blue-50 text-blue-600"
    },
    {
      title: "Smart Udhaar Tracking",
      urTitle: "ادھار کھاتہ",
      desc: "Never forget a single rupee. Personalized recovery tips.",
      urDesc: "ایک روپیہ بھی نہ بھولیں۔ واپسی کے لیے اے آئی مشورے۔",
      icon: Users,
      color: "bg-red-50 text-red-600"
    },
    {
      title: "Inventory Management",
      urTitle: "سٹاک مینجمنٹ",
      desc: "Get alerts before items run out. Smart restocking info.",
      urDesc: "اشیاء ختم ہونے سے پہلے الرٹ حاصل کریں۔ ہوشیار سٹاک معلومات۔",
      icon: Package,
      color: "bg-orange-50 text-orange-600"
    },
    {
      title: "Business Insights",
      urTitle: "کاروباری معلومات",
      desc: "Understand your profit and daily performance easily.",
      urDesc: "اپنے منافع اور روزانہ کی کارکردگی کو آسانی سے سمجھیں۔",
      icon: BarChart,
      color: "bg-green-50 text-green-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      {/* Navbar */}
      <nav className="w-full bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-kiryana-green p-1.5 rounded-lg shadow-sm">
            <StoreIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-bold text-gray-900 block text-sm sm:text-base leading-none">Kiryana AI</span>
            <span className="text-[10px] font-urdu text-kiryana-green" dir="rtl">کریانہ اے آئی</span>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setView('login')} className="text-sm font-semibold text-gray-600 hover:text-kiryana-green transition-colors">Login</button>
          <button onClick={() => setView('register')} className="btn-primary text-xs sm:text-sm px-4 py-1.5">Sign Up</button>
        </div>
      </nav>

      {view === 'landing' && (
        <div className="w-full flex flex-col items-center px-4 md:px-12 lg:px-24">
          {/* Hero Section */}
          <section className="w-full max-w-7xl py-12 md:py-16 grid lg:grid-cols-2 gap-10 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-kiryana-green/10 text-kiryana-green rounded-full text-xs font-bold animate-pulse">
                <Zap className="w-3.5 h-3.5" />
                Modern Accounting for Kiryana Stores
              </div>
              <div className="space-y-3">
                <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight leading-[1.1]">
                  Managing your Store <br />
                  <span className="text-kiryana-green">Just Got Smarter.</span>
                </h1>
                <p className="text-lg md:text-xl font-urdu text-kiryana-green leading-relaxed" dir="rtl">
                  آپ کی دکان کا حساب اب اے آئی کے ساتھ، اور بھی آسان۔
                </p>
                <p className="text-sm text-gray-500 max-w-lg leading-relaxed">
                  No more messy notebooks. Type or speak your daily sales and udhaar naturally. Kiryana AI handles the rest.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setView('register')}
                  className="btn-primary px-6 py-3 text-sm shadow-xl shadow-kiryana-green/20 transition-all font-bold"
                >
                  Get Started for Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </motion.button>
                <motion.button 
                  whileHover={{ backgroundColor: '#f3f4f6' }}
                  onClick={() => setView('login')}
                  className="px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 transition-all text-sm bg-white"
                >
                  Log in to Account
                </motion.button>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative hidden lg:block"
            >
              <div className="absolute -inset-4 bg-kiryana-green/10 blur-3xl rounded-full" />
              <div className="relative bg-white p-6 rounded-[2.5rem] shadow-2xl border border-gray-100 space-y-6">
                <div className="flex items-center gap-4 border-b border-gray-50 pb-4">
                  <div className="w-10 h-10 rounded-full bg-kiryana-green/20 flex items-center justify-center">
                    <StoreIcon className="w-5 h-5 text-kiryana-green" />
                  </div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-100 rounded-full w-24 mb-2" />
                    <div className="h-2 bg-gray-50 rounded-full w-16" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="p-3 bg-green-50/50 rounded-xl flex justify-between items-center"
                  >
                    <span className="text-xs font-bold text-gray-600">Daily Sales</span>
                    <span className="text-sm font-black text-kiryana-green">Rs 14,200</span>
                  </motion.div>
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="p-3 bg-red-50/50 rounded-xl flex justify-between items-center"
                  >
                    <span className="text-xs font-bold text-gray-600">Total Udhaar</span>
                    <span className="text-sm font-black text-red-600">Rs 3,850</span>
                  </motion.div>
                </div>

                <div className="pt-2">
                  <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">Live AI Feed</div>
                  <div className="space-y-2">
                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-[11px] italic text-gray-500">
                      "Imran Bhai took 2kg sugar on udhaar"
                    </div>
                    <div className="p-3 bg-kiryana-green text-white rounded-xl text-right">
                      <p className="font-urdu text-[12px]" dir="rtl">سمجھ گیا بھائی! عمران بھائی کے کھاتے میں چینی درج کر دی گئی۔</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* How It Works Section */}
          <section className="w-full bg-white py-12">
            <div className="max-w-7xl mx-auto">
              <div className="text-center space-y-2 mb-12">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900">How Kiryana AI Works</h2>
                <p className="text-base text-gray-500 font-urdu" dir="rtl">کریانہ اے آئی کیسے کام کرتا ہے؟</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    step: "01",
                    title: "Speak or Type",
                    urTitle: "بولیں یا لکھیں",
                    desc: "Just say what happened today in simple Urdu or English.",
                    icon: MessageSquare
                  },
                  {
                    step: "02",
                    title: "AI Understands",
                    urTitle: "اے آئی سمجھتا ہے",
                    desc: "Our AI automatically notes down items, amounts, and customers.",
                    icon: Zap
                  },
                  {
                    step: "03",
                    title: "Get Reports",
                    urTitle: "رپورٹس حاصل کریں",
                    desc: "View your profit and credit lists at the end of the day.",
                    icon: BarChart
                  }
                ].map((item, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 }}
                    key={item.step} 
                    className="relative p-6 rounded-3xl bg-gray-50 border border-gray-100 group hover:bg-white hover:shadow-xl transition-all"
                  >
                    <span className="absolute -top-4 left-6 text-4xl font-black text-kiryana-green/5 group-hover:text-kiryana-green/10 transition-colors uppercase">Step {item.step}</span>
                    <div className="w-10 h-10 bg-kiryana-green text-white rounded-xl flex items-center justify-center mb-4">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold mb-0.5">{item.title}</h3>
                    <p className="text-xs font-urdu text-kiryana-green mb-3" dir="rtl">{item.urTitle}</p>
                    <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section className="w-full bg-gray-50 py-12 border-y border-gray-100">
            <div className="max-w-7xl mx-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((f, i) => (
                  <motion.div 
                    key={f.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 rounded-3xl border border-gray-100 bg-white hover:border-kiryana-green/20 hover:shadow-lg transition-all"
                  >
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", f.color)}>
                      <f.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-base mb-0.5">{f.title}</h3>
                    <p className="text-[10px] font-urdu text-kiryana-green mb-3" dir="rtl">{f.urTitle}</p>
                    <p className="text-gray-500 text-xs leading-relaxed mb-3">{f.desc}</p>
                    <p className="text-[10px] font-urdu text-gray-400 leading-relaxed italic" dir="rtl">{f.urDesc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Business Comparison */}
          <section className="w-full bg-white py-12">
            <div className="max-w-7xl mx-auto">
              <div className="bg-kiryana-green rounded-[2.5rem] p-8 md:p-12 text-white grid md:grid-cols-2 gap-10 items-center">
                <div className="space-y-4">
                  <h2 className="text-2xl md:text-3xl font-black leading-tight">Stop using old diaries. <br />Go Digital.</h2>
                  <p className="text-sm opacity-80 leading-relaxed">
                    Millions of store owners lose money every month due to forgotten entries. Kiryana AI ensures every rupee is accounted for.
                  </p>
                  <ul className="space-y-3">
                    {[
                      { en: "Automatic Udhaar alerts", ur: "خودکار ادھار الرٹس" },
                      { en: "No accounting knowledge needed", ur: "اکاؤنٹنگ کی ضرورت نہیں" },
                      { en: "Works on any smartphone", ur: "ہر اسمارٹ فون پر کام کرتا ہے" }
                    ].map((li, i) => (
                      <motion.li 
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="flex items-center gap-3"
                      >
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="font-medium text-xs">{li.en}</span>
                        <span className="font-urdu text-[10px] opacity-60 ml-auto" dir="rtl">{li.ur}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-bold opacity-60">
                    <span>Manual</span>
                    <span>Kiryana AI</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="h-1 bg-red-400/30 w-1/2 rounded-full" />
                      <div className="h-2 bg-green-400 w-full rounded-full" />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="h-1 bg-red-400/30 w-1/3 rounded-full" />
                      <div className="h-2 bg-green-400 w-2/3 rounded-full" />
                    </div>
                  </div>
                  <div className="pt-2 text-center">
                    <p className="text-lg font-black">10x Faster</p>
                    <p className="text-[10px] font-urdu opacity-70" dir="rtl">10 گنا زیادہ تیز اور محفوظ</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Interactive Demo Section */}
          <section className="w-full bg-gray-50 py-12 overflow-hidden border-b border-gray-100">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row gap-12 items-center">
                <div className="flex-1 space-y-6">
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">See the Magic of <br /><span className="text-kiryana-green">Voice & Text AI</span></h2>
                  <p className="text-gray-500 leading-relaxed text-xs">
                    Type in English, Urdu, or Roman Urdu. Our AI understands your shop's language perfectly.
                  </p>
                  
                  <div className="space-y-3">
                    {[
                      { input: "Imran bhai ne 500 ka udhaar lia", type: "Udhaar", amount: "500" },
                      { input: "I sold 2kg Atta for 480 cash", type: "Sale", amount: "480" }
                    ].map((demo, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.2 }}
                        key={idx} 
                        className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-kiryana-green/10 flex items-center justify-center text-kiryana-green font-bold text-[10px]">{idx + 1}</div>
                          <span className="text-xs font-medium text-gray-600">"{demo.input}"</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[8px] block uppercase font-bold text-gray-400">{demo.type}</span>
                          <span className="text-xs font-black text-kiryana-green">Rs {demo.amount}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                <div className="flex-1 relative">
                  <div className="relative bg-white rounded-[2rem] shadow-xl p-6 border border-gray-100">
                     <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-kiryana-green flex items-center justify-center text-white"><MessageSquare className="w-4 h-4" /></div>
                        <div>
                          <span className="block font-bold text-xs">Kiryana AI Chat</span>
                          <span className="text-[10px] text-green-500">Online</span>
                        </div>
                     </div>
                     <div className="space-y-3">
                        <div className="flex justify-end">
                           <div className="bg-gray-100 p-2 rounded-xl rounded-tr-none text-[10px] max-w-[80%]">Sara begum ne 200 rs dene thy wo abhi de gai hain.</div>
                        </div>
                        <div className="flex justify-start">
                           <div className="bg-kiryana-green/10 p-2 rounded-xl rounded-tl-none text-[10px] max-w-[80%] text-kiryana-green font-medium">
                              <p className="font-urdu mb-1" dir="rtl text-right">بہت اچھا بھائی! سارہ بیگم کا حساب اپڈیٹ ہو گیا۔</p>
                              <div className="h-px bg-kiryana-green/10 my-1" />
                              <div className="flex justify-between items-center text-[7px] uppercase font-bold">
                                 <span>Payment</span>
                                 <span>Rs 200</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section with Accordion */}
          <section className="w-full bg-white py-12">
            <div className="max-w-3xl mx-auto">
              <div className="text-center space-y-2 mb-10">
                 <h2 className="text-xl md:text-2xl font-black text-gray-900">Common Questions</h2>
                 <p className="text-xs text-gray-500 font-urdu" dir="rtl">اکثر پوچھے جانے والے سوالات</p>
              </div>
              
              <div className="space-y-3">
                 {[
                    { q: "Is Kiryana AI really free?", a: "Yes! The basic bookkeeping features are free for Pakistani store owners." },
                    { q: "Can I use it offline?", a: "You need internet to process AI voice, but it works on slow connections." },
                    { q: "Is my store's data safe?", a: "Your data is encrypted and stored securely in the cloud." },
                    { q: "Does it support Pashto or Punjabi?", a: "Currently Urdu and English. More regional languages coming soon!" }
                 ].map((faq, idx) => (
                    <div 
                      key={idx} 
                      className="border border-gray-100 rounded-xl overflow-hidden hover:border-kiryana-green/30 transition-colors bg-gray-50/30"
                    >
                       <button 
                         onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                         className="w-full px-5 py-3.5 text-left flex justify-between items-center bg-white/50 hover:bg-white transition-colors"
                       >
                         <h3 className="font-bold text-gray-800 text-xs">{faq.q}</h3>
                         <motion.span 
                           animate={{ rotate: activeFaq === idx ? 45 : 0 }}
                           className="text-kiryana-green text-lg font-bold"
                         >
                           +
                         </motion.span>
                       </button>
                       <AnimatePresence>
                         {activeFaq === idx && (
                           <motion.div 
                             initial={{ height: 0, opacity: 0 }}
                             animate={{ height: 'auto', opacity: 1 }}
                             exit={{ height: 0, opacity: 0 }}
                             className="bg-white overflow-hidden"
                           >
                             <div className="px-5 py-3 text-[11px] text-gray-500 leading-relaxed border-t border-gray-50">
                               {faq.a}
                             </div>
                           </motion.div>
                         )}
                       </AnimatePresence>
                    </div>
                 ))}
              </div>
            </div>
          </section>

          {/* CTA Footer */}
          <footer className="w-full bg-gray-50 py-12 flex flex-col items-center text-center space-y-6">
            <motion.div 
               whileInView={{ scale: [0.98, 1], opacity: [0, 1] }} 
               className="space-y-2"
            >
              <h2 className="text-xl md:text-3xl font-black text-gray-900 leading-tight">Ready to grow your shop?</h2>
              <p className="text-sm text-gray-500 font-urdu" dir="rtl">کیا آپ اپنی دکان کو بڑھانے کے لیے تیار ہیں؟</p>
            </motion.div>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setView('register')}
              className="btn-primary px-8 py-3.5 text-sm rounded-xl shadow-xl shadow-kiryana-green/20 transition-all font-black"
            >
              Start for Free
            </motion.button>
            <div className="flex items-center gap-3 text-gray-400">
              <span className="h-px w-8 bg-gray-200" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Safe & Digital</span>
              <span className="h-px w-8 bg-gray-200" />
            </div>
            <p className="text-gray-400 text-[10px] max-w-sm mt-4">
              Built with love for Kiryana stores. <br />
              &copy; 2026 Kiryana AI Accountant.
            </p>
          </footer>
        </div>
      )}

      {(view === 'login' || view === 'register') && (
        <div className="flex-1 flex items-center justify-center p-4 w-full max-w-lg">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4">
              <button 
                onClick={() => setView('landing')}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                Cancel
              </button>
            </div>

            <div className="text-center mb-8">
              <div className="bg-kiryana-green w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <StoreIcon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{view === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
              <p className="text-gray-500 font-urdu text-lg mt-1" dir="rtl">
                {view === 'login' ? 'خوش آمدید، بھائی!' : 'نیا اکاؤنٹ بنائیں'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}

            {view === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Username</label>
                    <input
                      required
                      type="text"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-kiryana-green/10 focus:border-kiryana-green outline-none transition-all"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Password</label>
                    <input
                      required
                      type="password"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-kiryana-green/10 focus:border-kiryana-green outline-none transition-all"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <button disabled={loading} className="w-full btn-primary py-4 font-black shadow-lg">
                  {loading ? "Loading..." : "Login to Store"}
                </button>
                <p className="text-center text-sm text-gray-500">
                  Don't have an account? <button onClick={() => setView('register')} className="text-kiryana-green font-bold hover:underline">Create Account</button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Username</label>
                    <input
                      required
                      type="text"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Password</label>
                    <input
                      required
                      type="password"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Store Name (English)</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Hassan Grocery"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
                    value={formData.nameEn}
                    onChange={e => setFormData({ ...formData, nameEn: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex justify-between">
                    <span>Store Name (Urdu)</span>
                    <span className="font-urdu" dir="rtl">اسٹور کا نام</span>
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-right font-urdu"
                    dir="rtl"
                    value={formData.nameUr}
                    onChange={e => setFormData({ ...formData, nameUr: e.target.value })}
                  />
                </div>

                <div className="space-y-2 pb-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Owner Name</label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
                    value={formData.ownerName}
                    onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                  />
                </div>

                <button disabled={loading} className="w-full btn-primary py-4 font-black shadow-lg">
                  {loading ? "Creating..." : "Complete Registration"}
                </button>
                <p className="text-center text-sm text-gray-500">
                  Already have an account? <button onClick={() => setView('login')} className="text-kiryana-green font-bold hover:underline">Log in to Account</button>
                </p>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
