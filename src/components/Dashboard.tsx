import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SpotCard } from './SpotCard';
import { AddSpotModal } from './AddSpotModal';
import { RentModal } from './RentModal';
import { ManageModal } from './ManageModal';
import { Spot, Filters, SortBy } from '../types';
import { api } from '../services/api';
import { isDateInRange, daysBetween, formatDate, getTodayString } from '../utils/dateTime';
import { shuffleArray } from '../utils/helpers';

interface DashboardProps {
  onLogout: () => void;
}

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'random', label: 'Random' },
  { value: 'soonest', label: 'Soonest Available' },
  { value: 'longest', label: 'Longest Duration' }
];

export const Dashboard: React.FC<DashboardProps> = () => {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({ date: '', venmo: '', size: '', floor: '' });
  const [sortBy, setSortBy] = useState<SortBy>('random');
  const [shuffledOrder, setShuffledOrder] = useState<string[]>([]);

  const sortByMinWidth = useMemo(() => {
    const longestLabel = Math.max(...SORT_OPTIONS.map(opt => opt.label.length));
    // Approximate 8px per character + 40px for padding and dropdown arrow
    return `${(longestLabel * 8) + 40}px`;
  }, []);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [rentModalOpen, setRentModalOpen] = useState(false);
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

  const loadSpots = useCallback(async () => {
    setLoading(true);
    const data = await api.fetchSpots();
    setSpots(data);
    // Create a shuffled order of IDs for random sort
    setShuffledOrder(shuffleArray(data.map(s => s.id)));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSpots();
  }, [loadSpots]);

  const filteredSpots = useMemo(() => {
    let result = spots.filter(s => s.status === 'available');
    if (filters.date) result = result.filter(s => isDateInRange(filters.date, s.availableFrom, s.availableTo));
    if (filters.venmo) result = result.filter(s => s.venmo.toLowerCase().includes(filters.venmo.toLowerCase()));
    if (filters.size) result = result.filter(s => s.size === filters.size);
    if (filters.floor) result = result.filter(s => s.floor === filters.floor);
    switch (sortBy) {
      case 'random':
        result.sort((a, b) => shuffledOrder.indexOf(a.id) - shuffledOrder.indexOf(b.id));
        break;
      case 'soonest':
        result.sort((a, b) => new Date(a.availableFrom).getTime() - new Date(b.availableFrom).getTime());
        break;
      case 'longest':
        result.sort((a, b) => daysBetween(b.availableFrom, b.availableTo) - daysBetween(a.availableFrom, a.availableTo));
        break;
    }
    return result;
  }, [spots, filters, sortBy, shuffledOrder]);

  const hasFilters = filters.date || filters.venmo || filters.size || filters.floor;
  const clearFilters = () => setFilters({ date: '', venmo: '', size: '', floor: '' });
  const handleRent = (spot: Spot) => {
    setSelectedSpot(spot);
    setRentModalOpen(true);
  };
  const handleManage = (spot: Spot) => {
    setSelectedSpot(spot);
    setManageModalOpen(true);
  };

  return (
    <div className="dashboard active">
      <header>
        <div className="logo">
          <div className="logo-sm">🚗</div>
          <h1>The Palms Parking</h1>
        </div>
        <button
          className="btn btn-primary"
          style={{ width: 'auto', padding: '10px 20px' }}
          onClick={() => setAddModalOpen(true)}
        >
          + List Your Spot
        </button>
      </header>
      <main className="main">
        <div className="filters">
          <div className="filter-group">
            <label>Search by date</label>
            <input
              type="date"
              className="input"
              min={getTodayString()}
              value={filters.date}
              onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>
          <div className="filter-group">
            <label>Search by Venmo</label>
            <input
              type="text"
              className="input"
              placeholder="@username"
              value={filters.venmo}
              onChange={(e) => setFilters(prev => ({ ...prev, venmo: e.target.value }))}
            />
          </div>
          <div className="filter-group" style={{ minWidth: '130px' }}>
            <label>Spot Size</label>
            <select className="input" value={filters.size} onChange={(e) => setFilters(prev => ({ ...prev, size: e.target.value }))}>
              <option value="">All Sizes</option>
              <option value="Full Size">Full Size</option>
              <option value="Compact">Compact</option>
              <option value="Motorcycle">Motorcycle</option>
            </select>
          </div>
          <div className="filter-group" style={{ minWidth: '100px' }}>
            <label>Floor</label>
            <select className="input" value={filters.floor} onChange={(e) => setFilters(prev => ({ ...prev, floor: e.target.value }))}>
              <option value="">All</option>
              <option value="P1">P1</option>
              <option value="P2">P2</option>
              <option value="P3">P3</option>
            </select>
          </div>
          <div className="filter-group" style={{ minWidth: sortByMinWidth }}>
            <label>Sort by</label>
            <select className="input" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)}>
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {hasFilters && (
            <button className="btn btn-secondary" style={{ width: 'auto', padding: '12px 16px' }} onClick={clearFilters}>
              Clear
            </button>
          )}
        </div>
        <div className="results-count">
          {filteredSpots.length} {filteredSpots.length === 1 ? 'spot' : 'spots'} available
          {filters.date && ` on ${formatDate(filters.date + 'T00:00:00')}`}
        </div>
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <div>Loading available spots...</div>
          </div>
        ) : filteredSpots.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🚗</div>
            <div className="title">No spots available</div>
            <div>Check back later or list your own!</div>
          </div>
        ) : (
          <div className="spots-grid">
            {filteredSpots.map(spot => (
              <SpotCard key={spot.id} spot={spot} onRent={handleRent} onManage={handleManage} />
            ))}
          </div>
        )}
      </main>
      <AddSpotModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} onSubmit={loadSpots} />
      <RentModal
        isOpen={rentModalOpen}
        onClose={() => {
          setRentModalOpen(false);
          setSelectedSpot(null);
        }}
        spot={selectedSpot}
        onSubmit={loadSpots}
      />
      <ManageModal
        isOpen={manageModalOpen}
        onClose={() => {
          setManageModalOpen(false);
          setSelectedSpot(null);
        }}
        spot={selectedSpot}
        onUpdate={loadSpots}
        onDelete={loadSpots}
      />
    </div>
  );
};
