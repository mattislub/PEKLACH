import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase: any = null;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials are missing. Using fallback mode.');
  // Create a mock client that returns empty data instead of throwing errors
  supabase = {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      upsert: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ error: null }),
      single: () => Promise.resolve({ data: null, error: null })
    }),
    auth: {
      signUp: () => Promise.resolve({ data: null, error: null }),
      signInWithPassword: () => Promise.resolve({ data: null, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      resetPasswordForEmail: () => Promise.resolve({ error: null })
    }
  };
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };

// Helper functions for data persistence

// Products
export async function fetchProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*');
    
    if (error) {
      console.warn('Error fetching products:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.warn('Error fetching products:', error);
    return [];
  }
}

export async function saveProduct(product: any) {
  try {
    const { data, error } = await supabase
      .from('products')
      .upsert(product)
      .select();
    
    if (error) {
      console.warn('Error saving product:', error);
      return null;
    }
    
    return data?.[0] || null;
  } catch (error) {
    console.warn('Error saving product:', error);
    return null;
  }
}

export async function deleteProduct(productId: string) {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
    
    if (error) {
      console.warn('Error deleting product:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.warn('Error deleting product:', error);
    return false;
  }
}

// Orders
export async function fetchOrders() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*');
    
    if (error) {
      console.warn('Error fetching orders:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.warn('Error fetching orders:', error);
    return [];
  }
}

export async function saveOrder(order: any) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .upsert(order)
      .select();
    
    if (error) {
      console.warn('Error saving order:', error);
      return null;
    }
    
    return data?.[0] || null;
  } catch (error) {
    console.warn('Error saving order:', error);
    return null;
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);
    
    if (error) {
      console.warn('Error updating order status:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.warn('Error updating order status:', error);
    return false;
  }
}

