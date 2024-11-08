/**
 * File: src/services/template-manager.ts
 * Manages template discovery, loading, and caching
 */

import { App, TFile, TFolder, normalizePath } from 'obsidian';
import { Template, TemplateError, isTemplate } from '../types';

export class TemplateManager {
    private app: App;
    private templatesPath: string;
    private templateCache: Map<string, Template>;
    private lastScanTime: number;
    private scanInterval: number = 5000; // 5 seconds

    constructor(app: App, templatesPath: string) {
        this.app = app;
        this.templatesPath = normalizePath(templatesPath);
        this.templateCache = new Map();
        this.lastScanTime = 0;
    }

    /**
     * Get all available templates
     * @returns Promise<Template[]> Array of available templates
     */
    async getTemplates(): Promise<Template[]> {
        await this.updateTemplatesCacheIfNeeded();
        return Array.from(this.templateCache.values());
    }

    /**
     * Get a specific template by path
     * @param path Template path
     * @returns Promise<Template> The requested template
     * @throws {TemplateError} If template not found
     */
    async getTemplate(path: string): Promise<Template> {
        await this.updateTemplatesCacheIfNeeded();
        const template = this.templateCache.get(path);
        
        if (!template) {
            throw new Error(TemplateError.NOT_FOUND);
        }
        
        return template;
    }

    /**
     * Load template content
     * @param path Template path
     * @returns Promise<string> Template content
     * @throws {TemplateError} If loading fails
     */
    async loadTemplate(path: string): Promise<string> {
        try {
            const template = await this.getTemplate(path);
            const content = await this.app.vault.read(template.file);
            return this.validateTemplateContent(content);
        } catch (error) {
            console.error('Failed to load template:', error);
            throw new Error(TemplateError.INVALID_CONTENT);
        }
    }

    /**
     * Update templates cache if needed
     * @private
     */
    private async updateTemplatesCacheIfNeeded(): Promise<void> {
        const now = Date.now();
        if (now - this.lastScanTime > this.scanInterval) {
            await this.scanTemplates();
            this.lastScanTime = now;
        }
    }

    /**
     * Scan for templates and update cache
     * @private
     */
    private async scanTemplates(): Promise<void> {
        try {
            // Get templates folder
            const templatesFolder = this.app.vault.getAbstractFileByPath(
                this.templatesPath
            );

            if (!(templatesFolder instanceof TFolder)) {
                console.warn('Templates folder not found:', this.templatesPath);
                return;
            }

            // Track current templates for cleanup
            const currentTemplates = new Set<string>();

            // Recursively scan for templates
            await this.scanFolder(templatesFolder, currentTemplates);

            // Cleanup removed templates
            for (const [path] of this.templateCache) {
                if (!currentTemplates.has(path)) {
                    this.templateCache.delete(path);
                }
            }
        } catch (error) {
            console.error('Failed to scan templates:', error);
            throw new Error(TemplateError.FILE_SYSTEM_ERROR);
        }
    }

    /**
     * Recursively scan folder for templates
     * @private
     */
    private async scanFolder(
        folder: TFolder, 
        currentTemplates: Set<string>
    ): Promise<void> {
        for (const child of folder.children) {
            if (child instanceof TFile && this.isValidTemplate(child)) {
                const template = await this.createTemplate(child);
                currentTemplates.add(template.path);
                this.templateCache.set(template.path, template);
            } else if (child instanceof TFolder) {
                await this.scanFolder(child, currentTemplates);
            }
        }
    }

    /**
     * Check if file is a valid template
     * @private
     */
    private isValidTemplate(file: TFile): boolean {
        return isTemplate(file) && this.hasValidExtension(file);
    }

    /**
     * Check file extension
     * @private
     */
    private hasValidExtension(file: TFile): boolean {
        return file.extension === 'md';
    }

    /**
     * Create template object from file
     * @private
     */
    private async createTemplate(file: TFile): Promise<Template> {
        return {
            path: file.path,
            name: this.formatTemplateName(file.name),
            file: file,
            mtime: file.stat.mtime
        };
    }

    /**
     * Format template name for display
     * @private
     */
    private formatTemplateName(filename: string): string {
        return filename
            .replace('.md', '')
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Validate template content
     * @private
     */
    private validateTemplateContent(content: string): string {
        if (!content || content.trim().length === 0) {
            throw new Error(TemplateError.INVALID_CONTENT);
        }

        // Add more validation as needed
        // For example, check for required sections or frontmatter

        return content;
    }

    /**
     * Get template metadata
     * @param path Template path
     * @returns Promise<Record<string, unknown>> Template metadata
     */
    async getTemplateMetadata(path: string): Promise<Record<string, unknown>> {
        const template = await this.getTemplate(path);
        const metadata = this.app.metadataCache.getFileCache(template.file);
        return metadata?.frontmatter || {};
    }

    /**
     * Check if template exists
     * @param path Template path
     * @returns Promise<boolean>
     */
    async templateExists(path: string): Promise<boolean> {
        await this.updateTemplatesCacheIfNeeded();
        return this.templateCache.has(path);
    }

    /**
     * Get template modification time
     * @param path Template path
     * @returns Promise<number> Modification timestamp
     */
    async getTemplateModificationTime(path: string): Promise<number> {
        const template = await this.getTemplate(path);
        return template.mtime;
    }

    /**
     * Set templates path
     * @param path New templates path
     */
    setTemplatesPath(path: string): void {
        this.templatesPath = normalizePath(path);
        this.templateCache.clear();
        this.lastScanTime = 0;
    }

    /**
     * Clear template cache
     */
    clearCache(): void {
        this.templateCache.clear();
        this.lastScanTime = 0;
    }
}