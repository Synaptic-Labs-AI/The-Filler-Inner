import { BaseAdapter } from './base';
import { AIResponse, AIResponseOptions, AIProvider, AIModelMap } from '@/types/aiModels';
import { requestUrl, RequestUrlOptions, RequestUrlResponse } from 'obsidian';
import { CONFIG } from '@/utils/config';

export class OpenRouterAdapter extends BaseAdapter {
    private apiKey: string = '';
    private apiUrl: string = 'https://openrouter.ai/api/v1/chat/completions';

    configure(config: Record<string, any>): void {
        this.apiKey = config.apiKey || '';
        this.apiUrl = config.apiUrl || this.apiUrl;
    }

    async generateResponse(prompt: string, options?: AIResponseOptions): Promise<AIResponse> {
        if (!this.apiKey) {
            throw new Error('OpenRouter API key is not configured.');
        }

        const temperature = options?.temperature ?? 0.7;
        const maxTokens = options?.maxTokens ?? 1000;
        const model = options?.model || 'default-model';

        const requestOptions: RequestUrlOptions = {
            url: this.apiUrl,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'X-Referer': CONFIG.REFERRER || '',
                'X-Title': CONFIG.APP_NAME || ''
            },
            body: JSON.stringify({
                model: model,
                prompt: prompt,
                temperature: temperature,
                max_tokens: maxTokens,
                stream: false
            })
        };

        try {
            const response: RequestUrlResponse = await requestUrl(requestOptions);

            if (response.status !== 200) {
                throw new Error(`OpenRouter API Error: ${response.status}`);
            }

            const responseData = response.json;

            if (!responseData.choices || responseData.choices.length === 0) {
                throw new Error('No choices found in OpenRouter response.');
            }

            const content = responseData.choices[0].text || '';

            const tokens = {
                input: responseData.usage?.prompt_tokens || 0,
                output: responseData.usage?.completion_tokens || 0,
                total: responseData.usage?.total_tokens || 0
            };

            return {
                success: true,
                data: content,
                tokens: tokens
            };
        } catch (error: any) {
            console.error('OpenRouter Adapter Error:', error);
            return {
                success: false,
                error: error.message || 'Unknown error occurred.',
                tokens: {
                    input: 0,
                    output: 0,
                    total: 0
                }
            };
        }
    }

    async testConnection(): Promise<boolean> {
        try {
            const testPrompt = 'Hello, this is a test prompt.';
            const response = await this.generateResponse(testPrompt, { maxTokens: 10 });
            return response.success && !!response.data;
        } catch (error) {
            console.error('OpenRouter Adapter Test Connection Error:', error);
            return false;
        }
    }

    getProviderType(): string {
        return AIProvider.OpenRouter;
    }

    public getAvailableModels(): string[] {
        const models = AIModelMap[AIProvider.OpenRouter];
        return models.map(model => model.apiName);
    }
}