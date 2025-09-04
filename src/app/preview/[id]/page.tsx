'use client'

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getDesign, type Design } from '@/lib/firestore';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/common/Navbar';
import { Calendar, User, Tag, Eye, Edit, Download } from 'lucide-react';

const PreviewPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [design, setDesign] = useState<Design | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      loadDesign(params.id as string);
    }
  }, [params.id]);

  const loadDesign = async (designId: string) => {
    setLoading(true);
    setError('');

    try {
      const result = await getDesign(designId);
      if (result.error) {
        setError(result.error);
      } else {
        setDesign(result.design);
      }
    } catch (err) {
      setError('حدث خطأ في تحميل التصميم');
    }

    setLoading(false);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'غير محدد';
    
    try {
      let date;
      if (timestamp.toDate) {
        date = timestamp.toDate();
      } else {
        date = new Date(timestamp);
      }
      
      return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return 'غير محدد';
    }
  };

  const isOwner = user && design && design.userId === user.uid;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل التصميم...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 pt-32">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg text-center">
            <h2 className="text-lg font-semibold mb-2">خطأ في تحميل التصميم</h2>
            <p>{error}</p>
            <button
              onClick={() => router.push('/my-designs')}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
            >
              العودة لتصاميمي
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!design) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 pt-32">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">التصميم غير موجود</h2>
            <p className="text-gray-600 mb-4">لم يتم العثور على التصميم المطلوب</p>
            <button
              onClick={() => router.push('/my-designs')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
            >
              العودة لتصاميمي
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{design.name}</h1>
              {design.description && (
                <p className="text-gray-600 mb-4">{design.description}</p>
              )}
            </div>
            
            {isOwner && (
              <div className="flex space-x-2">
                <button
                  onClick={() => router.push(`/editor?design=${design.id}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition duration-200"
                >
                  <Edit size={16} />
                  <span>تحرير</span>
                </button>
              </div>
            )}
          </div>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Calendar size={16} />
              <span>تم الإنشاء: {formatDate(design.createdAt)}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Calendar size={16} />
              <span>آخر تحديث: {formatDate(design.updatedAt)}</span>
            </div>

            <div className="flex items-center space-x-2">
              <Eye size={16} />
              <span>{design.isPublic ? 'تصميم عام' : 'تصميم خاص'}</span>
            </div>
          </div>

          {/* Tags */}
          {design.tags && design.tags.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center space-x-2 mb-2">
                <Tag size={16} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700">التاجز:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {design.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Design Preview */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">معاينة التصميم</h2>
          
          <div className="flex justify-center">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50">
              {design.thumbnail ? (
                <img 
                  src={design.thumbnail} 
                  alt={design.name}
                  className="max-w-full max-h-96 object-contain rounded-lg shadow-sm"
                />
              ) : (
                <div className="w-96 h-60 bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Eye size={48} className="mx-auto mb-2" />
                    <p>لا توجد معاينة متاحة</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-center space-x-4">
            {isOwner && (
              <>
                <button
                  onClick={() => router.push(`/editor?design=${design.id}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition duration-200"
                >
                  <Edit size={16} />
                  <span>تحرير التصميم</span>
                </button>

                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition duration-200"
                  title="تصدير التصميم"
                >
                  <Download size={16} />
                  <span>تصدير</span>
                </button>
              </>
            )}

            <button
              onClick={() => router.push('/my-designs')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition duration-200"
            >
              العودة للتصاميم
            </button>
          </div>
        </div>

        {/* Design Data Information */}
        {isOwner && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">معلومات التصميم</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">معرف التصميم:</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">{design.id}</code>
              
              <p className="text-sm text-gray-600 mt-4 mb-2">حجم البيانات:</p>
              <span className="text-sm text-gray-800">
                {Math.round(design.data.length / 1024)} كيلوبايت
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewPage;
