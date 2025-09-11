export const ROLES = [
  "GIS Coordinator",
  "GIS Lead",
  "GIS Specialist",
  "Geodatabase Specialist",
  "GIS Analyst",
] as const;

export const PRIORITIES = ["Low", "Medium", "High", "Critical"] as const;

export const STATUSES = ["Open", "In Progress", "Resolved"] as const;

export type Role = (typeof ROLES)[number];
export type Priority = (typeof PRIORITIES)[number];
export type Status = (typeof STATUSES)[number];

export type Issue = {
  id: string;
  role: Role;
  kpiParameter: string;
  description: string;
  priority: Priority;
  status: Status;
  date: string; // ISO string
};
