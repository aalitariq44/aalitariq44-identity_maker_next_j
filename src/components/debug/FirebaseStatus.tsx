'use client'

import React, { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';

interface FirebaseStatusProps {
  onClose: () => void;
}

const FirebaseStatus: React.FC<FirebaseStatusProps> = ({ onClose }) => {
  const [status, setStatus] = useState({
    auth: 'checking...',
    firestore: 'checking...',
    config: 'checking...'
  });

  useEffect(() => {
    checkFirebaseStatus();
  }, []);

  const checkFirebaseStatus = async () => {
    // فحص تكوين Firebase
    const config = auth.app.options;
    let configStatus = 'جيد';
    
    if (!config.apiKey || config.apiKey === 'your-api-key') {
      configStatus = 'خطأ: مفتاح API غير صحيح';
    } else if (!config.authDomain) {
      configStatus = 'خطأ: نطاق المصادقة مفقود';
    } else if (!config.projectId) {
      configStatus = 'خطأ: معرف المشروع مفقود';
    }

    // فحص Authentication
    let authStatus = 'متصل';
    try {
      // محاولة الحصول على المستخدم الحالي
      const currentUser = auth.currentUser;
      authStatus = currentUser ? `متصل - مستخدم: ${currentUser.email}` : 'متصل - لا يوجد مستخدم';
    } catch (error) {
      authStatus = `خطأ في الاتصال: ${error}`;
    }

    // فحص Firestore
    let firestoreStatus = 'متصل';
    try {
      // محاولة بسيطة للاتصال
      await db.app;
      firestoreStatus = 'متصل بنجاح';
    } catch (error) {
      firestoreStatus = `خطأ في الاتصال: ${error}`;
    }

    setStatus({
      config: configStatus,
      auth: authStatus,
      firestore: firestoreStatus
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">حالة Firebase</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition duration-200"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* تكوين Firebase */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">تكوين Firebase</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">API Key:</span>
                  <span className="ml-2 text-gray-600">
                    {auth.app.options.apiKey ? '✅ موجود' : '❌ مفقود'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Auth Domain:</span>
                  <span className="ml-2 text-gray-600">
                    {auth.app.options.authDomain || 'غير محدد'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Project ID:</span>
                  <span className="ml-2 text-gray-600">
                    {auth.app.options.projectId || 'غير محدد'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Storage Bucket:</span>
                  <span className="ml-2 text-gray-600">
                    {auth.app.options.storageBucket || 'غير محدد'}
                  </span>
                </div>
              </div>
              <div className={`mt-3 p-2 rounded ${
                status.config === 'جيد' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                الحالة: {status.config}
              </div>
            </div>
          </div>

          {/* Authentication */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Firebase Authentication</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className={`p-2 rounded ${
                status.auth.includes('خطأ') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}>
                الحالة: {status.auth}
              </div>
            </div>
          </div>

          {/* Firestore */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Firestore Database</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className={`p-2 rounded ${
                status.firestore.includes('خطأ') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}>
                الحالة: {status.firestore}
              </div>
            </div>
          </div>

          {/* إرشادات الإصلاح */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">خطوات الإصلاح</h3>
            <div className="bg-blue-50 rounded-lg p-4 text-sm">
              <ol className="list-decimal list-inside space-y-2">
                <li>تأكد من إنشاء مشروع Firebase في <a href="https://console.firebase.google.com" target="_blank" className="text-blue-600 underline">Firebase Console</a></li>
                <li>فعّل Authentication في المشروع (Email/Password + Google)</li>
                <li>أنشئ Firestore Database</li>
                <li>انسخ معلومات التكوين الصحيحة إلى <code className="bg-gray-200 px-1 rounded">src/lib/firebase.ts</code></li>
                <li>أضف النطاق <code className="bg-gray-200 px-1 rounded">localhost:3001</code> إلى Authorized domains في Firebase</li>
              </ol>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseStatus;
