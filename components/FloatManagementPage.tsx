import * as React from 'react';
import type { Site, Tree, Float, CoralBranch } from '../types';

interface FloatManagementPageProps {
  sites: Site[];
  trees: Tree[];
  floats: Float[];
  branches: CoralBranch[];
  onAddFloat: (treeId: string) => void;
  onRemoveFloat: (floatId: string) => void;
  onNavigateBack: () => void;
}

const FloatManagementPage: React.FC<FloatManagementPageProps> = ({
  sites: activeSites,
  trees: activeTrees,
  floats,
  branches,
  onAddFloat,
  onRemoveFloat,
  onNavigateBack
}) => {
  const [mode, setMode] = React.useState<'individual' | 'bulk'>('individual');
  const [selectedSiteId, setSelectedSiteId] = React.useState<string>('');
  const [selectedTreeId, setSelectedTreeId] = React.useState<string>('');

  const handleSiteChange = (siteId: string) => {
    setSelectedSiteId(siteId);
    setSelectedTreeId('');
  };

  const treesOnSelectedSite = React.useMemo(() => {
    if (!selectedSiteId) return [];
    const site = activeSites.find(s => s.id === selectedSiteId);
    if (!site) return [];
    
    const treeNumbersOnSite = new Set<number>();
    branches.forEach(branch => {
        if (branch.site === site.name) {
            treeNumbersOnSite.add(branch.tree);
        }
    });
    
    return activeTrees.filter(tree => treeNumbersOnSite.has(tree.number)).sort((a,b) => a.number - b.number);

  }, [selectedSiteId, activeSites, activeTrees, branches]);

  const floatsOnSelectedTree = floats.filter(f => f.treeId === selectedTreeId).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg space-y-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b pb-4">
            <h2 className="text-2xl font-bold text-deep-sea mb-2 sm:mb-0">Float Management</h2>
            <button
                onClick={onNavigateBack}
                className="bg-gray-200 hover:bg-gray-300 text-deep-sea font-bold py-2 px-4 rounded-lg transition-colors duration-200 self-start sm:self-center"
            >
                &larr; Back to Add/Edit Items
            </button>
        </div>

        <div className="flex justify-center mb-4 border-b pb-4">
            <div className="inline-flex rounded-md shadow-sm">
                <button
                    onClick={() => setMode('individual')}
                    className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${mode === 'individual' ? 'bg-ocean-blue text-white border-ocean-blue z-10' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                >
                    Individual Tree
                </button>
                <button
                    onClick={() => setMode('bulk')}
                    className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${mode === 'bulk' ? 'bg-ocean-blue text-white border-ocean-blue z-10' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                >
                    Bulk Add
                </button>
            </div>
        </div>
        
        {/* Site Selector - common for both modes */}
        <div className="p-4 border rounded-lg bg-gray-50">
            <label htmlFor="siteSelect" className="block text-sm font-medium text-gray-700">Select Site</label>
            <select id="siteSelect" value={selectedSiteId} onChange={e => handleSiteChange(e.target.value)} className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900">
                <option value="">-- Choose a site --</option>
                {activeSites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
        </div>
        
        {selectedSiteId && (
            <div className="pt-4 border-t">
            {mode === 'individual' ? (
                // Individual Mode
                <div className="space-y-6">
                    <div>
                        <label htmlFor="treeSelect" className="block text-sm font-medium text-gray-700">Select Tree</label>
                        <select id="treeSelect" value={selectedTreeId} onChange={e => setSelectedTreeId(e.target.value)} className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900">
                            <option value="">-- Choose a tree --</option>
                            {treesOnSelectedSite.map(t => <option key={t.id} value={t.id}>Tree #{t.number}</option>)}
                        </select>
                    </div>

                    {selectedTreeId && (
                        <div>
                            <h3 className="font-semibold text-gray-700 text-lg mb-4">Floats on Tree #{activeTrees.find(t=>t.id === selectedTreeId)?.number}</h3>
                            <div className="border rounded-md">
                                <ul className="divide-y divide-gray-200">
                                    {floatsOnSelectedTree.length > 0 ? floatsOnSelectedTree.map(float => (
                                        <li key={float.id} className="p-3 flex justify-between items-center">
                                            <span>{float.name}</span>
                                            <button 
                                                onClick={() => onRemoveFloat(float.id)}
                                                className="text-sm text-red-600 hover:text-red-800 disabled:text-gray-400"
                                                disabled={floatsOnSelectedTree.length <= 1}
                                                title={floatsOnSelectedTree.length <= 1 ? "Cannot remove the last float" : "Remove float"}
                                            >
                                                Remove
                                            </button>
                                        </li>
                                    )) : <li className="p-4 text-center text-gray-500">No floats found.</li>}
                                </ul>
                            </div>
                            <div className="flex justify-end mt-4">
                                <button onClick={() => onAddFloat(selectedTreeId)} className="bg-seafoam-green text-deep-sea font-bold py-2 px-4 rounded-lg">
                                    Add New Float
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                // Bulk Mode
                <div>
                    <h3 className="font-semibold text-gray-700 text-lg mb-4">Add Floats to Trees at {activeSites.find(s=>s.id === selectedSiteId)?.name}</h3>
                    <div className="border rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {treesOnSelectedSite.length > 0 ? treesOnSelectedSite.map(tree => {
                                const floatCount = floats.filter(f => f.treeId === tree.id).length;
                                return (
                                    <li key={tree.id} className="p-3 flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">Tree #{tree.number}</p>
                                            <p className="text-sm text-gray-500">{floatCount} float(s)</p>
                                        </div>
                                        <button onClick={() => onAddFloat(tree.id)} className="bg-seafoam-green text-deep-sea font-bold py-1 px-3 rounded-lg text-sm">
                                            + Add Float
                                        </button>
                                    </li>
                                );
                            }) : <li className="p-4 text-center text-gray-500">No trees found at this site.</li>}
                        </ul>
                    </div>
                </div>
            )}
            </div>
        )}
    </div>
  );
};

export default FloatManagementPage;