// src/services/ai/adapters/base.ts

/**
 * File: src/services/ai/adapters/base.ts
 * Abstract base class for LLM adapters
 * Defines the contract for all LLM service adapters
 */

import { AIResponse, AIResponseOptions } from '../../../types/aiModels';

export abstract class BaseAdapter {
    /**
     * Configure the adapter with provider-specific settings
     * @param config Configuration object specific to the provider
     */
    abstract configure(config: Record<string, any>): void;

    /**
     * Generate a response from the AI model based on the prompt
     * @param prompt The user-provided prompt
     * @param options Additional options for the AI response
     * @returns A promise that resolves to the AI response
     */
    abstract generateResponse(prompt: string, options?: AIResponseOptions): Promise<AIResponse>;

    /**
     * Test the connection to the AI service
     * @returns A promise that resolves to a boolean indicating success
     */
    abstract testConnection(): Promise<boolean>;

    /**
     * Get the provider type (e.g., OpenRouter, Anthropic)
     * @returns The AI provider enum value
     */
    abstract getProviderType(): string;
}
