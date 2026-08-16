import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useState, useEffect, createContext, useContext } from 'react';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import QuickEntry from './pages/AIEntry';
import UdhaarKhata from './pages/UdhaarKhata';
import StockRegister from './pages/StockRegister';
import Reports from './pages/Reports';
import CustomerLedger from './pages/CustomerLedger';

interface StoreData {
  id: string;
  nameEn: string;
  nameUr: string;
  ownerName: string;
}

interface AuthContextType {
  user: { uid: string } | null;
  loading: boolean;
  store: StoreData | null;
  setStore: (store: StoreData | null) => void;
  login: (uid: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default function App() {
  const [user, setUser] = useState<{ uid: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<StoreData | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const savedUid = localStorage.getItem('kiryana_uid');
      if (savedUid) {
        setUser({ uid: savedUid });
        const storeRef = doc(db, 'stores', savedUid);
        const storeSnap = await getDoc(storeRef);
        if (storeSnap.exists()) {
          setStore({ id: storeSnap.id, ...storeSnap.data() } as StoreData);
        } else {
          localStorage.removeItem('kiryana_uid');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kiryana-green"></div>
      </div>
    );
  }

  const login = (uid: string) => {
    localStorage.setItem('kiryana_uid', uid);
    setUser({ uid });
  };

  const logout = () => {
    localStorage.removeItem('kiryana_uid');
    setUser(null);
    setStore(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, store, setStore, login, logout }}>
      <Router>
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route 
            path="/*" 
            element={
              user ? (
                store ? (
                  <Layout storeNameEn={store.nameEn} storeNameUr={store.nameUr}>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/entry" element={<QuickEntry />} />
                      <Route path="/udhaar" element={<UdhaarKhata />} />
                      <Route path="/udhaar/:customerId/ledger" element={<CustomerLedger />} />
                      <Route path="/stock" element={<StockRegister />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                  </Layout>
                ) : (
                  <Navigate to="/login" />
                )
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}
