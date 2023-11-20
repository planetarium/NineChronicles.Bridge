export function getEnv(key: string): string | undefined {
    return process.env[key];
}

export function getRequiredEnv(key: string): string {
    const env = getEnv(key);
    if (env === undefined) {
        throw new Error(`${key} envrionment variable doesn't exist.`);
    }

    return env;
}
