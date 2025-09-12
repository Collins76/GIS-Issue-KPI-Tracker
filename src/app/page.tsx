'use client';

import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { type Issue } from '@/lib/types';
import { generateKpiAlert } from '@/ai/flows/real-time-kpi-alerts';
import { auth, database } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { ref, onValue, set, remove, update } from 'firebase/database';
import { useRouter } from 'next/navigation';

import AppHeader from '@/components/page/app-header';
import StatsCards from '@/components/page/stats-cards';
import IssueForm from '@/components/page/issue-form';
import IssueList from '@/components/page/issue-list';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { toast } = useToast();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false); 
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      const issuesRef = ref(database, `issues/${user.uid}`);
      const unsubscribeDB = onValue(issuesRef, (snapshot) => {
        const data = snapshot.val();
        const issuesList = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
        setIssues(issuesList);
        setIsLoading(false);
      }, (error) => {
        console.error(error);
        setIsLoading(false);
      });

      return () => unsubscribeDB();
    } else {
      setIssues([]);
    }
  }, [user]);

  const handleSaveIssue = async (data: Omit<Issue, 'id' | 'date'>) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be signed in to manage issues.",
      });
      return;
    }

    if (editingIssue) {
      const issueRef = ref(database, `issues/${user.uid}/${editingIssue.id}`);
      await update(issueRef, data);
      toast({
        title: "Success",
        description: "Issue updated successfully.",
        variant: 'default',
        className: 'bg-success text-success-foreground'
      });
      setEditingIssue(null);
    } else {
      const id = Date.now().toString();
      const newIssue: Omit<Issue, 'id'> = {
        ...data,
        date: new Date().toISOString(),
      };
      const issueRef = ref(database, `issues/${user.uid}/${id}`);
      await set(issueRef, newIssue);

      toast({
        title: "Success",
        description: "Issue reported successfully.",
        variant: 'default',
        className: 'bg-success text-success-foreground'
      });

      // Trigger AI alert
      try {
        const alertResult = await generateKpiAlert({
          role: data.role,
          kpiParameter: data.kpiParameter,
          description: data.description,
          priority: data.priority,
          status: data.status,
        });
        toast({
          title: "New KPI Alert",
          description: alertResult.alertMessage,
          variant: 'default',
          className: 'bg-secondary text-secondary-foreground'
        });
      } catch (error) {
        console.error("Failed to generate KPI alert:", error);
        toast({
          variant: "destructive",
          title: "AI Error",
          description: "Could not generate KPI alert.",
        });
      }
    }
  };

  const handleDeleteIssue = async (id: string) => {
     if (!user) {
      toast({ variant: "destructive", title: "Authentication Error", description: "You must be signed in to manage issues." });
      return;
    }
    if (window.confirm('Are you sure you want to delete this issue?')) {
      const issueRef = ref(database, `issues/${user.uid}/${id}`);
      await remove(issueRef);
      toast({
        title: "Success",
        description: "Issue deleted successfully.",
        variant: 'default',
        className: 'bg-destructive text-destructive-foreground'
      });
    }
  };

  const handleEditIssue = (id: string) => {
    const issueToEdit = issues.find((issue) => issue.id === id);
    if (issueToEdit) {
      setEditingIssue(issueToEdit);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const handleCancelEdit = () => {
    setEditingIssue(null);
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <AppHeader />
      <StatsCards issues={issues} />
      {user ? (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 animate-slide-in-left">
            <IssueForm 
              onSave={handleSaveIssue} 
              issueToEdit={editingIssue}
              onCancelEdit={handleCancelEdit}
            />
          </div>
          <div className="lg:col-span-2 animate-slide-in-right">
             {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-12 w-12 animate-spin text-secondary" />
                </div>
            ) : (
              <IssueList
                issues={issues}
                onEdit={handleEditIssue}
                onDelete={handleDeleteIssue}
              />
            )}
          </div>
        </div>
      ) : (
         <div className="text-center mt-16 p-8 bg-card rounded-xl shadow-lg animate-fade-in">
          {isLoading ? (
             <Loader2 className="h-12 w-12 animate-spin text-secondary" />
          ) : (
            <>
              <h2 className="text-2xl font-bold text-primary font-headline">Welcome to the GIS KPI Tracker</h2>
              <p className="mt-2 text-muted-foreground">Please sign in to report and track issues.</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
