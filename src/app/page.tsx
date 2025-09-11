'use client';

import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import useLocalStorage from '@/hooks/use-local-storage';
import { type Issue } from '@/lib/types';
import { generateKpiAlert } from '@/ai/flows/real-time-kpi-alerts';

import AppHeader from '@/components/page/app-header';
import StatsCards from '@/components/page/stats-cards';
import IssueForm from '@/components/page/issue-form';
import IssueList from '@/components/page/issue-list';

export default function Home() {
  const { toast } = useToast();
  const [issues, setIssues] = useLocalStorage<Issue[]>('gisKpiIssues', []);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);

  const handleSaveIssue = async (data: Omit<Issue, 'id' | 'date'>) => {
    if (editingIssue) {
      const updatedIssues = issues.map((issue) =>
        issue.id === editingIssue.id ? { ...issue, ...data } : issue
      );
      setIssues(updatedIssues);
      toast({
        title: "Success",
        description: "Issue updated successfully.",
        variant: 'default',
        className: 'bg-success text-success-foreground'
      });
      setEditingIssue(null);
    } else {
      const newIssue: Issue = {
        id: Date.now().toString(),
        ...data,
        date: new Date().toISOString(),
      };
      setIssues([...issues, newIssue]);
      toast({
        title: "Success",
        description: "Issue reported successfully.",
        variant: 'default',
        className: 'bg-success text-success-foreground'
      });

      // Trigger AI alert
      try {
        const alertResult = await generateKpiAlert({
          role: newIssue.role,
          kpiParameter: newIssue.kpiParameter,
          description: newIssue.description,
          priority: newIssue.priority,
          status: newIssue.status,
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

  const handleDeleteIssue = (id: string) => {
    if (window.confirm('Are you sure you want to delete this issue?')) {
      setIssues(issues.filter((issue) => issue.id !== id));
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
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 animate-slide-in-left">
          <IssueForm 
            onSave={handleSaveIssue} 
            issueToEdit={editingIssue}
            onCancelEdit={handleCancelEdit}
          />
        </div>
        <div className="lg:col-span-2 animate-slide-in-right">
          <IssueList
            issues={issues}
            onEdit={handleEditIssue}
            onDelete={handleDeleteIssue}
          />
        </div>
      </div>
    </div>
  );
}
