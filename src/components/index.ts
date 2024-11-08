/**
 * Component exports for the Filler Inner plugin
 * Provides a clean interface for importing UI components
 */

import { TemplateModal } from './template-modal/template-modal';
import { TemplateDropdown } from './template-modal/template-dropdown';
import { PromptInput } from './template-modal/prompt-input';
import { type DropdownProps, type PromptInputProps } from '../types';

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
export const createModal = (app: App): TemplateModal => {
    return new TemplateModal(app);
};

// Export utility functions
export const isModalOpen = (app: App): boolean => {
    return app.workspace.activeLeaf?.view instanceof TemplateModal;
};