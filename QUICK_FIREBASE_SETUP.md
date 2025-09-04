# دليل الإعداد السريع لـ Firebase 🔥

## المشكلة الحالية
التطبيق يعمل لكن Firebase Authentication غير مُعد، لذلك تسجيل الحسابات لا يعمل حالياً.

## الحل السريع (5 دقائق) 

### 1. إنشاء مشروع Firebase
1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. انقر على "إنشاء مشروع" أو "Add project"
3. اكتب اسم المشروع (مثل: `identity-maker`)
4. اختر إعدادات Google Analytics (يمكن تخطيها)
5. انقر على "إنشاء المشروع"

### 2. تفعيل Authentication
1. من القائمة الجانبية، انقر على "Authentication"
2. انقر على "البدء" أو "Get started"
3. اذهب إلى تبويب "Sign-in method"
4. فعّل "Email/Password":
   - انقر على "Email/Password"
   - فعّل "Enable"
   - احفظ
5. فعّل "Google" (اختياري):
   - انقر على "Google"
   - فعّل "Enable"
   - اختر email المشروع
   - احفظ

### 3. إنشاء Firestore Database
1. من القائمة الجانبية، انقر على "Firestore Database"
2. انقر على "إنشاء قاعدة بيانات" أو "Create database"
3. اختر "البدء في وضع الاختبار" أو "Start in test mode"
4. اختر الموقع الأقرب لك
5. انقر على "تم" أو "Done"

### 4. الحصول على معلومات التكوين
1. انقر على أيقونة الترس ⚙️ (إعدادات المشروع)
2. في تبويب "عام" أو "General"
3. انزل إلى قسم "التطبيقات" أو "Your apps"
4. انقر على أيقونة الويب `</>` (Web)
5. اكتب اسم التطبيق (مثل: `identity-maker-web`)
6. **لا تحتاج لتفعيل Firebase Hosting**
7. انقر على "تسجيل التطبيق"
8. **انسخ معلومات التكوين** (سنحتاجها في الخطوة التالية)

### 5. تحديث ملف التكوين
1. افتح الملف: `src/lib/firebase.ts`
2. استبدل هذا الجزء:
```typescript
const firebaseConfig = {
  apiKey: "AIzaSyCOdfpweJteu4fnmYgD7rH2TV1KYCB20CI",
  authDomain: "identitymakernextjs.firebaseapp.com",
  projectId: "identitymakernextjs",
  storageBucket: "identitymakernextjs.firebasestorage.app",
  messagingSenderId: "346068275288",
  appId: "1:346068275288:web:fd035b298adf8b24a4ba2d",
  measurementId: "G-MEX0RR3FK9"
};
```

3. بالمعلومات التي نسختها من Firebase Console

### 6. إضافة النطاق المُصرح
1. في Firebase Console، اذهب إلى Authentication
2. انقر على تبويب "Settings"
3. في قسم "Authorized domains"
4. انقر على "Add domain"
5. أضف: `localhost`
6. احفظ

## اختبار النظام

1. أعد تشغيل التطبيق:
```bash
npm run dev
```

2. اذهب إلى: `http://localhost:3001/auth`

3. جرب إنشاء حساب جديد

4. إذا نجح التسجيل، تهانينا! 🎉

## في حالة وجود مشاكل

### المشكلة: "auth/invalid-api-key"
- تأكد من نسخ `apiKey` بشكل صحيح
- تأكد من عدم وجود مسافات إضافية

### المشكلة: "auth/app-not-authorized"
- تأكد من إضافة `localhost` إلى Authorized domains

### المشكلة: "auth/operation-not-allowed"
- تأكد من تفعيل Email/Password في Authentication

### للحصول على مساعدة إضافية:
- انقر على "فحص حالة Firebase" في صفحة تسجيل الدخول
- اقرأ الرسائل في Developer Console (F12)

---

**بعد الإعداد الناجح، ستتمكن من:**
- ✅ إنشاء حسابات جديدة
- ✅ تسجيل الدخول والخروج
- ✅ حفظ التصاميم في السحابة
- ✅ الوصول للتصاميم من أي جهاز

**الإعداد يستغرق 5 دقائق فقط! 🚀**
