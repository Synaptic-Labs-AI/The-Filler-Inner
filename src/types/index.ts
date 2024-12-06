import { TFile } from 'obsidian';

// src/types/index.ts

export interface Template {
  name: string;
  path: string;
  file: TFile;  // Add TFile property
  mtime: number;
  // Add other properties if necessary
}

export enum TemplateError {
  NOT_FOUND = 'Template not found',
  INVALID_CONTENT = 'Invalid template content',
  PROCESSING_FAILED = 'Processing failed',
  LLM_ERROR = 'LLM service error',
  FILE_SYSTEM_ERROR = 'File system error'
}

export function isTemplate(file: TFile): boolean {
  return file.extension === 'md' && file.path.startsWith('templates/');
}

// Remove duplicate interfaces since they are already defined in settings.ts
// Remove: FillerInnerSettings, LLMConfig, LLMProvider, PathConfig, ProcessingConfig

export interface DropdownProps {
  initialValue?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}

export interface PromptInputProps {
  initialValue?: string;
  placeholder?: string;
  maxLength?: number;
  onChange?: (value: string) => void;
  onSubmit?: () => void;
}
