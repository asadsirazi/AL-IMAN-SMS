
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AdmissionForm from './components/AdmissionForm';
import StudentList from './components/StudentList';
import AcademicAdmissionForm from './components/AcademicAdmissionForm';
import AdmittedList from './components/AdmittedList';
import FinalList from './components/FinalList';
import CustomReport from './components/CustomReport';
import StudentDetailModal from './components/StudentDetailModal';
import Migration from './components/Migration';
import Login from './components/Login';
import { ViewTab, StudentData, SettingsData, AcademicRecord, ModalMode } from './types';
import { gasService } from './services/gasService';

const CURRENT_YEAR = new Date().getFullYear().toString();

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard');
  const [students, setStudents] = useState<StudentData[]>([]);
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const [viewingStudent, setViewingStudent] = useState<StudentData | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>('full');
  const [editingStudent, setEditingStudent] = useState<StudentData | null>(null);
  const [editingHistory, setEditingHistory] = useState<AcademicRecord | null>(null);

  // Check for session on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('user_session');
    if (savedSession) {
      setUser(JSON.parse(savedSession));
    }
  }, []);

  const fetchInitialData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [studentsData, settingsData] = await Promise.all([
        gasService.readProfiles(),
        gasService.fetchSettings()
      ]);
      setStudents(studentsData || []);
      setSettings(settingsData);
    } catch (e) {
      console.error("Initial load failed", e);
      setToast({ message: "সার্ভার থেকে ডাটা লোড করা যায়নি", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (user) fetchInitialData(); 
  }, [user]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleLoginSuccess = (userData: any) => {
    localStorage.setItem('user_session', JSON.stringify(userData));
    setUser(userData);
    setToast({ message: `${userData.Name} হিসেবে লগইন সফল হয়েছে!`, type: 'success' });
  };

  const handleLogout = () => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে লগ-আউট করতে চান?")) return;
    localStorage.removeItem('user_session');
    setUser(null);
    setStudents([]);
    setActiveTab('dashboard');
  };

  const handleProfileSubmit = async (data: StudentData) => {
    setLoading(true);
    let success = false;
    
    if (editingStudent) {
      success = await gasService.updateProfile(data);
    } else {
      success = await gasService.createProfile(data);
    }

    if (success) {
      setToast({ 
        message: editingStudent ? "প্রোফাইল আপডেট সফল হয়েছে!" : `প্রোফাইল তৈরি হয়েছে! UID: ${data.Student_UID}`, 
        type: 'success' 
      });
      await fetchInitialData();
      setEditingStudent(null);
      setActiveTab('profile_list');
    } else {
      setToast({ message: "অপারেশন সফল হয়নি। আবার চেষ্টা করুন।", type: 'error' });
    }
    setLoading(false);
  };

  const handleEnrollment = async (record: AcademicRecord) => {
    setLoading(true);
    let success = false;
    
    if (editingHistory) {
      success = await gasService.updateHistory(record);
    } else {
      success = await gasService.enrollStudent(record);
    }

    if (success) {
      setToast({ message: editingHistory ? "একাডেমিক তথ্য আপডেট হয়েছে!" : "শিক্ষার্থীর ভর্তি সফলভাবে সম্পন্ন হয়েছে!", type: 'success' });
      await fetchInitialData();
      setEditingHistory(null);
      setActiveTab('admission_list');
    } else {
      setToast({ message: "প্রক্রিয়াটি ব্যর্থ হয়েছে", type: 'error' });
    }
    setLoading(false);
  };

  const handleDelete = async (uid: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই শিক্ষার্থীকে মুছে ফেলতে চান? এটি স্থায়ীভাবে ডাটা ডিলিট করবে।")) return;
    setLoading(true);
    const success = await gasService.deleteFull(uid);
    if (success) {
      setToast({ message: "রেকর্ড সফলভাবে মুছে ফেলা হয়েছে", type: 'success' });
      await fetchInitialData();
    } else {
      setToast({ message: "মুছে ফেলতে ব্যর্থ হয়েছে", type: 'error' });
    }
    setLoading(false);
  };

  const handleEditProfile = (student: StudentData) => {
    setEditingStudent(student);
    setActiveTab('profile_entry');
  };

  const handleEditHistory = (student: StudentData) => {
    const record: AcademicRecord = {
      Record_ID: String(student.Record_ID || ''),
      Student_UID: student.Student_UID,
      Academic_Year: student.Academic_Year || CURRENT_YEAR,
      Class_Name: student.Class_Name || '',
      Section: student.Section || '',
      Roll_No: student.Roll_No || '',
      Entry_Date: student.Entry_Date || ''
    };
    setEditingHistory(record);
    setActiveTab('admission_entry');
  };

  const openModal = (student: StudentData, mode: ModalMode) => {
    setViewingStudent(student);
    setModalMode(mode);
  };

  // Guard: If not logged in, show Login Screen
  if (!user) {
    return (
      <>
        <Login onLoginSuccess={handleLoginSuccess} />
        {toast && (
          <div className={`fixed bottom-8 right-8 z-[250] px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-fade-in ${
            toast.type === 'success' ? 'bg-white border-emerald-100 text-emerald-700' : 'bg-white border-rose-100 text-rose-700'
          }`}>
            <div className={`w-3 h-3 rounded-full ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
            <p className="font-bold font-bn text-sm">{toast.message}</p>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-bn">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          if (tab !== 'profile_entry') setEditingStudent(null);
          if (tab !== 'admission_entry') setEditingHistory(null);
          setActiveTab(tab);
        }} 
        onLogout={handleLogout}
        user={user}
      />
      
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-28 lg:pt-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 no-print">
          <div>
            <h1 className="text-xs font-black text-blue-600 uppercase tracking-[0.3em] mb-1">সিস্টেম ম্যানেজমেন্ট</h1>
            <h2 className="text-2xl lg:text-3xl font-black text-slate-900 capitalize font-bn">
              {activeTab === 'dashboard' && 'ড্যাশবোর্ড'}
              {activeTab === 'profile_entry' && (editingStudent ? 'তথ্য আপডেট ফরম' : 'তথ্য এন্ট্রি ফরম')}
              {activeTab === 'profile_list' && 'শিক্ষার্থী তালিকা'}
              {activeTab === 'admission_entry' && (editingHistory ? 'একাডেমিক তথ্য আপডেট' : `শিক্ষার্থী ভর্তি (${CURRENT_YEAR})`)}
              {activeTab === 'admission_list' && `ভর্তিকৃত তালিকা (${CURRENT_YEAR})`}
              {activeTab === 'final_list' && 'ফাইনাল রিপোর্ট'}
              {activeTab === 'custom_report' && 'কাস্টম এক্সেল রিপোর্ট'}
              {activeTab === 'migration' && 'শ্রেণী পরিবর্তন'}
            </h2>
          </div>
        </header>

        <div className="relative z-0">
          {activeTab === 'dashboard' && <Dashboard students={students} />}
          
          {activeTab === 'profile_entry' && (
            <AdmissionForm 
              onSubmit={handleProfileSubmit} 
              loading={loading} 
              existingStudents={students} 
              settings={settings} 
              editData={editingStudent}
              onCancel={() => {
                setEditingStudent(null);
                setActiveTab('profile_list');
              }}
            />
          )}

          {activeTab === 'profile_list' && (
            <StudentList 
              students={students} 
              settings={settings} 
              onDelete={handleDelete} 
              onEdit={handleEditProfile} 
              onView={(s) => openModal(s, 'profile_only')} 
              onRefresh={fetchInitialData} 
            />
          )}

          {activeTab === 'admission_entry' && (
            <AcademicAdmissionForm 
              settings={settings} 
              onSubmit={handleEnrollment} 
              loading={loading}
              allProfiles={students}
              editRecord={editingHistory}
              onCancel={() => {
                setEditingHistory(null);
                setActiveTab('admission_list');
              }}
            />
          )}

          {activeTab === 'admission_list' && (
            <AdmittedList 
              students={students} 
              settings={settings} 
              onDelete={handleDelete} 
              onEdit={handleEditHistory} 
              onView={(s) => openModal(s, 'admission_only')} 
            />
          )}

          {activeTab === 'final_list' && (
            <FinalList 
              students={students} 
              settings={settings} 
              onView={(s) => openModal(s, 'full')} 
            />
          )}

          {activeTab === 'custom_report' && (
            <CustomReport 
              students={students} 
              settings={settings} 
            />
          )}

          {activeTab === 'migration' && (
             <Migration 
               students={students} 
               settings={settings} 
               loading={loading} 
               onMigrate={async (payload: any[]) => {
                 setLoading(true);
                 const success = await gasService.bulkEnroll(payload);
                 if (success) {
                   await fetchInitialData();
                   setToast({message: "বাল্ক মাইগ্রেশন সফল হয়েছে!", type: 'success'});
                   setActiveTab('admission_list');
                 } else {
                   setToast({message: "মাইগ্রেশন ব্যর্থ হয়েছে।", type: 'error'});
                 }
                 setLoading(false);
               }} 
             />
          )}
        </div>
      </main>

      {viewingStudent && (
        <StudentDetailModal 
          student={viewingStudent} 
          mode={modalMode} 
          onClose={() => setViewingStudent(null)} 
        />
      )}

      {loading && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl flex flex-col items-center gap-4 animate-fade-in">
            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="font-bold text-slate-800 font-bn">সার্ভার প্রসেসিং...</p>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-8 right-8 z-[250] px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-fade-in ${
          toast.type === 'success' ? 'bg-white border-emerald-100 text-emerald-700' : 'bg-white border-rose-100 text-rose-700'
        }`}>
          <div className={`w-3 h-3 rounded-full ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
          <p className="font-bold font-bn text-sm">{toast.message}</p>
        </div>
      )}
    </div>
  );
};

export default App;
