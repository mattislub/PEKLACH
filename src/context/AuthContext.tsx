import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import Cookies from 'js-cookie';
import { User, AuthState } from '../types';
import { supabase, signUp, signIn, signOut, getCurrentUser, resetPassword } from '../utils/supabaseClient';

// Define action types
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: User }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: false,
  error: null
};

// Create context
const AuthContext = createContext<{
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
} | null>(null);

// Reducer function
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        isAdmin: action.payload.role === 'admin' || action.payload.role === 'staff',
        user: action.payload,
        error: null
      };
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        isAdmin: false,
        user: null,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        isAdmin: false,
        user: null,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

// Auth Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize mock users if they don't exist
  useEffect(() => {
    if (!localStorage.getItem('users')) {
      const initialUsers = [
        {
          id: 'admin-1',
          email: 'admin@yhpecklech.com',
          name: 'Admin User',
          password: 'admin123', // In a real app, this would be hashed
          role: 'admin',
          createdAt: new Date().toISOString()
        },
        {
          id: 'staff-1',
          email: 'staff@yhpecklech.com',
          name: 'Staff User',
          password: 'staff123', // In a real app, this would be hashed
          role: 'staff',
          createdAt: new Date().toISOString()
        },
        {
          id: 'customer-1',
          email: 'customer@example.com',
          name: 'Demo Customer',
          password: 'customer123', // In a real app, this would be hashed
          role: 'customer',
          phone: '07700 900123',
          address: {
            street: '123 Main St',
            city: 'London',
            state: 'Greater London',
            zipCode: 'NW1 6XE'
          },
          createdAt: new Date().toISOString()
        }
      ];
      
      localStorage.setItem('users', JSON.stringify(initialUsers));
    }
  }, []);

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check for existing cookie auth (mock auth)
        const userCookie = Cookies.get('user');
        if (userCookie) {
          try {
            const userData = JSON.parse(userCookie);
            dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
            return;
          } catch (error) {
            console.error('Error parsing user cookie:', error);
            Cookies.remove('user');
            Cookies.remove('auth_token');
          }
        }

        // Then check Supabase auth
        const user = await getCurrentUser();
        
        if (user) {
          // Get user metadata from Supabase
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          const userData: User = {
            id: user.id,
            email: user.email || '',
            name: profile?.name || user.user_metadata?.name || 'User',
            role: profile?.role || user.user_metadata?.role || 'customer',
            phone: profile?.phone || user.user_metadata?.phone,
            address: profile?.address || user.user_metadata?.address,
            createdAt: user.created_at || new Date().toISOString(),
            lastLogin: new Date().toISOString()
          };
          
          dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        // Clear any stored auth data
        Cookies.remove('user');
        Cookies.remove('auth_token');
      }
    };
    
    checkAuth();
  }, []);

  // Auth methods
  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // First try mock authentication for demo purposes
      const mockUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const user = mockUsers.find((u: any) => 
        u.email === email && 
        u.password === password && 
        u.role === 'customer'
      );
      
      if (user) {
        // Create user object without password
        const { password: _, ...userWithoutPassword } = user;
        
        // Update last login
        userWithoutPassword.lastLogin = new Date().toISOString();
        
        // Update user in mock database
        const updatedUsers = mockUsers.map((u: any) => 
          u.id === user.id ? { ...u, lastLogin: userWithoutPassword.lastLogin } : u
        );
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        // Set cookies
        Cookies.set('user', JSON.stringify(userWithoutPassword), { expires: 7 });
        Cookies.set('auth_token', `mock-token-${Date.now()}`, { expires: 7 });
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: userWithoutPassword });
        return;
      }

      // If mock auth fails, try Supabase
      try {
        const { user: supabaseUser } = await signIn(email, password);
        
        if (!supabaseUser) {
          throw new Error('Invalid email or password');
        }
        
        // Get user profile from Supabase
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .single();
        
        // Check if user is a customer
        if (profile?.role !== 'customer' && supabaseUser.user_metadata?.role !== 'customer') {
          throw new Error('This account is not a customer account. Please use the admin login.');
        }
        
        const userData: User = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: profile?.name || supabaseUser.user_metadata?.name || 'User',
          role: 'customer',
          phone: profile?.phone || supabaseUser.user_metadata?.phone,
          address: profile?.address || supabaseUser.user_metadata?.address,
          createdAt: supabaseUser.created_at || new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        
        // Update last login
        await supabase
          .from('profiles')
          .update({ last_login: new Date().toISOString() })
          .eq('id', supabaseUser.id);
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
      } catch (supabaseError) {
        console.error('Supabase login error:', supabaseError);
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: error instanceof Error ? error.message : 'Login failed' 
      });
    }
  };

  const adminLogin = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // Always try mock authentication first for demo purposes
      const mockUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const user = mockUsers.find((u: any) => 
        u.email === email && 
        u.password === password && 
        (u.role === 'admin' || u.role === 'staff')
      );
      
      if (user) {
        // Create user object without password
        const { password: _, ...userWithoutPassword } = user;
        
        // Update last login
        userWithoutPassword.lastLogin = new Date().toISOString();
        
        // Update user in mock database
        const updatedUsers = mockUsers.map((u: any) => 
          u.id === user.id ? { ...u, lastLogin: userWithoutPassword.lastLogin } : u
        );
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        // Set cookies
        Cookies.set('user', JSON.stringify(userWithoutPassword), { expires: 7 });
        Cookies.set('auth_token', `mock-admin-token-${Date.now()}`, { expires: 7 });
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: userWithoutPassword });
        return;
      }

      // If no mock user found, try Supabase (but expect it to fail in demo)
      try {
        const { user: supabaseUser } = await signIn(email, password);
        
        if (!supabaseUser) {
          throw new Error('Invalid admin credentials');
        }
        
        // Get user profile from Supabase
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .single();
        
        // Check if user is an admin or staff
        if (profile?.role !== 'admin' && profile?.role !== 'staff' && 
            supabaseUser.user_metadata?.role !== 'admin' && supabaseUser.user_metadata?.role !== 'staff') {
          throw new Error('This account does not have admin privileges');
        }
        
        const userData: User = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: profile?.name || supabaseUser.user_metadata?.name || 'Admin User',
          role: profile?.role || supabaseUser.user_metadata?.role || 'admin',
          phone: profile?.phone || supabaseUser.user_metadata?.phone,
          address: profile?.address || supabaseUser.user_metadata?.address,
          createdAt: supabaseUser.created_at || new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        
        // Update last login
        await supabase
          .from('profiles')
          .update({ last_login: new Date().toISOString() })
          .eq('id', supabaseUser.id);
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
      } catch (supabaseError) {
        console.error('Supabase admin login error:', supabaseError);
        // For demo purposes, show a more helpful error message
        throw new Error('Demo admin login failed. Please use the demo credentials: admin@yhpecklech.com / admin123');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: error instanceof Error ? error.message : 'Admin login failed' 
      });
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    dispatch({ type: 'REGISTER_START' });
    
    try {
      // First try mock registration for demo purposes
      const mockUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const existingUser = mockUsers.find((u: any) => u.email === email);
      
      if (!existingUser) {
        // Create new user in mock database
        const newUser = {
          id: `user-${Date.now()}`,
          email,
          name,
          password, // In a real app, this would be hashed
          role: 'customer',
          phone: phone || '',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        
        // Add to mock database
        mockUsers.push(newUser);
        localStorage.setItem('users', JSON.stringify(mockUsers));
        
        // Create user object without password
        const { password: _, ...userWithoutPassword } = newUser;
        
        // Set cookies
        Cookies.set('user', JSON.stringify(userWithoutPassword), { expires: 7 });
        Cookies.set('auth_token', `mock-token-${Date.now()}`, { expires: 7 });
        
        dispatch({ type: 'REGISTER_SUCCESS', payload: userWithoutPassword });
        return;
      }

      // If user exists in mock or we want to use Supabase, try Supabase registration
      try {
        const userData = {
          name,
          email,
          role: 'customer',
          phone: phone || '',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        
        const { user } = await signUp(email, password, userData);
        
        if (!user) {
          throw new Error('Registration failed');
        }
        
        // Create profile in profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            name,
            email,
            role: 'customer',
            phone: phone || '',
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString()
          }]);
        
        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
        
        const newUser: User = {
          id: user.id,
          email: user.email || '',
          name,
          role: 'customer',
          phone: phone || '',
          createdAt: user.created_at || new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        
        dispatch({ type: 'REGISTER_SUCCESS', payload: newUser });
      } catch (supabaseError) {
        console.error('Supabase registration error:', supabaseError);
        if (existingUser) {
          throw new Error('Email already in use');
        } else {
          throw new Error('Registration failed');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      dispatch({ 
        type: 'REGISTER_FAILURE', 
        payload: error instanceof Error ? error.message : 'Registration failed' 
      });
    }
  };

  const logout = async () => {
    try {
      // Sign out from Supabase
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      // Remove cookies
      Cookies.remove('user');
      Cookies.remove('auth_token');
      
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!state.user) return;
    
    try {
      // Update user profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', state.user.id);
      
      if (error) {
        console.error('Error updating user profile:', error);
        throw error;
      }
      
      dispatch({ type: 'UPDATE_USER', payload: userData });
    } catch (error) {
      console.error('Error updating user:', error);
      
      // Fallback to mock update for demo purposes
      try {
        // Update user in mock database
        const mockUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const updatedUsers = mockUsers.map((u: any) => 
          u.id === state.user?.id ? { ...u, ...userData } : u
        );
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        // Update user in cookies
        const updatedUser = { ...state.user, ...userData };
        Cookies.set('user', JSON.stringify(updatedUser), { expires: 7 });
        
        dispatch({ type: 'UPDATE_USER', payload: userData });
      } catch (mockError) {
        console.error('Error updating user in mock database:', mockError);
      }
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider value={{ 
      state, 
      dispatch, 
      login, 
      adminLogin,
      register, 
      logout, 
      updateUser,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};