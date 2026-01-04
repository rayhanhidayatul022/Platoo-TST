/**
 * Food Catalog Management
 * Integrated with Katalog Makanan Microservice API
 */

// Food catalog state
let foodList = [];

async function fetchCatalogData() {
    try {
        Utils.showLoading(true);
        
        // Fetch all foods from API
        const foods = await katalogService.getAllFoods();
        
        console.log('✅ Foods fetched from API:', foods);
        
        // Filter by restaurant if needed
        const userData = Utils.getCurrentUser();
        if (userData && userData.id) {
            // Filter foods by restaurant ID if your API supports it
            // For now, show all foods
            foodList = Array.isArray(foods) ? foods : [];
        } else {
            foodList = Array.isArray(foods) ? foods : [];
        }
        
        Utils.showLoading(false);
        return foodList;
        
    } catch (error) {
        console.error('Error fetching foods:', error);
        Utils.showLoading(false);
        
        const errorMsg = Utils.handleApiError(error);
        await Utils.showAlert(`Gagal memuat data katalog: ${errorMsg}`, 'error');
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
                    Belum ada makanan di katalog. Klik "Tambah Makanan Baru" untuk mulai.
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
    
    // Format data from API response
    const foodName = item.name || item.nama_makanan || '-';
    const price = Utils.formatCurrency(item.price || item.harga || 0);
    const stock = item.stock || item.stok || 0;
    const imageUrl = item.image_url || item.foto || '/src/img/placeholder-food.png';
    const description = item.description || item.deskripsi || '';
    
    // Status handling
    const isActive = item.is_active !== false; // default true if not set
    const statusClass = isActive ? 'active' : 'inactive';
    const statusBadge = isActive 
        ? '<span style="color: #10b981;">● Tersedia</span>' 
        : '<span style="color: #ef4444;">● Tidak Tersedia</span>';
    
    // Add opacity to row if inactive
    if (!isActive) {
        tr.style.opacity = '0.7';
    }
    
    tr.innerHTML = `
        <td style="width:120px;">
            <img src="${imageUrl}" alt="${foodName}" 
                 style="width:100px;height:70px;object-fit:cover;border-radius:8px;"
                 onerror="this.src='/src/img/placeholder-food.png'">
        </td>
        <td>
            <strong>${foodName}</strong>
            ${description ? `<br><small style="color: #666;">${description.substring(0, 50)}${description.length > 50 ? '...' : ''}</small>` : ''}
        </td>
        <td>${stock}</td>
        <td>${price}</td>
        <td>${statusBadge}</td>
        <td class="actions">
            <div class="action-buttons">
                <a href="food-edit.html?id=${item.id}" class="btn-edit" title="Edit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                </a>
                <button class="btn-toggle ${statusClass}" title="${isActive ? 'Nonaktifkan' : 'Aktifkan'}" 
                        onclick="handleToggleStatus('${item.id}', '${foodName}', ${isActive})">
                    ${isActive ? 
                        `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>` : 
                        `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>`
                    }
                </button>
            </div>
        </td>
    `;
    
    return tr;
}


async function handleToggleStatus(foodId, foodName, currentStatus) {
    const newStatus = !currentStatus;
    const action = newStatus ? 'mengaktifkan' : 'menonaktifkan';
    
    const confirmed = await Utils.showConfirm(
        `Yakin ingin ${action} "${foodName}"?`,
        'Ubah Status Makanan'
    );
    
    if (!confirmed) return;
    
    try {
        Utils.showLoading(true);
        
        // Update food status via API
        await katalogService.updateFood(foodId, {
            is_active: newStatus
        });
        
        Utils.showLoading(false);
        
        const statusText = newStatus ? 'diaktifkan' : 'dinonaktifkan';
        await Utils.showAlert(`Makanan berhasil ${statusText}!`, 'success');
        
        // Reload catalog
        await loadCatalog();
        
    } catch (error) {
        console.error('Error toggling status:', error);
        Utils.showLoading(false);
        
        const errorMsg = Utils.handleApiError(error);
        await Utils.showAlert(`Gagal mengubah status: ${errorMsg}`, 'error');
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
    console.log('Food Catalog page loaded');
    loadCatalog();
});
