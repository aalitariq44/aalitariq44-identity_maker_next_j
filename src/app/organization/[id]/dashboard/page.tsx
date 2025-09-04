'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { 
  getOrganizationStats,
  getOrganizationMembers,
  getOrganizationTemplates 
} from '@/lib/organizationService'
import { OrganizationStats, Member, CardTemplate } from '@/types/organization'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { 
  Users, 
  FileText, 
  BarChart3, 
  UserPlus, 
  ArrowLeft,
  School,
  Building2,
  Download,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Eye
} from 'lucide-react'

export default function OrganizationDashboard() {
  const router = useRouter()
  const params = useParams()
  const orgId = params.id as string
  const { user, loading: authLoading } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<OrganizationStats | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [templates, setTemplates] = useState<CardTemplate[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'templates' | 'batch'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [memberTypeFilter, setMemberTypeFilter] = useState<string>('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
      return
    }

    if (user && orgId) {
      loadDashboardData()
    }
  }, [user, authLoading, orgId])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // تحميل الإحصائيات
      const { stats, error: statsError } = await getOrganizationStats(orgId)
      if (statsError) {
        console.error('Error loading stats:', statsError)
        if (statsError.includes('صلاحية')) {
          router.push('/organization/setup')
          return
        }
      } else {
        setStats(stats)
      }

      // تحميل الأعضاء
      const { members, error: membersError } = await getOrganizationMembers(orgId)
      if (!membersError) {
        setMembers(members)
      }

      // تحميل القوالب
      const { templates, error: templatesError } = await getOrganizationTemplates(orgId)
      if (!templatesError) {
        setTemplates(templates)
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.memberNumber.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = memberTypeFilter === '' || member.memberType === memberTypeFilter
    
    return matchesSearch && matchesType
  })

  const memberTypes = [
    { value: 'student', label: 'الطلاب', icon: School },
    { value: 'employee', label: 'الموظفون', icon: Building2 },
    { value: 'teacher', label: 'المعلمون', icon: Users },
    { value: 'manager', label: 'المديرون', icon: Users },
    { value: 'other', label: 'أخرى', icon: Users }
  ]

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/organization/setup')}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">لوحة تحكم المؤسسة</h1>
                <p className="text-gray-600">إدارة الأعضاء والقوالب والهويات</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`/organization/${orgId}/members/add`)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                إضافة أعضاء
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-1 mt-6 border-b border-gray-200">
            {[
              { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
              { id: 'members', label: 'الأعضاء', icon: Users },
              { id: 'templates', label: 'القوالب', icon: FileText },
              { id: 'batch', label: 'الإنتاج المجمع', icon: Download }
            ].map((tab) => {
              const IconComponent = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-600 border-transparent hover:text-gray-800 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">إجمالي الأعضاء</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.totalMembers}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">الأعضاء النشطون</p>
                    <p className="text-3xl font-bold text-green-600">{stats.activeMembers}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">القوالب المتاحة</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.totalTemplates}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">دفعات الإنتاج</p>
                    <p className="text-3xl font-bold text-orange-600">{stats.totalBatches}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Download className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Members by Type Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">توزيع الأعضاء حسب النوع</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(stats.membersByType).map(([type, count]) => {
                  const memberType = memberTypes.find(t => t.value === type)
                  if (!memberType || count === 0) return null
                  
                  const percentage = (count / stats.totalMembers) * 100
                  
                  return (
                    <div key={type} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                        <memberType.icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{memberType.label}</span>
                          <span className="text-sm text-gray-600">{count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">إجراءات سريعة</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => router.push(`/organization/${orgId}/members/add`)}
                  className="p-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-center"
                >
                  <UserPlus className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <p className="font-medium text-gray-800">إضافة أعضاء</p>
                  <p className="text-sm text-gray-600">إضافة أعضاء جدد للمؤسسة</p>
                </button>

                <button
                  onClick={() => router.push(`/organization/${orgId}/templates/create`)}
                  className="p-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-center"
                >
                  <Plus className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <p className="font-medium text-gray-800">إنشاء قالب</p>
                  <p className="text-sm text-gray-600">تصميم قالب هوية جديد</p>
                </button>

                <button
                  onClick={() => setActiveTab('batch')}
                  className="p-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-center"
                >
                  <Download className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <p className="font-medium text-gray-800">إنتاج مجمع</p>
                  <p className="text-sm text-gray-600">إنتاج هويات لفريق كامل</p>
                </button>

                <button
                  onClick={() => setActiveTab('members')}
                  className="p-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-center"
                >
                  <Eye className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                  <p className="font-medium text-gray-800">عرض الأعضاء</p>
                  <p className="text-sm text-gray-600">إدارة قائمة الأعضاء</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="البحث في الأعضاء..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <Filter className="text-gray-400 w-5 h-5" />
                  <select
                    value={memberTypeFilter}
                    onChange={(e) => setMemberTypeFilter(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">جميع الأنواع</option>
                    {memberTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Members List */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800">
                    قائمة الأعضاء ({filteredMembers.length})
                  </h3>
                  <button
                    onClick={() => router.push(`/organization/${orgId}/members/add`)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                  >
                    <UserPlus className="w-5 h-5" />
                    إضافة عضو
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">الاسم</th>
                      <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">رقم العضو</th>
                      <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">النوع</th>
                      <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">معلومات إضافية</th>
                      <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">الحالة</th>
                      <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                              {member.firstName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">
                                {member.firstName} {member.lastName}
                              </p>
                              {member.email && (
                                <p className="text-sm text-gray-600">{member.email}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {member.memberNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {memberTypes.find(t => t.value === member.memberType)?.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {member.memberType === 'student' && member.grade && (
                            <p>الصف: {member.grade}</p>
                          )}
                          {member.memberType === 'employee' && member.department && (
                            <p>القسم: {member.department}</p>
                          )}
                          {member.phone && <p>الهاتف: {member.phone}</p>}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            member.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {member.isActive ? 'نشط' : 'غير نشط'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => router.push(`/organization/${orgId}/members/${member.id}/edit`)}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {/* حذف العضو */}}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredMembers.length === 0 && (
                <div className="p-12 text-center">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">لا توجد أعضاء</h3>
                  <p className="text-gray-600 mb-6">ابدأ بإضافة أعضاء جدد للمؤسسة</p>
                  <button
                    onClick={() => router.push(`/organization/${orgId}/members/add`)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto"
                  >
                    <UserPlus className="w-5 h-5" />
                    إضافة أول عضو
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">قوالب الهويات</h3>
                <button
                  onClick={() => router.push(`/organization/${orgId}/templates/create`)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  إنشاء قالب جديد
                </button>
              </div>
            </div>

            {templates.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">لا توجد قوالب</h3>
                <p className="text-gray-600 mb-6">ابدأ بإنشاء قالب هوية للمؤسسة</p>
                <button
                  onClick={() => router.push(`/organization/${orgId}/templates/create`)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  إنشاء أول قالب
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <div key={template.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    {template.thumbnail && (
                      <div className="aspect-video bg-gray-100">
                        <img
                          src={template.thumbnail}
                          alt={template.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h4 className="font-bold text-gray-800 mb-2">{template.name}</h4>
                      {template.description && (
                        <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {memberTypes.find(t => t.value === template.memberType)?.label}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => router.push(`/organization/${orgId}/templates/${template.id}/edit`)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Batch Production Tab */}
        {activeTab === 'batch' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <Download className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">الإنتاج المجمع</h3>
            <p className="text-gray-600 mb-6">إنتاج هويات لمجموعة من الأعضاء دفعة واحدة</p>
            <button
              onClick={() => router.push(`/organization/${orgId}/batch/create`)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto"
            >
              <Download className="w-5 h-5" />
              بدء إنتاج مجمع
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
