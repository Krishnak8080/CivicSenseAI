import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Camera, BrainCircuit, CheckCircle2 } from 'lucide-react';

export function SolutionSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const solutions = [
    {
      title: 'REPORT',
      icon: (
        <Camera
          size={32}
          className="text-orange-primary group-hover:scale-110 transition-transform duration-300"
        />
      ),
      items: [
        'Snap a photo of the issue',
        'Add description and location',
        'Submit in under 60 seconds',
      ],
    },
    {
      title: 'PRIORITIZE',
      icon: (
        <BrainCircuit
          size={32}
          className="text-orange-primary group-hover:scale-110 transition-transform duration-300"
        />
      ),
      items: [
        'AI analyzes severity automatically',
        'Assigns High/Medium/Low priority',
        'Community votes to adjust ranking',
      ],
    },
    {
      title: 'RESOLVE',
      icon: (
        <CheckCircle2
          size={32}
          className="text-orange-primary group-hover:scale-110 transition-transform duration-300"
        />
      ),
      items: [
        'Admin dashboard for authorities',
        'Track status: Pending → Resolved',
        'Real-time updates to citizens',
      ],
    },
  ];

  return (
    <section className="py-32 bg-[#0a0a0a] relative" id="how-it-works">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tight">
            How Civic Sense <span className="text-orange-primary">Works</span>
          </h2>
          <div className="w-24 h-2 bg-orange-primary mx-auto" />
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {solutions.map((solution, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="group bg-[#111111] hover:bg-[#1a1a1a] border border-white/5 hover:border-orange-primary/30 rounded-3xl p-10 transition-all duration-300 relative overflow-hidden"
            >
              {/* Hover Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-orange-primary/10 flex items-center justify-center mb-8 border border-orange-primary/20">
                  {solution.icon}
                </div>

                <h3 className="text-2xl font-bold text-white mb-6 tracking-wide">
                  {solution.title}
                </h3>

                <ul className="space-y-4">
                  {solution.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-white/60">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-primary mt-2 flex-shrink-0" />
                      <span className="text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
