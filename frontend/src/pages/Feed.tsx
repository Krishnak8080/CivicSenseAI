import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ReportCard } from '../components/ReportCard';
import { MapSection } from '../components/MapSection';
import type { Report } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export default function Feed() {
  const { user } = useAuth();
  const location = useLocation();
  const [reports, setReports] = useState<Report[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});
  const reportRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Animation Sequence States
  const justLoggedIn = location.state?.justLoggedIn || false;
  const [showOverlay, setShowOverlay] = useState(justLoggedIn);
  const [feedVisible, setFeedVisible] = useState(!justLoggedIn);
  const [mapVisible, setMapVisible] = useState(!justLoggedIn);

  useEffect(() => {
    if (justLoggedIn) {
      const t1 = setTimeout(() => setShowOverlay(false), 3000);
      const t2 = setTimeout(() => setFeedVisible(true), 3500);
      const t3 = setTimeout(() => setMapVisible(true), 4200);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [justLoggedIn]);

  useEffect(() => {
    fetchReports();
    if (user) fetchUserVotes();

    const subscription = supabase
      .channel('public:reports')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, () => {
        fetchReports();
      })
      .subscribe();

    const handleReportSubmitted = () => {
      fetchReports();
    };
    window.addEventListener('reportSubmitted', handleReportSubmitted);

    return () => {
      supabase.removeChannel(subscription);
      window.removeEventListener('reportSubmitted', handleReportSubmitted);
    };
  }, [user]);

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReports(data as Report[]);
    }
  };

  const fetchUserVotes = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('votes')
      .select('report_id, vote_type')
      .eq('user_id', user.id);

    if (data) {
      const votesRecord: Record<string, number> = {};
      data.forEach((v) => {
        votesRecord[v.report_id] = v.vote_type;
      });
      setUserVotes(votesRecord);
    }
  };

  const handleVote = async (reportId: string, type: number) => {
    if (!user) return;

    const currentVote = userVotes[reportId] || 0;

    try {
      if (currentVote === type) {
        // Toggle off the vote
        await supabase.from('votes').delete().match({ user_id: user.id, report_id: reportId });
        setUserVotes((prev) => {
          const next = { ...prev };
          delete next[reportId];
          return next;
        });
      } else if (currentVote === 0) {
        // New vote
        await supabase
          .from('votes')
          .insert({ user_id: user.id, report_id: reportId, vote_type: type });
        setUserVotes((prev) => ({ ...prev, [reportId]: type }));
      } else {
        // Change vote type
        await supabase
          .from('votes')
          .update({ vote_type: type })
          .match({ user_id: user.id, report_id: reportId });
        setUserVotes((prev) => ({ ...prev, [reportId]: type }));
      }
    } catch (error) {
      console.error('Error voting', error);
    }
  };

  const handleMarkerClick = (reportId: string) => {
    const element = reportRefs.current[reportId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Optional: add a quick flash animation by adding a class then removing it
      element.classList.add('ring-2', 'ring-[var(--orange-primary)]', 'shadow-glow');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-[var(--orange-primary)]', 'shadow-glow');
      }, 1500);
    }
  };

  return (
    <>
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="fixed inset-0 bg-black z-[100] flex items-center justify-center"
          >
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-white text-3xl md:text-5xl font-black tracking-[0.4em] text-center"
            >
              LOCATING
              <br />
              <span className="text-[var(--orange-primary)]">COMMUNITY</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex h-screen w-full pt-[72px] overflow-hidden bg-[var(--bg-primary)]">
        {/* Left side: Scrollable Social Feed */}
        <motion.div
          initial={{ x: justLoggedIn ? -50 : 0, opacity: justLoggedIn ? 0 : 1 }}
          animate={{ x: feedVisible ? 0 : -50, opacity: feedVisible ? 1 : 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="w-full lg:w-[45%] xl:w-[40%] h-full flex flex-col border-r border-[var(--border-subtle)] relative z-10 bg-[var(--bg-secondary)] shadow-2xl"
        >
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">Local Issues Feed</h2>
              <p className="text-[var(--text-secondary)] mt-1">
                Review and prioritize reports in your community.
              </p>
            </motion.div>

            {reports.length === 0 ? (
              <div className="text-center text-[var(--text-muted)] mt-20 p-8 border border-dashed border-[var(--border-subtle)] rounded-xl bg-[var(--bg-card)]">
                <p className="text-lg">No reports found.</p>
                <p className="text-sm mt-2">Be the first to report an issue in your area!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {reports.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    ref={(el) => {
                      reportRefs.current[report.id] = el;
                    }}
                    onUpvote={(id) => handleVote(id, 1)}
                    onDownvote={(id) => handleVote(id, -1)}
                    voteType={userVotes[report.id] || 0}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Right side: Sticky Interactive Map */}
        <motion.div
          initial={{ opacity: justLoggedIn ? 0 : 1, scale: justLoggedIn ? 0.95 : 1 }}
          animate={{ opacity: mapVisible ? 1 : 0, scale: mapVisible ? 1 : 0.95 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="hidden lg:block lg:w-[55%] xl:w-[60%] h-full relative"
        >
          {/* Always mount map to prevent loading flicker during animation, just control visibility via framer motion */}
          <MapSection reports={reports} onMarkerClick={handleMarkerClick} />
        </motion.div>
      </div>
    </>
  );
}
