/**
 * Katalog Service
 * Handles all food catalog-related API calls
 */

class KatalogService extends ApiService {
    constructor() {
        super(API_CONFIG.KATALOG_BASE_URL);
    }

    /**
     * Get all foods (PUBLIC)
     * @param {Object} params - Query parameters (optional)
     * @returns {Promise<Array>} List of foods
     */
    async getAllFoods(params = {}) {
        try {
            let endpoint = API_CONFIG.endpoints.katalog.getAll;
            
            // Add query parameters if exists
            if (Object.keys(params).length > 0) {
                const queryString = new URLSearchParams(params).toString();
                endpoint += `?${queryString}`;
            }
            
            const response = await this.get(endpoint);
            return response.data || response;
        } catch (error) {
            console.error('Error fetching foods:', error);
            throw error;
        }
    }

    /**
     * Get food by ID (PUBLIC)
     * @param {string} id - Food ID
     * @returns {Promise<Object>} Food details
     */
    async getFoodById(id) {
        try {
            const response = await this.get(API_CONFIG.endpoints.katalog.getById(id));
            return response.data || response;
        } catch (error) {
            console.error(`Error fetching food ${id}:`, error);
            throw error;
        }
    }

    /**
     * Search foods (PUBLIC)
     * @param {string} query - Search query
     * @returns {Promise<Array>} List of matching foods
     */
    async searchFoods(query) {
        try {
            const endpoint = `${API_CONFIG.endpoints.katalog.search}?q=${encodeURIComponent(query)}`;
            const response = await this.get(endpoint);
            return response.data || response;
        } catch (error) {
            console.error('Error searching foods:', error);
            throw error;
        }
    }

    /**
     * Create food (ADMIN ONLY)
     * @param {Object} foodData - Food data
     * @returns {Promise<Object>} Created food
     */
    async createFood(foodData) {
        try {
            const response = await this.post(
                API_CONFIG.endpoints.katalog.create,
                foodData,
                true // requireAuth
            );
            return response.data || response;
        } catch (error) {
            console.error('Error creating food:', error);
            throw error;
        }
    }

    /**
     * Update food (ADMIN ONLY)
     * @param {string} id - Food ID
     * @param {Object} foodData - Updated food data
     * @returns {Promise<Object>} Updated food
     */
    async updateFood(id, foodData) {
        try {
            const response = await this.put(
                API_CONFIG.endpoints.katalog.update(id),
                foodData,
                true // requireAuth
            );
            return response.data || response;
        } catch (error) {
            console.error(`Error updating food ${id}:`, error);
            throw error;
        }
    }

    /**
     * Delete food (ADMIN ONLY)
     * @param {string} id - Food ID
     * @returns {Promise<Object>} Delete response
     */
    async deleteFood(id) {
        try {
            const response = await this.delete(
                API_CONFIG.endpoints.katalog.delete(id),
                true // requireAuth
            );
            return response;
        } catch (error) {
            console.error(`Error deleting food ${id}:`, error);
            throw error;
        }
    }
}

// Create singleton instance
const katalogService = new KatalogService();

// Export untuk digunakan di file lain
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { KatalogService, katalogService };
}
