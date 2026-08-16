import React, { useState, useRef, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../App';
import { parseNaturalLanguageEntry, TransactionType, ParsedEntry } from '../services/geminiService';
import { Mic, Send, ShoppingCart, Users, Package, ArrowDownCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function QuickEntry() {
  const { store } = useAuth();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ParsedEntry | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [isRecording, setIsRecording] = useState(false);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ur-PK'; // Support for Urdu speech
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
      setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    try {
      recognition.start();
    } catch (error) {
      console.error("Speech recognition start error:", error);
      setIsRecording(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !store || loading) return;

    setLoading(true);
    setResult(null);
    setSuccess(false);

    try {
      const parsed = await parseNaturalLanguageEntry(input);
      if (parsed) {
        setResult(parsed);
        // Automatically save the entry
        await saveEntry(parsed);
        setSuccess(true);
        setInput('');
      }
    } catch (error) {
      console.error("Entry processing error:", error);
      handleFirestoreError(error, OperationType.WRITE, 'entry');
    } finally {
      setLoading(false);
    }
  };

  const saveEntry = async (data: ParsedEntry) => {
    if (!store) return;
    const storePath = `stores/${store.id}`;
    
    try {
      if (data.customerName) {
        data.customerId = data.customerName.replace(/\s/g, '_').toLowerCase();
      }

      // 1. Add Transaction
      const txRef = collection(db, `${storePath}/transactions`);
      await addDoc(txRef, {
        ...data,
        date: serverTimestamp()
      });

      // 2. Update Related Data
      if ((data.type === TransactionType.UDHAAR_GIVEN || data.type === TransactionType.UDHAAR_RECEIVED) && data.customerName && data.customerId) {
        const customerRef = doc(db, `${storePath}/customers`, data.customerId);
        const customerSnap = await getDoc(customerRef);
        const udhaarChange = data.type === TransactionType.UDHAAR_GIVEN ? data.amount : -data.amount;
        
        if (customerSnap.exists()) {
          await updateDoc(customerRef, {
            totalUdhaar: increment(udhaarChange),
            lastTransactionAt: serverTimestamp()
          });
        } else {
          // If receiving payment for non-existent customer, we still create it with negative udhaar or just start it
          await setDoc(customerRef, {
            name: data.customerName,
            totalUdhaar: udhaarChange,
            lastTransactionAt: serverTimestamp()
          });
        }
      }

      if (data.type === TransactionType.STOCK_IN && data.item) {
        const itemId = data.item.replace(/\s/g, '_').toLowerCase();
        const itemRef = doc(db, `${storePath}/inventory`, itemId);
        const itemSnap = await getDoc(itemRef);
        
        const qtyStr = data.quantity || '1';
        const qtyMatch = qtyStr.match(/\d+/);
        const qty = qtyMatch ? parseFloat(qtyMatch[0]) : 1;

        if (itemSnap.exists()) {
          await updateDoc(itemRef, {
            quantity: increment(qty),
            lastPrice: data.amount / qty
          });
        } else {
          await setDoc(itemRef, {
            name: data.item,
            quantity: qty,
            lastPrice: data.amount / qty,
            minLevel: 5,
            unit: qtyStr.replace(/\d+/g, '').trim() || 'units'
          });
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, storePath);
    }
  };

  const quickActions = [
    { label: 'Add Stock', icon: Package, prompt: 'aaj 10kg sugar stock mein aayi 1500 rupay ki' },
    { label: 'Record Sale', icon: ShoppingCart, prompt: 'aaj 5000 rupay ki bikri hui' },
    { label: 'Give Udhaar', icon: Users, prompt: 'Aslam ne 200 rupay ka udhaar liya' },
    { label: 'Receive Payment', icon: ArrowDownCircle, prompt: 'Imran Bhai ne 500 rupay wapas diye' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Quick Entry</h2>
        <p className="text-gray-500 font-urdu text-base" dir="rtl">فوری اندراج</p>
      </div>

      <div className="card space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex justify-between">
            <span>Describe the transaction naturally</span>
            <span className="font-urdu" dir="rtl">لین دین کو اپنی زبان میں لکھیں</span>
          </label>
          <div className="relative">
            <textarea
              ref={inputRef}
              rows={4}
              placeholder='e.g. "Imran ne 500 rupay udhaar liya" or "aaj 20kg atta 2400 mein aya"'
              className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-kiryana-green/20 focus:border-kiryana-green outline-none resize-none text-lg transition-all"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSubmit())}
            />
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button 
                onClick={startListening}
                disabled={isRecording}
                className={cn(
                  "p-3 rounded-xl transition-all relative overflow-hidden",
                  isRecording 
                    ? "bg-red-100 text-red-600 ring-2 ring-red-500 animate-pulse" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
                title="Voice entry"
              >
                <Mic className={cn("w-6 h-6", isRecording && "animate-bounce")} />
              </button>
              <button 
                onClick={() => handleSubmit()}
                disabled={loading || !input.trim() || isRecording}
                className="p-3 bg-kiryana-green text-white rounded-xl hover:bg-kiryana-green-light transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => {
                setInput(action.prompt);
                inputRef.current?.focus();
              }}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-kiryana-green hover:bg-kiryana-green/5 transition-all group"
            >
              <action.icon className="w-6 h-6 text-gray-400 group-hover:text-kiryana-green" />
              <span className="text-xs font-semibold text-gray-500 group-hover:text-kiryana-green">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="card bg-kiryana-green text-white border-none shadow-xl"
          >
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-3 rounded-2xl">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2 flex-1">
                <p className="text-sm uppercase tracking-wider font-bold opacity-80">Confirmed Entry</p>
                <p className="text-2xl font-urdu leading-relaxed" dir="rtl">{result.urduConfirmation}</p>
                <div className="pt-2 flex flex-wrap gap-4 text-sm opacity-90 border-t border-white/10">
                  <span>Type: <span className="font-bold">{result.type.replace('_', ' ')}</span></span>
                  {result.item && <span>Item: <span className="font-bold">{result.item}</span></span>}
                  <span>Amount: <span className="font-bold">Rs {result.amount.toLocaleString()}</span></span>
                  {result.customerName && <span>Person: <span className="font-bold">{result.customerName}</span></span>}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
