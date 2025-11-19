
import * as React from 'react';
import type { FormEvent } from 'react';
import CoralBranchDisplay from './components/CoralBranchDisplay';
import PhotoManagerModal from './components/PhotoManagerModal';
import AddEditItemsPage from './components/AddEditItemsPage';
import SideMenu from './components/SideMenu';
import { CloseIcon, HamburgerIcon } from './components/Icons';
import RulesPage from './components/RulesPage';
import HealthReportsPage from './components/HealthReportsPage';
import GrowthReportsPage from './components/GrowthReportsPage';
import BackupRestorePage, { NurseryBackupData, SpeciesIdBackupData } from './components/BackupRestorePage';
import ReportsPage from './components/ReportsPage';
import SpeciesIdPage from './components/SpeciesIdPage';
import ArchivePage from './components/ArchivePage';
import NotesToDoPage from './components/NotesToDoPage';
import MonitoringPage from './components/MonitoringPage';
import TreesPage from './components/TreesPage';
import ModelComparisonPage from './components/ModelComparisonPage';
import SitesPage from './components/SitesPage';
import AnchorsPage from './components/3dModelsPage';
import CollectionZonesPage from './components/CollectionZonesPage';
import BranchesPage from './components/BranchesPage';
import EnvironmentalPage from './components/EnvironmentalPage';
import DashboardPage from './components/DashboardPage';
import ExperimentsPage from './components/ExperimentsPage';
import TreeShadeExperimentPage from './components/TreeShadeExperimentPage';
import LongTermStudyPage from './components/LongTermStudyPage';
import TrendsPage from './components/TrendsPage';
import FloatManagementPage from './components/FloatManagementPage';
import { CoralBranch, Photo, HealthReport, GrowthReport, Site, CollectionZone, Anchor, Tree, Float, Rule, Species, ActivityLogItem, ToDoItem, VoiceNote, Page, AddEditSection, Reminder, BleachingLevel, TreeShadeExperiment, ExperimentReport, LongTermStudy, ObservationReport, TemperatureLogger, MaintenanceLog, ScheduleItem, LogType, ReminderStatus } from './types';
import { db } from './firebaseConfig';
import { collection, onSnapshot, addDoc, setDoc, deleteDoc, doc, updateDoc, writeBatch, query, where } from "firebase/firestore";

// MOCK DATA - Used for seeding only
const initialBranchesData: CoralBranch[] = [
  {
    id: 'branch-001',
    fragmentId: 'M1-A-CERVICORNIS',
    genus: 'Acropora',
    species: 'cervicornis',
    dateAdded: '2022-01-10T10:00:00Z',
    anchor: 'Anchor A',
    tree: 12,
    face: 3,
    position: 7,
    collectionZone: 'Zone 5 - North Reef',
    site: 'Moore Reef',
    photos: [
      { id: 'p1', url: 'https://picsum.photos/id/102/800/600', isMain: true },
      { id: 'p2', url: 'https://picsum.photos/id/103/800/600', isMain: false },
      { id: 'p3', url: 'https://picsum.photos/id/104/800/600', isMain: false },
      { id: 'p4', url: 'https://picsum.photos/id/106/800/600', isMain: false },
    ],
    healthReports: [
      { id: 'h1', date: '2024-05-15T10:00:00Z', healthPercentage: 100, notes: 'Full recovery, excellent coloration.', bleaching: 'None' },
      { id: 'h2', date: '2024-04-10T10:00:00Z', healthPercentage: 75, notes: 'Minor paling has subsided, recovery underway.', bleaching: 'Mild' },
    ],
    growthReports: [
      { id: 'g1', date: '2024-05-15T10:00:00Z', surfaceAreaM2: 0.015, volumeM3: 0.00012 },
      { id: 'g2', date: '2024-02-15T10:00:00Z', surfaceAreaM2: 0.011, volumeM3: 0.00009 },
    ],
    isHeatTolerant: true,
    isArchived: false,
  },
  {
    id: 'branch-002',
    fragmentId: 'M2-A-PALMATA',
    genus: 'Acropora',
    species: 'palmata',
    dateAdded: '2021-11-20T10:00:00Z',
    anchor: 'Anchor A',
    tree: 12,
    face: 3,
    position: 8,
    collectionZone: 'Zone 5 - North Reef',
    site: 'Moore Reef',
    photos: [{ id: 'p5', url: 'https://picsum.photos/id/107/800/600', isMain: true }],
    healthReports: [
        { id: 'h7', date: '2024-05-15T10:00:00Z', healthPercentage: 25, notes: 'Heavy algae growth.', bleaching: 'None' },
    ],
    growthReports: [],
    isHeatTolerant: false,
    isArchived: false,
  }
];

const initialSpeciesList: Species[] = [
  {
    id: 'sp-acropora-cervicornis',
    genus: 'Acropora',
    species: 'cervicornis',
    photos: [
        { id: 'sp1', url: 'https://picsum.photos/id/201/800/600', isMain: true },
        { id: 'sp2', url: 'https://picsum.photos/id/202/800/600', isMain: false },
    ],
    notes: 'Key identifying features include thin, branching structures with prominent axial corallites.',
    externalLink: 'https://www.coralsoftheworld.org/species/acropora/acropora-cervicornis/'
  },
  {
    id: 'sp-acropora-palmata',
    genus: 'Acropora',
    species: 'palmata',
    photos: [{ id: 'sp3', url: 'https://picsum.photos/id/203/800/600', isMain: true }],
    notes: 'Commonly known as elkhorn coral.',
    externalLink: 'https://www.coralsoftheworld.org/species/acropora/acropora-palmata/'
  },
];

const mockSites: Site[] = [
  { id: 's1', name: 'Moore Reef', photoUrl: 'https://picsum.photos/id/119/800/600', isArchived: false },
  { id: 's2', name: 'Hastings Reef', photoUrl: 'https://picsum.photos/id/124/800/600', isArchived: false }
];
const mockZones: CollectionZone[] = [
    { id: 'z1', name: 'Zone 5 - North Reef', siteId: 's1', latitude: 25.7630, longitude: -80.1900, isArchived: false },
    { id: 'z2', name: 'Zone 2 - West Reef', siteId: 's2', latitude: 25.7610, longitude: -80.1940, isArchived: false }
];
const mockAnchors: Anchor[] = [
    { id: 'a1', name: 'Anchor A', siteId: 's1', latitude: 25.7617, longitude: -80.1918, isDeepwater: true, depth: 25, isArchived: false },
    { id: 'a2', name: 'Anchor B', siteId: 's2', latitude: 25.7617, longitude: -80.1918, isDeepwater: false, isArchived: false }
];
const mockTrees: Tree[] = [
    { id: 't1', number: 12, anchorId: 'a1', currentDepth: 14, normalDepth: 8, lastMovedDate: '2024-05-01T10:00:00Z', isArchived: false },
    { id: 't2', number: 8, anchorId: 'a2', currentDepth: 8, normalDepth: 8, isArchived: false },
    { id: 't3', number: 15, anchorId: 'a1', currentDepth: 20, normalDepth: 10, lastMovedDate: '2024-05-10T10:00:00Z', isArchived: false }
];
const mockFloats: Float[] = [
  { id: 'f1', name: 'Float 1', treeId: 't1' },
];
const mockRules: Rule[] = [
  { id: 'r1', target: 'Branch', intervalMonths: 1, checkType: 'Health Report' },
];

