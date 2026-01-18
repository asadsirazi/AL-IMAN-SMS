
import React from 'react';
import { StudentData, AcademicRecord, ModalMode } from '../types';
import { ICONS } from '../constants';

interface Props {
  student: StudentData;
  mode: ModalMode;
  onClose: () => void;
}

const StudentDetailModal: React.FC<Props> = ({ student, mode, onClose }) => {
  const formatHumanDate = (dateVal: any, fieldName?: string) => {
    const monthsBN = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

    if (fieldName === 'DOB') {
      const d = student.DOB_Day;
      const m = student.DOB_Month;
      const y = student.DOB_Year;
      if (d && m && y && String(d) !== '---' && String(m) !== '---' && String(y) !== '---') {
        const dayStr = String(d).padStart(2, '0');
        const monthIdx = parseInt(String(m)) - 1;
        if (!isNaN(monthIdx) && monthIdx >= 0 && monthIdx < 12) {
          return `${dayStr} ${monthsBN[monthIdx]}, ${y}`;
        }
      }
    }

    if (!dateVal || dateVal === '---' || dateVal === 'undefined' || dateVal === 'null' || dateVal === '') return '---';

    try {
      let d: Date;
      if (dateVal instanceof Date) { d = dateVal; } 
      else {
        const dateStr = String(dateVal).trim();
        if (dateStr.includes('T')) { d = new Date(dateStr); } 
        else {
          const parts = dateStr.split(/[-/T. ]/);
          if (parts.length >= 3) {
            if (parts[0].length === 4) { d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])); } 
            else { d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])); }
          } else { d = new Date(dateStr); }
        }
      }
      if (isNaN(d.getTime())) return String(dateVal);
      return new Intl.DateTimeFormat('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
    } catch (e) { return String(dateVal); }
  };

  const latestRecord: AcademicRecord | undefined = (student.History && student.History.length > 0)
    ? [...student.History].sort((a, b) => String(b.Academic_Year).localeCompare(String(a.Academic_Year)))[0]
    : (student.Class_Name ? {
        Academic_Year: student.Academic_Year || '',
        Class_Name: student.Class_Name || '',
        Section: student.Section || '',
        Roll_No: student.Roll_No || '',
        Record_ID: String(student.Record_ID || ''),
        Student_UID: student.Student_UID,
        Entry_Date: student.Entry_Date || ''
      } : undefined);

  const handlePrint = () => window.print();

  const DataRow = ({ labelBN, value, isLast = false, fieldName, isLarge = false }: any) => (
    <div className={`flex border-slate-300 ${!isLast ? 'border-b' : ''} min-h-[38px]`}>
      <div className="w-[180px] bg-slate-50/80 px-4 py-2 flex items-center border-r border-slate-300">
        <span className="text-[12px] font-bold text-slate-700 font-bn leading-tight">{labelBN}</span>
      </div>
      <div className="flex-1 px-4 py-2 flex items-center bg-white">
        <span className={`text-slate-900 font-bold ${isLarge ? 'text-[15px]' : 'text-[14px]'} font-bn`}>
          {fieldName ? formatHumanDate(value, fieldName) : (value || '---')}
        </span>
      </div>
    </div>
  );

  if (mode === 'full') {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm no-print overflow-y-auto">
        <div className="absolute inset-0" onClick={onClose}></div>
        <div className="relative bg-white w-full max-w-[900px] max-h-[95vh] overflow-y-auto rounded-[2rem] shadow-2xl animate-fade-in print:overflow-visible print:shadow-none print:rounded-none">
          
          <div className="sticky top-0 bg-white/95 backdrop-blur-md px-8 py-4 border-b border-slate-100 flex items-center justify-between z-20 no-print">
            <div className="flex items-center gap-3">
               <div className="p-2.5 bg-slate-900 text-white rounded-xl"><ICONS.View className="w-5 h-5" /></div>
               <div>
                  <h2 className="font-black text-slate-800 text-sm font-bn">শিক্ষার্থী প্রোফাইল নথিপত্র</h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">OFFICIAL STUDENT PROFILE REPORT</p>
               </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handlePrint} className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-black flex items-center gap-2 hover:bg-blue-700 transition-all font-bn">
                <ICONS.Print className="w-4 h-4" /> প্রিন্ট করুন (A4)
              </button>
              <button onClick={onClose} className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all">✕</button>
            </div>
          </div>

          <div className="w-full bg-white p-12 print:p-0 font-bn">
             {/* Header */}
             <div className="border-b-4 border-slate-900 pb-4 mb-8 flex items-start justify-between">
                <div className="flex gap-6">
                   <div className="w-20 h-20 shrink-0">
                      <img src="https://i.ibb.co.com/pj8Wd1ff/Aliman-Logo.png" alt="Logo" className="w-full h-full object-contain" />
                   </div>
                   <div>
                      <h1 className="text-[26px] font-black text-slate-900 leading-none mb-1 font-bn">আল-ঈমান আদর্শ মহিলা আলিম মাদ্রাসা</h1>
                      <h2 className="text-[16px] font-bold text-slate-600 mb-2 uppercase font-sans tracking-tight">AL-IMAN IDEAL WOMAN ALIM MADRASAH</h2>
                      <p className="text-[12px] font-bold text-slate-500 font-bn">উত্তর ঝাপুয়া, কালারমারছড়া, মহেশখালী, কক্সবাজার | স্থাপিত: ২০০৫</p>
                   </div>
                </div>
                <div className="text-right">
                   <div className="inline-block bg-slate-900 text-white px-4 py-2 rounded-lg mb-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Student UID</p>
                      <p className="text-xl font-black">{student.Student_UID}</p>
                   </div>
                   <p className="text-[11px] font-bold text-slate-400 font-bn">অফিস কপি</p>
                </div>
             </div>

             <div className="flex gap-8 mb-8">
                <div className="flex-1 space-y-6">
                   {/* Personal Info */}
                   <div className="border border-slate-300 rounded-lg overflow-hidden shadow-sm">
                      <div className="bg-slate-900 text-white px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em]">১. শিক্ষার্থীর ব্যক্তিগত পরিচিতি</div>
                      <DataRow labelBN="নাম (বাংলায়)" value={student.Name_Bangla} isLarge />
                      <DataRow labelBN="নাম (ইংরেজিতে)" value={student.Name_English?.toUpperCase()} />
                      <DataRow labelBN="জন্ম নিবন্ধন নম্বর" value={student.Birth_Reg_No} />
                      <DataRow labelBN="জন্ম তারিখ" value={student.DOB} fieldName="DOB" />
                      <DataRow labelBN="লিঙ্গ" value={student.Gender === 'Male' ? 'পুরুষ' : 'মহিলা'} />
                      <DataRow labelBN="ফরম নম্বর" value={student.Form_No} isLast />
                   </div>

                   {/* Guardian Info */}
                   <div className="border border-slate-300 rounded-lg overflow-hidden shadow-sm">
                      <div className="bg-slate-900 text-white px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em]">২. অভিভাবকের বিস্তারিত তথ্য</div>
                      <DataRow labelBN="পিতার নাম (বাংলা)" value={student.Father_Name_BN} />
                      <DataRow labelBN="পিতার নাম (ইংরেজি)" value={student.Father_Name_EN?.toUpperCase()} />
                      <DataRow labelBN="পিতার এনআইডি" value={student.Father_NID} />
                      <DataRow labelBN="মাতার নাম (বাংলা)" value={student.Mother_Name_BN} />
                      <DataRow labelBN="মাতার নাম (ইংরেজি)" value={student.Mother_Name_EN?.toUpperCase()} />
                      <DataRow labelBN="মাতার এনআইডি" value={student.Mother_NID} isLast />
                   </div>
                </div>

                <div className="w-[200px] shrink-0 space-y-6">
                   <div className="border-2 border-slate-900 p-1 bg-white rounded-lg shadow-md">
                      <img src={student.Photo_URL && student.Photo_URL !== '---' ? student.Photo_URL : `https://ui-avatars.com/api/?background=random&name=${student.Name_English}`} className="w-full aspect-[3/4] object-cover rounded" alt="Student" />
                   </div>
                   <div className="border border-slate-300 rounded-lg overflow-hidden text-center bg-slate-50/50 p-4 shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">বর্তমান শ্রেণী</p>
                      <p className="text-[20px] font-black text-slate-900 font-bn leading-tight mb-4">{latestRecord?.Class_Name || '---'}</p>
                      <div className="grid grid-cols-2 border-t border-slate-200 pt-3">
                         <div className="border-r border-slate-200">
                            <p className="text-[9px] font-bold text-slate-400 uppercase">রোল</p>
                            <p className="text-lg font-black text-slate-900">{latestRecord?.Roll_No || '---'}</p>
                         </div>
                         <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">শাখা</p>
                            <p className="text-lg font-black text-slate-900 uppercase">{latestRecord?.Section || '---'}</p>
                         </div>
                      </div>
                   </div>
                   <div className="text-center p-3 border border-dashed border-slate-300 rounded-lg">
                      <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">অ্যাকাডেমিক সেশন</p>
                      <p className="text-sm font-black text-slate-700">{latestRecord?.Academic_Year || '---'}</p>
                   </div>
                </div>
             </div>

             {/* Address & Contact */}
             <div className="border border-slate-300 rounded-lg overflow-hidden shadow-sm mb-8">
                <div className="bg-slate-900 text-white px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em]">৩. যোগাযোগ ও স্থায়ী ঠিকানা</div>
                <div className="grid grid-cols-2 divide-x divide-slate-300">
                   <div className="divide-y divide-slate-300">
                      <DataRow labelBN="প্রধান মোবাইল" value={student.Mobile_Primary} />
                      <DataRow labelBN="গ্রাম / এলাকা" value={student.Village} />
                      <DataRow labelBN="উপজেলা" value={student.Upazila} isLast />
                   </div>
                   <div className="divide-y divide-slate-300">
                      <DataRow labelBN="বিকল্প মোবাইল" value={student.Mobile_Optional || '---'} />
                      <DataRow labelBN="ইউনিয়ন / ডাকঘর" value={student.Union_Post} />
                      <DataRow labelBN="জেলা" value={student.District} isLast />
                   </div>
                </div>
             </div>

             {/* System Audit */}
             <div className="grid grid-cols-3 gap-6 mb-20">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">প্রোফাইল তৈরির তারিখ</p>
                   <p className="text-xs font-bold text-slate-700">{formatHumanDate(student.Profile_Created_At, 'Profile_Created_At')}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">বর্তমান অবস্থা</p>
                   <p className="text-xs font-bold text-slate-700">{student.Current_Status === 'Active' ? 'সক্রিয় (Active)' : student.Current_Status}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">রেজিস্ট্রেশন নম্বর</p>
                   <p className="text-xs font-bold text-slate-700">{student.Reg_No || 'প্রযোজ্য নয়'}</p>
                </div>
             </div>

             {/* Signatures */}
             <div className="flex justify-between items-end px-6 pt-10 mt-10">
                <div className="text-center w-48 border-t border-slate-900 pt-2">
                   <p className="text-[12px] font-black font-bn">অভিভাবকের স্বাক্ষর</p>
                </div>
                <div className="text-center w-48 border-t border-slate-900 pt-2">
                   <p className="text-[12px] font-black font-bn">ক্লার্ক / অফিস সহকারী</p>
                </div>
                <div className="text-center w-48 border-t-2 border-slate-900 pt-2 bg-slate-50/50">
                   <p className="text-[13px] font-black font-bn">অধ্যক্ষের স্বাক্ষর ও সীল</p>
                </div>
             </div>
             
             <div className="mt-12 text-center border-t border-slate-100 pt-4 opacity-50 no-print">
                <p className="text-[9px] font-bold text-slate-400 uppercase">System Generated Profile • Al-Iman SMS • {new Date().getFullYear()}</p>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // Sweet Dashboard View (Web)
  const SweetItem = ({ label, value, icon: Icon, color = "blue", fieldName }: any) => (
    <div className={`p-4 rounded-[1.5rem] border border-${color}-100 bg-white shadow-sm flex items-center gap-4 group hover:border-${color}-300 hover:shadow-md transition-all`}>
      <div className={`w-10 h-10 rounded-xl bg-${color}-50 flex items-center justify-center text-${color}-600 shrink-0`}>
        {Icon ? <Icon className="w-5 h-5" /> : <div className={`w-1.5 h-1.5 bg-${color}-600 rounded-full`} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[10px] font-black text-${color}-400 uppercase tracking-widest mb-0.5 truncate`}>{label}</p>
        <p className="text-[13px] font-bold text-slate-900 font-bn leading-tight">
          {fieldName ? formatHumanDate(value, fieldName) : (value || '---')}
        </p>
      </div>
    </div>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 mt-8 flex items-center gap-4 px-2">
      {title}
      <span className="flex-1 h-px bg-slate-100"></span>
    </h4>
  );

  if (mode === 'profile_only' || mode === 'admission_only') {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm no-print" onClick={onClose}></div>
        
        <div className="relative bg-slate-50 w-full max-w-5xl max-h-[95vh] overflow-y-auto rounded-[2.5rem] shadow-2xl animate-fade-in no-print">
          <div className="sticky top-0 bg-white/90 backdrop-blur-md px-8 py-4 border-b border-slate-200 flex items-center justify-between z-10">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-600/20"><ICONS.View className="w-6 h-6" /></div>
               <div>
                  <h2 className="font-black text-slate-900 text-lg font-bn leading-tight">{student.Name_Bangla}</h2>
                  <p className="text-[10px] font-black text-slate-400 tracking-tight uppercase">UID: {student.Student_UID}</p>
               </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handlePrint} className="px-6 py-2.5 rounded-2xl bg-slate-900 text-white font-black flex items-center gap-2 hover:bg-black transition-all shadow-xl font-bn">
                <ICONS.Print className="w-4 h-4" /> প্রিন্ট
              </button>
              <button onClick={onClose} className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all">✕</button>
            </div>
          </div>

          <div className="p-8 lg:p-12 space-y-2 pb-24 font-bn">
             {/* Identity Hero */}
             <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm mb-10">
                <div className="w-40 h-40 rounded-[2.5rem] border-4 border-slate-50 shadow-xl overflow-hidden shrink-0">
                   <img src={student.Photo_URL && student.Photo_URL !== '---' ? student.Photo_URL : `https://ui-avatars.com/api/?background=random&name=${student.Name_English}`} className="w-full h-full object-cover" alt="Student" />
                </div>
                <div className="text-center md:text-left flex-1">
                   <h1 className="text-3xl lg:text-4xl font-black text-slate-900 mb-1">{student.Name_Bangla}</h1>
                   <p className="text-lg font-bold text-slate-300 uppercase tracking-tighter mb-4">{student.Name_English}</p>
                   <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      <span className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase">UID: {student.Student_UID}</span>
                      <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase">Class: {latestRecord?.Class_Name || 'N/A'}</span>
                      <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase">Roll: {latestRecord?.Roll_No || 'N/A'}</span>
                   </div>
                </div>
             </div>

             <section>
                <SectionTitle title="ব্যক্তিগত ও পরিচিতি" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   <SweetItem label="লিঙ্গ" value={student.Gender === 'Male' ? 'পুরুষ' : 'মহিলা'} color="blue" />
                   <SweetItem label="জন্ম তারিখ" value={student.DOB} color="blue" fieldName="DOB" />
                   <SweetItem label="জন্ম নিবন্ধন" value={student.Birth_Reg_No} color="blue" />
                   <SweetItem label="ফরম নম্বর" value={student.Form_No} color="indigo" />
                   <SweetItem label="রেজিস্ট্রেশন" value={student.Reg_No} color="indigo" />
                   <SweetItem label="প্রধান মোবাইল" value={student.Mobile_Primary} color="emerald" />
                   <SweetItem label="বিকল্প মোবাইল" value={student.Mobile_Optional} color="emerald" />
                </div>
             </section>

             <section>
                <SectionTitle title="অভিভাবকের তথ্য" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   <SweetItem label="পিতার নাম (বাংলা)" value={student.Father_Name_BN} color="indigo" />
                   <SweetItem label="পিতার নাম (ইংরেজি)" value={student.Father_Name_EN} color="slate" />
                   <SweetItem label="পিতার এনআইডি" value={student.Father_NID} color="slate" />
                   <SweetItem label="মাতার নাম (বাংলা)" value={student.Mother_Name_BN} color="rose" />
                   <SweetItem label="মাতার নাম (ইংরেজি)" value={student.Mother_Name_EN} color="slate" />
                   <SweetItem label="মাতার এনআইডি" value={student.Mother_NID} color="slate" />
                </div>
             </section>

             <section>
                <SectionTitle title="স্থায়ী ঠিকানা" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                   <SweetItem label="গ্রাম" value={student.Village} color="amber" />
                   <SweetItem label="ইউনিয়ন / ডাকঘর" value={student.Union_Post} color="amber" />
                   <SweetItem label="উপজেলা" value={student.Upazila} color="amber" />
                   <SweetItem label="জেলা" value={student.District} color="amber" />
                </div>
             </section>

             <section>
                <SectionTitle title="সিস্টেম অডিট" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   <SweetItem label="প্রোফাইল তৈরি" value={student.Profile_Created_At} color="slate" fieldName="Profile_Created_At" />
                   <SweetItem label="বর্তমান অবস্থা" value={student.Current_Status === 'Active' ? 'সক্রিয়' : student.Current_Status} color="slate" />
                   <SweetItem label="সর্বশেষ ভর্তি" value={latestRecord?.Entry_Date} color="slate" fieldName="Entry_Date" />
                </div>
             </section>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default StudentDetailModal;
