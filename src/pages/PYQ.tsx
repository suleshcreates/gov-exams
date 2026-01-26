import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Download, Lock, CheckCircle, Filter, Calendar, FileType } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface PYQ {
    id: string;
    title: string;
    description: string;
    category: string;
    year: number;
    price: number;
    pdf_url: string;
    thumbnail_url: string;
    page_count: number;
    file_size_mb: number;
}

const PYQ = () => {
    const [pyqs, setPYQs] = useState<PYQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedYear, setSelectedYear] = useState<string>('all');
    const [categories, setCategories] = useState<string[]>([]);
    const [years, setYears] = useState<number[]>([]);
    const [userAccess, setUserAccess] = useState<Record<string, boolean>>({});
    const { auth } = useAuth();

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

    useEffect(() => {
        loadPYQs();
        loadCategories();
        if (auth.isAuthenticated) {
            loadUserAccess();
        }
    }, [auth.isAuthenticated]);

    const loadPYQs = async () => {
        try {
            const response = await fetch(`${API_URL}/api/public/pyq`);
            const data = await response.json();
            setPYQs(data || []);

            // Extract unique years
            const uniqueYears = [...new Set((data || []).map((p: PYQ) => p.year).filter(Boolean))].sort((a: number, b: number) => b - a);
            setYears(uniqueYears as number[]);
        } catch (error) {
            console.error('Error loading PYQs:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const response = await fetch(`${API_URL}/api/public/categories`);
            const data = await response.json();
            setCategories(data || []);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const loadUserAccess = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_URL}/api/student/premium-access?resource_type=pyq`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            const accessMap: Record<string, boolean> = {};
            (data || []).forEach((a: { resource_id: string }) => {
                accessMap[a.resource_id] = true;
            });
            setUserAccess(accessMap);
        } catch (error) {
            console.error('Error loading user access:', error);
        }
    };



    const filteredPYQs = pyqs.filter(p => {
        const categoryMatch = selectedCategory === 'all' || p.category === selectedCategory;
        const yearMatch = selectedYear === 'all' || p.year === parseInt(selectedYear);
        return categoryMatch && yearMatch;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pt-20 py-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
                        Previous Year Questions
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Access premium PYQ papers from various competitive exams.
                        Learn from authentic questions and ace your preparation.
                    </p>
                </motion.div>

                {/* Filters */}
                <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                    {/* Category Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-muted-foreground" />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-2 rounded-lg border bg-card"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Year Filter */}
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="px-4 py-2 rounded-lg border bg-card"
                        >
                            <option value="all">All Years</option>
                            {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* PYQ Grid */}
                {filteredPYQs.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <p className="text-lg text-muted-foreground">No PYQs available yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredPYQs.map((pyq, index) => {
                            const hasAccess = userAccess[pyq.id];
                            return (
                                <motion.div
                                    key={pyq.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all border group"
                                >
                                    {/* Thumbnail */}
                                    <div className="h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 relative flex items-center justify-center">
                                        <FileType className="w-12 h-12 text-primary/40 group-hover:scale-110 transition-transform" />

                                        {/* Price/Status Badge */}
                                        <div className="absolute top-2 right-2">
                                            {hasAccess ? (
                                                <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" /> Owned
                                                </span>
                                            ) : (
                                                <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                                                    <Lock className="w-3 h-3" /> ₹{pyq.price}
                                                </span>
                                            )}
                                        </div>

                                        {/* Category & Year */}
                                        <div className="absolute bottom-2 left-2 flex gap-2">
                                            {pyq.category && (
                                                <span className="bg-black/50 text-white px-2 py-0.5 rounded text-xs">
                                                    {pyq.category}
                                                </span>
                                            )}
                                            {pyq.year && (
                                                <span className="bg-primary/80 text-white px-2 py-0.5 rounded text-xs">
                                                    {pyq.year}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        <h3 className="font-bold text-lg mb-1 line-clamp-1">{pyq.title}</h3>
                                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                                            {pyq.description || 'Previous year question paper'}
                                        </p>

                                        {/* Meta */}
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                                            {pyq.page_count && (
                                                <span>{pyq.page_count} pages</span>
                                            )}
                                            {pyq.file_size_mb && (
                                                <span>{pyq.file_size_mb} MB</span>
                                            )}
                                        </div>

                                        {/* Action Button */}
                                        {hasAccess ? (
                                            <Link to={`/pyq/${pyq.id}`}>
                                                <button
                                                    className="w-full py-2.5 rounded-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                    View PDF
                                                </button>
                                            </Link>
                                        ) : (
                                            <Link to={`/pyq/${pyq.id}`}>
                                                <button className="w-full py-2.5 rounded-lg font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90 transition-all">
                                                    Purchase for ₹{pyq.price}
                                                </button>
                                            </Link>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PYQ;
