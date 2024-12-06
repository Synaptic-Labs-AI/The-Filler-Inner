// src/components/templateModal/templateModal.ts

import { App, Modal, Setting, Notice } from 'obsidian';
import { TemplateDropdown } from './templateDropdown';
import { PromptInput } from './promptInput';
import { TemplateManager } from '../../services/templateManager';
import { LLMService } from '../../services/ai/llmService';
import { PromptOptimizer } from '../../services/ai/promptOptimizer'; // Fix import path
import { FileService } from '../../services/fileService';
import { Template } from '../../types';

/**
 * TemplateModal handles the UI and workflow for selecting and filling templates.
 */
export class TemplateModal extends Modal {
    private dropdown: TemplateDropdown;
    private promptInput: PromptInput;
    private selectedTemplate: Template | null = null;
    private processingStatus: ProcessingStatus = ProcessingStatus.IDLE;
    private submitButton!: HTMLButtonElement;
    private optimizedPromptTextarea!: HTMLTextAreaElement;

    // Injected services
    private templateManager: TemplateManager;
    private llmService: LLMService;
    private promptOptimizer: PromptOptimizer;
    private fileService: FileService;

    // Add a private property to store the interval ID
    private intervalId: number | null = null;

    constructor(
        app: App,
        templateManager: TemplateManager,
        llmService: LLMService,
        promptOptimizer: PromptOptimizer,
        fileService: FileService
    ) {
        super(app);
        this.templateManager = templateManager;
        this.llmService = llmService;
        this.promptOptimizer = promptOptimizer;
        this.fileService = fileService;

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

        // Add optimized prompt textarea
        this.createOptimizedPromptSection(container);

        // Add submit button
        this.createSubmitButton(container);

        // Add loading indicator
        this.createLoadingIndicator(container);

        // Initialize event listeners
        this.initializeEventListeners();

        // Load templates into dropdown
        this.loadTemplates();
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

    private createOptimizedPromptSection(container: HTMLElement) {
        const optimizedPromptSection = container.createDiv({ cls: 'optimized-prompt-section' });

        new Setting(optimizedPromptSection)
            .setName('Optimized Prompt')
            .setDesc('Review and edit the optimized prompt before submission')
            .then(setting => {
                // Create a separate textarea for optimized prompt
                const textarea = setting.controlEl.createEl('textarea', {
                    cls: 'optimized-prompt-textarea',
                    attr: { // Move rows to attr object
                        placeholder: 'Optimized prompt will appear here...',
                        rows: '4',
                        disabled: '' // Set disabled as an empty string attribute
                    }
                });
                this.optimizedPromptTextarea = textarea as HTMLTextAreaElement;
            });
    }

    private createSubmitButton(container: HTMLElement) {
        const buttonContainer = container.createDiv({ cls: 'button-container' });

        this.submitButton = buttonContainer.createEl('button', {
            text: 'Generate',
            cls: 'mod-cta submit-button'
        });

        // Add ripple effect on click
        this.submitButton.addEventListener('click', this.createRippleEffect.bind(this));
    }

    private createLoadingIndicator(container: HTMLElement) {
        const loader = container.createDiv({ cls: 'loading-spinner' });
        loader.hide();

        // Use setInterval and store the interval ID
        this.intervalId = window.setInterval(() => {
            if (this.processingStatus === ProcessingStatus.PROCESSING) {
                loader.show();
                this.submitButton.setAttr('disabled', 'true');
            } else {
                loader.hide();
                this.submitButton.removeAttribute('disabled');
            }
        }, 100);
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
            this.updateSubmitButtonState();
            // Optionally, load the template content if needed for prompt optimization
        });

        // Handle prompt changes
        this.promptInput.onChange((value: string) => {
            this.updateSubmitButtonState();
            // Trigger prompt optimization here
            this.optimizePrompt(value);
        });

        // Handle submission
        this.submitButton.addEventListener('click', async () => {
            if (!this.selectedTemplate || this.processingStatus === ProcessingStatus.PROCESSING) {
                new Notice('Please select a template and enter your requirements.');
                return;
            }

            try {
                this.processingStatus = ProcessingStatus.PROCESSING;
                // Trigger processing animation (handled by loading indicator)

                // Generate the filled template
                const filledContent = await this.processTemplate();

                // Save the filled template to the output path
                await this.fileService.createFilledFile(this.selectedTemplate!, filledContent);

                new Notice('Template filled and saved successfully!');
                this.processingStatus = ProcessingStatus.COMPLETE;
                this.close();
            } catch (error) {
                console.error('Template processing failed:', error);
                new Notice('Failed to generate the filled template. Check console for details.');
                this.processingStatus = ProcessingStatus.ERROR;
            } finally {
                this.processingStatus = ProcessingStatus.IDLE;
            }
        });
    }

    private updateSubmitButtonState() {
        const isReady = !!this.selectedTemplate && !!this.promptInput.getValue().trim();
        this.submitButton.toggleClass('ready', isReady);
        this.submitButton.disabled = !isReady;
    }

    private async loadTemplates() {
        try {
            const templates = await this.templateManager.getTemplates();
            this.dropdown.setTemplates(templates);
        } catch (error) {
            console.error('Failed to load templates:', error);
            new Notice('Failed to load templates. Check console for details.');
        }
    }

    private async optimizePrompt(userPrompt: string) {
        if (!this.selectedTemplate) return;

        try {
            const templateContent = await this.templateManager.getTemplate(this.selectedTemplate.path);
            const optimizedPrompt = await this.promptOptimizer.optimize(userPrompt, templateContent.toString());
            this.optimizedPromptTextarea.value = optimizedPrompt;
        } catch (error) {
            console.error('Prompt optimization failed:', error);
            new Notice('Failed to optimize prompt. Check console for details.');
        }
    }

    private async processTemplate(): Promise<string> {
        if (!this.selectedTemplate) {
            throw new Error('No template selected.');
        }

        const userPrompt = this.promptInput.getValue();
        const templateContent = await this.templateManager.getTemplate(this.selectedTemplate.path);
        const finalPrompt = this.promptOptimizer.combine(templateContent.toString(), userPrompt);

        // Generate filled content
        return await this.llmService.generateFilledTemplate(templateContent.toString(), finalPrompt);
    }

    onClose() {
        // Clear the interval when the modal is closed
        if (this.intervalId !== null) {
            window.clearInterval(this.intervalId);
            this.intervalId = null;
        }
        // Cleanup
        this.contentEl.empty();
        this.modalEl.removeClass('filler-inner-modal');
    }
}

/**
 * Enum to track processing status
 */
enum ProcessingStatus {
    IDLE = 'idle',
    PROCESSING = 'processing',
    COMPLETE = 'complete',
    ERROR = 'error'
}
