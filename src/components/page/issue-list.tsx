'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ListChecks, Pencil, Trash2 } from 'lucide-react';
import { Issue, ROLES, STATUSES, PRIORITIES } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { Skeleton } from '../ui/skeleton';
import { useIsClient } from '@/hooks/use-is-client';

type IssueListProps = {
  issues: Issue[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

const statusConfig: { [key: string]: { className: string } } = {
  Open: { className: "bg-destructive/10 text-destructive border-destructive/20" },
  'In Progress': { className: "bg-warning/10 text-warning border-warning/20" },
  Resolved: { className: "bg-success/10 text-success border-success/20" },
};

const priorityConfig: { [key: string]: { className: string } } = {
  Low: { className: "text-muted-foreground" },
  Medium: { className: "text-primary" },
  High: { className: "text-warning" },
  Critical: { className: "text-destructive" },
};


export default function IssueList({ issues, onEdit, onDelete }: IssueListProps) {
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    priority: 'all',
  });
  const isClient = useIsClient();


  const handleFilterChange = (filterName: string, value: string) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      return (
        (filters.role !== 'all' ? issue.role === filters.role : true) &&
        (filters.status !== 'all' ? issue.status === filters.status : true) &&
        (filters.priority !== 'all' ? issue.priority === filters.priority : true)
      );
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [issues, filters]);

  return (
    <Card className="shadow-lg border-none bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-primary">
          <ListChecks />
          Track Issues
        </CardTitle>
        <CardDescription>View, filter, and manage all reported issues.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {isClient ? (
            <>
              <Select onValueChange={(value) => handleFilterChange('role', value)} defaultValue="all">
                <SelectTrigger><SelectValue placeholder="Filter by Role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {ROLES.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select onValueChange={(value) => handleFilterChange('status', value)} defaultValue="all">
                <SelectTrigger><SelectValue placeholder="Filter by Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {STATUSES.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select onValueChange={(value) => handleFilterChange('priority', value)} defaultValue="all">
                <SelectTrigger><SelectValue placeholder="Filter by Priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </>
          ) : (
            <>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </>
          )}
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>KPI Parameter</TableHead>
                <TableHead className="hidden md:table-cell">Role</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIssues.length > 0 ? (
                filteredIssues.map((issue) => (
                  <TableRow key={issue.id} className="hover:bg-secondary/10">
                    <TableCell className="font-medium max-w-[200px] truncate">{issue.kpiParameter}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{issue.role}</TableCell>
                    <TableCell className={cn("font-semibold", priorityConfig[issue.priority]?.className)}>{issue.priority}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("font-semibold", statusConfig[issue.status]?.className)}>
                        {issue.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(issue.id)} className="hover:bg-warning/10">
                            <Pencil className="mr-2 h-4 w-4 text-warning" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDelete(issue.id)} className="text-destructive focus:text-destructive hover:bg-destructive/10">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No issues found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
