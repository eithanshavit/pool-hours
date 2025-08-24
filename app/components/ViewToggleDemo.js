'use client';

import { useState } from 'react';
import ViewToggle from './ViewToggle';

export default function ViewToggleDemo() {
  const [currentView, setCurrentView] = useState('daily');

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">ViewToggle Component Demo</h1>
        
        <div className="flex justify-center mb-6">
          <ViewToggle 
            currentView={currentView} 
            onViewChange={setCurrentView} 
          />
        </div>
        
        <div className="text-center">
          <p className="text-lg">Current view: <span className="font-bold">{currentView}</span></p>
          <p className="text-sm text-gray-600 mt-2">
            Click the buttons or use keyboard navigation (Tab, Enter, Space, Arrow keys)
          </p>
        </div>
      </div>
    </div>
  );
}