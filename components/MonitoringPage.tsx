import * as React from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import type { CoralBranch, Site, Tree, HealthReport, BleachingLevel, Anchor, MaintenanceLog } from '../types';
import { CloseIcon } from './Icons';

const HEALTH_STATUSES = [
  { name: '100%', value: 100, color: 'bg-green-500', ringColor: 'ring-green-500' },
  { name: '75%', value: 75, color: 'bg-yellow-400', ringColor: 'ring-yellow-400' },
  { name: '50%', value: 50, color: 'bg-orange-400', ringColor: 'ring-orange-400' },
  { name: '25%', value: 25, color: 'bg-orange-600', ringColor: 'ring-orange-600' },
  { name: '0%', value: 0, color: 'bg-red-500', ringColor: 'ring-red-500' },
];

const REASON_OPTIONS = [
  'Minor damage',
  'Few dead tips',
  'Algae',
  'Hydroids',
  'Light predation',
  'Heavy predation',
  'Broken',
  'Rapid tissue necrosis',
  'Pests',
  'Unknown',
];

const TREE_MAINTENANCE_TASKS = {
    cleanedTree: 'Cleaned tree',
    tightenedTies: 'Added/tightened cable ties',
    scrubbedFloats: 'Scrubbed floats',
};

const BRANCH_MAINTENANCE_TASKS = {
    snippedTips: 'Snipped off bad tips',
    removedAlgae: 'Removed algae',
    cleanedPredation: 'Cleaned predation marks',
};

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


interface MonitoringPageProps {
  branches: CoralBranch[];
  sites: Site[];
  trees: Tree[];
  anchors: Anchor[];
  onAddHealthReport: (branchId: string, newReportData: Omit<HealthReport, 'id'>, showAlert?: boolean) => void;
  onNavigateBack: () => void;
  onSelectBranch: (branchId: string) => void;
  onLogMaintenance: (logData: Omit<MaintenanceLog, 'id' | 'timestamp'>) => void;
}

