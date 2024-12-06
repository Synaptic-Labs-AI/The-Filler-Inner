// src/components/templateModal/templateDropdown.ts

/**
 * File: src/components/templateModal/templateDropdown.ts
 * Dropdown component for template selection
 * Features a searchable, keyboard-navigable interface
 */

import { Template } from '../../types';
import { debounce } from '../../utils/helpers'; // Ensure this path is correct

export class TemplateDropdown {
    private container: HTMLElement;
    private select!: HTMLSelectElement; // Definite assignment assertion
    private searchInput!: HTMLInputElement; // Definite assignment assertion
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
        // Create search input
        this.createSearchInput();

        // Create select element
        this.createSelect();

        // Add keyboard navigation
        this.setupKeyboardNavigation();
    }

    private createSearchInput() {
        const searchContainer = this.container.createDiv({ cls: 'search-container' });

        // Create search icon
        const searchIcon = searchContainer.createDiv({ cls: 'search-icon' });
        searchIcon.innerHTML = `
            <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
        `;

        this.searchInput = searchContainer.createEl('input', {
            cls: 'search-input',
            attr: {
                type: 'text',
                placeholder: 'Search templates...'
            }
        });

        // Add search functionality
        this.searchInput.addEventListener('input', debounce(() => {
            this.filterTemplates(this.searchInput.value);
        }, 150));
    }

    private createSelect() {
        const selectContainer = this.container.createDiv({ cls: 'select-container' });

        this.select = selectContainer.createEl('select', {
            cls: 'template-select'
        });

        // Add change handler
        this.select.addEventListener('change', () => {
            const selectedTemplate = this.templates.find(
                t => t.path === this.select.value
            );
            if (selectedTemplate) {
                this.onSelectCallback(selectedTemplate);
                this.animateSelection();
            }
        });
    }

    private setupKeyboardNavigation() {
        this.searchInput.addEventListener('keydown', (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    this.select.focus();
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (this.select.options.length > 0) {
                        this.select.selectedIndex = 0;
                        this.select.dispatchEvent(new Event('change'));
                    }
                    break;
            }
        });
    }

    private filterTemplates(query: string) {
        const normalizedQuery = query.toLowerCase();

        // Clear current options
        this.select.innerHTML = '';

        // Add filtered options with highlighting
        this.templates
            .filter(template =>
                template.name.toLowerCase().includes(normalizedQuery)
            )
            .forEach(template => {
                const option = new Option(
                    this.highlightMatch(template.name, normalizedQuery),
                    template.path
                );
                option.innerHTML = this.highlightMatch(
                    template.name,
                    normalizedQuery
                );
                this.select.appendChild(option);
            });

        // Add empty state if no results
        if (this.select.options.length === 0) {
            const emptyOption = new Option('No templates found', '');
            emptyOption.disabled = true;
            this.select.appendChild(emptyOption);
        }
    }

    private highlightMatch(text: string, query: string): string {
        if (!query) return text;

        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    private animateSelection() {
        this.select.classList.add('selected');
        setTimeout(() => {
            this.select.classList.remove('selected');
        }, 500);
    }

    setTemplates(templates: Template[]) {
        this.templates = templates;
        this.filterTemplates(this.searchInput.value);
    }

    onSelect(callback: (template: Template) => void) {
        this.onSelectCallback = callback;
    }

    getValue(): string {
        return this.select.value;
    }

    focus() {
        this.searchInput.focus();
    }
}
