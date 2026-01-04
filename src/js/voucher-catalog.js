/**
 * Voucher Catalog Management
 * Integrated with Voucher Microservice API
 */

// Voucher state
let voucherList = [];

async function fetchCatalogData() {
    try {
        Utils.showLoading(true);
        
        // Fetch all vouchers from API
        const vouchers = await voucherService.getAllVouchers();
        
        console.log('✅ Vouchers fetched from API:', vouchers);
        
        // Filter by restaurant if needed
        const userData = Utils.getCurrentUser();
        if (userData && userData.id) {
            // Filter vouchers by restaurant ID if your API supports it
            // For now, show all vouchers
            voucherList = Array.isArray(vouchers) ? vouchers : [];
        } else {
            voucherList = Array.isArray(vouchers) ? vouchers : [];
        }
        
        Utils.showLoading(false);
        return voucherList;
        
    } catch (error) {
        console.error('Error fetching vouchers:', error);
        Utils.showLoading(false);
        
        const errorMsg = Utils.handleApiError(error);
        await Utils.showAlert(`Gagal memuat data voucher: ${errorMsg}`, 'error');
        return [];
    }
}


function renderCatalogTable(catalogItems) {
    const tbody = document.querySelector('.table tbody');

    tbody.innerHTML = '';
    
    if (catalogItems.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding:40px; color:#999;">
                    Belum ada voucher. Klik "Tambah Voucher Baru" untuk mulai.
                </td>
            </tr>
        `;
        return;
    }

    catalogItems.forEach(item => {
        const row = createTableRow(item);
        tbody.appendChild(row);
    });
}


function createTableRow(item) {
    const tr = document.createElement('tr');
    
    // Format data dari API response
    const voucherName = item.name || item.nama_voucher || '-';
    const voucherCode = item.code || '-';
    
    // Format discount display
    let discountDisplay = '-';
    if (item.discount_type === 'PERCENT') {
        discountDisplay = `${item.discount_value}%`;
    } else if (item.discount_type === 'FIXED') {
        discountDisplay = Utils.formatCurrency(item.discount_value);
    }
    
    // Format min purchase
    const minPurchase = Utils.formatCurrency(item.min_order_amount || 0);
    
    // Format dates
    const startDate = item.start_at ? Utils.formatDate(item.start_at) : '-';
    const endDate = item.end_at ? Utils.formatDate(item.end_at) : '-';
    
    // Status badge
    const isActive = item.is_active && 
                     (!item.end_at || new Date(item.end_at) > new Date()) &&
                     (item.total_redeemed < item.max_total_redemptions);
    const statusBadge = isActive 
        ? '<span style="color: #10b981;">● Aktif</span>' 
        : '<span style="color: #ef4444;">● Tidak Aktif</span>';
    
    tr.innerHTML = `
        <td>${voucherCode}</td>
        <td>${voucherName}</td>
        <td>${discountDisplay}</td>
        <td>${minPurchase}</td>
        <td>${startDate}<br><small style="color: #666;">s/d ${endDate}</small></td>
        <td>${statusBadge}</td>
        <td class="actions">
            <div class="action-buttons">
                <a href="voucher-edit.html?id=${item.id}" class="btn-edit" title="Edit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                </a>
                <button class="btn-delete" title="Hapus" onclick="handleDelete('${item.id}', '${voucherName}', ${item.total_redeemed})">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                </button>
            </div>
        </td>
    `;
    
    return tr;
}


async function handleDelete(voucherId, voucherName, totalRedeemed) {
    // Check if voucher has been used
    if (totalRedeemed > 0) {
        await Utils.showAlert(
            `Voucher "${voucherName}" sudah pernah digunakan ${totalRedeemed} kali dan tidak bisa dihapus.`,
            'warning'
        );
        return;
    }
    
    const confirmed = await Utils.showConfirm(
        `Yakin ingin menghapus voucher "${voucherName}"?`,
        'Hapus Voucher'
    );
    
    if (!confirmed) return;
    
    try {
        Utils.showLoading(true);
        
        await voucherService.deleteVoucher(voucherId);
        
        Utils.showLoading(false);
        await Utils.showAlert('Voucher berhasil dihapus!', 'success');
        
        // Reload catalog
        await loadCatalog();
        
    } catch (error) {
        console.error('Error deleting voucher:', error);
        Utils.showLoading(false);
        
        const errorMsg = Utils.handleApiError(error);
        await Utils.showAlert(`Gagal menghapus voucher: ${errorMsg}`, 'error');
    }
}

async function loadCatalog() {
    try {
        // Check if user is authenticated
        if (!Utils.requireAuth()) {
            return;
        }
        
        const catalogItems = await fetchCatalogData();
        renderCatalogTable(catalogItems);
        
    } catch (error) {
        console.error('Error loading catalog:', error);
        await Utils.showAlert('Terjadi kesalahan saat memuat katalog', 'error');
    }
}


document.addEventListener('DOMContentLoaded', () => {
    console.log('Voucher Catalog page loaded');
    loadCatalog();
});
