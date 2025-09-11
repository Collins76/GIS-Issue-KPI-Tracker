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

const kpiData = {
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
KPIs: 
- {{#each (lookup @root.kpiData @root.role)}}{{this}}
- {{/each}}

Based on the provided role, suggest 5 KPIs from the provided list.`,
});

const suggestKpiFlow = ai.defineFlow(
  {
    name: 'suggestKpiFlow',
    inputSchema: SuggestKpiInputSchema,
    outputSchema: SuggestKpiOutputSchema,
  },
  async input => {
    const {output} = await prompt(input, {kpiData});
    return output!;
  }
);
