'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { addMember, addMultipleMembers } from '@/lib/organizationService'
import { Member, MemberType } from '@/types/organization'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { 
  UserPlus, 
  Upload, 
  Download, 
  ArrowLeft, 
  Plus, 
  Trash2,
  School,
  Building2,
  Users,
  Save,
  FileSpreadsheet,
  Eye,
  EyeOff
} from 'lucide-react'

interface MemberFormData {
  firstName: string
  lastName: string
  firstNameEnglish: string
  lastNameEnglish: string
  dateOfBirth: string
  gender: 'male' | 'female'
  email: string
  phone: string
  address: string
  memberType: MemberType
  memberNumber: string
  nationalId: string
  
  // معلومات الطلاب
  grade: string
  className: string
  section: string
  studentId: string
  
  // معلومات الموظفين
  department: string
  position: string
  employeeId: string
  startDate: string
  
  // معلومات إضافية
  bloodType: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
}

export default function AddMembersPage() {
  const router = useRouter()
  const params = useParams()
  const orgId = params.id as string
  const { user, loading: authLoading } = useAuth()
  
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single')
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  const [singleMember, setSingleMember] = useState<MemberFormData>({
    firstName: '',
    lastName: '',
    firstNameEnglish: '',
    lastNameEnglish: '',
    dateOfBirth: '',
    gender: 'male',
    email: '',
    phone: '',
    address: '',
    memberType: 'student',
    memberNumber: '',
    nationalId: '',
    grade: '',
    className: '',
    section: '',
    studentId: '',
    department: '',
    position: '',
    employeeId: '',
    startDate: '',
    bloodType: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  })

  const [bulkMembers, setBulkMembers] = useState<MemberFormData[]>([])
  const [csvData, setCsvData] = useState('')

  const memberTypes = [
    { value: 'student', label: 'طالب', icon: School },
    { value: 'employee', label: 'موظف', icon: Building2 },
    { value: 'teacher', label: 'معلم', icon: Users },
    { value: 'manager', label: 'مدير', icon: Users },
    { value: 'other', label: 'أخرى', icon: Users }
  ]

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
      return
    }
  }, [user, authLoading])

  const handleSingleMemberChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (name.startsWith('emergencyContact.')) {
      const contactField = name.split('.')[1]
      setSingleMember(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [contactField]: value
        }
      }))
    } else {
      setSingleMember(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const memberData = {
        ...singleMember,
        organizationId: orgId,
        isActive: true
      }

      // إزالة الحقول الفارغة
      Object.keys(memberData).forEach(key => {
        if (memberData[key as keyof typeof memberData] === '') {
          delete memberData[key as keyof typeof memberData]
        }
      })

      const { id, error } = await addMember(memberData)
      
      if (error) {
        alert('خطأ في إضافة العضو: ' + error)
      } else {
        alert('تم إضافة العضو بنجاح!')
        router.push(`/organization/${orgId}/dashboard`)
      }
    } catch (error) {
      console.error('Error adding member:', error)
      alert('حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  const addBulkMember = () => {
    setBulkMembers(prev => [...prev, { ...singleMember }])
  }

  const removeBulkMember = (index: number) => {
    setBulkMembers(prev => prev.filter((_, i) => i !== index))
  }

  const updateBulkMember = (index: number, field: string, value: string) => {
    setBulkMembers(prev => 
      prev.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    )
  }

  const handleBulkSubmit = async () => {
    if (bulkMembers.length === 0) {
      alert('لا توجد أعضاء لإضافتها')
      return
    }

    setLoading(true)

    try {
      const membersData = bulkMembers.map(member => ({
        ...member,
        organizationId: orgId,
        isActive: true
      }))

      const { ids, error } = await addMultipleMembers(membersData)
      
      if (error) {
        alert('خطأ في إضافة الأعضاء: ' + error)
      } else {
        alert(`تم إضافة ${ids.length} عضو بنجاح!`)
        router.push(`/organization/${orgId}/dashboard`)
      }
    } catch (error) {
      console.error('Error adding members:', error)
      alert('حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const headers = [
      'firstName', 'lastName', 'dateOfBirth', 'gender', 'email', 'phone',
      'memberType', 'nationalId', 'grade', 'className', 'department', 'position'
    ]
    
    const csvContent = headers.join(',') + '\n' +
      'أحمد,محمد,2000-01-15,male,ahmed@example.com,0501234567,student,1234567890,الثالث الثانوي,أ,,,\n' +
      'فاطمة,أحمد,1995-05-20,female,fatima@example.com,0509876543,teacher,,,,التربية الرياضية,معلمة'

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'قالب_الأعضاء.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (authLoading) {
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
              onClick={() => router.push(`/organization/${orgId}/dashboard`)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">إضافة أعضاء جدد</h1>
              <p className="text-gray-600 mt-1">أضف أعضاء للمؤسسة بشكل فردي أو مجمع</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-200 bg-white rounded-t-2xl">
            <button
              onClick={() => setActiveTab('single')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'single'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:text-gray-800'
              }`}
            >
              <UserPlus className="w-5 h-5" />
              إضافة فردية
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'bulk'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:text-gray-800'
              }`}
            >
              <Upload className="w-5 h-5" />
              إضافة مجمعة
            </button>
          </div>
        </div>

        {/* Single Member Tab */}
        {activeTab === 'single' && (
          <div className="bg-white rounded-b-2xl rounded-tr-2xl shadow-lg p-8">
            <form onSubmit={handleSingleSubmit} className="space-y-8">
              {/* Member Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  نوع العضوية *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {memberTypes.map((type) => {
                    const IconComponent = type.icon
                    return (
                      <label
                        key={type.value}
                        className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          singleMember.memberType === type.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="memberType"
                          value={type.value}
                          checked={singleMember.memberType === type.value}
                          onChange={handleSingleMemberChange}
                          className="sr-only"
                        />
                        <IconComponent className="w-8 h-8 text-gray-600 mb-2" />
                        <span className="text-sm font-medium text-gray-700">{type.label}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  المعلومات الأساسية
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الاسم الأول *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={singleMember.firstName}
                      onChange={handleSingleMemberChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم العائلة *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={singleMember.lastName}
                      onChange={handleSingleMemberChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name (English)
                    </label>
                    <input
                      type="text"
                      name="firstNameEnglish"
                      value={singleMember.firstNameEnglish}
                      onChange={handleSingleMemberChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name (English)
                    </label>
                    <input
                      type="text"
                      name="lastNameEnglish"
                      value={singleMember.lastNameEnglish}
                      onChange={handleSingleMemberChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تاريخ الميلاد *
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={singleMember.dateOfBirth}
                      onChange={handleSingleMemberChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الجنس *
                    </label>
                    <select
                      name="gender"
                      value={singleMember.gender}
                      onChange={handleSingleMemberChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="male">ذكر</option>
                      <option value="female">أنثى</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم الهوية الوطنية
                    </label>
                    <input
                      type="text"
                      name="nationalId"
                      value={singleMember.nationalId}
                      onChange={handleSingleMemberChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم العضو (اتركه فارغاً للتوليد التلقائي)
                    </label>
                    <input
                      type="text"
                      name="memberNumber"
                      value={singleMember.memberNumber}
                      onChange={handleSingleMemberChange}
                      placeholder="سيتم التوليد تلقائياً"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  معلومات التواصل
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={singleMember.email}
                      onChange={handleSingleMemberChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={singleMember.phone}
                      onChange={handleSingleMemberChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      العنوان
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={singleMember.address}
                      onChange={handleSingleMemberChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Specific Information based on Member Type */}
              {singleMember.memberType === 'student' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    معلومات الطالب
                  </h3>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الصف
                      </label>
                      <input
                        type="text"
                        name="grade"
                        value={singleMember.grade}
                        onChange={handleSingleMemberChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="الثالث الثانوي"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الفصل
                      </label>
                      <input
                        type="text"
                        name="className"
                        value={singleMember.className}
                        onChange={handleSingleMemberChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="أ"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الشعبة
                      </label>
                      <input
                        type="text"
                        name="section"
                        value={singleMember.section}
                        onChange={handleSingleMemberChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        رقم الطالب الأكاديمي
                      </label>
                      <input
                        type="text"
                        name="studentId"
                        value={singleMember.studentId}
                        onChange={handleSingleMemberChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {(singleMember.memberType === 'employee' || singleMember.memberType === 'teacher' || singleMember.memberType === 'manager') && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    معلومات العمل
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        القسم
                      </label>
                      <input
                        type="text"
                        name="department"
                        value={singleMember.department}
                        onChange={handleSingleMemberChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        المنصب
                      </label>
                      <input
                        type="text"
                        name="position"
                        value={singleMember.position}
                        onChange={handleSingleMemberChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        رقم الموظف
                      </label>
                      <input
                        type="text"
                        name="employeeId"
                        value={singleMember.employeeId}
                        onChange={handleSingleMemberChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        تاريخ بداية العمل
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={singleMember.startDate}
                        onChange={handleSingleMemberChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Advanced Information */}
              <div className="space-y-6">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  {showAdvanced ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showAdvanced ? 'إخفاء' : 'إظهار'} المعلومات المتقدمة
                </button>

                {showAdvanced && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                      معلومات إضافية
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          فصيلة الدم
                        </label>
                        <select
                          name="bloodType"
                          value={singleMember.bloodType}
                          onChange={handleSingleMemberChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">اختر فصيلة الدم</option>
                          {bloodTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-800">جهة الاتصال في حالات الطوارئ</h4>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            الاسم
                          </label>
                          <input
                            type="text"
                            name="emergencyContact.name"
                            value={singleMember.emergencyContact.name}
                            onChange={handleSingleMemberChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            رقم الهاتف
                          </label>
                          <input
                            type="tel"
                            name="emergencyContact.phone"
                            value={singleMember.emergencyContact.phone}
                            onChange={handleSingleMemberChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            صلة القرابة
                          </label>
                          <input
                            type="text"
                            name="emergencyContact.relationship"
                            value={singleMember.emergencyContact.relationship}
                            onChange={handleSingleMemberChange}
                            placeholder="والد، أم، أخ..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <LoadingSpinner />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      حفظ العضو
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => router.push(`/organization/${orgId}/dashboard`)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Bulk Members Tab */}
        {activeTab === 'bulk' && (
          <div className="bg-white rounded-b-2xl rounded-tr-2xl shadow-lg p-8 space-y-8">
            {/* Instructions */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">إرشادات الإضافة المجمعة</h3>
              <ul className="text-sm text-blue-700 space-y-2">
                <li>• يمكنك إضافة أعضاء متعددين باستخدام النموذج أدناه</li>
                <li>• أو تحميل ملف CSV بالبيانات</li>
                <li>• تأكد من إدخال البيانات المطلوبة لكل عضو</li>
                <li>• يمكن ترك بعض الحقول فارغة حسب نوع العضوية</li>
              </ul>
            </div>

            {/* CSV Upload Section */}
            <div className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">رفع ملف CSV</h3>
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  تحميل قالب CSV
                </button>
              </div>
              
              <div className="space-y-4">
                <input
                  type="file"
                  accept=".csv"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <Upload className="w-4 h-4 inline ml-2" />
                  رفع الملف
                </button>
              </div>
            </div>

            {/* Manual Bulk Addition */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">إضافة يدوية مجمعة</h3>
                <button
                  onClick={addBulkMember}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  إضافة عضو
                </button>
              </div>

              {bulkMembers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p>لم تتم إضافة أي أعضاء بعد</p>
                  <p>انقر على "إضافة عضو" لبدء الإضافة</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bulkMembers.map((member, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-800">عضو #{index + 1}</h4>
                        <button
                          onClick={() => removeBulkMember(index)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid md:grid-cols-4 gap-4">
                        <input
                          type="text"
                          placeholder="الاسم الأول"
                          value={member.firstName}
                          onChange={(e) => updateBulkMember(index, 'firstName', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          placeholder="اسم العائلة"
                          value={member.lastName}
                          onChange={(e) => updateBulkMember(index, 'lastName', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="date"
                          value={member.dateOfBirth}
                          onChange={(e) => updateBulkMember(index, 'dateOfBirth', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <select
                          value={member.memberType}
                          onChange={(e) => updateBulkMember(index, 'memberType', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {memberTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex gap-4 pt-6">
                    <button
                      onClick={handleBulkSubmit}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <LoadingSpinner />
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          حفظ جميع الأعضاء ({bulkMembers.length})
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
