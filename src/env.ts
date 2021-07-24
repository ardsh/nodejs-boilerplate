
export default {
    DEBUG: process.env.DEBUG !== "0" && !!process.env.DEBUG,
    PORT: parseInt(process.env.PORT || "8000", 10),

    NODE_ENV: process.env.NODE_ENV || 'development',
} as const;
