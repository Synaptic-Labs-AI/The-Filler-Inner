/**
 * File: src/components/settings-tab.ts
 * Settings tab component for plugin configuration
 */

import { App, PluginSettingTab, Setting } from 'obsidian';
import { FillerInnerPlugin } from '../../main';
import { 
    FillerInnerSettings, 
    LLMProvider, 
    DEFAULT_SETTINGS 
} from '../types/settings';

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
        header.createEl('h2', { text: 'Filler Inner Settings' });
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
                Object.values(LLMProvider).forEach(provider => {
                    dropdown.addOption(provider, provider);
                });
                dropdown
                    .setValue(this.settings.llm.provider)
                    .onChange(async (value: LLMProvider) => {
                        this.settings.llm.provider = value;
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
                this.getAvailableModels().forEach(model => {
                    dropdown.addOption(model, model);
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
            )
            .addExtraButton(button => button
                .setIcon('folder')
                .setTooltip('Select folder')
                .onClick(() => {
                    this.selectFolder('templatesPath');
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
            )
            .addExtraButton(button => button
                .setIcon('folder')
                .setTooltip('Select folder')
                .onClick(() => {
                    this.selectFolder('outputPath');
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
                .setButtonText(
                    this.settings.defaultHotkey || 'Not set'
                )
                .setClass('hotkey-button')
                .onClick(() => {
                    // Open hotkey configuration
                    this.app.setting.openTabById('hotkeys');
                })
            );
    }

    private async selectFolder(pathKey: 'templatesPath' | 'outputPath'): Promise<void> {
        // Implement folder selection dialog
        // This will depend on your specific implementation
        // and Obsidian's API capabilities
    }

    private getProviderApiKeyUrl(): string {
        const urls: Record<LLMProvider, string> = {
            [LLMProvider.OPENAI]: 'https://platform.openai.com/account/api-keys',
            // Add more provider URLs as needed
        };
        return urls[this.settings.llm.provider];
    }

    private getAvailableModels(): string[] {
        // This could be expanded based on the selected provider
        return [
            'gpt-3.5-turbo',
            'gpt-4',
            // Add more models as needed
        ];
    }

    private validateSettings(): boolean {
        // Add validation logic here
        return true;
    }

    hide(): void {
        // Cleanup if needed
        super.hide();
    }
}