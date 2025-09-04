import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  Timestamp,
  serverTimestamp,
  writeBatch,
  limit
} from 'firebase/firestore'
import { db } from './firebase'
import { getCurrentUser } from './auth'
import { Organization, Member, CardTemplate, CardBatch, OrganizationStats } from '@/types/organization'

// ==================== خدمات المؤسسات ====================

// إنشاء مؤسسة جديدة
export const createOrganization = async (orgData: Omit<Organization, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
  try {
    const user = getCurrentUser()
    if (!user) {
      throw new Error('يجب تسجيل الدخول أولاً')
    }

    const organization: Omit<Organization, 'id'> = {
      ...orgData,
      userId: user.uid,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    }

    const docRef = await addDoc(collection(db, 'organizations'), organization)
    return { id: docRef.id, error: null }
  } catch (error: any) {
    return { id: null, error: error.message }
  }
}

// الحصول على مؤسسات المستخدم
export const getUserOrganizations = async () => {
  try {
    const user = getCurrentUser()
    if (!user) {
      throw new Error('يجب تسجيل الدخول أولاً')
    }

    const q = query(
      collection(db, 'organizations'),
      where('userId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    )

    const querySnapshot = await getDocs(q)
    const organizations: Organization[] = []

    querySnapshot.forEach((doc) => {
      organizations.push({
        id: doc.id,
        ...doc.data()
      } as Organization)
    })

    return { organizations, error: null }
  } catch (error: any) {
    return { organizations: [], error: error.message }
  }
}

// تحديث بيانات المؤسسة
export const updateOrganization = async (orgId: string, updates: Partial<Omit<Organization, 'id' | 'userId' | 'createdAt'>>) => {
  try {
    const user = getCurrentUser()
    if (!user) {
      throw new Error('يجب تسجيل الدخول أولاً')
    }

    const orgRef = doc(db, 'organizations', orgId)
    const orgDoc = await getDoc(orgRef)
    
    if (!orgDoc.exists() || orgDoc.data().userId !== user.uid) {
      throw new Error('ليس لديك صلاحية لتعديل هذه المؤسسة')
    }

    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    }

    await updateDoc(orgRef, updateData)
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

// حذف المؤسسة
export const deleteOrganization = async (orgId: string) => {
  try {
    const user = getCurrentUser()
    if (!user) {
      throw new Error('يجب تسجيل الدخول أولاً')
    }

    const orgRef = doc(db, 'organizations', orgId)
    const orgDoc = await getDoc(orgRef)
    
    if (!orgDoc.exists() || orgDoc.data().userId !== user.uid) {
      throw new Error('ليس لديك صلاحية لحذف هذه المؤسسة')
    }

    // حذف جميع الأعضاء والقوالب المرتبطة
    const batch = writeBatch(db)
    
    // حذف الأعضاء
    const membersQuery = query(collection(db, 'members'), where('organizationId', '==', orgId))
    const membersSnapshot = await getDocs(membersQuery)
    membersSnapshot.forEach((doc) => {
      batch.delete(doc.ref)
    })

    // حذف القوالب
    const templatesQuery = query(collection(db, 'cardTemplates'), where('organizationId', '==', orgId))
    const templatesSnapshot = await getDocs(templatesQuery)
    templatesSnapshot.forEach((doc) => {
      batch.delete(doc.ref)
    })

    // حذف الدفعات
    const batchesQuery = query(collection(db, 'cardBatches'), where('organizationId', '==', orgId))
    const batchesSnapshot = await getDocs(batchesQuery)
    batchesSnapshot.forEach((doc) => {
      batch.delete(doc.ref)
    })

    // حذف المؤسسة
    batch.delete(orgRef)
    
    await batch.commit()
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

// ==================== خدمات الأعضاء ====================

// إضافة عضو جديد
export const addMember = async (memberData: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const user = getCurrentUser()
    if (!user) {
      throw new Error('يجب تسجيل الدخول أولاً')
    }

    // التحقق من ملكية المؤسسة
    const orgRef = doc(db, 'organizations', memberData.organizationId)
    const orgDoc = await getDoc(orgRef)
    if (!orgDoc.exists() || orgDoc.data().userId !== user.uid) {
      throw new Error('ليس لديك صلاحية لإضافة أعضاء لهذه المؤسسة')
    }

    // توليد رقم العضو تلقائياً إذا لم يكن موجوداً
    if (!memberData.memberNumber) {
      const timestamp = Date.now().toString().slice(-6)
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
      memberData.memberNumber = `${memberData.memberType.toUpperCase()}-${timestamp}${random}`
    }

    const member: Omit<Member, 'id'> = {
      ...memberData,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    }

    const docRef = await addDoc(collection(db, 'members'), member)
    return { id: docRef.id, error: null }
  } catch (error: any) {
    return { id: null, error: error.message }
  }
}

// إضافة أعضاء متعددين
export const addMultipleMembers = async (membersData: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>[]) => {
  try {
    const user = getCurrentUser()
    if (!user) {
      throw new Error('يجب تسجيل الدخول أولاً')
    }

    if (membersData.length === 0) {
      throw new Error('لا توجد بيانات أعضاء لإضافتها')
    }

    // التحقق من ملكية المؤسسة
    const orgId = membersData[0].organizationId
    const orgRef = doc(db, 'organizations', orgId)
    const orgDoc = await getDoc(orgRef)
    if (!orgDoc.exists() || orgDoc.data().userId !== user.uid) {
      throw new Error('ليس لديك صلاحية لإضافة أعضاء لهذه المؤسسة')
    }

    const batch = writeBatch(db)
    const addedIds: string[] = []

    for (const memberData of membersData) {
      // توليد رقم العضو تلقائياً إذا لم يكن موجوداً
      if (!memberData.memberNumber) {
        const timestamp = Date.now().toString().slice(-6)
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
        memberData.memberNumber = `${memberData.memberType.toUpperCase()}-${timestamp}${random}`
      }

      const member: Omit<Member, 'id'> = {
        ...memberData,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      }

      const docRef = doc(collection(db, 'members'))
      batch.set(docRef, member)
      addedIds.push(docRef.id)
    }

    await batch.commit()
    return { ids: addedIds, error: null }
  } catch (error: any) {
    return { ids: [], error: error.message }
  }
}

// الحصول على أعضاء المؤسسة
export const getOrganizationMembers = async (organizationId: string, memberType?: string) => {
  try {
    const user = getCurrentUser()
    if (!user) {
      throw new Error('يجب تسجيل الدخول أولاً')
    }

    // التحقق من ملكية المؤسسة
    const orgRef = doc(db, 'organizations', organizationId)
    const orgDoc = await getDoc(orgRef)
    if (!orgDoc.exists() || orgDoc.data().userId !== user.uid) {
      throw new Error('ليس لديك صلاحية لعرض أعضاء هذه المؤسسة')
    }

    let q = query(
      collection(db, 'members'),
      where('organizationId', '==', organizationId),
      orderBy('firstName', 'asc')
    )

    if (memberType) {
      q = query(
        collection(db, 'members'),
        where('organizationId', '==', organizationId),
        where('memberType', '==', memberType),
        orderBy('firstName', 'asc')
      )
    }

    const querySnapshot = await getDocs(q)
    const members: Member[] = []

    querySnapshot.forEach((doc) => {
      members.push({
        id: doc.id,
        ...doc.data()
      } as Member)
    })

    return { members, error: null }
  } catch (error: any) {
    return { members: [], error: error.message }
  }
}

// تحديث بيانات العضو
export const updateMember = async (memberId: string, updates: Partial<Omit<Member, 'id' | 'organizationId' | 'createdAt'>>) => {
  try {
    const user = getCurrentUser()
    if (!user) {
      throw new Error('يجب تسجيل الدخول أولاً')
    }

    const memberRef = doc(db, 'members', memberId)
    const memberDoc = await getDoc(memberRef)
    
    if (!memberDoc.exists()) {
      throw new Error('العضو غير موجود')
    }

    // التحقق من ملكية المؤسسة
    const orgRef = doc(db, 'organizations', memberDoc.data().organizationId)
    const orgDoc = await getDoc(orgRef)
    if (!orgDoc.exists() || orgDoc.data().userId !== user.uid) {
      throw new Error('ليس لديك صلاحية لتعديل هذا العضو')
    }

    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    }

    await updateDoc(memberRef, updateData)
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

// حذف عضو
export const deleteMember = async (memberId: string) => {
  try {
    const user = getCurrentUser()
    if (!user) {
      throw new Error('يجب تسجيل الدخول أولاً')
    }

    const memberRef = doc(db, 'members', memberId)
    const memberDoc = await getDoc(memberRef)
    
    if (!memberDoc.exists()) {
      throw new Error('العضو غير موجود')
    }

    // التحقق من ملكية المؤسسة
    const orgRef = doc(db, 'organizations', memberDoc.data().organizationId)
    const orgDoc = await getDoc(orgRef)
    if (!orgDoc.exists() || orgDoc.data().userId !== user.uid) {
      throw new Error('ليس لديك صلاحية لحذف هذا العضو')
    }

    await deleteDoc(memberRef)
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

// البحث في الأعضاء
export const searchMembers = async (organizationId: string, searchTerm: string, memberType?: string) => {
  try {
    const { members, error } = await getOrganizationMembers(organizationId, memberType)
    
    if (error) {
      return { members: [], error }
    }

    const filteredMembers = members.filter(member => 
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.memberNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    return { members: filteredMembers, error: null }
  } catch (error: any) {
    return { members: [], error: error.message }
  }
}

// ==================== خدمات القوالب ====================

// حفظ قالب جديد
export const saveCardTemplate = async (templateData: Omit<CardTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const user = getCurrentUser()
    if (!user) {
      throw new Error('يجب تسجيل الدخول أولاً')
    }

    // التحقق من ملكية المؤسسة
    const orgRef = doc(db, 'organizations', templateData.organizationId)
    const orgDoc = await getDoc(orgRef)
    if (!orgDoc.exists() || orgDoc.data().userId !== user.uid) {
      throw new Error('ليس لديك صلاحية لإنشاء قوالب لهذه المؤسسة')
    }

    const template: Omit<CardTemplate, 'id'> = {
      ...templateData,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    }

    const docRef = await addDoc(collection(db, 'cardTemplates'), template)
    return { id: docRef.id, error: null }
  } catch (error: any) {
    return { id: null, error: error.message }
  }
}

// الحصول على قوالب المؤسسة
export const getOrganizationTemplates = async (organizationId: string) => {
  try {
    const user = getCurrentUser()
    if (!user) {
      throw new Error('يجب تسجيل الدخول أولاً')
    }

    // التحقق من ملكية المؤسسة
    const orgRef = doc(db, 'organizations', organizationId)
    const orgDoc = await getDoc(orgRef)
    if (!orgDoc.exists() || orgDoc.data().userId !== user.uid) {
      throw new Error('ليس لديك صلاحية لعرض قوالب هذه المؤسسة')
    }

    const q = query(
      collection(db, 'cardTemplates'),
      where('organizationId', '==', organizationId),
      orderBy('createdAt', 'desc')
    )

    const querySnapshot = await getDocs(q)
    const templates: CardTemplate[] = []

    querySnapshot.forEach((doc) => {
      templates.push({
        id: doc.id,
        ...doc.data()
      } as CardTemplate)
    })

    return { templates, error: null }
  } catch (error: any) {
    return { templates: [], error: error.message }
  }
}

// ==================== إحصائيات المؤسسة ====================

// الحصول على إحصائيات المؤسسة
export const getOrganizationStats = async (organizationId: string): Promise<{ stats: OrganizationStats | null, error: string | null }> => {
  try {
    const user = getCurrentUser()
    if (!user) {
      throw new Error('يجب تسجيل الدخول أولاً')
    }

    // التحقق من ملكية المؤسسة
    const orgRef = doc(db, 'organizations', organizationId)
    const orgDoc = await getDoc(orgRef)
    if (!orgDoc.exists() || orgDoc.data().userId !== user.uid) {
      throw new Error('ليس لديك صلاحية لعرض إحصائيات هذه المؤسسة')
    }

    // جلب جميع الأعضاء
    const membersQuery = query(collection(db, 'members'), where('organizationId', '==', organizationId))
    const membersSnapshot = await getDocs(membersQuery)
    
    let totalMembers = 0
    let activeMembers = 0
    const membersByType: Record<string, number> = {}

    membersSnapshot.forEach((doc) => {
      const member = doc.data() as Member
      totalMembers++
      if (member.isActive) activeMembers++
      membersByType[member.memberType] = (membersByType[member.memberType] || 0) + 1
    })

    // جلب عدد القوالب
    const templatesQuery = query(collection(db, 'cardTemplates'), where('organizationId', '==', organizationId))
    const templatesSnapshot = await getDocs(templatesQuery)
    const totalTemplates = templatesSnapshot.size

    // جلب عدد الدفعات
    const batchesQuery = query(collection(db, 'cardBatches'), where('organizationId', '==', organizationId))
    const batchesSnapshot = await getDocs(batchesQuery)
    const totalBatches = batchesSnapshot.size

    const stats: OrganizationStats = {
      totalMembers,
      activeMembers,
      membersByType: membersByType as Record<any, number>,
      totalTemplates,
      totalBatches,
      lastActivity: serverTimestamp() as Timestamp
    }

    return { stats, error: null }
  } catch (error: any) {
    return { stats: null, error: error.message }
  }
}
