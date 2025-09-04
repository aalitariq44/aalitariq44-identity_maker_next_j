import { Timestamp } from 'firebase/firestore'

// أنواع المؤسسات
export type OrganizationType = 'school' | 'company' | 'government' | 'nonprofit' | 'other'

// أنواع الأعضاء
export type MemberType = 'student' | 'employee' | 'teacher' | 'manager' | 'other'

// معلومات المؤسسة
export interface Organization {
  id?: string
  name: string
  nameEnglish?: string
  type: OrganizationType
  address: string
  city: string
  country: string
  phone: string
  email: string
  website?: string
  logo?: string
  description?: string
  establishedYear?: number
  userId: string // المستخدم الذي أنشأ المؤسسة
  createdAt: Timestamp
  updatedAt: Timestamp
}

// معلومات العضو/الطالب
export interface Member {
  id?: string
  organizationId: string
  memberNumber: string // رقم الطالب/الموظف
  nationalId?: string // رقم الهوية الوطنية
  firstName: string
  lastName: string
  firstNameEnglish?: string
  lastNameEnglish?: string
  dateOfBirth: string
  gender: 'male' | 'female'
  email?: string
  phone?: string
  address?: string
  memberType: MemberType
  
  // معلومات خاصة بالطلاب
  grade?: string // الصف
  className?: string // الفصل
  section?: string // الشعبة
  studentId?: string // رقم الطالب الأكاديمي
  
  // معلومات خاصة بالموظفين
  department?: string // القسم
  position?: string // المنصب
  employeeId?: string // رقم الموظف
  startDate?: string // تاريخ البداية
  
  // معلومات إضافية
  photoUrl?: string
  bloodType?: string
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  
  // معلومات النظام
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

// قالب البطاقة
export interface CardTemplate {
  id?: string
  name: string
  description?: string
  organizationId: string
  memberType: MemberType
  
  // بيانات التصميم
  designData: string // JSON string من التصميم
  thumbnail?: string
  
  // إعدادات القالب
  cardSize: {
    width: number
    height: number
    name: string
  }
  
  // الحقول المتغيرة في القالب
  variableFields: {
    fieldName: string // اسم الحقل
    xPosition: number
    yPosition: number
    width: number
    height: number
    fontSize?: number
    fontFamily?: string
    color?: string
    alignment?: 'left' | 'center' | 'right'
  }[]
  
  // معلومات النظام
  isDefault: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

// دفعة إنتاج البطاقات
export interface CardBatch {
  id?: string
  name: string
  organizationId: string
  templateId: string
  memberIds: string[]
  
  // إعدادات الإنتاج
  exportFormat: 'png' | 'pdf' | 'jpg'
  quality: number
  cardsPerPage?: number // للـ PDF
  
  // حالة الدفعة
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number // نسبة الإنجاز
  
  // نتائج الإنتاج
  outputFiles?: string[] // روابط الملفات المنتجة
  errorMessages?: string[]
  
  // معلومات النظام
  createdAt: Timestamp
  completedAt?: Timestamp
}

// إحصائيات المؤسسة
export interface OrganizationStats {
  totalMembers: number
  activeMembers: number
  membersByType: Record<MemberType, number>
  totalTemplates: number
  totalBatches: number
  lastActivity: Timestamp
}
