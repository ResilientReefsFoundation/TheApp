import * as React from 'react';
import type { FormEvent } from 'react';
import type { Site, Anchor, Tree, CoralBranch } from '../types';

interface MoveItemsPageProps {
    activeSites: Site[];
    activeAnchors: Anchor[];
    activeTrees: Tree[];
    activeBranches: CoralBranch[];
    onMoveTree: (treeId: string, newAnchorId: string) => void;
    onMoveBranch: (branchId: string, newTreeId: string, newFace: 1 | 2 | 3 | 4, newPosition: number) => void;
    onNavigateBack: () => void;
}

const MoveItemsPage: React.FC<MoveItemsPageProps> = ({
    activeSites,
    activeAnchors,
    activeTrees,
    activeBranches,
    onMoveTree,
    onMoveBranch,
    onNavigateBack
}) => {
    // State for Move Tree form
    const [moveTreeId, setMoveTreeId] = React.useState('');
    const [newAnchorId, setNewAnchorId] = React.useState('');

    // State for Move Branch form
    const [moveBranchId, setMoveBranchId] = React.useState('');
    const [newTreeId, setNewTreeId] = React.useState('');
    const [newFace, setNewFace] = React.useState('1');
    const [newPosition, setNewPosition] = React.useState('1');

    const handleMoveTreeSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!moveTreeId || !newAnchorId) {
            alert('Please select a tree and a new anchor.');
            return;
        }
        onMoveTree(moveTreeId, newAnchorId);
        setMoveTreeId('');
        setNewAnchorId('');
    };
    
    const handleMoveBranchSubmit = (e: FormEvent) => {
        e.preventDefault();
        const faceNum = parseInt(newFace, 10);
        const posNum = parseInt(newPosition, 10);

        if (!moveBranchId || !newTreeId || isNaN(faceNum) || isNaN(posNum)) {
            alert('Please fill out all fields correctly.');
            return;
        }
        
        if (faceNum < 1 || faceNum > 4 || posNum < 1 || posNum > 10) {
            alert('Face must be 1-4 and Position must be 1-10.');
            return;
        }

        onMoveBranch(moveBranchId, newTreeId, faceNum as 1 | 2 | 3 | 4, posNum);

        setMoveBranchId('');
        setNewTreeId('');
        setNewFace('1');
        setNewPosition('1');
    };

    return (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg space-y-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b pb-4">
                <h2 className="text-2xl font-bold text-deep-sea mb-2 sm:mb-0">Move Items</h2>
                <button
                    onClick={onNavigateBack}
                    className="bg-gray-200 hover:bg-gray-300 text-deep-sea font-bold py-2 px-4 rounded-lg transition-colors duration-200 self-start sm:self-center"
                >
                    &larr; Back to Add/Edit/Move Items
                </button>
            </div>

            {/* Move Tree Form */}
            <form onSubmit={handleMoveTreeSubmit} className="p-4 border rounded-lg space-y-4 bg-gray-50">
                <h3 className="font-semibold text-gray-700 text-lg">Move a Tree</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label htmlFor="treeToMove" className="block text-sm font-medium text-gray-700">Tree to Move</label>
                        <select id="treeToMove" value={moveTreeId} onChange={e => setMoveTreeId(e.target.value)} required className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900">
                            <option value="">-- Select Tree --</option>
                            {activeTrees.map(t => <option key={t.id} value={t.id}>Tree #{t.number}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="newAnchor" className="block text-sm font-medium text-gray-700">New Anchor</label>
                        <select id="newAnchor" value={newAnchorId} onChange={e => setNewAnchorId(e.target.value)} required className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900">
                            <option value="">-- Select Anchor --</option>
                            {activeAnchors.map(a => <option key={a.id} value={a.id}>{a.name} ({activeSites.find(s=>s.id === a.siteId)?.name})</option>)}
                        </select>
                    </div>
                    <button type="submit" className="bg-ocean-blue hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200">
                        Move Tree
                    </button>
                </div>
            </form>

            {/* Move Branch Form */}
            <form onSubmit={handleMoveBranchSubmit} className="p-4 border rounded-lg space-y-4 bg-gray-50">
                <h3 className="font-semibold text-gray-700 text-lg">Move a Branch</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label htmlFor="branchToMove" className="block text-sm font-medium text-gray-700">Branch to Move</label>
                        <select id="branchToMove" value={moveBranchId} onChange={e => setMoveBranchId(e.target.value)} required className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900">
                            <option value="">-- Select Branch --</option>
                            {activeBranches.sort((a,b) => a.fragmentId.localeCompare(b.fragmentId, undefined, {numeric: true})).map(b => <option key={b.id} value={b.id}>{b.fragmentId}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="newTree" className="block text-sm font-medium text-gray-700">New Tree</label>
                        <select id="newTree" value={newTreeId} onChange={e => setNewTreeId(e.target.value)} required className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900">
                            <option value="">-- Select Tree --</option>
                            {activeTrees.map(t => <option key={t.id} value={t.id}>Tree #{t.number} ({activeSites.find(s=>s.id === activeAnchors.find(a=>a.id === t.anchorId)?.siteId)?.name})</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="newFace" className="block text-sm font-medium text-gray-700">New Face (1-4)</label>
                        <input type="number" id="newFace" value={newFace} onChange={e => setNewFace(e.target.value)} required min="1" max="4" className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900"/>
                    </div>
                     <div>
                        <label htmlFor="newPosition" className="block text-sm font-medium text-gray-700">New Position (1-10)</label>
                        <input type="number" id="newPosition" value={newPosition} onChange={e => setNewPosition(e.target.value)} required min="1" max="10" className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900"/>
                    </div>
                </div>
                <div className="flex justify-end pt-2">
                    <button type="submit" className="bg-ocean-blue hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200">
                        Move Branch
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MoveItemsPage;