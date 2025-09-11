'use client';

import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { suggestKpi } from '@/ai/flows/kpi-suggestion-tool';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Send, RotateCcw, Loader2 } from 'lucide-react';
import { Issue, ROLES, PRIORITIES, STATUSES, Role } from '@/lib/types';

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
  const [isKpiLoading, startKpiTransition] = useTransition();

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

  const selectedRole = form.watch('role');

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
    if (selectedRole) {
      startKpiTransition(async () => {
        setKpiSuggestions([]);
        form.setValue('kpiParameter', '');
        const { suggestions } = await suggestKpi({ role: selectedRole as Role });
        setKpiSuggestions(suggestions);
      });
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

  return (
    <Card className="shadow-lg border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <PlusCircle className="text-primary" />
          {issueToEdit ? 'Edit Issue' : 'Report New Issue'}
        </CardTitle>
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
                  <Select onValueChange={field.onChange} value={field.value} suppressHydrationWarning>
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
                    <Select onValueChange={field.onChange} value={field.value} disabled={!selectedRole || isKpiLoading} suppressHydrationWarning>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isKpiLoading ? "Loading KPIs..." : "Select a KPI parameter"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {kpiSuggestions.map((kpi, index) => (
                          <SelectItem key={index} value={kpi}>{kpi}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isKpiLoading && <Loader2 className="h-5 w-5 animate-spin" />}
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
                  <Select onValueChange={field.onChange} value={field.value} suppressHydrationWarning>
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
                  <Select onValueChange={field.onChange} value={field.value} suppressHydrationWarning>
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

            <div className="flex space-x-2">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                <Send />
                {issueToEdit ? 'Save Changes' : 'Submit Issue'}
              </Button>
              <Button type="button" variant="outline" onClick={() => {
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
