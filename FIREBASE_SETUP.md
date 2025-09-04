# تطبيق Identity Maker مع Firebase

## نظرة عامة

تم تطوير هذا التطبيق باستخدام Next.js 15 و TypeScript و Firebase لإنشاء أداة تصميم متقدمة لبطاقات الهوية. يتضمن التطبيق نظام مصادقة كامل وإمكانية حفظ التصاميم في السحابة.

## الميزات الجديدة مع Firebase

### 🔐 نظام المصادقة
- تسجيل دخول بالبريد الإلكتروني وكلمة المرور
- تسجيل دخول بحساب Google
- إنشاء حسابات جديدة
- إعادة تعيين كلمة المرور
- إدارة حالة المصادقة في الوقت الفعلي

### 💾 حفظ التصاميم
- حفظ التصاميم في Firestore
- ربط التصاميم بحساب المستخدم
- معاينات مصغرة للتصاميم
- إضافة أوصاف وتاجز للتصاميم
- التحكم في خصوصية التصاميم (عام/خاص)

### 📁 إدارة التصاميم
- صفحة مخصصة لعرض جميع تصاميم المستخدم
- إمكانية تحرير التصاميم المحفوظة
- حذف التصاميم
- معاينة التصاميم
- البحث والتصفية

## إعداد Firebase

### 1. إنشاء مشروع Firebase
1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. انقر على "إنشاء مشروع"
3. اتبع الخطوات لإنشاء المشروع

### 2. إعداد Authentication
1. في Firebase Console، اذهب إلى Authentication
2. انقر على "البدء"
3. في تبويب Sign-in method، قم بتفعيل:
   - Email/Password
   - Google (اختياري)

### 3. إعداد Firestore Database
1. اذهب إلى Firestore Database
2. انقر على "إنشاء قاعدة بيانات"
3. اختر "البدء في وضع الاختبار"
4. اختر الموقع المناسب

### 4. إعداد Storage (اختياري)
1. اذهب إلى Storage
2. انقر على "البدء"
3. اختر الموقع المناسب

### 5. الحصول على معلومات التكوين
1. اذهب إلى إعدادات المشروع
2. في تبويب "عام"، انزل إلى "التطبيقات"
3. انقر على أيقونة الويب `</>`
4. سجل التطبيق واحصل على معلومات التكوين

## تكوين التطبيق

### 1. تحديث ملف Firebase
قم بتحديث الملف `src/lib/firebase.ts` بمعلومات التكوين الخاصة بك:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.app",
  messagingSenderId: "123456789",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};
```

### 2. قواعد Firestore
أضف هذه القواعد في Firestore Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // قواعد مجموعة التصاميم
    match /designs/{designId} {
      // السماح للمستخدم المسجل دخول بقراءة تصاميمه أو التصاميم العامة
      allow read: if request.auth != null && 
                     (resource.data.userId == request.auth.uid || 
                      resource.data.isPublic == true);
      
      // السماح للمستخدم بإنشاء وتحديث تصاميمه فقط
      allow create, update: if request.auth != null && 
                              request.auth.uid == resource.data.userId;
      
      // السماح للمستخدم بحذف تصاميمه فقط
      allow delete: if request.auth != null && 
                      request.auth.uid == resource.data.userId;
    }
  }
}
```

### 3. قواعد Storage (إذا كنت تستخدمه)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /designs/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## الاستخدام

### تسجيل الدخول
1. اذهب إلى `/auth`
2. أدخل بريدك الإلكتروني وكلمة المرور
3. أو أنشئ حساباً جديداً
4. أو استخدم تسجيل الدخول بـ Google

### إنشاء تصميم
1. اذهب إلى `/editor`
2. قم بتصميم بطاقة الهوية
3. انقر على "حفظ" في شريط التنقل
4. أدخل اسم التصميم والوصف
5. اختر ما إذا كنت تريد جعل التصميم عاماً أم لا

### إدارة التصاميم
1. اذهب إلى `/my-designs`
2. شاهد جميع تصاميمك المحفوظة
3. انقر على "تحرير" لتعديل تصميم
4. انقر على "معاينة" لمشاهدة التصميم
5. انقر على "حذف" لحذف التصميم

### تحميل تصميم محفوظ
1. في المحرر، انقر على "فتح"
2. اختر التصميم الذي تريد تحميله
3. انقر على "تحميل التصميم"

## الملفات المهمة

### خدمات Firebase
- `src/lib/firebase.ts` - تكوين Firebase
- `src/lib/auth.ts` - خدمات المصادقة
- `src/lib/firestore.ts` - خدمات قاعدة البيانات

### مكونات المصادقة
- `src/components/auth/AuthPage.tsx` - صفحة تسجيل الدخول والتسجيل
- `src/hooks/useAuth.tsx` - Hook لإدارة حالة المصادقة

### مكونات التصاميم
- `src/components/designs/MyDesignsPage.tsx` - صفحة إدارة التصاميم
- `src/components/editor/SaveDesignModal.tsx` - مودال حفظ التصميم
- `src/components/editor/LoadDesignModal.tsx` - مودال تحميل التصميم

### مكونات مشتركة
- `src/components/common/Navbar.tsx` - شريط التنقل الرئيسي

## الصفحات
- `/` - الصفحة الرئيسية
- `/auth` - صفحة المصادقة
- `/editor` - المحرر الرئيسي
- `/my-designs` - إدارة التصاميم
- `/preview/[id]` - معاينة تصميم محدد

## المشاكل الشائعة وحلولها

### 1. خطأ في المصادقة
تأكد من أن:
- Authentication مفعل في Firebase Console
- معلومات التكوين صحيحة
- النطاق مضاف في Authorized domains

### 2. عدم حفظ التصاميم
تأكد من أن:
- Firestore Database مُنشأ ومفعل
- قواعد Firestore تسمح بالكتابة
- المستخدم مسجل دخول

### 3. عدم تحميل التصاميم
تأكد من أن:
- قواعد Firestore تسمح بالقراءة
- التصميم موجود وينتمي للمستخدم الحالي

## الأمان

- جميع التصاميم مرتبطة بحساب المستخدم
- لا يمكن للمستخدمين الوصول لتصاميم المستخدمين الآخرين إلا إذا كانت عامة
- كلمات المرور محمية بواسطة Firebase Authentication
- جميع البيانات محمية بقواعد Firestore Security Rules

## التطوير المستقبلي

يمكن إضافة الميزات التالية:
- مشاركة التصاميم مع مستخدمين آخرين
- التعليقات والتقييمات
- مجلدات لتنظيم التصاميم
- النسخ الاحتياطي والاستعادة
- إحصائيات الاستخدام
