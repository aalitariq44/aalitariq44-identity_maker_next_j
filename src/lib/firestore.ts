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
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { getCurrentUser } from './auth';

export interface Design {
  id?: string;
  name: string;
  description?: string;
  data: string; // JSON string of the design data
  thumbnail?: string; // Base64 thumbnail image
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isPublic?: boolean;
  tags?: string[];
}

// حفظ تصميم جديد
export const saveDesign = async (designData: Omit<Design, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }

    const design: Omit<Design, 'id'> = {
      ...designData,
      userId: user.uid,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    // إزالة الحقول غير المعرفة قبل الحفظ
    const cleanDesign = Object.fromEntries(
      Object.entries(design).filter(([_, value]) => value !== undefined)
    );

    const docRef = await addDoc(collection(db, 'designs'), cleanDesign);
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

// تحديث تصميم موجود
export const updateDesign = async (designId: string, updates: Partial<Omit<Design, 'id' | 'userId' | 'createdAt'>>) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }

    const designRef = doc(db, 'designs', designId);
    
    // التحقق من ملكية التصميم
    const designDoc = await getDoc(designRef);
    if (!designDoc.exists() || designDoc.data().userId !== user.uid) {
      throw new Error('ليس لديك صلاحية لتعديل هذا التصميم');
    }

    // إزالة الحقول غير المعرفة قبل التحديث
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    const updateData = {
      ...cleanUpdates,
      updatedAt: serverTimestamp()
    };

    await updateDoc(designRef, updateData);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// حذف تصميم
export const deleteDesign = async (designId: string) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }

    const designRef = doc(db, 'designs', designId);
    
    // التحقق من ملكية التصميم
    const designDoc = await getDoc(designRef);
    if (!designDoc.exists() || designDoc.data().userId !== user.uid) {
      throw new Error('ليس لديك صلاحية لحذف هذا التصميم');
    }

    await deleteDoc(designRef);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// الحصول على تصاميم المستخدم
export const getUserDesigns = async () => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }

    const q = query(
      collection(db, 'designs'),
      where('userId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const designs: Design[] = [];

    querySnapshot.forEach((doc) => {
      designs.push({
        id: doc.id,
        ...doc.data()
      } as Design);
    });

    return { designs, error: null };
  } catch (error: any) {
    return { designs: [], error: error.message };
  }
};

// الحصول على تصميم محدد
export const getDesign = async (designId: string) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }

    const designRef = doc(db, 'designs', designId);
    const designDoc = await getDoc(designRef);

    if (!designDoc.exists()) {
      throw new Error('التصميم غير موجود');
    }

    const designData = designDoc.data() as Design;
    
    // التحقق من الصلاحيات (المالك أو التصميم عام)
    if (designData.userId !== user.uid && !designData.isPublic) {
      throw new Error('ليس لديك صلاحية لعرض هذا التصميم');
    }

    return { 
      design: {
        id: designDoc.id,
        ...designData
      } as Design, 
      error: null 
    };
  } catch (error: any) {
    return { design: null, error: error.message };
  }
};

// البحث في التصاميم العامة
export const searchPublicDesigns = async (searchTerm?: string, tags?: string[]) => {
  try {
    let q = query(
      collection(db, 'designs'),
      where('isPublic', '==', true),
      orderBy('updatedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    let designs: Design[] = [];

    querySnapshot.forEach((doc) => {
      designs.push({
        id: doc.id,
        ...doc.data()
      } as Design);
    });

    // تطبيق فلترة إضافية على العميل للبحث النصي والتاجز
    if (searchTerm) {
      designs = designs.filter(design => 
        design.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (design.description && design.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (tags && tags.length > 0) {
      designs = designs.filter(design => 
        design.tags && design.tags.some(tag => tags.includes(tag))
      );
    }

    return { designs, error: null };
  } catch (error: any) {
    return { designs: [], error: error.message };
  }
};
