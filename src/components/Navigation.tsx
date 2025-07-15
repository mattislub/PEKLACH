import React from 'react';
import { Link, useLocation, Outlet, NavLink } from 'react-router-dom';
import { Settings, ShoppingCart, Package, User, LogIn, Home, Info, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export function Navigation() {
  const { state: appState } = useApp();
  const { state: authState } = useAuth();
  const location = useLocation();
  const cartItemCount = appState.cart.reduce((sum, item) => sum + item.quantity, 0);
  const { adminSettings } = appState;

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAccountRoute = location.pathname.startsWith('/account');
  const isAuthRoute = ['/login', '/register', '/forgot-password'].includes(location.pathname);

  // Don't show navigation on auth routes
  if (isAuthRoute) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white shadow-lg border-b-2 border-gradient-to-r from-brand-teal to-brand-lime sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-3 text-gray-900 hover:opacity-80 transition-opacity">
                <img 
                  src="/LOGO.jpg" 
                  alt="YH Pecklech" 
                  className="h-12 w-auto"
                />
              </Link>

              {!isAdminRoute && !isAccountRoute && (
                <div className="hidden md:flex space-x-8">
                  <NavLink 
                    to="/" 
                    className={({isActive}) => 
                      `flex items-center space-x-2 text-lg font-medium ${isActive ? 'text-brand-teal' : 'text-gray-700 hover:text-brand-teal'} transition-colors`
                    }
                    end
                  >
                    <Home className="h-5 w-5" />
                    <span>Home</span>
                  </NavLink>
                  <NavLink 
                    to="/about" 
                    className={({isActive}) => 
                      `flex items-center space-x-2 text-lg font-medium ${isActive ? 'text-brand-teal' : 'text-gray-700 hover:text-brand-teal'} transition-colors`
                    }
                  >
                    <Info className="h-5 w-5" />
                    About Us
                  </NavLink>
                  <NavLink 
                    to="/contact" 
                    className={({isActive}) => 
                      `flex items-center space-x-2 text-lg font-medium ${isActive ? 'text-brand-teal' : 'text-gray-700 hover:text-brand-teal'} transition-colors`
                    }
                  >
                    <Phone className="h-5 w-5" />
                    <span>Contact Us</span>
                  </NavLink>
                </div>
              )}

              {isAccountRoute && (
                <div className="hidden md:flex space-x-8">
                  <Link to="/account" className={`text-gray-700 hover:text-brand-teal transition-colors font-medium text-lg ${location.pathname === '/account' ? 'text-brand-teal' : ''}`}>
                    Dashboard
                  </Link>
                  <Link to="/account/orders" className={`text-gray-700 hover:text-brand-teal transition-colors font-medium text-lg ${location.pathname === '/account/orders' ? 'text-brand-teal' : ''}`}>
                    My Orders
                  </Link>
                  <Link to="/account/settings" className={`text-gray-700 hover:text-brand-teal transition-colors font-medium text-lg ${location.pathname === '/account/settings' ? 'text-brand-teal' : ''}`}>
                    Settings
                  </Link>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {!isAdminRoute && !isAccountRoute && (
                <>
                  <Link
                    to="/cart"
                    className="relative p-3 text-gray-700 hover:text-brand-teal transition-colors bg-gray-50 hover:bg-primary-50 rounded-xl"
                  >
                    <ShoppingCart className="h-6 w-6" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-brand-teal to-brand-lime text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                        {cartItemCount}
                      </span>
                    )}
                  </Link>
                  
                  {authState.isAuthenticated ? (
                    <Link
                      to="/account"
                      className="flex items-center space-x-2 bg-gradient-to-r from-brand-teal to-brand-lime hover:from-brand-teal-dark hover:to-brand-lime-dark text-white px-4 py-2 rounded-xl transition-all duration-200 font-medium"
                    >
                      <User className="h-4 w-4" />
                      <span>My Account</span>
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      className="flex items-center space-x-2 bg-gradient-to-r from-brand-teal to-brand-lime hover:from-brand-teal-dark hover:to-brand-lime-dark text-white px-4 py-2 rounded-xl transition-all duration-200 font-medium"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Login</span>
                    </Link>
                  )}
                </>
              )}

              {isAccountRoute && (
                <Link
                  to="/"
                  className="flex items-center space-x-2 bg-gradient-to-r from-brand-teal to-brand-lime hover:from-brand-teal-dark hover:to-brand-lime-dark text-white px-4 py-2 rounded-xl transition-all duration-200 font-medium"
                >
                  <Package className="h-4 w-4" />
                  <span>Store</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">YH Pecklech</h3>
              <p className="text-gray-300 text-sm">
                For Any Occasion, To Suit Every Budget
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="text-gray-300 hover:text-white transition-colors">Contact Us</Link></li>
                {authState.isAuthenticated ? (
                  <li><Link to="/account" className="text-gray-300 hover:text-white transition-colors">My Account</Link></li>
                ) : (
                  <li><Link to="/login" className="text-gray-300 hover:text-white transition-colors">Login</Link></li>
                )}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Contact Us</h3>
              <p className="text-gray-300 text-sm">
                Email: {adminSettings.contactEmail || 'info@yhpecklech.com'}<br />
                Phone: {adminSettings.contactPhone || '+44 20 1234 5678'}
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} YH Pecklech. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}