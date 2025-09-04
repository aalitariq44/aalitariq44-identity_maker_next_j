'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, Save, FolderOpen, Settings, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { logOut } from '@/lib/auth';
import SaveDesignModal from '../editor/SaveDesignModal';

interface NavbarProps {
  showSaveButton?: boolean;
  showOpenButton?: boolean;
  onSave?: () => void;
  onOpen?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  showSaveButton = false, 
  showOpenButton = false,
  onSave,
  onOpen 
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    const result = await logOut();
    if (!result.error) {
      router.push('/');
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave();
    } else {
      setShowSaveModal(true);
    }
  };

  if (loading) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="animate-pulse bg-gray-200 h-8 w-8 rounded-full"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* اليسار - الشعار والروابط */}
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="text-xl font-bold text-blue-600 hover:text-blue-700 transition duration-200"
              >
                Identity Maker
              </button>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8 mr-8">
                <button
                  onClick={() => router.push('/editor')}
                  className="text-gray-700 hover:text-blue-600 transition duration-200"
                >
                  المحرر
                </button>
                
                {user && (
                  <button
                    onClick={() => router.push('/my-designs')}
                    className="text-gray-700 hover:text-blue-600 transition duration-200"
                  >
                    تصاميمي
                  </button>
                )}
              </div>
            </div>

            {/* الوسط - أزرار المحرر */}
            {(showSaveButton || showOpenButton) && (
              <div className="flex items-center space-x-4">
                {showOpenButton && (
                  <button
                    onClick={onOpen}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition duration-200"
                  >
                    <FolderOpen size={16} />
                    <span className="hidden sm:inline">فتح</span>
                  </button>
                )}
                
                {showSaveButton && user && (
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition duration-200"
                  >
                    <Save size={16} />
                    <span className="hidden sm:inline">حفظ</span>
                  </button>
                )}
              </div>
            )}

            {/* اليمين - قائمة المستخدم */}
            <div className="flex items-center">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 focus:outline-none"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                    <span className="hidden md:block">{user.displayName || user.email}</span>
                  </button>

                  {/* قائمة المستخدم المنسدلة */}
                  {showUserMenu && (
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-medium text-gray-900">
                          {user.displayName || 'مستخدم'}
                        </p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      
                      <button
                        onClick={() => {
                          router.push('/my-designs');
                          setShowUserMenu(false);
                        }}
                        className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        تصاميمي
                      </button>
                      
                      <button
                        onClick={() => {
                          router.push('/settings');
                          setShowUserMenu(false);
                        }}
                        className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <div className="flex items-center space-x-2">
                          <Settings size={16} />
                          <span>الإعدادات</span>
                        </div>
                      </button>
                      
                      <hr className="my-1" />
                      
                      <button
                        onClick={handleLogout}
                        className="block w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <div className="flex items-center space-x-2">
                          <LogOut size={16} />
                          <span>تسجيل الخروج</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => router.push('/auth')}
                    className="text-gray-700 hover:text-blue-600 transition duration-200"
                  >
                    تسجيل الدخول
                  </button>
                  <button
                    onClick={() => router.push('/auth')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
                  >
                    إنشاء حساب
                  </button>
                </div>
              )}

              {/* زر القائمة المحمولة */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden mr-4 p-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* قائمة الجوال */}
          {showMobileMenu && (
            <div className="md:hidden border-t py-4">
              <div className="space-y-2">
                <button
                  onClick={() => {
                    router.push('/editor');
                    setShowMobileMenu(false);
                  }}
                  className="block w-full text-right px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  المحرر
                </button>
                
                {user && (
                  <button
                    onClick={() => {
                      router.push('/my-designs');
                      setShowMobileMenu(false);
                    }}
                    className="block w-full text-right px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    تصاميمي
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* مودال الحفظ */}
      <SaveDesignModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
      />
    </>
  );
};

export default Navbar;
