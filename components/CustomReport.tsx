import React, { useState, useMemo } from 'react';
import { StudentData, SettingsData } from '../types';
import { ICONS } from '../constants';

interface Props {
  students: StudentData[];
  settings: SettingsData | null;
}

const CURRENT_YEAR = new Date().getFullYear().toString();

const COLUMN_MAP: Record<string, string> = {
  'Serial_No': 'ক্রমিক নং',
  'Roll_No': 'রোল নং',
  'Student_UID': 'আইডি (UID)',
  'Name_Bangla': 'শিক্ষার্থীর নাম (বাংলা)',
  'Name_English': 'নাম (ইংরেজি)',
  'Father_Name_BN': 'পিতার নাম',
  'Mother_Name_BN': 'মাতার নাম',
  'DOB': 'জন্ম তারিখ',
  'Gender': 'লিঙ্গ',
  'Mobile_Primary': 'মোবাইল',
  'Village': 'গ্রাম',
  'Union_Post': 'ইউনিয়ন/ডাকঘর',
  'Upazila': 'উপজেলা',
  'District': 'জেলা',
  'Form_No': 'ফরম নম্বর',
  'Birth_Reg_No': 'জন্ম নিবন্ধন',
  'Current_Status': 'অবস্থা'
};

const CustomReport: React.FC<Props> = ({ students, settings }) => {
  const [filters, setFilters] = useState({
    year: CURRENT_YEAR,
    class: ''
  });

  const [selectedCols, setSelectedCols] = useState<string[]>(['Serial_No', 'Roll_No', 'Student_UID', 'Name_Bangla', 'Mobile_Primary']);

  const availableCols = Object.keys(COLUMN_MAP);

  const filteredData = useMemo(() => {
    if (!filters.class) return [];
    return students.filter(s => 
      String(s.Academic_Year).trim() === filters.year && 
      s.Class_Name === filters.class
    ).sort((a, b) => parseInt(String(a.Roll_No || 0)) - parseInt(String(b.Roll_No || 0)));
  }, [students, filters]);

  const toggleColumn = (col: string) => {
    setSelectedCols(prev => 
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  const moveColumn = (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= selectedCols.length) return;
    
    const newCols = [...selectedCols];
    const [movedItem] = newCols.splice(index, 1);
    newCols.splice(nextIndex, 0, movedItem);
    setSelectedCols(newCols);
  };

  const handleExport = () => {
    if (filteredData.length === 0) {
      alert("এক্সপোর্ট করার জন্য কোনো ডাটা পাওয়া যায়নি।");
      return;
    }

    const exportData = filteredData.map((s, idx) => {
      const row: any = {};
      selectedCols.forEach(col => {
        if (col === 'Serial_No') {
          row[COLUMN_MAP[col]] = idx + 1;
        } else {
          row[COLUMN_MAP[col]] = (s as any)[col] || '---';
        }
      });
      return row;
    });

    const worksheet = (window as any).XLSX.utils.json_to_sheet(exportData);
    const workbook = (window as any).XLSX.utils.book_new();
    (window as any).XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    (window as any).XLSX.writeFile(workbook, `Report_${filters.class}_${filters.year}.xlsx`);
  };

  return (
    <div className="font-bn space-y-8 animate-fade-in pb-32">
      {/* Step 1: Filter */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-wrap gap-6 items-end">
        <div className="flex-1 min-w-[200px] space-y-2">
           <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">শিক্ষাবর্ষ নির্বাচন করুন</label>
           <select 
             value={filters.year} 
             onChange={e => setFilters({...filters, year: e.target.value})}
             className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 font-bold outline-none"
           >
             {settings?.Year_List.map(y => <option key={y} value={y}>{y} সেশন</option>)}
           </select>
        </div>
        <div className="flex-1 min-w-[200px] space-y-2">
           <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">শ্রেণী নির্বাচন করুন</label>
           <select 
             value={filters.class} 
             onChange={e => setFilters({...filters, class: e.target.value})}
             className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 font-bold outline-none"
           >
             <option value="">সিলেক্ট করুন</option>
             {settings?.Class_List.map(c => <option key={c} value={c}>{c}</option>)}
           </select>
        </div>
        <div className="px-8 py-4 bg-blue-50 text-blue-600 rounded-2xl font-black">
          প্রাপ্ত ডাটা: {filteredData.length} জন
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Step 2: Column Config */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span> কলাম নির্বাচন করুন
              </h3>
              <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                 {availableCols.map(col => (
                   <label key={col} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${selectedCols.includes(col) ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100 hover:border-slate-300'}`}>
                      <input 
                        type="checkbox" 
                        checked={selectedCols.includes(col)} 
                        onChange={() => toggleColumn(col)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-bold text-slate-700">{COLUMN_MAP[col]}</span>
                   </label>
                 ))}
              </div>
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span> কলামের ক্রম সাজান
              </h3>
              <div className="space-y-2">
                 {selectedCols.map((col, idx) => (
                   <div key={col} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-sm font-bold text-slate-700">{idx + 1}. {COLUMN_MAP[col]}</span>
                      <div className="flex gap-1">
                         <button onClick={() => moveColumn(idx, 'up')} className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-blue-600 transition-all">↑</button>
                         <button onClick={() => moveColumn(idx, 'down')} className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-blue-600 transition-all">↓</button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Step 3: Preview */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                   <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span> প্রিভিউ (প্রথম ৫ জন)
                 </h3>
                 <button 
                  onClick={handleExport}
                  disabled={filteredData.length === 0}
                  className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-slate-900/20 hover:bg-black transition-all disabled:opacity-50"
                 >
                   <ICONS.Excel className="w-5 h-5" /> এক্সেল ডাউনলোড করুন
                 </button>
              </div>

              <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                       <tr>
                          {selectedCols.map(col => (
                            <th key={col} className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{COLUMN_MAP[col]}</th>
                          ))}
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {filteredData.slice(0, 5).map((s, idx) => (
                         <tr key={idx} className="hover:bg-slate-50/50">
                            {selectedCols.map(col => (
                              <td key={col} className="px-4 py-4 text-sm font-bold text-slate-700 whitespace-nowrap">
                                {col === 'Serial_No' ? idx + 1 : (s as any)[col] || '---'}
                              </td>
                            ))}
                         </tr>
                       ))}
                       {filteredData.length === 0 && (
                         <tr>
                            <td colSpan={selectedCols.length} className="px-4 py-20 text-center text-slate-400 font-bold">প্রিভিউ করার জন্য ডাটা নেই</td>
                         </tr>
                       )}
                    </tbody>
                 </table>
              </div>
              {filteredData.length > 5 && (
                <p className="mt-4 text-center text-xs font-bold text-slate-400 italic">* আরো {filteredData.length - 5} জন শিক্ষার্থী তালিকায় রয়েছেন</p>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default CustomReport;