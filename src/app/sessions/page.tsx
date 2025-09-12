
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { auth, database } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, History, Home } from 'lucide-react';
import Link from 'next/link';

type Session = {
  id: string;
  loginTime: number;
};

export default function SessionsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchSessions(currentUser.uid);
      } else {
        router.push('/');
      }
      setIsAuthenticating(false);
    });
    return () => unsubscribe();
  }, [router]);

  const fetchSessions = (userId: string) => {
    setIsLoading(true);
    const sessionsRef = ref(database, `users/${userId}/sessions`);
    onValue(sessionsRef, (snapshot) => {
      const data = snapshot.val();
      const sessionsList: Session[] = data
        ? Object.keys(data).map(key => ({ id: key, ...data[key] })).sort((a, b) => b.loginTime - a.loginTime)
        : [];
      setSessions(sessionsList);
      setIsLoading(false);
    }, (error) => {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Database Error",
        description: "Could not fetch session history.",
      });
      setIsLoading(false);
    });
  };

  const formatTimestamp = (timestamp: number) => {
    if (!timestamp) return 'N/A';
    return format(new Date(timestamp), 'PPpp'); // e.g., May 15, 2024, 10:43:11 AM
  };

  if (isAuthenticating) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="text-white p-8 rounded-xl mb-8 text-center animate-fade-in shadow-lg bg-gradient-to-r from-primary to-secondary relative">
        <div className="absolute top-4 left-4">
            <Button asChild variant="secondary">
                <Link href="/">
                    <Home className="mr-2 h-4 w-4" /> Back to Home
                </Link>
            </Button>
        </div>
        <h1 className="text-4xl font-bold font-headline flex items-center justify-center gap-3">
          <History className="w-10 h-10 glowing-icon" />
          Session History
        </h1>
        <p className="mt-2 text-lg opacity-90">
          Review your recent login activity.
        </p>
      </header>

      <Card className="shadow-lg border-none bg-card animate-slide-in-right">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-primary">
              <History className="glowing-icon" />
              Your Login Sessions
            </CardTitle>
            <CardDescription>
              Here is a list of your most recent login times.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Session ID</TableHead>
                    <TableHead>Login Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={2} className="h-24 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                      </TableCell>
                    </TableRow>
                  ) : sessions.length > 0 ? (
                    sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium max-w-[150px] sm:max-w-xs truncate text-muted-foreground">{session.id}</TableCell>
                        <TableCell className="font-semibold">{formatTimestamp(session.loginTime)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="h-24 text-center">
                        No session history found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
