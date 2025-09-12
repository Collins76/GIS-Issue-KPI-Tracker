'use server';

/**
 * @fileOverview A KPI suggestion AI agent.
 *
 * - suggestKpi - A function that suggests KPIs based on the selected role.
 * - SuggestKpiInput - The input type for the suggestKpi function.
 * - SuggestKpiOutput - The return type for the suggestKpi function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestKpiInputSchema = z.object({
  role: z
    .string()
    .describe('The role for which KPI suggestions are needed.'),
});
export type SuggestKpiInput = z.infer<typeof SuggestKpiInputSchema>;

const SuggestKpiOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('Suggested KPIs for the given role.'),
});
export type SuggestKpiOutput = z.infer<typeof SuggestKpiOutputSchema>;

export async function suggestKpi(input: SuggestKpiInput): Promise<SuggestKpiOutput> {
  return suggestKpiFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestKpiPrompt',
  input: {schema: SuggestKpiInputSchema},
  output: {schema: SuggestKpiOutputSchema},
  prompt: `You are an expert in Key Performance Indicators (KPIs) for various roles within a GIS (Geographic Information System) team. Given a specific role, and a list of KPIs, you will provide a list of relevant KPIs that can be used to measure performance and identify areas for improvement.

Role: {{{role}}}

Based on the provided role, suggest 5 KPIs.`,
});

const suggestKpiFlow = ai.defineFlow(
  {
    name: 'suggestKpiFlow',
    inputSchema: SuggestKpiInputSchema,
    outputSchema: SuggestKpiOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
