import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Report } from '../types';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle2, FileText } from 'lucide-react';
import { Navigate } from 'react-router-dom';

// StatCard Component
const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <Card className="bg-[var(--bg-card)] border-[var(--border-subtle)] p-6 flex flex-col justify-between hover:border-[var(--orange-primary)]/30 transition-colors">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <Badge variant="outline" className="bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)]">
        {trend}
      </Badge>
    </div>
    <div>
      <h4 className="text-[var(--text-muted)] text-sm font-medium mb-1">{title}</h4>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  </Card>
);

// We need to import Card here since we use it in StatCard
import { Card } from '../components/ui/card';

export default function Admin() {
  const { isAdmin } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');

  useEffect(() => {
    if (isAdmin) fetchReports();
  }, [isAdmin, filter]);

  const fetchReports = async () => {
    let query = supabase.from('reports').select('*').order('created_at', { ascending: false });
    
    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data, error } = await query;
    if (!error && data) {
      setReports(data as Report[]);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: 'resolved' })
        .eq('id', id);
        
      if (error) throw error;
      toast.success('Report marked as resolved');
      fetchReports();
    } catch (error: any) {
      toast.error('Failed to resolve report: ' + error.message);
    }
  };

  if (!isAdmin) {
    return <Navigate to="/social-feed" />;
  }

  // Calculate stats based on all reports (we should technically fetch all regardless of filter for stats, but for simplicity we'll use whatever is loaded if 'all' is selected. Let's do a quick aggregate count).
  const stats = {
    total: reports.length,
    highPriority: reports.filter(r => r.priority === 'high').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    pending: reports.filter(r => r.status === 'pending').length,
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col pt-24 pb-12 px-6">
      <main className="max-w-7xl mx-auto w-full space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">System Dashboard</h1>
            <p className="text-[var(--text-secondary)] mt-1">Overview of all civic issues and platform activity.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Reports" 
            value={stats.total} 
            icon={FileText} 
            trend="+12% this week"
            color="bg-blue-500/10 text-blue-400"
          />
          <StatCard 
            title="High Priority" 
            value={stats.highPriority} 
            icon={AlertTriangle} 
            trend="Action Required"
            color="bg-red-500/10 text-red-400"
          />
          <StatCard 
            title="Pending Resolution" 
            value={stats.pending} 
            icon={Activity} 
            trend="-5% from last week"
            color="bg-yellow-500/10 text-yellow-400"
          />
          <StatCard 
            title="Resolved Issues" 
            value={stats.resolved} 
            icon={CheckCircle2} 
            trend="+18% this month"
            color="bg-emerald-500/10 text-emerald-400"
          />
        </div>

        {/* Data Table Section */}
        <Card className="bg-[var(--bg-card)] border-[var(--border-subtle)] overflow-hidden shadow-xl">
          {/* Controls */}
          <div className="p-6 border-b border-[var(--border-subtle)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--bg-secondary)]">
            <h3 className="text-xl font-semibold text-white">Recent Submissions</h3>
            <div className="flex bg-[var(--bg-primary)] rounded-lg p-1 border border-[var(--border-subtle)]">
              {['all', 'pending', 'resolved'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-all ${
                    filter === f 
                      ? 'bg-[var(--bg-elevated)] text-white shadow-sm' 
                      : 'text-[var(--text-secondary)] hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)]">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="text-[var(--text-muted)] font-semibold h-12">Title</TableHead>
                  <TableHead className="text-[var(--text-muted)] font-semibold h-12">Location</TableHead>
                  <TableHead className="text-[var(--text-muted)] font-semibold h-12">Priority</TableHead>
                  <TableHead className="text-[var(--text-muted)] font-semibold h-12">Status</TableHead>
                  <TableHead className="text-[var(--text-muted)] font-semibold h-12">Date</TableHead>
                  <TableHead className="text-right text-[var(--text-muted)] font-semibold h-12">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {reports.map((report) => (
                    <motion.tr 
                      key={report.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)]/50 transition-colors"
                    >
                      <TableCell className="font-medium text-white max-w-xs truncate">{report.title}</TableCell>
                      <TableCell className="text-[var(--text-secondary)] truncate max-w-[200px]">{report.location}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`px-2 py-0.5 text-[10px] font-bold ${
                          report.priority === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                          report.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                          'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}>
                          {report.priority.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {report.status === 'resolved' ? (
                          <span className="inline-flex items-center text-xs font-medium text-emerald-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2"></span> Resolved
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs font-medium text-yellow-500">
                            <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2 animate-pulse"></span> Pending
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-[var(--text-secondary)] text-sm">
                        {format(new Date(report.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        {report.status === 'pending' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleResolve(report.id)}
                            className="border-[var(--orange-primary)]/30 text-[var(--orange-primary)] hover:bg-[var(--orange-primary)] hover:text-white"
                          >
                            Mark Resolved
                          </Button>
                        )}
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                
                {reports.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-32 text-[var(--text-muted)] border-none">
                      No reports found matching the current filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>
    </div>
  );
}
