import { useState } from 'react';
import { NavLink as RouterNavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Home, FileText, Shield, Plus, LogOut, User, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { supabase } from '../lib/supabase';
import { ReportForm } from './ReportForm';
import { Dialog, DialogContent } from './ui/dialog';

const NavLink = ({
  to,
  active,
  children,
}: {
  to: string;
  active: boolean;
  children: React.ReactNode;
}) => (
  <RouterNavLink
    to={to}
    className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200
                ${
                  active
                    ? 'bg-orange-primary/10 text-[var(--orange-primary)] border border-[var(--orange-primary)]/30'
                    : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-elevated)]'
                }`}
  >
    {children}
  </RouterNavLink>
);

export function NavigationBar() {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = () => supabase.auth.signOut();

  const handleLogoClick = () => {
    navigate('/');
  };

  const breadcrumbs: Record<string, string> = {
    '/': 'Home',
    '/social-feed': 'Social Feed',
    '/my-reports': 'My Reports',
    '/admin': 'Admin Dashboard',
  };

  const currentPage = breadcrumbs[location.pathname] || 'Home';

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-subtle)]"
      >
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo and Breadcrumbs */}
          <div className="flex items-center space-x-3">
            <div
              onClick={handleLogoClick}
              className="flex items-center space-x-3 cursor-pointer group transition-all hover:-translate-y-[1px] active:scale-[0.98] logo-container"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleLogoClick();
                }
              }}
              aria-label="Go to home page"
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--orange-primary)] flex items-center justify-center group-hover:bg-[var(--orange-hover)] transition-colors logo-icon">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white hidden sm:block group-hover:text-[var(--orange-primary)] transition-colors">
                CIVIC SENSE AI
              </span>
            </div>

            {location.pathname !== '/' && (
              <div className="hidden sm:flex items-center space-x-2 text-sm ml-4 pl-4 border-l border-[var(--border-subtle)]">
                <ChevronRight className="w-4 h-4 text-gray-600" />
                <span className="text-gray-400">{currentPage}</span>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/social-feed" active={location.pathname === '/social-feed'}>
              <Home className="w-5 h-5 mr-2" />
              Social Feed
            </NavLink>
            <NavLink to="/my-reports" active={location.pathname === '/my-reports'}>
              <FileText className="w-5 h-5 mr-2" />
              My Reports
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" active={location.pathname === '/admin'}>
                <Shield className="w-5 h-5 mr-2" />
                Admin
              </NavLink>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Add Report Button */}
            <Button
              className="bg-[var(--orange-primary)] hover:bg-[var(--orange-hover)] text-white font-medium
                         hover:shadow-glow transition-all duration-200"
              onClick={() => setIsFormOpen(true)}
            >
              <Plus className="w-5 h-5 sm:mr-2" />
              <span className="hidden sm:inline">Report Issue</span>
            </Button>

            {/* User Profile */}
            <div className="relative">
              <button
                className="w-10 h-10 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center hover:border-[var(--orange-primary)] transition-colors"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <User className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg shadow-xl py-2 flex flex-col z-50">
                  <div className="px-4 py-2 border-b border-[var(--border-subtle)] mb-2">
                    <p className="text-sm text-white font-medium truncate">{user?.email}</p>
                  </div>
                  {/* Mobile nav links */}
                  <div className="md:hidden flex flex-col mb-2 border-b border-[var(--border-subtle)]">
                    <RouterNavLink
                      to="/social-feed"
                      className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-elevated)]"
                    >
                      Social Feed
                    </RouterNavLink>
                    <RouterNavLink
                      to="/my-reports"
                      className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-elevated)]"
                    >
                      My Reports
                    </RouterNavLink>
                    {isAdmin && (
                      <RouterNavLink
                        to="/admin"
                        className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-elevated)]"
                      >
                        Admin Dashboard
                      </RouterNavLink>
                    )}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl bg-[var(--bg-card)] border-[var(--border-subtle)] text-white p-0 overflow-hidden">
          <ReportForm
            onSuccess={() => setIsFormOpen(false)}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
