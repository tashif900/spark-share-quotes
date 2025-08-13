import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { QuoteCard } from '@/components/QuoteCard';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Plus } from 'lucide-react';

interface Quote {
  id: string;
  content: string;
  author: string | null;
  created_at: string;
  users: {
    username: string;
  };
}

export const Profile = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchUserQuotes();
  }, [user, navigate]);

  const fetchUserQuotes = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          id,
          content,
          author,
          created_at,
          users!inner (
            username
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching quotes:', error);
        return;
      }

      setQuotes(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Your Quotes</h1>
            <p className="text-muted-foreground mt-2">
              {quotes.length} {quotes.length === 1 ? 'quote' : 'quotes'} shared
            </p>
          </div>
          <Button onClick={() => navigate('/submit')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Quote
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading your quotes...</p>
          </div>
        ) : quotes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              You haven't shared any quotes yet.
            </p>
            <Button onClick={() => navigate('/submit')}>
              <Plus className="h-4 w-4 mr-2" />
              Share Your First Quote
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quotes.map((quote) => (
              <QuoteCard
                key={quote.id}
                id={quote.id}
                content={quote.content}
                author={quote.author || undefined}
                username={quote.users.username}
                userId={user.id}
                createdAt={quote.created_at}
                showDeleteButton={true}
                onDelete={fetchUserQuotes}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};