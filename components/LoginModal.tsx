
import React, { useState } from 'react';
import { 
  getAuth, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { app, googleProvider, facebookProvider } from '../firebase';
import { CloseIcon, GoogleIcon, FacebookIcon, DailyVocabLogo } from './icons';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const auth = getAuth(app);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      let userCredential;
      if (isLoginView) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }
      onLoginSuccess(userCredential.user);
      onClose();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleSocialLogin = async (provider: 'Google' | 'Facebook') => {
    const authProvider = provider === 'Google' ? googleProvider : facebookProvider;
    try {
      const result = await signInWithPopup(auth, authProvider);
      onLoginSuccess(result.user);
      onClose();
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-full transition-colors"
        >
          <CloseIcon className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center mb-6">
          <DailyVocabLogo className="w-16 h-16 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isLoginView ? 'Welcome Back!' : 'Create Account'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {isLoginView ? 'Log in to sync your progress' : 'Join us to start your journey'}
          </p>
        </div>

        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        {/* Social Login Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => handleSocialLogin('Google')}
            className="flex items-center justify-center py-2.5 px-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <GoogleIcon className="w-5 h-5 mr-2" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Google</span>
          </button>
          <button
            onClick={() => handleSocialLogin('Facebook')}
            className="flex items-center justify-center py-2.5 px-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <FacebookIcon className="w-5 h-5 mr-2 text-[#1877F2]" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Facebook</span>
          </button>
        </div>

        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          <span className="relative px-4 bg-white dark:bg-gray-800 text-xs text-gray-400 font-medium uppercase">
            Or with email
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@example.com"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:outline-none dark:text-white transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:outline-none dark:text-white transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-500/30 transform active:scale-95 transition-all mt-2"
          >
            {isLoginView ? 'Log In' : 'Create Account'}
          </button>
        </form>

        {/* Toggle View */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isLoginView ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLoginView(!isLoginView);
                setError(null); // Clear error on view toggle
              }}
              className="font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 transition-colors"
            >
              {isLoginView ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
