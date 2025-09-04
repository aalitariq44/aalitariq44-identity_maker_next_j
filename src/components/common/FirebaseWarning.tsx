'use client'

import React, { useState } from 'react';
import { AlertTriangle, X, Settings } from 'lucide-react';

const FirebaseWarning = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 max-w-md bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg z-50">
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="mr-3 flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              تحذير: Firebase غير مُعد
            </h3>
            <p className="mt-1 text-sm text-yellow-700">
              يبدو أن Firebase Authentication غير مُعد بشكل صحيح. يرجى:
            </p>
            <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
              <li>إنشاء مشروع Firebase</li>
              <li>تفعيل Authentication</li>
              <li>نسخ معلومات التكوين</li>
            </ul>
            <div className="mt-3 flex space-x-2">
              <a
                href="https://console.firebase.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1 text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded border border-yellow-300 transition duration-200"
              >
                <Settings className="w-3 h-3 mr-1" />
                Firebase Console
              </a>
            </div>
          </div>
          <div className="flex-shrink-0 mr-1.5">
            <button
              onClick={() => setIsVisible(false)}
              className="inline-flex rounded-md bg-yellow-50 p-1.5 text-yellow-500 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 focus:ring-offset-yellow-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseWarning;
