
import React, { useState, useMemo, useEffect } from 'react';
import { StudentData, SettingsData, AcademicRecord } from '../types';
import { ICONS } from '../constants';
import { gasService } from '../services/gasService';

interface Props {
  students: StudentData[];
  settings: SettingsData | null;
  onMigrate: (updatedStudents: any[]) => Promise<void>;
  loading: boolean;
}

const CURRENT_YEAR_INT = new Date().getFullYear();
const NEXT_YEAR = (CURRENT_YEAR_INT + 1).toString();

const Migration: React.FC<Props> = ({ settings, onMigrate, loading }) => {
  // --- States ---
  const [sourceYear, setSourceYear] = useState(CURRENT_YEAR_INT.toString());
  const [sourceClass, setSourceClass] = useState('');
  const [sourceSection, setSourceSection] = useState('');
  
  const [targetYear, setTargetYear] = useState(NEXT_YEAR);
  const [targetClass, setTargetClass] = useState('');
  const [targetSection, setTargetSection] = useState('');

  const [fetchedStudents, setFetchedStudents] = useState<StudentData[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [customRolls, setCustomRolls] = useState<Record<string, string>>({});

  // --- Handlers ---
  const handleLoadStudents = async () => {
    if (!sourceYear || !sourceClass) {
      alert("দয়া করে বর্তমান বছর এবং শ্রেণী নির্বাচন করুন।");
      return;
    }
    setIsFetching(true);
    setFetchedStudents([]); // Clear existing
    
    try {
      // সোর্স ইয়ার অনুযায়ী প্রোফাইল রিড করা
      const data = await gasService.readProfiles(sourceYear);
      
      // ডাটা ফিল্টারিং: সরাসরি অবজেক্ট থেকে চেক করা (কারণ read_joined ফ্ল্যাট ডাটা দেয়)
      const filtered = (data || []).filter((s: StudentData) => {
        // যদি ডাটা ফ্ল্যাট হয়
        const matchesClass = String(s.Class_Name) === sourceClass;
        const matchesSection = !sourceSection || String(s.Section) === sourceSection;
        const matchesYear = String(s.Academic_Year) === sourceYear;
        
        if (matchesClass && matchesSection && matchesYear) return true;

        // যদি ডাটা নেস্টেড হিস্ট্রিতে থাকে (Fallback)
        const rec = s.History?.find(r => String(r.Academic_Year) === sourceYear);
        return rec && rec.Class_Name === sourceClass && (!sourceSection || rec.Section === sourceSection);
      });
      
      if (filtered.length === 0) {
        alert("নির্বাচিত শ্রেণী ও শাখায় কোনো শিক্ষার্থী পাওয়া যায়নি।");
      }

      setFetchedStudents(filtered);
      
      // রোল নম্বর এবং সিলেকশন ইনিশিয়ালাইজ করা
      const rolls: Record<string, string> = {};
      const ids = new Set<string>();
      filtered.forEach((s: StudentData) => {
        const currentRoll = s.Roll_No || s.History?.find(r => String(r.Academic_Year) === sourceYear)?.Roll_No || '';
        rolls[s.Student_UID] = String(currentRoll);
        ids.add(s.Student_UID);
      });
      setCustomRolls(rolls);
      setSelectedIds(ids); // Default select all
    } catch (err) {
      console.error(err);
      alert("ডাটা লোড করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
    } finally {
      setIsFetching(false);
    }
  };

  const handleToggleSelect = (uid: string) => {
    const next = new Set(selectedIds);
    if (next.has(uid)) next.delete(uid);
    else next.add(uid);
    setSelectedIds(next);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === fetchedStudents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(fetchedStudents.map(s => s.Student_UID)));
    }
  };

  const handleExecuteMigration = async () => {
    if (!targetClass || !targetYear) {
      alert("টার্গেট শ্রেণী এবং শিক্ষাবর্ষ নির্বাচন করুন।");
      return;
    }
    if (selectedIds.size === 0) {
      alert("কমপক্ষে একজন শিক্ষার্থী নির্বাচন করুন।");
      return;
    }

    if (!window.confirm(`আপনি কি নিশ্চিতভাবে ${selectedIds.size} জন শিক্ষার্থীকে পরবর্তী শ্রেণীতে মাইগ্রেট করতে চান?`)) return;

    const migrationPayload = fetchedStudents
      .filter(s => selectedIds.has(s.Student_UID))
      .map(s => ({
        Student_UID: s.Student_UID,
        Academic_Year: targetYear,
        Class_Name: targetClass,
        Section: targetSection || s.Section || sourceSection,
        Roll_No: customRolls[s.Student_UID] || ''
      }));

    await onMigrate(migrationPayload);
    
    // সফল হলে তালিকা পরিষ্কার করা
    setFetchedStudents([]);
    setSelectedIds(new Set());
  };

  return (
    <div className="font-bn space-y-8 animate-fade-in pb-40">
      
      {/* STEP 1: SOURCE FILTER */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
          <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
          ধাপ ১: কাদের মাইগ্রেট করবেন? (Source)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">বর্তমান বছর</label>
            <select 
              value={sourceYear} 
              onChange={e => setSourceYear(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 font-bold outline-none"
            >
              {settings?.Year_List.map(y => <option key={y} value={y}>{y} সেশন</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">বর্তমান শ্রেণী</label>
            <select 
              value={sourceClass} 
              onChange={e => setSourceClass(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 font-bold outline-none"
            >
              <option value="">সিলেক্ট করুন</option>
              {settings?.Class_List.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">বর্তমান শাখা</label>
            <select 
              value={sourceSection} 
              onChange={e => setSourceSection(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 font-bold outline-none"
            >
              <option value="">সকল শাখা</option>
              {settings?.Section_List.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button 
            onClick={handleLoadStudents}
            disabled={isFetching || !sourceClass}
            className="h-[54px] px-8 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isFetching ? 'লোড হচ্ছে...' : 'শিক্ষার্থী তালিকা লোড করুন'}
          </button>
        </div>
      </div>

      {/* STEP 2: TARGET DESTINATION */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm border-l-[12px] border-l-emerald-500">
        <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
          <span className="w-2 h-8 bg-emerald-600 rounded-full"></span>
          ধাপ ২: কোথায় পাঠাবেন? (Target Destination)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-emerald-600 uppercase tracking-widest px-1">পরবর্তী শিক্ষাবর্ষ</label>
            <select 
              value={targetYear} 
              onChange={e => setTargetYear(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-100 font-black outline-none focus:border-emerald-500"
            >
              {settings?.Year_List.map(y => <option key={y} value={y}>{y} সেশন</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-emerald-600 uppercase tracking-widest px-1">পরবর্তী শ্রেণী</label>
            <select 
              value={targetClass} 
              onChange={e => setTargetClass(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-100 font-black outline-none focus:border-emerald-500"
            >
              <option value="">সিলেক্ট করুন</option>
              {settings?.Class_List.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-emerald-600 uppercase tracking-widest px-1">পরবর্তী শাখা</label>
            <select 
              value={targetSection} 
              onChange={e => setTargetSection(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-100 font-black outline-none focus:border-emerald-500"
            >
              <option value="">বর্তমান শাখার মতই</option>
              {settings?.Section_List.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* STEP 3: STUDENT LIST TABLE */}
      {fetchedStudents.length > 0 && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
          <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border cursor-pointer hover:bg-slate-50 transition-colors" onClick={handleSelectAll}>
                   <input 
                     type="checkbox" 
                     checked={selectedIds.size === fetchedStudents.length} 
                     readOnly
                     className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 pointer-events-none"
                   />
                   <span className="text-xs font-black text-slate-500 uppercase">সবগুলো সিলেক্ট</span>
                </div>
                <p className="text-sm font-bold text-slate-500">{selectedIds.size} জন শিক্ষার্থী নির্বাচিত</p>
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-4 w-16"></th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">শিক্ষার্থী আইডি ও নাম</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">বর্তমান রোল</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">নতুন রোল (পরিবর্তনযোগ্য)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {fetchedStudents.map(s => {
                  const currentRoll = s.Roll_No || s.History?.find(r => String(r.Academic_Year) === sourceYear)?.Roll_No || '---';
                  const isSelected = selectedIds.has(s.Student_UID);
                  return (
                    <tr key={s.Student_UID} className={`hover:bg-slate-50/50 transition-all ${!isSelected ? 'bg-slate-50/30' : ''}`}>
                      <td className="px-8 py-4 text-center">
                        <input 
                          type="checkbox" 
                          checked={isSelected} 
                          onChange={() => handleToggleSelect(s.Student_UID)}
                          className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                           <img 
                            src={s.Photo_URL && s.Photo_URL !== '---' ? s.Photo_URL : `https://ui-avatars.com/api/?background=random&name=${s.Name_English}`} 
                            className="w-10 h-10 rounded-xl object-cover border" 
                            alt="" 
                           />
                           <div>
                              <p className="font-black text-slate-900 leading-tight">{s.Name_Bangla}</p>
                              <p className="text-[10px] font-black text-blue-500 uppercase">UID: {s.Student_UID}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg font-black">{currentRoll}</span>
                      </td>
                      <td className="px-8 py-4 text-center">
                         <input 
                           type="text" 
                           value={customRolls[s.Student_UID] || ''}
                           onChange={e => setCustomRolls({...customRolls, [s.Student_UID]: e.target.value})}
                           disabled={!isSelected}
                           className="w-24 px-4 py-2 bg-white border-2 border-slate-100 rounded-xl text-center font-black focus:border-blue-500 outline-none transition-all disabled:bg-slate-50 disabled:border-transparent disabled:text-slate-300"
                         />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {fetchedStudents.length === 0 && !isFetching && (
        <div className="bg-white p-20 rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
           <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
              <ICONS.Migration className="w-10 h-10" />
           </div>
           <h3 className="text-xl font-black text-slate-900 mb-2">কোনো শিক্ষার্থী লোড করা হয়নি</h3>
           <p className="text-slate-500 font-bold max-w-sm mx-auto">দয়া করে বর্তমান বছর এবং শ্রেণী সিলেক্ট করে উপরের বাটনটিতে ক্লিক করুন।</p>
        </div>
      )}

      {/* FOOTER ACTION BAR */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white/95 backdrop-blur-md border-t p-6 flex items-center justify-between z-40 shadow-2xl animate-fade-in no-print">
         <div className="hidden md:block">
            <p className="text-sm font-bold text-slate-500">মাইগ্রেশনের জন্য <span className="text-slate-900 font-black">{selectedIds.size}</span> জন শিক্ষার্থী নির্বাচিত হয়েছে।</p>
         </div>
         <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={handleExecuteMigration}
              disabled={loading || selectedIds.size === 0 || !targetClass}
              className="flex-1 md:flex-none px-12 py-4 rounded-2xl bg-emerald-600 text-white font-black shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : <ICONS.Migration className="w-5 h-5" />}
              মাইগ্রেশন সম্পন্ন করুন
            </button>
         </div>
      </div>

    </div>
  );
};

export default Migration;
