
import { RequestUrlParam } from 'obsidian';

declare module 'obsidian' {
    interface RequestUrlOptions {
        url: string;
        method?: string;
        headers?: Record<string, string>;
        body?: string | ArrayBuffer;
        contentType?: string;
    }

    interface RequestUrlResponse {
        status: number;
        headers: Record<string, string>;
        arrayBuffer: ArrayBuffer;
        json: any;
        text: string;
    }

    function requestUrl(options: RequestUrlOptions | string): Promise<RequestUrlResponse>;
}