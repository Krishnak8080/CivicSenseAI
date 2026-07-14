import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { XCircle, AlertTriangle, EyeOff, Users } from 'lucide-react';

export function ProblemSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const fadeUpVariant: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const problems = [
    { icon: <XCircle className="text-red-500" size={24} />, text: 'Civic issues go unreported' },
    {
      icon: <AlertTriangle className="text-red-500" size={24} />,
      text: 'No system to track neighborhood problems',
    },
    {
      icon: <EyeOff className="text-red-500" size={24} />,
      text: 'Government lacks real-time citizen feedback',
    },
    { icon: <Users className="text-red-500" size={24} />, text: 'Community voices remain unheard' },
  ];

  return (
    <section className="py-32 bg-background-dark relative border-t border-white/5" ref={ref}>
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left Column */}
          <motion.div
            className="w-full lg:w-3/5"
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            variants={fadeUpVariant}
          >
            <h2 className="text-5xl md:text-7xl font-black text-white mb-6 uppercase tracking-tight">
              The{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-primary to-orange-dark">
                Problem
              </span>
            </h2>
            <div className="w-24 h-2 bg-orange-primary mb-8" />
            <p className="text-xl md:text-2xl text-white/60 font-light leading-relaxed max-w-2xl">
              Cities are growing faster than our ability to maintain them. Traditional reporting
              methods are slow, opaque, and discourage citizen participation.
            </p>
          </motion.div>

          {/* Right Column */}
          <motion.div
            className="w-full lg:w-2/5"
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            variants={staggerContainer}
          >
            <div className="bg-background-card border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -mr-20 -mt-20" />

              <ul className="space-y-8 relative z-10">
                {problems.map((problem, idx) => (
                  <motion.li key={idx} className="flex items-center gap-6" variants={fadeUpVariant}>
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                      {problem.icon}
                    </div>
                    <span className="text-lg md:text-xl text-white font-medium">
                      {problem.text}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
