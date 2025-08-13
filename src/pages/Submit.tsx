
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigation } from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const Submit = () => {
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    console.log('Submit form state:', { 
      content: content, 
      contentLength: content.length, 
      contentTrimmed: content.trim(), 
      contentTrimmedLength: content.trim().length,
      loading: loading,
      buttonDisabled: loading || !content.trim(),
      user: user?.id 
    });
  }, [content, loading, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit attempt with:', { content: content.trim(), author: author.trim(), userId: user?.id });
    
    if (!user) {
      console.error('No user found');
      toast.error('Please log in to submit a quote');
      return;
    }
    
    if (!content.trim()) {
      console.error('No content provided');
      toast.error('Please enter quote content');
      return;
    }
    
    setLoading(true);

    try {
      console.log('Inserting quote to database...');
      const { data, error } = await supabase
        .from('quotes')
        .insert({
          content: content.trim(),
          author: author.trim() || null,
          user_id: user.id
        })
        .select();

      console.log('Insert result:', { data, error });

      if (error) {
        console.error('Database error:', error);
        toast.error('Failed to submit quote: ' + error.message);
        return;
      }

      console.log('Quote submitted successfully');
      toast.success('Quote submitted successfully!');
      setContent('');
      setAuthor('');
      navigate('/');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const isButtonDisabled = loading || !content.trim();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Submit a Quote</CardTitle>
              <CardDescription>
                Share an inspiring quote with the QuickQuotes community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="content">Quote Content *</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => {
                      console.log('Content changed to:', e.target.value);
                      setContent(e.target.value);
                    }}
                    required
                    placeholder="Enter the quote content..."
                    rows={4}
                    className="resize-none"
                  />
                  <div className="text-sm text-muted-foreground">
                    Characters: {content.length}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="author">Author (Optional)</Label>
                  <Input
                    id="author"
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Who said this quote?"
                  />
                </div>
                
                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    disabled={isButtonDisabled}
                    className={isButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    {loading ? 'Submitting...' : 'Submit Quote'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate('/')}>
                    Cancel
                  </Button>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Debug: Button disabled = {isButtonDisabled.toString()}, 
                  Loading = {loading.toString()}, 
                  Content empty = {(!content.trim()).toString()}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
