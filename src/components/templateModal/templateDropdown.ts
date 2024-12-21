// src/components/templateModal/templateDropdown.ts

/**
 * File: src/components/templateModal/templateDropdown.ts
 * Dropdown component for template selection
 */

import { Template } from '../../types';

export class TemplateDropdown {
    private container: HTMLElement;
    private select!: HTMLSelectElement;
    private templates: Template[] = [];
    private onSelectCallback: (template: Template) => void = () => {};

    constructor(parentEl: HTMLElement) {
        this.container = parentEl.createDiv({ cls: 'template-dropdown-container' });
        this.initializeComponent();
    }

    mount(parentEl: HTMLElement) {
        parentEl.appendChild(this.container);
    }

    private initializeComponent() {
        this.select = this.container.createEl('select', {
            cls: 'template-select'
        });

        this.select.addEventListener('change', () => {
            const selectedTemplate = this.templates.find(
                t => t.path === this.select.value
            );
            if (selectedTemplate) {
                this.onSelectCallback(selectedTemplate);
            }
        });
    }

    setTemplates(templates: Template[]) {
        this.templates = templates;
        this.select.innerHTML = '';
        
        // Add placeholder option
        const placeholder = new Option('Select a template...', '');
        placeholder.disabled = true;
        placeholder.selected = true;
        this.select.appendChild(placeholder);

        // Add template options
        templates.forEach(template => {
            const option = new Option(template.name, template.path);
            this.select.appendChild(option);
        });
    }

    onSelect(callback: (template: Template) => void) {
        this.onSelectCallback = callback;
    }

    getValue(): string {
        return this.select.value;
    }
}
