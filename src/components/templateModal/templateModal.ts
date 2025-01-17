// src/components/templateModal/templateModal.ts

import { App, Modal, Setting, Notice } from 'obsidian';
import { TemplateDropdown } from './templateDropdown';
import { PromptInput } from './promptInput';
import { TemplateManager } from '../../services/templateManager';
import { LLMService } from '../../services/ai/llmService';
import { PromptOptimizer } from '../../services/ai/promptOptimizer';
import { FileService } from '../../services/fileService';
import { Template } from '../../types';

/**
 * TemplateModal handles the UI and workflow for selecting and filling templates.
 * It provides a sleek interface for template selection, requirement input, and generation.
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

    // Animation properties
    private intervalId: number | null = null;
    private rippleTimeout: number | null = null;

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

        // Set modal title with emoji
        this.titleEl.setText('✨ Fill Template');

        // Template Selection
        new Setting(contentEl)
            .setName('Template')
            .setDesc('Choose a template to fill')
            .then(setting => {
                setting.settingEl.addClass('template-setting');
                this.dropdown.mount(setting.controlEl);
            });

        // Prompt Input
        new Setting(contentEl)
            .setName('Requirements')
            .setDesc('Describe how you want the template to be filled')
            .then(setting => {
                setting.settingEl.addClass('prompt-setting');
                this.promptInput.mount(setting.controlEl);
            });

        // Modal Footer with buttons
        const footer = contentEl.createDiv('modal-footer');
        
        // Cancel button with hover effect
        const cancelBtn = footer.createEl('button', { 
            text: 'Cancel',
            cls: 'cancel-button' 
        });
        cancelBtn.addEventListener('click', () => this.close());

        // Submit button with loading state and ripple effect
        this.submitButton = footer.createEl('button', {
            text: 'Generate',
            cls: 'mod-cta submit-button'
        });
        this.submitButton.addEventListener('click', this.handleSubmit.bind(this));

        // Initialize event listeners
        this.initializeEventListeners();

        // Load templates
        this.loadTemplates();
    }

    private initializeEventListeners() {
        // Handle template selection
        this.dropdown.onSelect((template: Template) => {
            this.selectedTemplate = template;
            this.updateSubmitButtonState();
            // Add ripple effect to the select element
            const selectEl = this.contentEl.querySelector('.template-select');
            if (selectEl) {
                this.addRippleEffect(selectEl as HTMLElement);
            }
        });

        // Handle prompt changes
        this.promptInput.onChange((value: string) => {
            this.updateSubmitButtonState();
        });
    }

    private async handleSubmit() {
        if (this.processingStatus === ProcessingStatus.PROCESSING) {
            return;
        }

        if (!this.selectedTemplate) {
            new Notice('🎯 Please select a template first');
            return;
        }

        if (!this.promptInput.getValue().trim()) {
            new Notice('✍️ Please enter your requirements');
            return;
        }

        try {
            this.processingStatus = ProcessingStatus.PROCESSING;
            
            // Update button state with loading animation
            this.submitButton.empty();
            const loadingContainer = this.submitButton.createSpan({cls: 'loading-container'});
            loadingContainer.createSpan({text: 'Generating', cls: 'loading-text'});
            const dotsContainer = loadingContainer.createSpan({cls: 'loading-dots'});
            
            // Animated loading dots
            this.intervalId = window.setInterval(() => {
                const currentDots = dotsContainer.textContent || '';
                dotsContainer.textContent = currentDots.length >= 3 ? '' : currentDots + '.';
            }, 500);
            
            this.submitButton.disabled = true;
            this.addRippleEffect(this.submitButton);

            const filledContent = await this.processTemplate();
            await this.fileService.createFilledFile(this.selectedTemplate!, filledContent);

            new Notice('✨ Template filled and saved successfully!');
            this.close();
        } catch (error) {
            console.error('🚨 Template processing failed:', error);
            new Notice('❌ Failed to generate the filled template. Check console for details.');
        } finally {
            if (this.intervalId) {
                window.clearInterval(this.intervalId);
                this.intervalId = null;
            }
            this.processingStatus = ProcessingStatus.IDLE;
            this.submitButton.empty();
            this.submitButton.setText('Generate');
            this.submitButton.disabled = false;
        }
    }

    private updateSubmitButtonState() {
        const isReady = !!this.selectedTemplate && !!this.promptInput.getValue().trim();
        this.submitButton.toggleClass('ready', isReady);
        this.submitButton.disabled = !isReady;
    }

    private addRippleEffect(element: HTMLElement) {
        const ripple = element.createDiv('ripple');
        const rect = element.getBoundingClientRect();
        
        ripple.style.left = '50%';
        ripple.style.top = '50%';
        
        // Remove ripple after animation
        setTimeout(() => ripple.remove(), 600);
    }

    private async loadTemplates() {
        try {
            const templates = await this.templateManager.getTemplates();
            this.dropdown.setTemplates(templates);
        } catch (error) {
            console.error('📚 Failed to load templates:', error);
            new Notice('❌ Failed to load templates. Check console for details.');
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

        return await this.llmService.generateFilledTemplate(templateContent, finalPrompt);
    }

    onClose() {
        if (this.intervalId !== null) {
            window.clearInterval(this.intervalId);
            this.intervalId = null;
        }
        if (this.rippleTimeout !== null) {
            window.clearTimeout(this.rippleTimeout);
            this.rippleTimeout = null;
        }
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
