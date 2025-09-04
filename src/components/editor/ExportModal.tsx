'use client'

import React, { useState } from 'react'
import { Download, Eye, FileImage, FileType, File, RotateCcw } from 'lucide-react'
import { useEditorStore } from '@/store/useEditorStore'

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
  const { canvasSettings, toggleOrientation } = useEditorStore()

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
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">تصدير التصميم</h2>
            <p className="text-gray-600">اختر صيغة التصدير المناسبة لاحتياجاتك</p>
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
            <div className="flex items-center justify-between mb-3">
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
              
              <button
                onClick={toggleOrientation}
                disabled={isExporting}
                className="flex items-center gap-2 px-3 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-colors disabled:opacity-50"
                title={`تبديل إلى ${canvasSettings.orientation === 'landscape' ? 'عمودي' : 'أفقي'}`}
              >
                <RotateCcw className="w-4 h-4" />
                {canvasSettings.orientation === 'landscape' ? 'عمودي' : 'أفقي'}
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            إلغاء
          </button>
          
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                جاري التصدير...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
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
