import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Calendar, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Recommendations = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('user'));
                if (!userInfo) return;
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get('http://localhost:5000/api/events/recommendations', config);
                setEvents(data);
            } catch (err) {
                console.error("Failed to fetch recommendations", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecommendations();
    }, []);

    if (loading || events.length === 0) return null;

    return (
        <section className="py-12">
            <div className="flex items-center justify-between mb-8 border-l-4 border-slate-900 pl-6">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 uppercase tracking-tight flex items-center gap-3 font-serif">
                        <Sparkles className="w-6 h-6 text-amber-500 fill-amber-500" /> Recommended For You
                    </h2>
                    <p className="text-slate-500 font-serif font-medium">Curated academic opportunities based on your profile.</p>
                </div>
                <Link to="/events" className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">
                    View Catalog <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {events.map((event, i) => (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        key={event._id}
                        className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="px-3 py-1 bg-slate-50 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-slate-100">{event.branch}</span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 mb-4 line-clamp-1 group-hover:text-black">{event.title}</h4>
                        <div className="space-y-2 mb-6 opacity-60">
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                                <Calendar className="w-3 h-3" /> {new Date(event.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                                <MapPin className="w-3 h-3" /> {event.location}
                            </div>
                        </div>
                        <Link 
                            to="/events" 
                            className="block text-center py-3 border-2 border-slate-900 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all"
                        >
                            View Details
                        </Link>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default Recommendations;
