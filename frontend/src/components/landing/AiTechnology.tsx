import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { BrainCircuit } from 'lucide-react';

export function AiTechnology() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  const aiFactors = [
    "Public safety impact",
    "Infrastructure severity",
    "Environmental concerns",
    "Community urgency"
  ];

  return (
    <section className="py-32 bg-background-darker relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      <div className="container mx-auto px-6 relative z-10" ref={ref}>
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Left: Visualization */}
          <motion.div 
            className="w-full lg:w-1/2 flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 1 }}
          >
            <div className="relative w-80 h-80 md:w-[500px] md:h-[500px] flex items-center justify-center">
              {/* Orbiting rings */}
              <motion.div 
                className="absolute inset-0 border border-orange-primary/20 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              <motion.div 
                className="absolute inset-8 border border-white/10 rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              />
              <motion.div 
                className="absolute inset-16 border border-orange-primary/30 rounded-full border-dashed"
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Central Brain */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-orange-primary/10 rounded-full blur-xl absolute" />
                <BrainCircuit size={80} className="text-orange-primary relative z-10" />
              </div>

              {/* Connecting Nodes */}
              {aiFactors.map((_, idx) => {
                const angle = (idx * 360) / aiFactors.length;
                return (
                  <motion.div 
                    key={idx}
                    className="absolute w-3 h-3 bg-orange-primary rounded-full shadow-[0_0_10px_#FF6B35]"
                    style={{
                      transform: `rotate(${angle}deg) translateY(-180px)`
                    }}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: idx * 0.5 }}
                  />
                );
              })}
            </div>
          </motion.div>

          {/* Right: Text */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <motion.h2 
              className="text-5xl md:text-6xl font-black text-white mb-8 tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8 }}
            >
              POWERED BY <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-primary to-orange-dark">AI</span>
            </motion.h2>
            
            <motion.p 
              className="text-xl md:text-2xl text-white/70 mb-8 font-light"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Our Claude-powered AI acts as a digital city planner. It analyzes every single report in real-time, scanning for:
            </motion.p>

            <ul className="space-y-4 mb-8 text-left inline-block lg:block">
              {aiFactors.map((factor, idx) => (
                <motion.li 
                  key={idx}
                  className="flex items-center gap-4 text-xl text-white font-medium"
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.5, delay: 0.3 + (idx * 0.1) }}
                >
                  <div className="w-2 h-2 bg-orange-primary rounded-full" />
                  {factor}
                </motion.li>
              ))}
            </ul>

            <motion.p 
              className="text-lg text-white/50 border-l-4 border-orange-primary pl-6 py-2 text-left"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              Then assigns an initial priority that the community can refine through democratic voting.
            </motion.p>
          </div>

        </div>
      </div>
    </section>
  );
}
