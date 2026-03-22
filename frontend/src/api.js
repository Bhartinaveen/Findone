import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
});

export const getApiUrl = () => API_URL;

export const getProducts = async () => {
    try {
        const response = await api.get('/products');
        return response.data;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
};

export const sendChat = async (query, mode = 'search', history = []) => {
    try {
        const response = await api.post('/chat', { query, mode, history });
        return response.data;
    } catch (error) {
        console.error('Chat error:', error);
        return { answer: 'Sorry, connection error.', products: [] };
    }
};

export const triggerScrape = async (query) => {
    try {
        const response = await api.post('/products/scrape', { query });
        return response.data;
    } catch (error) {
        console.error("Scrape error:", error);
        return null;
    }
};

export const getProductDetails = async (id) => {
    try {
        const response = await api.get(`/products/${id}`);
        return response.data;
    } catch (error) {
        console.error("Fetch details error:", error);
        return null;
    }
};

export const clearProducts = async () => {
    try {
        await api.delete('/products');
        return true;
    } catch (error) {
        console.error("Clear DB error:", error);
        return false;
    }
};
