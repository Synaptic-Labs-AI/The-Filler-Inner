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
        if (!this.useOptimization) {
            return userPrompt;
        }

        // Use templateContent in optimization
        const optimizedPrompt = `Based on template structure:\n${templateContent}\n\nOptimize this prompt:\n${userPrompt}`;
        
        // Use llmService for optimization
        if (this.llmService) {
            return await this.llmService.generateFilledTemplate(optimizedPrompt, userPrompt);
        }

        return optimizedPrompt;
    }

    /**
     * Combines template content with the optimized prompt
     * @param templateContent The original template content
     * @param optimizedPrompt The optimized user prompt
     * @returns The final prompt to send to the LLM
     */
    combine(templateContent: string, optimizedPrompt: string): string {
        // Example: Insert the prompt into the template at a specific placeholder
        // Adjust the placeholder as per your template's structure
        return templateContent.replace(/{{input}}/g, optimizedPrompt);
    }
}
