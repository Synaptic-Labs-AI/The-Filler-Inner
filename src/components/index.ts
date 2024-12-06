/**
* File: src/components/index.ts 
* Component exports for the Filler Inner plugin
 * Provides a clean interface for importing UI components
 */

import { TemplateModal } from './templateModal/templateModal';
import { TemplateDropdown } from './templateModal/templateDropdown';
import { PromptInput } from './templateModal/promptInput';
import { type DropdownProps, type PromptInputProps } from '../types';
import { App } from 'obsidian';
import { TemplateManager } from '../services/templateManager';
import { LLMService } from '../services/ai/llmService';
import { PromptOptimizer } from '../services/ai/promptOptimizer';
import { FileService } from '../services/fileService';

// Re-export components with their props
export {
    TemplateModal,
    TemplateDropdown,
    PromptInput,
    // Types
    DropdownProps,
    PromptInputProps
};

// Export component creation helpers
export const createModal = (
    app: App,
    templateManager: TemplateManager,
    llmService: LLMService,
    promptOptimizer: PromptOptimizer,
    fileService: FileService
): TemplateModal => {
    return new TemplateModal(app, templateManager, llmService, promptOptimizer, fileService);
};

// Export utility functions
export const isModalOpen = (app: App): boolean => {
    return app.workspace.activeLeaf?.view instanceof TemplateModal;
};