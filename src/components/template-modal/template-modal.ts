/**
 * Main modal component for template selection and prompt input
 * Provides a sleek interface for template filling workflow
 */

import { App, Modal, Setting } from 'obsidian';
import { TemplateDropdown } from './template-dropdown';
import { PromptInput } from './prompt-input';
import { Template, ProcessingStatus } from '../../types';

export class TemplateModal extends Modal {
    private dropdown: TemplateDropdown;
    private promptInput: PromptInput;
    private selectedTemplate: Template | null = null;
    private processingStatus: ProcessingStatus = ProcessingStatus.IDLE;
    private submitButton: HTMLButtonElement;
    
    constructor(app: App) {
        super(app);
        
        // Add modal classes for styling
        this.modalEl.addClass('filler-inner-modal');
        this.titleEl.addClass('filler-inner-title');
        
        // Initialize components
        this.dropdown = new TemplateDropdown(this.contentEl);
        this.promptInput = new PromptInput(this.contentEl);
    }
    
    onOpen() {
        // Set modal title with subtle animation
        const title = this.titleEl.createEl('h2');
        title.setText('Fill Template');
        title.addClass('fade-in');
        
        // Create main container with flex layout
        const container = this.contentEl.createDiv({ cls: 'modal-container' });
        
        // Add template selection section
        this.createTemplateSection(container);
        
        // Add prompt input section
        this.createPromptSection(container);
        
        // Add submit button
        this.createSubmitButton(container);
        
        // Add loading indicator
        this.createLoadingIndicator(container);
        
        // Initialize event listeners
        this.initializeEventListeners();
    }
    
    private createTemplateSection(container: HTMLElement) {
        const templateSection = container.createDiv({ cls: 'template-section' });
        
        new Setting(templateSection)
            .setName('Select Template')
            .setDesc('Choose a template to fill')
            .then(setting => {
                this.dropdown.mount(setting.controlEl);
            });
    }
    
    private createPromptSection(container: HTMLElement) {
        const promptSection = container.createDiv({ cls: 'prompt-section' });
        
        new Setting(promptSection)
            .setName('Your Requirements')
            .setDesc('Describe how you want the template to be filled')
            .then(setting => {
                this.promptInput.mount(setting.controlEl);
            });
    }
    
    private createSubmitButton(container: HTMLElement) {
        const buttonContainer = container.createDiv({ cls: 'button-container' });
        
        this.submitButton = buttonContainer.createEl('button', {
            text: 'Generate',
            cls: 'mod-cta submit-button'
        });
        
        // Add ripple effect on click
        this.submitButton.addEventListener('click', this.createRippleEffect);
    }
    
    private createLoadingIndicator(container: HTMLElement) {
        const loader = container.createDiv({ cls: 'loading-spinner' });
        loader.hide();
        
        // Show/hide based on processing status
        this.registerInterval(
            window.setInterval(() => {
                if (this.processingStatus === ProcessingStatus.PROCESSING) {
                    loader.show();
                    this.submitButton.setAttr('disabled', 'true');
                } else {
                    loader.hide();
                    this.submitButton.removeAttribute('disabled');
                }
            }, 100)
        );
    }
    
    private createRippleEffect(e: MouseEvent) {
        const button = e.currentTarget as HTMLElement;
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;
        
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - button.offsetLeft - radius}px`;
        circle.style.top = `${e.clientY - button.offsetTop - radius}px`;
        circle.classList.add('ripple');
        
        const ripple = button.getElementsByClassName('ripple')[0];
        if (ripple) {
            ripple.remove();
        }
        
        button.appendChild(circle);
    }
    
    private initializeEventListeners() {
        // Handle template selection
        this.dropdown.onSelect((template: Template) => {
            this.selectedTemplate = template;
            this.submitButton.toggleClass('ready', !!template);
        });
        
        // Handle prompt changes
        this.promptInput.onChange((value: string) => {
            this.submitButton.toggleClass('ready', 
                !!value && !!this.selectedTemplate);
        });
        
        // Handle submission
        this.submitButton.addEventListener('click', async () => {
            if (!this.selectedTemplate || this.processingStatus === ProcessingStatus.PROCESSING) {
                return;
            }
            
            try {
                this.processingStatus = ProcessingStatus.PROCESSING;
                // Trigger processing animation
                await this.processTemplate();
                this.close();
            } catch (error) {
                console.error('Template processing failed:', error);
                this.processingStatus = ProcessingStatus.ERROR;
            }
        });
    }
    
    private async processTemplate() {
        // Template processing logic here
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    onClose() {
        // Cleanup
        this.contentEl.empty();
        this.modalEl.removeClass('filler-inner-modal');
    }
}