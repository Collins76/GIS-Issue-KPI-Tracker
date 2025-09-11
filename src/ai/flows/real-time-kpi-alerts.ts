// src/ai/flows/real-time-kpi-alerts.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating real-time KPI alerts based on reported issues.
 *
 * It includes:
 * - `generateKpiAlert` - A function to trigger the KPI alert generation flow.
 * - `RealTimeKpiAlertsInput` - The input type for the generateKpiAlert function.
 * - `RealTimeKpiAlertsOutput` - The output type for the generateKpiAlert function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RealTimeKpiAlertsInputSchema = z.object({
  role: z.string().describe('The role of the user reporting the issue.'),
  kpiParameter: z.string().describe('The KPI parameter associated with the issue.'),
  description: z.string().describe('A detailed description of the issue.'),
  priority: z.string().describe('The priority level of the issue (e.g., Low, Medium, High, Critical).'),
  status: z.string().describe('The current status of the issue (e.g., Open, In Progress, Resolved).'),
});
export type RealTimeKpiAlertsInput = z.infer<typeof RealTimeKpiAlertsInputSchema>;

const RealTimeKpiAlertsOutputSchema = z.object({
  alertMessage: z.string().describe('A message containing the generated alert based on the issue details.'),
});
export type RealTimeKpiAlertsOutput = z.infer<typeof RealTimeKpiAlertsOutputSchema>;

export async function generateKpiAlert(input: RealTimeKpiAlertsInput): Promise<RealTimeKpiAlertsOutput> {
  return realTimeKpiAlertsFlow(input);
}

const realTimeKpiAlertsPrompt = ai.definePrompt({
  name: 'realTimeKpiAlertsPrompt',
  input: {schema: RealTimeKpiAlertsInputSchema},
  output: {schema: RealTimeKpiAlertsOutputSchema},
  prompt: `You are an alert generation system designed to create push notifications based on reported GIS KPI issues.

  Based on the issue's details, generate a concise and informative alert message suitable for stakeholders.
  Consider the priority and status of the issue to determine the urgency and content of the alert.

  Issue Details:
  - Role: {{{role}}}
  - KPI Parameter: {{{kpiParameter}}}
  - Description: {{{description}}}
  - Priority: {{{priority}}}
  - Status: {{{status}}}

  Alert Message:`,
});

const realTimeKpiAlertsFlow = ai.defineFlow(
  {
    name: 'realTimeKpiAlertsFlow',
    inputSchema: RealTimeKpiAlertsInputSchema,
    outputSchema: RealTimeKpiAlertsOutputSchema,
  },
  async input => {
    const {output} = await realTimeKpiAlertsPrompt(input);
    return output!;
  }
);
