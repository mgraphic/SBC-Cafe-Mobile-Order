import { sharedEnvironment } from './shared-environment';

type SharedEnvironment = ReturnType<typeof sharedEnvironment>;

/**
 * Environment provider for the shared module.
 * This allows host applications to properly initialize the shared module's environment
 * after loading their own environment variables.
 */
class EnvironmentProvider {
    private environment: SharedEnvironment | null = null;
    private initialized = false;

    /**
     * Initialize the environment provider with the shared environment configuration.
     * This should be called by the host application after loading environment variables.
     */
    init(env?: SharedEnvironment): void {
        if (!this.initialized) {
            this.environment = env || sharedEnvironment();
            this.initialized = true;
        }
    }

    /**
     * Get the shared environment configuration.
     * Automatically initializes if not already initialized (for backward compatibility).
     */
    getEnvironment(): SharedEnvironment {
        if (!this.initialized) {
            this.init();
        }
        return this.environment!;
    }

    /**
     * Check if the environment provider has been initialized.
     */
    isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * Reset the environment provider (primarily for testing).
     */
    reset(): void {
        this.environment = null;
        this.initialized = false;
    }
}

// Export a singleton instance
export const environmentProvider = new EnvironmentProvider();

/**
 * Initialize the shared module environment.
 * Call this from your host application after loading environment variables.
 *
 * @example
 * ```typescript
 * import { config } from 'dotenv';
 * import { initializeSharedEnvironment } from 'sbc-cafe-shared-module';
 *
 * config({ path: resolve(process.cwd(), '../../../.env') });
 * initializeSharedEnvironment();
 * ```
 */
export function initializeSharedEnvironment(env?: SharedEnvironment): void {
    environmentProvider.init(env);
}

/**
 * Get the current shared environment configuration.
 * If not initialized, will auto-initialize for backward compatibility.
 */
export function getSharedEnvironment(): SharedEnvironment {
    return environmentProvider.getEnvironment();
}
