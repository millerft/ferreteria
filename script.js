// script.js
// Arrays para almacenar los productos en el carrito
let cart = [];
let categories = [];
let products = [];

// Constantes para el IGV (Impuesto General a las Ventas en Perú)
const IGV_RATE = 0.18; // 18%

// Credenciales de administrador (para demostración, en un entorno real esto iría en el servidor)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'password123';

// Función para inicializar el carrito, categorías y productos desde localStorage
function initializeData() {
    const storedCart = localStorage.getItem('hardwareStoreCart');
    if (storedCart) {
        try {
            cart = JSON.parse(storedCart);
        } catch (e) {
            console.error("Error parsing cart from localStorage:", e);
            cart = [];
        }
    }

    const storedCategories = localStorage.getItem('hardwareStoreCategories');
    if (storedCategories) {
        try {
            categories = JSON.parse(storedCategories);
        } catch (e) {
            console.error("Error parsing categories from localStorage:", e);
            categories = [];
        }
    }

    const storedProducts = localStorage.getItem('hardwareStoreProducts');
    if (storedProducts) {
        try {
            products = JSON.parse(storedProducts);
            // Asegurarse de que todos los productos tengan una propiedad 'stock'
            products = products.map(p => ({ ...p, stock: p.stock !== undefined ? p.stock : 0 }));
        } catch (e) {
            console.error("Error parsing products from localStorage:", e);
            products = [];
        }
    }

    // Si no hay productos ni categorías, añadir algunos de ejemplo
    if (products.length === 0 && categories.length === 0) {
        categories = [
            { id: 'cat-1', name: 'Herramientas Manuales', imageUrl: 'https://placehold.co/100x100/e0e0e0/555555?text=Manual' },
            { id: 'cat-2', name: 'Fijaciones', imageUrl: 'https://placehold.co/100x100/e0e0e0/555555?text=Fijaciones' },
            { id: 'cat-3', name: 'Medición', imageUrl: 'https://placehold.co/100x100/e0e0e0/555555?text=Medicion' }
        ];
        products = [
            { id: 'prod-1', name: 'Martillo de Uña', description: 'Un martillo robusto para trabajos de carpintería y construcción.', price: 15.99, imageUrl: 'https://placehold.co/300x200/e0e0e0/555555?text=Martillo', categoryId: 'cat-1', stock: 50 },
            { id: 'prod-2', name: 'Set de Tornillos Variados', description: 'Caja con tornillos de diferentes tamaños y tipos.', price: 8.50, imageUrl: 'https://placehold.co/300x200/e0e0e0/555555?text=Tornillos', categoryId: 'cat-2', stock: 120 },
            { id: 'prod-3', name: 'Cinta Métrica 5m', description: 'Cinta métrica retráctil de alta precisión.', price: 7.25, imageUrl: 'https://placehold.co/300x200/e0e0e0/555555?text=Cinta+Métrica', categoryId: 'cat-3', stock: 75 },
            { id: 'prod-4', name: 'Taladro Inalámbrico', description: 'Ideal para perforar y atornillar en madera, metal y plástico.', price: 79.99, imageUrl: 'https://placehold.co/300x200/e0e0e0/555555?text=Taladro', categoryId: 'cat-1', stock: 30 },
            { id: 'prod-5', name: 'Llave Inglesa Ajustable', description: 'Una herramienta esencial para cualquier caja de herramientas.', price: 12.50, imageUrl: 'https://placehold.co/300x200/e0e0e0/555555?text=Llave+Inglesa', categoryId: 'cat-1', stock: 90 },
            { id: 'prod-6', name: 'Set de Destornilladores', description: 'Variedad de puntas para todo tipo de tornillos.', price: 25.00, imageUrl: 'https://placehold.co/300x200/e0e0e0/555555?text=Set+Destornilladores', categoryId: 'cat-1', stock: 60 }
        ];
        saveCategories();
        saveProducts();
    }
    updateCartDisplay(); // Actualizar el contador del carrito en todas las páginas
    renderProducts(); // Renderizar productos en index.html
    renderCategoryFilters(); // Renderizar las categorías en el filtro de index.html
    
    // Solo renderizar en modo desarrollador si ya está autenticado (o al cargar la página de dev)
    if (document.getElementById('developer-mode-content') && localStorage.getItem('isAdminAuthenticated') === 'true') {
        renderCategories();
        renderProductsDevMode();
    }
}

// Funciones para guardar datos en localStorage
function saveCart() {
    localStorage.setItem('hardwareStoreCart', JSON.stringify(cart));
}

function saveCategories() {
    localStorage.setItem('hardwareStoreCategories', JSON.stringify(categories));
}

function saveProducts() {
    localStorage.setItem('hardwareStoreProducts', JSON.stringify(products));
}

