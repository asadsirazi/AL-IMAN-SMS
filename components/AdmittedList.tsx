import React, { useState, useMemo } from 'react';
import { StudentData, AcademicRecord, SettingsData } from '../types';
import { ICONS, CLASS_ORDER } from '../constants';

interface Props {
  students: StudentData[];
  settings: SettingsData | null;
  onDelete: (uid: string) => void;
  onEdit: (student: StudentData) => void;
  onView: (student: StudentData) => void;
}

const CURRENT_YEAR = new Date().getFullYear().toString();

const AdmittedList: React.FC<Props> = ({ students, settings, onDelete, onEdit, onView }) => {
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);

  const admittedData = useMemo(() => {
    return students.filter(s => {
      const matchesYear = String(s.Academic_Year || '').trim() === selectedYear;
      const hasAcademicInfo = !!s.Class_Name;
      
      const searchLower = search.toLowerCase();
      const matchesSearch = (s.Name_Bangla || '').includes(search) || 
                           (String(s.Student_UID || '')).includes(search);
      
      const matchesClass = !selectedClass || s.Class_Name === selectedClass;

      return matchesYear && hasAcademicInfo && matchesSearch && matchesClass;
    }).sort((a, b) => {
      const cA = CLASS_ORDER.indexOf(a.Class_Name || '');
      const cB = CLASS_ORDER.indexOf(b.Class_Name || '');
      if (cA !== cB) return cA - cB;
      return parseInt(String(a.Roll_No || '0')) - parseInt(String(b.Roll_No || '0'));
    });
  }, [students, search, selectedClass, selectedYear]);

  return (
    <div className="font-bn space-y-6 pb-12 animate-fade-in">
       <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center no-print">
         <div className="relative flex-1 min-w-[280px]">
            <input 
              type="text" 
              placeholder="নাম বা আইডি দিয়ে খুঁজুন..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 font-bold outline-none shadow-sm"
            />
            <ICONS.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
         </div>
         
         <div className="flex gap-3">
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-6 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 font-bold outline-none"
            >
              {settings?.Year_List.map(y => <option key={y} value={y}>{y} সেশন</option>)}
            </select>

            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-6 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 font-bold outline-none"
            >
              <option value="">সকল শ্রেণী</option>
              {settings?.Class_List.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
         </div>
         
         <div className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-600/20">
           মোট: {admittedData.length} জন
         </div>
       </div>

       <div className="bg-white rounded-[2.8rem] border border-slate-100 shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
           <table className="w-full text-left">
             <thead>
               <tr className="bg-slate-50 border-b border-slate-100">
                 <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">শিক্ষার্থী</th>
                 <th className="px-6 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">শ্রেণী ও শাখা</th>
                 <th className="px-6 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">রোল</th>
                 <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center no-print">অ্যাকশন</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
               {admittedData.length > 0 ? admittedData.map((item, idx) => (
                 <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                   <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                         <img 
                           src={item.Photo_URL && item.Photo_URL !== '---' ? item.Photo_URL : `https://ui-avatars.com/api/?background=random&name=${item.Name_English}`} 
                           className="w-12 h-12 rounded-2xl object-cover border" 
                           alt="" 
                         />
                         <div>
                           <p className="font-black text-slate-900 text-[16px] leading-tight mb-1">{item.Name_Bangla}</p>
                           <p className="text-[10px] font-black text-blue-600 uppercase">ID: {item.Student_UID}</p>
                         </div>
                      </div>
                   </td>
                   <td className="px-6 py-5">
                      <p className="font-black text-slate-800 text-base mb-1">{item.Class_Name}</p>
                      <p className="text-[11px] font-bold text-blue-500 uppercase tracking-widest">{item.Section || 'শাখা নেই'}</p>
                   </td>
                   <td className="px-6 py-5 text-center">
                      <span className="inline-block px-3 py-1.5 bg-slate-900 text-white rounded-xl font-black text-sm">{item.Roll_No}</span>
                   </td>
                   <td className="px-8 py-5 no-print">
                      <div className="flex items-center justify-center gap-2">
                         <button onClick={() => onView(item)} className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all" title="স্লিপ দেখুন"><ICONS.View className="w-5 h-5"/></button>
                         <button onClick={() => onEdit(item)} className="p-2.5 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-all" title="একাডেমিক তথ্য পরিবর্তন"><ICONS.Edit className="w-5 h-5"/></button>
                         <button onClick={() => onDelete(item.Student_UID)} className="p-2.5 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all" title="ডিলিট"><ICONS.Delete className="w-5 h-5"/></button>
                      </div>
                   </td>
                 </tr>
               )) : (
                 <tr>
                   <td colSpan={4} className="px-8 py-32 text-center text-slate-400 font-bold">তালিকায় কোনো শিক্ষার্থী নেই</td>
                 </tr>
               )}
             </tbody>
           </table>
         </div>
       </div>
    </div>
  );
};

export default AdmittedList;