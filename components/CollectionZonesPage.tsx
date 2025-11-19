import * as React from 'react';
import type { FormEvent } from 'react';
import type { Site, CollectionZone } from '../types';

interface CollectionZonesPageProps {
  sites: Site[];
  zones: CollectionZone[];
  onAddZone: (name: string, siteId: string, latitude: number, longitude: number) => void;
  onNavigateBack: () => void;
}

const CollectionZonesPage: React.FC<CollectionZonesPageProps> = ({
  sites: activeSites,
  zones,
  onAddZone,
  onNavigateBack
}) => {
    const [selectedSiteId, setSelectedSiteId] = React.useState<string>('');
    const [zoneName, setZoneName] = React.useState('');
    const [latitude, setLatitude] = React.useState('');
    const [longitude, setLongitude] = React.useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);

        if (!selectedSiteId || !zoneName.trim() || isNaN(lat) || isNaN(lon)) {
            alert('Please fill out all fields with valid values.');
            return;
        }

        onAddZone(zoneName.trim(), selectedSiteId, lat, lon);

        // Reset form
        setSelectedSiteId('');
        setZoneName('');
        setLatitude('');
        setLongitude('');
    };
    
    const handleShowOnMap = (lat?: number, lon?: number) => {
        if (lat !== undefined && lon !== undefined) {
            const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
            window.open(url, '_blank', 'noopener,noreferrer');
        } else {
            alert('GPS coordinates are not available for this zone.');
        }
    };
    
    // Group zones by site for display
    const zonesBySite = React.useMemo(() => {
        const grouped: { [siteName: string]: CollectionZone[] } = {};
        zones.forEach(zone => {
            const site = activeSites.find(s => s.id === zone.siteId);
            if (site) {
                if (!grouped[site.name]) {
                    grouped[site.name] = [];
                }
                grouped[site.name].push(zone);
            }
        });
        return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
    }, [zones, activeSites]);


    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg space-y-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b pb-4">
                <h2 className="text-2xl font-bold text-deep-sea mb-2 sm:mb-0">Manage Collection Zones</h2>
                <button
                    onClick={onNavigateBack}
                    className="bg-gray-200 hover:bg-gray-300 text-deep-sea font-bold py-2 px-4 rounded-lg transition-colors duration-200 self-start sm:self-center"
                >
                    &larr; Back to Add/Edit Items
                </button>
            </div>

            {/* Add New Zone Form */}
            <form onSubmit={handleSubmit} className="p-4 border rounded-lg space-y-4 bg-gray-50">
                <h3 className="font-semibold text-gray-700 text-lg">Add New Collection Zone</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="siteSelect" className="block text-sm font-medium text-gray-700">Site</label>
                        <select id="siteSelect" value={selectedSiteId} onChange={e => setSelectedSiteId(e.target.value)} required className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900">
                            <option value="">-- Choose a site --</option>
                            {activeSites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="zoneName" className="block text-sm font-medium text-gray-700">Zone Name/Number</label>
                        <input type="text" id="zoneName" value={zoneName} onChange={e => setZoneName(e.target.value)} required className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900"/>
                    </div>
                    <div>
                        <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">Latitude</label>
                        <input type="number" step="any" id="latitude" value={latitude} onChange={e => setLatitude(e.target.value)} required placeholder="e.g., 25.7630" className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900"/>
                    </div>
                    <div>
                        <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">Longitude</label>
                        <input type="number" step="any" id="longitude" value={longitude} onChange={e => setLongitude(e.target.value)} required placeholder="e.g., -80.1900" className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900"/>
                    </div>
                </div>
                 <div className="flex justify-end pt-2">
                    <button type="submit" className="bg-ocean-blue hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200">
                      Add Collection Zone
                    </button>
                </div>
            </form>

            {/* Existing Zones List */}
            <div>
              <h3 className="font-semibold text-gray-700 text-lg mb-4">Existing Collection Zones</h3>
              <div className="space-y-4">
                {zonesBySite.length > 0 ? (
                    zonesBySite.map(([siteName, siteZones]) => (
                        <div key={siteName}>
                             <h4 className="font-medium bg-gray-100 p-2 rounded-t-md text-deep-sea">{siteName}</h4>
                             <div className="border border-t-0 rounded-b-md">
                                <ul className="divide-y divide-gray-200">
                                {siteZones.map(zone => (
                                    <li key={zone.id} className="p-3">
                                        <div className="flex justify-between items-center flex-wrap gap-2">
                                            <div>
                                                <p className="font-semibold text-deep-sea">{zone.name}</p>
                                            </div>
                                            <div className="text-right">
                                                 <p className="text-sm text-gray-600 font-mono">
                                                    {zone.latitude?.toFixed(4) || 'N/A'}, {zone.longitude?.toFixed(4) || 'N/A'}
                                                 </p>
                                                 <button
                                                    onClick={() => handleShowOnMap(zone.latitude, zone.longitude)}
                                                    className="text-xs text-ocean-blue hover:underline"
                                                    disabled={zone.latitude === undefined || zone.longitude === undefined}
                                                >
                                                    Show on map
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                                </ul>
                             </div>
                        </div>
                    ))
                ) : (
                  <p className="text-center text-gray-500 py-8">No collection zones have been added yet.</p>
                )}
              </div>
            </div>

        </div>
    );
};

export default CollectionZonesPage;