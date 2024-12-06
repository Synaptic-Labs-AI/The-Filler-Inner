// src/services/fileService.ts

/**
 * File: src/services/fileService.ts
 * Service for handling file operations like writing filled templates
 */

import { App, TFolder, normalizePath, Notice } from 'obsidian';
import { Template } from '../types';
import { DEFAULT_SETTINGS } from '@/types/settings';
import { FillerInnerSettings } from '@/types/settings';

export class FileService {
    private app: App;
    private outputPath: string;
    private templateExtension: string;

    constructor(app: App, settings: FillerInnerSettings) {
        this.app = app;
        this.outputPath = normalizePath(settings.paths.outputPath);
        this.templateExtension = settings.paths.templateExtension || 'md';
    }

    /**
     * Creates a filled template file in the specified output path
     * @param template The original template
     * @param content The filled content to write
     * @returns A promise that resolves when the file is created
     */
    async createFilledFile(template: Template, content: string): Promise<void> {
        const folderPath = this.outputPath || this.app.vault.getRoot().path;

        // Ensure the folder exists
        let folder: TFolder;
        const folderFile = this.app.vault.getAbstractFileByPath(folderPath);
        if (folderFile instanceof TFolder) {
            folder = folderFile;
        } else {
            // Attempt to create the folder if it doesn't exist
            try {
                folder = await this.app.vault.createFolder(folderPath);
                new Notice(`Created output folder: ${folderPath}`);
            } catch (error) {
                console.error('Failed to create output folder:', error);
                new Notice('Failed to create output folder.');
                throw error;
            }
        }

        // Generate a unique file name, e.g., template name with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `${template.name}-${timestamp}.${this.templateExtension}`;
        const filePath = `${folder.path}/${fileName}`;

        // Check if file already exists (highly unlikely with timestamp)
        const existingFile = this.app.vault.getAbstractFileByPath(filePath);
        if (existingFile) {
            new Notice(`File already exists: ${filePath}`);
            throw new Error(`File already exists: ${filePath}`);
        }

        try {
            await this.app.vault.create(filePath, content);
            new Notice(`Filled template saved to ${filePath}`);
        } catch (error) {
            console.error('Failed to create filled template file:', error);
            new Notice('Failed to save filled template.');
            throw error;
        }
    }

    /**
     * Generates a unique file name based on template name and current timestamp
     * @param templateName The name of the template
     * @returns A unique file name string
     */
    generateUniqueFileName(templateName: string): string {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        return `${templateName}-${timestamp}.${this.templateExtension}`;
    }

    /**
     * Validates and retrieves the output folder, creating it if necessary
     * @returns A promise that resolves to the TFolder object
     */
    async getOrCreateOutputFolder(): Promise<TFolder> {
        const folderPath = this.outputPath || this.app.vault.getRoot().path;
        let folder: TFolder;

        const folderFile = this.app.vault.getAbstractFileByPath(folderPath);
        if (folderFile instanceof TFolder) {
            folder = folderFile;
        } else {
            try {
                folder = await this.app.vault.createFolder(folderPath);
                new Notice(`Created output folder: ${folderPath}`);
            } catch (error) {
                console.error('Failed to create output folder:', error);
                new Notice('Failed to create output folder.');
                throw error;
            }
        }

        return folder;
    }
}