// Función para actualizar la visualización del carrito
function updateCartDisplay() {
    const cartItemsList = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');
    const cartCountSpan = document.getElementById('cart-count');

    // Esta parte se ejecuta en index.html para el modal del carrito
    if (cartItemsList && cartTotalSpan) {
        cartItemsList.innerHTML = ''; // Limpiar la lista actual
        let total = 0;
        let itemCount = 0;

        if (cart.length === 0) {
            cartItemsList.innerHTML = '<li class="text-gray-600 text-center">El carrito está vacío.</li>';
        } else {
            cart.forEach(item => {
                const listItem = document.createElement('li');
                listItem.classList.add('flex', 'justify-between', 'items-center', 'border-b', 'pb-2');
                listItem.innerHTML = `
                    <div>
                        <span class="font-semibold">${item.name}</span>
                        <span class="text-gray-600"> x ${item.quantity}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button class="update-quantity-btn bg-gray-200 px-2 py-1 rounded-md hover:bg-gray-300" data-product-id="${item.id}" data-action="decrease">-</button>
                        <span class="font-bold">$${(item.price * item.quantity).toFixed(2)}</span>
                        <button class="update-quantity-btn bg-gray-200 px-2 py-1 rounded-md hover:bg-gray-300" data-product-id="${item.id}" data-action="increase">+</button>
                        <button class="remove-from-cart-btn bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600" data-product-id="${item.id}">Eliminar</button>
                    </div>
                `;
                cartItemsList.appendChild(listItem);
                total += item.price * item.quantity;
                itemCount += item.quantity;
            });
        }
        cartTotalSpan.textContent = `$${total.toFixed(2)}`;
    }

    // Esta parte se ejecuta en todas las páginas para el contador del icono del carrito
    if (cartCountSpan) {
        const totalItemsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountSpan.textContent = totalItemsInCart;
        if (totalItemsInCart === 0) {
            cartCountSpan.classList.add('hidden');
        } else {
            cartCountSpan.classList.remove('hidden');
        }
    }
}

// Función para añadir un producto al carrito
function addProductToCart(productId, productName, productPrice) {
    const product = products.find(p => p.id === productId);
    if (!product || product.stock <= 0) {
        // Optionally, show a message to the user that the product is out of stock
        console.warn(`Producto ${productName} está agotado.`);
        return;
    }

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity++;
        } else {
            console.warn(`No se puede añadir más de ${productName}. Stock máximo alcanzado.`);
            return;
        }
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            quantity: 1
        });
    }
    saveCart();
    updateCartDisplay();
}

// Función para actualizar la cantidad de un producto en el carrito
function updateProductQuantity(productId, action) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    const product = products.find(p => p.id === productId);

    if (itemIndex > -1 && product) {
        if (action === 'increase') {
            if (cart[itemIndex].quantity < product.stock) {
                cart[itemIndex].quantity++;
            } else {
                console.warn(`No se puede aumentar la cantidad de ${product.name}. Stock máximo alcanzado.`);
                return;
            }
        } else if (action === 'decrease') {
            cart[itemIndex].quantity--;
            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1); // Eliminar si la cantidad llega a 0
            }
        }
        saveCart();
        updateCartDisplay();
    }
}

// Función para eliminar un producto del carrito
function removeProductFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartDisplay();
}

