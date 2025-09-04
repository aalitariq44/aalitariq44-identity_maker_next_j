'use client'

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text, 
  fullScreen = false 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4 border-2';
      case 'lg':
        return 'h-12 w-12 border-4';
      default:
        return 'h-8 w-8 border-2';
    }
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <div 
        className={`animate-spin rounded-full border-blue-600 border-t-transparent ${getSizeClasses()}`}
      />
      {text && (
        <p className="mt-4 text-gray-600 text-center">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
