'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Issue } from '@/lib/types';

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
    { label: 'Total Issues', value: stats.total },
    { label: 'Open Issues', value: stats.open },
    { label: 'In Progress', value: stats.inProgress },
    { label: 'Resolved', value: stats.resolved },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item, index) => (
        <Card key={item.label} className="shadow-md hover:shadow-xl transition-shadow duration-300 animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
