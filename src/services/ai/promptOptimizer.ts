// src/services/promptOptimizer.ts

/**
 * File: src/services/promptOptimizer.ts
 * Service for optimizing user prompts before sending them to the LLM
 */

import { LLMService } from '../ai/llmService'; // Fix import path

export class PromptOptimizer {
    private llmService: LLMService;
    private useOptimization: boolean;

    constructor(llmService: LLMService, useOptimization: boolean) {
        this.llmService = llmService;
        this.useOptimization = useOptimization;
    }

    /**
     * Optimizes the user prompt using LLMService if optimization is enabled
     * @param userPrompt The original user prompt
     * @param templateContent The content of the selected template
     * @returns The optimized prompt
     */
    async optimize(userPrompt: string, templateContent: string): Promise<string> {
        console.log('[PromptOptimizer.optimize] Starting optimization with:', {
            useOptimization: this.useOptimization,
            hasLLMService: !!this.llmService,
            userPrompt,
            templateContent: typeof templateContent
        });

        if (!this.useOptimization || !this.llmService) {
            return userPrompt;
        }

        try {
            // First optimize the prompt
            const optimizedPrompt = await this.llmService.generateFilledTemplate(
                `Please optimize this prompt to be more specific and detailed: "${userPrompt}"`, 
                ''
            );

            // Clean the optimized prompt
            const cleanedPrompt = this.cleanResponse(optimizedPrompt);

            // Simply return the cleaned prompt here
            return cleanedPrompt;
        } catch (error) {
            console.error('[PromptOptimizer.optimize] Error during optimization:', error);
            return userPrompt;
        }
    }

    private cleanResponse(response: string): string {
        console.log('[PromptOptimizer.cleanResponse] Cleaning response:', response);
        
        const quotedMatch = response.match(/"([^"]+)"/);
        if (quotedMatch) {
            console.log('[PromptOptimizer.cleanResponse] Found quoted text:', quotedMatch[1]);
            return quotedMatch[1].trim();
        }

        const firstParagraph = response.split('\n')[0];
        const cleaned = firstParagraph.replace(/^(Here's|This is|I've created|Here is).*?:/i, '').trim();
        console.log('[PromptOptimizer.cleanResponse] Cleaned response:', cleaned);
        return cleaned;
    }

    /**
     * Combines template content with the optimized prompt
     * @param templateContent The original template content
     * @param optimizedPrompt The optimized user prompt
     * @returns The final prompt to send to the LLM
     */
    combine(templateContent: string, optimizedPrompt: string): string {
        if (!templateContent || !optimizedPrompt) {
            return templateContent || optimizedPrompt || '';
        }
        
        try {
            const template = String(templateContent).trim();
            const prompt = String(optimizedPrompt).trim();
            
            console.log('[PromptOptimizer.combine] Processing with:', {
                template: template.substring(0, 100) + '...',
                prompt: prompt.substring(0, 100) + '...'
            });

            // Don't modify the template, just return the optimized prompt
            return prompt;
            
        } catch (error) {
            console.error('[PromptOptimizer.combine] Combination failed:', error);
            return optimizedPrompt;
        }
    }
}
