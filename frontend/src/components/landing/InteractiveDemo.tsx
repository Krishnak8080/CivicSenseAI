import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Camera, BrainCircuit, Users, CheckCircle2 } from 'lucide-react';

export function InteractiveDemo() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Calculate the active step based on scroll progress (0 to 1)
  // We have 4 steps, so each step gets 0.25 of the progress
  const step1Opacity = useTransform(scrollYProgress, [0, 0.2, 0.25], [1, 1, 0.3]);
  const step2Opacity = useTransform(scrollYProgress, [0.2, 0.25, 0.45, 0.5], [0.3, 1, 1, 0.3]);
  const step3Opacity = useTransform(scrollYProgress, [0.45, 0.5, 0.7, 0.75], [0.3, 1, 1, 0.3]);
  const step4Opacity = useTransform(scrollYProgress, [0.7, 0.75, 1], [0.3, 1, 1]);

  const steps = [
    {
      opacity: step1Opacity,
      title: "1. Spot an issue in your neighborhood",
      icon: <Camera size={24} className="text-orange-primary" />
    },
    {
      opacity: step2Opacity,
      title: "2. AI instantly assigns priority based on severity",
      icon: <BrainCircuit size={24} className="text-orange-primary" />
    },
    {
      opacity: step3Opacity,
      title: "3. Community votes to refine priority",
      icon: <Users size={24} className="text-orange-primary" />
    },
    {
      opacity: step4Opacity,
      title: "4. Track progress until resolution",
      icon: <CheckCircle2 size={24} className="text-orange-primary" />
    }
  ];

  return (
    <section ref={containerRef} className="h-[400vh] bg-background-darker relative">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-primary/5 to-transparent blur-3xl opacity-50" />

        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Phone Mockup */}
          <div className="relative flex justify-center">
            <div className="relative w-[300px] h-[600px] bg-black border-4 border-white/20 rounded-[40px] shadow-2xl overflow-hidden z-10 flex flex-col">
              {/* Notch */}
              <div className="absolute top-0 inset-x-0 h-6 bg-black flex justify-center z-50 rounded-b-xl w-32 mx-auto"></div>
              
              {/* Phone Content Screen */}
              <div className="flex-1 bg-background-dark relative p-4 pt-12 overflow-hidden flex flex-col items-center justify-center">
                
                {/* Step 1 UI */}
                <motion.div 
                  className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
                  style={{ opacity: useTransform(scrollYProgress, [0, 0.2, 0.25], [1, 1, 0]) }}
                >
                  <div className="w-full h-48 bg-white/5 rounded-2xl mb-6 flex items-center justify-center border border-white/10 border-dashed">
                    <Camera size={40} className="text-white/20" />
                  </div>
                  <div className="h-4 w-3/4 bg-white/10 rounded mb-3" />
                  <div className="h-4 w-1/2 bg-white/10 rounded mb-8" />
                  <div className="w-full h-12 bg-orange-primary rounded-full" />
                </motion.div>

                {/* Step 2 UI */}
                <motion.div 
                  className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
                  style={{ opacity: useTransform(scrollYProgress, [0.2, 0.25, 0.45, 0.5], [0, 1, 1, 0]) }}
                >
                  <BrainCircuit size={60} className="text-orange-primary mb-6 animate-pulse" />
                  <div className="text-white text-xl font-bold mb-2">Analyzing...</div>
                  <div className="inline-block px-4 py-1.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/50 font-medium mb-8">
                    High Priority
                  </div>
                </motion.div>

                {/* Step 3 UI */}
                <motion.div 
                  className="absolute inset-0 flex flex-col items-start justify-start p-6 pt-12"
                  style={{ opacity: useTransform(scrollYProgress, [0.45, 0.5, 0.7, 0.75], [0, 1, 1, 0]) }}
                >
                  <div className="w-full bg-background-card border border-white/10 rounded-xl p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                       <div className="w-16 h-4 bg-red-500/50 rounded" />
                       <div className="w-8 h-4 bg-white/20 rounded" />
                    </div>
                    <div className="h-4 w-3/4 bg-white/20 rounded mb-4" />
                    <div className="flex gap-2">
                       <div className="w-10 h-8 bg-orange-primary/20 rounded border border-orange-primary/50 flex items-center justify-center">
                          <span className="text-orange-primary text-xs font-bold">▲ 12</span>
                       </div>
                       <div className="w-10 h-8 bg-white/5 rounded flex items-center justify-center">
                          <span className="text-white/40 text-xs">▼ 1</span>
                       </div>
                    </div>
                  </div>
                </motion.div>

                {/* Step 4 UI */}
                <motion.div 
                  className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
                  style={{ opacity: useTransform(scrollYProgress, [0.7, 0.75, 1], [0, 1, 1]) }}
                >
                  <CheckCircle2 size={60} className="text-green-500 mb-6" />
                  <div className="text-white text-2xl font-bold mb-2">Resolved</div>
                  <p className="text-white/60 text-sm">The city council has marked this issue as resolved.</p>
                </motion.div>

              </div>
            </div>
            {/* Ambient shadow behind phone */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[550px] bg-orange-primary/20 blur-[100px] z-0" />
          </div>

          {/* Right: Scrolling Text */}
          <div className="flex flex-col justify-center">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-16 uppercase tracking-tight">
              See It In <span className="text-orange-primary">Action</span>
            </h2>
            
            <div className="space-y-12 relative">
              {/* Progress Line */}
              <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-white/10 rounded">
                <motion.div 
                  className="w-full bg-orange-primary origin-top"
                  style={{ scaleY: scrollYProgress }}
                />
              </div>

              {steps.map((step, idx) => (
                <motion.div 
                  key={idx}
                  className="flex items-start gap-8 relative z-10"
                  style={{ opacity: step.opacity }}
                >
                  <div className="w-12 h-12 rounded-full bg-background-dark border-2 border-white/20 flex items-center justify-center flex-shrink-0 mt-1 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                      {step.title}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
