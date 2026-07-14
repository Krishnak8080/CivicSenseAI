import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

function Counter({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.5 });

  useEffect(() => {
    if (inView) {
      let start = 0;
      const endVal = end;
      if (start === endVal) return;

      const incrementTime = (duration / endVal) * 1000;
      const timer = setInterval(() => {
        start += Math.ceil(endVal / (duration * 60));
        if (start >= endVal) {
          setCount(endVal);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, incrementTime);

      return () => clearInterval(timer);
    }
  }, [inView, end, duration]);

  return <span ref={ref}>{count}</span>;
}

export function ImpactStats() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  const stats = [
    {
      number: 1000,
      label: 'Active Citizens',
      color: 'bg-orange-primary text-white',
      dot: 'bg-white',
    },
    {
      number: 450,
      label: 'Issues Reported',
      color: 'bg-[#222222] text-white',
      dot: 'bg-orange-primary',
    },
    {
      number: 280,
      label: 'Problems Resolved',
      color: 'bg-[#111111] text-white',
      dot: 'bg-green-500',
    },
    { number: 15, label: 'Cities Connected', color: 'bg-[#333333] text-white', dot: 'bg-blue-500' },
  ];

  return (
    <section className="py-24 bg-background-dark" id="impact">
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              className={`${stat.color} rounded-3xl p-8 flex flex-col justify-between aspect-square relative overflow-hidden group`}
            >
              {/* Decorative Dot */}
              <div className={`absolute top-8 left-8 w-3 h-3 rounded-full ${stat.dot}`} />

              <div className="mt-auto">
                <h3 className="text-6xl md:text-7xl font-black mb-2 tracking-tighter">
                  <Counter end={stat.number} />+
                </h3>
                <p className="text-xl font-medium opacity-80">{stat.label}</p>
              </div>

              {/* Hover effect */}
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
