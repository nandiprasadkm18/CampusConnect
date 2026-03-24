import React, { useState } from 'react';
import QRScanner from '../components/QRScanner.jsx';
import { ToggleLeft, ToggleRight } from 'lucide-react';

const ScannerPage = () => {
    const [type, setType] = useState('events');

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-l-4 border-slate-900 pl-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight uppercase font-serif">Attendance Point</h1>
                    <p className="text-slate-500 mt-2 font-medium text-lg font-serif">Secure QR verification for university engagements.</p>
                </div>
                
                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100 self-start">
                    <button 
                        onClick={() => setType('events')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${type === 'events' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Events
                    </button>
                    <button 
                        onClick={() => setType('workshops')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${type === 'workshops' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Workshops
                    </button>
                </div>
            </div>

            <div className="flex justify-center">
                <div className="w-full max-w-xl">
                    <QRScanner type={type} />
                </div>
            </div>
        </div>
    );
};

export default ScannerPage;
