import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useApp } from '../context/AppContext';

export function ProductCatalog() {
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Only show visible products to customers
  const visibleProducts = state.products.filter(product => product.isVisible);
  const categories = Array.from(new Set(visibleProducts.map(p => p.category)));

  const filteredProducts = visibleProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-brand-teal via-primary-600 to-brand-lime text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">YH Pecklech</h1>
          <p className="text-2xl text-primary-100 max-w-3xl mx-auto mb-4 font-medium">
            For Any Occasion, To Suit Every Budget
          </p>
          <p className="text-lg text-primary-200 max-w-2xl mx-auto">
            Discover our beautiful selection of traditional Jewish treats and gifts, perfect for Simchas and special celebrations. Serving communities worldwide with authentic kosher delights.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-6 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search for Pecklech products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-teal focus:border-transparent bg-white shadow-sm text-lg"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-12 pr-8 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-teal focus:border-transparent appearance-none bg-white min-w-[250px] shadow-sm text-lg"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-xl">No products found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}