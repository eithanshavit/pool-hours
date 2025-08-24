'use client';

import { useState } from 'react';

/**
 * ViewToggle component for switching between daily and weekly views
 * 
 * @param {Object} props
 * @param {'daily' | 'weekly'} props.currentView - The currently active view
 * @param {Function} props.onViewChange - Callback function when view changes
 * @returns {JSX.Element}
 */
export default function ViewToggle({ currentView, onViewChange }) {
  const [focusedButton, setFocusedButton] = useState(null);

  const handleViewChange = (view) => {
    if (view !== currentView) {
      onViewChange(view);
    }
  };

  const handleKeyDown = (event, view) => {
    // Handle keyboard navigation
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleViewChange(view);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const newView = view === 'daily' ? 'weekly' : 'daily';
      handleViewChange(newView);
      // Focus the other button
      const otherButton = event.target.parentElement.querySelector(
        `button[data-view="${newView}"]`
      );
      if (otherButton) {
        otherButton.focus();
      }
    }
  };

  const getButtonClasses = (view) => {
    const isActive = currentView === view;
    const isFocused = focusedButton === view;
    
    return `
      px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      ${isActive 
        ? 'bg-white text-gray-900 shadow-sm' 
        : 'bg-white bg-opacity-20 text-gray-700 hover:bg-opacity-30'
      }
      ${isFocused ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
    `.trim();
  };

  return (
    <div 
      className="inline-flex bg-gray-200 rounded-xl p-1 shadow-sm"
      role="tablist"
      aria-label="View toggle"
    >
      <button
        type="button"
        data-view="daily"
        className={getButtonClasses('daily')}
        onClick={() => handleViewChange('daily')}
        onKeyDown={(e) => handleKeyDown(e, 'daily')}
        onFocus={() => setFocusedButton('daily')}
        onBlur={() => setFocusedButton(null)}
        role="tab"
        aria-selected={currentView === 'daily'}
        aria-controls="daily-view"
        tabIndex={currentView === 'daily' ? 0 : -1}
      >
        Daily
      </button>
      <button
        type="button"
        data-view="weekly"
        className={getButtonClasses('weekly')}
        onClick={() => handleViewChange('weekly')}
        onKeyDown={(e) => handleKeyDown(e, 'weekly')}
        onFocus={() => setFocusedButton('weekly')}
        onBlur={() => setFocusedButton(null)}
        role="tab"
        aria-selected={currentView === 'weekly'}
        aria-controls="weekly-view"
        tabIndex={currentView === 'weekly' ? 0 : -1}
      >
        Weekly
      </button>
    </div>
  );
}