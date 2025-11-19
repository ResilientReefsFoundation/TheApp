import * as React from 'react';
import type { CoralBranch } from '../types';
import { ChartBarIcon, CalendarDaysIcon, CloseIcon } from './Icons';

interface ReportsPageProps {
  onNavigateBack: () => void;
  coralBranches: CoralBranch[];
}

// More detailed stats for the new configurable report
interface ReportStats {
  newBranches: number;
  newTrees: number;
  newCollectionZones: number;
  extraFloatsAdded: number;
  healthChecksDone: number;
  growthChecksDone: number;
  newSpeciesAdded: number;
  newGenusAdded: number;
  branchesRemovedAndReplaced: number;
}

interface ReportData {
  title: string;
  stats: ReportStats;
}

// Mock data as historical data is not available in the app's state for some items
const MOCK_REPORTS_DATA: ReportData[] = [
  { title: "Last Month", stats: { newBranches: 12, newTrees: 2, newCollectionZones: 1, extraFloatsAdded: 3, healthChecksDone: 50, growthChecksDone: 25, newSpeciesAdded: 1, newGenusAdded: 0, branchesRemovedAndReplaced: 5 } },
  { title: "Last 2 Months", stats: { newBranches: 25, newTrees: 4, newCollectionZones: 1, extraFloatsAdded: 5, healthChecksDone: 110, growthChecksDone: 55, newSpeciesAdded: 2, newGenusAdded: 1, branchesRemovedAndReplaced: 8 } },
  { title: "Last 3 Months", stats: { newBranches: 38, newTrees: 5, newCollectionZones: 2, extraFloatsAdded: 5, healthChecksDone: 160, growthChecksDone: 80, newSpeciesAdded: 2, newGenusAdded: 1, branchesRemovedAndReplaced: 10 } },
  { title: "Last 4 Months", stats: { newBranches: 50, newTrees: 7, newCollectionZones: 2, extraFloatsAdded: 6, healthChecksDone: 210, growthChecksDone: 105, newSpeciesAdded: 3, newGenusAdded: 2, branchesRemovedAndReplaced: 12 } },
  { title: "Last 6 Months", stats: { newBranches: 75, newTrees: 10, newCollectionZones: 3, extraFloatsAdded: 8, healthChecksDone: 300, growthChecksDone: 150, newSpeciesAdded: 4, newGenusAdded: 2, branchesRemovedAndReplaced: 18 } },
  { title: "Last 12 Months", stats: { newBranches: 150, newTrees: 22, newCollectionZones: 5, extraFloatsAdded: 15, healthChecksDone: 650, growthChecksDone: 325, newSpeciesAdded: 7, newGenusAdded: 3, branchesRemovedAndReplaced: 30 } },
];

type ReportConfig = {
    [K in keyof ReportStats]: boolean;
}

const reportStatLabels: { [K in keyof ReportStats]: string } = {
    newBranches: "New Branches",
    newTrees: "New Trees",
    newCollectionZones: "New Collection Zones",
    extraFloatsAdded: "Extra Floats Added",
    healthChecksDone: "Health Checks Done",
    growthChecksDone: "Growth Checks Done",
    newSpeciesAdded: "New Species Added",
    newGenusAdded: "New Genus Added",
    branchesRemovedAndReplaced: "Branches Removed/Replaced",
};

interface HealthBreakdown {
    '100%': number;
    '75%': number;
    '50%': number;
    '25%': number;
    '0%': number;
}

const calculateHealthBreakdown = (branches: CoralBranch[]): HealthBreakdown => {
    const breakdown: HealthBreakdown = { '100%': 0, '75%': 0, '50%': 0, '25%': 0, '0%': 0 };
    branches.forEach(branch => {
        const latestReport = branch.healthReports.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        if (latestReport) {
            const p = latestReport.healthPercentage;
            if (p > 87.5) breakdown['100%']++;
            else if (p > 62.5) breakdown['75%']++;
            else if (p > 37.5) breakdown['50%']++;
            else if (p > 0) breakdown['25%']++;
            else if (p === 0) breakdown['0%']++;
        }
    });
    return breakdown;
};

const healthStatusColors: { [key: string]: string } = {
    '100%': 'bg-green-500',
    '75%': 'bg-yellow-400',
    '50%': 'bg-orange-400',
    '25%': 'bg-orange-600',
    '0%': 'bg-red-500',
};

const ReportModal: React.FC<{ 
    report: ReportData; 
    config: ReportConfig;
    healthBreakdown: HealthBreakdown;
    onClose: () => void 
}> = ({ report, config, healthBreakdown, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative">
        <header className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-deep-sea">{report.title} Report</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <CloseIcon className="w-6 h-6"/>
          </button>
        </header>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-3 text-md">
             {Object.keys(config).map(key => {
                const statKey = key as keyof ReportStats;
                const value = report.stats[statKey];
                if (config[statKey] && value > 0) {
                    return (
                        <div className="flex justify-between" key={statKey}>
                          <span className="text-gray-600">{reportStatLabels[statKey]}:</span>
                          <span className="font-semibold text-deep-sea text-lg">{value}</span>
                        </div>
                    );
                }
                return null;
             })}
          </div>

          <div className="mt-6 pt-4 border-t">
            <h3 className="font-semibold text-gray-700 text-lg mb-3">Current Health Status</h3>
            <div className="flex justify-around items-center text-center text-xs">
                {Object.entries(healthBreakdown).map(([status, count]) => (
                    <div key={status} className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full ${healthStatusColors[status]} flex items-center justify-center font-bold text-white shadow-md`}>
                            {count}
                        </div>
                        <span className="mt-1 capitalize text-gray-600">{status}</span>
                    </div>
                ))}
            </div>
          </div>
        </div>
        <footer className="p-4 bg-gray-50 rounded-b-2xl text-right">
             <button
                onClick={onClose}
                className="bg-ocean-blue hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Done
              </button>
        </footer>
      </div>
    </div>
  );
};


const ReportsPage: React.FC<ReportsPageProps> = ({ onNavigateBack, coralBranches }) => {
  const [selectedReport, setSelectedReport] = React.useState<ReportData | null>(null);
  const [reportConfig, setReportConfig] = React.useState<ReportConfig>({
    newBranches: true,
    newTrees: true,
    newCollectionZones: true,
    extraFloatsAdded: true,
    healthChecksDone: true,
    growthChecksDone: true,
    newSpeciesAdded: true,
    newGenusAdded: true,
    branchesRemovedAndReplaced: true,
  });

  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setReportConfig(prev => ({ ...prev, [name]: checked }));
  };
  
  const healthBreakdown = React.useMemo(() => calculateHealthBreakdown(coralBranches), [coralBranches]);
  
  const handleGenerateCustomReport = () => {
    if (!startDate || !endDate) {
        alert('Please select both a start and end date.');
        return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end day

    if (start > end) {
        alert('Start date cannot be after end date.');
        return;
    }
    
    const stats: ReportStats = {
      newBranches: 0, newTrees: 0, newCollectionZones: 0, extraFloatsAdded: 0,
      healthChecksDone: 0, growthChecksDone: 0, newSpeciesAdded: 0,
      newGenusAdded: 0, branchesRemovedAndReplaced: 0
    };

    coralBranches.forEach(branch => {
        const addedDate = new Date(branch.dateAdded);
        if (addedDate >= start && addedDate <= end) {
            stats.newBranches++;
        }
        branch.healthReports.forEach(report => {
            const reportDate = new Date(report.date);
            if (reportDate >= start && reportDate <= end) {
                stats.healthChecksDone++;
            }
        });
        branch.growthReports.forEach(report => {
            const reportDate = new Date(report.date);
            if (reportDate >= start && reportDate <= end) {
                stats.growthChecksDone++;
            }
        });
    });

    // Note: Other stats are placeholders as their creation dates are not tracked.
    
    setSelectedReport({
        title: `Custom Report: ${startDate} to ${endDate}`,
        stats,
    });
  };


  return (
    <>
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg space-y-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b pb-4">
          <h2 className="text-2xl font-bold text-deep-sea mb-2 sm:mb-0">Reports</h2>
          <button
            onClick={onNavigateBack}
            className="bg-gray-200 hover:bg-gray-300 text-deep-sea font-bold py-2 px-4 rounded-lg transition-colors duration-200 self-start sm:self-center"
          >
            &larr; Back to Details
          </button>
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-4">
              <ChartBarIcon className="w-6 h-6 text-ocean-blue" />
              <h3 className="text-xl font-semibold text-gray-700">Quick Reports</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {MOCK_REPORTS_DATA.map(report => (
              <button
                key={report.title}
                onClick={() => setSelectedReport(report)}
                className="p-4 bg-gray-50 hover:bg-ocean-blue/10 border border-gray-200 rounded-lg text-left transition-colors shadow-sm hover:shadow-md"
              >
                <h4 className="font-semibold text-deep-sea">{report.title}</h4>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t pt-8">
            <div className="flex items-center gap-2 mb-4">
                <CalendarDaysIcon className="w-6 h-6 text-seafoam-green" />
                <h3 className="text-xl font-semibold text-gray-700">Custom Reports</h3>
            </div>
            <div className="p-4 bg-gray-50 border rounded-lg space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900"/>
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                  <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900"/>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                    onClick={handleGenerateCustomReport}
                    className="bg-seafoam-green hover:bg-opacity-90 text-deep-sea font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                    Generate Custom Report
                </button>
              </div>
            </div>
        </div>

        {/* Report Configuration */}
        <div className="p-4 border rounded-lg bg-gray-50 border-t pt-8">
            <h3 className="font-semibold text-gray-700 text-lg mb-3">Report Contents</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                {Object.keys(reportConfig).map(key => (
                    <label key={key} className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            name={key}
                            checked={reportConfig[key as keyof ReportConfig]}
                            onChange={handleConfigChange}
                            className="h-4 w-4 rounded border border-ocean-blue text-ocean-blue focus:ring-ocean-blue"
                        />
                        <span className="text-sm text-gray-700">{reportStatLabels[key as keyof ReportStats]}</span>
                    </label>
                ))}
            </div>
        </div>

      </div>

      {selectedReport && (
        <ReportModal 
            report={selectedReport} 
            config={reportConfig}
            healthBreakdown={healthBreakdown}
            onClose={() => setSelectedReport(null)} 
        />
      )}
    </>
  );
};

export default ReportsPage;