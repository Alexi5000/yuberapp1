import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Calendar, X } from 'lucide-react';

interface RebookingPromptProps {
  serviceName: string;
  lastProviderName: string;
  lastDate: string;
  onRebook: () => void;
  onDismiss: () => void;
}

export default function RebookingPrompt({ 
  serviceName = "House Cleaning", 
  lastProviderName = "Maria G.", 
  lastDate = "2 weeks ago",
  onRebook, 
  onDismiss 
}: RebookingPromptProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-white shadow-xl animate-in fade-in zoom-in duration-300">
        <CardHeader className="relative pb-2">
          <div className="absolute top-4 right-4">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDismiss}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-center text-lg">Time to book again?</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            It's been {lastDate} since your last {serviceName.toLowerCase()} with {lastProviderName}.
          </p>
          <div className="flex items-center justify-center gap-2 p-3 bg-muted/50 rounded-lg mt-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Keep your schedule on track</span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 pt-2">
          <Button className="w-full" onClick={onRebook}>
            Rebook {lastProviderName}
          </Button>
          <Button variant="ghost" className="w-full" onClick={onDismiss}>
            Maybe later
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
