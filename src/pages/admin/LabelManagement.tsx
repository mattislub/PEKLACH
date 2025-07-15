import React, { useState, useRef } from 'react';
import { Search, Plus, Edit, Trash2, Download, Upload, FileText, FileSpreadsheet, Tag, Type, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LabelModal } from '../../components/admin/LabelModal';
import { Label } from '../../types';

export function LabelManagement() {
  const { state, dispatch } = useApp();
  const { labels, occasions } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [occasionFilter, setOccasionFilter] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [editingLabel, setEditingLabel] = useState<Label | undefined>();
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter labels based on search and filters
  const filteredLabels = labels.filter(label => {
    const matchesSearch = label.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         label.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || 
                       (typeFilter === 'pre-designed' && label.isPreDesigned) ||
                       (typeFilter === 'custom' && !label.isPreDesigned);
    const matchesOccasion = !occasionFilter || 
                           !label.visibleOccasions || 
                           label.visibleOccasions.length === 0 || 
                           label.visibleOccasions.includes(occasionFilter);
    const matchesVisibility = visibilityFilter === 'all' || 
                             (visibilityFilter === 'visible' && label.isVisible) ||
                             (visibilityFilter === 'hidden' && !label.isVisible);
    return matchesSearch && matchesType && matchesOccasion && matchesVisibility;
  });

  const handleEditLabel = (label: Label) => {
    setEditingLabel(label);
    setShowLabelModal(true);
  };

  const handleDeleteLabel = (labelId: string) => {
    if (confirm('Are you sure you want to delete this label? This action cannot be undone.')) {
      dispatch({
        type: 'DELETE_LABEL',
        payload: labelId
      });
    }
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      // In a real application, you would implement label import functionality
      alert('Label import functionality will be implemented in a future update.');
    } catch (error) {
      alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const exportLabelsToCSV = () => {
    // In a real application, you would implement label export functionality
    alert('Label export functionality will be implemented in a future update.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Label Management</h1>
            <p className="text-gray-600 mt-2 text-lg">Manage your Pecklech label designs</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={exportLabelsToCSV}
              className="bg-brand-teal hover:bg-brand-teal-dark text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2 transition-colors disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              <span>{importing ? 'Importing...' : 'Import'}</span>
            </button>
            <button
              onClick={() => {
                setEditingLabel(undefined);
                setShowLabelModal(true);
              }}
              className="bg-gradient-to-r from-brand-teal to-brand-lime hover:from-brand-teal-dark hover:to-brand-lime-dark text-white px-6 py-2 rounded-xl font-medium flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Label</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileImport}
              className="hidden"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search labels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
              />
            </div>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="pre-designed">Pre-designed</option>
              <option value="custom">Custom Upload</option>
            </select>

            <select
              value={occasionFilter}
              onChange={(e) => setOccasionFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
            >
              <option value="">All Occasions</option>
              {occasions.map(occasion => (
                <option key={occasion.id} value={occasion.name}>{occasion.name}</option>
              ))}
            </select>

            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
            >
              <option value="all">All Labels</option>
              <option value="visible">Visible Only</option>
              <option value="hidden">Hidden Only</option>
            </select>
          </div>

          <div className="flex items-center text-lg text-gray-600 bg-primary-50 px-4 py-3 rounded-xl w-fit">
            <Tag className="h-5 w-5 mr-2 text-brand-teal" />
            {filteredLabels.length} labels found
          </div>
        </div>

        {/* Labels Grid */}
        {filteredLabels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredLabels.map((label) => (
              <div key={label.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="relative">
                  {label.designImage ? (
                    <img
                      src={label.designImage}
                      alt={label.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=500';
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                      <Tag className="h-16 w-16 text-purple-300" />
                    </div>
                  )}
                  
                  {/* Type Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      label.isPreDesigned ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'
                    }`}>
                      {label.isPreDesigned ? 'Pre-designed' : 'Custom Upload'}
                    </span>
                  </div>
                  
                  {/* Visibility Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      label.isVisible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {label.isVisible ? 'Visible' : 'Hidden'}
                    </span>
                  </div>

                  {/* Features Badges */}
                  <div className="absolute bottom-4 left-4 flex space-x-2">
                    {label.showSimchaDateField && (
                      <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Date Field
                      </span>
                    )}
                    {label.isPreDesigned && (
                      <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                        <Type className="h-3 w-3 mr-1" />
                        Custom Text
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{label.name}</h3>
                  <p className="text-gray-600 mb-4 text-sm">{label.description}</p>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Price</p>
                    <p className="text-xl font-bold text-gray-900">£{label.price.toFixed(2)}</p>
                  </div>
                  
                  {/* Occasion Visibility */}
                  {label.visibleOccasions && label.visibleOccasions.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-1">Available for</p>
                      <div className="flex flex-wrap gap-2">
                        {label.visibleOccasions.slice(0, 3).map((occasion, index) => (
                          <span key={index} className="bg-primary-50 text-brand-teal px-2 py-1 rounded-lg text-xs">
                            {occasion}
                          </span>
                        ))}
                        {label.visibleOccasions.length > 3 && (
                          <span className="bg-primary-50 text-brand-teal px-2 py-1 rounded-lg text-xs">
                            +{label.visibleOccasions.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => handleEditLabel(label)}
                      className="flex-1 bg-primary-50 hover:bg-primary-100 text-brand-teal py-3 px-4 rounded-xl text-sm font-medium transition-colors flex items-center justify-center"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteLabel(label.id)}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-3 px-4 rounded-xl text-sm font-medium transition-colors flex items-center justify-center"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center border border-gray-100">
            <Tag className="mx-auto h-24 w-24 text-gray-300" />
            <h3 className="mt-6 text-xl font-medium text-gray-900">No labels found</h3>
            <p className="mt-3 text-gray-500 text-lg">
              {searchTerm || typeFilter !== 'all' || occasionFilter || visibilityFilter !== 'all' 
                ? 'No labels match your search criteria. Try adjusting your filters.' 
                : 'Start by adding your first label design.'}
            </p>
            <button
              onClick={() => {
                setEditingLabel(undefined);
                setShowLabelModal(true);
              }}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-brand-teal to-brand-lime text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
            >
              <Plus className="h-5 w-5 inline mr-2" />
              Add Your First Label
            </button>
          </div>
        )}
      </div>

      {showLabelModal && (
        <LabelModal
          label={editingLabel}
          onClose={() => {
            setShowLabelModal(false);
            setEditingLabel(undefined);
          }}
        />
      )}
    </div>
  );
}