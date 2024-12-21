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
        const { contentEl } = this;
        contentEl.empty();

        // Set modal title
        this.titleEl.setText('Fill Template');

        // Template Selection
        new Setting(contentEl)
            .setName('Template')
            .setDesc('Choose a template to fill')
            .then(setting => {
                this.dropdown.mount(setting.controlEl);
            });

        // Prompt Input
        new Setting(contentEl)
            .setName('Requirements')
            .setDesc('Describe how you want the template to be filled')
            .then(setting => {
                this.promptInput.mount(setting.controlEl);
            });

        // Modal Footer with buttons
        const footer = contentEl.createDiv('modal-footer');
        
        // Cancel button
        footer.createEl('button', { text: 'Cancel' })
            .addEventListener('click', () => this.close());

        // Submit button with loading state
        this.submitButton = footer.createEl('button', {
            text: 'Generate',
            cls: 'mod-cta'
        });
        this.submitButton.addEventListener('click', this.handleSubmit.bind(this));

        // Initialize event listeners
        this.initializeEventListeners();

        // Load templates
        this.loadTemplates();
    }

    private async handleSubmit() {
        if (!this.selectedTemplate || this.processingStatus === ProcessingStatus.PROCESSING) {
            new Notice('Please select a template and enter your requirements.');
            return;
        }

        try {
            this.processingStatus = ProcessingStatus.PROCESSING;
            this.submitButton.setText('Generating...');
            this.submitButton.setAttr('disabled', '');

            const filledContent = await this.processTemplate();
            await this.fileService.createFilledFile(this.selectedTemplate!, filledContent);

            new Notice('Template filled and saved successfully!');
            this.close();
        } catch (error) {
            console.error('Template processing failed:', error);
            new Notice('Failed to generate the filled template. Check console for details.');
        } finally {
            this.processingStatus = ProcessingStatus.IDLE;
            this.submitButton.setText('Generate');
            this.submitButton.removeAttribute('disabled');
        }
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

    private async processTemplate(): Promise<string> {
        if (!this.selectedTemplate) {
            throw new Error('No template selected.');
        }

        const userPrompt = this.promptInput.getValue();
        const templateContent = await this.templateManager.loadTemplate(this.selectedTemplate.path);

        const optimizedPrompt = await this.promptOptimizer.optimize(userPrompt, templateContent);
        const finalPrompt = this.promptOptimizer.combine(templateContent, optimizedPrompt);

        // Generate filled content
        return await this.llmService.generateFilledTemplate(templateContent, finalPrompt);
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

    // Remove unused methods
    private createTemplateSection() {}
    private createPromptSection() {}
    private createOptimizedPromptSection() {}
    private createSubmitButton() {}
    private createLoadingIndicator() {}
    private createRippleEffect() {}
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
