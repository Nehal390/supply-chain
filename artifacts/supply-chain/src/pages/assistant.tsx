import { useState, useRef, useEffect } from "react";
import { useAiChat, useListAlerts, useListShortages, AiChatMessage } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Bot, User, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default function Assistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { data: alerts } = useListAlerts();
  const { data: shortages } = useListShortages();
  
  const chatMutation = useAiChat();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, chatMutation.isPending]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: AiChatMessage = { role: "user", content: input };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput("");

    try {
      const activeAlerts = alerts?.filter(a => !a.resolved).length || 0;
      const criticalShortages = shortages?.length || 0;
      
      const contextStr = `Current context: ${activeAlerts} active alerts, ${criticalShortages} critical shortages. User role: ${user?.role}.`;

      const response = await chatMutation.mutateAsync({
        data: { message: `${contextStr}\n\n${input}` }
      });

      setMessages([...newHistory, { role: "assistant", content: response.reply }]);
    } catch (error) {
      // Handle error quietly or show toast
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <MessageSquare className="w-8 h-8 text-primary" />
          Network Assistant
        </h1>
        <p className="text-muted-foreground">Ask questions about inventory, fulfillment, or network health.</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-primary/20 shadow-md">
        <CardHeader className="bg-muted/30 border-b py-4">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            Supply Chain AI
          </CardTitle>
        </CardHeader>
        
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-muted-foreground space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Bot className="w-8 h-8 text-primary" />
                </div>
                <p>Hello! I'm your Smart Supply Chain Assistant.<br/>I can help you analyze inventory, check alerts, or suggest fulfillment routes.</p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <BadgeButton onClick={() => setInput("What are the most critical shortages right now?")}>Check Shortages</BadgeButton>
                  <BadgeButton onClick={() => setInput("Show me active alerts.")}>View Alerts</BadgeButton>
                  <BadgeButton onClick={() => setInput("How is our on-time delivery holding up?")}>Delivery Stats</BadgeButton>
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={cn("flex gap-3 max-w-[85%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={cn("rounded-2xl px-4 py-2.5 text-sm", msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted")}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {chatMutation.isPending && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="rounded-2xl px-4 py-2.5 bg-muted text-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  Thinking...
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <CardFooter className="p-3 border-t bg-background">
          <form onSubmit={handleSend} className="flex w-full gap-2">
            <Input 
              placeholder="Ask anything about the supply chain..." 
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1"
              disabled={chatMutation.isPending}
              data-testid="input-chat"
            />
            <Button type="submit" size="icon" disabled={!input.trim() || chatMutation.isPending} data-testid="button-send">
              <Send className="w-4 h-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}

function BadgeButton({ children, onClick }: { children: React.ReactNode, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="text-xs px-3 py-1.5 rounded-full bg-background border hover:bg-muted transition-colors text-foreground"
    >
      {children}
    </button>
  );
}