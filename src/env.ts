
export default {
    DEBUG: process.env.DEBUG !== "0" && !!process.env.DEBUG,
    PORT: parseInt(process.env.PORT || "8000", 10),
    APP_SECRET: process.env.APP_SECRET || 'secret-key',

    NODE_ENV: process.env.NODE_ENV || 'development',
} as const;
