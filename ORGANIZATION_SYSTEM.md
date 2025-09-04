# قواعد Firestore المحدثة لنظام إدارة المؤسسات

## نظرة عامة
تم تطوير النظام ليدعم إدارة المؤسسات والفرق بالكامل. الآن يمكن للمستخدمين:

1. **إنشاء مؤسسة**: إدخال معلومات المؤسسة الكاملة
2. **إدارة الأعضاء**: إضافة طلاب أو موظفين مع معلوماتهم التفصيلية
3. **إنشاء قوالب**: تصميم قوالب هويات مخصصة للمؤسسة
4. **الإنتاج المجمع**: إنتاج هويات لفريق كامل دفعة واحدة

## قواعد Firestore الجديدة

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // قواعد مجموعة التصاميم (موجودة سابقاً)
    match /designs/{designId} {
      allow read: if request.auth != null && 
                     (resource.data.userId == request.auth.uid || 
                      resource.data.isPublic == true);
      
      allow create, update: if request.auth != null && 
                              request.auth.uid == request.resource.data.userId;
      
      allow delete: if request.auth != null && 
                      request.auth.uid == resource.data.userId;
    }
    
    // قواعد مجموعة المؤسسات
    match /organizations/{orgId} {
      // السماح بالقراءة والكتابة للمالك فقط
      allow read, write: if request.auth != null && 
                           request.auth.uid == resource.data.userId;
      
      // السماح بالإنشاء للمستخدم المسجل دخول
      allow create: if request.auth != null && 
                      request.auth.uid == request.resource.data.userId;
    }
    
    // قواعد مجموعة الأعضاء
    match /members/{memberId} {
      // السماح بالقراءة والكتابة لمالك المؤسسة
      allow read, write: if request.auth != null && 
                           isOrganizationOwner(resource.data.organizationId);
      
      // السماح بالإنشاء لمالك المؤسسة
      allow create: if request.auth != null && 
                      isOrganizationOwner(request.resource.data.organizationId);
    }
    
    // قواعد مجموعة قوالب البطاقات
    match /cardTemplates/{templateId} {
      // السماح بالقراءة والكتابة لمالك المؤسسة
      allow read, write: if request.auth != null && 
                           isOrganizationOwner(resource.data.organizationId);
      
      // السماح بالإنشاء لمالك المؤسسة
      allow create: if request.auth != null && 
                      isOrganizationOwner(request.resource.data.organizationId);
    }
    
    // قواعد مجموعة دفعات الإنتاج
    match /cardBatches/{batchId} {
      // السماح بالقراءة والكتابة لمالك المؤسسة
      allow read, write: if request.auth != null && 
                           isOrganizationOwner(resource.data.organizationId);
      
      // السماح بالإنشاء لمالك المؤسسة
      allow create: if request.auth != null && 
                      isOrganizationOwner(request.resource.data.organizationId);
    }
    
    // دالة مساعدة للتحقق من ملكية المؤسسة
    function isOrganizationOwner(organizationId) {
      return exists(/databases/$(database)/documents/organizations/$(organizationId)) &&
             get(/databases/$(database)/documents/organizations/$(organizationId)).data.userId == request.auth.uid;
    }
  }
}
```

## هيكل قاعدة البيانات الجديد

### 1. مجموعة `organizations`
```javascript
{
  id: "string",
  name: "string",
  nameEnglish: "string",
  type: "school|company|government|nonprofit|other",
  address: "string",
  city: "string",
  country: "string",
  phone: "string",
  email: "string",
  website: "string",
  description: "string",
  establishedYear: number,
  userId: "string", // مالك المؤسسة
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 2. مجموعة `members`
```javascript
{
  id: "string",
  organizationId: "string",
  memberNumber: "string", // رقم الطالب/الموظف
  nationalId: "string",
  firstName: "string",
  lastName: "string",
  firstNameEnglish: "string",
  lastNameEnglish: "string",
  dateOfBirth: "string",
  gender: "male|female",
  email: "string",
  phone: "string",
  address: "string",
  memberType: "student|employee|teacher|manager|other",
  
  // معلومات الطلاب
  grade: "string",
  className: "string",
  section: "string",
  studentId: "string",
  
  // معلومات الموظفين
  department: "string",
  position: "string",
  employeeId: "string",
  startDate: "string",
  
  // معلومات إضافية
  photoUrl: "string",
  bloodType: "string",
  emergencyContact: {
    name: "string",
    phone: "string",
    relationship: "string"
  },
  
  isActive: boolean,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 3. مجموعة `cardTemplates`
```javascript
{
  id: "string",
  name: "string",
  description: "string",
  organizationId: "string",
  memberType: "student|employee|teacher|manager|other",
  designData: "string", // JSON للتصميم
  thumbnail: "string",
  cardSize: {
    width: number,
    height: number,
    name: "string"
  },
  variableFields: [
    {
      fieldName: "string",
      xPosition: number,
      yPosition: number,
      width: number,
      height: number,
      fontSize: number,
      fontFamily: "string",
      color: "string",
      alignment: "left|center|right"
    }
  ],
  isDefault: boolean,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 4. مجموعة `cardBatches`
```javascript
{
  id: "string",
  name: "string",
  organizationId: "string",
  templateId: "string",
  memberIds: ["string"],
  exportFormat: "png|pdf|jpg",
  quality: number,
  cardsPerPage: number,
  status: "pending|processing|completed|failed",
  progress: number,
  outputFiles: ["string"],
  errorMessages: ["string"],
  createdAt: Timestamp,
  completedAt: Timestamp
}
```

## الميزات الجديدة

### 1. **إدارة المؤسسات**
- إنشاء وتحرير معلومات المؤسسة
- دعم أنواع مختلفة من المؤسسات (مدارس، شركات، جهات حكومية)
- ربط المؤسسة بحساب المستخدم

### 2. **إدارة الأعضاء**
- إضافة طلاب أو موظفين مع معلوماتهم التفصيلية
- دعم الإضافة الفردية والمجمعة
- تصنيف الأعضاء حسب النوع (طالب، موظف، معلم، مدير)
- إدارة معلومات إضافية (فصيلة الدم، جهة الاتصال الطارئ)

### 3. **نظام القوالب**
- إنشاء قوالب مخصصة لكل نوع من الأعضاء
- تحديد الحقول المتغيرة في القالب
- حفظ معاينات مصغرة للقوالب

### 4. **الإنتاج المجمع**
- إنتاج هويات لمجموعة من الأعضاء دفعة واحدة
- دعم تصدير بصيغ مختلفة (PNG, PDF, JPG)
- تتبع حالة الإنتاج والتقدم

### 5. **الإحصائيات والتقارير**
- إحصائيات شاملة عن المؤسسة والأعضاء
- توزيع الأعضاء حسب النوع
- معلومات عن القوالب والدفعات المنتجة

## كيفية الاستخدام

### 1. **إعداد المؤسسة**
1. سجل دخول أو أنشئ حساب جديد
2. اذهب إلى صفحة "إعداد المؤسسة"
3. أدخل معلومات مؤسستك الكاملة
4. احفظ المؤسسة

### 2. **إضافة الأعضاء**
1. من لوحة التحكم، انقر على "إضافة أعضاء"
2. اختر بين الإضافة الفردية أو المجمعة
3. أدخل معلومات الأعضاء
4. احفظ البيانات

### 3. **إنشاء قوالب**
1. انقر على "إنشاء قالب جديد"
2. اختر نوع العضوية للقالب
3. صمم القالب باستخدام المحرر
4. احفظ القالب

### 4. **الإنتاج المجمع**
1. انقر على "إنتاج مجمع"
2. اختر القالب والأعضاء
3. حدد إعدادات التصدير
4. ابدأ عملية الإنتاج

## الأمان والخصوصية

- **حماية البيانات**: كل مؤسسة معزولة عن الأخرى
- **التحكم في الوصول**: المالك فقط يمكنه الوصول لبيانات مؤسسته
- **تشفير البيانات**: جميع البيانات محمية بواسطة Firebase
- **النسخ الاحتياطي**: البيانات محفوظة في السحابة بأمان

## التطوير المستقبلي

- **الأدوار والصلاحيات**: إضافة مستويات وصول مختلفة
- **التقارير المتقدمة**: تقارير تفصيلية وإحصائيات
- **التكامل مع أنظمة أخرى**: ربط مع أنظمة إدارة المدارس
- **التطبيق المحمول**: نسخة للهواتف الذكية
- **النسخ الاحتياطي المتقدم**: استيراد وتصدير البيانات
