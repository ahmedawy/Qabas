import React, { useState } from 'react';
import { api } from '../../api/client';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { id: number; name: string; email: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (activeTab === 'register' && password !== passwordConfirmation) {
      setError('كلمتا المرور غير متطابقتين');
      setLoading(false);
      return;
    }

    try {
      if (activeTab === 'login') {
        const res = await api.login(email, password);
        if (res.success) {
          localStorage.setItem('auth_token', res.token);
          onSuccess(res.user);
          onClose();
        }
      } else {
        const res = await api.register(name, email, password, passwordConfirmation);
        if (res.success) {
          localStorage.setItem('auth_token', res.token);
          onSuccess(res.user);
          onClose();
        }
      }
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء معالجة الطلب، يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-element-3">
      <div className="bg-slate-900 border border-slate-800 shadow-2xl rounded-3xl w-full max-w-md p-6 text-right font-sans animate-in zoom-in-95 duration-200 flex flex-col relative text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute left-6 top-6 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Title */}
        <h2 className="auth-modal-title-6">
          بوابة العضوية والمزامنة
        </h2>

        {/* Tabs */}
        <div className="auth-modal-element-7">
          <button
            onClick={() => { setActiveTab('login'); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            onClick={() => { setActiveTab('register'); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            إنشاء حساب جديد
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="auth-modal-title-8">
            ⚠️ {error}
          </div>
        )}

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">الاسم الكريم</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أدخل اسمك هنا"
                className="w-full text-right py-2.5 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm focus:outline-none focus:border-emerald-500 transition-colors placeholder-slate-600"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">البريد الإلكتروني</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full text-left py-2.5 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm focus:outline-none focus:border-emerald-500 transition-colors placeholder-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">كلمة المرور</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-left py-2.5 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm focus:outline-none focus:border-emerald-500 transition-colors placeholder-slate-600"
            />
          </div>

          {activeTab === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">تأكيد كلمة المرور</label>
              <input
                type="password"
                required
                minLength={8}
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="••••••••"
                className="w-full text-left py-2.5 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm focus:outline-none focus:border-emerald-500 transition-colors placeholder-slate-600"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md mt-6 cursor-pointer"
          >
            {loading ? (
              <span className="auth-modal-element-11">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                جاري معالجة الطلب...
              </span>
            ) : activeTab === 'login' ? (
              'تسجيل الدخول'
            ) : (
              'إنشاء الحساب'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