// Customers
export async function fetchCustomers() {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*');
    
    if (error) {
      console.warn('Error fetching customers:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.warn('Error fetching customers:', error);
    return [];
  }
}

export async function saveCustomer(customer: any) {
  try {
    const { data, error } = await supabase
      .from('customers')
      .upsert(customer)
      .select();
    
    if (error) {
      console.warn('Error saving customer:', error);
      return null;
    }
    
    return data?.[0] || null;
  } catch (error) {
    console.warn('Error saving customer:', error);
    return null;
  }
}

export async function updateCustomer(customer: any) {
  try {
    const { data, error } = await supabase
      .from('customers')
      .update(customer)
      .eq('id', customer.id)
      .select();
    
    if (error) {
      console.warn('Error updating customer:', error);
      return null;
    }
    
    return data?.[0] || null;
  } catch (error) {
    console.warn('Error updating customer:', error);
    return null;
  }
}

// Bags
export async function fetchBags() {
  try {
    const { data, error } = await supabase
      .from('bags')
      .select('*');
    
    if (error) {
      console.warn('Error fetching bags:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.warn('Error fetching bags:', error);
    return [];
  }
}

export async function saveBag(bag: any) {
  try {
    const { data, error } = await supabase
      .from('bags')
      .upsert(bag)
      .select();
    
    if (error) {
      console.warn('Error saving bag:', error);
      return null;
    }
    
    return data?.[0] || null;
  } catch (error) {
    console.warn('Error saving bag:', error);
    return null;
  }
}

export async function deleteBag(bagId: string) {
  try {
    const { error } = await supabase
      .from('bags')
      .delete()
      .eq('id', bagId);
    
    if (error) {
      console.warn('Error deleting bag:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.warn('Error deleting bag:', error);
    return false;
  }
}

// Labels
export async function fetchLabels() {
  try {
    const { data, error } = await supabase
      .from('labels')
      .select('*');
    
    if (error) {
      console.warn('Error fetching labels:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.warn('Error fetching labels:', error);
    return [];
  }
}

export async function saveLabel(label: any) {
  try {
    const { data, error } = await supabase
      .from('labels')
      .upsert(label)
      .select();
    
    if (error) {
      console.warn('Error saving label:', error);
      return null;
    }
    
    return data?.[0] || null;
  } catch (error) {
    console.warn('Error saving label:', error);
    return null;
  }
}

export async function deleteLabel(labelId: string) {
  try {
    const { error } = await supabase
      .from('labels')
      .delete()
      .eq('id', labelId);
    
    if (error) {
      console.warn('Error deleting label:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.warn('Error deleting label:', error);
    return false;
  }
}

// Occasions
export async function fetchOccasions() {
  try {
    const { data, error } = await supabase
      .from('occasions')
      .select('*');
    
    if (error) {
      console.warn('Error fetching occasions:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.warn('Error fetching occasions:', error);
    return [];
  }
}

export async function saveOccasion(occasion: any) {
  try {
    const { data, error } = await supabase
      .from('occasions')
      .upsert(occasion)
      .select();
    
    if (error) {
      console.warn('Error saving occasion:', error);
      return null;
    }
    
    return data?.[0] || null;
  } catch (error) {
    console.warn('Error saving occasion:', error);
    return null;
  }
}

export async function deleteOccasion(occasionId: string) {
  try {
    const { error } = await supabase
      .from('occasions')
      .delete()
      .eq('id', occasionId);
    
    if (error) {
      console.warn('Error deleting occasion:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.warn('Error deleting occasion:', error);
    return false;
  }
}

// Budget Choice Peckels
export async function fetchBudgetChoicePeckels() {
  try {
    const { data, error } = await supabase
      .from('budget_choice_peckels')
      .select('*');
    
    if (error) {
      console.warn('Error fetching budget choice peckels:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.warn('Error fetching budget choice peckels:', error);
    return [];
  }
}

export async function saveBudgetChoicePeckel(peckel: any) {
  try {
    const { data, error } = await supabase
      .from('budget_choice_peckels')
      .upsert(peckel)
      .select();
    
    if (error) {
      console.warn('Error saving budget choice peckel:', error);
      return null;
    }
    
    return data?.[0] || null;
  } catch (error) {
    console.warn('Error saving budget choice peckel:', error);
    return null;
  }
}

// Ready to Go Peckels
export async function fetchReadyToGoPeckels() {
  try {
    const { data, error } = await supabase
      .from('ready_to_go_peckels')
      .select('*');
    
    if (error) {
      console.warn('Error fetching ready to go peckels:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.warn('Error fetching ready to go peckels:', error);
    return [];
  }
}

export async function saveReadyToGoPeckel(peckel: any) {
  try {
    const { data, error } = await supabase
      .from('ready_to_go_peckels')
      .upsert(peckel)
      .select();
    
    if (error) {
      console.warn('Error saving ready to go peckel:', error);
      return null;
    }
    
    return data?.[0] || null;
  } catch (error) {
    console.warn('Error saving ready to go peckel:', error);
    return null;
  }
}

// Admin Settings
export async function fetchAdminSettings() {
  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')
      .single();
    
    if (error) {
      console.warn('Error fetching admin settings:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.warn('Error fetching admin settings:', error);
    return null;
  }
}

export async function saveAdminSettings(settings: any) {
  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .upsert(settings)
      .select();
    
    if (error) {
      console.warn('Error saving admin settings:', error);
      return null;
    }
    
    return data?.[0] || null;
  } catch (error) {
    console.warn('Error saving admin settings:', error);
    return null;
  }
}

// Product Batches
export async function fetchProductBatches(productId?: string) {
  try {
    let query = supabase
      .from('product_batches')
      .select('*');
    
    if (productId) {
      query = query.eq('product_id', productId);
    }
    
    const { data, error } = await query.order('expiry_date', { ascending: true, nullsLast: true });
    
    if (error) {
      console.warn('Error fetching product batches:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.warn('Error fetching product batches:', error);
    return [];
  }
}

export async function saveProductBatch(batch: any) {
  try {
    const { data, error } = await supabase
      .from('product_batches')
      .upsert(batch)
      .select();
    
    if (error) {
      console.warn('Error saving product batch:', error);
      return null;
    }
    
    return data?.[0] || null;
  } catch (error) {
    console.warn('Error saving product batch:', error);
    return null;
  }
}

export async function deleteProductBatch(batchId: string) {
  try {
    const { error } = await supabase
      .from('product_batches')
      .delete()
      .eq('id', batchId);
    
    if (error) {
      console.warn('Error deleting product batch:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.warn('Error deleting product batch:', error);
    return false;
  }
}

// Batch Transactions
export async function fetchBatchTransactions(batchId?: string) {
  try {
    let query = supabase
      .from('batch_transactions')
      .select('*');
    
    if (batchId) {
      query = query.eq('batch_id', batchId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.warn('Error fetching batch transactions:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.warn('Error fetching batch transactions:', error);
    return [];
  }
}

export async function saveBatchTransaction(transaction: any) {
  try {
    const { data, error } = await supabase
      .from('batch_transactions')
      .insert(transaction)
      .select();
    
    if (error) {
      console.warn('Error saving batch transaction:', error);
      return null;
    }
    
    return data?.[0] || null;
  } catch (error) {
    console.warn('Error saving batch transaction:', error);
    return null;
  }
}

// Expiring Products
export async function fetchExpiringProducts(daysThreshold: number = 30) {
  try {
    const { data, error } = await supabase
      .rpc('get_expiring_products', { days_threshold: daysThreshold });
    
    if (error) {
      console.warn('Error fetching expiring products:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.warn('Error fetching expiring products:', error);
    return [];
  }
}

// Authentication
export async function signUp(email: string, password: string, userData: any) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    
    if (error) {
      console.warn('Error signing up:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.warn('Error signing up:', error);
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.warn('Error signing in:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.warn('Error signing in:', error);
    throw error;
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.warn('Error signing out:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.warn('Error signing out:', error);
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.warn('Error getting current user:', error);
      return null;
    }
    
    return data?.user || null;
  } catch (error) {
    console.warn('Error getting current user:', error);
    return null;
  }
}

export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    if (error) {
      console.warn('Error resetting password:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.warn('Error resetting password:', error);
    throw error;
  }
}