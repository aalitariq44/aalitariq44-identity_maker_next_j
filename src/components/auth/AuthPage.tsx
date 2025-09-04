'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signUp, signInWithGoogle, resetPassword } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';
import FirebaseStatus from '@/components/debug/FirebaseStatus';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showFirebaseStatus, setShowFirebaseStatus] = useState(false);
  
  const router = useRouter();
  const { user } = useAuth();

  // إذا كان المستخدم مسجل دخول، إعادة توجيه للصفحة الرئيسية
  React.useEffect(() => {
    if (user) {
      router.push('/editor');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // التحقق من صحة البيانات قبل الإرسال
      if (!email.trim()) {
        setError('يرجى إدخال البريد الإلكتروني');
        setLoading(false);
        return;
      }

      if (!password.trim()) {
        setError('يرجى إدخال كلمة المرور');
        setLoading(false);
        return;
      }

      if (!isLogin && !displayName.trim()) {
        setError('يرجى إدخال الاسم الكامل');
        setLoading(false);
        return;
      }

      console.log('Form submission attempt:', { isLogin, email });

      let result;
      
      if (isLogin) {
        result = await signIn(email.trim(), password);
        console.log('Sign in result:', result);
      } else {
        if (password.length < 6) {
          setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
          setLoading(false);
          return;
        }
        result = await signUp(email.trim(), password, displayName.trim());
        console.log('Sign up result:', result);
      }

      if (result.error) {
        console.error('Authentication error:', result.error);
        setError(result.error);
      } else if (result.user) {
        console.log('Authentication successful, redirecting...');
        router.push('/editor');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
    }

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('Attempting Google sign in...');
      const result = await signInWithGoogle();
      console.log('Google sign in result:', result);
      
      if (result.error) {
        console.error('Google sign in error:', result.error);
        setError(result.error);
      } else if (result.user) {
        console.log('Google sign in successful, redirecting...');
        router.push('/editor');
      }
    } catch (err) {
      console.error('Unexpected Google sign in error:', err);
      setError('حدث خطأ في تسجيل الدخول بـ Google. يرجى المحاولة مرة أخرى.');
    }

    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('يرجى إدخال البريد الإلكتروني');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await resetPassword(email);
      if (result.error) {
        setError(getArabicErrorMessage(result.error));
      } else {
        setError(''); // Clear error
        alert('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
        setShowResetPassword(false);
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع');
    }

    setLoading(false);
  };

  const getArabicErrorMessage = (error: string) => {
    const errorMessages: Record<string, string> = {
      'auth/user-not-found': 'المستخدم غير موجود',
      'auth/wrong-password': 'كلمة المرور غير صحيحة',
      'auth/email-already-in-use': 'هذا البريد الإلكتروني مستخدم بالفعل',
      'auth/weak-password': 'كلمة المرور ضعيفة جداً',
      'auth/invalid-email': 'البريد الإلكتروني غير صالح',
      'auth/too-many-requests': 'تم إجراء عدد كبير من المحاولات، يرجى المحاولة لاحقاً',
      'auth/network-request-failed': 'خطأ في الاتصال بالإنترنت',
    };

    for (const [key, value] of Object.entries(errorMessages)) {
      if (error.includes(key)) {
        return value;
      }
    }

    return 'حدث خطأ غير متوقع';
  };

  if (showResetPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                إعادة تعيين كلمة المرور
              </h2>
              <p className="text-gray-600">
                أدخل بريدك الإلكتروني لإرسال رابط إعادة تعيين كلمة المرور
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أدخل بريدك الإلكتروني"
                  dir="ltr"
                />
              </div>

              <div className="flex flex-col space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowResetPassword(false)}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-200"
                >
                  العودة لتسجيل الدخول
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
            </h2>
            <p className="text-gray-600">
              {isLogin 
                ? 'أدخل بياناتك للوصول إلى تصاميمك' 
                : 'أنشئ حساباً جديداً لحفظ تصاميمك'
              }
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {!isLogin && (
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم الكامل
                </label>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  required={!isLogin}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أدخل اسمك الكامل"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أدخل بريدك الإلكتروني"
                dir="ltr"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أدخل كلمة المرور"
                dir="ltr"
              />
            </div>

            <div className="flex flex-col space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading 
                  ? 'جاري المعالجة...' 
                  : (isLogin ? 'تسجيل الدخول' : 'إنشاء الحساب')
                }
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">أو</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <span>متابعة مع جوجل</span>
              </button>
            </div>

            {isLogin && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowResetPassword(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
            )}

            <div className="text-center">
              <span className="text-gray-600">
                {isLogin ? 'ليس لديك حساب؟ ' : 'لديك حساب بالفعل؟ '}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setDisplayName('');
                  setEmail('');
                  setPassword('');
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {isLogin ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
              </button>
            </div>
          </form>

          {/* زر فحص Firebase - للتطوير فقط */}
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowFirebaseStatus(true)}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              فحص حالة Firebase
            </button>
          </div>
        </div>

        {/* مودال حالة Firebase */}
        {showFirebaseStatus && (
          <FirebaseStatus onClose={() => setShowFirebaseStatus(false)} />
        )}
      </div>
    </div>
  );
};

export default AuthPage;
