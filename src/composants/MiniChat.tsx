import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Send, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MiniChatProps {
  lessonId: string;
}

const MiniChat = ({ lessonId }: MiniChatProps) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();

  const { data: messages } = useQuery({
    queryKey: ['chat', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('user_id', user!.id)
        .order('created_at');
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const sendMessage = useMutation({
    mutationFn: async (msg: string) => {
      const { error } = await supabase.from('chat_messages').insert({
        user_id: user!.id,
        lesson_id: lessonId,
        message: msg,
        is_ai_response: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', lessonId] });
      setMessage('');
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessage.mutate(message.trim());
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-3 border-b border-border flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold">Questions & Discussion</span>
      </div>
      <ScrollArea className="h-64 p-4">
        {messages?.length === 0 && (
          <p className="text-sm text-muted-foreground text-center mt-8">
            Posez vos questions ici pendant la leçon
          </p>
        )}
        <div className="space-y-3">
          {messages?.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.is_ai_response ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  msg.is_ai_response
                    ? 'bg-secondary text-secondary-foreground'
                    : 'bg-primary/10 text-foreground'
                }`}
              >
                {msg.message}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <form onSubmit={handleSend} className="p-3 border-t border-border flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Posez votre question..."
          className="flex-1 bg-secondary border-border text-sm"
        />
        <Button type="submit" size="icon" disabled={!message.trim()} className="bg-primary text-primary-foreground">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default MiniChat;
