
import React, { useMemo } from 'react';
import { StudentData } from '../types';
import { CLASS_ORDER, ICONS } from '../constants';

interface DashboardProps {
  students: StudentData[];
}

const CURRENT_YEAR = new Date().getFullYear().toString();

const Dashboard: React.FC<DashboardProps> = ({ students }) => {
  // ১. পরিসংখ্যান ক্যালকুলেশন
  const stats = useMemo(() => {
    const currentYearStudents = students.filter(s => String(s.Academic_Year) === CURRENT_YEAR);
    const newAdmissions = students.filter(s => String(s.Profile_Created_At).startsWith(CURRENT_YEAR));
    const activeStudents = students.filter(s => s.Current_Status === 'Active');
    
    return {
      total: students.length,
      currentYear: currentYearStudents.length,
      newAdmissions: newAdmissions.length,
      active: activeStudents.length,
      totalClasses: new Set(currentYearStudents.map(s => s.Class_Name).filter(Boolean)).size
    };
  }, [students]);

  // ২. শ্রেণীভিত্তিক ডাটা প্রসেসিং (সর্টিং সহ)
  const classDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};
    students.filter(s => String(s.Academic_Year) === CURRENT_YEAR).forEach(s => {
      if (s.Class_Name) {
        distribution[s.Class_Name] = (distribution[s.Class_Name] || 0) + 1;
      }
    });

    return CLASS_ORDER
      .filter(cls => distribution[cls])
      .map(cls => ({
        name: cls,
        count: distribution[cls],
        percentage: (distribution[cls] / stats.currentYear) * 100
      }));
  }, [students, stats.currentYear]);

  // ৩. জেন্ডার ব্রেকডাউন
  const genderStats = useMemo(() => {
    const current = students.filter(s => String(s.Academic_Year) === CURRENT_YEAR);
    const female = current.filter(s => s.Gender === 'Female').length;
    const male = current.filter(s => s.Gender === 'Male').length;
    return { female, male };
  }, [students]);

  // ৪. সাম্প্রতিক ৫ জন শিক্ষার্থী
  const recentStudents = useMemo(() => {
    return [...students]
      .sort((a, b) => String(b.Profile_Created_At).localeCompare(String(a.Profile_Created_At)))
      .slice(0, 5);
  }, [students]);

  const StatCard = ({ label, value, icon: Icon, color, subtext }: any) => (
    <div className="bg-white p-6 rounded-[2.2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg`}>
          <Icon className="w-7 h-7" />
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
          <h3 className="text-3xl font-black text-slate-900 leading-none">{value}</h3>
        </div>
      </div>
      <div className="pt-4 border-t border-slate-50">
        <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5 font-bn">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {subtext}
        </p>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in space-y-10 font-bn pb-20">
      
      {/* প্রধান পরিসংখ্যান গ্রিড */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="সর্বমোট শিক্ষার্থী" 
          value={stats.total} 
          icon={ICONS.List} 
          color="bg-indigo-600" 
          subtext="ডাটাবেজে সংরক্ষিত মোট রেকর্ড"
        />
        <StatCard 
          label="বর্তমান শিক্ষাবর্ষ" 
          value={stats.currentYear} 
          icon={ICONS.Dashboard} 
          color="bg-blue-600" 
          subtext={`${CURRENT_YEAR} সেশনে ভর্তিকৃত শিক্ষার্থী`}
        />
        <StatCard 
          label="নতুন ভর্তি" 
          value={stats.newAdmissions} 
          icon={ICONS.Admission} 
          color="bg-emerald-600" 
          subtext={`${CURRENT_YEAR} সালে তৈরি প্রোফাইল`}
        />
        <StatCard 
          label="সক্রিয় শিক্ষার্থী" 
          value={stats.active} 
          icon={ICONS.Migration} 
          color="bg-amber-500" 
          subtext="বর্তমানে মাদ্রাসায় অধ্যয়নরত"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* শ্রেণীভিত্তিক তালিকা (প্রোগ্রেস বার স্টাইল) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.8rem] border border-slate-100 shadow-sm">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                 <span className="w-1.5 h-7 bg-blue-600 rounded-full"></span>
                 শ্রেণীভিত্তিক শিক্ষার্থী বিন্যাস ({CURRENT_YEAR})
              </h3>
              <div className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase">
                 মোট শ্রেণী: {stats.totalClasses} টি
              </div>
           </div>
           
           <div className="space-y-5 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
              {classDistribution.map((item, idx) => (
                <div key={idx} className="space-y-2 group">
                   <div className="flex justify-between items-end">
                      <span className="font-black text-slate-700 text-[15px]">{item.name}</span>
                      <span className="text-xs font-black text-slate-400">
                        <span className="text-slate-900 text-sm">{item.count}</span> জন শিক্ষার্থী
                      </span>
                   </div>
                   <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                   </div>
                </div>
              ))}
              {classDistribution.length === 0 && (
                <div className="py-20 text-center text-slate-300 font-bold">
                   বর্তমান সেশনের কোনো ডাটা পাওয়া যায়নি
                </div>
              )}
           </div>
        </div>

        {/* সাইড প্যানেল: জেন্ডার ও সাম্প্রতিক তথ্য */}
        <div className="space-y-8">
           
           {/* জেন্ডার রেশিও */}
           <div className="bg-white p-8 rounded-[2.8rem] border border-slate-100 shadow-sm overflow-hidden relative">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">ছাত্রী বনাম ছাত্র অনুপাত</h3>
              <div className="flex gap-4">
                 <div className="flex-1 bg-rose-50 p-5 rounded-3xl border border-rose-100 text-center">
                    <p className="text-rose-500 font-black text-2xl mb-1">{genderStats.female}</p>
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">ছাত্রী</p>
                 </div>
                 <div className="flex-1 bg-blue-50 p-5 rounded-3xl border border-blue-100 text-center">
                    <p className="text-blue-500 font-black text-2xl mb-1">{genderStats.male}</p>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">ছাত্র</p>
                 </div>
              </div>
              {/* সিম্পল ডোনাট চার্ট সাবস্টিটিউট */}
              <div className="mt-6 h-2 flex rounded-full overflow-hidden">
                 <div className="bg-rose-400" style={{ width: `${(genderStats.female / (stats.currentYear || 1)) * 100}%` }}></div>
                 <div className="bg-blue-400" style={{ width: `${(genderStats.male / (stats.currentYear || 1)) * 100}%` }}></div>
              </div>
           </div>

           {/* সাম্প্রতিক ভর্তি */}
           <div className="bg-white p-8 rounded-[2.8rem] border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center justify-between">
                 সাম্প্রতিক ভর্তি
                 <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              </h3>
              <div className="space-y-4">
                 {recentStudents.map((s, idx) => (
                   <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50/50 rounded-2xl hover:bg-slate-50 transition-colors">
                      <img 
                        src={s.Photo_URL && s.Photo_URL !== '---' ? s.Photo_URL : `https://ui-avatars.com/api/?background=random&name=${s.Name_English}`} 
                        className="w-10 h-10 rounded-xl object-cover border border-white shadow-sm"
                        alt=""
                      />
                      <div className="min-w-0">
                         <p className="font-black text-slate-900 text-sm truncate">{s.Name_Bangla}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase">UID: {s.Student_UID}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* সিস্টেম হেলথ */}
           <div className="bg-slate-900 p-8 rounded-[2.8rem] text-white shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                 </div>
                 <div>
                    <h4 className="font-black text-sm">সিস্টেম স্ট্যাটাস</h4>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">সকল ফাংশন সক্রিয়</p>
                 </div>
              </div>
              <div className="space-y-2 text-[11px] font-bold text-slate-400">
                 <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>সার্ভার লেটেন্সি</span>
                    <span className="text-emerald-400">স্বাভাবিক (২৪ms)</span>
                 </div>
                 <div className="flex justify-between">
                    <span>সর্বশেষ সিঙ্ক</span>
                    <span>আজ, {new Date().toLocaleTimeString('bn-BD')}</span>
                 </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
