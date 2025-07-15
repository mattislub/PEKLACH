import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowLeft, Loader2, AlertCircle, ShieldCheck, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function AdminLogin() {
  const { state, adminLogin, clearError } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Redirect if already logged in as admin
  useEffect(() => {
    if (state.isAuthenticated && state.isAdmin) {
      navigate('/admin');
    }
  }, [state.isAuthenticated, state.isAdmin, navigate]);
  
  // Clear any errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await adminLogin(email, password);
      // Navigation will happen automatically due to the useEffect above
    } catch (error) {
      console.error('Admin login failed:', error);
    }
  };

  const handleDemoLogin = () => {
    setEmail('admin@yhpecklech.com');
    setPassword('admin123');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <div>
          <Link to="/" className="flex items-center text-brand-teal hover:text-brand-teal-dark mb-6">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Store
          </Link>
          
          <div className="text-center">
            <div className="flex justify-center">
              <div className="bg-gray-800 p-3 rounded-full">
                <ShieldCheck className="h-10 w-10 text-brand-teal" />
              </div>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Admin Login</h2>
            <p className="mt-2 text-sm text-gray-600">
              Secure access for administrators and staff
            </p>
          </div>
        </div>

        {/* Demo credentials info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Demo Admin Account</p>
              <p className="mb-2">Use these credentials to access the admin panel:</p>
              <div className="bg-white rounded p-2 text-xs font-mono">
                <div>Email: admin@yhpecklech.com</div>
                <div>Password: admin123</div>
              </div>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="mt-2 text-blue-600 hover:text-blue-800 font-medium text-xs underline"
              >
                Fill demo credentials
              </button>
            </div>
          </div>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {state.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{state.error}</span>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                  placeholder="admin@yhpecklech.com"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={state.isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              {state.isLoading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  Admin Sign in
                </>
              )}
            </button>
          </div>
          
          <div className="text-center text-sm text-gray-500">
            <p>
              Are you a customer?{' '}
              <Link to="/login" className="font-medium text-brand-teal hover:text-brand-teal-dark">
                Customer Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}