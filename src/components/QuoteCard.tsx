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
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex flex-col h-full">
          <blockquote className="text-lg italic text-foreground mb-4 flex-grow">
            "{content}"
          </blockquote>
          
          <div className="flex items-center justify-between mt-auto">
            <div className="text-sm text-muted-foreground">
              {author && (
                <p className="font-medium">— {author}</p>
              )}
              <p>Shared by {username}</p>
              <p>{new Date(createdAt).toLocaleDateString()}</p>
            </div>
            
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
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