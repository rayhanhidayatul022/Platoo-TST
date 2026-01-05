/**
 * Food Edit Form
 * Integrated with Katalog Microservice API
 */

let katalogService;
let foodId = null;
let currentFood = null;

async function loadFoodData() {
    try {
        // Ensure katalogService is initialized
        if (!katalogService) {
            console.error('❌ KatalogService not initialized!');
            await Utils.showAlert('Service belum siap, silakan refresh halaman', 'error');
            return;
        }
        
        // Get food ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        foodId = urlParams.get('id');

        console.log('📥 Loading food with ID:', foodId);

        if (!foodId) {
            await Utils.showAlert('ID makanan tidak ditemukan!', 'error');
            window.location.href = 'food-catalog.html';
            return;
        }

        Utils.showLoading(true);

        // Fetch food data from API
        console.log('🔍 Fetching food from API...');
        console.log('🔧 KatalogService:', katalogService);
        console.log('🌐 Base URL:', katalogService.baseUrl);
        
        const foods = await katalogService.getAllFoods();
        console.log('📦 All foods:', foods);
        
        // Find food by ID
        currentFood = foods.find(f => f.id === foodId || f.id === parseInt(foodId));
        
        if (!currentFood) {
            console.error('❌ Food not found with ID:', foodId);
            await Utils.showAlert('Makanan tidak ditemukan!', 'error');
            window.location.href = 'food-catalog.html';
            return;
        }
        
        console.log('✅ Food found:', currentFood);

        // Populate form fields
        document.getElementById('nama_makanan').value = currentFood.name || currentFood.nama_makanan || '';
        document.getElementById('harga').value = currentFood.price || currentFood.harga || 0;
        document.getElementById('stok').value = currentFood.stock || currentFood.stok || 0;
        
        if (document.getElementById('description')) {
            document.getElementById('description').value = currentFood.description || currentFood.deskripsi || '';
        }
        
        if (document.getElementById('image_url')) {
            document.getElementById('image_url').value = currentFood.image_url || currentFood.foto || '';
        }

        console.log('✅ Form populated with food data');
        Utils.showLoading(false);

    } catch (error) {
        console.error('❌ Error loading food:', error);
        Utils.showLoading(false);

        const errorMsg = Utils.handleApiError(error);
        await Utils.showAlert(`Gagal memuat data makanan: ${errorMsg}`, 'error');
        const errorMsg = Utils.handleApiError(error);
        await Utils.showAlert(`Gagal memuat data makanan: ${errorMsg}`, 'error');
        window.location.href = 'food-catalog.html';
    }
}

async function handleSubmit(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    console.log('🚀 Form submitted for update!');
    
    const submitBtn = document.querySelector('.btn-submit');
    const originalHTML = submitBtn ? submitBtn.innerHTML : '';
    
    try {
        // Check if katalogService is initialized
        if (!katalogService) {
            console.error('❌ KatalogService not initialized!');
            await Utils.showAlert('Service belum siap, silakan refresh halaman', 'error');
            return false;
        }
        
        // Check authentication
        console.log('🔒 Checking authentication...');
        if (!Utils.requireAuth()) {
            console.log('❌ Not authenticated');
            return false;
        }
        console.log('✅ User authenticated');

        if (!submitBtn) {
            console.error('❌ Submit button not found!');
            await Utils.showAlert('Error: Submit button tidak ditemukan', 'error');
            return false;
        }
        
        Utils.showLoading(true);
        submitBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="animation: spin 0.8s linear infinite;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> Menyimpan...';
        submitBtn.disabled = true;

        // Collect form data
        console.log('📝 Collecting form data...');
        
        // Use FormData for file upload
        const formData = new FormData();
        formData.append('name', document.getElementById('nama_makanan').value.trim());
        formData.append('price', parseInt(document.getElementById('harga').value));
        formData.append('stock', parseInt(document.getElementById('stok').value));
        formData.append('resto_id', 1); // Fixed resto_id = 1
        
        const description = document.getElementById('description') ? document.getElementById('description').value.trim() : '';
        if (description) {
            formData.append('description', description);
        }
        
        // Handle file upload (only if new file selected)
        const imageInput = document.getElementById('image');
        if (imageInput && imageInput.files && imageInput.files[0]) {
            formData.append('image', imageInput.files[0]);
            console.log('📷 New image file attached:', imageInput.files[0].name);
        }
        
        formData.append('is_active', true);
        
        console.log('📦 Form data prepared for update');
        console.log('📦 Will PUT to:', `${katalogService.baseUrl}${API_CONFIG.endpoints.katalog.update(foodId)}`);
        
        // Log FormData contents
        for (let pair of formData.entries()) {
            console.log('📦', pair[0] + ':', pair[1]);
        }

        // Validation
        const nama = document.getElementById('nama_makanan').value.trim();
        const harga = parseInt(document.getElementById('harga').value);
        const stok = parseInt(document.getElementById('stok').value);
        
        if (!nama) {
            console.log('⚠️ Name missing');
            await Utils.showAlert('Nama makanan wajib diisi!', 'warning');
            Utils.showLoading(false);
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
            return false;
        }

        if (harga <= 0 || isNaN(harga)) {
            console.log('⚠️ Invalid price');
            await Utils.showAlert('Harga harus lebih dari 0!', 'warning');
            Utils.showLoading(false);
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
            return false;
        }

        if (stok < 0 || isNaN(stok)) {
            console.log('⚠️ Invalid stock');
            await Utils.showAlert('Stok tidak boleh negatif!', 'warning');
            Utils.showLoading(false);
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
            return false;
        }

        // Send data to API
        console.log('📡 Updating food via API...');
        const response = await katalogService.updateFood(foodId, formData);
        console.log('✅ API response:', response);

        Utils.showLoading(false);
        submitBtn.innerHTML = originalHTML;
        submitBtn.disabled = false;

        // Show success message
        await Utils.showAlert('Makanan berhasil diupdate!', 'success');

        // Redirect to catalog
        window.location.href = 'food-catalog.html';

    } catch (error) {
        console.error('❌ Error updating food:', error);
        Utils.showLoading(false);
        
        if (submitBtn) {
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
        }

        const errorMsg = Utils.handleApiError(error);
        await Utils.showAlert(`Gagal mengupdate makanan: ${errorMsg}`, 'error');
        
        return false;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('✨ Food Edit page loaded');
    
    // Initialize service
    try {
        console.log('🔧 Initializing KatalogService...');
        katalogService = new KatalogService();
        console.log('✅ KatalogService initialized:', katalogService);
        console.log('✅ Base URL:', katalogService.baseUrl);
    } catch (error) {
        console.error('❌ Error initializing KatalogService:', error);
        await Utils.showAlert('Gagal menginisialisasi service katalog', 'error');
        return;
    }
    
    // Load food data
    await loadFoodData();
    
    // Setup form submission
    const form = document.getElementById('foodForm') || document.getElementById('foodEditForm');
    if (form) {
        form.addEventListener('submit', handleSubmit);
        console.log('✅ Form submit handler attached');
    } else {
        console.error('❌ Food form not found!');
    }
    
    // Setup image preview
    const imageInput = document.getElementById('image');
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const preview = document.getElementById('imagePreview');
                    const previewImg = document.getElementById('previewImg');
                    if (preview && previewImg) {
                        previewImg.src = event.target.result;
                        preview.style.display = 'block';
                    }
                };
                reader.readAsDataURL(file);
            }
        });
        console.log('✅ Image preview handler attached');
    }
});
