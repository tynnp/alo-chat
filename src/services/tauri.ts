import { sendNotification, isPermissionGranted, requestPermission } from '@tauri-apps/plugin-notification';
import { open, save } from '@tauri-apps/plugin-dialog';
import { readFile, writeFile, BaseDirectory } from '@tauri-apps/plugin-fs';

// Notification Service
export const notificationService = {
    requestPermission: async () => {
        let permissionGranted = await isPermissionGranted();
        if (!permissionGranted) {
            const permission = await requestPermission();
            permissionGranted = permission === 'granted';
        }
        return permissionGranted;
    },

    send: async (title: string, body: string) => {
        const permissionGranted = await notificationService.requestPermission();
        if (permissionGranted) {
            sendNotification({ title, body });
        }
    },

    newMessage: async (senderName: string, content: string) => {
        await notificationService.send(`New message from ${senderName}`, content);
    },
};

// File Service
export const fileService = {
    selectFile: async (filters?: { name: string; extensions: string[] }[]) => {
        const selected = await open({
            multiple: false,
            filters: filters || [
                { name: 'All Files', extensions: ['*'] },
                { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp'] },
                { name: 'Documents', extensions: ['pdf', 'doc', 'docx', 'txt'] },
            ],
        });
        return selected;
    },

    selectFiles: async () => {
        const selected = await open({
            multiple: true,
        });
        return selected;
    },

    saveFile: async (defaultPath?: string) => {
        const path = await save({
            defaultPath,
        });
        return path;
    },

    readFileAsBase64: async (path: string) => {
        const contents = await readFile(path);
        return btoa(String.fromCharCode(...contents));
    },

    writeFile: async (path: string, contents: Uint8Array) => {
        await writeFile(path, contents);
    },

    // Save to app data directory
    saveToAppData: async (filename: string, contents: Uint8Array) => {
        await writeFile(filename, contents, { baseDir: BaseDirectory.AppData });
    },
};
