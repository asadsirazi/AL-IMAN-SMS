
import React, { useState } from 'react';
import { gasService } from '../services/gasService';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await gasService.loginUser(email, password);
      if (response.status === 'success') {
        onLoginSuccess(response.user);
      } else {
        triggerError(response.message || 'Invalid credentials');
      }
    } catch (err) {
      triggerError('প্রবেশ করতে সমস্যা হচ্ছে। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const triggerError = (msg: string) => {
    setError(msg);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-6 font-bn overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-3xl opacity-50"></div>

      <div className={`w-full max-w-[440px] bg-white rounded-[2.5rem] shadow-2xl shadow-emerald-900/10 border border-emerald-50 overflow-hidden relative z-10 animate-fade-in ${isShaking ? 'animate-shake' : ''}`}>
        {/* Top Decorative Border */}
        <div className="h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>

        <div className="p-10 lg:p-12">
          <div className="text-center mb-10">
            <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-emerald-100 p-4">
              <img src="https://i.ibb.co.com/pj8Wd1ff/Aliman-Logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-xl lg:text-2xl font-black text-slate-900 mb-1 font-bn leading-tight">আল-ঈমান আদর্শ মহিলা আলিম মাদ্রাসা</h1>
            <p className="text-emerald-600 font-black text-sm uppercase tracking-widest font-bn">স্টুডেন্ট ম্যানেজমেন্ট সিস্টেম</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">ইমেইল ঠিকানা</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@example.com"
                  className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-emerald-500 focus:bg-white outline-none font-bold text-slate-800 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">পাসওয়ার্ড</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-emerald-500 focus:bg-white outline-none font-bold text-slate-800 transition-all shadow-sm"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 animate-fade-in">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-xl shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:scale-100"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>প্রসেসিং...</span>
                </>
              ) : (
                <span>লগইন করুন</span>
              )}
            </button>
          </form>
        </div>

        <div className="bg-slate-50 p-8 text-center border-t border-slate-100">
          <div className="flex flex-col items-center">
            <span className="block text-[13px] font-bold text-slate-500 font-bn">
              প্রযুক্তিগত সহায়তায় : ❤️
              <a 
                href="https://facebook.com/asadsirazi" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-emerald-600 transition-colors cursor-pointer ml-1 underline decoration-dotted" 
                title="Facebook প্রোফাইল দেখুন"
              >
                আছআদ হোছাইন সিরাজী
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
