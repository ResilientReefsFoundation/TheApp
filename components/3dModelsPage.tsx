import * as React from 'react';
import type { FormEvent } from 'react';
import type { Site, CollectionZone, Anchor } from '../types';

interface AnchorsPageProps {
  sites: Site[];
  anchors: Anchor[];
  onAddAnchor: (name: string, siteId: string, latitude: number, longitude: number, isDeepwater: boolean, depth: number | undefined) => void;
  onNavigateBack: () => void;
}

const AnchorsPage: React.FC<AnchorsPageProps> = ({
  sites: activeSites,
  anchors,
  onAddAnchor,
  onNavigateBack
}) => {
    const [selectedSiteId, setSelectedSiteId] = React.useState<string>('');
    const [anchorName, setAnchorName] = React.useState('');
    const [latitude, setLatitude] = React.useState('');
    const [longitude, setLongitude] = React.useState('');
    const [isDeepwater, setIsDeepwater] = React.useState(false);
    const [depth, setDepth] = React.useState('');


    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);
        const depthNum = isDeepwater ? parseFloat(depth) : undefined;

        if (!selectedSiteId || !anchorName.trim() || isNaN(lat) || isNaN(lon) || (isDeepwater && (depth.trim() === '' || isNaN(depthNum!)))) {
            alert('Please fill out all fields with valid values.');
            return;
        }

        onAddAnchor(anchorName.trim(), selectedSiteId, lat, lon, isDeepwater, depthNum);

        // Reset form
        setSelectedSiteId('');
        setAnchorName('');
        setLatitude('');
        setLongitude('');
        setIsDeepwater(false);
        setDepth('');
    };
    
    // Group anchors by site for display
    const anchorsBySite = React.useMemo(() => {
        const grouped: { [siteName: string]: Anchor[] } = {};
        anchors.forEach(anchor => {
            const site = activeSites.find(s => s.id === anchor.siteId);
            if (site) {
                if (!grouped[site.name]) {
                    grouped[site.name] = [];
                }
                grouped[site.name].push(anchor);
            }
        });
        return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
    }, [anchors, activeSites]);


    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg space-y-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b pb-4">
                <h2 className="text-2xl font-bold text-deep-sea mb-2 sm:mb-0">Manage Anchors</h2>
                <button
                    onClick={onNavigateBack}
                    className="bg-gray-200 hover:bg-gray-300 text-deep-sea font-bold py-2 px-4 rounded-lg transition-colors duration-200 self-start sm:self-center"
                >
                    &larr; Back to Add/Edit Items
                </button>
            </div>

            {/* Add New Anchor Form */}
            <form onSubmit={handleSubmit} className="p-4 border rounded-lg space-y-4 bg-gray-50">
                <h3 className="font-semibold text-gray-700 text-lg">Add New Anchor</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="siteSelect" className="block text-sm font-medium text-gray-700">Site</label>
                        <select id="siteSelect" value={selectedSiteId} onChange={e => setSelectedSiteId(e.target.value)} required className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900">
                            <option value="">-- Choose a site --</option>
                            {activeSites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="anchorName" className="block text-sm font-medium text-gray-700">Anchor Name/Number</label>
                        <input type="text" id="anchorName" value={anchorName} onChange={e => setAnchorName(e.target.value)} required className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900"/>
                    </div>
                    <div>
                        <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">Latitude</label>
                        <input type="number" step="any" id="latitude" value={latitude} onChange={e => setLatitude(e.target.value)} required placeholder="e.g., 25.7617" className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900"/>
                    </div>
                    <div>
                        <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">Longitude</label>
                        <input type="number" step="any" id="longitude" value={longitude} onChange={e => setLongitude(e.target.value)} required placeholder="e.g., -80.1918" className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900"/>
                    </div>
                     <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="isDeepwater" checked={isDeepwater} onChange={e => setIsDeepwater(e.target.checked)} className="h-4 w-4 rounded border border-ocean-blue text-ocean-blue focus:ring-ocean-blue"/>
                            <label htmlFor="isDeepwater" className="font-medium text-gray-700">Deepwater Anchor</label>
                        </div>
                        {isDeepwater && (
                            <div className="flex-grow">
                                <label htmlFor="depth" className="sr-only">Depth (m)</label>
                                <input type="number" step="any" id="depth" value={depth} onChange={e => setDepth(e.target.value)} required={isDeepwater} placeholder="Enter depth in meters" className="block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900"/>
                            </div>
                        )}
                    </div>
                </div>
                 <div className="flex justify-end pt-2">
                    <button type="submit" className="bg-ocean-blue hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200">
                      Add Anchor
                    </button>
                </div>
            </form>

            {/* Existing Anchors List */}
            <div>
              <h3 className="font-semibold text-gray-700 text-lg mb-4">Existing Anchors</h3>
              <div className="space-y-4">
                {anchorsBySite.length > 0 ? (
                    anchorsBySite.map(([siteName, siteAnchors]) => (
                        <div key={siteName}>
                             <h4 className="font-medium bg-gray-100 p-2 rounded-t-md text-deep-sea">{siteName}</h4>
                             <div className="border border-t-0 rounded-b-md">
                                <ul className="divide-y divide-gray-200">
                                {siteAnchors.map(anchor => (
                                    <li key={anchor.id} className="p-3">
                                        <div className="flex justify-between items-center flex-wrap gap-2">
                                            <div>
                                                <p className="font-semibold text-deep-sea">{anchor.name}</p>
                                                {anchor.isDeepwater && (
                                                     <p className="text-sm text-gray-500">
                                                         Deepwater | Depth: {anchor.depth ? `${anchor.depth}m` : 'N/A'}
                                                     </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                 <p className="text-sm text-gray-600 font-mono">
                                                    {anchor.latitude?.toFixed(4) || 'N/A'}, {anchor.longitude?.toFixed(4) || 'N/A'}
                                                 </p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                                </ul>
                             </div>
                        </div>
                    ))
                ) : (
                  <p className="text-center text-gray-500 py-8">No anchors have been added yet.</p>
                )}
              </div>
            </div>

        </div>
    );
};

export default AnchorsPage;