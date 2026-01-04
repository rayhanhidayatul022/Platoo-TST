/**
 * API Service Layer
 * Handles all HTTP requests to microservices
 */

class ApiService {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    /**
     * Generic HTTP request handler
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            method: options.method || 'GET',
            headers: API_CONFIG.getHeaders(options.requireAuth),
            ...options
        };

        // Add body if exists
        if (options.body) {
            config.body = JSON.stringify(options.body);
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
            
            config.signal = controller.signal;

            const response = await fetch(url, config);
            clearTimeout(timeoutId);

            // Parse response
            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            // Handle errors
            if (!response.ok) {
                throw {
                    status: response.status,
                    message: data.message || data.error || 'Request failed',
                    data: data
                };
            }

            return data;
        } catch (error) {
            console.error(`API Request Error [${endpoint}]:`, error);
            
            if (error.name === 'AbortError') {
                throw { message: 'Request timeout', status: 408 };
            }
            
            throw error;
        }
    }

    /**
     * GET request
     */
    async get(endpoint, requireAuth = false) {
        return this.request(endpoint, { method: 'GET', requireAuth });
    }

    /**
     * POST request
     */
    async post(endpoint, body, requireAuth = false) {
        return this.request(endpoint, { method: 'POST', body, requireAuth });
    }

    /**
     * PUT request
     */
    async put(endpoint, body, requireAuth = false) {
        return this.request(endpoint, { method: 'PUT', body, requireAuth });
    }

    /**
     * DELETE request
     */
    async delete(endpoint, requireAuth = false) {
        return this.request(endpoint, { method: 'DELETE', requireAuth });
    }
}

// Export untuk digunakan di file lain
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiService;
}
