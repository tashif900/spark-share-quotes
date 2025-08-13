import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { QuoteCard } from '@/components/QuoteCard';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Plus } from 'lucide-react';

interface Quote {
  id: string;
  content: string;
  author: string | null;
  created_at: string;
  users: {
    username: string;
  };
  user_id: string;
}

const Index = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          id,
          content,
          author,
          created_at,
          user_id,
          users!inner (
            username
          )
        `)
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 rounded-3xl blur-3xl" />
          <div className="relative z-10 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-6 animate-fade-in">
              Discover Inspiring Quotes
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              A beautiful community-driven collection of wisdom, inspiration, and meaningful thoughts
            </p>
            
            {user && (
              <Button 
                onClick={() => navigate('/submit')} 
                size="lg"
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Plus className="h-5 w-5 mr-2" />
                Share a Quote
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading quotes...</p>
          </div>
        ) : quotes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No quotes have been shared yet.
            </p>
            {user ? (
              <Button onClick={() => navigate('/submit')}>
                <Plus className="h-4 w-4 mr-2" />
                Be the First to Share
              </Button>
            ) : (
              <Button onClick={() => navigate('/auth')}>
                Join to Share Quotes
              </Button>
            )}
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
                    userId={quote.user_id}
                    createdAt={quote.created_at}
                    showDeleteButton={false}
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

export default Index;
