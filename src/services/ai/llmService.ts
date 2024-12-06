// src/services/ai/llmService.ts

/**
 * File: src/services/ai/llmService.ts
 * LLM Service that manages different LLM adapters and handles prompt generation
 */

import { BaseAdapter } from './adapters/base';
import { OpenRouterAdapter } from './adapters/openrouter';
import { AIResponse } from '../../types/aiModels';
import { LLMConfig, LLMProvider } from '../../types/settings';
import { Notice } from 'obsidian';

export class LLMService {
    private adapter: BaseAdapter | null = null;
    private config: LLMConfig;
    private settings: { processing: { usePromptOptimization: boolean, defaultPromptTemplate: string } };

    constructor(config: LLMConfig) {
        this.config = config;
        this.settings = {
            processing: {
                usePromptOptimization: false,
                defaultPromptTemplate: ''
            }
        };
        this.initializeAdapter();
    }

    /**
     * Initializes the appropriate LLM adapter based on user settings
     */
    private initializeAdapter(): void {
        const provider = this.config.provider;

        switch (provider) {
            case LLMProvider.OpenRouter:
                this.adapter = new OpenRouterAdapter();
                break;
            case LLMProvider.LMStudio:
                // Initialize LMStudioAdapter when implemented
                // this.adapter = new LMStudioAdapter();
                new Notice('LMStudio provider is not implemented yet.');
                this.adapter = null;
                break;
            // Add more providers here as needed
            default:
                new Notice(`Unsupported LLM Provider: ${provider}`);
                this.adapter = null;
        }

        if (this.adapter) {
            this.adapter.configure({
                apiKey: this.config.apiKey,
                apiUrl: this.config.apiUrl // Optional: if using custom endpoints
            });
        }
    }

    /**
     * Regenerates the adapter in case settings have changed
     */
    public updateSettings(newConfig: LLMConfig): void {
        this.config = newConfig;
        this.initializeAdapter();
    }

    /**
     * Generates a filled template based on the template content and user prompt
     * @param templateContent The raw content of the selected template
     * @param userPrompt The user's input prompt
     * @returns A promise that resolves to the filled template content
     */
    public async generateFilledTemplate(templateContent: string, userPrompt: string): Promise<string> {
        if (!this.adapter) {
            throw new Error('LLM Adapter is not initialized.');
        }

        try {
            // Optimize the prompt if enabled
            let finalPrompt = userPrompt;
            if (this.settings.processing.usePromptOptimization) {
                // Assuming PromptOptimizer has an optimize method
                // Replace with actual prompt optimization logic
                finalPrompt = `${this.settings.processing.defaultPromptTemplate}${userPrompt}`;
            }

            const response: AIResponse = await this.adapter.generateResponse(finalPrompt, {
                temperature: this.config.temperature,
                maxTokens: this.config.maxTokens,
                model: this.config.model
            });

            if (response.success && typeof response.data === 'string') {
                // Replace placeholders in the template with the generated content
                // For example, replace {{input}} with the generated text
                const filledTemplate = templateContent.replace(/{{input}}/g, response.data);
                return filledTemplate;
            } else {
                throw new Error(response.error || 'Failed to generate filled template.');
            }
        } catch (error: any) {
            console.error('LLM Service Error:', error);
            throw new Error(error.message || 'An error occurred while generating the filled template.');
        }
    }

    /**
     * Tests the connection to the configured LLM provider
     * @returns A promise that resolves to a boolean indicating success
     */
    public async testConnection(): Promise<boolean> {
        if (!this.adapter) {
            new Notice('LLM Adapter is not initialized.');
            return false;
        }

        try {
            const isConnected = await this.adapter.testConnection();
            if (isConnected) {
                new Notice(`${this.adapter.getProviderType()} connection successful.`);
            } else {
                new Notice(`${this.adapter.getProviderType()} connection failed.`);
            }
            return isConnected;
        } catch (error: any) {
            console.error('LLM Service Test Connection Error:', error);
            new Notice(`Error testing ${this.adapter.getProviderType()} connection: ${error.message}`);
            return false;
        }
    }

    /**
     * Retrieves the list of available models from the adapter
     * @returns An array of model names
     */
    public getAvailableModels(): string[] {
        if (!this.adapter) return [];
        // Ensure that the adapter has a getAvailableModels method
        // You might need to add this method to the BaseAdapter and concrete adapters
        return (this.adapter as any).getAvailableModels ? (this.adapter as any).getAvailableModels() : [];
    }
}
