'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/common/Navbar'
import { CreditCard, Palette, Download, FileText, Sparkles, ArrowLeft } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()

  // Temporary redirect for development - remove this when done
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedHome')
    if (!hasVisited) {
      localStorage.setItem('hasVisitedHome', 'true')
      router.push('/editor')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h2 className="text-5xl font-bold text-gray-800 mb-6 leading-tight">
            صمم هويتك بسهولة
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              واحترافية
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            أداة تصميم متقدمة لإنشاء بطاقات الهوية والبطاقات التعريفية بتقنيات حديثة.
            صمم، عدّل، وصدّر بطاقاتك بصيغ مختلفة بكل سهولة.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/editor"
              className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 hover:scale-105"
            >
              ابدأ التصميم الآن
              <ArrowLeft className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-300">
              شاهد الأمثلة
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Feature 1 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <Palette className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">تصميم متقدم</h3>
            <p className="text-gray-600 leading-relaxed">
              أدوات تصميم احترافية مع إمكانية إضافة النصوص، الأشكال، والصور. تحكم كامل في الألوان والخطوط.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
              <CreditCard className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">أحجام متعددة</h3>
            <p className="text-gray-600 leading-relaxed">
              دعم لأحجام مختلفة من البطاقات: بطاقة ماستركارد، هوية مدرسية، بطاقة أعمال، وأحجام مخصصة.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
              <Download className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">تصدير متنوع</h3>
            <p className="text-gray-600 leading-relaxed">
              صدّر تصميمك بصيغ مختلفة: PNG، JPG، PDF. جودة عالية مع إمكانية التحكم في الدقة.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
            <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center mb-6">
              <FileText className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">حفظ المشاريع</h3>
            <p className="text-gray-600 leading-relaxed">
              احفظ مشاريعك وأعد تحريرها لاحقاً. نظام حفظ ذكي يحفظ كل التفاصيل والإعدادات.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
            <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">سهولة الاستخدام</h3>
            <p className="text-gray-600 leading-relaxed">
              واجهة مستخدم بديهية وسهلة. سحب وإفلات، تحرير مباشر، وأدوات تحكم دقيقة.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
            <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
              <CreditCard className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">معاينة فورية</h3>
            <p className="text-gray-600 leading-relaxed">
              شاهد تصميمك يتطور أمام عينيك. معاينة فورية لكل التغييرات والتعديلات.
            </p>
          </div>
        </div>

        {/* Card Size Examples */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-16">
          <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">أحجام البطاقات المدعومة</h3>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 mb-4 text-white aspect-[1.6/1] flex items-center justify-center">
                <div>
                  <CreditCard className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">ماستركارد</p>
                </div>
              </div>
              <p className="font-medium text-gray-800">بطاقة ماستركارد</p>
              <p className="text-sm text-gray-600">85.60 × 53.98 ملم</p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 mb-4 text-white aspect-[1.6/1] flex items-center justify-center">
                <div>
                  <FileText className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">هوية مدرسية</p>
                </div>
              </div>
              <p className="font-medium text-gray-800">بطاقة هوية مدرسية</p>
              <p className="text-sm text-gray-600">90 × 56 ملم</p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 mb-4 text-white aspect-[1.6/1] flex items-center justify-center">
                <div>
                  <CreditCard className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">بطاقة أعمال</p>
                </div>
              </div>
              <p className="font-medium text-gray-800">بطاقة أعمال</p>
              <p className="text-sm text-gray-600">89 × 51 ملم</p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 mb-4 text-white aspect-[1.6/1] flex items-center justify-center">
                <div>
                  <Sparkles className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">حجم مخصص</p>
                </div>
              </div>
              <p className="font-medium text-gray-800">بطاقة مخصصة</p>
              <p className="text-sm text-gray-600">حجم قابل للتخصيص</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
          <h3 className="text-3xl font-bold mb-4">جاهز لبدء التصميم؟</h3>
          <p className="text-xl mb-8 opacity-90">
            ابدأ في إنشاء بطاقة هويتك الآن بأدوات احترافية وسهلة الاستخدام
          </p>
          
          <Link
            href="/editor"
            className="inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            ابدأ التصميم الآن
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-700 font-medium">مصمم الهويات</span>
            </div>
            <p className="text-gray-600 text-sm">
              © 2025 جميع الحقوق محفوظة. تم بناؤه بـ Next.js 14
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
