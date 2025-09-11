'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function IssueList({ issues, onEdit, onDelete }: IssueListProps) {
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    priority: '',
  });

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      return (
        (filters.role ? issue.role === filters.role : true) &&
        (filters.status ? issue.status === filters.status : true) &&
        (filters.priority ? issue.priority === filters.priority : true)
      );
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [issues, filters]);

  return (
    <Card className="shadow-lg border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <ListChecks className="text-primary" />
          Track Issues
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select onValueChange={(value) => handleFilterChange('role', value)}>
            <SelectTrigger><SelectValue placeholder="Filter by Role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Roles</SelectItem>
              {ROLES.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select onValueChange={(value) => handleFilterChange('status', value)}>
            <SelectTrigger><SelectValue placeholder="Filter by Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              {STATUSES.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select onValueChange={(value) => handleFilterChange('priority', value)}>
            <SelectTrigger><SelectValue placeholder="Filter by Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Priorities</SelectItem>
              {PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
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
                  <TableRow key={issue.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">{issue.kpiParameter}</TableCell>
                    <TableCell className="hidden md:table-cell">{issue.role}</TableCell>
                    <TableCell>{issue.priority}</TableCell>
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
                          <DropdownMenuItem onClick={() => onEdit(issue.id)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDelete(issue.id)} className="text-destructive focus:text-destructive">
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