type SyncStatus = 'idle' | 'saving' | 'saved' | 'error' | 'loading' | 'synced';

interface EditBranchModalProps {
  branch: CoralBranch;
  onUpdate: (updatedBranch: CoralBranch) => void;
  onClose: () => void;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const EditBranchModal: React.FC<EditBranchModalProps> = ({ branch, onUpdate, onClose }) => {
    const [genus, setGenus] = React.useState(branch.genus);
    const [species, setSpecies] = React.useState(branch.species);
    const [isHeatTolerant, setIsHeatTolerant] = React.useState(branch.isHeatTolerant || false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const updatedBranch: CoralBranch = {
            ...branch,
            genus: genus.trim(),
            species: species.trim(),
            isHeatTolerant,
        };
        onUpdate(updatedBranch);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative">
                <form onSubmit={handleSubmit}>
                    <header className="p-4 border-b flex justify-between items-center">
                      <h2 className="text-xl font-bold text-deep-sea">Edit Branch: {branch.fragmentId}</h2>
                      <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <CloseIcon className="w-6 h-6"/>
                      </button>
                    </header>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="genus" className="block text-sm font-medium text-gray-700">Genus</label>
                            <input type="text" id="genus" value={genus} onChange={e => setGenus(e.target.value)} required placeholder="e.g., Acropora" className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900 focus:ring-ocean-blue focus:border-ocean-blue"/>
                        </div>
                        <div>
                            <label htmlFor="species" className="block text-sm font-medium text-gray-700">Species</label>
                            <input type="text" id="species" value={species} onChange={e => setSpecies(e.target.value)} required placeholder="e.g., palmata" className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900 focus:ring-ocean-blue focus:border-ocean-blue"/>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                            <input type="checkbox" id="isHeatTolerantEdit" checked={isHeatTolerant} onChange={e => setIsHeatTolerant(e.target.checked)} className="h-4 w-4 rounded border border-ocean-blue text-ocean-blue focus:ring-ocean-blue"/>
                            <label htmlFor="isHeatTolerantEdit" className="font-medium text-gray-700">Known heat tolerant colony</label>
                        </div>
                    </div>
                    <footer className="p-4 bg-gray-50 rounded-b-2xl flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-ocean-blue hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded-lg">Save Changes</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

const SyncStatusIndicator: React.FC<{ status: SyncStatus }> = ({ status }) => {
  const messages = {
    idle: null,
    loading: '☁️ Connecting...',
    saving: '☁️ Saving...',
    saved: '☁️ Synced',
    synced: '☁️ Live',
    error: '❌ Offline/Error',
  };
  
  if (!messages[status]) return null;

  return <div className="text-sm text-gray-600 font-medium">{messages[status]}</div>;
};


const App: React.FC = () => {
  // --- Cloud Sync State ---
  const [syncStatus, setSyncStatus] = React.useState<SyncStatus>('loading');
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);

  // --- PERSISTENT SPECIES INFO STATE ---
  const [speciesList, setSpeciesList] = React.useState<Species[]>([]);
  
  // --- ROBUST APP DATA STATE & LOADING ---
  const [coralBranches, setCoralBranches] = React.useState<CoralBranch[]>([]);
  const [activeBranchId, setActiveBranchId] = React.useState<string>('');
  const [rules, setRules] = React.useState<Rule[]>([]);
  const [isBranchModalOpen, setIsBranchModalOpen] = React.useState(false);
  const [isSpeciesModalOpen, setIsSpeciesModalOpen] = React.useState(false);
  const [editingBranch, setEditingBranch] = React.useState<CoralBranch | null>(null);
  const [editingSpeciesId, setEditingSpeciesId] = React.useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState<Page>('dashboard');
  const [pageData, setPageData] = React.useState<any>(null);
  const [initialSection, setInitialSection] = React.useState<AddEditSection>('Sites');
  const [activityLog, setActivityLog] = React.useState<ActivityLogItem[]>([]);
  const [sites, setSites] = React.useState<Site[]>([]);
  const [zones, setZones] = React.useState<CollectionZone[]>([]);
  const [anchors, setAnchors] = React.useState<Anchor[]>([]);
  const [trees, setTrees] = React.useState<Tree[]>([]);
  const [floats, setFloats] = React.useState<Float[]>([]);
  const [tempLoggers, setTempLoggers] = React.useState<TemperatureLogger[]>([]);
  const [maintenanceLogs, setMaintenanceLogs] = React.useState<MaintenanceLog[]>([]);
  const [toDoItems, setToDoItems] = React.useState<ToDoItem[]>([]);
  const [voiceNotes, setVoiceNotes] = React.useState<VoiceNote[]>([]);
  const [schedule, setSchedule] = React.useState<Map<string, ScheduleItem[]>>(new Map());
  
  // Experiments are stored as individual documents in an 'experiments' collection with IDs matching the experiment name
  const [treeShadeExperiment, setTreeShadeExperiment] = React.useState<TreeShadeExperiment | null>(null);
  const [ropeOnRubbleExperiment, setRopeOnRubbleExperiment] = React.useState<LongTermStudy | null>(null);
  const [squareRopeFrameExperiment, setSquareRopeFrameExperiment] = React.useState<LongTermStudy | null>(null);
  const [cubeRopeFrameExperiment, setCubeRopeFrameExperiment] = React.useState<LongTermStudy | null>(null);

  // --- FIRESTORE SUBSCRIPTIONS ---
  React.useEffect(() => {
      if (!db) {
          setSyncStatus('error');
          return;
      }

      const unsubs: (() => void)[] = [];

      const subscribe = (colName: string, setter: React.Dispatch<React.SetStateAction<any[]>>) => {
          const q = collection(db, colName);
          return onSnapshot(q, (snapshot) => {
              const items: any[] = [];
              snapshot.forEach((doc) => items.push(doc.data()));
              setter(items);
              setSyncStatus('synced');
          }, (error) => {
              console.error(`Error fetching ${colName}:`, error);
              setSyncStatus('error');
          });
      };
      
      // Subscribe to Experiment Docs specifically
      const subscribeExp = (docId: string, setter: React.Dispatch<React.SetStateAction<any>>) => {
          return onSnapshot(doc(db, 'experiments', docId), (doc) => {
             if (doc.exists()) {
                 setter(doc.data());
             } else {
                 setter(null);
             }
          });
      };

      unsubs.push(subscribe('branches', setCoralBranches));
      unsubs.push(subscribe('rules', setRules));
      unsubs.push(subscribe('species', setSpeciesList));
      unsubs.push(subscribe('sites', setSites));
      unsubs.push(subscribe('zones', setZones));
      unsubs.push(subscribe('anchors', setAnchors));
      unsubs.push(subscribe('trees', setTrees));
      unsubs.push(subscribe('floats', setFloats));
      unsubs.push(subscribe('logs', (items) => setActivityLog(items.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()))));
      unsubs.push(subscribe('tempLoggers', setTempLoggers));
      unsubs.push(subscribe('maintenanceLogs', setMaintenanceLogs));
      unsubs.push(subscribe('todos', setToDoItems));
      unsubs.push(subscribe('voiceNotes', setVoiceNotes));
      
      unsubs.push(subscribeExp('treeShade', setTreeShadeExperiment));
      unsubs.push(subscribeExp('ropeOnRubble', setRopeOnRubbleExperiment));
      unsubs.push(subscribeExp('squareRopeFrame', setSquareRopeFrameExperiment));
      unsubs.push(subscribeExp('cubeRopeFrame', setCubeRopeFrameExperiment));

      setIsInitialLoading(false);

      return () => {
          unsubs.forEach(unsub => unsub());
      };
  }, []);

  // --- HELPERS ---
  const saveItem = async (collectionName: string, item: any) => {
      if (!db) return;
      try {
          setSyncStatus('saving');
          await setDoc(doc(db, collectionName, item.id), item);
          setSyncStatus('synced');
      } catch (e) {
          console.error("Save failed", e);
          setSyncStatus('error');
      }
  };
  
  const updateItemDoc = async (collectionName: string, itemId: string, data: any) => {
      if (!db) return;
      try {
          setSyncStatus('saving');
          await updateDoc(doc(db, collectionName, itemId), data);
          setSyncStatus('synced');
      } catch(e) {
          console.error("Update failed", e);
          setSyncStatus('error');
      }
  }

  const deleteItem = async (collectionName: string, itemId: string) => {
      if (!db) return;
      try {
          setSyncStatus('saving');
          await deleteDoc(doc(db, collectionName, itemId));
          setSyncStatus('synced');
      } catch (e) {
          console.error("Delete failed", e);
          setSyncStatus('error');
      }
  };
  
  const batchSave = async (collectionName: string, items: any[]) => {
      if (!db) return;
      const batch = writeBatch(db);
      items.forEach(item => {
          const ref = doc(db, collectionName, item.id);
          batch.set(ref, item);
      });
      await batch.commit();
  }

  const clearAllData = async () => {
      if (!db) return;
      const collectionsToClear = ['branches', 'sites', 'zones', 'anchors', 'trees', 'floats', 'logs', 'maintenanceLogs', 'tempLoggers', 'todos', 'voiceNotes'];
      // We specifically DO NOT include 'rules' and 'species' here.
      
      // Note: Client-side clearing of entire collections is expensive/slow if data is large.
      // In a real app, this should be a Cloud Function. Here we iterate.
      for (const colName of collectionsToClear) {
          // We can't query *all* efficiently without reading.
          // For this app scale, we read local state (which is synced) and delete those IDs.
          // This avoids extra reads.
          let itemsToDelete: any[] = [];
          switch(colName) {
              case 'branches': itemsToDelete = coralBranches; break;
              case 'sites': itemsToDelete = sites; break;
              case 'zones': itemsToDelete = zones; break;
              case 'anchors': itemsToDelete = anchors; break;
              case 'trees': itemsToDelete = trees; break;
              case 'floats': itemsToDelete = floats; break;
              case 'logs': itemsToDelete = activityLog; break;
              case 'maintenanceLogs': itemsToDelete = maintenanceLogs; break;
              case 'tempLoggers': itemsToDelete = tempLoggers; break;
              case 'todos': itemsToDelete = toDoItems; break;
              case 'voiceNotes': itemsToDelete = voiceNotes; break;
          }
          
          const batch = writeBatch(db);
          let count = 0;
          for (const item of itemsToDelete) {
              batch.delete(doc(db, colName, item.id));
              count++;
              if (count >= 450) { // Limit is 500
                   await batch.commit();
                   count = 0;
              }
          }
          if (count > 0) await batch.commit();
      }
      
      // Clear experiments
      await deleteDoc(doc(db, 'experiments', 'treeShade'));
      await deleteDoc(doc(db, 'experiments', 'ropeOnRubble'));
      await deleteDoc(doc(db, 'experiments', 'squareRopeFrame'));
      await deleteDoc(doc(db, 'experiments', 'cubeRopeFrame'));
      
      // State updates happen automatically via listeners
  };

  const loadSampleData = async () => {
      if (!db) return;
      setSyncStatus('saving');
      
      // We use the batchSave helper for lists
      await batchSave('branches', initialBranchesData);
      await batchSave('rules', mockRules);
      await batchSave('sites', mockSites);
      await batchSave('zones', mockZones);
      await batchSave('anchors', mockAnchors);
      await batchSave('trees', mockTrees);
      await batchSave('floats', mockFloats);
      await batchSave('species', initialSpeciesList);
      
      const initialLogs: ActivityLogItem[] = [];
      mockTrees.forEach((tree) => {
          const anchor = mockAnchors.find(a => a.id === tree.anchorId);
          if (anchor) initialLogs.push({ id: `log-init-tree-${tree.id}`, timestamp: tree.lastMovedDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), message: `Initial placement: Tree #${tree.number} [${tree.id}] was added to Anchor "${anchor.name}".`, type: 'movement' });
      });
      initialBranchesData.forEach((branch) => {
          initialLogs.push({ id: `log-init-branch-${branch.id}`, timestamp: branch.dateAdded, message: `Initial placement: Branch ${branch.fragmentId} [${branch.id}] was added to Tree #${branch.tree}, Face ${branch.face}, Position ${branch.position}.`, type: 'movement' });
      });
      await batchSave('logs', initialLogs);
      
      setSyncStatus('synced');
  };


