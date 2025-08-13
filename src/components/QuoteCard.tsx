import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface QuoteCardProps {
  id: string;
  content: string;
  author?: string;
  username: string;
  userId: string;
  createdAt: string;
  onDelete?: () => void;
  showDeleteButton?: boolean;
}

export const QuoteCard = ({ 
  id, 
  content, 
  author, 
  username, 
  userId, 
  createdAt, 
  onDelete,
  showDeleteButton = false 
}: QuoteCardProps) => {
  const { user } = useAuth();
  const canDelete = showDeleteButton && user?.id === userId;

  const handleDelete = async () => {
    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete quote');
      return;
    }

    toast.success('Quote deleted successfully');
    onDelete?.();
  };

  return (
    <Card className="group h-full bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.02] hover:border-primary/20 animate-fade-in">
      <CardContent className="p-6 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl group-hover:from-primary/10 transition-all duration-500" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-gradient-to-tr from-accent/5 to-transparent rounded-full blur-2xl group-hover:from-accent/10 transition-all duration-500" />
        
        <div className="flex flex-col h-full relative z-10">
          <div className="flex-grow">
            {/* Quote mark decoration */}
            <div className="text-6xl text-primary/20 font-serif leading-none mb-2 group-hover:text-primary/30 transition-colors duration-300">"</div>
            
            <blockquote className="text-lg leading-relaxed text-foreground/90 font-medium mb-4 relative">
              {content}
            </blockquote>
          </div>
          
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/30">
            <div className="text-sm space-y-1">
              {author && (
                <p className="font-semibold text-foreground/80 flex items-center">
                  <span className="w-1 h-4 bg-primary/60 rounded-full mr-2" />
                  {author}
                </p>
              )}
              <p className="text-muted-foreground flex items-center">
                <span className="w-1 h-3 bg-accent/60 rounded-full mr-2" />
                Shared by <span className="font-medium ml-1">{username}</span>
              </p>
              <p className="text-xs text-muted-foreground/70">
                {new Date(createdAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
            
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-all duration-200 hover:scale-105"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};