import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Star, Heart, Image } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getHebrewDateInfo, isHebrewScheduleActive } from '../utils/hebrewCalendar';

export function OccasionSelection() {
  const { state, dispatch } = useApp();
  const { occasions } = state;
  const navigate = useNavigate();

  const handleOccasionSelect = (occasion: string) => {
    dispatch({ type: 'SET_SELECTED_OCCASION', payload: occasion });
    navigate('/ordering-method');
  };

  // Filter occasions for storefront display with enhanced logic
  const getVisibleOccasions = () => {
    const currentDate = new Date();
    
    return occasions
      .filter(occasion => {
        // Check manual override first
        if (occasion.manualOverride?.isActive) {
          const overrideUntil = occasion.manualOverride.overrideUntil ? new Date(occasion.manualOverride.overrideUntil) : null;
          if (!overrideUntil || currentDate <= overrideUntil) {
            if (occasion.manualOverride.forceVisible) return true;
            if (occasion.manualOverride.forceHidden) return false;
          }
        }
        
        // Check if occasion is set to be visible on storefront
        if (!occasion.isVisibleOnStorefront) return false;
        
        // Check scheduled visibility
        if (occasion.scheduledVisibility?.isScheduled) {
          // Check Hebrew calendar schedule first
          if (occasion.scheduledVisibility.hebrewSchedule?.useHebrewCalendar) {
            return isHebrewScheduleActive(occasion.scheduledVisibility.hebrewSchedule, currentDate);
          }
          
          // Check Gregorian calendar schedule
          const startDate = occasion.scheduledVisibility.startDate ? new Date(occasion.scheduledVisibility.startDate) : null;
          const endDate = occasion.scheduledVisibility.endDate ? new Date(occasion.scheduledVisibility.endDate) : null;
          
          if (startDate && currentDate < startDate) return false;
          if (endDate && currentDate > endDate) return false;
        }
        
        return true;
      })
      .sort((a, b) => a.displayOrder - b.displayOrder);
  };

  const visibleOccasions = getVisibleOccasions();

  const getOccasionColor = (occasion: any) => {
    return occasion.color || '#0d9488';
  };

  // Get current Hebrew date info for display
  const currentHebrewInfo = getHebrewDateInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-brand-teal via-primary-600 to-brand-lime text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">YH Pecklech</h1>
          <p className="text-2xl text-primary-100 max-w-3xl mx-auto mb-4 font-medium">
            For Any Occasion, To Suit Every Budget
          </p>
          <p className="text-lg text-primary-200 max-w-2xl mx-auto mb-4">
            Start by selecting the occasion for your Pecklech order
          </p>
          
          {/* Current Date Display */}
          <div className="bg-white bg-opacity-20 rounded-xl p-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div><strong>Today:</strong> {currentHebrewInfo.dayOfWeek}, {new Date().toLocaleDateString('en-GB')}</div>
              <div><strong>Hebrew:</strong> {currentHebrewInfo.hebrewDate}</div>
              <div><strong>Parsha:</strong> {currentHebrewInfo.parsha}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Select Your Occasion</h2>
          <p className="text-lg text-gray-600">Choose the occasion you're celebrating to see our tailored Pecklech options</p>
        </div>

        {/* Occasions Grid - All occasions in one grid */}
        {visibleOccasions.length > 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
              {visibleOccasions.map((occasion) => (
                <button
                  key={occasion.id}
                  onClick={() => handleOccasionSelect(occasion.name)}
                  className="group bg-white rounded-2xl border-4 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1 overflow-hidden"
                  style={{
                    borderColor: getOccasionColor(occasion)
                  }}
                >
                  {/* Image Section - Top Half */}
                  <div className="h-24 w-full relative overflow-hidden">
                    {occasion.image ? (
                      <img
                        src={occasion.image}
                        alt={occasion.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                        onError={(e) => {
                          // If image fails to load, hide the img element
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: getOccasionColor(occasion) + '20' }}
                      >
                        <Image className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Content Section - Bottom Half */}
                  <div className="p-4">
                    <div className="text-lg font-bold text-gray-900 group-hover:text-brand-teal transition-colors mb-2" dir="rtl">
                      {occasion.name}
                    </div>
                    
                    {occasion.description && (
                      <div className="text-xs text-gray-500 group-hover:text-brand-teal-dark transition-colors mb-2">
                        {occasion.description}
                      </div>
                    )}
                    
                    {/* Show if this is manually overridden or scheduled */}
                    {occasion.manualOverride?.isActive && (
                      <div className="text-xs text-blue-600 mb-1 flex items-center justify-center">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </div>
                    )}
                    
                    {occasion.scheduledVisibility?.isScheduled && occasion.scheduledVisibility.hebrewSchedule?.useHebrewCalendar && (
                      <div className="text-xs text-purple-600 mb-1 flex items-center justify-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Hebrew Calendar
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-500 group-hover:text-brand-teal transition-colors">
                      Click to select
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-lg p-16 text-center border border-gray-100">
            <Calendar className="mx-auto h-24 w-24 text-gray-300 mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Occasions Available</h3>
            <p className="text-gray-600 mb-8">
              There are currently no occasions available for selection. Please check back later or contact us for custom orders.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-md mx-auto">
              <div className="text-sm text-blue-800">
                <p><strong>Current Hebrew Date:</strong> {currentHebrewInfo.hebrewDate}</p>
                <p><strong>Current Parsha:</strong> {currentHebrewInfo.parsha}</p>
              </div>
            </div>
          </div>
        )}

        {/* Custom Occasion Option - Always visible */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Don't see your occasion?</h3>
            <p className="text-gray-600 mb-6">We can create custom Pecklech for any special event</p>
            <button
              onClick={() => handleOccasionSelect('קוסטאם פעקלעך')}
              className="bg-gradient-to-r from-brand-teal to-brand-lime hover:from-brand-teal-dark hover:to-brand-lime-dark text-white px-8 py-4 rounded-2xl font-medium transition-all duration-200 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Create Custom Pecklech
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}