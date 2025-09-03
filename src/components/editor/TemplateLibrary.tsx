'use client'

import React, { useState } from 'react'
import { useEditorStore } from '@/store/useEditorStore'
import { X, Search, Star, Download, Eye, Plus, Heart, Clock, Zap } from 'lucide-react'

interface Template {
  id: string
  name: string
  description: string
  category: string
  thumbnail: string
  data: any
  featured: boolean
  tags: string[]
  size: { width: number; height: number }
  createdAt: string
}

interface TemplateLibraryProps {
  isOpen: boolean
  onClose: () => void
}

const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [favoriteTemplates, setFavoriteTemplates] = useState<string[]>([])
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)

  const { loadProject, setCanvasSize } = useEditorStore()

  // Sample templates (في التطبيق الحقيقي، هذه ستأتي من قاعدة البيانات)
  const templates: Template[] = [
    {
      id: '1',
      name: 'بطاقة هوية مدرسية حديثة',
      description: 'تصميم عصري لبطاقة هوية مدرسية مع مساحة للصورة والمعلومات الأساسية',
      category: 'مدرسي',
      thumbnail: '/api/placeholder/300/200',
      featured: true,
      tags: ['مدرسة', 'طلاب', 'أزرق', 'حديث'],
      size: { width: 856, height: 540 },
      createdAt: '2024-01-15',
      data: {
        shapes: [
          {
            id: '1',
            type: 'rect',
            position: { x: 0, y: 0 },
            size: { width: 856, height: 540 },
            fill: '#2563EB',
            stroke: 'transparent',
            strokeWidth: 0,
            visible: true,
            locked: false,
            zIndex: 1,
            rotation: 0
          },
          {
            id: '2',
            type: 'rect',
            position: { x: 50, y: 50 },
            size: { width: 150, height: 200 },
            fill: '#FFFFFF',
            stroke: '#E5E7EB',
            strokeWidth: 2,
            visible: true,
            locked: false,
            zIndex: 2,
            rotation: 0
          },
          {
            id: '3',
            type: 'text',
            position: { x: 250, y: 80 },
            size: { width: 500, height: 60 },
            fill: '#FFFFFF',
            stroke: 'transparent',
            strokeWidth: 0,
            visible: true,
            locked: false,
            zIndex: 3,
            rotation: 0,
            text: 'اسم الطالب',
            fontSize: 32,
            fontFamily: 'Arial',
            textAlign: 'right'
          }
        ],
        canvasSettings: {
          width: 856,
          height: 540,
          backgroundColor: '#2563EB'
        }
      }
    },
    {
      id: '2',
      name: 'بطاقة عمل أنيقة',
      description: 'تصميم أنيق لبطاقة العمل مع ألوان احترافية',
      category: 'أعمال',
      thumbnail: '/api/placeholder/300/200',
      featured: false,
      tags: ['أعمال', 'احترافي', 'أسود', 'ذهبي'],
      size: { width: 890, height: 510 },
      createdAt: '2024-01-10',
      data: {
        shapes: [
          {
            id: '1',
            type: 'rect',
            position: { x: 0, y: 0 },
            size: { width: 890, height: 510 },
            fill: '#1F2937',
            stroke: 'transparent',
            strokeWidth: 0,
            visible: true,
            locked: false,
            zIndex: 1,
            rotation: 0
          }
        ],
        canvasSettings: {
          width: 890,
          height: 510,
          backgroundColor: '#1F2937'
        }
      }
    },
    {
      id: '3',
      name: 'بطاقة هوية طبية',
      description: 'تصميم متخصص للكوادر الطبية',
      category: 'طبي',
      thumbnail: '/api/placeholder/300/200',
      featured: true,
      tags: ['طبي', 'مستشفى', 'أخضر', 'صحة'],
      size: { width: 856, height: 540 },
      createdAt: '2024-01-12',
      data: {
        shapes: [
          {
            id: '1',
            type: 'rect',
            position: { x: 0, y: 0 },
            size: { width: 856, height: 540 },
            fill: '#059669',
            stroke: 'transparent',
            strokeWidth: 0,
            visible: true,
            locked: false,
            zIndex: 1,
            rotation: 0
          }
        ],
        canvasSettings: {
          width: 856,
          height: 540,
          backgroundColor: '#059669'
        }
      }
    },
    {
      id: '4',
      name: 'بطاقة شركة إبداعية',
      description: 'تصميم إبداعي للشركات الناشئة والمبدعة',
      category: 'إبداعي',
      thumbnail: '/api/placeholder/300/200',
      featured: false,
      tags: ['إبداعي', 'ملون', 'حديث', 'شركة'],
      size: { width: 890, height: 510 },
      createdAt: '2024-01-08',
      data: {
        shapes: [
          {
            id: '1',
            type: 'rect',
            position: { x: 0, y: 0 },
            size: { width: 890, height: 510 },
            fill: '#7C3AED',
            stroke: 'transparent',
            strokeWidth: 0,
            visible: true,
            locked: false,
            zIndex: 1,
            rotation: 0
          }
        ],
        canvasSettings: {
          width: 890,
          height: 510,
          backgroundColor: '#7C3AED'
        }
      }
    },
    {
      id: '5',
      name: 'بطاقة عضوية نادي',
      description: 'تصميم رياضي لبطاقة عضوية النادي',
      category: 'رياضي',
      thumbnail: '/api/placeholder/300/200',
      featured: true,
      tags: ['رياضة', 'نادي', 'عضوية', 'برتقالي'],
      size: { width: 856, height: 540 },
      createdAt: '2024-01-14',
      data: {
        shapes: [
          {
            id: '1',
            type: 'rect',
            position: { x: 0, y: 0 },
            size: { width: 856, height: 540 },
            fill: '#EA580C',
            stroke: 'transparent',
            strokeWidth: 0,
            visible: true,
            locked: false,
            zIndex: 1,
            rotation: 0
          }
        ],
        canvasSettings: {
          width: 856,
          height: 540,
          backgroundColor: '#EA580C'
        }
      }
    },
    {
      id: '6',
      name: 'بطاقة هوية حكومية',
      description: 'تصميم رسمي للمؤسسات الحكومية',
      category: 'حكومي',
      thumbnail: '/api/placeholder/300/200',
      featured: false,
      tags: ['حكومي', 'رسمي', 'أزرق داكن', 'تقليدي'],
      size: { width: 856, height: 540 },
      createdAt: '2024-01-11',
      data: {
        shapes: [
          {
            id: '1',
            type: 'rect',
            position: { x: 0, y: 0 },
            size: { width: 856, height: 540 },
            fill: '#1E3A8A',
            stroke: 'transparent',
            strokeWidth: 0,
            visible: true,
            locked: false,
            zIndex: 1,
            rotation: 0
          }
        ],
        canvasSettings: {
          width: 856,
          height: 540,
          backgroundColor: '#1E3A8A'
        }
      }
    }
  ]

  const categories = [
    { id: 'all', name: 'الكل', icon: Zap },
    { id: 'مدرسي', name: 'مدرسي', icon: Plus },
    { id: 'أعمال', name: 'أعمال', icon: Star },
    { id: 'طبي', name: 'طبي', icon: Heart },
    { id: 'إبداعي', name: 'إبداعي', icon: Zap },
    { id: 'رياضي', name: 'رياضي', icon: Plus },
    { id: 'حكومي', name: 'حكومي', icon: Star }
  ]

  // Filter templates based on search and category
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const featuredTemplates = filteredTemplates.filter(t => t.featured)
  const recentTemplates = filteredTemplates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6)

  const toggleFavorite = (templateId: string) => {
    setFavoriteTemplates(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    )
  }

  const useTemplate = (template: Template) => {
    try {
      // Set canvas size
      setCanvasSize(template.size.width, template.size.height)
      
      // Load template data
      loadProject(JSON.stringify(template.data))
      
      onClose()
    } catch (error) {
      console.error('Error loading template:', error)
      alert('خطأ في تحميل القالب')
    }
  }

  const previewTemplateData = (template: Template) => {
    setPreviewTemplate(template)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">مكتبة القوالب</h2>
            <p className="text-gray-600">اختر من مجموعة واسعة من القوالب الجاهزة</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ابحث في القوالب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
                    selectedCategory === category.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <category.icon className="w-4 h-4" />
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Featured Templates */}
          {featuredTemplates.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-semibold text-gray-900">القوالب المميزة</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isFavorite={favoriteTemplates.includes(template.id)}
                    onToggleFavorite={toggleFavorite}
                    onUse={useTemplate}
                    onPreview={previewTemplateData}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Recent Templates */}
          {recentTemplates.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900">الأحدث</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isFavorite={favoriteTemplates.includes(template.id)}
                    onToggleFavorite={toggleFavorite}
                    onUse={useTemplate}
                    onPreview={previewTemplateData}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Templates */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              جميع القوالب ({filteredTemplates.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isFavorite={favoriteTemplates.includes(template.id)}
                  onToggleFavorite={toggleFavorite}
                  onUse={useTemplate}
                  onPreview={previewTemplateData}
                />
              ))}
            </div>
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد نتائج</h3>
              <p className="text-gray-600">جرب البحث بكلمات مختلفة أو تغيير الفئة</p>
            </div>
          )}
        </div>

        {/* Preview Modal */}
        {previewTemplate && (
          <TemplatePreview
            template={previewTemplate}
            onClose={() => setPreviewTemplate(null)}
            onUse={useTemplate}
          />
        )}
      </div>
    </div>
  )
}

