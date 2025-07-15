import React, { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { 
  Package, 
  ShoppingBag,
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Home, 
  ChevronDown, 
  User,
  BarChart3,
  Tag,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AdminNavigation() {
  const { state: authState, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [itemsSubmenuOpen, setItemsSubmenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin-login');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const isItemsActive = () => {
    return location.pathname.startsWith('/admin/items') || 
           location.pathname === '/admin/bags' || 
           location.pathname === '/admin/labels';
  };

  // Define icon colors for better identification
  const iconColors = {
    dashboard: 'text-blue-500',
    orders: 'text-amber-500',
    items: 'text-emerald-500',
    customers: 'text-purple-500',
    settings: 'text-rose-500'
  };
  
  const itemsSubmenuItems = [
    { path: '/admin/bags', label: 'Bags', icon: Briefcase, color: 'text-blue-500' },
    { path: '/admin/items', label: 'Products', icon: Package, color: 'text-emerald-500' },
    { path: '/admin/labels', label: 'Labels', icon: Tag, color: 'text-purple-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex md:flex-col md:w-72 md:fixed md:inset-y-0 bg-gray-800">
        <div className="flex items-center justify-center h-20 bg-gray-900">
          <Link to="/admin" className="flex items-center">
            <img 
              src="/public/LOGO.jpg" 
              alt="YH Pecklech Admin" 
              className="h-12 w-auto"
            />
            <span className="ml-3 text-white font-bold text-lg">Admin</span>
          </Link>
        </div>
        
        <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
          <nav className="mt-5 flex-1 px-4 space-y-3">
            <Link
              to="/admin"
              className={`group flex items-center px-5 py-4 text-base font-medium rounded-xl ${
                isActive('/admin')
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <BarChart3 className={`mr-4 h-10 w-10 ${iconColors.dashboard}`} />
              <span className="text-xl">Dashboard</span>
            </Link>
            
            {/* Items Menu with Submenu */}
            <Link
              to="#"
              onClick={(e) => {
                e.preventDefault();
                setItemsSubmenuOpen(!itemsSubmenuOpen);
              }}
              className={`group flex items-center justify-between px-5 py-4 text-base font-medium rounded-xl ${
                isItemsActive()
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="flex items-center">
                <Package className={`mr-4 h-10 w-10 ${iconColors.items}`} />
                <span className="text-xl">Inventory</span>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform duration-200 text-gray-400 ${itemsSubmenuOpen ? 'rotate-180' : ''}`} />
            </Link>
            
            {/* Submenu Items */}
            <div className={`pl-14 space-y-2 overflow-hidden transition-all duration-200 ${
              itemsSubmenuOpen ? 'max-h-48 opacity-100 mb-2' : 'max-h-0 opacity-0'
            }`}>
              {itemsSubmenuItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center py-2 px-4 text-sm font-medium rounded-lg ${
                    isActive(item.path)
                      ? 'bg-gray-700 text-white'
                      : `${item.color} hover:bg-gray-700 hover:text-white`
                  }`}
                >
                  <item.icon className={`h-5 w-5 mr-3 ${item.color}`} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
            
            <Link
              to="/admin/orders"
              className={`group flex items-center px-5 py-4 text-base font-medium rounded-xl ${
                isActive('/admin/orders')
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <ShoppingBag className={`mr-4 h-10 w-10 ${iconColors.orders}`} />
              <span className="text-xl">Orders</span>
            </Link>
            
            <Link
              to="/admin/customers"
              className={`group flex items-center px-5 py-4 text-base font-medium rounded-xl ${
                isActive('/admin/customers')
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Users className={`mr-4 h-10 w-10 ${iconColors.customers}`} />
              <span className="text-xl">Customers</span>
            </Link>
            
            <Link
              to="/admin/settings"
              className={`group flex items-center px-5 py-4 text-base font-medium rounded-xl ${
                isActive('/admin/settings')
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Settings className={`mr-4 h-10 w-10 ${iconColors.settings}`} />
              <span className="text-xl">Settings</span>
            </Link>
          </nav>
        </div>
        
        <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-sm font-medium text-white">
                  {authState.user?.name || 'Admin User'}
                </p>
                <button
                  onClick={handleLogout}
                  className="text-xs font-medium text-gray-300 group-hover:text-gray-200 flex items-center mt-1"
                >
                  <LogOut className="mr-1 h-3 w-3" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <div className="fixed inset-0 flex z-40">
          <div
            className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-in-out duration-300 ${
              mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          <div
            className={`relative flex-1 flex flex-col max-w-xs w-full bg-gray-800 transition ease-in-out duration-300 transform ${
              mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <img 
                  src="/public/LOGO.jpg" 
                  alt="YH Pecklech Admin" 
                  className="h-10 w-auto"
                />
                <span className="ml-3 text-white font-bold">Admin</span>
              </div>
              <nav className="mt-5 px-2 space-y-3">
                <Link
                  to="/admin"
                  className={`group flex items-center px-5 py-4 text-base font-medium rounded-xl ${
                    isActive('/admin')
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <BarChart3 className={`mr-4 h-10 w-10 ${iconColors.dashboard}`} />
                  <span className="text-xl">Dashboard</span>
                </Link>
                
                <Link
                  to="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setItemsSubmenuOpen(!itemsSubmenuOpen);
                    setMobileMenuOpen(false);
                  }}
                  className={`group flex items-center px-5 py-4 text-base font-medium rounded-xl ${
                    isItemsActive()
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Package className={`mr-4 h-10 w-10 ${iconColors.items}`} />
                  <span className="text-xl">Inventory</span>
                  <ChevronDown className={`ml-auto h-5 w-5 transition-transform duration-200 ${itemsSubmenuOpen ? 'rotate-180' : ''}`} />
                </Link>
                
                {/* Mobile Submenu Items */}
                <div className={`pl-14 space-y-2 overflow-hidden transition-all duration-200 ${
                  itemsSubmenuOpen ? 'max-h-48 opacity-100 mb-2' : 'max-h-0 opacity-0'
                }`}>
                  {itemsSubmenuItems.map(item => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center py-2 px-4 text-sm font-medium rounded-lg ${
                        isActive(item.path)
                          ? 'bg-gray-700 text-white'
                        : `${item.color} hover:bg-gray-700 hover:text-white`
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className={`h-5 w-5 mr-3 ${item.color}`} />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
                
                <Link
                  to="/admin/orders"
                  className={`group flex items-center px-5 py-4 text-base font-medium rounded-xl ${
                    isActive('/admin/orders')
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ShoppingBag className={`mr-4 h-10 w-10 ${iconColors.orders}`} />
                  <span className="text-xl">Orders</span>
                </Link>
                
                <Link
                  to="/admin/customers"
                  className={`group flex items-center px-5 py-4 text-base font-medium rounded-xl ${
                    isActive('/admin/customers')
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Users className={`mr-4 h-10 w-10 ${iconColors.customers}`} />
                  <span className="text-xl">Customers</span>
                </Link>
                
                <Link
                  to="/admin/settings"
                  className={`group flex items-center px-5 py-4 text-base font-medium rounded-xl ${
                    isActive('/admin/settings')
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings className={`mr-4 h-10 w-10 ${iconColors.settings}`} />
                  <span className="text-xl">Settings</span>
                </Link>
              </nav>
            </div>
            
            <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
              <div className="flex-shrink-0 group block">
                <div className="flex items-center">
                  <div>
                    <p className="text-base font-medium text-white">
                      {authState.user?.name || 'Admin User'}
                    </p>
                    <button
                      onClick={handleLogout}
                      className="text-sm font-medium text-gray-300 group-hover:text-gray-200 flex items-center mt-1"
                    >
                      <LogOut className="mr-1 h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-shrink-0 w-14" aria-hidden="true">
            {/* Dummy element to force sidebar to shrink to fit close icon */}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-72 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-100">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-teal"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
        </div>
        
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-lg font-semibold text-gray-900">
              {location.pathname === '/admin' && 'Dashboard'}
              {location.pathname === '/admin/orders' && 'Order Management'}
              {location.pathname === '/admin/items' && 'Product Management'}
              {location.pathname === '/admin/bags' && 'Bag Management'}
              {location.pathname === '/admin/labels' && 'Label Management'}
              {location.pathname === '/admin/customers' && 'Customer Management'}
              {location.pathname === '/admin/settings' && 'Settings'}
            </h1>
            
            <div className="flex items-center">
              <Link
                to="/"
                className="mr-4 text-gray-600 hover:text-gray-900 flex items-center"
              >
                <Home className="h-5 w-5 mr-1" />
                <span className="hidden sm:inline">View Store</span>
              </Link>
              
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center text-gray-700 hover:text-gray-900 focus:outline-none"
                >
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <span className="ml-2 hidden sm:inline">{authState.user?.name || 'Admin'}</span>
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                
                {userMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                      <p className="font-medium">{authState.user?.name}</p>
                      <p className="text-gray-500">{authState.user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}