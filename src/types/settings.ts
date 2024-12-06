import { AIProvider } from './aiModels';

// src/types/settings.ts

/**
 * File: src/types/settings.ts
 * Settings type definitions for the Filler Inner plugin
 * Defines all configurable options and their types
 */

/**
 * Supported LLM providers
 */
export enum LLMProvider {
  OpenRouter = AIProvider.OpenRouter,
  LMStudio = AIProvider.LMStudio,
  // Add more providers as needed
}

/**
* LLM-specific configuration
*/
export interface LLMConfig {
  /** Selected LLM provider */
  provider: LLMProvider;
  /** API key for the selected provider */
  apiKey?: string;
  /** API endpoint URL (optional, for custom endpoints) */
  apiUrl?: string;
  /** Model name/identifier */
  model: string;
  /** Temperature for generation (0-1) */
  temperature: number;
  /** Maximum tokens to generate */
  maxTokens: number;
}

/**
* File path configuration
*/
export interface PathConfig {
  /** Directory containing template files */
  templatesPath: string;
  /** Directory for processed output files */
  outputPath: string;
  /** Template file extension (default: 'md') */
  templateExtension: string;
}

/**
* Template processing configuration
*/
export interface ProcessingConfig {
  /** Whether to use prompt optimization */
  usePromptOptimization: boolean;
  /** Default prompt template */
  defaultPromptTemplate: string;
  /** Whether to include frontmatter in output */
  includeFrontmatter: boolean;
  /** Whether to inherit template tags */
  inheritTemplateTags: boolean;
}

/**
* Plugin settings interface
*/
export interface FillerInnerSettings {
  /** LLM configuration */
  llm: LLMConfig;
  /** Path configuration */
  paths: PathConfig;
  /** Processing configuration */
  processing: ProcessingConfig;
  /** Whether to show the ribbon icon */
  showRibbonIcon: boolean;
  /** Default command hotkey */
  defaultHotkey?: string;
}

/**
* Default settings
*/
export const DEFAULT_SETTINGS: FillerInnerSettings = {
  llm: {
      provider: LLMProvider.OpenRouter,
      model: 'anthropic/claude-3.5-haiku', // Default model for OpenRouter
      temperature: 0.7,
      maxTokens: 2048
  },
  paths: {
      templatesPath: 'templates',
      outputPath: '',
      templateExtension: 'md'
  },
  processing: {
      usePromptOptimization: true,
      defaultPromptTemplate: 'Please fill out this template based on the following requirements:\n\n',
      includeFrontmatter: true,
      inheritTemplateTags: true
  },
  showRibbonIcon: true
};

/**
* Partial settings for updates
*/
export type PartialSettings = Partial<FillerInnerSettings>;

/**
* Settings update callback
*/
export type SettingsChangeHandler = (settings: FillerInnerSettings) => void | Promise<void>;
