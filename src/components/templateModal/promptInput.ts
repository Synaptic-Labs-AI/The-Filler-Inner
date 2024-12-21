/**
 * File: src/components/template-modal/prompt-input.ts
 * Prompt input component with auto-resize and markdown support
 */

// Remove unused import
// import { PromptInputProps } from '../../types';
import { debounce } from '../../utils/helpers';

export class PromptInput {
    private container: HTMLElement;
    private textarea!: HTMLTextAreaElement; // Add ! for definite assignment
    private characterCount!: HTMLElement; // Add ! for definite assignment
    private onChangeCallback: (value: string) => void = () => {};
    private onSubmitCallback: () => void = () => {};
    
    constructor(parentEl: HTMLElement) {
        this.container = parentEl.createDiv({ cls: 'prompt-input-container' });
        this.initializeComponent();
    }
    
    mount(parentEl: HTMLElement) {
        parentEl.appendChild(this.container);
    }
    
    private initializeComponent() {
        // Create input wrapper with custom styling
        const inputWrapper = this.container.createDiv({ 
            cls: 'input-wrapper' 
        });
        
        // Create expanding textarea
        this.createTextArea(inputWrapper);
        
        // Create character count
        this.createCharacterCount(inputWrapper);
        
        // Removed createMarkdownTools call
    }
    
    private createTextArea(wrapper: HTMLElement) {
        this.textarea = wrapper.createEl('textarea', {
            cls: 'prompt-textarea',
            attr: {
                placeholder: 'Describe how you want the template filled...',
                rows: '1'
            }
        });
        
        // Auto-resize functionality
        this.textarea.addEventListener('input', debounce(() => {
            this.autoResize();
            this.updateCharacterCount();
            this.onChangeCallback(this.textarea.value);
        }, 100));
        
        // Handle keyboard shortcuts
        this.textarea.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.onSubmitCallback();
            }
        });
    }
    
    private createCharacterCount(wrapper: HTMLElement) {
        this.characterCount = wrapper.createDiv({
            cls: 'character-count'
        });
        this.updateCharacterCount();
    }
    
    private autoResize() {
        // Reset height to calculate correct scrollHeight
        this.textarea.style.height = 'auto';
        
        // Set new height based on content
        const newHeight = Math.min(
            this.textarea.scrollHeight,
            400  // max height in pixels
        );
        this.textarea.style.height = `${newHeight}px`;
    }
    
    private updateCharacterCount() {
        const count = this.textarea.value.length;
        this.characterCount.textContent = `${count} characters`;
        
        // Add visual feedback for length
        this.characterCount.classList.toggle('warning', count > 1000);
        this.characterCount.classList.toggle('error', count > 2000);
    }
    
    getValue(): string {
        return this.textarea.value;
    }
    
    setValue(value: string) {
        this.textarea.value = value;
        this.autoResize();
        this.updateCharacterCount();
    }
    
    onChange(callback: (value: string) => void) {
        this.onChangeCallback = callback;
    }
    
    onSubmit(callback: () => void) {
        this.onSubmitCallback = callback;
    }
    
    focus() {
        this.textarea.focus();
    }
    
    disable() {
        this.textarea.disabled = true;
        this.container.addClass('disabled');
    }
    
    enable() {
        this.textarea.disabled = false;
        this.container.removeClass('disabled');
    }
}