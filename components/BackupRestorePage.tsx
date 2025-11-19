
import * as React from 'react';
import type { ChangeEvent } from 'react';
import type { CoralBranch, Rule, Site, CollectionZone, Anchor, Tree, Float, Species } from '../types';

export interface NurseryBackupData {
  coralBranches: CoralBranch[];
  rules: Rule[];
  sites: Site[];
  zones: CollectionZone[];
  anchors: Anchor[];
  trees: Tree[];
  floats: Float[];
}

export interface SpeciesIdBackupData {
    speciesList: Species[];
}

interface BackupRestorePageProps {
  onNavigateBack: () => void;
  nurseryBackupData: NurseryBackupData;
  speciesIdBackupData: SpeciesIdBackupData;
  onWipeAllData: () => void;
  onRestoreNurseryData: (data: NurseryBackupData) => void;
  onRestoreSpeciesIdData: (data: SpeciesIdBackupData) => void;
  onResetToSampleData: () => void;
  hasExistingData: boolean;
}

const BackupRestorePage: React.FC<BackupRestorePageProps> = ({ 
  onNavigateBack, 
  nurseryBackupData,
  speciesIdBackupData,
  onWipeAllData, 
  onRestoreNurseryData,
  onRestoreSpeciesIdData,
  onResetToSampleData,
  hasExistingData
}) => {
  const [deleteConfirmText, setDeleteConfirmText] = React.useState('');
  const restoreNurseryFileInputRef = React.useRef<HTMLInputElement>(null);
  const restoreSpeciesIdFileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDownloadNurseryData = () => {
    const backupJson = JSON.stringify(nurseryBackupData, null, 2);
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
    link.download = `coral-nursery-data-backup-${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadSpeciesIdData = () => {
    const backupJson = JSON.stringify(speciesIdBackupData, null, 2);
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
    link.download = `coral-species-id-backup-${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRestoreFileChange = (e: ChangeEvent<HTMLInputElement>, restoreType: 'nursery' | 'speciesId') => {
    const file = e.target.files?.[0];
    if (file) {
      const confirmationMessage = restoreType === 'nursery'
        ? 'Are you sure you want to restore nursery data from this file? This will overwrite/merge with current cloud data.'
        : 'Are you sure you want to restore Species ID data from this file? This will overwrite/merge with current Species ID data.';

      if (window.confirm(confirmationMessage)) {
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const result = event.target?.result;
              if (typeof result === 'string') {
                const parsedData = JSON.parse(result);
                if (restoreType === 'nursery') {
                    if (!parsedData.coralBranches) throw new Error("File does not appear to be a valid nursery data backup.");
                    onRestoreNurseryData(parsedData);
                } else { // speciesId
                    if (!parsedData.speciesList) throw new Error("File does not appear to be a valid Species ID backup.");
                    onRestoreSpeciesIdData(parsedData);
                }
              }
            } catch (error) {
              alert(`Failed to read or parse backup file. Please ensure it is a valid backup. Error: ${error instanceof Error ? error.message : "Unknown error"}`);
            }
          };
          reader.readAsText(file);
      }
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleWipeData = () => {
    if (deleteConfirmText === 'DELETE') {
      if (window.confirm('Are you absolutely sure you want to wipe all tracking data from the CLOUD database? This action affects ALL users immediately. Species ID library and Rules will be preserved.')) {
        onWipeAllData();
        setDeleteConfirmText('');
      }
    }
  };

  const handleToggleSampleData = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
        if(window.confirm('Load sample data into the live Cloud database?')) {
            onResetToSampleData();
        }
    } else {
        if (window.confirm('Turning off sample data will wipe all current tracking data from the CLOUD (Species Library preserved). Are you sure?')) {
            onWipeAllData();
        } else {
            e.preventDefault(); // prevent toggle switch from changing visual state
        }
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b pb-4">
        <h2 className="text-2xl font-bold text-deep-sea mb-2 sm:mb-0">Data Management</h2>
        <button
          onClick={onNavigateBack}
          className="bg-gray-200 hover:bg-gray-300 text-deep-sea font-bold py-2 px-4 rounded-lg transition-colors duration-200 self-start sm:self-center"
        >
          &larr; Back to Dashboard
        </button>
      </div>

       {/* Local Backup & Restore */}
      <div className="p-4 border rounded-lg space-y-4">
        <h3 className="font-semibold text-gray-700 text-lg">Cloud Backup & Restore</h3>
        <p className="text-sm text-gray-500">Download a snapshot of your Firestore data, or restore from a JSON file.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border rounded-lg space-y-3 flex flex-col bg-gray-50">
              <h4 className="font-semibold text-gray-700">Nursery Data</h4>
              <p className="text-sm text-gray-500 flex-grow">All coral, site, tree, and rules information.</p>
              <div className="flex flex-col gap-3">
                <button onClick={handleDownloadNurseryData} className="bg-seafoam-green hover:bg-opacity-90 text-deep-sea font-bold py-2 px-4 rounded-lg">Download Nursery Data</button>
                <button onClick={() => restoreNurseryFileInputRef.current?.click()} className="bg-gray-200 hover:bg-gray-300 text-deep-sea font-bold py-2 px-4 rounded-lg">Restore from File</button>
                <input type="file" ref={restoreNurseryFileInputRef} className="hidden" accept=".json" onChange={(e) => handleRestoreFileChange(e, 'nursery')} />
              </div>
            </div>
            <div className="p-4 border rounded-lg space-y-3 flex flex-col bg-gray-50">
              <h4 className="font-semibold text-gray-700">Species ID Data</h4>
              <p className="text-sm text-gray-500 flex-grow">Your species identification photos and notes.</p>
              <div className="flex flex-col gap-3">
                <button onClick={handleDownloadSpeciesIdData} className="bg-seafoam-green hover:bg-opacity-90 text-deep-sea font-bold py-2 px-4 rounded-lg">Download Species ID Data</button>
                <button onClick={() => restoreSpeciesIdFileInputRef.current?.click()} className="bg-gray-200 hover:bg-gray-300 text-deep-sea font-bold py-2 px-4 rounded-lg">Restore from File</button>
                <input type="file" ref={restoreSpeciesIdFileInputRef} className="hidden" accept=".json" onChange={(e) => handleRestoreFileChange(e, 'speciesId')}/>
              </div>
            </div>
        </div>
      </div>
      
      {/* Sample Data Toggle */}
      <div className="p-4 border rounded-lg space-y-4 bg-gray-50">
        <div className="flex items-center justify-between">
            <div>
                <h3 className="font-semibold text-gray-700 text-lg">Sample Data</h3>
                <p className="text-sm text-gray-500">Enable to populate the app with demo data. Disable to wipe tracking data (keeps species/rules).</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={hasExistingData} 
                    onChange={handleToggleSampleData} 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ocean-blue"></div>
                <span className="ml-3 text-sm font-medium text-gray-900">{hasExistingData ? 'On' : 'Off'}</span>
            </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-4 border border-red-500 rounded-lg space-y-4">
        <h3 className="font-bold text-red-700 text-lg">Danger Zone</h3>
        <div>
          <label htmlFor="deleteConfirm" className="block text-sm font-medium text-gray-700">
            To wipe all CLOUD tracking data (Sites, Trees, Logs, Voice Notes) while <strong>keeping Rules and Species ID data</strong>, type "DELETE" below and click the button.
          </label>
          <input
            type="text"
            id="deleteConfirm"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            className="mt-1 block w-full rounded-md border border-red-500 shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm p-2"
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleWipeData}
            disabled={deleteConfirmText !== 'DELETE'}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Wipe Tracking Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackupRestorePage;
