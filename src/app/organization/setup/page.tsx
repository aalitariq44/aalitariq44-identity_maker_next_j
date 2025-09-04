'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createOrganization, getUserOrganizations, updateOrganization } from '@/lib/organizationService'
import { Organization, OrganizationType } from '@/types/organization'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { 
  Building2, 
  School, 
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Save,
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  FileText,
  BarChart3
} from 'lucide-react'

export default function OrganizationSetupPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null)
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    nameEnglish: '',
    type: 'school' as OrganizationType,
    address: '',
    city: '',
    country: 'السعودية',
    phone: '',
    email: '',
    website: '',
    description: '',
    establishedYear: new Date().getFullYear()
  })

  const organizationTypes = [
    { value: 'school', label: 'مدرسة', icon: School },
    { value: 'company', label: 'شركة', icon: Building2 },
    { value: 'government', label: 'جهة حكومية', icon: Building2 },
    { value: 'nonprofit', label: 'منظمة غير ربحية', icon: Users },
    { value: 'other', label: 'أخرى', icon: Globe }
  ]

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
      return
    }

    if (user) {
      loadOrganizations()
    }
  }, [user, authLoading])

  const loadOrganizations = async () => {
    setLoading(true)
    try {
      const { organizations, error } = await getUserOrganizations()
      if (error) {
        console.error('Error loading organizations:', error)
      } else {
        setOrganizations(organizations)
        if (organizations.length === 0) {
          setShowForm(true)
        }
      }
    } catch (error) {
      console.error('Error loading organizations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (editingOrg) {
        // تحديث المؤسسة
        const { error } = await updateOrganization(editingOrg.id!, formData)
        if (error) {
          alert('خطأ في تحديث المؤسسة: ' + error)
        } else {
          alert('تم تحديث المؤسسة بنجاح!')
          setEditingOrg(null)
          loadOrganizations()
          resetForm()
        }
      } else {
        // إنشاء مؤسسة جديدة
        const { id, error } = await createOrganization(formData)
        if (error) {
          alert('خطأ في إنشاء المؤسسة: ' + error)
        } else {
          alert('تم إنشاء المؤسسة بنجاح!')
          loadOrganizations()
          resetForm()
        }
      }
    } catch (error) {
      console.error('Error saving organization:', error)
      alert('حدث خطأ غير متوقع')
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      nameEnglish: '',
      type: 'school',
      address: '',
      city: '',
      country: 'السعودية',
      phone: '',
      email: '',
      website: '',
      description: '',
      establishedYear: new Date().getFullYear()
    })
    setShowForm(false)
    setEditingOrg(null)
  }

  const handleEdit = (org: Organization) => {
    setEditingOrg(org)
    setFormData({
      name: org.name,
      nameEnglish: org.nameEnglish || '',
      type: org.type,
      address: org.address,
      city: org.city,
      country: org.country,
      phone: org.phone,
      email: org.email,
      website: org.website || '',
      description: org.description || '',
      establishedYear: org.establishedYear || new Date().getFullYear()
    })
    setShowForm(true)
  }

  const handleSelectOrganization = (orgId: string) => {
    router.push(`/organization/${orgId}/dashboard`)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/editor')}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">إدارة المؤسسات</h1>
              <p className="text-gray-600 mt-1">أنشئ وأدر معلومات مؤسستك وفريقك</p>
            </div>
          </div>
        </div>

        {/* إذا لم توجد مؤسسات أو إظهار النموذج */}
        {(organizations.length === 0 || showForm) && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingOrg ? 'تعديل بيانات المؤسسة' : 'إعداد مؤسستك'}
              </h2>
              {organizations.length > 0 && (
                <button
                  onClick={resetForm}
                  className="text-gray-600 hover:text-gray-800"
                >
                  إلغاء
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* نوع المؤسسة */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  نوع المؤسسة *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {organizationTypes.map((type) => {
                    const IconComponent = type.icon
                    return (
                      <label
                        key={type.value}
                        className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          formData.type === type.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="type"
                          value={type.value}
                          checked={formData.type === type.value}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <IconComponent className="w-8 h-8 text-gray-600 mb-2" />
                        <span className="text-sm font-medium text-gray-700">{type.label}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* معلومات أساسية */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم المؤسسة *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أدخل اسم المؤسسة"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم بالإنجليزية
                  </label>
                  <input
                    type="text"
                    name="nameEnglish"
                    value={formData.nameEnglish}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Organization Name"
                  />
                </div>
              </div>

              {/* معلومات التواصل */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline ml-1" />
                    رقم الهاتف *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+966 5X XXX XXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline ml-1" />
                    البريد الإلكتروني *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="info@organization.com"
                  />
                </div>
              </div>

              {/* الموقع */}
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline ml-1" />
                    العنوان *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="العنوان التفصيلي"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المدينة *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="الرياض"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الدولة *
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* معلومات إضافية */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe className="w-4 h-4 inline ml-1" />
                    الموقع الإلكتروني
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://www.organization.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline ml-1" />
                    سنة التأسيس
                  </label>
                  <input
                    type="number"
                    name="establishedYear"
                    value={formData.establishedYear}
                    onChange={handleInputChange}
                    min="1900"
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* وصف المؤسسة */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وصف المؤسسة
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="وصف مختصر عن المؤسسة وأنشطتها..."
                />
              </div>

              {/* أزرار العمل */}
              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <LoadingSpinner />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {editingOrg ? 'تحديث المؤسسة' : 'حفظ المؤسسة'}
                    </>
                  )}
                </button>
                
                {organizations.length > 0 && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    إلغاء
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* قائمة المؤسسات */}
        {organizations.length > 0 && !showForm && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">مؤسساتك</h2>
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              >
                <Building2 className="w-5 h-5" />
                إضافة مؤسسة جديدة
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizations.map((org) => {
                const OrgTypeIcon = organizationTypes.find(t => t.value === org.type)?.icon || Building2
                
                return (
                  <div
                    key={org.id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <OrgTypeIcon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800 text-lg">{org.name}</h3>
                            <p className="text-sm text-gray-600">
                              {organizationTypes.find(t => t.value === org.type)?.label}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleEdit(org)}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600 mb-6">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{org.city}, {org.country}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{org.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>{org.email}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSelectOrganization(org.id!)}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <BarChart3 className="w-5 h-5" />
                        إدارة المؤسسة
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
