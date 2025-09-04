import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from './firebase';

// إنشاء حساب جديد
export const signUp = async (email: string, password: string, displayName: string) => {
  try {
    console.log('Attempting to create user with email:', email);
    
    // التحقق من صحة البيانات
    if (!email || !password || !displayName) {
      throw new Error('جميع الحقول مطلوبة');
    }
    
    if (password.length < 6) {
      throw new Error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    }
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('User created successfully:', userCredential.user.uid);
    
    // تحديث اسم المستخدم
    if (userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
      console.log('Profile updated with display name:', displayName);
    }
    
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    console.error('Sign up error:', error);
    return { user: null, error: getAuthErrorMessage(error.code || error.message) };
  }
};

// معالجة رسائل الخطأ
const getAuthErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'هذا البريد الإلكتروني مستخدم بالفعل',
    'auth/invalid-email': 'البريد الإلكتروني غير صالح',
    'auth/operation-not-allowed': 'تسجيل الحسابات غير مفعل',
    'auth/weak-password': 'كلمة المرور ضعيفة جداً (يجب أن تكون 6 أحرف على الأقل)',
    'auth/user-disabled': 'هذا الحساب معطل',
    'auth/user-not-found': 'المستخدم غير موجود',
    'auth/wrong-password': 'كلمة المرور غير صحيحة',
    'auth/too-many-requests': 'تم إجراء عدد كبير من المحاولات، يرجى المحاولة لاحقاً',
    'auth/network-request-failed': 'خطأ في الاتصال بالإنترنت',
    'auth/internal-error': 'خطأ داخلي في الخادم',
    'auth/invalid-api-key': 'مفتاح API غير صالح',
    'auth/app-not-authorized': 'التطبيق غير مصرح له باستخدام Firebase Authentication',
  };

  return errorMessages[errorCode] || `خطأ: ${errorCode}`;
};

// تسجيل الدخول
export const signIn = async (email: string, password: string) => {
  try {
    console.log('Attempting to sign in user with email:', email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('User signed in successfully:', userCredential.user.uid);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    console.error('Sign in error:', error);
    return { user: null, error: getAuthErrorMessage(error.code || error.message) };
  }
};

// تسجيل الدخول بجوجل
export const signInWithGoogle = async () => {
  try {
    console.log('Attempting to sign in with Google');
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    
    const userCredential = await signInWithPopup(auth, provider);
    console.log('Google sign in successful:', userCredential.user.uid);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    console.error('Google sign in error:', error);
    return { user: null, error: getAuthErrorMessage(error.code || error.message) };
  }
};

// تسجيل الخروج
export const logOut = async () => {
  try {
    await signOut(auth);
    console.log('User signed out successfully');
    return { error: null };
  } catch (error: any) {
    console.error('Sign out error:', error);
    return { error: getAuthErrorMessage(error.code || error.message) };
  }
};

// إعادة تعيين كلمة المرور
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log('Password reset email sent to:', email);
    return { error: null };
  } catch (error: any) {
    console.error('Password reset error:', error);
    return { error: getAuthErrorMessage(error.code || error.message) };
  }
};

// مراقب حالة المصادقة
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// الحصول على المستخدم الحالي
export const getCurrentUser = () => {
  return auth.currentUser;
};
