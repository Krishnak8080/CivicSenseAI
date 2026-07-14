import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Laptop, Code, Server, Database } from 'lucide-react';

export function AboutUs() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3 },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  const team = [
    {
      name: 'Lakshay Agarwal',
      role: 'Backend Architect',
      icon: <Server className="text-orange-primary" size={28} />,
      roleColor: 'from-orange-500/20 to-red-500/20 border-orange-500/30 text-orange-400',
      description:
        'Engineered the core backend structure, database design, and real-time processing pipelines. Managed Supabase integration, authentication schemes, API orchestration, and server logic.',
      skills: ['Supabase', 'PostgreSQL', 'API Design', 'Database Schemas', 'Auth & Security'],
      stats: { label: 'Backend System Complexity', value: '98%' },
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      techIcon: (
        <Database className="text-orange-primary/40 absolute -right-4 -bottom-4 w-32 h-32 transform rotate-12 pointer-events-none" />
      ),
    },
    {
      name: 'Hiten Gupta',
      role: 'Frontend & UI/UX Developer',
      icon: <Laptop className="text-orange-primary" size={28} />,
      roleColor: 'from-blue-500/20 to-purple-500/20 border-blue-500/30 text-blue-400',
      description:
        'Crafted the entire user interface and user experience. Designed the dark theme layout, responsive interactive dashboard, citizen feed views, and client-side logic and integrations.',
      skills: ['React.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'UI/UX Design'],
      stats: { label: 'UI Performance & Polish', value: '100%' },
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      techIcon: (
        <Code className="text-orange-primary/40 absolute -right-4 -bottom-4 w-32 h-32 transform rotate-12 pointer-events-none" />
      ),
    },
  ];

  return (
    <section className="py-32 bg-[#050505] relative overflow-hidden" id="about">
      {/* Decorative background grid and glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-orange-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-orange-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Heading */}
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-orange-primary uppercase tracking-widest text-sm font-black mb-3 inline-block">
            The Creators
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tight">
            Meet Our <span className="text-orange-primary">Developers</span>
          </h2>
          <div className="w-24 h-2 bg-orange-primary mx-auto mb-6" />
          <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            The engineering team behind Civic Sense AI, combining robust backend capabilities with
            premium user experiences.
          </p>
        </motion.div>

        {/* Profiles Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto"
        >
          {team.map((member, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              className="group relative bg-[#0e0e0e] hover:bg-[#141414] border border-white/5 hover:border-orange-primary/30 rounded-3xl p-8 md:p-10 transition-all duration-500 overflow-hidden shadow-2xl flex flex-col justify-between"
            >
              {/* Corner accent glow */}
              <div className="absolute top-0 left-0 w-24 h-24 bg-orange-primary/5 rounded-full blur-2xl group-hover:bg-orange-primary/10 transition-all duration-500" />

              {/* Background technical SVG icon */}
              {member.techIcon}

              <div className="relative z-10">
                {/* Header info */}
                <div className="flex items-center gap-5 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-orange-primary/10 flex items-center justify-center border border-orange-primary/20 shadow-[0_0_15px_rgba(255,107,53,0.1)] group-hover:scale-105 transition-transform duration-300">
                    {member.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                      {member.name}
                    </h3>
                    <span
                      className={`inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border bg-gradient-to-r mt-1 ${member.roleColor}`}
                    >
                      {member.role}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-white/70 text-base md:text-lg mb-8 font-light leading-relaxed">
                  {member.description}
                </p>

                {/* Skill Chips */}
                <div className="mb-8">
                  <h4 className="text-white/40 text-xs uppercase tracking-wider font-bold mb-3">
                    Key Focus Areas
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {member.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-xs font-semibold bg-[#1a1a1a] hover:bg-[#222] text-white/80 border border-white/5 rounded-lg px-3 py-1.5 transition-colors duration-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer part with social icons and minor stats */}
              <div className="relative z-10 pt-6 border-t border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-black block">
                    {member.stats.label}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-orange-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={inView ? { width: member.stats.value } : { width: 0 }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                      />
                    </div>
                    <span className="text-xs font-bold text-white/80">{member.stats.value}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-[#181818] hover:bg-orange-primary hover:text-white text-white/60 border border-white/5 flex items-center justify-center transition-all duration-300 hover:scale-105"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                  </a>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-[#181818] hover:bg-orange-primary hover:text-white text-white/60 border border-white/5 flex items-center justify-center transition-all duration-300 hover:scale-105"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
