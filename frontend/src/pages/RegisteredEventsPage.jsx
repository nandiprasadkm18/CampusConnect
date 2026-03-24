import React, { useState } from 'react';
import RegisteredEventsList from '../components/RegisteredEventsList.jsx';
import RegisteredWorkshopsList from '../components/RegisteredWorkshopsList.jsx';

const RegisteredEventsPage = () => {
  const [tab, setTab] = useState('events');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">My Registrations</h1>
        <p className="text-sm text-slate-500 mt-0.5">All events and workshops you're registered for</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-8">
        <button 
          onClick={() => setTab('events')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'events' 
              ? 'bg-white text-slate-900 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Events
        </button>
        <button 
          onClick={() => setTab('workshops')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'workshops' 
              ? 'bg-white text-slate-900 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Workshops
        </button>
      </div>

      {tab === 'events' ? <RegisteredEventsList /> : <RegisteredWorkshopsList />}
    </div>
  );
};

export default RegisteredEventsPage;