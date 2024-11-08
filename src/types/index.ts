/**
 * Core type definitions for the Filler Inner plugin
 * Exports all types used throughout the application
 */

import { TFile, TFolder } from 'obsidian';
export * from './settings';

/**
 * Represents a template file with its metadata
 */
export interface Template {
  /** The template's file path */
  path: string;
  /** The template's filename */
  name: string;
  /** The actual template file reference */
  file: TFile;
  /** Last modified timestamp */
  mtime: number;
}

/**
 * Template processing status
 */
export enum ProcessingStatus {
  IDLE = 'idle',
  PROCESSING = 'processing',
  COMPLETE = 'complete',
  ERROR = 'error'
}

/**
 * Result of template processing
 */
export interface ProcessedTemplate {
  /** Original template reference */
  template: Template;
  /** Processed content */
  content: string;
  /** Processing timestamp */
  timestamp: number;
  /** Output file path */
  outputPath: string;
}

/**
 * Error types for template processing
 */
export enum TemplateError {
  NOT_FOUND = 'Template not found',
  INVALID_CONTENT = 'Invalid template content',
  PROCESSING_FAILED = 'Processing failed',
  LLM_ERROR = 'LLM service error',
  FILE_SYSTEM_ERROR = 'File system error'
}

/**
 * Type guard for checking if a file is a template
 */
export function isTemplate(file: TFile): boolean {
  return file.extension === 'md' && file.path.startsWith('templates/');
}

/**
 * Type guard for checking if a folder is the templates folder
 */
export function isTemplateFolder(folder: TFolder): boolean {
  return folder.path === 'templates';
}

/**
 * Component prop types
 */
export interface DropdownProps {
  templates: Template[];
  onSelect: (template: Template) => void;
  selectedTemplate?: Template;
}

export interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
}