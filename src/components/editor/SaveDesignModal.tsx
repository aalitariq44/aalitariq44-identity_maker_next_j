'use client'

import React, { useState } from 'react';
import { Save, X, Image, Tag } from 'lucide-react';
import { saveDesign, updateDesign } from '@/lib/firestore';
import { useEditorStore } from '@/store/useEditorStore';
import * as htmlToImage from 'html-to-image';

interface SaveDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingDesignId?: string;
  existingDesignName?: string;
  existingDesignDescription?: string;
  existingTags?: string[];
}

const SaveDesignModal: React.FC<SaveDesignModalProps> = ({
  isOpen,
  onClose,
  existingDesignId,
  existingDesignName = '',
  existingDesignDescription = '',
  existingTags = []
}) => {
  const [name, setName] = useState(existingDesignName);
  const [description, setDescription] = useState(existingDesignDescription);
  const [tags, setTags] = useState<string[]>(existingTags);
  const [newTag, setNewTag] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setSaving] = useState(false);
  const [error, setError] = useState('');

  const { saveProject } = useEditorStore();

  const generateThumbnail = async (): Promise<string | undefined> => {
    try {
      const canvasElement = document.querySelector('canvas');
      if (!canvasElement) return undefined;

      // إنشاء صورة مصغرة من الكانفاس
      const dataUrl = await htmlToImage.toJpeg(canvasElement, {
        width: 300,
        height: 200,
        quality: 0.8
      });

      return dataUrl;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      return undefined;
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('يرجى إدخال اسم التصميم');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const designData = saveProject();
      const thumbnail = await generateThumbnail();

      const designInfo = {
        name: name.trim(),
        description: description.trim(),
        data: designData,
        thumbnail,
        isPublic,
        tags: tags.length > 0 ? tags : undefined
      };

      let result;
      if (existingDesignId) {
        result = await updateDesign(existingDesignId, designInfo);
      } else {
        result = await saveDesign(designInfo);
      }

      if (result.error) {
        setError(result.error);
      } else {
        alert(existingDesignId ? 'تم تحديث التصميم بنجاح!' : 'تم حفظ التصميم بنجاح!');
        onClose();
        // إعادة تعيين النموذج
        setName('');
        setDescription('');
        setTags([]);
        setIsPublic(false);
      }
    } catch (err) {
      setError('حدث خطأ في حفظ التصميم');
    }

    setSaving(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {existingDesignId ? 'تحديث التصميم' : 'حفظ التصميم'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition duration-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* اسم التصميم */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              اسم التصميم *
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="أدخل اسم التصميم"
            />
          </div>

          {/* الوصف */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              الوصف (اختياري)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="أدخل وصف للتصميم"
            />
          </div>

          {/* التاجز */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              التاجز (اختياري)
            </label>
            
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أضف تاج..."
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition duration-200"
              >
                <Tag size={16} />
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded flex items-center space-x-1"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* عام أم خاص */}
          <div className="flex items-center space-x-2">
            <input
              id="isPublic"
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-700">
              جعل التصميم عاماً (يمكن للآخرين رؤيته)
            </label>
          </div>

          {/* الأزرار */}
          <div className="flex space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{existingDesignId ? 'تحديث' : 'حفظ'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaveDesignModal;
