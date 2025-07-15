import React, { useState, useRef } from 'react';
import { Search, Plus, Edit, Trash2, Download, Upload, FileText, FileSpreadsheet, AlertTriangle, Package } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BagModal } from '../../components/admin/BagModal';
import { exportBagsToCSV, exportBagsToExcel, importBagsFromCSV, importBagsFromExcel } from '../../utils/bagUtils';
import { exportBagsToPDF } from '../../utils/pdfUtils';
import { Bag } from '../../types';

export function BagManagement() {
  const { state, dispatch } = useApp();
  const { bags } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [colorFilter, setColorFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [showBagModal, setShowBagModal] = useState(false);
  const [editingBag, setEditingBag] = useState<Bag | undefined>();
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get unique colors and sizes for filters
  const colors = Array.from(new Set(bags.map(bag => bag.color)));
  const sizes = Array.from(new Set(bags.map(bag => bag.size)));

  // Filter bags based on search and filters
  const filteredBags = bags.filter(bag => {
    const matchesSearch = bag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bag.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesColor = !colorFilter || bag.color === colorFilter;
    const matchesSize = !sizeFilter || bag.size === sizeFilter;
    const matchesVisibility = visibilityFilter === 'all' || 
                             (visibilityFilter === 'visible' && bag.isVisible) ||
                             (visibilityFilter === 'hidden' && !bag.isVisible);
    return matchesSearch && matchesColor && matchesSize && matchesVisibility;
  });

  const handleEditBag = (bag: Bag) => {
    setEditingBag(bag);
    setShowBagModal(true);
  };

  const handleDeleteBag = (bagId: string) => {
    if (confirm('Are you sure you want to delete this bag? This action cannot be undone.')) {
      dispatch({
        type: 'DELETE_BAG',
        payload: bagId
      });
    }
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      let importedBags;
      if (file.name.endsWith('.csv')) {
        importedBags = await importBagsFromCSV(file);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        importedBags = await importBagsFromExcel(file);
      } else {
        throw new Error('Unsupported file format. Please use CSV or Excel files.');
      }

      if (importedBags.length > 0) {
        dispatch({ type: 'IMPORT_BAGS', payload: importedBags });
        alert(`Successfully imported ${importedBags.length} bags!`);
      }
    } catch (error) {
      alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getStockStatus = (stock: number, minimumStock: number = 0) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'text-red-600 bg-red-100' };
    if (stock <= minimumStock) return { label: 'Low Stock', color: 'text-amber-600 bg-amber-100' };
    return { label: 'In Stock', color: 'text-green-600 bg-green-100' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Bag Management</h1>
            <p className="text-gray-600 mt-2 text-lg">Manage your Pecklech bags inventory</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => exportBagsToCSV(filteredBags)}
              className="bg-brand-teal hover:bg-brand-teal-dark text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => exportBagsToExcel(filteredBags)}
              className="bg-brand-lime hover:bg-brand-lime-dark text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2 transition-colors"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Export Excel</span>
            </button>
            <button
              onClick={() => exportBagsToPDF(filteredBags)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2 transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>Export PDF</span>
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
                setEditingBag(undefined);
                setShowBagModal(true);
              }}
              className="bg-gradient-to-r from-brand-teal to-brand-lime hover:from-brand-teal-dark hover:to-brand-lime-dark text-white px-6 py-2 rounded-xl font-medium flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Bag</span>
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
                placeholder="Search bags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
              />
            </div>
            
            <select
              value={colorFilter}
              onChange={(e) => setColorFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
            >
              <option value="">All Colors</option>
              {colors.map(color => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>

            <select
              value={sizeFilter}
              onChange={(e) => setSizeFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
            >
              <option value="">All Sizes</option>
              {sizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>

            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
            >
              <option value="all">All Bags</option>
              <option value="visible">Visible Only</option>
              <option value="hidden">Hidden Only</option>
            </select>
          </div>

          <div className="flex items-center text-lg text-gray-600 bg-primary-50 px-4 py-3 rounded-xl w-fit">
            <Package className="h-5 w-5 mr-2 text-brand-teal" />
            {filteredBags.length} bags found
          </div>
        </div>

        {/* Bags Grid */}
        {filteredBags.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBags.map((bag) => {
              const stockStatus = getStockStatus(bag.stock, bag.minimumStock);
              
              return (
                <div key={bag.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="relative">
                    <img
                      src={bag.image}
                      alt={bag.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=500';
                      }}
                    />
                    
                    {/* Stock Status Badge */}
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center ${stockStatus.color}`}>
                        {bag.stock <= (bag.minimumStock || 0) && bag.stock > 0 && (
                          <AlertTriangle className="h-3 w-3 mr-1" />
                        )}
                        {stockStatus.label}
                      </span>
                    </div>
                    
                    {/* Visibility Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        bag.isVisible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {bag.isVisible ? 'Visible' : 'Hidden'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{bag.name}</h3>
                    <p className="text-gray-600 mb-4 text-sm">{bag.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Color</p>
                        <p className="font-medium text-gray-900">{bag.color}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Size</p>
                        <p className="font-medium text-gray-900">{bag.size}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Price</p>
                        <p className="font-medium text-gray-900">£{bag.price.toFixed(2)}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Stock</p>
                        <p className="font-medium text-gray-900">{bag.stock}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => handleEditBag(bag)}
                        className="flex-1 bg-primary-50 hover:bg-primary-100 text-brand-teal py-3 px-4 rounded-xl text-sm font-medium transition-colors flex items-center justify-center"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteBag(bag.id)}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-3 px-4 rounded-xl text-sm font-medium transition-colors flex items-center justify-center"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center border border-gray-100">
            <Package className="mx-auto h-24 w-24 text-gray-300" />
            <h3 className="mt-6 text-xl font-medium text-gray-900">No bags found</h3>
            <p className="mt-3 text-gray-500 text-lg">
              {searchTerm || colorFilter || sizeFilter || visibilityFilter !== 'all' 
                ? 'No bags match your search criteria. Try adjusting your filters.' 
                : 'Start by adding your first bag.'}
            </p>
            <button
              onClick={() => {
                setEditingBag(undefined);
                setShowBagModal(true);
              }}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-brand-teal to-brand-lime text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
            >
              <Plus className="h-5 w-5 inline mr-2" />
              Add Your First Bag
            </button>
          </div>
        )}
      </div>

      {showBagModal && (
        <BagModal
          bag={editingBag}
          onClose={() => {
            setShowBagModal(false);
            setEditingBag(undefined);
          }}
        />
      )}
    </div>
  );
}