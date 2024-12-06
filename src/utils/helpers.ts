// src/utils/helpers.ts

/**
 * File: src/utils/helpers.ts
 * Utility helper functions
 */

/**
 * Debounce function to limit the rate at which a function can fire.
 * @param func The function to debounce.
 * @param wait The delay in milliseconds.
 * @returns A debounced version of the original function.
 */
export function debounce(func: Function, wait: number) {
    let timeout: number | undefined;
    return function (...args: any[]) {
        const later = () => {
            timeout = undefined;
            func(...args);
        };
        clearTimeout(timeout);
        timeout = window.setTimeout(later, wait);
    };
}
