
import React, { useState } from 'react';
import { ViewTab } from '../types';
import { ICONS } from '../constants';

interface SidebarProps {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  onLogout: () => void;
  user?: any;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, user }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuGroups = [
    {
      label: 'সাধারণ',
      items: [
        { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: 'Dashboard' }
      ]
    },
    {
      label: 'রিপোর্ট',
      items: [
        { id: 'final_list', label: 'ফাইনাল তালিকা', icon: 'Print' },
        { id: 'custom_report', label: 'কাস্টম রিপোর্ট', icon: 'Excel' }
      ]
    },
    {
      label: 'শিক্ষার্থী প্রোফাইল',
      items: [
        { id: 'profile_entry', label: 'তথ্য এন্ট্রি ফরম', icon: 'Admission' },
        { id: 'profile_list', label: 'শিক্ষার্থী তালিকা', icon: 'List' }
      ]
    },
    {
      label: 'শিক্ষার্থী ভর্তি',
      items: [
        { id: 'admission_entry', label: 'ভর্তি ফরম', icon: 'Admission' },
        { id: 'admission_list', label: 'ভর্তিকৃত তালিকা', icon: 'List' }
      ]
    },
    {
      label: 'ম্যানেজমেন্ট',
      items: [
        { id: 'migration', label: 'শ্রেণী পরিবর্তন', icon: 'Migration' }
      ]
    }
  ];

  return (
    <>
      {/* মোবাইল হেডার */}
      <div className="lg:hidden fixed top-4 left-4 right-4 z-[100] no-print">
        <div className="bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl px-5 py-3.5 rounded-[2rem] flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 p-1.5">
                <img src="https://i.ibb.co.com/pj8Wd1ff/Aliman-Logo.png" alt="Logo" className="w-full h-full object-contain" />
             </div>
             <div>
                <h2 className="text-md font-black text-slate-900 font-bn leading-tight">আল-ঈমান মাদরাসা</h2>
                <p className="text-[9px] font-bold text-blue-600 uppercase tracking-tight">{user?.Name || 'Management System'}</p>
             </div>
          </div>
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="w-11 h-11 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform"
          >
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* সাইডবার (ডেস্কটপ ও মোবাইল ড্রয়ার) */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-slate-900 text-white flex flex-col z-50 no-print transition-transform duration-500 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 flex flex-col items-center text-center gap-4 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="w-20 h-20 bg-white/10 rounded-[2.2rem] p-3.5 flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner group">
            <img src="https://i.ibb.co.com/pj8Wd1ff/Aliman-Logo.png" alt="Logo" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div>
            <h2 className="text-xl font-black font-bn leading-tight tracking-tight">আল-ঈমান মাদরাসা</h2>
            <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-[0.2em] mt-1.5">{user?.Name || 'Management System'}</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-9 overflow-y-auto custom-scrollbar">
          {menuGroups.map((group, idx) => (
            <div key={idx} className="space-y-2.5">
               <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] opacity-40">{group.label}</p>
               <div className="space-y-1">
                 {group.items.map((item) => {
                   const Icon = (ICONS as any)[item.icon];
                   const isActive = activeTab === item.id;
                   return (
                     <button
                       key={item.id}
                       onClick={() => { setActiveTab(item.id as ViewTab); setIsOpen(false); }}
                       className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group relative ${
                         isActive 
                          ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
                       }`}
                     >
                       <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                       <span className="font-bold font-bn text-[15px]">{item.label}</span>
                       {isActive && (
                         <span className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                       )}
                     </button>
                   );
                 })}
               </div>
            </div>
          ))}
        </nav>
        
        <div className="p-6 border-t border-slate-800/50 bg-slate-900/30 flex flex-col gap-4">
           {user && (
             <button 
               onClick={onLogout}
               className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all font-bn font-bold"
             >
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
               লগ-আউট করুন
             </button>
           )}
           <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest text-center">Version 1.2.0 • 2024</p>
        </div>
      </aside>

      {/* মোবাইল ওভারলে */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 animate-fade-in"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
