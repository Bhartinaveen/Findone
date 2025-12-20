const products = [
    {
        title: "Men's Black Running Shoes",
        price: 45.99,
        description: "Lightweight, breathable running shoes perfect for marathon training and gym workouts.",
        category: "Footwear",
        image_url: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&q=80&w=600",
        features: { material: "Mesh", color: "Black", size: "US 10" }
    },
    {
        title: "Ergonomic Office Chair",
        price: 129.99,
        description: "Adjustable height and lumbar support for long hours of comfortable sitting.",
        category: "Furniture",
        image_url: "https://images.unsplash.com/photo-1596162955779-9c8f7b43f0a0?auto=format&fit=crop&q=80&w=600",
        features: { material: "Fabric", color: "Grey", load_capacity: "120kg" }
    },
    {
        title: "Bluetooth Noise Cancelling Headphones",
        price: 89.99,
        description: "Over-ear headphones with active noise cancellation and 30-hour battery life.",
        category: "Electronics",
        image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600",
        features: { brand: "SoundMax", connectivity: "Bluetooth 5.0" }
    },
    {
        title: "Yoga Mat Non-Slip",
        price: 25.00,
        description: "Eco-friendly TPE yoga mat with non-slip texture.",
        category: "Sports",
        image_url: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&q=80&w=600",
        features: { material: "TPE", thickness: "6mm" }
    },
    {
        title: "Women's Floral Summer Dress",
        price: 35.50,
        description: "Breezy cotton dress with floral print, ideal for casual outings.",
        category: "Clothing",
        image_url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=600",
        features: { material: "Cotton", size: "M" }
    }
];

// Fallback Function to return Mock Data
const getMockProducts = () => {
    console.log('Returning mock products due to scraping limitations or fallback request.');
    return products;
};

module.exports = { getMockProducts };
