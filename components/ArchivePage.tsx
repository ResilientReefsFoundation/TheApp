import * as React from 'react';
import type { ActivityLogItem, CoralBranch, Site, CollectionZone, Anchor, Tree, LogType } from '../types';
import { ChevronDownIcon } from './Icons';

type ArchiveableItemType = 'Site' | 'Collection Zone' | 'Anchor' | 'Tree' | 'Branch';
const ARCHIVEABLE_ITEM_TYPES: ArchiveableItemType[] = ['Site', 'Collection Zone', 'Anchor', 'Tree', 'Branch'];

interface ArchivePageProps {
  activityLog: ActivityLogItem[];
  activeSites: Site[];
  archivedSites: Site[];
  activeZones: CollectionZone[];
  archivedZones: CollectionZone[];
  activeAnchors: Anchor[];
  archivedAnchors: Anchor[];
  activeTrees: Tree[];
  archivedTrees: Tree[];
  activeBranches: CoralBranch[];
  archivedBranches: CoralBranch[];
  onArchiveItem: (itemType: ArchiveableItemType, itemId: string) => void;
  onClearLog: () => void;
  onNavigateBack: () => void;
}

const LogSection: React.FC<{
  title: string;
  log: ActivityLogItem[];
  onExport: () => void;
}> = ({ title, log, onExport }) => {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <div>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2 bg-gray-50 p-2 rounded-t-lg border-b">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left">
                <h3 className="font-semibold text-gray-700 text-lg">{title} ({log.length})</h3>
                <ChevronDownIcon className={`w-5 h-5 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <button
                onClick={onExport}
                disabled={log.length === 0}
                className="text-sm bg-seafoam-green hover:bg-opacity-90 text-deep-sea font-semibold py-1 px-3 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed self-end sm:self-center"
            >
              Export
            </button>
        </div>
        {isOpen && (
            <div className="border border-t-0 rounded-b-lg max-h-96 overflow-y-auto bg-white">
              {log.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {log.map(item => (
                    <li key={item.id} className="p-3">
                      <p className="text-sm text-gray-800">{item.message}</p>
                      <p className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleString()}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500 p-8">No activity recorded for this category.</p>
              )}
            </div>
        )}
    </div>
  );
};


const ArchivePage: React.FC<ArchivePageProps> = ({ 
    activityLog,
    activeSites, archivedSites,
    activeZones, archivedZones,
    activeAnchors, archivedAnchors,
    activeTrees, archivedTrees,
    activeBranches, archivedBranches,
    onArchiveItem,
    onClearLog, 
    onNavigateBack 
}) => {
  const [itemType, setItemType] = React.useState<ArchiveableItemType | ''>('');
  const [itemId, setItemId] = React.useState('');

  const movementLog = React.useMemo(() => activityLog.filter(item => item.type === 'movement'), [activityLog]);
  const monitoringLog = React.useMemo(() => activityLog.filter(item => item.type === 'monitoring'), [activityLog]);
  const maintenanceLog = React.useMemo(() => activityLog.filter(item => item.type === 'maintenance'), [activityLog]);
  const generalLog = React.useMemo(() => activityLog.filter(item => item.type === 'general'), [activityLog]);


  const handleArchiveClick = () => {
    if (!itemType || !itemId) {
      alert('Please select an item type and an item to archive.');
      return;
    }
    onArchiveItem(itemType, itemId);
    setItemType('');
    setItemId('');
  };

  const handleExportLog = (log: ActivityLogItem[], type: LogType) => {
    const logContent = log
      .map(item => `${new Date(item.timestamp).toLocaleString()}: ${item.message}`)
      .join('\n');
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
    link.download = `${type}-log-${timestamp}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportAllLogs = () => {
    const logContent = activityLog
      .map(item => `${new Date(item.timestamp).toLocaleString()}: [${item.type.toUpperCase()}] ${item.message}`)
      .join('\n');
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
    link.download = `all-activity-logs-${timestamp}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClearLog = () => {
    if (window.confirm('Are you sure you want to permanently clear ALL activity logs? This action cannot be undone.')) {
      if (window.confirm('FINAL WARNING: ALL activity logs will be permanently deleted. Proceed?')) {
        onClearLog();
        alert('All activity logs have been cleared.');
      }
    }
  };

  const getActiveItemsForType = () => {
    switch(itemType) {
        case 'Site': return activeSites;
        case 'Collection Zone': return activeZones;
        case 'Anchor': return activeAnchors;
        case 'Tree': return activeTrees;
        case 'Branch': return activeBranches;
        default: return [];
    }
  }

  const archivedItems = [
    ...archivedSites.map(i => ({...i, type: 'Site', name: i.name})),
    ...archivedZones.map(i => ({...i, type: 'Collection Zone', name: i.name})),
    ...archivedAnchors.map(i => ({...i, type: 'Anchor', name: i.name})),
    ...archivedTrees.map(i => ({...i, type: 'Tree', name: `Tree #${i.number}`})),
    ...archivedBranches.map(i => ({...i, type: 'Branch', name: i.fragmentId})),
  ];


  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b pb-4">
        <h2 className="text-2xl font-bold text-deep-sea mb-2 sm:mb-0">Archive / Logs</h2>
        <button
          onClick={onNavigateBack}
          className="bg-gray-200 hover:bg-gray-300 text-deep-sea font-bold py-2 px-4 rounded-lg transition-colors duration-200 self-start sm:self-center"
        >
          &larr; Back to Details
        </button>
      </div>
      
      {/* Archive Section */}
      <div className="p-4 border rounded-lg space-y-4 bg-gray-50">
        <h3 className="font-semibold text-gray-700 text-lg">Archive an Item</h3>
        <p className="text-sm text-gray-500">
          Archiving an item will remove it from all active lists. If you archive a branch, a reminder to collect a replacement will be created.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="itemTypeSelect" className="block text-sm font-medium text-gray-700">1. Select Item Type</label>
            <select 
              id="itemTypeSelect" 
              value={itemType}
              onChange={e => { setItemType(e.target.value as ArchiveableItemType); setItemId(''); }}
              className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900"
            >
              <option value="">-- Choose type --</option>
              {ARCHIVEABLE_ITEM_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="itemToArchiveSelect" className="block text-sm font-medium text-gray-700">2. Select Item to Archive</label>
            <select 
              id="itemToArchiveSelect" 
              value={itemId}
              onChange={e => setItemId(e.target.value)}
              disabled={!itemType}
              className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white disabled:bg-gray-100 text-gray-900"
            >
              <option value="">-- Pick an item --</option>
              {getActiveItemsForType().map(item => (
                <option key={item.id} value={item.id}>
                    {itemType === 'Tree' ? `Tree #${(item as Tree).number}` : (item as any).name || (item as CoralBranch).fragmentId}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-start md:justify-end">
            <button 
              onClick={handleArchiveClick}
              disabled={!itemId}
              className="bg-ocean-blue hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 disabled:bg-gray-400"
            >
              Archive Item
            </button>
          </div>
        </div>
      </div>
      
      {/* Archived Items List */}
      <div>
        <h3 className="font-semibold text-gray-700 text-lg mb-4">Archived Items</h3>
        <div className="border rounded-lg max-h-96 overflow-y-auto bg-gray-50">
          {archivedItems.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {archivedItems.map(item => (
                <li key={`${item.type}-${item.id}`} className="p-3">
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.type}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 p-8">No items have been archived yet.</p>
          )}
        </div>
      </div>

      {/* Activity Log Sections */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 border-b pb-4">
            <h3 className="font-semibold text-gray-700 text-lg">All Logs</h3>
            <div className="flex gap-2">
                <button
                    onClick={handleExportAllLogs}
                    disabled={activityLog.length === 0}
                    className="text-sm bg-seafoam-green hover:bg-opacity-90 text-deep-sea font-semibold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    Export All Logs
                </button>
                <button
                    onClick={handleClearLog}
                    disabled={activityLog.length === 0}
                    className="text-sm bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    Clear All Logs
                </button>
            </div>
        </div>
        <LogSection title="Movement Log" log={movementLog} onExport={() => handleExportLog(movementLog, 'movement')} />
        <LogSection title="Monitoring Log" log={monitoringLog} onExport={() => handleExportLog(monitoringLog, 'monitoring')} />
        <LogSection title="Maintenance Log" log={maintenanceLog} onExport={() => handleExportLog(maintenanceLog, 'maintenance')} />
        <LogSection title="General Activity Log" log={generalLog} onExport={() => handleExportLog(generalLog, 'general')} />
      </div>
    </div>
  );
};

export default ArchivePage;