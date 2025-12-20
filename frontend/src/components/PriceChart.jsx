import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PriceChart({ history }) {
    if (!history || history.length === 0) return <p>No price history details available yet.</p>;

    const data = history.map(h => ({
        date: new Date(h.recorded_at).toLocaleDateString(),
        price: h.price
    }));

    // If only one data point, duplicate it to show a line
    if (data.length === 1) {
        data.push({ ...data[0], date: 'Now' });
    }

    return (
        <div style={{ width: '100%', height: 300, marginTop: '2rem' }}>
            <h3>Price History</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
