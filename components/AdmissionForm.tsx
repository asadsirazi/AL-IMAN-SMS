
import React, { useState, useEffect } from 'react';
import { StudentData, SettingsData } from '../types';

const FormSection = ({ title, children }: { title: string; children?: React.ReactNode }) => (
  <div className="bg-white p-6 lg:p-8 rounded-[2rem] border border-slate-100 shadow-sm mb-8 animate-fade-in font-bn">
    <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-6 border-b border-slate-50 pb-3 flex items-center gap-2">
      <span className="w-2 h-2 bg-blue-600 rounded-full"></span> {title}
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {children}
    </div>
  </div>
);

const FormInput = ({ label, name, value, onChange, type = 'text', required = false, readonly = false, placeholder = "" }: any) => (
  <div className="space-y-1.5 font-bn">
    <label className="text-xs font-bold text-slate-500 uppercase px-1">{label} {required && <span className="text-red-500">*</span>}</label>
    <input
      type={type}
      name={name}
      value={value || ''}
      onChange={onChange}
      required={required}
      readOnly={readonly}
      placeholder={placeholder}
      className={`w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none transition-all text-slate-800 font-bold ${readonly ? 'opacity-60 bg-slate-100 cursor-not-allowed' : ''}`}
    />
  </div>
);

interface Props {
  onSubmit: (data: StudentData) => void;
  loading: boolean;
  existingStudents: StudentData[];
  settings: SettingsData | null;
  editData?: StudentData | null;
  onCancel?: () => void;
}

const CURRENT_YEAR = new Date().getFullYear().toString();

