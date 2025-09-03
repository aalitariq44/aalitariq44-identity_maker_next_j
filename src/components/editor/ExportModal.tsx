'use client'

import React, { useState } from 'react'
import { Download, Eye, FileImage, FileType, File } from 'lucide-react'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  onExport: (format: 'png' | 'jpg' | 'pdf') => Promise<void>
  isExporting: boolean
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onExport,
  isExporting,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'png' | 'jpg' | 'pdf'>('png')

  if (!isOpen) return null

  const exportOptions = [
    {
      format: 'png' as const,
      icon: <FileImage className="w-6 h-6" />,
      title: 'تصدير كـ PNG',
      description: 'جودة عالية مع شفافية، مناسب للطباعة',
      color: 'blue',
      pros: ['دعم الشفافية', 'جودة عالية', 'مناسب للطباعة'],
      fileSize: 'متوسط'
    },
    {
      format: 'jpg' as const,
      icon: <FileType className="w-6 h-6" />,
      title: 'تصدير كـ JPG',
      description: 'حجم أصغر بدون شفافية، مناسب للمشاركة',
      color: 'green',
      pros: ['حجم ملف صغير', 'متوافق عالمياً', 'سريع التحميل'],
      fileSize: 'صغير'
    },
    {
      format: 'pdf' as const,
      icon: <File className="w-6 h-6" />,
      title: 'تصدير كـ PDF',
      description: 'مناسب للطباعة الاحترافية والمشاركة الرسمية',
      color: 'purple',
      pros: ['جودة طباعة عالية', 'حجم دقيق للبطاقة', 'احترافي'],
      fileSize: 'متوسط'
    }
  ]

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors = {
      blue: isSelected 
        ? 'border-blue-500 bg-blue-50 text-blue-700' 
        : 'border-blue-200 hover:border-blue-300 hover:bg-blue-50',
      green: isSelected 
        ? 'border-green-500 bg-green-50 text-green-700' 
        : 'border-green-200 hover:border-green-300 hover:bg-green-50',
      purple: isSelected 
        ? 'border-purple-500 bg-purple-50 text-purple-700' 
        : 'border-purple-200 hover:border-purple-300 hover:bg-purple-50'
    }
    return colors[color as keyof typeof colors]
  }

  const handleExport = async () => {
    await onExport(selectedFormat)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Download className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            تصدير التصميم
          </h3>
          <p className="text-gray-600">
            اختر صيغة التصدير المناسبة لاحتياجاتك
          </p>
        </div>
        
        <div className="space-y-4 mb-8">
          {exportOptions.map((option) => {
            const isSelected = selectedFormat === option.format
            
            return (
              <button
                key={option.format}
                onClick={() => setSelectedFormat(option.format)}
                disabled={isExporting}
                className={`w-full p-6 border-2 rounded-xl text-right transition-all duration-300 disabled:opacity-50 ${
                  getColorClasses(option.color, isSelected)
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${
                    isSelected 
                      ? `bg-${option.color}-100 text-${option.color}-600` 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {option.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-lg">
                        {option.title}
                      </div>
                      <div className="text-sm px-2 py-1 bg-gray-100 rounded-full">
                        {option.fileSize}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3 text-sm">
                      {option.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {option.pros.map((pro, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full"
                        >
                          {pro}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className={`w-6 h-6 bg-${option.color}-500 rounded-full flex items-center justify-center`}>
                      <div className="w-2.5 h-2.5 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Eye className="w-5 h-5" />
            <div>
              <div className="font-medium">نصائح للتصدير:</div>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>استخدم PNG للطباعة عالية الجودة</li>
                <li>استخدم JPG للمشاركة السريعة</li>
                <li>استخدم PDF للطباعة الاحترافية</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium disabled:opacity-50"
          >
            إلغاء
          </button>
          
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                جاري التصدير...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                تصدير {selectedFormat.toUpperCase()}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExportModal
