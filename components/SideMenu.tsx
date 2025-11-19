
import * as React from 'react';
import type { AddEditSection, Page } from '../types';
import { CloseIcon, PencilIcon, ClipboardListIcon, DatabaseIcon, ChartBarIcon, BookOpenIcon, ArchiveBoxIcon, PencilSquareIcon, HeartPulseIcon, Square2StackIcon, ThermometerIcon, HomeIcon, BeakerIcon, TrendingUpIcon } from './Icons';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToAddEdit: (section: AddEditSection) => void;
  onNavigateToPage: (page: Page) => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, onNavigateToAddEdit, onNavigateToPage }) => {
  const handleAddEditNav = (section: AddEditSection) => {
    onNavigateToAddEdit(section);
    onClose();
  };
  
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Side Menu */}
      <div
        className={`fixed top-0 left-0 h-full bg-white w-64 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-title"
      >
        <div className="flex flex-col h-full">
          <header className="p-4 flex justify-between items-center border-b">
            <h2 id="menu-title" className="text-lg font-bold text-deep-sea">Menu</h2>
            <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100" aria-label="Close menu">
              <CloseIcon className="w-6 h-6 text-gray-600" />
            </button>
          </header>
          <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
              <button
                onClick={() => onNavigateToPage('dashboard')}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-left text-deep-sea hover:bg-ocean-blue/10 transition-colors"
              >
                <HomeIcon className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => onNavigateToPage('notesToDo')}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-left text-deep-sea hover:bg-ocean-blue/10 transition-colors"
              >
                <PencilSquareIcon className="w-5 h-5" />
                <span>Notes / ToDo</span>
              </button>
              <button
                onClick={() => handleAddEditNav('Sites')}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-left text-deep-sea hover:bg-ocean-blue/10 transition-colors"
              >
                <PencilIcon className="w-5 h-5" />
                <span>Add/Edit/Move</span>
              </button>
              <button
                onClick={() => onNavigateToPage('monitoring')}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-left text-deep-sea hover:bg-ocean-blue/10 transition-colors"
              >
                <HeartPulseIcon className="w-5 h-5" />
                <span>Monitoring/Maintenance</span>
              </button>
               <button
                onClick={() => onNavigateToPage('environmental')}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-left text-deep-sea hover:bg-ocean-blue/10 transition-colors"
              >
                <ThermometerIcon className="w-5 h-5" />
                <span>Environmental</span>
              </button>
              <button
                onClick={() => onNavigateToPage('speciesId')}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-left text-deep-sea hover:bg-ocean-blue/10 transition-colors"
              >
                <BookOpenIcon className="w-5 h-5" />
                <span>Species ID</span>
              </button>
              <button
                onClick={() => onNavigateToPage('reports')}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-left text-deep-sea hover:bg-ocean-blue/10 transition-colors"
              >
                <ChartBarIcon className="w-5 h-5" />
                <span>Reports</span>
              </button>
              <button
                onClick={() => onNavigateToPage('rules')}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-left text-deep-sea hover:bg-ocean-blue/10 transition-colors"
              >
                <ClipboardListIcon className="w-5 h-5" />
                <span>Rules</span>
              </button>
              <button
                onClick={() => onNavigateToPage('trends')}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-left text-deep-sea hover:bg-ocean-blue/10 transition-colors"
              >
                <TrendingUpIcon className="w-5 h-5" />
                <span>Trends</span>
              </button>
               <button
                onClick={() => onNavigateToPage('modelComparison')}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-left text-deep-sea hover:bg-ocean-blue/10 transition-colors"
              >
                <Square2StackIcon className="w-5 h-5" />
                <span>3D Model View/Compare</span>
              </button>
              <button
                onClick={() => onNavigateToPage('experiments')}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-left text-deep-sea hover:bg-ocean-blue/10 transition-colors"
              >
                <BeakerIcon className="w-5 h-5" />
                <span>Experiments</span>
              </button>
               <button
                onClick={() => onNavigateToPage('archive')}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-left text-deep-sea hover:bg-ocean-blue/10 transition-colors"
              >
                <ArchiveBoxIcon className="w-5 h-5" />
                <span>Archive/Logs</span>
              </button>
              <button
                onClick={() => onNavigateToPage('backupRestore')}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-left text-deep-sea hover:bg-ocean-blue/10 transition-colors"
              >
                <DatabaseIcon className="w-5 h-5" />
                <span>Backup / Restore</span>
              </button>
          </nav>
        </div>
      </div>
    </>
  );
};

export default SideMenu;
