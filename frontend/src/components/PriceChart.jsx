import React, { useState, useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

const PriceChart = ({ history, currentPrice }) => {
    const [timeRange, setTimeRange] = useState('1Y');

    const filteredData = useMemo(() => {
        if (!history || history.length === 0) return [];

        const workingSet = [...history].sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at));

        let filtered;
        const now = new Date();
        let cutoffDate = new Date(0);
        const tempDate = new Date();

        switch (timeRange) {
            case '1D':
                cutoffDate = new Date(now.getTime() - (24 * 60 * 60 * 1000));
                break;
            case '1Y':
                cutoffDate = new Date(tempDate.setFullYear(tempDate.getFullYear() - 1));
                break;
            default:
                break;
        }
        filtered = workingSet.filter(item => new Date(item.recorded_at) >= cutoffDate);

        const data = filtered.map((item, index) => {
            const d = new Date(item.recorded_at);
            const price = Number(item.price);
            let dateLabel = '';

            if (timeRange === '1D') {
                dateLabel = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
            } else {
                dateLabel = d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
            }

            let change = 0;
            if (index > 0) {
                const prevPrice = Number(filtered[index - 1].price);
                change = price - prevPrice;
            }

            return {
                price,
                change,
                date: dateLabel,
                fullDate: d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
                fullTime: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                timestamp: d.getTime()
            };
        });

        if (data.length === 1) {
            const point = data[0];
            const startD = new Date(point.timestamp - (24 * 60 * 60 * 1000));
            data.unshift({
                ...point,
                price: point.price,
                change: 0,
                date: startD.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                fullDate: startD.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
                fullTime: startD.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
                timestamp: startD.getTime()
            });
        }

        return data;
    }, [history, timeRange]);

    const prediction = useMemo(() => {
        if (!history || history.length === 0) return null;
        
        // 1. Current Price Analysis (Verdict)
        const prices = history.map(h => Number(h.price));
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const cPrice = Number(currentPrice);

        let verdict = { text: "Fair Price", color: "#94a3b8", badge: "STABLE" };
        if (cPrice <= minPrice) {
            verdict = { text: "Best Time to Buy! Price is at an all-time low.", color: "#4ade80", badge: "ALL-TIME LOW" };
        } else if (cPrice < avgPrice) {
            verdict = { text: "Good Deal! Price is lower than average.", color: "#4ade80", badge: "GOOD DEAL" };
        } else if (cPrice > avgPrice * 1.1) {
            verdict = { text: "Price is peaking. Consider waiting for a drop.", color: "#f43f5e", badge: "PRICE PEAK" };
        }

        // 2. Future Forecast Analysis (Trend) - Only if filtered data is present
        let forecast = { message: 'Price is expected to remain stable.', icon: '⚖️', color: '#fbbf24', confidence: 'Medium' };
        
        if (filteredData.length >= 2) {
            const currentPrices = filteredData.map(d => d.price);
            const currentAvg = currentPrices.reduce((a, b) => a + b, 0) / currentPrices.length;
            
            const earliestVisible = filteredData[0].timestamp;
            const periodDuration = filteredData[filteredData.length - 1].timestamp - earliestVisible;
            const prevPeriodStart = earliestVisible - periodDuration;
            
            const prevData = history.filter(item => {
                const t = new Date(item.recorded_at).getTime();
                return t >= prevPeriodStart && t < earliestVisible;
            });

            const prevAvg = prevData.length > 0 
                ? prevData.reduce((acc, curr) => acc + Number(curr.price), 0) / prevData.length
                : null;

            const recentPoints = filteredData.slice(-5);
            const latestPrice = recentPoints[recentPoints.length - 1].price;
            const firstPrice = recentPoints[0].price;
            const trendDelta = latestPrice - firstPrice;

            if (prevAvg) {
                const momDiff = ((currentAvg - prevAvg) / prevAvg) * 100;
                if (momDiff < -2) {
                    forecast = { message: `Month-on-Month Drop: Average is ${Math.abs(Math.round(momDiff))}% lower than last month.`, icon: '📉', color: '#4ade80', confidence: 'High' };
                } else if (momDiff > 2) {
                    forecast = { message: `Month-on-Month Rise: Price has risen by ${Math.round(momDiff)}% recently.`, icon: '📈', color: '#f43f5e', confidence: 'High' };
                }
            } else if (trendDelta < -10) {
                forecast = { message: 'Downward momentum detected. Further drops possible.', icon: '📉', color: '#4ade80', confidence: 'High' };
            }
        }

        // 3. Seasonal Analysis (Full Ranking)
        let monthlyRanking = [];
        let seasonalTip = null;
        
        if (history.length >= 2) {
            const monthlyGroups = {};
            history.forEach(h => {
                const date = new Date(h.recorded_at);
                const month = date.getMonth();
                if (!monthlyGroups[month]) monthlyGroups[month] = [];
                monthlyGroups[month].push(Number(h.price));
            });

            const eventMap = {
                0: { event: "New Year & Republic Day Sale", reason: "Significant post-holiday price drops and national sales." },
                1: { event: "Post-Republic Clearance", reason: "Continued liquidation of electronics and winter stock." },
                2: { event: "Financial Year End Sale", reason: "Inventory clearance before new stock arrival." },
                3: { event: "Pre-Summer Promo", reason: "Early bird offers for seasonal electronics." },
                4: { event: "Amazon Summer Sale", reason: "Major mid-year shopping event on major platforms." },
                5: { event: "Mid-Year EOSS", reason: "End of season sale for fashion and lifestyle." },
                6: { event: "Prime Day Sales", reason: "Exclusive deep discounts during Amazon's flagship event." },
                7: { event: "Independence Day Sale", reason: "Major national sales and cashback offers." },
                8: { event: "Pre-Festival Warmup", reason: "Early deals leading up to the holiday season." },
                9: { event: "Big Billion Days / Great Indian Festival", reason: "Peak discount period of the year. Essential time for tech." },
                10: { event: "Diwali & Dhanteras Sale", reason: "Continuing festive offers and family shopping deals." },
                11: { event: "Year-End / Christmas Sale", reason: "Final clearance of the current year's models." }
            };

            const allMonths = Object.entries(monthlyGroups).map(([m, pArr]) => {
                const mIdx = parseInt(m);
                const aVal = pArr.reduce((a, b) => a + b, 0) / pArr.length;
                return {
                    monthIndex: mIdx,
                    monthName: new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(2000, mIdx)),
                    avg: aVal,
                    score: Math.round(((aVal - avgPrice) / avgPrice) * 100),
                    eventInfo: eventMap[mIdx] || { event: "General Sale", reason: "Organic market fluctuation" }
                };
            });

            // Sort by average price (lowest first)
            monthlyRanking = [...allMonths].sort((a, b) => a.avg - b.avg);
            
            if (monthlyRanking.length > 0) {
                const best = monthlyRanking[0];
                seasonalTip = {
                    month: best.monthName,
                    price: Math.round(best.avg),
                    savings: Math.round(((avgPrice - best.avg) / avgPrice) * 100)
                };
            }
        }

        // 4. Today vs Historical Performance
        const diffFromAvg = ((Number(currentPrice) - avgPrice) / avgPrice) * 100;
        let dayPerformance = {
            status: "AVERAGE",
            label: "Average Price",
            color: "#94a3b8",
            percent: Math.abs(Math.round(diffFromAvg)),
            isLower: Number(currentPrice) < avgPrice
        };

        if (Number(currentPrice) <= minPrice) {
            dayPerformance = { status: "CHEAPEST", label: "Best Price of Year", color: "#4ade80", percent: Math.abs(Math.round(diffFromAvg)), isLower: true };
        } else if (diffFromAvg < -3) {
            dayPerformance = { status: "LOWER", label: "Below Yearly Average", color: "#34d399", percent: Math.abs(Math.round(diffFromAvg)), isLower: true };
        } else if (diffFromAvg > 3) {
            dayPerformance = { status: "HIGHER", label: "Above Yearly Average", color: "#f43f5e", percent: Math.abs(Math.round(diffFromAvg)), isLower: false };
        }

        // 5. Visual Gauge Calculation
        const range = maxPrice - minPrice || 1;
        const position = ((cPrice - minPrice) / range) * 100;

        return { 
            verdict, 
            forecast, 
            seasonalTip, 
            monthlyRanking, 
            dayPerformance, 
            stats: { 
                avg: Math.round(avgPrice), 
                low: minPrice, 
                high: maxPrice 
            },
            gauge: {
                position: Math.max(0, Math.min(100, position)),
                avgPosition: ((avgPrice - minPrice) / range) * 100
            }
        };
    }, [filteredData, history, currentPrice]);


    if (!history || history.length === 0) {
        return (
            <div style={{
                height: '300px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#94a3b8',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '1rem'
            }}>
                No price history available
            </div>
        );
    }

    // Calculate min/max for domain to make chart look dynamic
    const prices = filteredData.length > 0 ? filteredData.map(d => d.price) : [0];
    const minPrice = filteredData.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = filteredData.length > 0 ? Math.max(...prices) : 100;
    
    // Fix: If min == max (flat line or single point), padding is 0 which breaks recharts domain or looks bad
    let padding = (maxPrice - minPrice) * 0.1;
    if (padding === 0) padding = (maxPrice * 0.1) || 10; // Default padding if flat

    return (
        <div className="price-chart-container" style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                <h3 style={{ margin: 0, color: 'var(--text)', fontSize: '1.2rem', fontWeight: 800, whiteSpace: 'nowrap' }}>Price History</h3>
                
                    {/* Range selection removed as per user request to simplify 'day price' section */}
        </div>

        <div style={{ width: '100%', height: '320px', position: 'relative' }}>
                {filteredData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={filteredData}
                            margin={{
                                top: 10,
                                right: 0,
                                left: 0,
                                bottom: 0,
                            }}
                        >
                            <defs>
                                <linearGradient id="colorPriceGradient" x1="0" y1="0" x2="0" y2="1">
                                    {/* Top (Highest Price) -> Red */}
                                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                                    {/* Middle -> Yellow/Orange Transition (Optional, keeps it smoother) */}
                                    <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.5} />
                                    {/* Bottom (Lowest Price) -> Green */}
                                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.2} />
                                </linearGradient>
                                <linearGradient id="strokeGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity={1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="var(--text-muted)"
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                                minTickGap={30}
                            />
                            <YAxis
                                stroke="var(--text-muted)"
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `₹${value}`}
                                domain={[minPrice - padding, maxPrice + padding]}
                                dx={-10}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        const isNegative = data.change < 0;

                                        return (
                                            <div style={{
                                                backgroundColor: 'var(--bg-elevated)',
                                                border: '1px solid var(--border)',
                                                borderRadius: '1rem',
                                                padding: '1rem',
                                                boxShadow: 'var(--shadow-xl)',
                                                minWidth: '200px'
                                            }}>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>{data.fullDate}</span>
                                                    <span>{data.fullTime}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                                                    <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text)' }}>₹{data.price}</span>
                                                    {data.change !== 0 && (
                                                        <span style={{ 
                                                            fontSize: '0.85rem', 
                                                            fontWeight: 800, 
                                                            color: isNegative ? '#4ade80' : '#f43f5e',
                                                            background: isNegative ? 'rgba(74, 222, 128, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                                                            padding: '0.1rem 0.5rem',
                                                            borderRadius: '0.4rem'
                                                        }}>
                                                            {isNegative ? '↓' : '↑'} ₹{Math.abs(data.change)}
                                                        </span>
                                                    )}
                                                </div>
                                                {data.change !== 0 && (
                                                    <div style={{ fontSize: '0.75rem', color: isNegative ? '#4ade80' : '#f43f5e', fontWeight: 600 }}>
                                                        Price {isNegative ? 'decreased' : 'increased'} at this point
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="price"
                                stroke="url(#strokeGradient)"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorPriceGradient)"
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
                        No data recorded for this time range
                    </div>
                )}
            </div>

            {/* Consolidated Smart AI Panel */}
            {prediction && (
                <div style={{
                    marginTop: '2.5rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '1.5rem',
                    border: '1px solid var(--border)',
                    overflow: 'hidden'
                }}>
                    <div style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <div style={{ 
                            fontSize: '2rem', 
                            width: '56px', 
                            height: '56px', 
                            background: 'rgba(255,255,255,0.03)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            borderRadius: '1rem' 
                        }}>
                            {prediction.forecast.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                                <span style={{ fontSize: '0.7rem', color: prediction.verdict.color, background: `${prediction.verdict.color}15`, padding: '0.2rem 0.65rem', borderRadius: '1rem', fontWeight: 900 }}>
                                    {prediction.verdict.badge}
                                </span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800 }}>AI RECOMMENDATION</span>
                            </div>
                            <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>
                                {prediction.verdict.text}
                            </h4>

                            {/* Visual Benchmark Gauge */}
                            <div style={{ width: '100%', maxWidth: '400px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                                    <span>Yearly Low: ₹{prediction.stats.low}</span>
                                    <span>High: ₹{prediction.stats.high}</span>
                                </div>
                                <div style={{ 
                                    height: '8px', 
                                    width: '100%', 
                                    background: 'linear-gradient(to right, #4ade80, #fbbf24, #f43f5e)', 
                                    borderRadius: '4px', 
                                    position: 'relative',
                                    marginBottom: '1.5rem', // increased to make room for AVG below
                                    marginTop: '1.5rem' // increased to make room for Date above
                                }}>
                                    {/* Average Indicator */}
                                    <div style={{ 
                                        position: 'absolute', 
                                        left: `${prediction.gauge.avgPosition}%`, 
                                        top: '-4px', 
                                        height: '16px', 
                                        width: '2px', 
                                        background: 'var(--text-muted)', 
                                        zIndex: 1
                                    }}>
                                        <div style={{ position: 'absolute', top: '18px', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800 }}>AVG</div>
                                    </div>
                                    
                                    {/* Current Price Marker */}
                                    <div style={{ 
                                        position: 'absolute', 
                                        left: `${prediction.gauge.position}%`, 
                                        top: '50%', 
                                        transform: 'translate(-50%, -50%)',
                                        width: '12px', 
                                        height: '12px', 
                                        background: 'var(--bg-card)', 
                                        borderRadius: '50%', 
                                        border: '3px solid var(--text)',
                                        boxShadow: 'var(--shadow-sm)',
                                        zIndex: 2,
                                        transition: 'left 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                    }}>
                                        <div style={{ 
                                            position: 'absolute', 
                                            top: '-22px', 
                                            left: '50%', 
                                            transform: 'translateX(-50%)', 
                                            whiteSpace: 'nowrap', 
                                            fontSize: '0.65rem', 
                                            color: 'var(--text)', 
                                            fontWeight: 900,
                                            background: 'var(--bg-elevated)',
                                            padding: '2px 8px',
                                            borderRadius: '6px',
                                            border: '1px solid var(--border)',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}>
                                            {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {prediction.seasonalTip && (
                            <div style={{ textAlign: 'center', background: 'rgba(99, 102, 241, 0.08)', padding: '0.6rem 1rem', borderRadius: '1rem', border: '1px dashed rgba(99, 102, 241, 0.3)' }}>
                                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Seasonal Best</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--text)' }}>{prediction.seasonalTip.month}</div>
                                {prediction.seasonalTip.savings > 2 && (
                                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#4ade80' }}>~{prediction.seasonalTip.savings}% Off</div>
                                )}
                            </div>
                        )}
                    </div>

                    <div style={{ 
                        padding: '1rem 1.5rem', 
                        background: 'rgba(255,255,255,0.015)', 
                        borderTop: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ opacity: 0.6 }}>Smart Insight:</span> {prediction.forecast.message}
                            <span style={{ marginLeft: '1rem', paddingLeft: '1rem', borderLeft: '1px solid var(--border)', opacity: 0.8 }}>
                                💡 Tip: Historically cheapest in <b>{prediction.seasonalTip?.month}</b>.
                            </span>
                        </p>
                    </div>
                </div>
            )}

            {/* Smart Buying Preference Guide */}
            {prediction && prediction.monthlyRanking.length > 0 && (
                <div style={{ marginTop: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '1.1rem' }}>🏆</span>
                        </div>
                        <h3 style={{ margin: 0, color: 'var(--text)', fontSize: '1.1rem', fontWeight: 800 }}>Smart Buying Preference Guide</h3>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontWeight: 600 }}>NEXT 12 MONTHS</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
                        {prediction.monthlyRanking.slice(0, 4).map((item, idx) => {
                            let status = "BEST TIME";
                            let color = "#10b981";
                            let bg = "rgba(16, 185, 129, 0.08)";
                            let tip = "Lowest historical price";

                            if (idx > 0) {
                                status = "GREAT VALUE";
                                color = "#34d399";
                                bg = "rgba(52, 211, 153, 0.05)";
                                tip = "Better than average";
                            }

                            return (
                                <div key={item.monthIndex} style={{ 
                                    background: 'rgba(255,255,255,0.02)', 
                                    borderRadius: '1.5rem', 
                                    padding: '1.5rem', 
                                    border: '1px solid var(--border)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1rem',
                                    transition: 'all 0.3s',
                                    cursor: 'default'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ fontWeight: 800, color: 'var(--text)', fontSize: '1.2rem' }}>{item.monthName}</div>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 900, color: color, padding: '0.15rem 0.6rem', background: bg, borderRadius: '0.6rem' }}>TOP {idx + 1}</div>
                                    </div>
                                    
                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{status}</div>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>{item.eventInfo.event}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{item.eventInfo.reason}</div>
                                    </div>

                                    <div style={{ 
                                        marginTop: '0.2rem', 
                                        fontSize: '0.75rem', 
                                        fontWeight: 700, 
                                        color: '#10b981',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem'
                                    }}>
                                        ▼ {Math.abs(item.score)}% vs Yearly Avg
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    <div style={{ 
                        marginTop: '1.5rem', 
                        padding: '1.2rem', 
                        borderRadius: '1.25rem', 
                        background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.05), transparent)', 
                        border: '1px solid rgba(99, 102, 241, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <div style={{ fontSize: '1.5rem' }}>💡</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                            <b>Expert Insight:</b> Based on last year's pattern, the most significant price drops start in <b>{prediction.monthlyRanking[0]?.monthName}</b>. 
                            If you're not in a hurry, we recommend waiting until the second quarter for the most consistent "Good Deal" windows.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PriceChart;
