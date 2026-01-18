import React, { useState, useMemo } from 'react';
import { StudentData, SettingsData } from '../types';
import { ICONS, CLASS_ORDER } from '../constants';

interface Props {
  students: StudentData[];
  settings: SettingsData | null;
  onDelete: (uid: string) => void;
  onEdit: (student: StudentData) => void;
  onView: (student: StudentData) => void;
  onRefresh: () => void;
}

const StudentList: React.FC<Props> = ({ students, settings, onDelete, onEdit, onView, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  const filteredAndSorted = useMemo(() => {
    return students
      .filter(s => {
        const uid = String(s.Student_UID || '').toLowerCase();
        const nameBN = String(s.Name_Bangla || '').toLowerCase();
        const searchLower = search.toLowerCase();
        const matchesSearch = nameBN.includes(searchLower) || uid.includes(searchLower);
        const matchesClass = !selectedClass || s.Class_Name === selectedClass;
        return matchesSearch && matchesClass;
      })
      .sort((a, b) => {
        const classA = CLASS_ORDER.indexOf(String(a.Class_Name || ''));
        const classB = CLASS_ORDER.indexOf(String(b.Class_Name || ''));
        if (classA !== classB) return classA - classB;
        return parseInt(String(a.Roll_No || '0')) - parseInt(String(b.Roll_No || '0'));
      });
  }, [students, search, selectedClass]);

  return (
    <div className="animate-fade-in space-y-6 pb-12 font-bn">
      <div className="bg-white p-6 lg:p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center no-print">
        <div className="relative flex-1 min-w-[300px]">
          <input
            type="text"
            placeholder="নাম অথবা আইডি দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none font-bold shadow-sm"
          />
          <ICONS.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-6 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 font-bold outline-none"
        >
          <option value="">সকল শ্রেণী</option>
          {settings?.Class_List.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <button onClick={onRefresh} className="px-8 py-3.5 rounded-2xl bg-slate-900 text-white font-bold flex items-center gap-2 hover:bg-black transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          রিফ্রেশ
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">শিক্ষার্থীর তথ্য</th>
                <th className="px-6 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">একাডেমিক তথ্য</th>
                <th className="px-6 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">যোগাযোগ</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAndSorted.length > 0 ? filteredAndSorted.map((s) => (
                <tr key={s.Student_UID} className="hover:bg-blue-50/20 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <img 
                        src={s.Photo_URL && s.Photo_URL !== '---' ? s.Photo_URL : `https://ui-avatars.com/api/?background=random&name=${s.Name_English}`} 
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200" 
                        alt="" 
                      />
                      <div>
                        <p className="font-black text-slate-900 text-[16px]">{s.Name_Bangla}</p>
                        <p className="text-[10px] font-black text-blue-500 uppercase">UID: {s.Student_UID}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="font-bold text-slate-800">{s.Class_Name || 'ভর্তি নেই'}</p>
                    {s.Class_Name && <p className="text-[10px] font-black text-slate-400">রোল: {s.Roll_No} | শাখা: {s.Section}</p>}
                  </td>
                  <td className="px-6 py-5 text-sm font-black text-slate-700">
                     {s.Mobile_Primary}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => onView(s)} className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"><ICONS.View className="w-5 h-5"/></button>
                      <button onClick={() => onEdit(s)} className="p-2.5 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-all"><ICONS.Edit className="w-5 h-5"/></button>
                      <button onClick={() => onDelete(String(s.Student_UID))} className="p-2.5 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"><ICONS.Delete className="w-5 h-5"/></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold">কোনো শিক্ষার্থী পাওয়া যায়নি</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentList;