const errorHandler = (err, req, res, next) => {
    console.error('Error Stack:', err.stack);

    // Default error
    let error = {
        success: false,
        message: err.message || 'Internal Server Error',
        status: err.status || 500
    };

    // Gemini AI API errors
    if (err.message?.includes('QUOTA_EXCEEDED')) {
        error.message = 'Gemini AI API quota exceeded. Please check your API key and billing.';
        error.status = 402;
    }

    // Rate limiting errors
    if (err.code === 'rate_limit_exceeded') {
        error.message = 'Rate limit exceeded. Please try again later.';
        error.status = 429;
    }

    // Invalid API key
    if (err.message?.includes('API_KEY_INVALID')) {
        error.message = 'Invalid Gemini AI API key. Please check your configuration.';
        error.status = 401;
    }

    // Scraping errors
    if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
        error.message = 'Unable to access the provided URL. Please check if the URL is valid and accessible.';
        error.status = 400;
    }

    // Development error details
    if (process.env.NODE_ENV === 'development') {
        error.stack = err.stack;
    }

    res.status(error.status).json(error);
};

module.exports = errorHandler; 