const MonitoringPage: React.FC<MonitoringPageProps> = ({
  branches,
  sites: activeSites,
  trees: activeTrees,
  anchors: activeAnchors,
  onAddHealthReport,
  onNavigateBack,
  onSelectBranch,
  onLogMaintenance
}) => {
  const [activeTab, setActiveTab] = React.useState<'monitoring' | 'maintenance'>('monitoring');
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = React.useState(false);
  const [mode, setMode] = React.useState<'individual' | 'bulk'>('individual');
  const [selectedSite, setSelectedSite] = React.useState<string>('');
  const [selectedTree, setSelectedTree] = React.useState<string>('');
  const [quickAccessId, setQuickAccessId] = React.useState('');
  const [selectedBranch, setSelectedBranch] = React.useState<CoralBranch | null>(null);
  
  // State for bulk reporting
  const [pendingReports, setPendingReports] = React.useState<Map<string, number>>(new Map());
  const [savedReports, setSavedReports] = React.useState<Set<string>>(new Set());

  // State for individual reporting form
  const [healthPercentage, setHealthPercentage] = React.useState(100);
  const [bleachingLevel, setBleachingLevel] = React.useState<BleachingLevel>('None');
  const [notes, setNotes] = React.useState('');
  const notesRef = React.useRef<HTMLTextAreaElement>(null);

  // State for maintenance form
  const [maintenanceTarget, setMaintenanceTarget] = React.useState<'Tree' | 'Branch'>('Tree');
  const [maintenanceSiteId, setMaintenanceSiteId] = React.useState<string>('');
  const [maintenanceTreeId, setMaintenanceTreeId] = React.useState<string>('');
  const [maintenanceBranchId, setMaintenanceBranchId] = React.useState<string>('');
  const [treeTasks, setTreeTasks] = React.useState({ cleanedTree: false, tightenedTies: false, scrubbedFloats: false });
  const [branchTasks, setBranchTasks] = React.useState({ snippedTips: false, removedAlgae: false, cleanedPredation: false });
  const [maintenanceNotes, setMaintenanceNotes] = React.useState('');


  const handleQuickAccessSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!quickAccessId.trim()) return;
    const foundBranch = branches.find(b => b.fragmentId.toLowerCase() === quickAccessId.trim().toLowerCase());
    if (foundBranch) {
        onSelectBranch(foundBranch.id);
    } else {
        alert('Branch ID not found in active branches.');
    }
    setQuickAccessId('');
  };

  const handleTreeSelection = (treeId: string) => {
    setSelectedTree(treeId);
    setSelectedBranch(null);
  };

  const handleReportSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (selectedBranch) {
      onAddHealthReport(selectedBranch.id, {
        date: new Date().toISOString(),
        healthPercentage: Number(healthPercentage),
        notes,
        bleaching: bleachingLevel,
      }, true);
      // Reset form
      setSelectedBranch(null);
      setHealthPercentage(100);
      setNotes('');
      setBleachingLevel('None');
    }
  };

  const handleReasonChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'add-new') {
        setNotes('');
        notesRef.current?.focus();
    } else {
        setNotes(value);
    }
  }

  const handleBulkSelection = (branchId: string, healthValue: number) => {
    setPendingReports(prev => {
        const newMap = new Map(prev);
        newMap.set(branchId, healthValue);
        return newMap;
    });
  };

  const handleSaveBulkReports = () => {
    if (pendingReports.size === 0) return;
    
    pendingReports.forEach((healthValue, branchId) => {
        onAddHealthReport(branchId, {
            date: new Date().toISOString(),
            healthPercentage: healthValue,
            notes: 'Bulk health assessment.',
            bleaching: 'None'
        }, false);
    });
    
    alert(`${pendingReports.size} health report(s) saved successfully!`);
    
    const savedIds = new Set(pendingReports.keys());
    setSavedReports(savedIds);
    setPendingReports(new Map());

    // Flash the black ring and then clear
    setTimeout(() => {
        setSavedReports(new Set());
    }, 1000);
  };

  const handleSaveMaintenance = (e: FormEvent) => {
      e.preventDefault();
      
      let selectedTasks: string[] = [];
      if (maintenanceTarget === 'Tree') {
           selectedTasks = Object.entries(treeTasks)
              .filter(([,v]) => v)
              .map(([k]) => TREE_MAINTENANCE_TASKS[k as keyof typeof TREE_MAINTENANCE_TASKS]);
      } else {
           selectedTasks = Object.entries(branchTasks)
              .filter(([,v]) => v)
              .map(([k]) => BRANCH_MAINTENANCE_TASKS[k as keyof typeof BRANCH_MAINTENANCE_TASKS]);
      }

      if (!maintenanceSiteId || !maintenanceTreeId || (maintenanceTarget === 'Branch' && !maintenanceBranchId) || selectedTasks.length === 0) {
          alert('Please fill out all required fields and select at least one task.');
          return;
      }
      
      onLogMaintenance({
          siteId: maintenanceSiteId,
          treeId: maintenanceTreeId,
          branchId: maintenanceTarget === 'Branch' ? maintenanceBranchId : undefined,
          target: maintenanceTarget,
          tasks: selectedTasks,
          notes: maintenanceNotes.trim()
      });

      // Reset form and close modal
      setMaintenanceSiteId('');
      setMaintenanceTreeId('');
      setMaintenanceBranchId('');
      setMaintenanceTarget('Tree');
      setTreeTasks({ cleanedTree: false, tightenedTies: false, scrubbedFloats: false });
      setBranchTasks({ snippedTips: false, removedAlgae: false, cleanedPredation: false });
      setMaintenanceNotes('');
      setIsMaintenanceModalOpen(false);
      setActiveTab('monitoring');
  };
  
  React.useEffect(() => {
    if (selectedBranch) {
        setHealthPercentage(100);
        setNotes('');
        setBleachingLevel('None');
    }
  }, [selectedBranch]);

  const branchesOnSelectedTree = React.useMemo(() => {
    const treeData = activeTrees.find(t => t.id === selectedTree);
    if (!treeData) return [];
    
    const treeBranches = branches.filter(b => b.tree === treeData.number && b.site === activeSites.find(s => s.id === selectedSite)?.name);
    
    // Sort by face, then by position
    return treeBranches.sort((a, b) => {
        if (a.face !== b.face) {
            return a.face - b.face;
        }
        return a.position - b.position;
    });
  }, [selectedTree, selectedSite, branches, activeTrees, activeSites]);
  
  const branchesOnMaintenanceTree = React.useMemo(() => {
    const treeData = activeTrees.find(t => t.id === maintenanceTreeId);
    const siteData = activeSites.find(s => s.id === maintenanceSiteId);
    if (!treeData || !siteData) return [];
    
    return branches.filter(b => b.tree === treeData.number && b.site === siteData.name)
        .sort((a, b) => a.fragmentId.localeCompare(b.fragmentId));
  }, [maintenanceTreeId, maintenanceSiteId, branches, activeTrees, activeSites]);


  const handleSiteSelection = (siteId: string) => {
      setSelectedSite(siteId);
      setSelectedTree('');
      setSelectedBranch(null);
      setPendingReports(new Map());
      setSavedReports(new Set());
  }

  const handleTabClick = (tab: 'monitoring' | 'maintenance') => {
      setActiveTab(tab);
      if (tab === 'maintenance') {
          setIsMaintenanceModalOpen(true);
      }
  }

  const treesForSelectedSite = React.useMemo(() => {
    if (!selectedSite) return [];
    const siteAnchors = activeAnchors.filter(a => a.siteId === selectedSite);
    const siteAnchorIds = new Set(siteAnchors.map(a => a.id));
    return activeTrees.filter(tree => siteAnchorIds.has(tree.anchorId));
  }, [selectedSite, activeAnchors, activeTrees]);

  const maintenanceTreesForSite = React.useMemo(() => {
      if (!maintenanceSiteId) return [];
      const siteAnchors = activeAnchors.filter(a => a.siteId === maintenanceSiteId);
      const siteAnchorIds = new Set(siteAnchors.map(a => a.id));
      return activeTrees.filter(tree => siteAnchorIds.has(tree.anchorId));
  }, [maintenanceSiteId, activeAnchors, activeTrees]);
   
   const atLeastOneTaskSelected = maintenanceTarget === 'Tree' ? Object.values(treeTasks).some(v => v) : Object.values(branchTasks).some(v => v);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b pb-4">
        <h2 className="text-2xl font-bold text-deep-sea mb-2 sm:mb-0">Monitoring/Maintenance</h2>
        <button
          onClick={onNavigateBack}
          className="bg-gray-200 hover:bg-gray-300 text-deep-sea font-bold py-2 px-4 rounded-lg transition-colors duration-200 self-start sm:self-center"
        >
          &larr; Back to Details
        </button>
      </div>

       <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
          <button
            onClick={() => handleTabClick('monitoring')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'monitoring'
                ? 'border-ocean-blue text-ocean-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Monitoring
          </button>
          <button
            onClick={() => handleTabClick('maintenance')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'maintenance'
                ? 'border-ocean-blue text-ocean-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Maintenance
          </button>
        </nav>
      </div>
      
      {mode === 'individual' && (
        <>
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="font-semibold text-gray-700 mb-2">Quick access - Enter Branch number</h3>
            <form onSubmit={handleQuickAccessSearch} className="flex gap-2">
              <input
                type="text"
                value={quickAccessId}
                onChange={(e) => setQuickAccessId(e.target.value)}
                placeholder="e.g., M1-A-PALMATA"
                className="flex-grow block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900"
              />
              <button type="submit" className="bg-ocean-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors">Go</button>
            </form>
          </div>
          
           <div className="text-center">
                <button
                    onClick={() => setMode('bulk')}
                    className="text-ocean-blue hover:underline font-semibold"
                >
                    Click here for entering bulk health reports
                </button>
            </div>

          {/* Selection Area */}
          <div className="p-4 border rounded-lg space-y-4 bg-gray-50">
            <h3 className="font-semibold text-gray-700 text-lg">Select a Branch by Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="siteSelect" className="block text-sm font-medium text-gray-700">1. Select Site</label>
                <select id="siteSelect" value={selectedSite} onChange={e => handleSiteSelection(e.target.value)} className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900">
                  <option value="">-- Choose a site --</option>
                  {activeSites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="treeSelect" className="block text-sm font-medium text-gray-700">2. Select Tree</label>
                <select id="treeSelect" value={selectedTree} onChange={e => handleTreeSelection(e.target.value)} disabled={!selectedSite} className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white disabled:bg-gray-100 text-gray-900">
                  <option value="">-- Choose a tree --</option>
                  {treesForSelectedSite.map(t => <option key={t.id} value={t.id}>Tree #{t.number}</option>)}
                </select>
              </div>
            </div>
          </div>
          
          {selectedTree && !selectedBranch && (
             <div className="space-y-4 pt-4 border-t">
               <h3 className="font-semibold text-gray-700 text-lg">Select a branch from Tree #{activeTrees.find(t=>t.id === selectedTree)?.number}</h3>
                <div className="border rounded-md max-h-96 overflow-y-auto">
                  <ul className="divide-y divide-gray-200">
                    {branchesOnSelectedTree.map(branch => {
                        const latestReport = [...branch.healthReports].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                        const age = formatAge(calculateAgeInDays(branch.dateAdded));
                        const healthColor = latestReport ? getHealthStatusColor(latestReport.healthPercentage) : 'bg-gray-300';

                        return (
                            <li key={branch.id}>
                                <button onClick={() => setSelectedBranch(branch)} className="w-full flex items-start gap-4 p-3 text-left hover:bg-ocean-blue/10 transition-colors">
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
                            </li>
                        );
                    })}
                  </ul>
                </div>
            </div>
          )}

          {selectedBranch && (
            <form onSubmit={handleReportSubmit} className="space-y-6 pt-4 border-t border-seafoam-green">
              <h3 className="font-semibold text-gray-700 text-lg">New Health Report for: <span className="text-ocean-blue">{selectedBranch.fragmentId}</span></h3>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Health Status</label>
                  <div className="flex justify-between items-center gap-1 sm:gap-2">
                    {HEALTH_STATUSES.map(status => (
                        <button
                            type="button"
                            key={status.name}
                            onClick={() => setHealthPercentage(status.value)}
                            className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full text-xs sm:text-sm font-bold transition-all transform hover:scale-105 focus:outline-none ${
                                healthPercentage === status.value
                                ? `${status.color} text-white ring-2 ${status.ringColor} ring-offset-2`
                                : `bg-gray-200 text-gray-700 hover:bg-gray-300`
                            }`}
                        >
                            {status.name}
                        </button>
                    ))}
                  </div>
              </div>
              <div>
                <label htmlFor="bleaching" className="block text-sm font-medium text-gray-700">Signs of Bleaching</label>
                <select
                    id="bleaching"
                    value={bleachingLevel}
                    onChange={e => setBleachingLevel(e.target.value as BleachingLevel)}
                    className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900"
                >
                    <option value="None">None</option>
                    <option value="Mild">Mild</option>
                    <option value="Medium">Medium</option>
                    <option value="Strong">Strong</option>
                </select>
              </div>
              <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason for Change</label>
                  <select 
                    id="reason"
                    onChange={handleReasonChange}
                    className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900"
                  >
                    <option value="">-- Select a reason (optional) --</option>
                    {REASON_OPTIONS.map(reason => (
                        <option key={reason} value={reason}>{reason}</option>
                    ))}
                    <option value="add-new">Add New Reason...</option>
                  </select>
              </div>
              <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea 
                    id="notes"
                    ref={notesRef}
                    rows={3}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900"
                    placeholder="e.g., Good coloration, no signs of stress."
                  />
              </div>
              <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setSelectedBranch(null)} className="bg-gray-200 hover:bg-gray-300 text-deep-sea font-bold py-2 px-4 rounded-lg">
                        Cancel
                    </button>
                    <button type="submit" className="bg-seafoam-green text-deep-sea font-bold py-2 px-4 rounded-lg">
                        Submit Report
                    </button>
              </div>
            </form>
          )}
        </>
      )}

      {mode === 'bulk' && (
        <div className="space-y-6">
          <button
            onClick={() => setMode('individual')}
            className="text-ocean-blue hover:underline font-semibold"
          >
           &larr; Go back to Individual Report
          </button>
          <div className="p-4 border rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50">
             <div>
              <label htmlFor="bulkSiteSelect" className="block text-sm font-medium text-gray-700">1. Select Site</label>
              <select id="bulkSiteSelect" value={selectedSite} onChange={e => handleSiteSelection(e.target.value)} className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900">
                <option value="">-- Choose a site --</option>
                {activeSites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="bulkTreeSelect" className="block text-sm font-medium text-gray-700">2. Select Tree</label>
              <select id="bulkTreeSelect" value={selectedTree} onChange={e => setSelectedTree(e.target.value)} disabled={!selectedSite} className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white disabled:bg-gray-100 text-gray-900">
                <option value="">-- Choose a tree --</option>
                 {treesForSelectedSite.map(t => <option key={t.id} value={t.id}>Tree #{t.number}</option>)}
              </select>
            </div>
          </div>

          {selectedTree && (
            <div className="pt-4 border-t">
               <h3 className="font-semibold text-gray-700 text-lg mb-4">Branches on Tree #{activeTrees.find(t=>t.id === selectedTree)?.number}</h3>
               <div className="border rounded-md max-h-[60vh] overflow-y-auto">
                 <ul className="divide-y divide-gray-200">
                   {branchesOnSelectedTree.map(branch => {
                     const pendingValue = pendingReports.get(branch.id);
                     const isSaved = savedReports.has(branch.id);
                     const latestReport = [...branch.healthReports].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                     const age = formatAge(calculateAgeInDays(branch.dateAdded));
                     const healthColor = latestReport ? getHealthStatusColor(latestReport.healthPercentage) : 'bg-gray-300';
                     return (
                       <li key={branch.id} className="p-3 flex items-start justify-between gap-4">
                         <div className="flex items-start gap-3 flex-grow">
                            <img src={branch.photos.find(p=>p.isMain)?.url || 'https://picsum.photos/200'} alt={branch.fragmentId} className="w-16 h-16 object-cover rounded-md flex-shrink-0"/>
                            <div>
                                <p className="font-semibold text-deep-sea">{branch.fragmentId}</p>
                                <p className="text-sm text-gray-500">Face {branch.face} - Position {branch.position}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <span>Age: {age}</span>
                                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${healthColor}`}></div>
                                </div>
                                <p className="text-xs text-gray-500 italic mt-1">{branch.genus} {branch.species}</p>
                                {latestReport?.notes && (
                                     <p className="text-xs text-gray-500 mt-1 pt-1 border-t border-gray-200 max-w-xs truncate">
                                        <span className="font-semibold">Note:</span> {latestReport.notes}
                                    </p>
                                )}
                            </div>
                        </div>
                         <div className="flex gap-2 items-center flex-shrink-0">
                           {HEALTH_STATUSES.map(status => (
                               <button
                                   key={status.value}
                                   onClick={() => handleBulkSelection(branch.id, status.value)}
                                   className={`w-8 h-8 rounded-full ${status.color} transition-all duration-200 transform hover:scale-110 focus:outline-none 
                                   ${pendingValue === status.value ? 'ring-2 ring-blue-500 ring-offset-2 scale-110' : ''}
                                   ${isSaved && pendingReports.get(branch.id) === status.value ? 'ring-2 ring-black ring-offset-2' : ''}
                                   `}
                                   title={status.name}
                                   aria-label={`Set health to ${status.name}`}
                               />
                           ))}
                         </div>
                       </li>
                     );
                   })}
                 </ul>
               </div>
                {pendingReports.size > 0 && (
                    <div className="flex justify-end mt-4">
                        <button onClick={handleSaveBulkReports} className="bg-seafoam-green text-deep-sea font-bold py-2 px-6 rounded-lg">
                            Save {pendingReports.size} Report(s)
                        </button>
                    </div>
                )}
            </div>
          )}
        </div>
      )}
      
       {isMaintenanceModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={() => { setIsMaintenanceModalOpen(false); setActiveTab('monitoring'); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSaveMaintenance}>
                <header className="p-4 border-b flex justify-between items-center">
                  <h2 className="text-xl font-bold text-deep-sea">Log Maintenance Activity</h2>
                  <button type="button" onClick={() => { setIsMaintenanceModalOpen(false); setActiveTab('monitoring'); }} className="text-gray-500 hover:text-gray-800">
                    <CloseIcon className="w-6 h-6"/>
                  </button>
                </header>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance Target</label>
                        <div className="flex gap-4">
                           <label className="flex items-center gap-2"><input type="radio" name="target" value="Tree" checked={maintenanceTarget==='Tree'} onChange={() => setMaintenanceTarget('Tree')} className="h-4 w-4 text-ocean-blue focus:ring-ocean-blue"/> Tree</label>
                           <label className="flex items-center gap-2"><input type="radio" name="target" value="Branch" checked={maintenanceTarget==='Branch'} onChange={() => setMaintenanceTarget('Branch')} className="h-4 w-4 text-ocean-blue focus:ring-ocean-blue"/> Branch</label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="maintenanceSite" className="block text-sm font-medium text-gray-700">Site</label>
                            <select id="maintenanceSite" value={maintenanceSiteId} onChange={e => { setMaintenanceSiteId(e.target.value); setMaintenanceTreeId(''); setMaintenanceBranchId(''); }} required className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900">
                                <option value="">-- Choose site --</option>
                                {activeSites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="maintenanceTree" className="block text-sm font-medium text-gray-700">Tree</label>
                            <select id="maintenanceTree" value={maintenanceTreeId} onChange={e => { setMaintenanceTreeId(e.target.value); setMaintenanceBranchId(''); }} required disabled={!maintenanceSiteId} className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white disabled:bg-gray-100 text-gray-900">
                                <option value="">-- Choose tree --</option>
                                {maintenanceTreesForSite.map(t => <option key={t.id} value={t.id}>Tree #{t.number}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    {maintenanceTarget === 'Branch' && (
                        <div>
                            <label htmlFor="maintenanceBranch" className="block text-sm font-medium text-gray-700">Branch</label>
                            <select id="maintenanceBranch" value={maintenanceBranchId} onChange={e => setMaintenanceBranchId(e.target.value)} required disabled={!maintenanceTreeId} className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white disabled:bg-gray-100 text-gray-900">
                                <option value="">-- Choose branch --</option>
                                {branchesOnMaintenanceTree.map(b => <option key={b.id} value={b.id}>{b.fragmentId}</option>)}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tasks Performed</label>
                        <div className="mt-2 space-y-2">
                           {maintenanceTarget === 'Tree' ? Object.entries(TREE_MAINTENANCE_TASKS).map(([key, label]) => (
                                <label key={key} className="flex items-center gap-2">
                                    <input type="checkbox" checked={treeTasks[key as keyof typeof treeTasks]} onChange={e => setTreeTasks(prev => ({...prev, [key]: e.target.checked}))} className="h-4 w-4 rounded border border-ocean-blue text-ocean-blue focus:ring-ocean-blue"/>
                                    <span>{label}</span>
                                </label>
                           )) : Object.entries(BRANCH_MAINTENANCE_TASKS).map(([key, label]) => (
                                <label key={key} className="flex items-center gap-2">
                                    <input type="checkbox" checked={branchTasks[key as keyof typeof branchTasks]} onChange={e => setBranchTasks(prev => ({...prev, [key]: e.target.checked}))} className="h-4 w-4 rounded border border-ocean-blue text-ocean-blue focus:ring-ocean-blue"/>
                                    <span>{label}</span>
                                </label>
                           ))}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="maintenanceNotes" className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                        <textarea
                            id="maintenanceNotes"
                            rows={3}
                            value={maintenanceNotes}
                            onChange={e => setMaintenanceNotes(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900"
                            placeholder="Add any extra details..."
                        />
                    </div>
                </div>
                 <footer className="p-4 bg-gray-50 rounded-b-2xl flex justify-end gap-2">
                     <button
                        type="button"
                        onClick={() => { setIsMaintenanceModalOpen(false); setActiveTab('monitoring'); }}
                        className="bg-gray-200 hover:bg-gray-300 text-deep-sea font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        Close
                      </button>
                      <button
                        type="submit"
                        disabled={!maintenanceSiteId || !maintenanceTreeId || (maintenanceTarget === 'Branch' && !maintenanceBranchId) || !atLeastOneTaskSelected}
                        className="bg-seafoam-green hover:bg-opacity-90 text-deep-sea font-bold py-2 px-4 rounded-lg transition-colors duration-200 disabled:bg-gray-300"
                      >
                        Save Maintenance Log
                      </button>
                </footer>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MonitoringPage;