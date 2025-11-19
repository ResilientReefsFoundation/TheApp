import * as React from 'react';
import type { FormEvent } from 'react';
import type { Site, Anchor, Tree, CoralBranch } from '../types';
import { CloseIcon } from './Icons';

// Helper functions for displaying branch info
const calculateAgeInDays = (dateString: string): number => {
  const addedDate = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - addedDate.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

const formatAge = (totalDays: number): string => {
  if (totalDays < 365) {
    return `${totalDays} day${totalDays !== 1 ? 's' : ''}`;
  }
  const years = Math.floor(totalDays / 365);
  const remainingDays = totalDays % 365;
  
  const yearString = `${years} year${years !== 1 ? 's' : ''}`;
  
  if (remainingDays === 0) {
    return yearString;
  }
  
  const dayString = `${remainingDays} day${remainingDays !== 1 ? 's' : ''}`;
  
  return `${yearString} and ${dayString}`;
};

const getHealthStatusColor = (percentage: number): string => {
    if (percentage > 87.5) return 'bg-green-500';
    if (percentage > 62.5) return 'bg-yellow-400';
    if (percentage > 37.5) return 'bg-orange-400';
    if (percentage > 12.5) return 'bg-orange-600';
    return 'bg-red-500';
};

interface MoveBranchModalProps {
    branch: CoralBranch;
    branches: CoralBranch[];
    activeTrees: Tree[];
    activeSites: Site[];
    activeAnchors: Anchor[];
    onClose: () => void;
    onMoveBranch: (branchId: string, newTreeId: string, newFace: 1 | 2 | 3 | 4, newPosition: number, reason?: string) => void;
}

const MoveBranchModal: React.FC<MoveBranchModalProps> = ({
    branch,
    branches,
    activeTrees,
    activeSites,
    activeAnchors,
    onClose,
    onMoveBranch
}) => {
    // Find current tree to pre-populate dropdown
    const currentTree = React.useMemo(() => {
        const site = activeSites.find(s => s.name === branch.site);
        if (!site) return null;
        const siteAnchors = activeAnchors.filter(a => a.siteId === site.id);
        const siteAnchorIds = new Set(siteAnchors.map(a => a.id));
        return activeTrees.find(t => t.number === branch.tree && siteAnchorIds.has(t.anchorId));
    }, [branch, activeTrees, activeSites, activeAnchors]);

    const [newTreeId, setNewTreeId] = React.useState(currentTree ? currentTree.id : '');
    const [newFace, setNewFace] = React.useState('');
    const [newPosition, setNewPosition] = React.useState('');
    const [reason, setReason] = React.useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const faceNum = parseInt(newFace, 10);
        const posNum = parseInt(newPosition, 10);
        if (!newTreeId || !newFace || !newPosition || isNaN(faceNum) || isNaN(posNum)) {
            alert('Please select a new tree, face, and position.');
            return;
        }
        onMoveBranch(branch.id, newTreeId, faceNum as 1 | 2 | 3 | 4, posNum, reason);
        onClose();
    };
    
    // Derived state for available slots
    const selectedTree = React.useMemo(() => activeTrees.find(t => t.id === newTreeId), [newTreeId, activeTrees]);

    const branchesOnSelectedTree = React.useMemo(() => {
        if (!selectedTree) return [];
        const anchor = activeAnchors.find(a => a.id === selectedTree.anchorId);
        if (!anchor) return [];
        const site = activeSites.find(s => s.id === anchor.siteId);
        if (!site) return [];

        // Exclude the branch being moved from occupancy checks
        return branches.filter(b => b.tree === selectedTree.number && b.site === site.name && b.id !== branch.id);
    }, [selectedTree, branches, activeAnchors, activeSites, branch.id]);

    const availableFaces = React.useMemo(() => {
        if (!selectedTree) return [];
        const occupiedFaceCounts = new Map<number, number>();
        branchesOnSelectedTree.forEach(b => {
            occupiedFaceCounts.set(b.face, (occupiedFaceCounts.get(b.face) || 0) + 1);
        });

        const faces: number[] = [];
        for (let i = 1; i <= 4; i++) {
            if ((occupiedFaceCounts.get(i) || 0) < 10) { // Max 10 positions per face
                faces.push(i);
            }
        }
        return faces;
    }, [selectedTree, branchesOnSelectedTree]);

    const availablePositions = React.useMemo(() => {
        if (!selectedTree || !newFace) return [];
        const faceNum = parseInt(newFace, 10);
        if (isNaN(faceNum)) return [];

        const occupiedPositions = new Set(
            branchesOnSelectedTree
                .filter(b => b.face === faceNum)
                .map(b => b.position)
        );

        const positions: number[] = [];
        for (let i = 1; i <= 10; i++) {
            if (!occupiedPositions.has(i)) {
                positions.push(i);
            }
        }
        return positions;
    }, [selectedTree, newFace, branchesOnSelectedTree]);

    // Reset selections when dependencies change
    React.useEffect(() => {
        setNewFace('');
        setNewPosition('');
    }, [newTreeId]);

    React.useEffect(() => {
        setNewPosition('');
    }, [newFace]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <header className="p-4 border-b flex justify-between items-center">
                        <h2 className="text-xl font-bold text-deep-sea">Move Branch {branch.fragmentId}</h2>
                        <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800"><CloseIcon className="w-6 h-6"/></button>
                    </header>
                    <div className="p-6 space-y-4">
                         <div>
                            <label htmlFor="newTree" className="block text-sm font-medium text-gray-700">New Tree</label>
                            <select id="newTree" value={newTreeId} onChange={e => setNewTreeId(e.target.value)} required className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900">
                                <option value="">-- Select Tree --</option>
                                {activeTrees.map(t => <option key={t.id} value={t.id}>Tree #{t.number} ({activeSites.find(s=>s.id === activeAnchors.find(a=>a.id === t.anchorId)?.siteId)?.name})</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="newFace" className="block text-sm font-medium text-gray-700">New Face</label>
                            <select id="newFace" value={newFace} onChange={e => setNewFace(e.target.value)} required disabled={!newTreeId || availableFaces.length === 0} className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900 disabled:bg-gray-100">
                                <option value="" disabled>{!newTreeId ? 'Select a tree first' : availableFaces.length > 0 ? '-- Select Face --' : 'No available faces'}</option>
                                {availableFaces.map(face => (
                                    <option key={face} value={face}>Face {face}</option>
                                ))}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="newPosition" className="block text-sm font-medium text-gray-700">New Position</label>
                             <select id="newPosition" value={newPosition} onChange={e => setNewPosition(e.target.value)} required disabled={!newFace || availablePositions.length === 0} className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900 disabled:bg-gray-100">
                                <option value="" disabled>{!newFace ? 'Select a face first' : availablePositions.length > 0 ? '-- Select Position --' : 'No available spots'}</option>
                                {availablePositions.map(pos => (
                                    <option key={pos} value={pos}>Position {pos}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="moveReason" className="block text-sm font-medium text-gray-700">Reason for move (optional)</label>
                            <textarea
                                id="moveReason"
                                rows={2}
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900"
                                placeholder="e.g., Tree is full, moving to new tree."
                            />
                        </div>
                    </div>
                    <footer className="p-4 bg-gray-50 rounded-b-2xl flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-deep-sea font-bold py-2 px-4 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-ocean-blue text-white font-bold py-2 px-4 rounded-lg">Confirm Move</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};


interface BranchesPageProps {
  sites: Site[];
  anchors: Anchor[];
  trees: Tree[];
  branches: CoralBranch[];
  onAddBranch: (siteId: string, treeId: string, face: 1 | 2 | 3 | 4, position: number, isHeatTolerant: boolean, genus: string, species: string) => void;
  onMoveBranch: (branchId: string, newTreeId: string, newFace: 1 | 2 | 3 | 4, newPosition: number, reason?: string) => void;
  onSelectBranch: (branchId: string) => void;
  onNavigateBack: () => void;
  initialBranchToMove?: CoralBranch;
}

const BranchesPage: React.FC<BranchesPageProps> = ({
  sites: activeSites,
  anchors: activeAnchors,
  trees: activeTrees,
  branches,
  onAddBranch,
  onMoveBranch,
  onSelectBranch,
  onNavigateBack,
  initialBranchToMove,
}) => {
  // State for Add form
  const [addSiteId, setAddSiteId] = React.useState<string>('');
  const [addTreeId, setAddTreeId] = React.useState<string>('');
  const [addFace, setAddFace] = React.useState<string>('1');
  const [addPosition, setAddPosition] = React.useState<string>('1');
  const [isHeatTolerant, setIsHeatTolerant] = React.useState(false);
  const [addGenus, setAddGenus] = React.useState('');
  const [addSpecies, setAddSpecies] = React.useState('');


  // State for Browse section
  const [browseSiteId, setBrowseSiteId] = React.useState<string>('');
  const [browseTreeId, setBrowseTreeId] = React.useState<string>('');
  
  // State for Move Modal
  const [movingBranch, setMovingBranch] = React.useState<CoralBranch | null>(null);
  const [quickMoveId, setQuickMoveId] = React.useState('');
  
  React.useEffect(() => {
    if (initialBranchToMove) {
        setMovingBranch(initialBranchToMove);
    }
  }, [initialBranchToMove]);

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    const faceNum = parseInt(addFace, 10);
    const posNum = parseInt(addPosition, 10);

    if (!addSiteId || !addTreeId || !addGenus.trim() || !addSpecies.trim() || isNaN(faceNum) || isNaN(posNum)) {
      alert('Please fill out all fields correctly.');
      return;
    }
    
    const tree = activeTrees.find(t => t.id === addTreeId);
    if (!tree) return;

    const isOccupied = branches.some(b => b.tree === tree.number && b.face === faceNum && b.position === posNum);

    if (isOccupied) {
      alert(`Position ${posNum} on Face ${faceNum} of Tree #${tree.number} is already occupied.`);
      return;
    }

    if (faceNum < 1 || faceNum > 4) {
        alert('Face must be between 1 and 4.');
        return;
    }
     if (posNum < 1 || posNum > 10) {
        alert('Position must be between 1 and 10.');
        return;
    }

    onAddBranch(addSiteId, addTreeId, faceNum as 1 | 2 | 3 | 4, posNum, isHeatTolerant, addGenus.trim(), addSpecies.trim());

    // Reset form
    setAddFace('1');
    setAddPosition('1');
    setIsHeatTolerant(false);
    setAddGenus('');
    setAddSpecies('');
  };

  const handleQuickMoveSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickMoveId.trim()) return;
    const foundBranch = branches.find(b => b.fragmentId.toLowerCase() === quickMoveId.trim().toLowerCase());
    if (foundBranch) {
      setMovingBranch(foundBranch);
    } else {
      alert('Branch ID not found in active branches.');
    }
    setQuickMoveId('');
  };

  const addAnchors = addSiteId ? activeAnchors.filter(a => a.siteId === addSiteId) : [];
  const addTrees = addSiteId ? activeTrees.filter(t => addAnchors.some(a => a.id === t.anchorId)) : [];
  
  const browseAnchors = browseSiteId ? activeAnchors.filter(a => a.siteId === browseSiteId) : [];
  const browseTrees = browseSiteId ? activeTrees.filter(t => browseAnchors.some(a => a.id === t.anchorId)) : [];

  const branchesOnSelectedTree = React.useMemo(() => {
    const treeData = activeTrees.find(t => t.id === browseTreeId);
    if (!treeData) return [];

    const site = activeSites.find(s => browseAnchors.some(a => a.id === treeData.anchorId && a.siteId === s.id));
    if (!site) return [];

    const treeBranches = branches.filter(b => b.tree === treeData.number && b.site === site.name);
    const faces: { [key: number]: CoralBranch[] } = {};
    
    treeBranches.forEach(branch => {
        if (!faces[branch.face]) {
            faces[branch.face] = [];
        }
        faces[branch.face].push(branch);
    });

    Object.values(faces).forEach(faceBranches => {
        faceBranches.sort((a, b) => a.position - b.position);
    });
    
    return Object.entries(faces).sort(([a], [b]) => Number(a) - Number(b));
  }, [browseTreeId, branches, activeTrees, activeSites, browseAnchors]);

  return (
    <>
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg space-y-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b pb-4">
            <h2 className="text-2xl font-bold text-deep-sea mb-2 sm:mb-0">Manage Branches</h2>
            <button
                onClick={onNavigateBack}
                className="bg-gray-200 hover:bg-gray-300 text-deep-sea font-bold py-2 px-4 rounded-lg transition-colors duration-200 self-start sm:self-center"
            >
                &larr; Back to Add/Edit Items
            </button>
        </div>

        <form onSubmit={handleQuickMoveSearch} className="p-4 border rounded-lg space-y-2 bg-gray-50">
            <h3 className="font-semibold text-gray-700">Quick access - Move Branch</h3>
            <div className="flex gap-2">
                <input
                type="text"
                value={quickMoveId}
                onChange={(e) => setQuickMoveId(e.target.value)}
                placeholder="e.g., M1-A-PALMATA"
                className="flex-grow block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900"
                />
                <button type="submit" className="bg-ocean-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors">Find &amp; Move</button>
            </div>
        </form>

        {/* Add New Branch Form */}
        <form onSubmit={handleAddSubmit} className="p-4 border rounded-lg space-y-4 bg-gray-50">
            <h3 className="font-semibold text-gray-700 text-lg">Add New Branch</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                <div>
                    <label htmlFor="addSite" className="block text-sm font-medium text-gray-700">Site</label>
                    <select id="addSite" value={addSiteId} onChange={e => { setAddSiteId(e.target.value); setAddTreeId(''); }} required className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900">
                        <option value="">-- Choose site --</option>
                        {activeSites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="addTree" className="block text-sm font-medium text-gray-700">Tree</label>
                    <select id="addTree" value={addTreeId} onChange={e => setAddTreeId(e.target.value)} required disabled={!addSiteId} className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white disabled:bg-gray-100 text-gray-900">
                        <option value="">-- Choose tree --</option>
                        {addTrees.map(t => <option key={t.id} value={t.id}>Tree #{t.number}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="addGenus" className="block text-sm font-medium text-gray-700">Genus</label>
                    <input type="text" id="addGenus" value={addGenus} onChange={e => setAddGenus(e.target.value)} required placeholder="e.g., Acropora" className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900"/>
                </div>
                <div>
                    <label htmlFor="addSpecies" className="block text-sm font-medium text-gray-700">Species</label>
                    <input type="text" id="addSpecies" value={addSpecies} onChange={e => setAddSpecies(e.target.value)} required placeholder="e.g., palmata" className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900"/>
                </div>
                <div>
                    <label htmlFor="addFace" className="block text-sm font-medium text-gray-700">Face (1-4)</label>
                    <input type="number" id="addFace" value={addFace} onChange={e => setAddFace(e.target.value)} required min="1" max="4" className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900"/>
                </div>
                <div>
                    <label htmlFor="addPosition" className="block text-sm font-medium text-gray-700">Position (1-10)</label>
                    <input type="number" id="addPosition" value={addPosition} onChange={e => setAddPosition(e.target.value)} required min="1" max="10" className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900"/>
                </div>
                 <div className="md:col-span-full flex items-center gap-2 pt-2">
                    <input type="checkbox" id="isHeatTolerant" checked={isHeatTolerant} onChange={e => setIsHeatTolerant(e.target.checked)} className="h-4 w-4 rounded border border-ocean-blue text-ocean-blue focus:ring-ocean-blue"/>
                    <label htmlFor="isHeatTolerant" className="font-medium text-gray-700">Known heat tolerant colony</label>
                </div>
            </div>
             <div className="flex justify-end pt-2">
                <button type="submit" disabled={!addTreeId} className="bg-ocean-blue hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 disabled:bg-gray-400">
                  Add Branch
                </button>
            </div>
        </form>

        {/* Browse Branches */}
        <div className="pt-4 border-t">
            <h3 className="font-semibold text-gray-700 text-lg mb-4">Browse Branches on a Tree</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end p-4 border rounded-lg bg-gray-50 mb-6">
                 <div>
                    <label htmlFor="browseSite" className="block text-sm font-medium text-gray-700">Site</label>
                    <select id="browseSite" value={browseSiteId} onChange={e => { setBrowseSiteId(e.target.value); setBrowseTreeId(''); }} className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900">
                        <option value="">-- Choose site --</option>
                        {activeSites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="browseTree" className="block text-sm font-medium text-gray-700">Tree</label>
                    <select id="browseTree" value={browseTreeId} onChange={e => setBrowseTreeId(e.target.value)} disabled={!browseSiteId} className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white disabled:bg-gray-100 text-gray-900">
                        <option value="">-- Choose tree to view branches --</option>
                        {browseTrees.map(t => <option key={t.id} value={t.id}>Tree #{t.number}</option>)}
                    </select>
                </div>
            </div>
            
             {browseTreeId && (
                <div className="space-y-4">
                {branchesOnSelectedTree.length > 0 ? branchesOnSelectedTree.map(([face, faceBranches]) => (
                    <div key={face}>
                        <h4 className="font-medium bg-gray-100 p-2 rounded-t-md text-deep-sea">Face {face}</h4>
                        <div className="border border-t-0 rounded-b-md">
                          <ul className="divide-y divide-gray-200">
                            {faceBranches.map(branch => {
                                const latestReport = [...branch.healthReports].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                                const age = formatAge(calculateAgeInDays(branch.dateAdded));
                                const healthColor = latestReport ? getHealthStatusColor(latestReport.healthPercentage) : 'bg-gray-300';
                                
                                return (
                                    <li key={branch.id} className="p-3 flex items-start justify-between gap-2">
                                        <button onClick={() => onSelectBranch(branch.id)} className="w-full flex items-start gap-4 text-left hover:bg-ocean-blue/5 rounded-lg p-1">
                                            <img src={branch.photos.find(p=>p.isMain)?.url || 'https://picsum.photos/200'} alt={branch.fragmentId} className="w-20 h-20 object-cover rounded-md flex-shrink-0"/>
                                            <div className="flex-grow">
                                                <p className="font-semibold text-deep-sea">{branch.fragmentId}</p>
                                                <p className="text-sm text-gray-600">Face {branch.face} - Position {branch.position}</p>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                   <span>Age: {age}</span>
                                                   <div className={`w-3 h-3 rounded-full flex-shrink-0 ${healthColor}`}></div>
                                                </div>
                                                <p className="text-xs text-gray-500 italic">{branch.genus} {branch.species}</p>
                                                 {latestReport?.notes && (
                                                     <p className="text-xs text-gray-500 mt-1 pt-1 border-t border-gray-200">
                                                        <span className="font-semibold">Note:</span> {latestReport.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => setMovingBranch(branch)}
                                            className="flex-shrink-0 bg-gray-200 hover:bg-gray-300 text-deep-sea font-bold py-1 px-3 rounded-lg text-xs self-center"
                                        >
                                            Move
                                        </button>
                                    </li>
                                );
                            })}
                          </ul>
                        </div>
                    </div>
                )) : (
                    <p className="text-center text-gray-500 py-8">No branches found on this tree.</p>
                )}
                </div>
            )}
        </div>
    </div>
    {movingBranch && (
        <MoveBranchModal
            branch={movingBranch}
            branches={branches}
            activeTrees={activeTrees}
            activeSites={activeSites}
            activeAnchors={activeAnchors}
            onClose={() => setMovingBranch(null)}
            onMoveBranch={onMoveBranch}
        />
    )}
    </>
  );
};

export default BranchesPage;