'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserDesigns, deleteDesign, type Design } from '@/lib/firestore';
import { useAuth } from '@/hooks/useAuth';
import { Trash2, Edit, Eye, Plus, Calendar, User } from 'lucide-react';

const MyDesignsPage = () => {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }

    loadDesigns();
  }, [user, router]);

  const loadDesigns = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await getUserDesigns();
      if (result.error) {
        setError(result.error);
      } else {
        setDesigns(result.designs);
      }
    } catch (err) {
      setError('حدث خطأ في تحميل التصاميم');
    }

    setLoading(false);
  };

  const handleDeleteDesign = async (designId: string, designName: string) => {
    if (!confirm(`هل أنت متأكد من حذف التصميم "${designName}"؟`)) {
      return;
    }

    setDeleteLoading(designId);

    try {
      const result = await deleteDesign(designId);
      if (result.error) {
        setError(result.error);
      } else {
        setDesigns(designs.filter(d => d.id !== designId));
      }
    } catch (err) {
      setError('حدث خطأ في حذف التصميم');
    }

    setDeleteLoading(null);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل التصاميم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">تصاميمي</h1>
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                {designs.length} تصميم
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <User size={16} />
                <span className="text-sm">{user?.displayName || user?.email}</span>
              </div>
              
              <button
                onClick={() => router.push('/editor')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition duration-200"
              >
                <Plus size={16} />
                <span>تصميم جديد</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {designs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد تصاميم محفوظة</h3>
            <p className="text-gray-600 mb-6">ابدأ بإنشاء تصميمك الأول</p>
            <button
              onClick={() => router.push('/editor')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition duration-200"
            >
              إنشاء تصميم جديد
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {designs.map((design) => (
              <div key={design.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition duration-200">
                {/* Thumbnail */}
                <div className="aspect-video bg-gray-100 rounded-t-lg flex items-center justify-center overflow-hidden">
                  {design.thumbnail ? (
                    <img 
                      src={design.thumbnail} 
                      alt={design.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400">
                      <Eye size={32} />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-1 truncate">
                    {design.name}
                  </h3>
                  
                  {design.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {design.description}
                    </p>
                  )}

                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <Calendar size={12} className="mr-1" />
                    <span>{formatDate(design.updatedAt)}</span>
                  </div>

                  {/* Tags */}
                  {design.tags && design.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {design.tags.slice(0, 3).map((tag, index) => (
                        <span 
                          key={index}
                          className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {design.tags.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{design.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => router.push(`/editor?design=${design.id}`)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-md transition duration-200"
                        title="تحرير التصميم"
                      >
                        <Edit size={16} />
                      </button>
                      
                      <button
                        onClick={() => router.push(`/preview/${design.id}`)}
                        className="bg-gray-50 hover:bg-gray-100 text-gray-600 p-2 rounded-md transition duration-200"
                        title="معاينة التصميم"
                      >
                        <Eye size={16} />
                      </button>
                    </div>

                    <button
                      onClick={() => handleDeleteDesign(design.id!, design.name)}
                      disabled={deleteLoading === design.id}
                      className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-md transition duration-200 disabled:opacity-50"
                      title="حذف التصميم"
                    >
                      {deleteLoading === design.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyDesignsPage;
