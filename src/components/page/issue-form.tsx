'use client';

import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Send, RotateCcw, Loader2 } from 'lucide-react';
import { Issue, ROLES, PRIORITIES, STATUSES, Role } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { useIsClient } from '@/hooks/use-is-client';

const kpiData: Record<Role, string[]> = {
    "GIS Coordinator": [
        "Develop and implement a comprehensive 2 GIS strategy to support Ikeja Electric's business goals",
        "Full integration of GIS data to ensure 100% accuracy in capturing all IE network assets",
        "Provide technical and mentorship training to GIS Leads, Specialists and Analysts",
        "Complete 100% of GIS projects within agreed timelines to support organizational objectives",
        "Identify and implement one outstanding new technology to improve network efficiency and reliability"
    ],
    "GIS Lead": [
        "Complete 100% of GIS projects within agreed timelines to support organizational objectives",
        "Provide technical and mentorship training to GIS Specialists and Analysts",
        "Ensure the accuracy and quality of all GIS data and map products delivered by the team",
        "Full integration of GIS data to ensure 100% accuracy in capturing all IE network assets",
        "Identify and implement one outstanding new technology to improve network efficiency and reliability"
    ],
    "GIS Specialist": [
        "Complete 100% of GIS projects within agreed timelines to support organizational objectives",
        "Provide technical and mentorship training to GIS Analysts",
        "Full integration of GIS data to ensure 100% accuracy in capturing all IE network assets",
        "Resolve 100% of GIS technical issues within 24 hours",
        "Identify and implement one outstanding new technology to improve network efficiency and reliability"
    ],
    "Geodatabase Specialist": [
        "Ensure the integrity, security, and optimal performance of the enterprise geodatabase",
        "Provide technical and mentorship training to GIS Analysts",
        "Ensure the accuracy and quality of all GIS data during maintenance window with the commercial department",
        "Full integration of GIS data to ensure 100% accuracy in capturing all IE network assets",
        "Identify and implement one outstanding new technology to improve network efficiency and reliability"
    ],
    "GIS Analyst": [
        "Capture, process, and integrate spatial and non-spatial data from various sources into the GIS database",
        "Perform quality assurance checks on all incoming and existing GIS data to ensure accuracy and completeness",
        "Full integration of GIS data to ensure 100% accuracy in capturing all IE network assets",
        "Resolve 100% of GIS technical issues within 24 hours",
        "Identify and implement one outstanding new technology to improve network efficiency and reliability"
    ]
};


const formSchema = z.object({
  role: z.string().min(1, { message: 'Role is required.' }),
  kpiParameter: z.string().min(1, { message: 'KPI Parameter is required.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  priority: z.string().min(1, { message: 'Priority is required.' }),
  status: z.string().min(1, { message: 'Status is required.' }),
});

type IssueFormProps = {
  onSave: (data: Omit<Issue, 'id' | 'date'>) => void;
  issueToEdit: Issue | null;
  onCancelEdit: () => void;
};

export default function IssueForm({ onSave, issueToEdit, onCancelEdit }: IssueFormProps) {
  const [kpiSuggestions, setKpiSuggestions] = useState<string[]>([]);
  const isClient = useIsClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: '',
      kpiParameter: '',
      description: '',
      priority: '',
      status: 'Open',
    },
  });

  const selectedRole = form.watch('role') as Role;

  useEffect(() => {
    if (issueToEdit) {
      form.reset(issueToEdit);
    } else {
      form.reset({
        role: '',
        kpiParameter: '',
        description: '',
        priority: '',
        status: 'Open',
      });
    }
  }, [issueToEdit, form]);

  useEffect(() => {
    if (selectedRole && kpiData[selectedRole]) {
        setKpiSuggestions(kpiData[selectedRole]);
        form.setValue('kpiParameter', '');
    } else {
      setKpiSuggestions([]);
    }
  }, [selectedRole, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSave(values);
    if (!issueToEdit) {
      form.reset();
    }
  }

  if (!isClient) {
    return (
      <Card className="shadow-lg border-none bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline text-primary">
            <PlusCircle />
            Report New Issue
          </CardTitle>
          <CardDescription>Fill out the form below to report or update an issue.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <div className="flex space-x-2 pt-4">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg border-none bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-primary">
          <PlusCircle />
          {issueToEdit ? 'Edit Issue' : 'Report New Issue'}
        </CardTitle>
        <CardDescription>Fill out the form below to report or update an issue.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="kpiParameter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>KPI Parameter</FormLabel>
                   <div className="flex items-center gap-2">
                    <Select onValueChange={field.onChange} value={field.value} disabled={!selectedRole} >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={!selectedRole ? "Select a role first" : "Select a KPI parameter"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {kpiSuggestions.map((kpi, index) => (
                          <SelectItem key={index} value={kpi}>{kpi}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issue Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the issue in detail..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PRIORITIES.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-2 pt-4">
              <Button type="submit" variant="secondary" className="hover:bg-primary hover:-translate-y-0.5" disabled={form.formState.isSubmitting}>
                <Send />
                {issueToEdit ? 'Save Changes' : 'Submit Issue'}
              </Button>
              <Button type="button" variant="outline" className="hover:-translate-y-0.5" onClick={() => {
                issueToEdit ? onCancelEdit() : form.reset()
              }}>
                <RotateCcw />
                {issueToEdit ? 'Cancel' : 'Reset'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