// Función para generar el comprobante de pago (HTML y PDF)
function generateReceipt(customerData) {
    const receiptDetailsDiv = document.getElementById('receipt-details');
    const downloadPdfBtn = document.getElementById('download-pdf-btn');

    if (!receiptDetailsDiv || !downloadPdfBtn) {
        console.error("Elementos del comprobante no encontrados.");
        return;
    }

    if (cart.length === 0) {
        receiptDetailsDiv.innerHTML = '<p class="text-center text-red-500">No hay productos en el carrito para generar un comprobante.</p>';
        return;
    }

    // Deducir stock de productos
    cart.forEach(cartItem => {
        const productIndex = products.findIndex(p => p.id === cartItem.id);
        if (productIndex > -1) {
            products[productIndex].stock -= cartItem.quantity;
            // Asegurarse de que el stock no sea negativo
            if (products[productIndex].stock < 0) {
                products[productIndex].stock = 0;
            }
        }
    });
    saveProducts(); // Guardar los productos con el stock actualizado

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const igvAmount = subtotal * IGV_RATE;
    const total = subtotal + igvAmount;
    const currentDate = new Date().toLocaleDateString('es-ES');
    const currentTime = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    let receiptHtml = `
        <div class="text-center mb-6">
            <h3 class="text-2xl font-bold text-gray-800">Ferretería XYZ</h3>
            <p class="text-gray-600">Calle Principal 123, Ciudad, País</p>
            <p class="text-gray-600">Teléfono: +123 456 7890 | Email: info@ferreteriaxyz.com</p>
            <p class="text-gray-600 mt-2"><strong>RUC:</strong> 20123456789</p>
        </div>
        <div class="mb-6 border-t border-b py-3 border-gray-300">
            <p class="text-lg font-semibold text-gray-800">Comprobante de Venta</p>
            <p><strong>Fecha:</strong> ${currentDate}</p>
            <p><strong>Hora:</strong> ${currentTime}</p>
        </div>
        <div class="mb-6">
            <h4 class="text-lg font-semibold text-gray-800 mb-2">Datos del Cliente:</h4>
            <p><strong>Nombre:</strong> ${customerData.name}</p>
            <p><strong>DNI/RUC:</strong> ${customerData.dni}</p>
            <p><strong>Dirección:</strong> ${customerData.address}</p>
            <p><strong>Email:</strong> ${customerData.email}</p>
        </div>
        <div class="mb-6">
            <h4 class="text-lg font-semibold text-gray-800 mb-2">Detalle de Productos:</h4>
            <table class="w-full text-left table-auto border-collapse">
                <thead>
                    <tr class="bg-gray-200">
                        <th class="py-2 px-4 border-b border-gray-300">Producto</th>
                        <th class="py-2 px-4 border-b border-gray-300 text-center">Cant.</th>
                        <th class="py-2 px-4 border-b border-gray-300 text-right">P. Unit.</th>
                        <th class="py-2 px-4 border-b border-gray-300 text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${cart.map(item => `
                        <tr>
                            <td class="py-2 px-4 border-b border-gray-200">${item.name}</td>
                            <td class="py-2 px-4 border-b border-gray-200 text-center">${item.quantity}</td>
                            <td class="py-2 px-4 border-b border-gray-200 text-right">$${item.price.toFixed(2)}</td>
                            <td class="py-2 px-4 border-b border-gray-200 text-right">$${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <div class="text-right text-lg font-semibold">
            <p>Subtotal: $${subtotal.toFixed(2)}</p>
            <p>IGV (18%): $${igvAmount.toFixed(2)}</p>
            <p class="text-2xl font-bold mt-2">Total: $${total.toFixed(2)}</p>
        </div>
        <div class="text-center mt-8 text-gray-600 text-xs">
            <p>¡Gracias por tu compra!</p>
        </div>
    `;
    receiptDetailsDiv.innerHTML = receiptHtml;

    // Generar PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 150] // Tamaño de comprobante de pago típico (ancho x alto en mm)
    });

    // Añadir contenido al PDF
    doc.setFont('helvetica'); // Usar una fuente estándar
    doc.setFontSize(10);

    let y = 10; // Posición inicial en Y

    // Título y datos de la ferretería
    doc.setFontSize(12);
    doc.text("Ferretería XYZ", 40, y, { align: 'center' });
    y += 5;
    doc.setFontSize(8);
    doc.text("Calle Principal 123, Ciudad, País", 40, y, { align: 'center' });
    y += 4;
    doc.text("Teléfono: +123 456 7890 | Email: info@ferreteriaxyz.com", 40, y, { align: 'center' });
    y += 4;
    doc.text("RUC: 20123456789", 40, y, { align: 'center' });
    y += 8;

    // Comprobante de Venta
    doc.setFontSize(10);
    doc.text("COMPROBANTE DE VENTA", 40, y, { align: 'center' });
    y += 5;
    doc.text(`Fecha: ${currentDate}`, 10, y);
    doc.text(`Hora: ${currentTime}`, 50, y);
    y += 8;

    // Datos del Cliente
    doc.setFontSize(9);
    doc.text("Datos del Cliente:", 10, y);
    y += 4;
    doc.text(`Nombre: ${customerData.name}`, 10, y);
    y += 4;
    doc.text(`DNI/RUC: ${customerData.dni}`, 10, y);
    y += 4;
    doc.text(`Dirección: ${customerData.address}`, 10, y);
    y += 4;
    doc.text(`Email: ${customerData.email}`, 10, y);
    y += 8;

    // Detalle de Productos (Encabezados de tabla)
    doc.setFontSize(9);
    doc.setFillColor(230, 230, 230); // Color de fondo para encabezados
    doc.rect(5, y, 70, 6, 'F'); // Rectángulo de fondo para encabezados
    doc.setDrawColor(150, 150, 150); // Color de línea para bordes de tabla
    doc.setLineWidth(0.2); // Grosor de línea
    doc.rect(5, y, 70, 6); // Borde alrededor del encabezado
    doc.text("Producto", 7, y + 4);
    doc.text("Cant.", 40, y + 4, { align: 'center' });
    doc.text("P. Unit.", 55, y + 4, { align: 'right' });
    doc.text("Total", 72, y + 4, { align: 'right' });
    y += 6;
    doc.line(5, y, 75, y); // Línea horizontal debajo del encabezado

    // Detalle de Productos (Filas de tabla)
    doc.setFontSize(8);
    cart.forEach(item => {
        doc.text(item.name, 7, y + 4);
        doc.text(item.quantity.toString(), 40, y + 4, { align: 'center' });
        doc.text(`$${item.price.toFixed(2)}`, 55, y + 4, { align: 'right' });
        doc.text(`$${(item.price * item.quantity).toFixed(2)}`, 72, y + 4, { align: 'right' });
        y += 6;
        doc.line(5, y, 75, y); // Línea horizontal después de cada fila
    });
    y += 2; // Espacio después de la tabla

    // Totales
    doc.setFontSize(9);
    doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 72, y, { align: 'right' });
    y += 5;
    doc.text(`IGV (18%): $${igvAmount.toFixed(2)}`, 72, y, { align: 'right' });
    y += 6;
    doc.setFontSize(12);
    doc.text(`TOTAL: $${total.toFixed(2)}`, 72, y, { align: 'right' });
    y += 10;

    // Mensaje de agradecimiento
    doc.setFontSize(8);
    doc.text("¡Gracias por tu compra!", 40, y, { align: 'center' });

    // Asignar la función de descarga al botón
    downloadPdfBtn.onclick = () => doc.save('comprobante_ferreteria.pdf');

    // Limpiar el carrito después de generar el comprobante
    cart = [];
    saveCart();
    updateCartDisplay();
    renderProducts(); // Actualizar la vista de productos en index.html para reflejar el nuevo stock
    renderProductsDevMode(); // Actualizar la vista de productos en modo desarrollador
}

// --- Developer Mode Functions ---

// Function to render categories in the developer mode modal and product dropdown
function renderCategories() {
    const categoryListUl = document.getElementById('category-list');
    const productCategorySelect = document.getElementById('product-category');

    if (categoryListUl) categoryListUl.innerHTML = '';
    if (productCategorySelect) productCategorySelect.innerHTML = '<option value="">Selecciona una categoría</option>'; // Clear and add default

    categories.forEach(cat => {
        if (categoryListUl) {
            const listItem = document.createElement('li');
            listItem.classList.add('flex', 'items-center', 'justify-between', 'py-1', 'border-b', 'border-gray-200');
            listItem.innerHTML = `
                <div class="flex items-center">
                    <img src="${cat.imageUrl}" onerror="this.onerror=null;this.src='https://placehold.co/100x100/e0e0e0/555555?text=Categoría';" alt="${cat.name}" class="w-8 h-8 rounded-full mr-2 object-cover">
                    <span class="font-medium">${cat.name}</span>
                </div>
                <div class="flex space-x-2">
                    <button class="edit-image-btn bg-indigo-500 text-white px-3 py-1 rounded-md hover:bg-indigo-600 transition duration-300 text-sm" data-item-id="${cat.id}" data-item-type="category" data-item-name="${cat.name}">Editar Imagen</button>
                    <button class="delete-category-btn bg-red-400 text-white px-3 py-1 rounded-md hover:bg-red-500 transition duration-300 text-sm" data-category-id="${cat.id}">Eliminar</button>
                </div>
            `;
            categoryListUl.appendChild(listItem);
        }
        if (productCategorySelect) {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            productCategorySelect.appendChild(option);
        }
    });

    // Attach delete category event listeners (delegated)
    if (categoryListUl) {
        categoryListUl.querySelectorAll('.delete-category-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const categoryIdToDelete = event.target.dataset.categoryId;
                deleteCategory(categoryIdToDelete);
            });
        });
        // Attach edit image event listeners for categories (delegated)
        categoryListUl.querySelectorAll('.edit-image-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const itemId = event.target.dataset.itemId;
                const itemType = event.target.dataset.itemType;
                const itemName = event.target.dataset.itemName;
                editImage(itemId, itemType, itemName);
            });
        });
    }
}

// Function to add a new category
function addCategory(name, imageFile) {
    if (!name) return;

    const createCategory = (imageUrl) => {
        const newCategory = {
            id: 'cat-' + Date.now(), // Simple unique ID
            name: name,
            imageUrl: imageUrl
        };
        categories.push(newCategory);
        saveCategories();
        renderCategories();
        renderCategoryFilters(); // Update category filter on index.html
        // Clear form fields
        document.getElementById('category-name').value = '';
        document.getElementById('category-image-file').value = ''; // Clear file input
    };

    if (imageFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
            createCategory(reader.result); // Pass base64 string
        };
        reader.readAsDataURL(imageFile);
    } else {
        createCategory('https://placehold.co/100x100/e0e0e0/555555?text=Categoría'); // Placeholder if no file
    }
}

// Function to delete a category
function deleteCategory(categoryId) {
    categories = categories.filter(cat => cat.id !== categoryId);
    // Also remove products associated with this category
    products = products.filter(prod => prod.categoryId !== categoryId);
    saveCategories();
    saveProducts();
    renderCategories();
    renderCategoryFilters(); // Update category filter on index.html
    renderProducts(); // Re-render products as some might have been removed
    renderProductsDevMode(); // Update dev mode product list
}

// Function to render products in the main inventory grid (index.html)
function renderProducts(searchTerm = '', categoryFilter = '') {
    const productGrid = document.getElementById('product-grid');
    if (!productGrid) return; // Only run if on index.html

    productGrid.innerHTML = ''; // Clear existing products

    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                              product.description.toLowerCase().includes(lowerCaseSearchTerm);
        const matchesCategory = categoryFilter === '' || product.categoryId === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    if (filteredProducts.length === 0) {
        productGrid.innerHTML = '<p class="text-center text-gray-600 col-span-full">No se encontraron productos que coincidan con la búsqueda.</p>';
        return;
    }

    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('bg-gray-100', 'p-4', 'rounded-lg', 'shadow-sm');
        productCard.innerHTML = `
            <img src="${product.imageUrl}" onerror="this.onerror=null;this.src='https://placehold.co/300x200/e0e0e0/555555?text=Producto';" alt="${product.name}" class="w-full h-40 object-cover rounded-md mb-3">
            <h3 class="text-xl font-semibold mb-2">${product.name}</h3>
            <p class="text-gray-600 text-sm mb-2">${product.description}</p>
            <p class="text-gray-600 text-xs mb-2">Categoría: ${categories.find(cat => cat.id === product.categoryId)?.name || 'Sin Categoría'}</p>
            <p class="text-gray-600 text-xs mb-2">Stock: ${product.stock}</p>
            <div class="flex justify-between items-center">
                <span class="text-blue-700 font-bold text-lg">$${product.price.toFixed(2)}</span>
                <button class="add-to-cart-btn bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
                    data-product-id="${product.id}" data-product-name="${product.name}" data-product-price="${product.price}">Añadir al Carrito</button>
            </div>
        `;
        productGrid.appendChild(productCard);
    });

    // Re-attach event listeners for "Add to Cart" buttons
    // This is handled by event delegation on productGrid in the DOMContentLoaded listener
}

// Function to render categories in the category filter dropdown on index.html
function renderCategoryFilters() {
    const categoryFilterSelect = document.getElementById('category-filter');
    if (!categoryFilterSelect) return;

    // Clear existing options, but keep the "Todas las categorías" option
    categoryFilterSelect.innerHTML = '<option value="">Todas las categorías</option>';

    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        categoryFilterSelect.appendChild(option);
    });
}


// Function to render products in the developer mode product list and dropdown
function renderProductsDevMode(filter = '', selectedProductId = '') {
    const productListDevUl = document.getElementById('product-list-dev');
    const developerProductDropdown = document.getElementById('developer-product-dropdown');

    if (!productListDevUl || !developerProductDropdown) return; // Only run if on developer.html

    productListDevUl.innerHTML = '';
    developerProductDropdown.innerHTML = '<option value="">-- Selecciona un producto para editar --</option>';

    const lowerCaseFilter = filter.toLowerCase();

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(lowerCaseFilter) ||
        product.description.toLowerCase().includes(lowerCaseFilter)
    );

    // Populate dropdown
    filteredProducts.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} (Stock: ${product.stock})`;
        developerProductDropdown.appendChild(option);
    });

    // Set selected value in dropdown if provided
    if (selectedProductId) {
        developerProductDropdown.value = selectedProductId;
    }

    // Render list based on filter or selected product
    let productsToDisplay = filteredProducts;
    if (selectedProductId && selectedProductId !== "") {
        productsToDisplay = filteredProducts.filter(p => p.id === selectedProductId);
    }

    if (productsToDisplay.length === 0 && (filter || selectedProductId)) {
        productListDevUl.innerHTML = '<li class="text-gray-600 text-center col-span-full">No se encontraron productos que coincidan con la búsqueda/selección.</li>';
    } else if (productsToDisplay.length === 0) {
        productListDevUl.innerHTML = '<li class="text-gray-600 text-center col-span-full">No hay productos para mostrar.</li>';
    }


    productsToDisplay.forEach(product => {
        const listItem = document.createElement('li');
        listItem.classList.add('flex', 'items-center', 'justify-between', 'py-1', 'border-b', 'border-gray-200');
        const categoryName = categories.find(cat => cat.id === product.categoryId)?.name || 'Sin Categoría';
        listItem.innerHTML = `
            <div class="flex items-center space-x-2">
                <img src="${product.imageUrl}" onerror="this.onerror=null;this.src='https://placehold.co/100x100/e0e0e0/555555?text=Producto';" alt="${product.name}" class="w-8 h-8 rounded-full mr-2 object-cover">
                <span class="font-medium">${product.name}</span>
                <span class="text-gray-500 text-xs">(${categoryName})</span>
                <span class="text-gray-700 text-sm font-bold">Stock: ${product.stock}</span>
            </div>
            <div class="flex space-x-2">
                <button class="edit-image-btn bg-indigo-500 text-white px-3 py-1 rounded-md hover:bg-indigo-600 transition duration-300 text-sm" data-item-id="${product.id}" data-item-type="product" data-item-name="${product.name}">Editar Imagen</button>
                <button class="edit-stock-btn bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition duration-300 text-sm" data-product-id="${product.id}">Editar Stock</button>
                <button class="delete-product-btn bg-red-400 text-white px-3 py-1 rounded-md hover:bg-red-500 transition duration-300 text-sm" data-product-id="${product.id}">Eliminar</button>
            </div>
        `;
        productListDevUl.appendChild(listItem);
    });

    // Attach delete product event listeners
    productListDevUl.querySelectorAll('.delete-product-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const productIdToDelete = event.target.dataset.productId;
            deleteProduct(productIdToDelete);
        });
    });

    // Attach edit stock event listeners
    productListDevUl.querySelectorAll('.edit-stock-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const productIdToEdit = event.target.dataset.productId;
            const productToEdit = products.find(p => p.id === productIdToEdit);
            if (productToEdit) {
                // Muestra el modal de edición de stock
                const editStockModal = document.getElementById('edit-stock-modal');
                const editStockInput = document.getElementById('edit-stock-input');
                const editStockProductId = document.getElementById('edit-stock-product-id');
                const editStockProductName = document.getElementById('edit-stock-product-name');
                const editStockMessage = document.getElementById('edit-stock-message');

                editStockInput.value = productToEdit.stock;
                editStockProductId.value = productToEdit.id;
                editStockProductName.textContent = productToEdit.name; // Actualiza el nombre del producto en el modal
                editStockMessage.textContent = ''; // Limpia cualquier mensaje anterior
                editStockModal.style.display = 'flex'; // Muestra el modal
            }
        });
    });

    // Attach edit image event listeners for products (delegated)
    productListDevUl.querySelectorAll('.edit-image-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const itemId = event.target.dataset.itemId;
            const itemType = event.target.dataset.itemType;
            const itemName = event.target.dataset.itemName;
            editImage(itemId, itemType, itemName);
        });
    });
}

