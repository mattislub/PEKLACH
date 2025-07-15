import React, { useState, useRef } from 'react';
import { Search, Plus, Package, AlertTriangle, Edit, Trash2, Upload, Download, FileSpreadsheet, FileText, Eye, EyeOff, Star, Tag, Settings, DollarSign } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { exportProductsToCSV, exportProductsToExcel, importProductsFromCSV, importProductsFromExcel } from '../../utils/csvUtils';
import { exportProductsToPDF, importFromPDF } from '../../utils/pdfUtils';
import { ProductModal } from '../../components/admin/ProductModal';
import { Product } from '../../types';

export function ItemManagement() {
  const { state, dispatch } = useApp();
  const { products } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [promotionFilter, setPromotionFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [vatFilter, setVatFilter] = useState('all');
  const [editingStock, setEditingStock] = useState<{ [key: string]: string }>({});
  const [importing, setImporting] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPricingInfo, setShowPricingInfo] = useState(false);

  const categories = Array.from(new Set(products.map(p => p.category)));

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    const matchesVisibility = visibilityFilter === 'all' || 
                             (visibilityFilter === 'visible' && product.isVisible) ||
                             (visibilityFilter === 'hidden' && !product.isVisible);
    const matchesPromotion = promotionFilter === 'all' ||
                            (promotionFilter === 'promotion' && product.isOnPromotion) ||
                            (promotionFilter === 'regular' && !product.isOnPromotion);
    
    // VAT filter
    const matchesVat = vatFilter === 'all' ||
                      (vatFilter === 'vatable' && product.isVatable) ||
                      (vatFilter === 'non-vatable' && product.isVatable === false);
    
    // Section filter logic
    let matchesSection = true;
    if (sectionFilter !== 'all' && product.visibilitySettings) {
      const sectionKey = sectionFilter as keyof NonNullable<Product['visibilitySettings']>;
      matchesSection = product.visibilitySettings[sectionKey] === true;
    }
    
    return matchesSearch && matchesCategory && matchesVisibility && matchesPromotion && matchesSection && matchesVat;
  });

  const updateStock = (productId: string, newStock: number) => {
    if (newStock >= 0) {
      dispatch({
        type: 'UPDATE_PRODUCT_STOCK',
        payload: { productId, newStock }
      });
      setEditingStock(prev => ({ ...prev, [productId]: '' }));
    }
  };

  const toggleVisibility = (productId: string) => {
    dispatch({
      type: 'TOGGLE_PRODUCT_VISIBILITY',
      payload: productId
    });
  };

  const toggleCustomOrder = (productId: string) => {
    dispatch({
      type: 'TOGGLE_CUSTOM_ORDER',
      payload: productId
    });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      dispatch({
        type: 'DELETE_PRODUCT',
        payload: productId
      });
    }
  };

  const handleStockEdit = (productId: string, value: string) => {
    setEditingStock(prev => ({ ...prev, [productId]: value }));
  };

  const handleStockSubmit = (productId: string, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const newStock = parseInt(editingStock[productId] || '0');
      updateStock(productId, newStock);
    }
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      let importedProducts;
      if (file.name.endsWith('.csv')) {
        importedProducts = await importProductsFromCSV(file);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        importedProducts = await importProductsFromExcel(file);
      } else if (file.name.endsWith('.pdf')) {
        importedProducts = await importFromPDF(file);
      } else {
        throw new Error('Unsupported file format. Please use CSV, Excel, or PDF files.');
      }

      if (importedProducts.length > 0) {
        dispatch({ type: 'IMPORT_PRODUCTS', payload: importedProducts });
        alert(`Successfully imported ${importedProducts.length} products!`);
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

  const getStockStatus = (stock: number, allow_custom_order: boolean, minimumStock: number) => {
    if (stock === 0 && allow_custom_order) return { label: 'Made to Order', color: 'text-brand-teal bg-primary-100' };
    if (stock === 0) return { label: 'Out of Stock', color: 'text-red-600 bg-red-100' };
    if (stock <= minimumStock) return { label: 'Low Stock', color: 'text-amber-600 bg-amber-100' };
    return { label: 'In Stock', color: 'text-brand-teal bg-primary-100' };
  };

  const getSectionVisibilityBadges = (product: Product) => {
    if (!product.visibilitySettings) return [];
    
    const badges = [];
    const settings = product.visibilitySettings;
    
    if (settings.showInReadyToGo) badges.push('Ready-to-Go');
    if (settings.showInBudgetChoice) badges.push('Budget Choice');
    if (settings.showInBuildPeckel) badges.push('Build Peckel');
    if (settings.showInItemSelection) badges.push('Item Selection');
    if (settings.showInPrePackedPeckels) badges.push('Pre-Packed');
    if (settings.showInCustomOrders) badges.push('Custom Orders');
    
    return badges;
  };

  const sectionFilterOptions = [
    { value: 'all', label: 'All Sections' },
    { value: 'showInReadyToGo', label: 'Ready to Go' },
    { value: 'showInBudgetChoice', label: 'Budget Choice' },
    { value: 'showInBuildPeckel', label: 'Build Peckel' },
    { value: 'showInItemSelection', label: 'Item Selection' },
    { value: 'showInPrePackedPeckels', label: 'Pre-Packed' },
    { value: 'showInCustomOrders', label: 'Custom Orders' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Product Management</h1>
            <p className="text-gray-600 mt-2 text-lg">Monitor and manage your Pecklech products</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => exportProductsToCSV(filteredProducts)}
              className="bg-brand-teal hover:bg-brand-teal-dark text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => exportProductsToExcel(filteredProducts)}
              className="bg-brand-lime hover:bg-brand-lime-dark text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2 transition-colors"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Export Excel</span>
            </button>
            <button
              onClick={() => exportProductsToPDF(filteredProducts)}
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
                setEditingProduct(undefined);
                setShowProductModal(true);
              }}
              className="bg-gradient-to-r from-brand-teal to-brand-lime hover:from-brand-teal-dark hover:to-brand-lime-dark text-white px-6 py-2 rounded-xl font-medium flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.pdf"
              onChange={handleFileImport}
              className="hidden"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
              />
            </div>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
            >
              <option value="all">All Products</option>
              <option value="visible">Customer Visible</option>
              <option value="hidden">Admin Only</option>
            </select>

            <select
              value={promotionFilter}
              onChange={(e) => setPromotionFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
            >
              <option value="all">All Pricing</option>
              <option value="promotion">On Promotion</option>
              <option value="regular">Regular Price</option>
            </select>

            <select
              value={vatFilter}
              onChange={(e) => setVatFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
            >
              <option value="all">All VAT Status</option>
              <option value="vatable">VAT Applicable</option>
              <option value="non-vatable">VAT Exempt</option>
            </select>

            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
            >
              {sectionFilterOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-lg text-gray-600 bg-primary-50 px-4 py-3 rounded-xl">
              <Package className="h-5 w-5 mr-2 text-brand-teal" />
              {filteredProducts.length} products
            </div>

            <div className="flex items-center">
              <button
                onClick={() => setShowPricingInfo(!showPricingInfo)}
                className="flex items-center space-x-2 text-brand-teal hover:text-brand-teal-dark"
              >
                <DollarSign className="h-5 w-5" />
                <span>{showPricingInfo ? 'Hide Pricing Details' : 'Show Pricing Details'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-brand-teal to-brand-lime text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                    Category
                  </th>
                  {showPricingInfo ? (
                    <>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                        Cost Info
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                        Pricing
                      </th>
                    </>
                  ) : (
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                      Price
                    </th>
                  )}
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                    Visibility
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                    Sections
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock, product.allow_custom_order || false, product.minimumStock || 5);
                  const sectionBadges = getSectionVisibilityBadges(product);
                  
                  return (
                    <tr key={product.id} className="hover:bg-primary-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="h-16 w-16 rounded-xl object-cover mr-4 border border-gray-200"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900 flex items-center">
                              {product.name}
                              {product.isOnPromotion && (
                                <Tag className="h-4 w-4 ml-2 text-red-500" />
                              )}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
                            <div className="text-xs font-mono text-gray-400 mt-1">SKU: {product.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-primary-100 text-brand-teal">
                          {product.category}
                        </span>
                      </td>
                      
                      {showPricingInfo ? (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <div className="text-xs text-gray-500">
                                <span className="font-medium">Case Size:</span> {product.caseSize || 1}
                              </div>
                              <div className="text-xs text-gray-500">
                                <span className="font-medium">Wholesale:</span> £{product.wholesaleCost?.toFixed(2) || '0.00'}
                              </div>
                              <div className="text-xs text-gray-500">
                                <span className="font-medium">Unit Cost (ex VAT):</span> £{product.costPerUnit?.toFixed(2) || '0.00'}
                              </div>
                              <div className="text-xs text-gray-500">
                                <span className="font-medium">Unit Cost (inc VAT):</span> £{product.costPerUnitIncVat?.toFixed(2) || '0.00'}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center">
                                <span className="font-medium">VAT:</span> 
                                {product.isVatable ? (
                                  <span className="ml-1 text-green-600">{product.vatRate || 20}%</span>
                                ) : (
                                  <span className="ml-1 text-gray-400">Exempt</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <div className="text-xs text-gray-500">
                                <span className="font-medium">Sale (ex VAT):</span> £{product.saleExVat?.toFixed(2) || '0.00'}
                              </div>
                              <div className="text-sm font-bold text-gray-900">
                                <span className="font-medium">Sale (inc VAT):</span> £{product.price.toFixed(2)}
                              </div>
                              {product.isOnPromotion && product.originalPrice && (
                                <div className="text-xs text-red-600">
                                  <span className="line-through">£{product.originalPrice.toFixed(2)}</span>
                                  <span className="ml-1">
                                    (-{(((product.originalPrice - product.price) / product.originalPrice) * 100).toFixed(0)}%)
                                  </span>
                                </div>
                              )}
                              <div className="text-xs text-green-600">
                                <span className="font-medium">Margin:</span> {product.profitMargin || 30}%
                              </div>
                              {product.profitPerUnit !== undefined ? (
                                <div className="text-xs text-green-600">
                                  <span className="font-medium">Profit:</span> £
                                  {product.profitPerUnit.toFixed(2)}
                                </div>
                              ) : (
                                product.costPerUnit && product.saleExVat && (
                                  <div className="text-xs text-green-600">
                                    <span className="font-medium">Profit:</span> £
                                    {(product.saleExVat - product.costPerUnit).toFixed(2)}
                                  </div>
                                )
                              )}
                            </div>
                          </td>
                        </>
                      ) : (
                        <td className="px-6 py-4 whitespace-nowrap">
                          {product.isOnPromotion && product.originalPrice ? (
                            <div>
                              <div className="text-sm text-gray-500 line-through">£{product.originalPrice.toFixed(2)}</div>
                              <div className="text-sm font-bold text-red-600">£{product.price.toFixed(2)}</div>
                              <div className="text-xs text-red-600">
                                Save £{(product.originalPrice - product.price).toFixed(2)}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm font-bold text-gray-900">£{product.price.toFixed(2)}</div>
                          )}
                        </td>
                      )}
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingStock[product.id] !== undefined ? (
                          <input
                            type="number"
                            min="0"
                            value={editingStock[product.id]}
                            onChange={(e) => handleStockEdit(product.id, e.target.value)}
                            onKeyDown={(e) => handleStockSubmit(product.id, e)}
                            onBlur={() => {
                              const newStock = parseInt(editingStock[product.id] || '0');
                              updateStock(product.id, newStock);
                            }}
                            className="w-20 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                            autoFocus
                          />
                        ) : (
                          <button
                            onClick={() => handleStockEdit(product.id, product.stock.toString())}
                            className="text-sm font-bold text-gray-900 hover:text-brand-teal transition-colors bg-gray-100 hover:bg-primary-100 px-3 py-2 rounded-lg"
                            title="Click to edit stock"
                          >
                            {product.stock}
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${stockStatus.color}`}>
                          {product.stock <= (product.minimumStock || 5) && product.stock > 0 && (
                            <AlertTriangle className="h-3 w-3 mr-1" />
                          )}
                          {product.stock === 0 && product.allow_custom_order && (
                            <Star className="h-3 w-3 mr-1" />
                          )}
                          {stockStatus.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleVisibility(product.id)}
                            className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full transition-colors ${
                              product.isVisible 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            {product.isVisible ? (
                              <>
                                <Eye className="h-3 w-3 mr-1" />
                                Visible
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-3 w-3 mr-1" />
                                Hidden
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={() => toggleCustomOrder(product.id)}
                            className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full transition-colors ${
                              product.allow_custom_order 
                                ? 'bg-brand-teal text-white hover:bg-brand-teal-dark' 
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            <Star className="h-3 w-3 mr-1" />
                            {product.allow_custom_order ? 'Custom' : 'Standard'}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {sectionBadges.length > 0 ? (
                            sectionBadges.map(badge => (
                              <span key={badge} className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                {badge}
                              </span>
                            ))
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                              <Settings className="h-3 w-3 mr-1" />
                              No sections
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button 
                            onClick={() => handleEditProduct(product)}
                            className="text-brand-teal hover:text-brand-teal-dark transition-colors p-2 hover:bg-primary-50 rounded-lg"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-800 transition-colors p-2 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <Package className="mx-auto h-16 w-16 text-gray-300" />
              <p className="text-gray-500 text-lg mt-4">No products found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {showProductModal && (
        <ProductModal
          product={editingProduct}
          onClose={() => {
            setShowProductModal(false);
            setEditingProduct(undefined);
          }}
        />
      )}
    </div>
  );
}