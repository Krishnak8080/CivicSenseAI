import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '../ui/button';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background-dark/80 backdrop-blur-md border-b border-white/10 py-4'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-black tracking-tighter text-white">
          CIVIC SENSE <span className="text-orange-primary">AI</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8">
          <Link
            to="/"
            className="text-sm font-medium text-white hover:text-orange-primary transition-colors"
          >
            Home
          </Link>
          <a
            href="#how-it-works"
            className="text-sm font-medium text-white/70 hover:text-orange-primary transition-colors"
          >
            How It Works
          </a>
          <a
            href="#impact"
            className="text-sm font-medium text-white/70 hover:text-orange-primary transition-colors"
          >
            Impact
          </a>
          <a
            href="#about"
            className="text-sm font-medium text-white/70 hover:text-orange-primary transition-colors"
          >
            About
          </a>
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/auth">
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 bg-transparent rounded-full px-6"
            >
              Login
            </Button>
          </Link>
          <Link to="/auth">
            <Button className="bg-orange-primary hover:bg-orange-glow text-white rounded-full px-6 shadow-[0_0_15px_rgba(255,107,53,0.5)]">
              Register →
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full h-screen bg-background-dark/95 backdrop-blur-lg flex flex-col items-center pt-20 space-y-8 md:hidden">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="text-2xl font-bold text-white hover:text-orange-primary"
          >
            Home
          </Link>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="text-2xl font-bold text-white hover:text-orange-primary"
          >
            How It Works
          </a>
          <a
            href="#impact"
            onClick={() => setMobileMenuOpen(false)}
            className="text-2xl font-bold text-white hover:text-orange-primary"
          >
            Impact
          </a>
          <a
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="text-2xl font-bold text-white hover:text-orange-primary"
          >
            About
          </a>
          <div className="flex flex-col space-y-4 pt-8 w-64">
            <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent rounded-full py-6 text-lg"
              >
                Login
              </Button>
            </Link>
            <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-orange-primary hover:bg-orange-glow text-white rounded-full py-6 text-lg shadow-[0_0_15px_rgba(255,107,53,0.5)]">
                Register →
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
