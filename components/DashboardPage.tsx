import * as React from 'react';
import type { Reminder, CoralBranch, Site, Tree, ReminderStatus, CollectionZone } from '../types';
import { BellIcon, ChevronDownIcon, CloseIcon } from './Icons';

interface DashboardPageProps {
    reminders: Reminder[];
    branches: CoralBranch[];
    sites: Site[];
    trees: Tree[];
    zones: CollectionZone[];
    onSelectBranch: (branchId: string) => void;
}

interface StatCardProps {
  title: string;
  value: string | number;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, onClick }) => {
  const content = (
    <>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-deep-sea">{value}</p>
    </>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="bg-white p-4 rounded-lg shadow h-full w-full text-left hover:bg-gray-50 transition-colors">
        {content}
      </button>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow h-full">
      {content}
    </div>
  );
};

const StatCardModal: React.FC<{ title: string; items: string[]; onClose: () => void; }> = ({ title, items, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative" onClick={e => e.stopPropagation()}>
            <header className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-deep-sea">{title}</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                    <CloseIcon className="w-6 h-6"/>
                </button>
            </header>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
                <ul className="list-disc list-inside space-y-1">
                    {items.sort().map(item => <li key={item} className="text-gray-700">{item}</li>)}
                </ul>
            </div>
            <footer className="p-4 bg-gray-50 rounded-b-2xl text-right">
                <button onClick={onClose} className="bg-ocean-blue hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded-lg">Close</button>
            </footer>
        </div>
    </div>
);


const HEALTH_CATEGORIES = {
    '100%': { color: 'bg-green-500', label: '100%' },
    '75%': { color: 'bg-yellow-400', label: '75%' },
    '50%': { color: 'bg-orange-400', label: '50%' },
    '25%': { color: 'bg-orange-600', label: '25%' },
    '0%': { color: 'bg-red-500', label: '0%' },
};

type HealthStatus = keyof typeof HEALTH_CATEGORIES;

const getBranchStatus = (branch: CoralBranch): HealthStatus | null => {
    if (!branch.healthReports || branch.healthReports.length === 0) return null;

    const latestReport = [...branch.healthReports].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    const p = latestReport.healthPercentage;
    
    if (p > 87.5) return '100%';
    if (p > 62.5) return '75%';
    if (p > 37.5) return '50%';
    if (p > 0) return '25%';
    return '0%';
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


interface HealthStatusModalProps {
  site: Site;
  status: HealthStatus;
  branches: CoralBranch[];
  onClose: () => void;
  onSelectBranch: (branchId: string) => void;
}

const HealthStatusModal: React.FC<HealthStatusModalProps> = ({ site, status, branches, onClose, onSelectBranch }) => {
    const filteredBranches = React.useMemo(() => {
        return branches.filter(branch => {
            if (branch.site !== site.name) return false;
            const branchStatus = getBranchStatus(branch);
            return branchStatus === status;
        });
    }, [site, status, branches]);
    
    const handleBranchClick = (branchId: string) => {
        onSelectBranch(branchId);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-deep-sea">Branches at {site.name} ({status})</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <CloseIcon className="w-6 h-6"/>
                    </button>
                </header>
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {filteredBranches.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {filteredBranches.map(branch => {
                                const latestReport = [...branch.healthReports].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                                const age = formatAge(calculateAgeInDays(branch.dateAdded));
                                const healthColor = latestReport ? getHealthStatusColor(latestReport.healthPercentage) : 'bg-gray-300';
                                return (
                                    <li key={branch.id}>
                                        <button onClick={() => handleBranchClick(branch.id)} className="w-full flex items-start gap-4 p-3 text-left hover:bg-ocean-blue/10 transition-colors rounded-lg">
                                            <img 
                                                src={branch.photos.find(p => p.isMain)?.url || 'https://picsum.photos/200'} 
                                                alt={branch.fragmentId} 
                                                className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                                            />
                                            <div className="flex-grow">
                                                <p className="font-semibold text-deep-sea">{branch.fragmentId}</p>
                                                <p className="text-sm text-gray-600">Face {branch.face} - Position {branch.position}</p>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                   <span>Age: {age}</span>
                                                   <div className={`w-3 h-3 rounded-full flex-shrink-0 ${healthColor}`}></div>
                                                </div>
                                                <p className="text-xs italic text-gray-500">{branch.genus} {branch.species}</p>
                                                {latestReport?.notes && (
                                                    <p className="text-xs text-gray-500 mt-1 pt-1 border-t border-gray-200">
                                                        <span className="font-semibold">Latest Note:</span> {latestReport.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-500 py-8">No branches found with this health status.</p>
                    )}
                </div>
                 <footer className="p-4 bg-gray-50 rounded-b-2xl text-right">
                     <button
                        onClick={onClose}
                        className="bg-ocean-blue hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        Close
                      </button>
                </footer>
            </div>
        </div>
    );
};


const DashboardPage: React.FC<{
    reminders: Reminder[];
    branches: CoralBranch[];
    sites: Site[]; // Now activeSites
    trees: Tree[]; // Now activeTrees
    zones: CollectionZone[];
    onSelectBranch: (branchId: string) => void;
}> = ({
    reminders,
    branches,
    sites: activeSites,
    trees: activeTrees,
    zones,
    onSelectBranch
}) => {
    const [showReminders, setShowReminders] = React.useState(false);
    const [modalData, setModalData] = React.useState<{ site: Site; status: HealthStatus } | null>(null);
    const [branchIdInput, setBranchIdInput] = React.useState('');
    const [selectedSiteId, setSelectedSiteId] = React.useState<string>('');
    const [siteTasksModalOpen, setSiteTasksModalOpen] = React.useState(false);
    const [listModalContent, setListModalContent] = React.useState<{ title: string; items: string[] } | null>(null);

    const handleFindBranch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!branchIdInput.trim()) return;
        const foundBranch = branches.find(b => b.fragmentId.toLowerCase() === branchIdInput.trim().toLowerCase());
        if (foundBranch) {
            onSelectBranch(foundBranch.id);
        } else {
            alert('Branch ID not found in active branches.');
        }
        setBranchIdInput('');
    };
    
    const overdueReminders = React.useMemo(() => reminders.filter(r => r.status === 'overdue'), [reminders]);

    const nurseryStats = React.useMemo(() => {
        const uniqueGenera = Array.from(new Set(branches.map(b => b.genus).filter(g => g && g !== 'Unknown')));
        const uniqueSpecies = Array.from(new Set(branches.map(b => `${b.genus} ${b.species}`).filter(s => s && !s.includes('Unknown'))));
        return {
            totalBranches: branches.length,
            totalTrees: activeTrees.length,
            uniqueGenera,
            uniqueSpecies,
        }
    }, [branches, activeTrees]);

    const ageDistribution = React.useMemo(() => {
        const counts = {
            under6m: 0,
            upTo1y: 0,
            upTo3y: 0,
            upTo4y: 0,
            over4y: 0,
        };
        const now = new Date();
        
        branches.forEach(branch => {
            const addedDate = new Date(branch.dateAdded);
            const diffTime = now.getTime() - addedDate.getTime();
            const ageInDays = diffTime / (1000 * 60 * 60 * 24);

            if (ageInDays < 182.5) { // < 6 months
                counts.under6m++;
            } else if (ageInDays < 365) { // 6-12 months
                counts.upTo1y++;
            } else if (ageInDays < 3 * 365) { // 1-3 years
                counts.upTo3y++;
            } else if (ageInDays < 4 * 365) { // 3-4 years
                counts.upTo4y++;
            } else { // > 4 years
                counts.over4y++;
            }
        });
        return counts;
    }, [branches]);
    
    const reefContribution = React.useMemo(() => {
        const LARVAE_PER_BRANCH = 60000;
        // Updated calculation: 60,000 larvae per active branch.
        return (branches.length * LARVAE_PER_BRANCH).toLocaleString();
    }, [branches]);

    const healthBreakdown = React.useMemo(() => {
        const breakdown: { [siteId: string]: { [status in HealthStatus]: number } } = {};
        activeSites.forEach(site => {
            breakdown[site.id] = { '100%': 0, '75%': 0, '50%': 0, '25%': 0, '0%': 0 };
        });

        branches.forEach(branch => {
            const site = activeSites.find(s => s.name === branch.site);
            if (!site) return;
            const status = getBranchStatus(branch);
            if (status) {
                breakdown[site.id][status]++;
            }
        });
        return breakdown;
    }, [branches, activeSites]);
    
    const speciesProgress = React.useMemo(() => {
        const progress: { [siteId: string]: { [species: string]: number } } = {};
        activeSites.forEach(site => {
            progress[site.id] = {};
        });
        branches.forEach(branch => {
            if (branch.species === 'Unknown') return;
            const site = activeSites.find(s => s.name === branch.site);
            if (!site) return;
            
            const speciesKey = `${branch.genus} ${branch.species}`;
            if (!progress[site.id][speciesKey]) {
                progress[site.id][speciesKey] = 0;
            }
            progress[site.id][speciesKey]++;
        });
        return progress;
    }, [branches, activeSites]);

    const siteReminders = React.useMemo(() => {
        if (!selectedSiteId) return null;
        const site = activeSites.find(s => s.id === selectedSiteId);
        if (!site) return null;

        const filtered = reminders.filter(r => r.site === site.name);
        
        return {
            overdue: filtered.filter(r => r.status === 'overdue'),
            due: filtered.filter(r => r.status === 'due'),
        }

    }, [selectedSiteId, reminders, activeSites]);
    
    const speciesToCollect = React.useMemo(() => {
        if (!selectedSiteId) return [];

        const GOAL = 10;
        const neededByZone: { [zoneName: string]: { species: string; current: number; needed: number }[] } = {};

        const speciesCounts: { [speciesKey: string]: number } = {};
        branches.forEach(branch => {
            const speciesKey = `${branch.genus} ${branch.species}`;
            if (speciesKey.includes('Unknown')) return;
            speciesCounts[speciesKey] = (speciesCounts[speciesKey] || 0) + 1;
        });

        const speciesNeedingMore: { [speciesKey: string]: { needed: number; current: number; zones: Set<string> } } = {};
        Object.entries(speciesCounts).forEach(([speciesKey, count]) => {
            if (count < GOAL) {
                speciesNeedingMore[speciesKey] = {
                    needed: GOAL - count,
                    current: count,
                    zones: new Set<string>(),
                };
            }
        });

        branches.forEach(branch => {
            const speciesKey = `${branch.genus} ${branch.species}`;
            if (speciesNeedingMore[speciesKey] && branch.collectionZone !== 'Unknown') {
                speciesNeedingMore[speciesKey].zones.add(branch.collectionZone);
            }
        });
        
        const siteZoneNames = new Set(zones.filter(z => z.siteId === selectedSiteId).map(z => z.name));

        Object.entries(speciesNeedingMore).forEach(([speciesKey, data]) => {
            data.zones.forEach(zoneName => {
                if (siteZoneNames.has(zoneName)) {
                    if (!neededByZone[zoneName]) {
                        neededByZone[zoneName] = [];
                    }
                    if (!neededByZone[zoneName].some(item => item.species === speciesKey)) {
                        neededByZone[zoneName].push({
                            species: speciesKey,
                            current: data.current,
                            needed: data.needed,
                        });
                    }
                }
            });
        });

        Object.values(neededByZone).forEach(zoneData => {
            zoneData.sort((a, b) => a.species.localeCompare(b.species));
        });

        return Object.entries(neededByZone).sort(([a], [b]) => a.localeCompare(b));
    }, [branches, selectedSiteId, zones]);


    React.useEffect(() => {
        if (selectedSiteId) {
            setSiteTasksModalOpen(true);
        } else {
            setSiteTasksModalOpen(false);
        }
    }, [selectedSiteId]);

    const ReminderList: React.FC<{title: string, items: Reminder[], colorClass: string}> = ({title, items, colorClass}) => {
        if (items.length === 0) return null;
        return (
            <div>
                <h4 className={`font-semibold text-sm uppercase ${colorClass}`}>{title} ({items.length})</h4>
                <ul className="mt-2 space-y-3">
                    {items.map(item => (
                        <li key={item.branchId} className="text-sm">
                             <button onClick={() => { onSelectBranch(item.branchId); setSiteTasksModalOpen(false); setSelectedSiteId(''); }} className="font-semibold text-deep-sea hover:underline text-left">
                                {item.branchFragmentId}
                            </button>
                            <p className="text-xs text-gray-500">
                                Tree {item.tree}, Face {item.face}, Position {item.position}
                            </p>
                            <p className="text-gray-600">{item.message}</p>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            {overdueReminders.length > 0 && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 rounded-r-lg p-4 shadow">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <BellIcon className="w-6 h-6 text-yellow-700"/>
                            <p className="font-bold text-yellow-800">{overdueReminders.length} Overdue Task{overdueReminders.length > 1 ? 's' : ''}</p>
                        </div>
                        <button onClick={() => setShowReminders(!showReminders)} className="flex items-center gap-1 text-sm font-semibold text-yellow-900">
                           {showReminders ? 'Hide' : 'Show'} Overdue <ChevronDownIcon className={`w-4 h-4 transition-transform ${showReminders ? 'rotate-180' : ''}`}/>
                        </button>
                    </div>
                    {showReminders && (
                        <div className="mt-4 pl-9 space-y-2 max-h-48 overflow-y-auto">
                           {overdueReminders.map(reminder => (
                                <div key={reminder.branchId} className="text-sm text-yellow-900">
                                    <button onClick={() => onSelectBranch(reminder.branchId)} className="font-bold hover:underline text-left">
                                        {reminder.branchFragmentId}
                                    </button>
                                    <p>{reminder.message}</p>
                                </div>
                           ))}
                        </div>
                    )}
                </div>
            )}

            <div className="bg-white p-4 rounded-lg shadow space-y-3">
                <h3 className="font-semibold text-gray-700 mb-2">Today's Site</h3>
                 <select 
                    value={selectedSiteId} 
                    onChange={e => setSelectedSiteId(e.target.value)} 
                    className="block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900"
                >
                    <option value="">-- Select a site for daily tasks --</option>
                    {activeSites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold text-gray-700 mb-2">Quick access - Enter Branch number</h3>
                <form onSubmit={handleFindBranch} className="flex gap-2">
                    <input
                        type="text"
                        value={branchIdInput}
                        onChange={(e) => setBranchIdInput(e.target.value)}
                        placeholder="e.g., M1-A-PALMATA"
                        className="flex-grow block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900"
                    />
                    <button type="submit" className="bg-ocean-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors">Go</button>
                </form>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-deep-sea mb-4">Nursery Snapshot</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard title="Total Branches" value={nurseryStats.totalBranches} />
                    <StatCard title="Total Trees" value={nurseryStats.totalTrees} />
                    <StatCard title="Unique Genera" value={nurseryStats.uniqueGenera.length} onClick={() => setListModalContent({ title: 'Unique Genera', items: nurseryStats.uniqueGenera })} />
                    <StatCard title="Unique Species" value={nurseryStats.uniqueSpecies.length} onClick={() => setListModalContent({ title: 'Unique Species', items: nurseryStats.uniqueSpecies })} />
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-deep-sea mb-4">Branch Age Distribution</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    <StatCard title="< 6 Months" value={ageDistribution.under6m} />
                    <StatCard title="6-12 Months" value={ageDistribution.upTo1y} />
                    <StatCard title="1-3 Years" value={ageDistribution.upTo3y} />
                    <StatCard title="3-4 Years" value={ageDistribution.upTo4y} />
                    <StatCard title="> 4 Years" value={ageDistribution.over4y} />
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-deep-sea mb-4">Reef Contribution</h2>
                <div className="grid grid-cols-1 gap-4">
                     <StatCard title="Estimated extra larvae when branches spawn" value={reefContribution} />
                </div>
            </div>

            <div>
                 <h2 className="text-2xl font-bold text-deep-sea mb-4">Site Health Breakdown</h2>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {activeSites.map(site => (
                        <div key={site.id} className="bg-white p-4 rounded-lg shadow">
                            <h3 className="font-semibold text-gray-700">{site.name}</h3>
                            <div className="flex justify-around items-center text-center text-xs mt-3">
                                {Object.entries(healthBreakdown[site.id]).map(([status, count]) => (
                                    <button
                                        key={status}
                                        onClick={() => setModalData({ site, status: status as HealthStatus })}
                                        className="flex flex-col items-center p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ocean-blue transition-colors"
                                        aria-label={`View ${status} branches at ${site.name}`}
                                     >
                                        <div className={`w-10 h-10 rounded-full ${HEALTH_CATEGORIES[status as HealthStatus].color} flex items-center justify-center font-bold text-white text-lg shadow-md`}>
                                            {count}
                                        </div>
                                        <span className="mt-1 capitalize text-gray-600">{HEALTH_CATEGORIES[status as HealthStatus].label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                 </div>
            </div>
            
             <div>
                 <h2 className="text-2xl font-bold text-deep-sea mb-4">Species Goal Progress</h2>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {activeSites.map(site => (
                        <div key={site.id} className="bg-white p-4 rounded-lg shadow">
                            <h3 className="font-semibold text-gray-700 mb-3">{site.name}</h3>
                            <div className="space-y-3">
                                {Object.entries(speciesProgress[site.id]).length > 0 ? Object.entries(speciesProgress[site.id]).map(([species, count]) => {
                                    const progress = Math.min(100, (Number(count) / 10) * 100);
                                    return (
                                        <div key={species}>
                                            <div className="flex justify-between items-baseline mb-1">
                                                <p className="text-sm font-medium text-deep-sea italic">{species}</p>
                                                <p className="text-sm font-mono text-gray-600">{count}/10</p>
                                            </div>
                                            <div className="w-full bg-orange-100 rounded-full h-2.5">
                                                <div className="bg-seafoam-green h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <p className="text-sm text-gray-500 text-center py-4">no branches on this site yet</p>
                                )}
                            </div>
                        </div>
                    ))}
                 </div>
            </div>
            
            {siteTasksModalOpen && siteReminders && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={() => setSelectedSiteId('')}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
                        <header className="p-4 border-b flex justify-between items-center">
                            <h2 className="text-xl font-bold text-deep-sea">Today's Tasks for {activeSites.find(s => s.id === selectedSiteId)?.name}</h2>
                            <button onClick={() => setSelectedSiteId('')} className="text-gray-500 hover:text-gray-800">
                                <CloseIcon className="w-6 h-6"/>
                            </button>
                        </header>
                        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
                            <div>
                                <h3 className="font-bold text-gray-800 mb-3">Health Checks</h3>
                                <ReminderList title="Overdue" items={siteReminders.overdue} colorClass="text-red-600" />
                                <div className={siteReminders.overdue.length > 0 ? "mt-4" : ""}>
                                  <ReminderList title="Due in Next 14 Days" items={siteReminders.due} colorClass="text-orange-600" />
                                </div>
                                {siteReminders.overdue.length === 0 && siteReminders.due.length === 0 && (
                                    <p className="text-sm text-gray-500 text-center py-4">No health checks due for this site in the next two weeks.</p>
                                )}
                            </div>
                            
                            <div className="border-t pt-4">
                               <h3 className="font-bold text-gray-800 mb-3">Species to Collect</h3>
                               {speciesToCollect.length > 0 ? speciesToCollect.map(([zoneName, speciesList]) => (
                                    <div key={zoneName} className="mb-4">
                                        <h4 className="font-semibold text-gray-700 bg-gray-100 p-2 rounded-md">{zoneName}</h4>
                                        <ul className="mt-2 pl-4 space-y-2">
                                            {speciesList.map(item => (
                                                <li key={item.species} className="text-sm">
                                                    <p className="font-medium text-deep-sea italic">{item.species}</p>
                                                    <p className="text-gray-600">Collect <span className="font-bold">{item.needed} more</span> (currently have {item.current})</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )) : (
                                    <p className="text-sm text-gray-500 text-center py-4">All species goals for this site are currently met!</p>
                                )}
                            </div>
                        </div>
                        <footer className="p-4 bg-gray-50 rounded-b-2xl text-right">
                            <button
                                onClick={() => setSelectedSiteId('')}
                                className="bg-ocean-blue hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                            >
                                Close
                            </button>
                        </footer>
                    </div>
                </div>
            )}
            
             {modalData && (
                <HealthStatusModal
                    site={modalData.site}
                    status={modalData.status}
                    branches={branches}
                    onClose={() => setModalData(null)}
                    onSelectBranch={onSelectBranch}
                />
            )}

            {listModalContent && (
                <StatCardModal 
                    title={listModalContent.title} 
                    items={listModalContent.items}
                    onClose={() => setListModalContent(null)}
                />
            )}

        </div>
    );
};

export default DashboardPage;