import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-[#050505] pt-20 pb-10 border-t border-white/10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          
          {/* Column 1 */}
          <div>
            <Link to="/" className="text-3xl font-black tracking-tighter text-white inline-block mb-4">
              CIVIC SENSE <span className="text-orange-primary">AI</span>
            </Link>
            <p className="text-white/60 text-lg mb-6 max-w-sm">
              A Make in India initiative empowering citizens through AI and community voting.
            </p>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-4">
              <li><a href="#about" className="text-white/60 hover:text-orange-primary transition-colors">About Us</a></li>
              <li><a href="#how-it-works" className="text-white/60 hover:text-orange-primary transition-colors">How It Works</a></li>
              <li><a href="#" className="text-white/60 hover:text-orange-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-white/60 hover:text-orange-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Connect</h4>
            <ul className="space-y-4">
              <li><a href="mailto:support@civicsenseai.in" className="text-white/60 hover:text-orange-primary transition-colors">support@civicsenseai.in</a></li>
              <li><a href="#" className="text-white/60 hover:text-orange-primary transition-colors">Twitter</a></li>
              <li><a href="#" className="text-white/60 hover:text-orange-primary transition-colors">LinkedIn</a></li>
              <li><a href="#" className="text-white/60 hover:text-orange-primary transition-colors">GitHub</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm text-center md:text-left">
            &copy; 2026 Civic Sense AI. All rights reserved.
          </p>
          <p className="text-white/40 text-sm flex items-center gap-2">
            Built for India, by Indians. <span className="inline-block w-4 h-4 rounded-full bg-gradient-to-br from-[#FF9933] via-white to-[#138808]" />
          </p>
        </div>
      </div>
    </footer>
  );
}
