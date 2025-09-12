'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Issue } from '@/lib/types';
import { Scroll, BarChart, CheckCircle, ListTodo, Folder } from 'lucide-react';

type StatsCardsProps = {
  issues: Issue[];
};

export default function StatsCards({ issues }: StatsCardsProps) {
  const stats = useMemo(() => {
    return {
      total: issues.length,
      open: issues.filter((i) => i.status === 'Open').length,
      inProgress: issues.filter((i) => i.status === 'In Progress').length,
      resolved: issues.filter((i) => i.status === 'Resolved').length,
    };
  }, [issues]);

  const statItems = [
    { label: 'Total Issues', value: stats.total, Icon: ListTodo, color: "text-primary" },
    { label: 'Open', value: stats.open, Icon: Scroll, color: "text-destructive" },
    { label: 'In Progress', value: stats.inProgress, Icon: BarChart, color: "text-warning" },
    { label: 'Resolved', value: stats.resolved, Icon: CheckCircle, color: "text-success" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {statItems.map((item, index) => (
        <Card key={item.label} className="shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in bg-card" style={{animationDelay: `${index * 100}ms`}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
            <item.Icon className={`h-5 w-5 ${item.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">{item.value}</div>
          </CardContent>
        </Card>
      ))}
      <Link href="/files" className="block">
        <Card className="shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in bg-card h-full" style={{animationDelay: '400ms'}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">File Manager</CardTitle>
            <Folder className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold text-primary mt-2">Manage Files</div>
            <p className="text-xs text-muted-foreground mt-1">Upload, download, and organize.</p>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
