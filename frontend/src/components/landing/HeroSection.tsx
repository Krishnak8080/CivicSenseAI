import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { ArrowDown } from 'lucide-react';

export function HeroSection() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,107,53,0.1)_0,transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Floating Orb */}
      <motion.div
        className="absolute right-[10%] top-[20%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full blur-[80px] md:blur-[120px] opacity-60 z-0 mix-blend-screen"
        style={{
          background: 'radial-gradient(circle, #FF6B35 0%, #D94B1F 50%, transparent 70%)',
          y,
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="container mx-auto px-6 z-10 relative">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-[100px] font-black tracking-tighter leading-[0.9] text-white mb-6">
              CIVIC SENSE <span className="text-orange-primary block">AI</span>
            </h1>
          </motion.div>

          <motion.h2
            className="text-2xl md:text-4xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          >
            Empowering Citizens. Transforming Communities.
          </motion.h2>

          <motion.p
            className="text-lg md:text-xl text-white/70 mb-2 font-medium"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          >
            A Make in India civic reporting system
          </motion.p>

          <motion.p
            className="text-lg md:text-xl text-white/50 max-w-2xl mb-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          >
            Report civic issues with a tap. Let AI prioritize what matters. Watch your community
            vote for change. See real impact.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
          >
            <Link to="/auth">
              <Button className="w-full sm:w-auto h-14 px-8 bg-orange-primary hover:bg-orange-glow text-white rounded-full text-lg shadow-[0_0_20px_rgba(255,107,53,0.4)] transition-all">
                Get Started
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button
                variant="outline"
                className="w-full sm:w-auto h-14 px-8 border-white/20 text-white hover:bg-white/10 bg-transparent rounded-full text-lg"
              >
                Learn More ↓
              </Button>
            </a>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center text-white/50"
        style={{ opacity }}
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="text-sm font-medium tracking-widest uppercase mb-2">
          Scroll to explore
        </span>
        <ArrowDown size={20} />
      </motion.div>
    </section>
  );
}
