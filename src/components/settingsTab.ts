// src/components/settingsTab.ts

/**
 * File: src/components/settingsTab.ts
 * Settings tab component for plugin configuration
 */

import { App, PluginSettingTab, Setting } from 'obsidian';
import type FillerInnerPlugin from '../../main';  // Updated import path
import { FillerInnerSettings, LLMProvider } from '../types/settings';
import { AIModelUtils, AIProvider } from '../types/aiModels';

export class FillerInnerSettingTab extends PluginSettingTab {
    private plugin: FillerInnerPlugin;
    private settings: FillerInnerSettings;

    constructor(app: App, plugin: FillerInnerPlugin) {
        super(app, plugin);
        this.plugin = plugin;
        this.settings = plugin.settings;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.addClass('filler-inner-settings');

        this.addHeader();
        this.addLLMSettings();
        this.addPathSettings();
        this.addProcessingSettings();
        this.addGeneralSettings();
    }

    private addHeader(): void {
        const header = this.containerEl.createEl('div', { cls: 'settings-header' });
        header.createEl('h2', { text: 'Filler Inner' });
        header.createEl('p', { 
            text: 'Configure how your templates are processed and filled.',
            cls: 'settings-description' 
        });
    }

    private addLLMSettings(): void {
        const section = this.containerEl.createEl('div', { 
            cls: 'settings-section'
        });
        
        section.createEl('h3', { 
            text: 'LLM Configuration',
            cls: 'section-header' 
        });

        // LLM Provider Selection
        new Setting(section)
            .setName('LLM Provider')
            .setDesc('Select your preferred Language Model provider')
            .addDropdown(dropdown => {
                // Add providers explicitly to avoid enum value duplicates
                dropdown.addOption(AIProvider.OpenRouter, 'OpenRouter');
                dropdown.addOption(AIProvider.LMStudio, 'LMStudio');
                
                dropdown
                    .setValue(this.settings.llm.provider)
                    .onChange(async (value) => {
                        this.settings.llm.provider = value as LLMProvider;
                        // Reset model to default for the new provider
                        const defaultModel = AIModelUtils.getModelsByProvider(value as AIProvider)[0];
                        this.settings.llm.model = defaultModel?.apiName || '';
                        await this.plugin.saveSettings();
                        this.display(); // Refresh to show/hide relevant settings
                    });
            });

        // API Key
        new Setting(section)
            .setName('API Key')
            .setDesc('Enter your API key for the selected provider')
            .addText(text => text
                .setPlaceholder('Enter API key')
                .setValue(this.settings.llm.apiKey || '')
                .onChange(async (value) => {
                    this.settings.llm.apiKey = value;
                    await this.plugin.saveSettings();
                })
            )
            .addExtraButton(button => button
                .setIcon('help-circle')
                .setTooltip('How to get an API key')
                .onClick(() => {
                    window.open(this.getProviderApiKeyUrl());
                })
            );

        // Model Selection
        new Setting(section)
            .setName('Model')
            .setDesc('Select the specific model to use')
            .addDropdown(dropdown => {
                const models = AIModelUtils.getModelsByProvider(this.settings.llm.provider as unknown as AIProvider);
                models.forEach(model => {
                    dropdown.addOption(model.apiName, model.displayName);
                });
                dropdown
                    .setValue(this.settings.llm.model)
                    .onChange(async (value) => {
                        this.settings.llm.model = value;
                        await this.plugin.saveSettings();
                    });
            });

        // Temperature
        new Setting(section)
            .setName('Temperature')
            .setDesc('Adjust the creativity of the model (0 = more focused, 1 = more creative)')
            .addSlider(slider => slider
                .setLimits(0, 1, 0.1)
                .setValue(this.settings.llm.temperature)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.settings.llm.temperature = value;
                    await this.plugin.saveSettings();
                })
            );

        // Max Tokens
        new Setting(section)
            .setName('Max Tokens')
            .setDesc('Maximum length of generated content')
            .addSlider(slider => slider
                .setLimits(100, 4000, 100)
                .setValue(this.settings.llm.maxTokens)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.settings.llm.maxTokens = value;
                    await this.plugin.saveSettings();
                })
            );
    }

    private addPathSettings(): void {
        const section = this.containerEl.createEl('div', { 
            cls: 'settings-section' 
        });
        
        section.createEl('h3', { 
            text: 'File Paths',
            cls: 'section-header' 
        });

        // Templates Path
        new Setting(section)
            .setName('Templates Folder')
            .setDesc('Location of your template files')
            .addText(text => text
                .setPlaceholder('templates')
                .setValue(this.settings.paths.templatesPath)
                .onChange(async (value) => {
                    this.settings.paths.templatesPath = value;
                    await this.plugin.saveSettings();
                })
            );

        // Output Path
        new Setting(section)
            .setName('Output Folder')
            .setDesc('Where to save filled templates (leave empty for current folder)')
            .addText(text => text
                .setPlaceholder('Path for filled templates')
                .setValue(this.settings.paths.outputPath)
                .onChange(async (value) => {
                    this.settings.paths.outputPath = value;
                    await this.plugin.saveSettings();
                })
            );
    }

    private addProcessingSettings(): void {
        const section = this.containerEl.createEl('div', { 
            cls: 'settings-section' 
        });
        
        section.createEl('h3', { 
            text: 'Processing Options',
            cls: 'section-header' 
        });

        // Prompt Optimization
        new Setting(section)
            .setName('Prompt Optimization')
            .setDesc('Automatically enhance prompts for better results')
            .addToggle(toggle => toggle
                .setValue(this.settings.processing.usePromptOptimization)
                .onChange(async (value) => {
                    this.settings.processing.usePromptOptimization = value;
                    await this.plugin.saveSettings();
                })
            );

        // Default Prompt Template
        new Setting(section)
            .setName('Default Prompt Template')
            .setDesc('Template for structuring prompts')
            .addTextArea(text => text
                .setPlaceholder('Enter default prompt template')
                .setValue(this.settings.processing.defaultPromptTemplate)
                .onChange(async (value) => {
                    this.settings.processing.defaultPromptTemplate = value;
                    await this.plugin.saveSettings();
                })
            );

        // Frontmatter Handling
        new Setting(section)
            .setName('Include Frontmatter')
            .setDesc('Keep frontmatter from template in filled version')
            .addToggle(toggle => toggle
                .setValue(this.settings.processing.includeFrontmatter)
                .onChange(async (value) => {
                    this.settings.processing.includeFrontmatter = value;
                    await this.plugin.saveSettings();
                })
            );

        // Template Tags
        new Setting(section)
            .setName('Inherit Template Tags')
            .setDesc('Copy tags from template to filled version')
            .addToggle(toggle => toggle
                .setValue(this.settings.processing.inheritTemplateTags)
                .onChange(async (value) => {
                    this.settings.processing.inheritTemplateTags = value;
                    await this.plugin.saveSettings();
                })
            );
    }

    private addGeneralSettings(): void {
        const section = this.containerEl.createEl('div', { 
            cls: 'settings-section' 
        });
        
        section.createEl('h3', { 
            text: 'General Settings',
            cls: 'section-header' 
        });

        // Ribbon Icon
        new Setting(section)
            .setName('Show Ribbon Icon')
            .setDesc('Display Filler Inner icon in the ribbon')
            .addToggle(toggle => toggle
                .setValue(this.settings.showRibbonIcon)
                .onChange(async (value) => {
                    this.settings.showRibbonIcon = value;
                    await this.plugin.saveSettings();
                    this.plugin.updateRibbonIcon();
                })
            );

        // Hotkey Setting
        new Setting(section)
            .setName('Command Hotkey')
            .setDesc('Set a hotkey for quick access')
            .addButton(button => button
                .setButtonText(this.settings.defaultHotkey || 'Not set')
                .setClass('hotkey-button')
                .onClick(() => {
                    // Open Obsidian hotkeys settings
                    (this.app as any).setting.open('hotkeys');
                })
            );
    }

    private getProviderApiKeyUrl(): string {
        const urls: Record<LLMProvider, string> = {
            [LLMProvider.OpenRouter]: 'https://openrouter.ai/account/api-keys',
            [LLMProvider.LMStudio]: 'https://lmstudio.example.com/account/api-keys',
        };
        return urls[this.settings.llm.provider] || '';
    }

    private getProviderDisplayName(provider: LLMProvider): string {
        const displayNames: Record<LLMProvider, string> = {
            [LLMProvider.OpenRouter]: 'OpenRouter',
            [LLMProvider.LMStudio]: 'LMStudio',
        };
        return displayNames[provider] || provider;
    }
}