// Template Card Component
interface TemplateCardProps {
  template: Template
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
  onUse: (template: Template) => void
  onPreview: (template: Template) => void
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isFavorite,
  onToggleFavorite,
  onUse,
  onPreview
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <span className="text-white font-medium">{template.name}</span>
        </div>
        
        {/* Overlay buttons */}
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={() => onPreview(template)}
            className="p-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            title="معاينة"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            onClick={() => onUse(template)}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="استخدام"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>

        {/* Favorite button */}
        <button
          onClick={() => onToggleFavorite(template.id)}
          className={`absolute top-2 right-2 p-2 rounded-lg transition-colors ${
            isFavorite ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Featured badge */}
        {template.featured && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
            مميز
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h4 className="font-semibold text-gray-900 mb-1">{template.name}</h4>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {template.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              {tag}
            </span>
          ))}
        </div>

        {/* Size info */}
        <div className="text-xs text-gray-500">
          {template.size.width}×{template.size.height} px
        </div>
      </div>
    </div>
  )
}

// Template Preview Component
interface TemplatePreviewProps {
  template: Template
  onClose: () => void
  onUse: (template: Template) => void
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template, onClose, onUse }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">{template.name}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Preview */}
          <div className="mb-6 bg-gray-100 rounded-lg p-8 flex items-center justify-center">
            <div 
              className="bg-white border-2 border-gray-300 shadow-lg"
              style={{
                width: Math.min(template.size.width / 2, 400),
                height: Math.min(template.size.height / 2, 250),
                aspectRatio: `${template.size.width}/${template.size.height}`
              }}
            >
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                معاينة القالب
              </div>
            </div>
          </div>

          {/* Template info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">الوصف</h4>
              <p className="text-gray-600 mb-4">{template.description}</p>
              
              <h4 className="font-semibold text-gray-900 mb-2">المعلومات</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>الفئة: {template.category}</li>
                <li>الحجم: {template.size.width}×{template.size.height} px</li>
                <li>تاريخ الإنشاء: {new Date(template.createdAt).toLocaleDateString('ar')}</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">العلامات</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                {template.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={() => onUse(template)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              استخدام هذا القالب
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TemplateLibrary
