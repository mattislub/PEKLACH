import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { Navigation } from './components/Navigation';
import { AdminNavigation } from './components/AdminNavigation';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';


// New Pages
import { AboutUs } from './pages/AboutUs';
import { ContactUs } from './pages/ContactUs';

// Customer Pages - New Workflow
import { OccasionSelection } from './pages/OccasionSelection';
import { OrderingMethod } from './pages/OrderingMethod';
import { ReadyToGoPeckels } from './pages/ReadyToGoPeckels';
import { BudgetChoicePeckels } from './pages/BudgetChoicePeckels';
import { BudgetChoiceLabels } from './pages/BudgetChoiceLabels';
import { BuildPeckelBagSelection } from './pages/BuildPeckelBagSelection';
import { BuildPeckelItemSelection } from './pages/BuildPeckelItemSelection';
import { BuildPeckelLabelSelection } from './pages/BuildPeckelLabelSelection';

// Existing Pages
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderSuccess } from './pages/OrderSuccess';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { OrderManagement } from './pages/admin/OrderManagement';
import { ItemManagement } from './pages/admin/ItemManagement';
import { BagManagement } from './pages/admin/BagManagement';
import { LabelManagement } from './pages/admin/LabelManagement';
import { CustomerManagement } from './pages/admin/CustomerManagement';
import { AdminSettings } from './pages/admin/AdminSettings';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { AdminLogin } from './pages/auth/AdminLogin';
import { ForgotPassword } from './pages/auth/ForgotPassword';

// Customer Account Pages
import { CustomerAccount } from './pages/customer/CustomerAccount';
import { CustomerOrders } from './pages/customer/CustomerOrders';
import { CustomerOrderDetails } from './pages/customer/CustomerOrderDetails';
import { CustomerSettings } from './pages/customer/CustomerSettings';

function App() {
  
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin/*" element={<AdminRoute><AdminNavigation /></AdminRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="items" element={<ItemManagement />} />
              <Route path="bags" element={<BagManagement />} />
              <Route path="labels" element={<LabelManagement />} />
              <Route path="customers" element={<CustomerManagement />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Customer Account Routes */}
            <Route path="/account/*" element={<ProtectedRoute><Navigation /></ProtectedRoute>}>
              <Route index element={<CustomerAccount />} />
              <Route path="orders" element={<CustomerOrders />} />
              <Route path="orders/:orderId" element={<CustomerOrderDetails />} />
              <Route path="settings" element={<CustomerSettings />} />
            </Route>

            {/* Public Routes with Navigation */}
            <Route path="/" element={<Navigation />}>
              <Route index element={<OccasionSelection />} />
              <Route path="about" element={<AboutUs />} />
              <Route path="contact" element={<ContactUs />} />
              <Route path="ordering-method" element={<OrderingMethod />} />
              <Route path="ready-to-go" element={<ReadyToGoPeckels />} />
              <Route path="budget-choice" element={<BudgetChoicePeckels />} />
              <Route path="budget-choice-labels" element={<BudgetChoiceLabels />} />
              
              {/* Build Peckel Routes */}
              <Route path="build-peckel/bag-selection" element={<BuildPeckelBagSelection />} />
              <Route path="build-peckel/item-selection" element={<BuildPeckelItemSelection />} />
              <Route path="build-peckel/label-selection" element={<BuildPeckelLabelSelection />} />
              
              {/* Existing Customer Routes */}
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="order-success" element={<OrderSuccess />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;