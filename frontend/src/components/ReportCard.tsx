import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardHeader, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Button } from './ui/button';
import type { Report } from '../types';
import { motion } from 'framer-motion';

interface ReportCardProps {
  report: Report;
  onUpvote: (id: string) => void;
  onDownvote: (id: string) => void;
  voteType?: number; // 1 for upvote, -1 for downvote, 0 for none
}

export const ReportCard = React.forwardRef<HTMLDivElement, ReportCardProps>(({ report, onUpvote, onDownvote, voteType = 0 }, ref) => {
  const priorityColors = {
    high: 'bg-[var(--priority-high)]/10 text-[var(--priority-high)] border-[var(--priority-high)]/30',
    medium: 'bg-[var(--priority-medium)]/10 text-[var(--priority-medium)] border-[var(--priority-medium)]/30',
    low: 'bg-[var(--priority-low)]/10 text-[var(--priority-low)] border-[var(--priority-low)]/30',
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6"
    >
      <Card className="bg-[var(--bg-card)] border-[var(--border-subtle)] overflow-hidden transition-all duration-300 hover:border-[var(--orange-primary)]/50 hover:shadow-glow group">
        <CardHeader className="pb-3 px-5 pt-5">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg text-white group-hover:text-[var(--orange-primary)] transition-colors">
                {report.title}
              </h3>
              <div className="flex items-center text-sm text-[var(--text-muted)] mt-1.5">
                <MapPin className="w-3.5 h-3.5 mr-1 text-[var(--orange-primary)]" />
                <span className="truncate max-w-[200px] sm:max-w-xs">{report.location}</span>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <Badge variant="outline" className={`px-2.5 py-0.5 text-xs font-semibold ${priorityColors[report.priority]}`}>
                {report.priority.toUpperCase()}
              </Badge>
              {report.status === 'resolved' && (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold">
                  RESOLVED
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-4 px-5">
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed line-clamp-3">
            {report.description}
          </p>
          {report.image_url && (
            <div className="mt-4 relative rounded-lg overflow-hidden h-48 border border-[var(--border-subtle)]">
              <img 
                src={report.image_url} 
                alt="Reported Issue" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center px-5 py-4 bg-[var(--bg-elevated)]/50 border-t border-[var(--border-subtle)]">
          <span className="text-xs font-medium text-[var(--text-muted)]">
            Reported {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
          </span>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              className={`flex items-center space-x-2 px-4 py-2 h-10 rounded-md transition-all duration-200
                ${voteType === 1 
                  ? 'bg-[var(--orange-primary)]/10 text-[var(--orange-primary)] hover:bg-[var(--orange-primary)]/20 border border-[var(--orange-primary)]/30' 
                  : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--border-subtle)] border border-transparent'
                }`}
              onClick={() => onUpvote(report.id)}
            >
              <ArrowUpCircle className={`w-6 h-6 ${voteType === 1 ? 'fill-[var(--orange-primary)]/20 text-[var(--orange-primary)]' : ''}`} />
              <span className="font-semibold text-base">{report.votes_count}</span>
            </Button>
            <Button 
              variant="ghost" 
              className={`flex items-center justify-center w-10 h-10 rounded-md transition-all duration-200
                ${voteType === -1 
                  ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30' 
                  : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--border-subtle)] border border-transparent'
                }`}
              onClick={() => onDownvote(report.id)}
            >
              <ArrowDownCircle className={`w-6 h-6 ${voteType === -1 ? 'fill-blue-500/20 text-blue-400' : ''}`} />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
});
