import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, Plus, Package, Calendar, Trash2, Edit, FileText } from 'lucide-react';
import { Product, ProductBatch, BatchTransaction } from '../../types';
import { ProductBatchModal } from './ProductBatchModal';
import { BatchTransactionModal } from './BatchTransactionModal';
import { fetchProductBatches, fetchBatchTransactions } from '../../utils/localDb';

interface BatchManagementPanelProps {
  product: Product;
  onUpdateBatchSettings: (settings: { hasExpiry: boolean; expiryNotificationDays?: number; useFifo?: boolean }) => void;
}

export function BatchManagementPanel({ product, onUpdateBatchSettings }: BatchManagementPanelProps) {
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [transactions, setTransactions] = useState<BatchTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<ProductBatch | undefined>();
  const [activeTab, setActiveTab] = useState<'batches' | 'transactions' | 'settings'>('batches');
  const [batchSettings, setBatchSettings] = useState({
    hasExpiry: product.hasExpiry || false,
    expiryNotificationDays: product.expiryNotificationDays || 30,
    useFifo: product.useFifo !== false
  });

  // Load batches and transactions
  const loadData = async () => {
    setIsLoading(true);
    try {
      const batchesData = await fetchProductBatches(product.id);
      setBatches(batchesData);
      
      // Only fetch transactions if there are batches
      if (batchesData.length > 0) {
        const allTransactions: BatchTransaction[] = [];
        for (const batch of batchesData) {
          const batchTransactions = await fetchBatchTransactions(batch.id);
          allTransactions.push(...batchTransactions);
        }
        setTransactions(allTransactions);
      }
    } catch (error) {
      console.error('Error loading batch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [product.id]);

  const handleAddBatch = () => {
    setSelectedBatch(undefined);
    setShowBatchModal(true);
  };

  const handleEditBatch = (batch: ProductBatch) => {
    setSelectedBatch(batch);
    setShowBatchModal(true);
  };

  const handleAddTransaction = (batch: ProductBatch) => {
    setSelectedBatch(batch);
    setShowTransactionModal(true);
  };

  const handleSaveBatchSettings = () => {
    onUpdateBatchSettings(batchSettings);
  };

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysUntilExpiry <= (product.expiryNotificationDays || 30);
  };

  const getExpiryStatus = (batch: ProductBatch) => {
    if (!batch.hasExpiry || !batch.expiryDate) return null;
    
    const expiry = new Date(batch.expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { label: 'Expired', color: 'text-red-600 bg-red-100' };
    } else if (daysUntilExpiry <= (product.expiryNotificationDays || 30)) {
      return { label: `Expires in ${daysUntilExpiry} days`, color: 'text-amber-600 bg-amber-100' };
    } else {
      return { label: `Expires in ${daysUntilExpiry} days`, color: 'text-green-600 bg-green-100' };
    }
  };

  const getTotalStock = () => {
    return batches.reduce((sum, batch) => sum + batch.quantity, 0);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mt-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <Package className="h-5 w-5 mr-2 text-brand-teal" />
          Batch Management
        </h3>
        
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('batches')}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              activeTab === 'batches' 
                ? 'bg-brand-teal text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Batches
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              activeTab === 'transactions' 
                ? 'bg-brand-teal text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              activeTab === 'settings' 
                ? 'bg-brand-teal text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      {/* Batches Tab */}
      {activeTab === 'batches' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600">
              Total Stock: <span className="font-bold text-gray-900">{getTotalStock()}</span> units across {batches.length} batches
            </div>
            <button
              onClick={handleAddBatch}
              className="bg-brand-teal hover:bg-brand-teal-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Batch
            </button>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-brand-teal border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Loading batches...</p>
            </div>
          ) : batches.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {batches.map(batch => {
                    const expiryStatus = getExpiryStatus(batch);
                    
                    return (
                      <tr key={batch.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{batch.batchNumber}</div>
                          {batch.notes && (
                            <div className="text-xs text-gray-500">{batch.notes}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{batch.quantity}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{new Date(batch.receivedDate).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {batch.hasExpiry && batch.expiryDate ? (
                            <div className="text-sm text-gray-900">{new Date(batch.expiryDate).toLocaleDateString()}</div>
                          ) : (
                            <div className="text-sm text-gray-500">N/A</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {expiryStatus ? (
                            <span className={`px-2 py-1 text-xs rounded-full ${expiryStatus.color}`}>
                              {expiryStatus.label}
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                              No Expiry
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditBatch(batch)}
                              className="text-brand-teal hover:text-brand-teal-dark"
                              title="Edit Batch"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleAddTransaction(batch)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Add Transaction"
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No batches found for this product</p>
              <button
                onClick={handleAddBatch}
                className="bg-brand-teal hover:bg-brand-teal-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Add First Batch
              </button>
            </div>
          )}
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-brand-teal border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Loading transactions...</p>
            </div>
          ) : transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map(transaction => {
                    const batch = batches.find(b => b.id === transaction.batchId);
                    
                    return (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{new Date(transaction.createdAt).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">{new Date(transaction.createdAt).toLocaleTimeString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{batch?.batchNumber || 'Unknown'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            transaction.transactionType === 'sale' ? 'bg-blue-100 text-blue-800' :
                            transaction.transactionType === 'adjustment' ? 'bg-purple-100 text-purple-800' :
                            transaction.transactionType === 'return' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {transaction.transactionType.charAt(0).toUpperCase() + transaction.transactionType.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{transaction.quantity}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {transaction.orderId ? (
                            <div className="text-sm text-brand-teal">{transaction.orderId}</div>
                          ) : (
                            <div className="text-sm text-gray-500">N/A</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{transaction.notes || '-'}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No transactions found for this product</p>
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-xl">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Batch Management Settings</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Product Has Expiry Dates</label>
                  <p className="text-xs text-gray-500">Enable if this product has expiry or best-before dates</p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="hasExpiry"
                    checked={batchSettings.hasExpiry}
                    onChange={(e) => setBatchSettings({...batchSettings, hasExpiry: e.target.checked})}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="hasExpiry"
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                      batchSettings.hasExpiry ? 'bg-brand-teal' : 'bg-gray-300'
                    }`}
                  ></label>
                </div>
              </div>
              
              {batchSettings.hasExpiry && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Notification Days
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={batchSettings.expiryNotificationDays}
                      onChange={(e) => setBatchSettings({...batchSettings, expiryNotificationDays: parseInt(e.target.value)})}
                      className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                    />
                    <span className="ml-2 text-sm text-gray-600">days before expiry</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    You'll be notified when batches are this many days from expiring
                  </p>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                  <label className="text-sm font-medium text-gray-700">Use FIFO Inventory</label>
                  <p className="text-xs text-gray-500">First In, First Out - oldest batches are used first</p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="useFifo"
                    checked={batchSettings.useFifo}
                    onChange={(e) => setBatchSettings({...batchSettings, useFifo: e.target.checked})}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="useFifo"
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                      batchSettings.useFifo ? 'bg-brand-teal' : 'bg-gray-300'
                    }`}
                  ></label>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                onClick={handleSaveBatchSettings}
                className="w-full bg-brand-teal hover:bg-brand-teal-dark text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
            <h4 className="text-lg font-medium text-blue-900 mb-2">About Batch Management</h4>
            <div className="text-sm text-blue-800 space-y-2">
              <p>• Track different batches of the same product</p>
              <p>• Monitor expiry dates and get notifications</p>
              <p>• Use FIFO (First In, First Out) for inventory management</p>
              <p>• Record all batch transactions (sales, adjustments, returns)</p>
              <p>• Maintain accurate stock levels across all batches</p>
            </div>
          </div>
        </div>
      )}

      {/* Batch Modal */}
      {showBatchModal && (
        <ProductBatchModal
          product={product}
          batch={selectedBatch}
          onClose={() => setShowBatchModal(false)}
          onSave={loadData}
        />
      )}

      {/* Transaction Modal */}
      {showTransactionModal && selectedBatch && (
        <BatchTransactionModal
          batch={selectedBatch}
          onClose={() => setShowTransactionModal(false)}
          onSave={loadData}
        />
      )}
    </div>
  );
}