// Function to add a new product
function addProduct(name, description, price, imageFile, categoryId, stock) {
    // Validate inputs
    if (!name || !price || !categoryId || stock === undefined || isNaN(stock) || stock < 0) {
        const loginMessage = document.getElementById('login-message'); // Reusing login-message for simplicity
        if (loginMessage) {
            loginMessage.textContent = 'Error: Datos de producto incompletos o inválidos (nombre, precio, categoría, stock son obligatorios y stock debe ser >= 0).';
            loginMessage.style.color = 'red';
            setTimeout(() => { loginMessage.textContent = ''; }, 5000);
        }
        console.error("Datos de producto incompletos o inválidos.");
        return;
    }

    const createProduct = (imageUrl) => {
        const newProduct = {
            id: 'prod-' + Date.now(), // Simple unique ID
            name: name,
            description: description,
            price: parseFloat(price),
            imageUrl: imageUrl,
            categoryId: categoryId,
            stock: parseInt(stock)
        };
        products.push(newProduct);
        saveProducts();
        renderProductsDevMode(); // Update list in dev mode
        renderProducts(); // Update inventory in index.html
        // Clear form fields
        document.getElementById('product-name').value = '';
        document.getElementById('product-description').value = '';
        document.getElementById('product-price').value = '';
        document.getElementById('product-image-file').value = ''; // Clear file input
        document.getElementById('product-category').value = '';
        document.getElementById('product-stock').value = ''; // Clear stock input
    };

    if (imageFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
            createProduct(reader.result); // Pass base64 string
        };
        reader.readAsDataURL(imageFile);
    } else {
        createProduct('https://placehold.co/300x200/e0e0e0/555555?text=Producto'); // Placeholder if no file
    }
}

