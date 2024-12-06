// src/types/aiModels.ts

/**
 * File: src/types/aiModels.ts
 * Type definitions related to AI models and responses
 */

/**
 * Enum for supported AI providers
 */
export enum AIProvider {
    OpenRouter = 'openrouter',
    LMStudio = 'lmstudio'
}

/**
 * Structure of AI response tokens
 */
export interface AIResponseTokens {
    input: number;
    output: number;
    total: number;
}

/**
 * Structure of AI response options
 */
export interface AIResponseOptions {
    temperature?: number;
    maxTokens?: number;
    model?: string;
}

/**
 * Structure of AI response
 */
export interface AIResponse {
    success: boolean;
    data?: string;
    error?: string;
    tokens: AIResponseTokens;
}

/**
 * AI model definition
 */
export interface AIModel {
    /** API identifier for the model */
    apiName: string;
    /** Display name of the model */
    displayName: string;
    /** Provider of the model */
    provider: AIProvider;
    /** Maximum tokens for the model */
    maxTokens: number;
}

/**
 * Model information organized by provider
 */
export const AIModelMap: Record<AIProvider, AIModel[]> = {
    [AIProvider.OpenRouter]: [
        { apiName: 'gpt-3.5-turbo', displayName: 'GPT-3.5 Turbo', provider: AIProvider.OpenRouter, maxTokens: 2048 },
        { apiName: 'gpt-4', displayName: 'GPT-4', provider: AIProvider.OpenRouter, maxTokens: 2048 }
    ],
    [AIProvider.LMStudio]: []
};

/**
 * Helper utilities for working with AI models
 */
export const AIModelUtils = {
    /**
     * Get models by provider
     */
    getModelsByProvider: (provider: AIProvider): AIModel[] => {
        const models: Record<AIProvider, AIModel[]> = {
            [AIProvider.OpenRouter]: [
                {
                    apiName: 'anthropic/claude-3.5-haiku',
                    displayName: 'Claude 3.5 Haiku',
                    maxTokens: 2048,
                    provider: AIProvider.OpenRouter
                }
            ],
            [AIProvider.LMStudio]: [
                {
                    apiName: 'default',
                    displayName: 'Default Model',
                    maxTokens: 2048,
                    provider: AIProvider.LMStudio
                }
            ]
        };
        return models[provider] || [];
    }
};
