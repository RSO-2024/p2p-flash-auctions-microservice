import { readdirSync, readFileSync, statSync } from 'fs';
import path from 'path';

/**
 * Class that manages base variables and configurations.
 */
class ConfigManager {
    private config: Record<string, string> = {};
    private configDir: string;

    constructor(configDir: string = '/app/app-config') {
        this.configDir = configDir;
        this.loadConfig(); // Initial load
    }

    // Load configuration from all files in the directory
    private loadConfig(): void {
        try {
            const files = readdirSync(this.configDir);

            this.config = files.reduce((acc, file) => {

                const filePath = path.join(this.configDir, file);

                // Skip if it's a directory or special files
                if (file === '..data' || file.startsWith('..') || statSync(filePath).isDirectory()) {
                    return acc;
                }
                
                const data = readFileSync(filePath, 'utf8');
                acc[file] = data.trim(); // Assuming one key-value pair per file
                return acc;
            }, {} as Record<string, string>);

            console.log('Configuration updated:', this.config);
        } catch (err) {
            console.log('Failed to load additional config. Skipping...');
        }
    }

    // Get the current configuration
    public getConfig(): Record<string, string> {
        return this.config;
    }

    // Refresh configuration by reloading all files in the directory
    public reloadConfig(): void {
        this.loadConfig();
    }
}

// Export a singleton instance
export const configManager = new ConfigManager(process.env.CONFIG_PATH || './app-config');