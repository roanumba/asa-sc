const isDev = import.meta.env.DEV;

export const logger = {
    info: (...args: any[]) => { if (isDev) console.log(...args); },
    error: (...args: any[]) => { if (isDev) console.error(...args); },
};
