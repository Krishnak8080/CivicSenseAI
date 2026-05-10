export interface Profile {
  id: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  title: string;
  description: string;
  location: string;
  formatted_address?: string;
  latitude: number;
  longitude: number;
  image_url: string | null;
  priority: 'low' | 'medium' | 'high';
  current_priority?: 'low' | 'medium' | 'high';
  status: 'pending' | 'resolved';
  votes_count: number;
  created_at: string;
}

export interface Vote {
  id: string;
  user_id: string;
  report_id: string;
  vote_type: number;
  created_at: string;
}