// Function to delete a product
function deleteProduct(productId) {
    products = products.filter(prod => prod.id !== productId);
    saveProducts();
    renderProductsDevMode(); // Update list in dev mode
    renderProducts(); // Update inventory in index.html
}

// Function to edit product stock
function editProductStock(productId, newStock) {
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex > -1) {
        products[productIndex].stock = newStock;
        saveProducts();
        renderProductsDevMode(); // Update list in dev mode
        renderProducts(); // Update inventory in index.html
    } else {
        console.error(`Producto con ID ${productId} no encontrado para editar stock.`);
    }
}

// Function to open the image edit modal
function editImage(itemId, itemType, itemName) {
    const editImageModal = document.getElementById('edit-image-modal');
    const editImageItemTypeSpan = document.getElementById('edit-image-item-type');
    const editImageItemNameSpan = document.getElementById('edit-image-item-name');
    const editImageItemIdInput = document.getElementById('edit-image-item-id');
    const editImageItemCategoryTypeInput = document.getElementById('edit-image-item-category-type');
    const editImageMessage = document.getElementById('edit-image-message');
    const editImageFileInput = document.getElementById('edit-image-file-input');

    editImageItemTypeSpan.textContent = itemType === 'category' ? 'Categoría' : 'Producto';
    editImageItemNameSpan.textContent = itemName;
    editImageItemIdInput.value = itemId;
    editImageItemCategoryTypeInput.value = itemType;
    editImageMessage.textContent = ''; // Clear previous messages
    editImageFileInput.value = ''; // Clear file input

    editImageModal.style.display = 'flex';
}

