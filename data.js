// data.js
// Este archivo contiene los datos iniciales de categorías y productos
// que se cargarán si no hay datos guardados en localStorage.

export const initialCategories = [
    { id: 'cat-1', name: 'Herramientas Manuales', imageUrl: 'https://placehold.co/100x100/e0e0e0/555555?text=Manual' },
    { id: 'cat-2', name: 'Fijaciones', imageUrl: 'https://placehold.co/100x100/e0e0e0/555555?text=Fijaciones' },
    { id: 'cat-3', name: 'Medición', imageUrl: 'https://placehold.co/100x100/e0e0e0/555555?text=Medicion' }
];

export const initialProducts = [
    { id: 'prod-1', name: 'Martillo de Uña', description: 'Un martillo robusto para trabajos de carpintería y construcción.', price: 15.99, imageUrl: 'https://placehold.co/300x200/e0e0e0/555555?text=Martillo', categoryId: 'cat-1', stock: 50 },
    { id: 'prod-2', name: 'Set de Tornillos Variados', description: 'Caja con tornillos de diferentes tamaños y tipos.', price: 8.50, imageUrl: 'https://placehold.co/300x200/e0e0e0/555555?text=Tornillos', categoryId: 'cat-2', stock: 120 },
    { id: 'prod-3', name: 'Cinta Métrica 5m', description: 'Cinta métrica retráctil de alta precisión.', price: 7.25, imageUrl: 'https://placehold.co/300x200/e0e0e0/555555?text=Cinta+Métrica', categoryId: 'cat-3', stock: 75 },
    { id: 'prod-4', name: 'Taladro Inalámbrico', description: 'Ideal para perforar y atornillar en madera, metal y plástico.', price: 79.99, imageUrl: 'https://placehold.co/300x200/e0e0e0/555555?text=Taladro', categoryId: 'cat-1', stock: 30 },
    { id: 'prod-5', name: 'Llave Inglesa Ajustable', description: 'Una herramienta esencial para cualquier caja de herramientas.', price: 12.50, imageUrl: 'https://placehold.co/300x200/e0e0e0/555555?text=Llave+Inglesa', categoryId: 'cat-1', stock: 90 },
    { id: 'prod-6', name: 'Set de Destornilladores', description: 'Variedad de puntas para todo tipo de tornillos.', price: 25.00, imageUrl: 'https://placehold.co/300x200/e0e0e0/555555?text=Set+Destornilladores', categoryId: 'cat-1', stock: 60 }
];
