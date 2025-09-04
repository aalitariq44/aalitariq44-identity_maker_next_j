'use client'

import { useState, useEffect } from 'react';
import { getUserDesigns, type Design } from '@/lib/firestore';
import { useAuth } from '@/hooks/useAuth';

interface LoadDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (designData: string) => void;
}

const LoadDesignModal: React.FC<LoadDesignModalProps> = ({ isOpen, onClose, onLoad }) => {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && user) {
      loadDesigns();
    }
  }, [isOpen, user]);

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

  const handleLoad = () => {
    const design = designs.find(d => d.id === selectedDesign);
    if (design) {
      onLoad(design.data);
      onClose();
    }
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
        month: 'short',
        day: 'numeric'
      });
    } catch (err) {
      return 'غير محدد';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">تحميل تصميم محفوظ</h2>
            <p className="text-gray-600">اختر من تصاميمك المحفوظة</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">جاري تحميل التصاميم...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          ) : designs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">لا توجد تصاميم محفوظة</p>
              <p className="text-sm text-gray-500">قم بحفظ تصميم أولاً لتتمكن من تحميله لاحقاً</p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-4">اختر التصميم الذي تريد تحميله:</p>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {designs.map((design) => (
                  <div
                    key={design.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedDesign === design.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedDesign(design.id!)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Thumbnail */}
                      <div className="w-16 h-10 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                        {design.thumbnail ? (
                          <img 
                            src={design.thumbnail} 
                            alt={design.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-xs text-gray-500">صورة</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {design.name}
                        </h3>
                        {design.description && (
                          <p className="text-sm text-gray-600 truncate mt-1">
                            {design.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>آخر تحديث: {formatDate(design.updatedAt)}</span>
                          {design.tags && design.tags.length > 0 && (
                            <span>{design.tags.length} تاج</span>
                          )}
                        </div>
                      </div>

                      {/* Selection indicator */}
                      {selectedDesign === design.id && (
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleLoad}
            disabled={!selectedDesign}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            تحميل التصميم
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoadDesignModal;