// Function to save the edited image
function saveImageEdit() {
    const itemId = document.getElementById('edit-image-item-id').value;
    const itemType = document.getElementById('edit-image-item-category-type').value;
    const imageFile = document.getElementById('edit-image-file-input').files[0];
    const editImageMessage = document.getElementById('edit-image-message');

    if (!imageFile) {
        editImageMessage.textContent = 'Por favor, selecciona una imagen.';
        editImageMessage.style.color = 'red';
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
        const newImageUrl = reader.result;
        if (itemType === 'category') {
            const categoryIndex = categories.findIndex(cat => cat.id === itemId);
            if (categoryIndex > -1) {
                categories[categoryIndex].imageUrl = newImageUrl;
                saveCategories();
                renderCategories();
                renderCategoryFilters(); // Update category filter on index.html
                editImageMessage.textContent = 'Imagen de categoría actualizada exitosamente.';
                editImageMessage.style.color = 'green';
            } else {
                editImageMessage.textContent = 'Error: Categoría no encontrada.';
                editImageMessage.style.color = 'red';
            }
        } else if (itemType === 'product') {
            const productIndex = products.findIndex(prod => prod.id === itemId);
            if (productIndex > -1) {
                products[productIndex].imageUrl = newImageUrl;
                saveProducts();
                renderProductsDevMode();
                renderProducts(); // Update product display on index.html
                editImageMessage.textContent = 'Imagen de producto actualizada exitosamente.';
                editImageMessage.style.color = 'green';
            } else {
                editImageMessage.textContent = 'Error: Producto no encontrado.';
                editImageMessage.style.color = 'red';
            }
        }
        setTimeout(() => {
            document.getElementById('edit-image-modal').style.display = 'none';
            editImageMessage.textContent = '';
        }, 1500); // Hide modal after a short delay
    };
    reader.onerror = () => {
        editImageMessage.textContent = 'Error al leer el archivo de imagen.';
        editImageMessage.style.color = 'red';
    };
    reader.readAsDataURL(imageFile);
}


// --- Backup and Restore Functions ---

function backupData() {
    const dataToBackup = {
        categories: categories,
        products: products
    };
    const jsonString = JSON.stringify(dataToBackup, null, 2); // Pretty print JSON
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ferreteria_data_backup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function restoreData(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const loadedData = JSON.parse(event.target.result);
            if (loadedData.categories && Array.isArray(loadedData.categories) &&
                loadedData.products && Array.isArray(loadedData.products)) {
                categories = loadedData.categories;
                products = loadedData.products;
                saveCategories();
                saveProducts();
                initializeData(); // Re-initialize to update all displays
                document.getElementById('restore-message').textContent = 'Datos cargados exitosamente.';
                document.getElementById('restore-message').classList.remove('text-red-500');
                document.getElementById('restore-message').classList.add('text-green-500');
            } else {
                throw new Error("Formato de archivo JSON inválido. Debe contener 'categories' y 'products'.");
            }
        } catch (e) {
            console.error("Error al cargar o parsear el archivo de respaldo:", e);
            document.getElementById('restore-message').textContent = `Error al cargar el respaldo: ${e.message}`;
            document.getElementById('restore-message').classList.remove('text-green-500');
            document.getElementById('restore-message').classList.add('text-red-500');
        }
    };
    reader.onerror = () => {
        document.getElementById('restore-message').textContent = 'Error al leer el archivo.';
        document.getElementById('restore-message').classList.remove('text-green-500');
        document.getElementById('restore-message').classList.add('text-red-500');
    };
    reader.readAsText(file);
}

// Function to handle administrator logout
function logout() {
    localStorage.removeItem('isAdminAuthenticated'); // Clear authentication status
    window.location.href = 'index.html'; // Redirect to index.html
}


// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    initializeData(); // Cargar datos al iniciar la página

    // Event listeners para index.html (si existen los elementos)
    const cartButton = document.getElementById('cart-button');
    const closeCartModalButton = document.getElementById('close-cart-modal');
    const cartModal = document.getElementById('cart-modal');
    const proceedToCheckoutBtn = document.getElementById('proceed-to-checkout-btn');
    const personalDataModal = document.getElementById('personal-data-modal');
    const closePersonalDataModalButton = document.getElementById('close-personal-data-modal');
    const personalDataForm = document.getElementById('personal-data-form');
    const receiptModal = document.getElementById('receipt-modal');
    const closeReceiptModalButton = document.getElementById('close-receipt-modal');
    const productSearchInput = document.getElementById('product-search');
    const categoryFilterSelect = document.getElementById('category-filter'); // New category filter select
    const cartItemsList = document.getElementById('cart-items'); // Necesario para mensajes de carrito vacío

    if (cartButton) {
        cartButton.addEventListener('click', () => {
            if (cartModal) cartModal.style.display = 'flex';
            updateCartDisplay();
        });
    }
    if (closeCartModalButton) {
        closeCartModalButton.addEventListener('click', () => {
            if (cartModal) cartModal.style.display = 'none';
        });
    }
    if (proceedToCheckoutBtn) {
        proceedToCheckoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                if (cartItemsList) cartItemsList.innerHTML = '<li class="text-red-500 text-center font-bold">¡El carrito está vacío! Añade productos antes de proceder.</li>';
                return;
            }
            if (cartModal) cartModal.style.display = 'none';
            if (personalDataModal) personalDataModal.style.display = 'flex';
        });
    }
    if (closePersonalDataModalButton) {
        closePersonalDataModalButton.addEventListener('click', () => {
            if (personalDataModal) personalDataModal.style.display = 'none';
        });
    }
    if (personalDataForm) {
        personalDataForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const customerData = {
                name: document.getElementById('customer-name').value,
                dni: document.getElementById('customer-dni').value,
                address: document.getElementById('customer-address').value,
                email: document.getElementById('customer-email').value
            };
            if (personalDataModal) personalDataModal.style.display = 'none';
            generateReceipt(customerData);
            if (receiptModal) receiptModal.style.display = 'flex';
        });
    }
    if (closeReceiptModalButton) {
        closeReceiptModalButton.addEventListener('click', () => {
            if (receiptModal) receiptModal.style.display = 'none';
        });
    }

    // Event listeners for product search and category filter on index.html
    if (productSearchInput) {
        productSearchInput.addEventListener('input', () => {
            const searchTerm = productSearchInput.value;
            const categoryFilter = categoryFilterSelect ? categoryFilterSelect.value : '';
            renderProducts(searchTerm, categoryFilter);
        });
    }
    if (categoryFilterSelect) {
        categoryFilterSelect.addEventListener('change', () => {
            const searchTerm = productSearchInput ? productSearchInput.value : '';
            const categoryFilter = categoryFilterSelect.value;
            renderProducts(searchTerm, categoryFilter);
        });
    }

    // Delegación de eventos para botones "Añadir al Carrito" (ya que los productos se renderizan dinámicamente)
    const productGrid = document.getElementById('product-grid');
    if (productGrid) {
        productGrid.addEventListener('click', (event) => {
            if (event.target.classList.contains('add-to-cart-btn')) {
                const productId = event.target.dataset.productId;
                const productName = event.target.dataset.productName;
                const productPrice = parseFloat(event.target.dataset.productPrice);
                addProductToCart(productId, productName, productPrice);
            }
        });
    }
    // Delegación de eventos para botones de carrito dentro del modal
    if (cartItemsList) {
        cartItemsList.addEventListener('click', (event) => {
            if (event.target.classList.contains('update-quantity-btn')) {
                const productId = event.target.dataset.productId;
                const action = event.target.dataset.action;
                updateProductQuantity(productId, action);
            } else if (event.target.classList.contains('remove-from-cart-btn')) {
                const productId = event.target.dataset.productId;
                removeProductFromCart(productId);
            }
        });
    }

    // Cerrar cualquier modal si se hace clic fuera del contenido
    window.addEventListener('click', (event) => {
        if (cartModal && event.target === cartModal) {
            cartModal.style.display = 'none';
        }
        if (personalDataModal && event.target === personalDataModal) {
            personalDataModal.style.display = 'none';
        }
        if (receiptModal && event.target === receiptModal) {
            receiptModal.style.display = 'none';
        }
        // Close edit stock modal if it exists and click is outside
        const editStockModal = document.getElementById('edit-stock-modal');
        if (editStockModal && event.target === editStockModal) {
            editStockModal.style.display = 'none';
            document.getElementById('edit-stock-message').textContent = ''; // Clear message on close
        }
        // Close edit image modal if it exists and click is outside
        const editImageModal = document.getElementById('edit-image-modal');
        if (editImageModal && event.target === editImageModal) {
            editImageModal.style.display = 'none';
            document.getElementById('edit-image-message').textContent = ''; // Clear message on close
        }
    });


    // Event listeners para developer.html (si existen los elementos)
    const developerModeContent = document.getElementById('developer-mode-content');
    const adminLoginModal = document.getElementById('admin-login-modal');
    const adminLoginForm = document.getElementById('admin-login-form');
    const adminUsernameInput = document.getElementById('admin-username');
    const adminPasswordInput = document.getElementById('admin-password');
    const loginMessage = document.getElementById('login-message');
    const logoutBtn = document.getElementById('logout-btn'); // New logout button

    // Product management elements
    const addCategoryBtn = document.getElementById('add-category-btn');
    const categoryNameInput = document.getElementById('category-name');
    const categoryImageFileInput = document.getElementById('category-image-file');

    const addProductBtn = document.getElementById('add-product-btn');
    const productNameInput = document.getElementById('product-name');
    const productDescriptionInput = document.getElementById('product-description');
    const productPriceInput = document.getElementById('product-price');
    const productImageFileInput = document.getElementById('product-image-file');
    const productCategorySelect = document.getElementById('product-category');
    const productStockInput = document.getElementById('product-stock');

    const developerProductSearchInput = document.getElementById('developer-product-search');
    const developerProductDropdown = document.getElementById('developer-product-dropdown');

    // Edit Stock Modal elements
    const editStockModal = document.getElementById('edit-stock-modal');
    const closeEditStockModalBtn = document.getElementById('close-edit-stock-modal');
    const editStockForm = document.getElementById('edit-stock-form');
    const editStockProductId = document.getElementById('edit-stock-product-id'); // Hidden input for product ID
    const editStockProductName = document.getElementById('edit-stock-product-name'); // Span to show product name
    const editStockInput = document.getElementById('edit-stock-input');
    const saveStockBtn = document.getElementById('save-stock-btn');
    const cancelStockEditBtn = document.getElementById('cancel-stock-edit-btn');
    const editStockMessage = document.getElementById('edit-stock-message'); // For validation messages in stock modal

    // Edit Image Modal elements
    const editImageModal = document.getElementById('edit-image-modal');
    const closeEditImageModalBtn = document.getElementById('close-edit-image-modal');
    const cancelImageEditBtn = document.getElementById('cancel-image-edit-btn');
    const editImageForm = document.getElementById('edit-image-form');


    if (adminLoginModal) {
        // If we are on developer.html, show the login modal by default
        if (localStorage.getItem('isAdminAuthenticated') !== 'true') {
            adminLoginModal.style.display = 'flex';
            developerModeContent.classList.add('hidden'); // Ensure content is hidden
        } else {
            adminLoginModal.style.display = 'none';
            developerModeContent.classList.remove('hidden'); // Show content if already authenticated
            renderCategories();
            renderProductsDevMode();
        }

        adminLoginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const username = adminUsernameInput.value;
            const password = adminPasswordInput.value;

            if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
                localStorage.setItem('isAdminAuthenticated', 'true'); // Save authentication status
                adminLoginModal.style.display = 'none';
                developerModeContent.classList.remove('hidden'); // Show developer mode content
                renderCategories(); // Render categories and products after login
                renderProductsDevMode();
                loginMessage.textContent = ''; // Clear error message
            } else {
                loginMessage.textContent = 'Usuario o contraseña incorrectos.';
                loginMessage.style.color = 'red';
            }
        });
    }

    // Logout button event listener
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', () => {
            addCategory(categoryNameInput.value, categoryImageFileInput.files[0]);
        });
    }
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            addProduct(
                productNameInput.value,
                productDescriptionInput.value,
                productPriceInput.value,
                productImageFileInput.files[0],
                productCategorySelect.value,
                productStockInput.value
            );
        });
    }

    // Event listeners for product search and dropdown in developer mode
    if (developerProductSearchInput) {
        developerProductSearchInput.addEventListener('input', (event) => {
            renderProductsDevMode(event.target.value);
            developerProductDropdown.value = ""; // Reset dropdown when searching
        });
    }
    if (developerProductDropdown) {
        developerProductDropdown.addEventListener('change', (event) => {
            renderProductsDevMode('', event.target.value); // Filter by selected product ID
            developerProductSearchInput.value = ""; // Clear search when selecting from dropdown
        });
    }

    // Event listeners for the new Edit Stock Modal
    if (closeEditStockModalBtn) {
        closeEditStockModalBtn.addEventListener('click', () => {
            editStockModal.style.display = 'none';
            editStockMessage.textContent = ''; // Clear message on close
        });
    }

    if (cancelStockEditBtn) {
        cancelStockEditBtn.addEventListener('click', () => {
            editStockModal.style.display = 'none';
            editStockMessage.textContent = ''; // Clear message on cancel
        });
    }

    if (editStockForm) {
        editStockForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const productId = editStockProductId.value;
            const newStock = parseInt(editStockInput.value);

            if (!isNaN(newStock) && newStock >= 0) {
                editProductStock(productId, newStock);
                editStockModal.style.display = 'none'; // Hide modal on successful save
                editStockMessage.textContent = ''; // Clear message
            } else {
                editStockMessage.textContent = 'El stock debe ser un número válido y no negativo.';
                editStockMessage.style.color = 'red';
            }
        });
    }

    // Event listeners for the new Edit Image Modal
    if (closeEditImageModalBtn) {
        closeEditImageModalBtn.addEventListener('click', () => {
            editImageModal.style.display = 'none';
            document.getElementById('edit-image-message').textContent = ''; // Clear message on close
        });
    }

    if (cancelImageEditBtn) {
        cancelImageEditBtn.addEventListener('click', () => {
            editImageModal.style.display = 'none';
            document.getElementById('edit-image-message').textContent = ''; // Clear message on cancel
        });
    }

    if (editImageForm) {
        editImageForm.addEventListener('submit', (event) => {
            event.preventDefault();
            saveImageEdit();
        });
    }

    const backupDataBtn = document.getElementById('backup-data-btn');
    const restoreFileInput = document.getElementById('restore-file-input');

    if (backupDataBtn) {
        backupDataBtn.addEventListener('click', backupData);
    }
    if (restoreFileInput) {
        restoreFileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                restoreData(file);
            }
        });
    }
});
