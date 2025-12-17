'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';

interface HomeDashboardProps {
  onSearchStart: (query: string) => void;
  onOrdersClick: () => void;
  onProfileClick: () => void;
  currentLocation?: string;
}

export default function HomeDashboard({ onSearchStart, onOrdersClick, onProfileClick, currentLocation = '128 W 42nd St, NY' }: HomeDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearchStart(searchQuery);
    }
  };

  const services = [
    { icon: 'lucide:droplets', label: 'Plumber', query: 'plumber', color: 'bg-blue-50 text-blue-600', time: 'Arrives ~15m' },
    { icon: 'lucide:key', label: 'Locksmith', query: 'locksmith', color: 'bg-orange-50 text-orange-600', time: 'Arrives ~20m' },
    { icon: 'lucide:zap', label: 'Electrician', query: 'electrician', color: 'bg-yellow-50 text-yellow-600', time: 'Arrives ~35m' },
    { icon: 'lucide:grid', label: 'More', query: '', color: 'bg-gray-50 text-gray-600', time: '' },
  ];

  return (
    <div className="w-full h-full bg-[#F6F9FC] rounded-[40px] overflow-hidden relative flex flex-col">
      {/* Top Bar */}
      <div className="p-6 pt-12 flex justify-between items-center bg-white pb-6 rounded-b-3xl shadow-sm z-10">
        <div>
          <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider">Current Location</p>
          <div className="flex items-center gap-1">
            <h2 className="text-sm font-bold text-[#0A2540] truncate max-w-[150px]">{currentLocation}</h2>
            <iconify-icon icon="lucide:chevron-down" width="14" className="text-[#0A2540]"></iconify-icon>
          </div>
        </div>
        <button onClick={onProfileClick} className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
          <img src="https://i.pravatar.cc/150?img=33" className="w-full h-full object-cover" alt="Profile" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Search */}
        <div
          onClick={handleSearch}
          className="bg-white p-3 rounded-2xl shadow-card flex items-center gap-3 mb-6 cursor-pointer">
          <iconify-icon icon="lucide:search" className="text-gray-400 ml-1" width="20"></iconify-icon>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="What do you need help with?"
            className="flex-1 bg-transparent outline-none text-sm text-gray-400"
          />
        </div>

        <h3 className="font-semibold text-[#0A2540] mb-3 text-sm">Emergency Services</h3>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {services.map((service, index) => (
            <button
              key={index}
              onClick={() => service.query && onSearchStart(service.query)}
              className="bg-white p-4 rounded-2xl shadow-card hover:shadow-md transition-shadow text-left">
              <div className={`w-10 h-10 rounded-full ${service.color} flex items-center justify-center mb-3`}>
                <iconify-icon icon={service.icon} width="20"></iconify-icon>
              </div>
              <span className="font-medium text-[#0A2540] text-sm block">{service.label}</span>
              {service.time && <span className="text-xs text-[#64748B]">{service.time}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="bg-white border-t border-gray-100 p-4 pb-6 flex justify-around items-center text-xs font-medium">
        <div className="flex flex-col items-center gap-1 text-[#0A2540]">
          <iconify-icon icon="lucide:home" width="24"></iconify-icon>
          <span>Home</span>
        </div>
        <button onClick={onOrdersClick} className="flex flex-col items-center gap-1 text-gray-400">
          <iconify-icon icon="lucide:file-text" width="24"></iconify-icon>
          <span>Orders</span>
        </button>
        <button onClick={onProfileClick} className="flex flex-col items-center gap-1 text-gray-400">
          <iconify-icon icon="lucide:user" width="24"></iconify-icon>
          <span>Profile</span>
        </button>
      </div>
    </div>
  );
}