  // Memoized lists for active vs archived items
  const activeBranches = React.useMemo(() => coralBranches.filter(b => !b.isArchived), [coralBranches]);
  const archivedBranches = React.useMemo(() => coralBranches.filter(b => b.isArchived), [coralBranches]);
  const activeSites = React.useMemo(() => sites.filter(s => !s.isArchived), [sites]);
  const archivedSites = React.useMemo(() => sites.filter(s => s.isArchived), [sites]);
  const activeZones = React.useMemo(() => zones.filter(z => !z.isArchived), [zones]);
  const archivedZones = React.useMemo(() => zones.filter(z => z.isArchived), [zones]);
  const activeAnchors = React.useMemo(() => anchors.filter(a => !a.isArchived), [anchors]);
  const archivedAnchors = React.useMemo(() => anchors.filter(a => a.isArchived), [anchors]);
  const activeTrees = React.useMemo(() => trees.filter(t => !t.isArchived), [trees]);
  const archivedTrees = React.useMemo(() => trees.filter(t => t.isArchived), [trees]);

  const reminders = React.useMemo((): Reminder[] => {
    const generatedReminders: Reminder[] = [];
    const now = new Date();
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(now.getDate() + 14);

    const branchRules = rules.filter(r => r.target === 'Branch');
    if (branchRules.length === 0) return [];

    activeBranches.forEach(branch => {
        branchRules.forEach(rule => {
            let lastCheckDate: Date | null = null;

            if (rule.checkType === 'Health Report') {
                if (branch.healthReports.length > 0) {
                    lastCheckDate = new Date(Math.max(...branch.healthReports.map(r => new Date(r.date).getTime())));
                }
            } else if (rule.checkType === 'Scan') {
                if (branch.growthReports.length > 0) {
                    lastCheckDate = new Date(Math.max(...branch.growthReports.map(r => new Date(r.date).getTime())));
                }
            }
            
            if (!lastCheckDate) {
                lastCheckDate = new Date(branch.dateAdded);
            }

            const dueDate = new Date(lastCheckDate);
            dueDate.setMonth(dueDate.getMonth() + rule.intervalMonths);

            let status: ReminderStatus | null = null;
            if (dueDate < now) {
                status = 'overdue';
            } else if (dueDate <= twoWeeksFromNow) {
                status = 'due';
            }

            if (status) {
                generatedReminders.push({
                    branchId: branch.id,
                    branchFragmentId: branch.fragmentId,
                    site: branch.site,
                    tree: branch.tree,
                    face: branch.face,
                    position: branch.position,
                    message: `A "${rule.checkType}" is required.`,
                    dueDate: dueDate.toISOString(),
                    status: status,
                });
            }
        });
    });

    return generatedReminders;
  }, [rules, activeBranches]);
  
