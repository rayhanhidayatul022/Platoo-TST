/**
 * Voucher Service
 * Handles all voucher-related API calls
 */

class VoucherService extends ApiService {
    constructor() {
        super(API_CONFIG.VOUCHER_BASE_URL);
    }

    /**
     * Get all vouchers (PUBLIC)
     */
    async getAllVouchers() {
        try {
            const response = await this.get(API_CONFIG.endpoints.voucher.getAll);
            return response.data || response;
        } catch (error) {
            console.error('Error fetching vouchers:', error);
            throw error;
        }
    }

    /**
     * Get voucher by code (PUBLIC)
     */
    async getVoucherByCode(code) {
        try {
            const response = await this.get(API_CONFIG.endpoints.voucher.getByCode(code));
            return response.data || response;
        } catch (error) {
            console.error(`Error fetching voucher ${code}:`, error);
            throw error;
        }
    }

    /**
     * Create voucher (ADMIN ONLY)
     */
    async createVoucher(voucherData) {
        try {
            const response = await this.post(
                API_CONFIG.endpoints.voucher.create,
                voucherData,
                true // requireAuth
            );
            return response.data || response;
        } catch (error) {
            console.error('Error creating voucher:', error);
            throw error;
        }
    }

    /**
     * Update voucher (ADMIN ONLY)
     */
    async updateVoucher(id, voucherData) {
        try {
            const response = await this.put(
                API_CONFIG.endpoints.voucher.update(id),
                voucherData,
                true // requireAuth
            );
            return response.data || response;
        } catch (error) {
            console.error(`Error updating voucher ${id}:`, error);
            throw error;
        }
    }

    /**
     * Delete voucher (ADMIN ONLY)
     */
    async deleteVoucher(id) {
        try {
            const response = await this.delete(
                API_CONFIG.endpoints.voucher.delete(id),
                true // requireAuth
            );
            return response;
        } catch (error) {
            console.error(`Error deleting voucher ${id}:`, error);
            throw error;
        }
    }

    /**
     * Redeem voucher (USER ONLY)
     */
    async redeemVoucher(code, orderData) {
        try {
            const response = await this.post(
                API_CONFIG.endpoints.voucher.redeem(code),
                orderData,
                true // requireAuth
            );
            return response.data || response;
        } catch (error) {
            console.error(`Error redeeming voucher ${code}:`, error);
            throw error;
        }
    }

    /**
     * Login to voucher service
     */
    async login(email, password) {
        try {
            const response = await this.post(
                API_CONFIG.endpoints.auth.login,
                { email, password }
            );
            
            // Save token if login successful
            if (response.data && response.data.session) {
                localStorage.setItem('platoo_auth_token', response.data.session.access_token);
                localStorage.setItem('platoo_user_role', response.data.user.role);
            }
            
            return response.data || response;
        } catch (error) {
            console.error('Error logging in:', error);
            throw error;
        }
    }

    /**
     * Register to voucher service
     */
    async register(email, password, full_name) {
        try {
            const response = await this.post(
                API_CONFIG.endpoints.auth.register,
                { email, password, full_name }
            );
            return response.data || response;
        } catch (error) {
            console.error('Error registering:', error);
            throw error;
        }
    }
}

// Create singleton instance
const voucherService = new VoucherService();

// Export untuk digunakan di file lain
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VoucherService, voucherService };
}
