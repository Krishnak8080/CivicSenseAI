import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';

export function CallToAction() {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Massive Gradient Background */}
      <div className="absolute inset-0 bg-background-dark z-0" />
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[50vw] md:h-[50vw] bg-orange-primary/20 blur-[150px] rounded-full z-0"
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-5xl md:text-7xl lg:text-[90px] font-black text-white mb-8 tracking-tighter leading-none">
            READY TO MAKE A <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-primary to-orange-glow">DIFFERENCE?</span>
          </h2>
          
          <p className="text-2xl md:text-3xl text-white/80 mb-12 max-w-3xl mx-auto font-light">
            Join thousands of citizens creating cleaner, safer communities across India.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Link to="/auth">
              <Button className="w-full sm:w-auto h-16 px-10 bg-white text-background-dark hover:bg-gray-200 rounded-full text-xl font-bold shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all hover:scale-105">
                Register Now
              </Button>
            </Link>
            <Button variant="outline" className="w-full sm:w-auto h-16 px-10 border-white/20 text-white hover:bg-white/10 bg-transparent rounded-full text-xl font-bold transition-all hover:scale-105">
              Download App (Coming Soon)
            </Button>
          </div>

          <p className="text-lg text-white/40">
            Start with your first report. It takes 60 seconds.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