const AdmissionForm: React.FC<Props> = ({ onSubmit, loading, existingStudents, editData, onCancel }) => {
  const [formData, setFormData] = useState<StudentData>({
    Student_UID: '',
    Form_No: '',
    Reg_No: '',
    Name_Bangla: '',
    Name_English: '',
    Birth_Reg_No: '',
    DOB_Day: '',
    DOB_Month: '',
    DOB_Year: '',
    Gender: 'Female',
    Father_Name_BN: '',
    Father_Name_EN: '',
    Father_NID: '',
    Mother_Name_BN: '',
    Mother_Name_EN: '',
    Mother_NID: '',
    Mobile_Primary: '',
    Mobile_Optional: '',
    Village: 'উত্তর ঝাপুয়া',
    Union_Post: 'কালারমারছড়া',
    Upazila: 'মহেশখালী',
    District: 'কক্সবাজার',
    Photo_URL: 'https://ui-avatars.com/api/?background=random&name=Student',
    Current_Status: 'Active',
    Profile_Created_At: ''
  });

  useEffect(() => {
    if (editData) {
      let d = '', m = '', y = '';
      
      // তারিখ পার্সিং লজিক উন্নত করা হয়েছে
      if (editData.DOB_Day && editData.DOB_Month && editData.DOB_Year) {
        d = String(editData.DOB_Day).padStart(2, '0');
        m = String(editData.DOB_Month).padStart(2, '0');
        y = String(editData.DOB_Year);
      } else if (editData.DOB) {
        const dobStr = String(editData.DOB);
        const parts = dobStr.split(/[-/T. ]/);
        if (parts.length >= 3) {
           if (parts[0].length === 4) { // YYYY-MM-DD
              y = parts[0]; 
              m = parts[1].padStart(2, '0'); 
              d = parts[2].padStart(2, '0');
           } else { // DD-MM-YYYY
              d = parts[0].padStart(2, '0'); 
              m = parts[1].padStart(2, '0'); 
              y = parts[2].substring(0, 4);
           }
        }
      }

      setFormData({ 
        ...editData,
        DOB_Day: d,
        DOB_Month: m,
        DOB_Year: y
      });
    } else {
      const yearStudents = (existingStudents || []).filter(s => s.Student_UID?.startsWith(`${CURRENT_YEAR}-`));
      let nextId = "001";
      if (yearStudents.length > 0) {
        const uids = yearStudents.map(s => {
            const parts = String(s.Student_UID).split('-');
            return parts.length > 1 ? parseInt(parts[1]) : 0;
        }).filter(n => !isNaN(n));
        const maxNum = uids.length > 0 ? Math.max(...uids) : 0;
        nextId = (maxNum + 1).toString().padStart(3, '0');
      }
      setFormData({
        Student_UID: `${CURRENT_YEAR}-${nextId}`,
        Form_No: '',
        Reg_No: '',
        Name_Bangla: '',
        Name_English: '',
        Birth_Reg_No: '',
        DOB_Day: '',
        DOB_Month: '',
        DOB_Year: '',
        Gender: 'Female',
        Father_Name_BN: '',
        Father_Name_EN: '',
        Father_NID: '',
        Mother_Name_BN: '',
        Mother_Name_EN: '',
        Mother_NID: '',
        Mobile_Primary: '',
        Mobile_Optional: '',
        Village: 'উত্তর ঝাপুয়া',
        Union_Post: 'কালারমারছড়া',
        Upazila: 'মহেশখালী',
        District: 'কক্সবাজার',
        Photo_URL: `https://ui-avatars.com/api/?background=random&name=Student`,
        Current_Status: 'Active',
        Profile_Created_At: ''
      });
    }
  }, [existingStudents, editData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatMobile = (mobile: string | number | undefined): string => {
    if (!mobile) return '';
    let m = String(mobile).trim();
    if (!m) return '';
    const digits = m.replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('0')) return '+88' + digits;
    if (digits.length === 13 && digits.startsWith('88')) return '+' + digits;
    return m;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const now = new Date();
    // Profile_Created_At এর জন্য স্ট্যান্ডার্ড ISO ফরম্যাট
    const timestamp = now.toISOString();

    const processedData: StudentData = {
      ...formData,
      Name_English: formData.Name_English?.trim().toUpperCase() || '',
      Father_Name_EN: formData.Father_Name_EN?.trim().toUpperCase() || '',
      Mother_Name_EN: formData.Mother_Name_EN?.trim().toUpperCase() || '',
      Mobile_Primary: formatMobile(formData.Mobile_Primary),
      Mobile_Optional: formatMobile(formData.Mobile_Optional),
      // জন্ম তারিখ স্ট্যান্ডার্ড ফরম্যাটে সেভ করা (YYYY-MM-DD)
      DOB: `${formData.DOB_Year}-${formData.DOB_Month}-${formData.DOB_Day}`,
      // নতুন প্রোফাইল হলে তৈরির সময় সেট করা
      Profile_Created_At: editData ? formData.Profile_Created_At : timestamp
    };

    onSubmit(processedData);
  };

  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
  const months = [
    { label: 'জানুয়ারি (০১)', value: '01' },
    { label: 'ফেব্রুয়ারি (০২)', value: '02' },
    { label: 'মার্চ (০৩)', value: '03' },
    { label: 'এপ্রিল (০৪)', value: '04' },
    { label: 'মে (০৫)', value: '05' },
    { label: 'জুন (০৬)', value: '06' },
    { label: 'জুলাই (০৭)', value: '07' },
    { label: 'আগস্ট (০৮)', value: '08' },
    { label: 'সেপ্টেম্বর (০৯)', value: '09' },
    { label: 'অক্টোবর (১০)', value: '10' },
    { label: 'নভেম্বর (১১)', value: '11' },
    { label: 'ডিসেম্বর (১২)', value: '12' }
  ];

  return (
    <form onSubmit={handleFormSubmit} className="pb-32 animate-fade-in font-bn">
      <FormSection title="১. আইডি ও ভর্তি তথ্য (Admission Info)">
        <FormInput label="শিক্ষার্থী আইডি (UID)" name="Student_UID" value={formData.Student_UID} readonly />
        <FormInput label="ফরম নম্বর (Form No)" name="Form_No" value={formData.Form_No} onChange={handleChange} required placeholder="যেমন: ১০৫" />
        <FormInput label="রেজিস্ট্রেশন নম্বর (Reg No)" name="Reg_No" value={formData.Reg_No} onChange={handleChange} placeholder="যদি থাকে" />
      </FormSection>

      <FormSection title="২. ব্যক্তিগত তথ্য (Student Identity)">
        <FormInput label="পুরো নাম (বাংলা)" name="Name_Bangla" value={formData.Name_Bangla} onChange={handleChange} required />
        <FormInput label="পুরো নাম (ইংরেজি)" name="Name_English" value={formData.Name_English} onChange={handleChange} required />
        <FormInput label="জন্ম নিবন্ধন নম্বর" name="Birth_Reg_No" value={formData.Birth_Reg_No} onChange={handleChange} />
        
        <div className="space-y-1.5 font-bn">
          <label className="text-xs font-bold text-slate-500 uppercase px-1">জন্ম তারিখ (DOB) <span className="text-red-500">*</span></label>
          <div className="flex gap-2">
            <div className="flex-1">
              <select name="DOB_Day" value={formData.DOB_Day} onChange={handleChange} required className="w-full px-3 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold outline-none focus:border-blue-500">
                <option value="">দিন</option>
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="flex-[1.5]">
              <select name="DOB_Month" value={formData.DOB_Month} onChange={handleChange} required className="w-full px-3 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold outline-none focus:border-blue-500">
                <option value="">মাস</option>
                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <input type="number" name="DOB_Year" value={formData.DOB_Year} onChange={handleChange} required placeholder="বছর" min="1990" max="2030" className="w-full px-3 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold outline-none focus:border-blue-500" />
            </div>
          </div>
        </div>

        <div className="space-y-1.5 font-bn">
          <label className="text-xs font-bold text-slate-500 uppercase px-1">লিঙ্গ (Gender)</label>
          <select name="Gender" value={formData.Gender} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold outline-none focus:border-blue-500">
            <option value="Female">Female (মহিলা)</option>
            <option value="Male">Male (পুরুষ)</option>
          </select>
        </div>
      </FormSection>

      <FormSection title="৩. অভিভাবকের তথ্য (Parental Details)">
        <FormInput label="পিতার নাম (বাংলা)" name="Father_Name_BN" value={formData.Father_Name_BN} onChange={handleChange} required />
        <FormInput label="পিতার নাম (ইংরেজি)" name="Father_Name_EN" value={formData.Father_Name_EN} onChange={handleChange} />
        <FormInput label="পিতার এনআইডি" name="Father_NID" value={formData.Father_NID} onChange={handleChange} />
        <FormInput label="মাতার নাম (বাংলা)" name="Mother_Name_BN" value={formData.Mother_Name_BN} onChange={handleChange} required />
        <FormInput label="মাতার নাম (ইংরেজি)" name="Mother_Name_EN" value={formData.Mother_Name_EN} onChange={handleChange} />
        <FormInput label="মাতার এনআইডি" name="Mother_NID" value={formData.Mother_NID} onChange={handleChange} />
      </FormSection>

      <FormSection title="৪. যোগাযোগ ও ঠিকানা (Address & Contact)">
        <FormInput label="প্রধান মোবাইল" name="Mobile_Primary" value={formData.Mobile_Primary} onChange={handleChange} required />
        <FormInput label="বিকল্প মোবাইল" name="Mobile_Optional" value={formData.Mobile_Optional} onChange={handleChange} />
        <FormInput label="গ্রাম" name="Village" value={formData.Village} onChange={handleChange} />
        <FormInput label="ইউনিয়ন/ডাকঘর" name="Union_Post" value={formData.Union_Post} onChange={handleChange} />
        <FormInput label="উপজেলা" name="Upazila" value={formData.Upazila} onChange={handleChange} />
        <FormInput label="জেলা" name="District" value={formData.District} onChange={handleChange} />
      </FormSection>

      <FormSection title="৫. ফটো ও স্ট্যাটাস (System Status)">
        <FormInput label="ছবির ইউআরএল (Photo URL)" name="Photo_URL" value={formData.Photo_URL} onChange={handleChange} />
        <div className="space-y-1.5 font-bn">
          <label className="text-xs font-bold text-slate-500 uppercase px-1">বর্তমান অবস্থা (Status)</label>
          <select name="Current_Status" value={formData.Current_Status} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold outline-none focus:border-blue-500">
            <option value="Active">Active (সক্রিয়)</option>
            <option value="TC">TC (ছাড়পত্র প্রাপ্ত)</option>
            <option value="Graduated">Graduated (উত্তীর্ণ)</option>
          </select>
        </div>
      </FormSection>

      <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white/95 backdrop-blur-md border-t p-6 flex justify-end gap-3 z-40 shadow-2xl no-print">
        {editData && (
          <button type="button" onClick={onCancel} className="px-8 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-500 font-black hover:bg-slate-50 transition-all font-bn">বাতিল</button>
        )}
        <button type="submit" disabled={loading} className={`px-12 py-3.5 rounded-2xl text-white font-black shadow-xl disabled:opacity-50 font-bn ${editData ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
          {loading ? 'প্রসেসিং...' : (editData ? 'তথ্য আপডেট করুন' : 'প্রোফাইল তৈরি করুন')}
        </button>
      </div>
    </form>
  );
};

export default AdmissionForm;
