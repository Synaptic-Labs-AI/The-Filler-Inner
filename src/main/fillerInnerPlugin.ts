
// main.ts

import { Plugin, Notice } from 'obsidian';
import { FillerInnerSettingTab } from './src/components/settingsTab';
import { TemplateModal } from './src/components/templateModal/templateModal';
import { TemplateManager } from './src/services/templateManager';
import { LLMService } from './src/services/ai/llmService';
import { PromptOptimizer } from './src/services/ai/promptOptimizer';
import { FileService } from './src/services/fileService';
import { DEFAULT_SETTINGS, FillerInnerSettings } from './src/types/settings';

/**
 * Main plugin class for Filler Inner.
 * Handles initialization, settings management, and command registration.
 */
export default class FillerInnerPlugin extends Plugin {
    // Plugin settings
    settings!: FillerInnerSettings;

    // Core services
    templateManager!: TemplateManager;
    llmService!: LLMService;
    promptOptimizer!: PromptOptimizer;
    fileService!: FileService;

    // UI components
    ribbonIcon: HTMLElement | null = null;

    /**
     * Called when the plugin is loaded.
     * Initializes settings, services, UI components, and commands.
     */
    async onload() {
        console.log('Filler Inner: Loading plugin...');

        // Load and apply settings
        await this.loadSettings();

        // Initialize core services
        this.initializeServices();

        // Register the settings tab in Obsidian's settings UI
        this.addSettingTab(new FillerInnerSettingTab(this.app, this));

        // Add ribbon icon if enabled in settings
        if (this.settings.showRibbonIcon) {
            this.ribbonIcon = this.addRibbonIcon('dice', 'Fill Template', () => {
                this.openTemplateModal();
            });
            this.ribbonIcon.addClass('filler-inner-ribbon-icon');
        }

        // Register the command to open the template modal
        this.addCommand({
            id: 'fill-template',
            name: 'Fill Template',
            callback: () => this.openTemplateModal(),
        });

        console.log('Filler Inner: Plugin loaded successfully.');
    }

    /**
     * Called when the plugin is unloaded.
     * Cleans up UI components and services.
     */
    onunload() {
        console.log('Filler Inner: Unloading plugin...');

        // Remove ribbon icon if it exists
        if (this.ribbonIcon) {
            this.ribbonIcon.remove();
            this.ribbonIcon = null;
        }

        // Perform any additional cleanup if necessary

        console.log('Filler Inner: Plugin unloaded successfully.');
    }

    /**
     * Loads the plugin settings from disk.
     * Merges user settings with default settings.
     */
    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    /**
     * Saves the current plugin settings to disk.
     */
    async saveSettings() {
        await this.saveData(this.settings);
    }

    /**
     * Initializes core services like TemplateManager, LLMService, etc.
     */
    initializeServices() {
        this.templateManager = new TemplateManager(this.app, this.settings.paths.templatesPath);
        
        // Pass just the llm config to LLMService
        this.llmService = new LLMService(this.settings.llm);
        
        this.promptOptimizer = new PromptOptimizer(
            this.llmService, 
            this.settings.processing.usePromptOptimization
        );
        
        this.fileService = new FileService(this.app, this.settings);
    }

    /**
     * Opens the TemplateModal for the user to select and fill templates.
     */
    openTemplateModal() {
        if (!this.llmService) {
            new Notice('LLM Service is not initialized.');
            return;
        }

        const modal = new TemplateModal(
            this.app,
            this.templateManager,
            this.llmService,
            this.promptOptimizer,
            this.fileService
        );
        modal.open();
    }

    /**
     * Updates the ribbon icon based on settings
     */
    updateRibbonIcon() {
        if (this.settings.showRibbonIcon && !this.ribbonIcon) {
            this.ribbonIcon = this.addRibbonIcon('dice', 'Fill Template', () => {
                this.openTemplateModal();
            });
            this.ribbonIcon.addClass('filler-inner-ribbon-icon');
        } else if (!this.settings.showRibbonIcon && this.ribbonIcon) {
            this.ribbonIcon.remove();
            this.ribbonIcon = null;
        }
    }
}