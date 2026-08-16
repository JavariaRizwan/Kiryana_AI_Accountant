import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon, ArrowRight } from 'lucide-react';

interface Step {
  title: string;
  urTitle: string;
  desc: string;
  urDesc: string;
  icon: LucideIcon;
  color: string;
}

interface OnboardingGuideProps {
  mainIcon: LucideIcon;
  mainTitle: string;
  mainUrTitle: string;
  mainDesc: string;
  steps: Step[];
  ctaText?: string;
}

export default function OnboardingGuide({ mainIcon: MainIcon, mainTitle, mainUrTitle, mainDesc, steps, ctaText }: OnboardingGuideProps) {
  return (
    <div className="w-full bg-white rounded-[2rem] border-2 border-dashed border-gray-100 p-8 md:p-12 mt-4">
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-kiryana-green/10 rounded-3xl flex items-center justify-center mx-auto mb-6"
        >
          <MainIcon className="w-10 h-10 text-kiryana-green animate-pulse" />
        </motion.div>
        <h2 className="text-3xl font-black text-gray-900 leading-tight">{mainTitle}</h2>
        <p className="text-xl font-urdu text-kiryana-green" dir="rtl">{mainUrTitle}</p>
        <p className="text-gray-500 leading-relaxed">
          {mainDesc}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 relative">
        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-50 -translate-y-1/2 -z-0" />
        
        {steps.map((step, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.2 }}
            className="relative z-10 bg-white p-6 rounded-2xl border border-gray-50 shadow-sm space-y-4 hover:shadow-xl hover:-translate-y-1 transition-all group"
          >
            <div className={`w-12 h-12 ${step.color} rounded-xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
              <step.icon className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-gray-900">{idx + 1}. {step.title}</h3>
              <p className="text-xs font-urdu text-kiryana-green" dir="rtl">{step.urTitle}</p>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
            <p className="text-[10px] italic font-urdu text-gray-400" dir="rtl">{step.urDesc}</p>
          </motion.div>
        ))}
      </div>

      {ctaText && (
        <div className="mt-12 flex flex-col items-center gap-4">
          <motion.div 
            animate={{ x: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="flex items-center gap-2 text-kiryana-green font-bold text-sm"
          >
            <span>{ctaText}</span>
            <ArrowRight className="w-4 h-4" />
          </motion.div>
        </div>
      )}
    </div>
  );
}
