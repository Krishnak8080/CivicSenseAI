import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export default function Auth() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Animation Sequence States
  const [showSuccess, setShowSuccess] = useState(false);
  const [fadeOutLogin, setFadeOutLogin] = useState(false);

  useEffect(() => {
    // Redirect if they are already logged in and not in the middle of a fresh login animation
    if (user && !showSuccess) {
      navigate('/social-feed');
    }
  }, [user, showSuccess, navigate]);

  const loginSuccessSequence = async () => {
    // 1. Show success checkmark
    setShowSuccess(true);
    await new Promise((r) => setTimeout(r, 800));

    // 2. Fade out login form
    setFadeOutLogin(true);
    await new Promise((r) => setTimeout(r, 400));

    // 3. Navigate to feed and trigger the fluid reveal sequence there
    navigate('/social-feed', { state: { justLoggedIn: true } });
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (tab === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // On success, trigger the visual sequence instead of instant redirect
        await loginSuccessSequence();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Check your email for the confirmation link!');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during authentication');
    } finally {
      if (!showSuccess) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Element */}
      <motion.div
        className="absolute top-20 right-20 w-96 h-96 rounded-full bg-gradient-to-br from-[var(--orange-primary)] to-[var(--orange-dark)] blur-[120px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: fadeOutLogin ? 0 : 1, y: fadeOutLogin ? -20 : 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="bg-[var(--bg-card)] border-[var(--border-subtle)] p-8 shadow-2xl">
          {showSuccess ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <CheckCircle2 className="w-20 h-20 text-[var(--orange-primary)] mb-6" />
              <h2 className="text-2xl font-bold text-white text-center">
                Authentication Successful
              </h2>
              <p className="text-[var(--text-secondary)] mt-2">Preparing your workspace...</p>
            </motion.div>
          ) : (
            <>
              {/* Logo */}
              <div className="text-center mb-8">
                <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">
                  CIVIC SENSE <span className="text-[var(--orange-primary)]">AI</span>
                </h1>
                <p className="text-[var(--text-secondary)]">Welcome back to your community</p>
              </div>

              {/* Tab Switcher */}
              <div className="flex mb-8 bg-[var(--bg-secondary)] rounded-lg p-1 border border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
                    tab === 'login'
                      ? 'bg-[var(--bg-elevated)] text-white shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-white'
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setTab('register')}
                  className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
                    tab === 'register'
                      ? 'bg-[var(--bg-elevated)] text-white shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-white'
                  }`}
                >
                  Register
                </button>
              </div>

              {/* Form Fields with Smooth Transitions */}
              <AnimatePresence mode="wait">
                <motion.form
                  key={tab}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleAuth}
                  className="space-y-5"
                >
                  <div>
                    <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      className="w-full bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-white
                                 focus-visible:ring-[var(--orange-primary)] focus-visible:border-[var(--orange-primary)]
                                 transition-all duration-200 h-12"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
                      Password
                    </label>
                    <Input
                      type="password"
                      className="w-full bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-white
                                 focus-visible:ring-[var(--orange-primary)] focus-visible:border-[var(--orange-primary)]
                                 transition-all duration-200 h-12"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[var(--orange-primary)] hover:bg-[var(--orange-hover)] text-white font-bold h-12 mt-4 hover:shadow-glow transition-all"
                  >
                    {loading ? 'Processing...' : tab === 'login' ? 'Sign In' : 'Create Account'}
                  </Button>
                </motion.form>
              </AnimatePresence>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
