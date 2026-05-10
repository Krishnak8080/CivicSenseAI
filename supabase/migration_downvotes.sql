-- RUN THIS FILE IN YOUR SUPABASE SQL EDITOR TO SUPPORT DOWNVOTES

-- 1. Add vote_type to the votes table (1 for upvote, -1 for downvote)
ALTER TABLE votes ADD COLUMN vote_type integer DEFAULT 1 CHECK (vote_type IN (1, -1));

-- 2. Drop the old triggers and functions
DROP TRIGGER IF EXISTS on_vote_insert ON votes;
DROP TRIGGER IF EXISTS on_vote_delete ON votes;
DROP FUNCTION IF EXISTS increment_votes;
DROP FUNCTION IF EXISTS decrement_votes;

-- 3. Create a unified function to handle insert, update, and delete
CREATE OR REPLACE FUNCTION handle_vote_change()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE reports SET votes_count = votes_count + NEW.vote_type WHERE id = NEW.report_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE reports SET votes_count = votes_count - OLD.vote_type WHERE id = OLD.report_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- If they changed from upvote to downvote or vice versa
    UPDATE reports SET votes_count = votes_count - OLD.vote_type + NEW.vote_type WHERE id = NEW.report_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create a single trigger for all events
CREATE TRIGGER on_vote_change
AFTER INSERT OR UPDATE OR DELETE ON votes
FOR EACH ROW EXECUTE FUNCTION handle_vote_change();
