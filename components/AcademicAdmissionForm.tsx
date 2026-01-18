
import React, { useState, useEffect } from 'react';
import { StudentData, SettingsData, AcademicRecord } from '../types';
import { gasService } from '../services/gasService';

interface Props {
  settings: SettingsData | null;
  onSubmit: (record: AcademicRecord) => void;
  loading: boolean;
  allProfiles: StudentData[];
  editRecord?: AcademicRecord | null;
  onCancel?: () => void;
}

const CURRENT_YEAR = new Date().getFullYear().toString();

const AcademicAdmissionForm: React.FC<Props> = ({ settings, onSubmit, loading, allProfiles, editRecord, onCancel }) => {
  const [pendingStudents, setPendingStudents] = useState<any[]>([]);
  const [selectedUID, setSelectedUID] = useState('');
  const [fetchingPending, setFetchingPending] = useState(false);
  
  const [formData, setFormData] = useState<AcademicRecord>({
    Record_ID: '',
    Student_UID: '',
    Academic_Year: CURRENT_YEAR,
    Class_Name: '',
    Section: '',
    Roll_No: '',
    Entry_Date: ''
  });

  useEffect(() => {
    if (editRecord) {
      setSelectedUID(editRecord.Student_UID);
      setFormData(editRecord);
    } else {
      const fetchPending = async () => {
        setFetchingPending(true);
        try {
          const data = await gasService.getPending(CURRENT_YEAR);
          setPendingStudents(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Failed to fetch pending", err);
        } finally {
          setFetchingPending(false);
        }
      };
      fetchPending();
    }
  }, [editRecord]);

  const handleStudentSelect = (uid: string) => {
    setSelectedUID(uid);
    setFormData(prev => ({ ...prev, Student_UID: uid }));
  };

  const fullProfile = allProfiles.find(p => 
    String(p.Student_UID).trim() === String(selectedUID).trim()
  );

  const handleFinalSubmit = () => {
    if (!selectedUID || !formData.Class_Name || !formData.Roll_No) {
      alert("দয়া করে সকল প্রয়োজনীয় তথ্য প্রদান করুন।");
      return;
    }

    // বর্তমান তারিখকে YYYY-MM-DD ফরম্যাটে নিয়ে আসা
    const now = new Date();
    const entryDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const cleanRecord: AcademicRecord = {
      ...formData,
      Student_UID: selectedUID,
      // যদি এডিট মোড হয় তবে পুরাতন তারিখ থাকবে, না হয় আজকের তারিখ
      Entry_Date: (editRecord && formData.Entry_Date) ? formData.Entry_Date : entryDate,
      Record_ID: editRecord ? formData.Record_ID : `REC_${Date.now()}_${selectedUID}`
    };
    
    onSubmit(cleanRecord);
  };

  return (
    <div className="font-bn space-y-8 animate-fade-in max-w-4xl mx-auto pb-24">
      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
          <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
          {editRecord ? 'শিক্ষার্থীর তথ্য (পরিবর্তনযোগ্য নয়)' : 'ধাপ ১: শিক্ষার্থী নির্বাচন করুন'}
        </h2>
        
        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
           <label className="text-xs font-black text-slate-500 uppercase block mb-3">শিক্ষার্থী আইডি ও নাম</label>
           {editRecord ? (
             <div className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 font-black text-slate-900">
                {editRecord.Student_UID} — {fullProfile?.Name_Bangla || 'শিক্ষার্থী'}
             </div>
           ) : (
             <select 
               value={selectedUID} 
               onChange={(e) => handleStudentSelect(e.target.value)}
               className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 font-black outline-none focus:border-blue-500 shadow-sm transition-all"
               disabled={fetchingPending}
             >
               <option value="">
                 {fetchingPending ? 'লোড হচ্ছে...' : (pendingStudents.length === 0 ? `ভর্তির জন্য (${CURRENT_YEAR}) কোনো প্রোফাইল অবশিষ্ট নেই` : 'সিলেক্ট করুন')}
               </option>
               {pendingStudents.map((s, idx) => (
                 <option key={idx} value={s.Student_UID || s.uid}>
                   {s.Student_UID || s.uid} — {s.Name_Bangla}
                 </option>
               ))}
             </select>
           )}
        </div>

        {fullProfile && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-blue-50/50 rounded-3xl border border-blue-100 animate-fade-in">
             <div className="bg-white p-5 rounded-2xl border border-blue-50 shadow-sm">
                <p className="text-[10px] font-black text-blue-600 uppercase mb-1 tracking-widest">শিক্ষার্থীর নাম (বাংলা)</p>
                <p className="font-black text-slate-900 text-xl">{fullProfile.Name_Bangla}</p>
             </div>
             <div className="bg-white p-5 rounded-2xl border border-blue-50 shadow-sm">
                <p className="text-[10px] font-black text-blue-600 uppercase mb-1 tracking-widest">পিতার নাম (বাংলা)</p>
                <p className="font-black text-slate-900 text-xl">{fullProfile.Father_Name_BN}</p>
             </div>
          </div>
        )}
      </div>

      <div className={`bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all duration-500 ${!selectedUID ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
          <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
          {editRecord ? 'ধাপ ২: একাডেমিক তথ্য আপডেট করুন' : 'ধাপ ২: একাডেমিক তথ্য প্রদান করুন'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 px-1">শ্রেণী নির্বাচন করুন *</label>
            <select 
              value={formData.Class_Name} 
              onChange={e => setFormData({...formData, Class_Name: e.target.value})}
              className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 font-bold focus:border-blue-500 outline-none"
            >
              <option value="">সিলেক্ট করুন</option>
              {settings?.Class_List.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 px-1">শাখা নির্বাচন করুন *</label>
            <select 
              value={formData.Section} 
              onChange={e => setFormData({...formData, Section: e.target.value})}
              className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 font-bold focus:border-blue-500 outline-none"
            >
              <option value="">সিলেক্ট করুন</option>
              {settings?.Section_List.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 px-1">রোল নম্বর প্রদান করুন *</label>
            <input 
              type="text" 
              value={formData.Roll_No} 
              onChange={e => setFormData({...formData, Roll_No: e.target.value})}
              className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 font-bold focus:border-blue-500 outline-none"
              placeholder="রোল লিখুন"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 px-1">ভর্তি শিক্ষাবর্ষ</label>
            <input type="text" value={formData.Academic_Year} className="w-full px-5 py-3.5 rounded-2xl bg-slate-200 border border-slate-200 font-bold cursor-not-allowed opacity-70" readOnly />
          </div>
        </div>

        <div className="mt-10 flex justify-end gap-3">
          {editRecord && (
            <button onClick={onCancel} className="px-10 py-4 rounded-2xl border-2 border-slate-100 font-black hover:bg-slate-50 transition-all">বাতিল</button>
          )}
          <button 
            onClick={handleFinalSubmit}
            disabled={loading || !selectedUID || !formData.Class_Name}
            className={`px-16 py-4 rounded-2xl text-white font-black shadow-xl disabled:opacity-50 transition-all active:scale-95 ${editRecord ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'}`}
          >
            {loading ? 'প্রসেসিং...' : (editRecord ? 'তথ্য আপডেট করুন' : 'ভর্তি সম্পন্ন করুন')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcademicAdmissionForm;