  const activeBranch = coralBranches.find(b => b.id === activeBranchId) || activeBranches[0];

  // --- HANDLERS ---
  const logActivity = (message: string, type: LogType) => {
    const newLogItem: ActivityLogItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      message,
      type,
    };
    saveItem('logs', newLogItem);
  };

  const handleBranchAddPhotos = async (files: File[]) => {
    const newPhotosPromises = files.map(async (file) => {
      const url = await fileToBase64(file);
      return {
        id: `new-${Date.now()}-${Math.random()}`,
        url,
        isMain: false,
      };
    });
    const newPhotos = await Promise.all(newPhotosPromises);
    // We read current state to append, but in a high frequency app we'd use arrayUnion. 
    // Here we rely on `activeBranch` being up to date via listener.
    const updatedPhotos = [...newPhotos, ...activeBranch.photos];
    updateItemDoc('branches', activeBranch.id, { photos: updatedPhotos });
    logActivity(`Added ${files.length} photo(s) to branch ${activeBranch.fragmentId}.`, 'general');
  };

  const handleBranchDeletePhotos = (photoIds: string[]) => {
    const remainingPhotos = activeBranch.photos.filter(p => !photoIds.includes(p.id));
    const mainPhoto = activeBranch.photos.find(p => p.isMain);
    const mainPhotoWasDeleted = mainPhoto ? photoIds.includes(mainPhoto.id) : true;

    if (remainingPhotos.length > 0 && mainPhotoWasDeleted) {
        remainingPhotos[0].isMain = true;
    }
    updateItemDoc('branches', activeBranch.id, { photos: remainingPhotos });
    logActivity(`Deleted ${photoIds.length} photo(s) from branch ${activeBranch.fragmentId}.`, 'general');
  };

  const handleBranchSetMainPhoto = (photoId: string) => {
    const updatedPhotos = activeBranch.photos.map(p => ({ ...p, isMain: p.id === photoId }));
    updateItemDoc('branches', activeBranch.id, { photos: updatedPhotos });
    logActivity(`Set new main photo for branch ${activeBranch.fragmentId}.`, 'general');
  };
  
  const handleSpeciesAddPhotos = async (files: File[]) => {
    if (!editingSpeciesId) return;
    const species = speciesList.find(s => s.id === editingSpeciesId);
    if (!species) return;

    const newPhotosPromises = files.map(async (file) => {
      const url = await fileToBase64(file);
      return {
        id: `new-species-${Date.now()}-${Math.random()}`,
        url,
        isMain: false,
      };
    });
    const newPhotos = await Promise.all(newPhotosPromises);
    const updatedPhotos = [...newPhotos, ...species.photos];
    if (updatedPhotos.length > 0 && !updatedPhotos.some(p => p.isMain)) {
        updatedPhotos[0].isMain = true;
    }

    updateItemDoc('species', species.id, { photos: updatedPhotos });
    logActivity(`Added ${files.length} photo(s) to Species ID for ${editingSpeciesId}.`, 'general');
  };

  const handleSpeciesDeletePhotos = (photoIds: string[]) => {
    if (!editingSpeciesId) return;
    const species = speciesList.find(s => s.id === editingSpeciesId);
    if (!species) return;

    const remainingPhotos = species.photos.filter(p => !photoIds.includes(p.id));
    if (remainingPhotos.length > 0 && !remainingPhotos.some(p => p.isMain)) {
      remainingPhotos[0].isMain = true;
    }
    updateItemDoc('species', species.id, { photos: remainingPhotos });
    logActivity(`Deleted ${photoIds.length} photo(s) from Species ID for ${editingSpeciesId}.`, 'general');
  };

  const handleSpeciesSetMainPhoto = (photoId: string) => {
    if (!editingSpeciesId) return;
    const species = speciesList.find(s => s.id === editingSpeciesId);
    if (!species) return;
    const updatedPhotos = species.photos.map(p => ({ ...p, isMain: p.id === photoId }));
    updateItemDoc('species', species.id, { photos: updatedPhotos });
    logActivity(`Set new main photo for Species ID for ${editingSpeciesId}.`, 'general');
  };

  const handleAddSpecies = (genus: string, speciesName: string) => {
    const newSpecies: Species = {
      id: `sp-${genus.toLowerCase()}-${speciesName.toLowerCase()}-${Date.now()}`,
      genus,
      species: speciesName,
      photos: [],
      notes: '',
      externalLink: ''
    };
    saveItem('species', newSpecies);
    logActivity(`Added new species: ${genus} ${speciesName}`, 'general');
  };

  const handleUpdateSpecies = (updatedSpecies: Species) => {
    saveItem('species', updatedSpecies); // saveItem handles setDoc which overwrites/updates
    logActivity(`Updated details for species ${updatedSpecies.genus} ${updatedSpecies.species}`, 'general');
  };
  
  const handleAddTree = (anchorId: string) => {
    const maxTreeNumber = Math.max(0, ...trees.map(t => t.number));
    const newTreeNumber = maxTreeNumber + 1;
    const newTreeId = `t-${Date.now()}`;
    const newTree: Tree = {
      id: newTreeId,
      number: newTreeNumber,
      anchorId: anchorId,
      currentDepth: 8,
      normalDepth: 8,
      isArchived: false,
    };
    
    const newFloat: Float = {
      id: `f-${Date.now()}`,
      name: `Float 1`,
      treeId: newTreeId,
    };

    const anchor = anchors.find(a => a.id === anchorId);
    if (!anchor) return;

    saveItem('trees', newTree);
    saveItem('floats', newFloat);
    
    logActivity(`Initial placement: Tree #${newTreeNumber} [${newTree.id}] was added to Anchor "${anchor.name}".`, 'movement');
    alert(`Tree #${newTreeNumber} has been added.`);
  };
  
  const handleAddFloat = (treeId: string) => {
    const existingFloats = floats.filter(f => f.treeId === treeId);
    const newFloatNumber = existingFloats.length + 1;
    const newFloat: Float = {
      id: `f-${Date.now()}`,
      name: `Float ${newFloatNumber}`,
      treeId: treeId,
    };
    saveItem('floats', newFloat);
    const tree = trees.find(t => t.id === treeId);
    logActivity(`Added Float ${newFloatNumber} to Tree #${tree?.number}.`, 'general');
  };

  const handleRemoveFloat = (floatId: string) => {
    const floatToRemove = floats.find(f => f.id === floatId);
    if (!floatToRemove) return;

    const floatsOnTree = floats.filter(f => f.treeId === floatToRemove.treeId);
    if (floatsOnTree.length <= 1) {
        alert("Cannot remove the last float from a tree.");
        return;
    }

    deleteItem('floats', floatId);
    const tree = trees.find(t => t.id === floatToRemove.treeId);
    logActivity(`Removed float "${floatToRemove.name}" from Tree #${tree?.number}.`, 'general');
  };

  const handleAddSite = (name: string, photoUrl: string) => {
    const newSite: Site = {
      id: `s-${Date.now()}`,
      name,
      photoUrl,
      isArchived: false,
    };
    saveItem('sites', newSite);
    logActivity(`Added new site: ${name}`, 'general');
  };

  const handleUpdateSite = (updatedSite: Site) => {
    saveItem('sites', updatedSite);
    logActivity(`Updated site: ${updatedSite.name}`, 'general');
  };

  const handleAddAnchor = (name: string, siteId: string, latitude: number, longitude: number, isDeepwater: boolean, depth: number | undefined) => {
    const newAnchor: Anchor = {
      id: `a-${Date.now()}`,
      name,
      siteId,
      latitude,
      longitude,
      isDeepwater,
      depth: isDeepwater ? depth : undefined,
      isArchived: false,
    };
    saveItem('anchors', newAnchor);
    const site = sites.find(s => s.id === siteId);
    logActivity(`Added new anchor "${name}" to site ${site?.name}.`, 'general');
    alert(`Anchor "${name}" has been added.`);
  };

  const handleAddCollectionZone = (name: string, siteId: string, latitude: number, longitude: number) => {
    const newZone: CollectionZone = {
      id: `z-${Date.now()}`,
      name,
      siteId,
      latitude,
      longitude,
      isArchived: false,
    };
    saveItem('zones', newZone);
    const site = sites.find(s => s.id === siteId);
    logActivity(`Added new collection zone "${name}" to site ${site?.name}.`, 'general');
    alert(`Collection Zone "${name}" has been added.`);
  };
  
  const handleAddBranch = (siteId: string, treeId: string, face: 1 | 2 | 3 | 4, position: number, isHeatTolerant: boolean, genus: string, species: string) => {
    const tree = trees.find(t => t.id === treeId);
    const site = sites.find(s => s.id === siteId);
    if (!tree || !site) return;
    
    const nextBranchNum = coralBranches.length + 1;
    const siteInitial = site.name.charAt(0).toUpperCase();
    const genusInitial = genus.charAt(0).toUpperCase();
    const speciesUpper = species.toUpperCase();
    const newFragmentId = `${siteInitial}${nextBranchNum}-${genusInitial}-${speciesUpper}`;

    const newBranch: CoralBranch = {
        id: `branch-${Date.now()}`,
        fragmentId: newFragmentId,
        genus,
        species,
        dateAdded: new Date().toISOString(),
        anchor: anchors.find(a => a.id === tree.anchorId)?.name || 'Unknown',
        tree: tree.number,
        face,
        position,
        collectionZone: zones.find(z => z.siteId === siteId)?.name || 'Unknown',
        site: site.name,
        photos: [],
        healthReports: [],
        growthReports: [],
        isHeatTolerant,
        isArchived: false,
    };

    saveItem('branches', newBranch);
    logActivity(`Initial placement: Branch ${newFragmentId} [${newBranch.id}] was added to Tree #${tree.number}, Face ${face}, Position ${position}.`, 'movement');
    alert(`Branch ${newFragmentId} has been added.`);
  };

  const handleSelectBranch = (branchId: string) => {
    setActiveBranchId(branchId);
    handleNavigateToPage('details');
  };

  const handleArchiveItem = (itemType: any, itemId: string) => {
    let itemName = '';
    let isBranch = false;

    switch (itemType) {
        case 'Site':
            updateItemDoc('sites', itemId, { isArchived: true });
            itemName = sites.find(i => i.id === itemId)?.name || itemId;
            break;
        case 'Collection Zone':
            updateItemDoc('zones', itemId, { isArchived: true });
            itemName = zones.find(i => i.id === itemId)?.name || itemId;
            break;
        case 'Anchor':
            updateItemDoc('anchors', itemId, { isArchived: true });
            itemName = anchors.find(i => i.id === itemId)?.name || itemId;
            break;
        case 'Tree':
            updateItemDoc('trees', itemId, { isArchived: true });
            const treeNum = trees.find(i => i.id === itemId)?.number;
            itemName = treeNum ? `Tree #${treeNum}` : itemId;
            break;
        case 'Branch':
            const branchToArchive = coralBranches.find(b => b.id === itemId);
            if (!branchToArchive) return;

            updateItemDoc('branches', itemId, { isArchived: true });
            
            const reminderText = `Collect replacement for ${branchToArchive.species} from ${branchToArchive.collectionZone}.`;
            const newTodo: ToDoItem = { id: `todo-replace-${Date.now()}`, text: reminderText };
            saveItem('todos', newTodo);
            
            itemName = branchToArchive.fragmentId;
            isBranch = true;
            break;
    }

    logActivity(`Archived ${itemType}: ${itemName}.`, 'general');
    if (isBranch) {
        alert(`${itemType} ${itemName} has been archived. A replacement reminder has been added to your ToDo list.`);
    } else {
        alert(`${itemType} ${itemName} has been archived.`);
    }
  };


  const handleNavigateToPage = (page: Page, data?: any) => {
    setPageData(data || null);
    setCurrentPage(page);
    setIsMenuOpen(false);
  };
  
  const handleNavigateToAddEdit = (section: AddEditSection) => {
    setInitialSection(section);
    setCurrentPage('addEditItems');
    setIsMenuOpen(false);
  };
  
  const handleUpdateBranch = (updatedBranch: CoralBranch) => {
    saveItem('branches', updatedBranch);
    logActivity(`Updated details for branch ${updatedBranch.fragmentId}.`, 'general');
    alert('Branch details updated!');
    setEditingBranch(null);
  }

  const handleAddHealthReport = (branchId: string, newReportData: Omit<HealthReport, 'id'>, showAlert: boolean = true) => {
    const newReport: HealthReport = { ...newReportData, id: `h-${Date.now()}` };
    const branch = coralBranches.find(b => b.id === branchId);
    if (!branch) return;

    const updatedReports = [newReport, ...branch.healthReports];
    updateItemDoc('branches', branchId, { healthReports: updatedReports });

    logActivity(`Added health report for branch ${branch?.fragmentId}.`, 'monitoring');
    if (showAlert) {
        alert(`Health report added for branch ${branch?.fragmentId}!`);
    }
  };

  const handleAddRule = (newRule: Omit<Rule, 'id'>) => {
    const newRuleWithId = { ...newRule, id: `r-${Date.now()}` };
    saveItem('rules', newRuleWithId);
    logActivity(`Added new rule: "${newRule.checkType}" for ${newRule.target} every ${newRule.intervalMonths} month(s).`, 'general');
    alert('New rule added!');
  };

  const handleWipeAllData = () => {
    clearAllData();
    logActivity('All tracking data has been wiped (Species/Rules preserved).', 'general');
  };
  
  const handleRestoreNurseryData = (backup: NurseryBackupData) => {
    // For restore, we overwrite local items with backup items.
    // We can reuse batchSave for this.
    batchSave('branches', backup.coralBranches || []);
    batchSave('rules', backup.rules || []);
    batchSave('sites', backup.sites || []);
    batchSave('zones', backup.zones || []);
    batchSave('anchors', backup.anchors || []);
    batchSave('trees', backup.trees || []);
    batchSave('floats', backup.floats || []);
    
    logActivity('Nursery data restored from backup file.', 'general');
    alert('Nursery data restore started (syncing to cloud).');
  };

  const handleRestoreSpeciesIdData = (backup: SpeciesIdBackupData) => {
      batchSave('species', backup.speciesList || []);
      logActivity('Species ID data restored from backup file.', 'general');
      alert('Species ID data restore started.');
  };

  const handleResetToSampleData = () => {
    loadSampleData();
  };
  
  const handleClearLog = () => {
      const batch = writeBatch(db);
      activityLog.forEach(log => {
          batch.delete(doc(db, 'logs', log.id));
      });
      batch.commit();
  };

  const handleAddToDo = (text: string) => {
    const newItem: ToDoItem = { id: `todo-${Date.now()}`, text };
    saveItem('todos', newItem);
    logActivity(`Added ToDo: "${text}"`, 'general');
  };

  const handleDeleteToDo = (id: string) => {
    deleteItem('todos', id);
    logActivity(`Deleted ToDo item.`, 'general');
  };

  const handleAddVoiceNote = (audioUrl: string, duration: number) => {
    const newNote: VoiceNote = { id: `voice-${Date.now()}`, audioUrl, duration };
    saveItem('voiceNotes', newNote);
    logActivity('Added a voice note.', 'general');
  };

  const handleDeleteVoiceNote = (id: string) => {
    deleteItem('voiceNotes', id);
    logActivity('Deleted a voice note.', 'general');
  };
  
    const handleLogMaintenance = (logData: Omit<MaintenanceLog, 'id' | 'timestamp'>) => {
    const newLog: MaintenanceLog = {
      ...logData,
      id: `maint-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    saveItem('maintenanceLogs', newLog);
    
    const tree = trees.find(t => t.id === logData.treeId);
    if (logData.target === 'Tree') {
      logActivity(`Logged maintenance for Tree #${tree?.number}: ${logData.tasks.join(', ')}`, 'maintenance');
    } else {
      const branch = coralBranches.find(b => b.id === logData.branchId);
      logActivity(`Logged maintenance for Branch ${branch?.fragmentId}: ${logData.tasks.join(', ')}`, 'maintenance');
    }
    alert('Maintenance logged successfully.');
  };

  const handleMoveTreeUp = (treeId: string) => {
    const tree = trees.find(t => t.id === treeId);
    if (tree) {
        const newDepth = tree.currentDepth - 2;
        updateItemDoc('trees', treeId, { currentDepth: newDepth, lastMovedDate: new Date().toISOString() });
        logActivity(`Moved Tree #${tree.number} up from ${tree.currentDepth}m to ${newDepth}m.`, 'movement');
    }
  };

  const handleMoveTreeDown = (treeId: string, targetDepth: number) => {
    const tree = trees.find(t => t.id === treeId);
    if (tree) {
        updateItemDoc('trees', treeId, { currentDepth: targetDepth, lastMovedDate: new Date().toISOString() });
        logActivity(`Moved Tree #${tree.number} down from ${tree.currentDepth}m to ${targetDepth}m.`, 'movement');
    }
  };

  const handleMoveTree = (treeId: string, newAnchorId: string, reason?: string) => {
     const tree = trees.find(t => t.id === treeId);
     if (tree) {
        const oldAnchor = anchors.find(a => a.id === tree.anchorId);
        const newAnchor = anchors.find(a => a.id === newAnchorId);
        updateItemDoc('trees', treeId, { anchorId: newAnchorId });
        logActivity(`Moved Tree #${tree.number} from Anchor "${oldAnchor?.name}" to "${newAnchor?.name}". Reason: ${reason || 'Not specified'}.`, 'movement');
     }
  };

  const handleUpdateTreeNormalDepth = (treeId: string, newNormalDepth: number) => {
    const tree = trees.find(t => t.id === treeId);
    if (tree) {
        updateItemDoc('trees', treeId, { normalDepth: newNormalDepth });
        logActivity(`Updated target depth for Tree #${tree.number} to ${newNormalDepth}m.`, 'general');
    }
  };

  const handleGenerateSchedule = (targetDate: string) => {
    const newSchedule = new Map<string, ScheduleItem[]>();
    const deepTrees = trees.filter(t => t.currentDepth > t.normalDepth);

    deepTrees.forEach(tree => {
      let currentTree = { ...tree };
      let movesNeeded = (currentTree.currentDepth - currentTree.normalDepth) / 2;

      for (let i = 0; i < movesNeeded; i++) {
        const moveDate = new Date(targetDate);
        moveDate.setDate(moveDate.getDate() - (i + 1) * 14); // Move up every 14 days before target
        
        const dateString = moveDate.toISOString().split('T')[0];

        if (!newSchedule.has(dateString)) {
          newSchedule.set(dateString, []);
        }

        const fromDepth = currentTree.currentDepth;
        const toDepth = fromDepth - 2;
        
        newSchedule.get(dateString)!.push({ tree: currentTree, fromDepth, toDepth });
        
        currentTree = { ...currentTree, currentDepth: toDepth };
      }
    });
    setSchedule(newSchedule);
    logActivity(`Generated restoration schedule for target date ${targetDate}.`, 'general');
  };

  const handleMoveBranch = (branchId: string, newTreeId: string, newFace: 1 | 2 | 3 | 4, newPosition: number, reason?: string) => {
    const branch = coralBranches.find(b => b.id === branchId);
    const newTree = trees.find(t => t.id === newTreeId);
    if (!newTree || !branch) return;
    const newAnchor = anchors.find(a => a.id === newTree.anchorId);
    if (!newAnchor) return;
    const newSite = sites.find(s => s.id === newAnchor.siteId);
    if (!newSite) return;

    updateItemDoc('branches', branchId, { 
        tree: newTree.number, 
        anchor: newAnchor.name, 
        site: newSite.name, 
        face: newFace, 
        position: newPosition 
    });
    logActivity(`Moved Branch ${branch.fragmentId} from Tree #${branch.tree} to Tree #${newTree.number}, Face ${newFace}, Position ${newPosition}. Reason: ${reason || 'Not specified'}.`, 'movement');
    alert('Branch moved successfully!');
  };

  const handleAddTempLogger = (siteId: string, anchorId: string, depth: number) => {
    const newLogger: TemperatureLogger = { id: `temp-${Date.now()}`, siteId, anchorId, depth };
    saveItem('tempLoggers', newLogger);
    logActivity(`Registered new temperature logger at ${depth}m.`, 'general');
    alert('Temperature logger registered.');
  };

  const handleRemoveTempLogger = (loggerId: string) => {
    deleteItem('tempLoggers', loggerId);
    logActivity(`Removed temperature logger.`, 'general');
    alert('Temperature logger removed.');
  };
  
    const handleStartTreeShadeExperiment = (controlTreeId: string, shadedTreeId: string, shadeLevel: 30 | 50) => {
        const expData: TreeShadeExperiment = {
            isActive: true,
            controlTreeId,
            shadedTreeId,
            shadeLevel,
            startDate: new Date().toISOString(),
            reports: [],
        };
        saveItem('experiments', { ...expData, id: 'treeShade' });
        logActivity('Started Tree Shade experiment.', 'general');
    };

    const handleAddTreeShadeReport = (notes: string) => {
        if (!treeShadeExperiment) return;

        const controlTree = trees.find(t => t.id === treeShadeExperiment.controlTreeId);
        const shadedTree = trees.find(t => t.id === treeShadeExperiment.shadedTreeId);
        if (!controlTree || !shadedTree) return;

        const getTreeStats = (treeNumber: number) => {
            const treeBranches = activeBranches.filter(b => b.tree === treeNumber);
            if (treeBranches.length === 0) return { health: 0, bleaching: 0 };
            
            let totalHealth = 0;
            let bleachingCount = 0;

            treeBranches.forEach(b => {
                const latestReport = b.healthReports.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                if (latestReport) {
                    totalHealth += latestReport.healthPercentage;
                    if (latestReport.bleaching !== 'None') {
                        bleachingCount++;
                    }
                }
            });
            return { health: totalHealth / treeBranches.length, bleaching: bleachingCount };
        };

        const controlStats = getTreeStats(controlTree.number);
        const shadedStats = getTreeStats(shadedTree.number);
        
        const newReport: ExperimentReport = {
            id: `exp-report-${Date.now()}`,
            date: new Date().toISOString(),
            notes,
            controlTreeHealth: controlStats.health,
            shadedTreeHealth: shadedStats.health,
            controlTreeBleachingCount: controlStats.bleaching,
            shadedTreeBleachingCount: shadedStats.bleaching,
        };
        
        const updatedReports = [newReport, ...treeShadeExperiment.reports];
        updateItemDoc('experiments', 'treeShade', { reports: updatedReports });

        logActivity('Logged a report for Tree Shade experiment.', 'monitoring');
    };

    const handleEndTreeShadeExperiment = () => {
        if (treeShadeExperiment) {
            updateItemDoc('experiments', 'treeShade', { isActive: false });
            logActivity('Ended Tree Shade experiment.', 'general');
        }
    };
    
    const createStudyHandlers = (
        studyId: string,
        study: LongTermStudy | null, 
        title: string
    ) => ({
        handleStart: () => {
            const newStudy: LongTermStudy = { isActive: true, startDate: new Date().toISOString(), reports: [] };
            saveItem('experiments', { ...newStudy, id: studyId });
            logActivity(`Started ${title} study.`, 'general');
        },
        handleAddReport: (notes: string) => {
            if (study) {
                const newReport: ObservationReport = { id: `obs-${Date.now()}`, date: new Date().toISOString(), notes };
                updateItemDoc('experiments', studyId, { reports: [newReport, ...study.reports] });
                logActivity(`Logged observation for ${title} study.`, 'monitoring');
            }
        },
        handleEnd: () => {
            if (study) {
                updateItemDoc('experiments', studyId, { isActive: false });
                logActivity(`Ended ${title} study.`, 'general');
            }
        }
    });

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage reminders={reminders} branches={activeBranches} sites={activeSites} trees={activeTrees} zones={zones} onSelectBranch={handleSelectBranch} />;
      case 'details':
        return activeBranch ? (
          <CoralBranchDisplay
            branch={activeBranch}
            activityLog={activityLog}
            onOpenPhotoManager={() => setIsBranchModalOpen(true)}
            onNavigateToHealthReports={() => handleNavigateToPage('healthReports', { branch: activeBranch })}
            onNavigateToGrowthReports={() => handleNavigateToPage('growthReports', { branch: activeBranch })}
            onEdit={branch => setEditingBranch(branch)}
            onMove={branch => handleNavigateToPage('branches', { branchToMove: branch })}
          />
        ) : (
          <div className="text-center p-8 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold text-deep-sea">No branch selected.</h2>
            <p className="text-gray-600 mt-2">Please select a branch to view its details.</p>
          </div>
        );
      case 'addEditItems':
        return <AddEditItemsPage initialSection={initialSection} activeBranches={activeBranches} onSelectBranch={handleSelectBranch} onNavigateBack={() => setCurrentPage('details')} onNavigateToPage={handleNavigateToPage}/>;
      case 'rules':
        return <RulesPage rules={rules} onAddRule={handleAddRule} onNavigateBack={() => setCurrentPage('dashboard')} />;
      case 'healthReports':
        return pageData?.branch ? <HealthReportsPage reports={pageData.branch.healthReports} onNavigateBack={() => setCurrentPage('details')} /> : <div>Branch data missing.</div>;
      case 'growthReports':
        return pageData?.branch ? <GrowthReportsPage reports={pageData.branch.growthReports} onNavigateBack={() => setCurrentPage('details')} /> : <div>Branch data missing.</div>;
      case 'backupRestore': {
        const nurseryBackupData = { coralBranches, rules, sites, zones, anchors, trees, floats, activityLog, maintenanceLogs, tempLoggers, toDoItems };
        const speciesIdBackupData = { speciesList };
        return <BackupRestorePage 
                  onNavigateBack={() => setCurrentPage('dashboard')}
                  nurseryBackupData={nurseryBackupData}
                  speciesIdBackupData={speciesIdBackupData}
                  onWipeAllData={handleWipeAllData}
                  onRestoreNurseryData={handleRestoreNurseryData}
                  onRestoreSpeciesIdData={handleRestoreSpeciesIdData}
                  onResetToSampleData={handleResetToSampleData}
                  hasExistingData={coralBranches.length > 0}
               />;
      }
      case 'reports':
        return <ReportsPage onNavigateBack={() => setCurrentPage('dashboard')} coralBranches={coralBranches} />;
      case 'speciesId': {
        const selectedSpeciesId = pageData?.speciesId;
        return <SpeciesIdPage 
                speciesList={speciesList} 
                selectedSpeciesId={selectedSpeciesId || null}
                onOpenPhotoManager={(speciesId) => { setEditingSpeciesId(speciesId); setIsSpeciesModalOpen(true); }}
                onUpdateSpecies={handleUpdateSpecies}
                onAddSpecies={handleAddSpecies}
                onNavigateToSpeciesDetail={(speciesId) => handleNavigateToPage('speciesId', { speciesId })}
                onNavigateBack={() => handleNavigateToPage('speciesId')}
                onNavigateBackToMenu={() => setCurrentPage('dashboard')}
               />;
      }
      case 'archive':
        return <ArchivePage 
                activityLog={activityLog}
                activeSites={activeSites}
                archivedSites={archivedSites}
                activeZones={activeZones}
                archivedZones={archivedZones}
                activeAnchors={activeAnchors}
                archivedAnchors={archivedAnchors}
                activeTrees={activeTrees}
                archivedTrees={archivedTrees}
                activeBranches={activeBranches}
                archivedBranches={archivedBranches}
                onArchiveItem={handleArchiveItem}
                onClearLog={handleClearLog}
                onNavigateBack={() => setCurrentPage('dashboard')}
               />;
      case 'notesToDo':
        return <NotesToDoPage 
                toDoItems={toDoItems} 
                voiceNotes={voiceNotes} 
                onAddToDo={handleAddToDo} 
                onDeleteToDo={handleDeleteToDo} 
                onAddVoiceNote={handleAddVoiceNote} 
                onDeleteVoiceNote={handleDeleteVoiceNote} 
                onNavigateBack={() => setCurrentPage('dashboard')} 
               />;
      case 'monitoring':
        return <MonitoringPage 
                branches={activeBranches}
                sites={activeSites}
                trees={activeTrees}
                anchors={activeAnchors}
                onAddHealthReport={handleAddHealthReport}
                onNavigateBack={() => setCurrentPage('dashboard')}
                onSelectBranch={handleSelectBranch}
                onLogMaintenance={handleLogMaintenance}
               />;
      case 'trees':
        return <TreesPage
                sites={activeSites}
                anchors={activeAnchors}
                trees={activeTrees}
                floats={floats}
                branches={activeBranches}
                activityLog={activityLog}
                onAddTree={handleAddTree}
                onAddFloat={handleAddFloat}
                onMoveTreeUp={handleMoveTreeUp}
                onMoveTreeDown={handleMoveTreeDown}
                onMoveTree={handleMoveTree}
                onUpdateTreeNormalDepth={handleUpdateTreeNormalDepth}
                schedule={schedule}
                onGenerateSchedule={handleGenerateSchedule}
                onNavigateBack={() => handleNavigateToAddEdit('Trees')}
               />;
      case 'modelComparison':
        return <ModelComparisonPage onNavigateBack={() => setCurrentPage('dashboard')} />;
      case 'sites':
        return <SitesPage sites={activeSites} onAddSite={handleAddSite} onUpdateSite={handleUpdateSite} onNavigateBack={() => handleNavigateToAddEdit('Sites')} />;
      case 'anchors':
        return <AnchorsPage sites={activeSites} anchors={activeAnchors} onAddAnchor={handleAddAnchor} onNavigateBack={() => handleNavigateToAddEdit('Anchors')} />;
      case 'collectionZones':
        return <CollectionZonesPage sites={activeSites} zones={activeZones} onAddZone={handleAddCollectionZone} onNavigateBack={() => handleNavigateToAddEdit('Collection Zones')} />;
      case 'branches':
        return <BranchesPage
                sites={activeSites}
                anchors={activeAnchors}
                trees={activeTrees}
                branches={activeBranches}
                onAddBranch={handleAddBranch}
                onMoveBranch={handleMoveBranch}
                onSelectBranch={handleSelectBranch}
                onNavigateBack={() => handleNavigateToAddEdit('Branches')}
                initialBranchToMove={pageData?.branchToMove}
               />;
      case 'environmental':
        return <EnvironmentalPage 
                onNavigateBack={() => setCurrentPage('dashboard')}
                tempLoggers={tempLoggers}
                sites={activeSites}
                anchors={activeAnchors}
                onAddTempLogger={handleAddTempLogger}
                onRemoveTempLogger={handleRemoveTempLogger}
               />;
      case 'experiments':
        return <ExperimentsPage onNavigateToPage={handleNavigateToPage} />;
      case 'treeShadeExperiment':
        return <TreeShadeExperimentPage
                experiment={treeShadeExperiment}
                trees={activeTrees}
                branches={activeBranches}
                onStart={handleStartTreeShadeExperiment}
                onAddReport={handleAddTreeShadeReport}
                onEnd={handleEndTreeShadeExperiment}
                onNavigateBack={() => handleNavigateToPage('experiments')}
               />;
      case 'ropeOnRubbleExperiment':
      case 'squareRopeFrameExperiment':
      case 'cubeRopeFrameExperiment': {
        const studyMap = {
            'ropeOnRubbleExperiment': { study: ropeOnRubbleExperiment, id: 'ropeOnRubble', title: "Rope on Rubble" },
            'squareRopeFrameExperiment': { study: squareRopeFrameExperiment, id: 'squareRopeFrame', title: "Square Rope Frame" },
            'cubeRopeFrameExperiment': { study: cubeRopeFrameExperiment, id: 'cubeRopeFrame', title: "Cube Rope Frame" },
        };
        const { study, id, title } = studyMap[currentPage];
        const { handleStart, handleAddReport, handleEnd } = createStudyHandlers(id, study, title);
        return <LongTermStudyPage
                title={title}
                experiment={study}
                onStart={handleStart}
                onAddReport={handleAddReport}
                onEnd={handleEnd}
                onNavigateBack={() => handleNavigateToPage('experiments')}
               />;
      }
      case 'trends':
        return <TrendsPage
                coralBranches={coralBranches}
                maintenanceLogs={maintenanceLogs}
                sites={activeSites}
                trees={activeTrees}
                anchors={activeAnchors}
                onNavigateBack={() => setCurrentPage('dashboard')}
               />;
      case 'floatManagement':
        return <FloatManagementPage
                sites={activeSites}
                trees={activeTrees}
                floats={floats}
                branches={activeBranches}
                onAddFloat={handleAddFloat}
                onRemoveFloat={handleRemoveFloat}
                onNavigateBack={() => handleNavigateToAddEdit('Floats')}
               />;
      default:
        return <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-md">The content for page '{currentPage}' could not be rendered because the page logic is missing.</div>;
    }
  };

  return (
    <div className="flex min-h-screen font-sans bg-transparent">
      <SideMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        onNavigateToAddEdit={handleNavigateToAddEdit}
        onNavigateToPage={handleNavigateToPage}
      />
      <div className="flex-1 flex flex-col bg-transparent">
        <header className="flex justify-between items-center p-4 bg-white/70 backdrop-blur-md shadow-md z-10 sticky top-0">
          <button onClick={() => setIsMenuOpen(true)} className="p-2 rounded-md hover:bg-gray-100">
            <HamburgerIcon className="w-6 h-6 text-gray-600"/>
          </button>
          <h1 className="text-xl font-bold text-deep-sea">Coral Nursery Monitor</h1>
          <SyncStatusIndicator status={syncStatus} />
        </header>

        <main className="flex-1 p-4 sm:p-6 bg-transparent">
          {isInitialLoading ? (
            <div className="flex justify-center items-center h-full">
              <p>Loading data from cloud...</p>
            </div>
          ) : (
            renderPage()
          )}
        </main>
      </div>

      {editingBranch && (
        <EditBranchModal 
          branch={editingBranch}
          onUpdate={handleUpdateBranch}
          onClose={() => setEditingBranch(null)}
        />
      )}
      
      {(isBranchModalOpen || isSpeciesModalOpen) && (
        <PhotoManagerModal
            isOpen={isBranchModalOpen || isSpeciesModalOpen}
            onClose={() => { setIsBranchModalOpen(false); setIsSpeciesModalOpen(false); }}
            photos={(isBranchModalOpen ? activeBranch?.photos : speciesList.find(s=>s.id === editingSpeciesId)?.photos) || []}
            onAddPhotos={isBranchModalOpen ? handleBranchAddPhotos : handleSpeciesAddPhotos}
            onDeletePhotos={isBranchModalOpen ? handleBranchDeletePhotos : handleSpeciesDeletePhotos}
            onSetMainPhoto={isBranchModalOpen ? handleBranchSetMainPhoto : handleSpeciesSetMainPhoto}
        />
      )}

    </div>
  );
};

export default App;
