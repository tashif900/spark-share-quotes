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
        <div className="flex items-center justify-between mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 rounded-2xl blur-2xl" />
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-3">
              Your Quotes
            </h1>
            <p className="text-lg text-muted-foreground flex items-center">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-primary/20 text-primary text-sm font-semibold rounded-full mr-3">
                {quotes.length}
              </span>
              {quotes.length === 1 ? 'inspiring quote' : 'inspiring quotes'} shared
            </p>
          </div>
          <Button 
            onClick={() => {
              console.log('Add Quote button clicked');
              navigate('/submit');
            }}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
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
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
              {quotes.map((quote, index) => (
                <div 
                  key={quote.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <QuoteCard
                    id={quote.id}
                    content={quote.content}
                    author={quote.author || undefined}
                    username={quote.users.username}
                    userId={user.id}
                    createdAt={quote.created_at}
                    showDeleteButton={true}
                    onDelete={fetchUserQuotes}
                  />
                </div>
              ))}
            </div>
            
            {/* Decorative background elements */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 -left-32 w-64 h-64 bg-gradient-to-tr from-accent/5 to-transparent rounded-full blur-3xl pointer-events-none" />
          </div>
        )}
      </div>
    </div>
  );
};