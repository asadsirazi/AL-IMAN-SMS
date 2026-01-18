import React, { useState, useMemo } from 'react';
import { StudentData, SettingsData } from '../types';
import { ICONS, CLASS_ORDER } from '../constants';

interface Props {
  students: StudentData[];
  settings: SettingsData | null;
  onView: (student: StudentData) => void;
}

const CURRENT_YEAR = new Date().getFullYear().toString();

const FinalList: React.FC<Props> = ({ students, settings, onView }) => {
  const [filters, setFilters] = useState({
    search: '',
    class: '',
    section: '',
    year: CURRENT_YEAR
  });

  const processedData = useMemo(() => {
    return students.filter(s => {
      const matchesYear = String(s.Academic_Year || '').trim() === filters.year;
      const matchesSearch = (s.Name_Bangla || '').includes(filters.search) || (String(s.Student_UID || '')).includes(filters.search);
      const matchesClass = !filters.class || s.Class_Name === filters.class;
      const matchesSection = !filters.section || s.Section === filters.section;
      return matchesYear && matchesSearch && matchesClass && matchesSection;
    }).sort((a, b) => {
      const cA = CLASS_ORDER.indexOf(a.Class_Name || '');
      const cB = CLASS_ORDER.indexOf(b.Class_Name || '');
      if (cA !== cB) return cA - cB;
      return parseInt(String(a.Roll_No || '0')) - parseInt(String(b.Roll_No || '0'));
    });
  }, [students, filters]);

  return (
    <div className="font-bn space-y-6 pb-12 animate-fade-in">
       <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 no-print">
          <input 
            placeholder="নাম বা আইডি..." 
            value={filters.search}
            onChange={e => setFilters(p => ({...p, search: e.target.value}))}
            className="px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 font-bold outline-none"
          />
          <select 
            value={filters.class}
            onChange={e => setFilters(p => ({...p, class: e.target.value}))}
            className="px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 font-bold outline-none"
          >
            <option value="">সকল শ্রেণী</option>
            {settings?.Class_List.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select 
            value={filters.year}
            onChange={e => setFilters(p => ({...p, year: e.target.value}))}
            className="px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 font-bold outline-none"
          >
            {settings?.Year_List.map(y => <option key={y} value={y}>{y} সেশন</option>)}
          </select>
          <button onClick={() => window.print()} className="bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
            <ICONS.Print className="w-5 h-5" /> রিপোর্ট প্রিন্ট
          </button>
       </div>

       <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden print:shadow-none print:border-none">
          <div className="hidden print:block text-center mb-8">
             <h1 className="text-2xl font-black font-bn">আল-ঈমান মাদরাসা</h1>
             <p className="font-bold font-bn">ফাইনাল শিক্ষার্থী তালিকা - {filters.year} সেশন</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-slate-50 border-b border-slate-100 print:bg-white print:border-black">
                  <tr>
                     <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest print:text-black">শিক্ষার্থীর তথ্য</th>
                     <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest print:text-black">একাডেমিক তথ্য</th>
                     <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest print:text-black">অভিভাবক ও যোগাযোগ</th>
                     <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center no-print">ভিউ</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50 print:divide-black">
                  {processedData.length > 0 ? processedData.map(s => (
                      <tr key={s.Student_UID} className="hover:bg-slate-50/50 print:border-b">
                         <td className="px-8 py-4">
                            <p className="font-black text-slate-900">{s.Name_Bangla}</p>
                            <p className="text-[10px] font-bold text-blue-600 uppercase">UID: {s.Student_UID}</p>
                         </td>
                         <td className="px-6 py-4">
                            <p className="font-bold text-slate-800">{s.Class_Name || 'ভর্তি হয়নি'}</p>
                            <p className="text-[10px] font-black uppercase">রোল: {s.Roll_No || '০'} | শাখা: {s.Section || '---'}</p>
                         </td>
                         <td className="px-6 py-4">
                            <p className="text-sm font-bold text-slate-700">{s.Father_Name_BN}</p>
                            <p className="text-xs font-black text-slate-500">{s.Mobile_Primary}</p>
                         </td>
                         <td className="px-8 py-4 text-center no-print">
                            <button onClick={() => onView(s)} className="text-blue-600 hover:scale-110 transition-transform"><ICONS.View className="w-6 h-6"/></button>
                         </td>
                      </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold">তালিকায় কোনো শিক্ষার্থী নেই</td>
                    </tr>
                  )}
               </tbody>
            </table>
          </div>
       </div>
    </div>
  );
};

export default FinalList;