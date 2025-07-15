// Local storage based data persistence utilities

function getList(key: string): any[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function setList(key: string, list: any[]): void {
  localStorage.setItem(key, JSON.stringify(list));
}

function getItem<T>(key: string): T | null {
  const data = localStorage.getItem(key);
  return data ? (JSON.parse(data) as T) : null;
}

function setItem(key: string, value: any): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Generic helpers
function saveById(key: string, item: any) {
  const list = getList(key);
  const index = list.findIndex((i: any) => i.id === item.id);
  if (index !== -1) {
    list[index] = item;
  } else {
    list.push(item);
  }
  setList(key, list);
  return item;
}

function deleteById(key: string, id: string) {
  const list = getList(key).filter((i: any) => i.id !== id);
  setList(key, list);
  return true;
}

// Products
export async function fetchProducts() {
  return getList('products');
}

export async function saveProduct(product: any) {
  return saveById('products', product);
}

export async function deleteProduct(productId: string) {
  return deleteById('products', productId);
}

// Orders
export async function fetchOrders() {
  return getList('orders');
}

export async function saveOrder(order: any) {
  return saveById('orders', order);
}

export async function updateOrderStatus(orderId: string, status: string) {
  const orders = getList('orders');
  const index = orders.findIndex((o: any) => o.id === orderId);
  if (index !== -1) {
    orders[index] = { ...orders[index], status };
    setList('orders', orders);
    return true;
  }
  return false;
}

// Customers
export async function fetchCustomers() {
  return getList('customers');
}

export async function saveCustomer(customer: any) {
  return saveById('customers', customer);
}

export async function updateCustomer(customer: any) {
  return saveById('customers', customer);
}

// Bags
export async function fetchBags() {
  return getList('bags');
}

export async function saveBag(bag: any) {
  return saveById('bags', bag);
}

export async function deleteBag(bagId: string) {
  return deleteById('bags', bagId);
}

// Labels
export async function fetchLabels() {
  return getList('labels');
}

export async function saveLabel(label: any) {
  return saveById('labels', label);
}

export async function deleteLabel(labelId: string) {
  return deleteById('labels', labelId);
}

// Occasions
export async function fetchOccasions() {
  return getList('occasions');
}

export async function saveOccasion(occasion: any) {
  return saveById('occasions', occasion);
}

export async function deleteOccasion(occasionId: string) {
  return deleteById('occasions', occasionId);
}

// Budget Choice Peckels
export async function fetchBudgetChoicePeckels() {
  return getList('budget_choice_peckels');
}

export async function saveBudgetChoicePeckel(peckel: any) {
  return saveById('budget_choice_peckels', peckel);
}

// Ready To Go Peckels
export async function fetchReadyToGoPeckels() {
  return getList('ready_to_go_peckels');
}

export async function saveReadyToGoPeckel(peckel: any) {
  return saveById('ready_to_go_peckels', peckel);
}

// Admin Settings
export async function fetchAdminSettings() {
  return getItem<any>('admin_settings');
}

export async function saveAdminSettings(settings: any) {
  setItem('admin_settings', settings);
  return settings;
}

// Product Batches
export async function fetchProductBatches(productId?: string) {
  const batches = getList('product_batches');
  return productId ? batches.filter((b: any) => b.productId === productId) : batches;
}

export async function saveProductBatch(batch: any) {
  return saveById('product_batches', batch);
}

export async function deleteProductBatch(batchId: string) {
  return deleteById('product_batches', batchId);
}

// Batch Transactions
export async function fetchBatchTransactions(batchId?: string) {
  const transactions = getList('batch_transactions');
  return batchId ? transactions.filter((t: any) => t.batchId === batchId) : transactions;
}

export async function saveBatchTransaction(transaction: any) {
  return saveById('batch_transactions', transaction);
}

// Expiring Products (based on batch expiry date)
export async function fetchExpiringProducts(daysThreshold: number = 30) {
  const batches = getList('product_batches');
  const now = new Date();
  return batches.filter((b: any) => {
    if (!b.expiryDate) return false;
    const diff = new Date(b.expiryDate).getTime() - now.getTime();
    return diff / (1000 * 60 * 60 * 24) <= daysThreshold && diff >= 0;
  });
}

// Simple local auth helpers
export async function signUp(email: string, password: string, userData: any) {
  const users = getList('users');
  if (users.find((u: any) => u.email === email)) {
    throw new Error('Email already in use');
  }
  const user = { id: `user-${Date.now()}`, email, password, ...userData };
  users.push(user);
  setList('users', users);
  setItem('currentUserId', user.id);
  return { user };
}

export async function signIn(email: string, password: string) {
  const users = getList('users');
  const user = users.find((u: any) => u.email === email && u.password === password);
  if (!user) {
    throw new Error('Invalid credentials');
  }
  setItem('currentUserId', user.id);
  return { user };
}

export async function signOut() {
  localStorage.removeItem('currentUserId');
  return true;
}

export async function getCurrentUser() {
  const id = getItem<string>('currentUserId');
  if (!id) return null;
  const users = getList('users');
  return users.find((u: any) => u.id === id) || null;
}

export async function resetPassword(email: string) {
  const users = getList('users');
  const index = users.findIndex((u: any) => u.email === email);
  if (index === -1) throw new Error('User not found');
  // In a real app you'd send an email. Here we just return true.
  return true;
}
