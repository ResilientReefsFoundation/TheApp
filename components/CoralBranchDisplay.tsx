import * as React from 'react';
import type { CoralBranch, ActivityLogItem } from '../types';
import { ArrowUpIcon, ChevronDownIcon, MinusIcon } from './Icons';
import HealthChart from './HealthChart';
import GrowthChart from './GrowthChart';

interface CoralBranchDisplayProps {
  branch: CoralBranch;
  activityLog: ActivityLogItem[];
  onOpenPhotoManager: () => void;
  onNavigateToHealthReports: () => void;
  onNavigateToGrowthReports: () => void;
  onEdit: (branch: CoralBranch) => void;
  onMove: (branch: CoralBranch) => void;
}

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


const getHealthStatus = (percentage: number): { color: string; textColor: string } => {
    // Exact values from monitoring page
    if (percentage === 100) return { color: 'bg-green-500', textColor: 'text-green-600' };
    if (percentage === 75) return { color: 'bg-yellow-400', textColor: 'text-yellow-500' };
    if (percentage === 50) return { color: 'bg-orange-400', textColor: 'text-orange-500' };
    if (percentage === 25) return { color: 'bg-orange-600', textColor: 'text-orange-700' };
    if (percentage === 0) return { color: 'bg-red-500', textColor: 'text-red-600' };
    
    // Fallback for other values
    if (percentage > 87.5) return { color: 'bg-green-500', textColor: 'text-green-600' };
    if (percentage > 62.5) return { color: 'bg-yellow-400', textColor: 'text-yellow-500' };
    if (percentage > 37.5) return { color: 'bg-orange-400', textColor: 'text-orange-500' };
    if (percentage > 0) return { color: 'bg-orange-600', textColor: 'text-orange-700' };
    return { color: 'bg-red-500', textColor: 'text-red-600' };
}

type Trend = 'up' | 'down' | 'stable' | 'na';

const getTrend = (reports: { date: string; value: number }[]): Trend => {
  if (reports.length < 2) {
    return 'na';
  }
  const sorted = [...reports].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const latest = sorted[0].value;
  const previous = sorted[1].value;

  if (latest > previous) return 'up';
  if (latest < previous) return 'down';
  return 'stable';
};


const InfoCard: React.FC<{ title: string; children: React.ReactNode; headerContent?: React.ReactNode }> = ({ title, children, headerContent }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg">
    <div className="flex justify-between items-baseline border-b-2 border-seafoam-green pb-2 mb-4">
        <h3 className="text-lg font-semibold text-deep-sea">{title}</h3>
        {headerContent}
    </div>
    {children}
  </div>
);

const DetailItem: React.FC<{ label: string; value?: string | number; children?: React.ReactNode }> = ({ label, value, children }) => (
  <div className="flex justify-between items-center py-1">
    <span className="text-gray-600">{label}</span>
    {value !== undefined && <span className="font-medium text-deep-sea text-right">{value}</span>}
    {children}
  </div>
);

const CoralBranchDisplay: React.FC<CoralBranchDisplayProps> = ({ branch, activityLog, onOpenPhotoManager, onNavigateToHealthReports, onNavigateToGrowthReports, onEdit, onMove }) => {
  const ageInDays = calculateAgeInDays(branch.dateAdded);
  const formattedAge = formatAge(ageInDays);
  const sortedHealthReports = [...branch.healthReports].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const latestHealthReport = sortedHealthReports[0];
  const sortedGrowthReports = [...branch.growthReports].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const latestGrowthReport = sortedGrowthReports[0];
  const mainPhoto = branch.photos.find(p => p.isMain) || branch.photos[0];

  const healthTrend = getTrend(branch.healthReports.map(r => ({ date: r.date, value: r.healthPercentage })));
  const growthTrend = getTrend(branch.growthReports.map(r => ({ date: r.date, value: r.surfaceAreaM2 })));
  
  const movementHistory = React.useMemo(() =>
    activityLog.filter(item => item.type === 'movement' && item.message.includes(`[${branch.id}]`)),
    [activityLog, branch.id]
  );

  const initialPlacementMessage = React.useMemo(() => {
    const initialLog = movementHistory.find(log => log.message.startsWith("Initial placement:"));
    if (!initialLog) return null;

    const parts = initialLog.message.split(' was added to ');
    if (parts.length > 1) {
        // Return only the location part, removing the final period.
        return `Installed: ${parts[1].replace(/\.$/, '')}`;
    }
    return null;
  }, [movementHistory]);


  const renderTrend = (trend: Trend) => {
    switch(trend) {
        case 'up':
            return <ArrowUpIcon className="w-5 h-5 text-green-600" />;
        case 'down':
            return <ChevronDownIcon className="w-5 h-5 text-red-600" />;
        case 'stable':
            return <MinusIcon className="w-5 h-5 text-gray-500" />;
        case 'na':
        default:
            return <span className="text-gray-500 text-sm">N/A</span>;
    }
  }

  return (
    <div className="space-y-8">
      <div className="p-6 bg-white rounded-xl shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start">
            <div>
              <h2 className="text-4xl font-bold text-ocean-blue">{branch.fragmentId}</h2>
              <p className="text-xl text-gray-600 mt-1 italic">{branch.genus} {branch.species}</p>
              <p className="text-md text-gray-500 mt-2">
                <span className="font-semibold">Location:</span> Tree {branch.tree}, Face {branch.face}, Position {branch.position} ({branch.anchor})
              </p>
            </div>
            
            {mainPhoto && (
                <div 
                    onClick={onOpenPhotoManager} 
                    className="mt-4 md:mt-0 md:ml-6 flex-shrink-0 cursor-pointer group"
                    aria-label="Open photo gallery"
                    role="button"
                >
                    <img 
                        src={mainPhoto.url} 
                        alt="Coral branch main photo" 
                        className="w-full aspect-video md:w-64 md:h-64 md:aspect-auto object-cover rounded-lg shadow-md transition-transform duration-300 transform group-hover:scale-105"
                    />
                </div>
            )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
           <div className="space-y-3">
            <div className="flex justify-between items-baseline py-1 flex-wrap">
                <div>
                    <span className="text-gray-600">Date Added: </span>
                    <span className="font-medium text-deep-sea">{new Date(branch.dateAdded).toLocaleDateString()}</span>
                </div>
                <div>
                    <span className="text-gray-600">Age: </span>
                    <span className="font-medium text-deep-sea">{formattedAge}</span>
                </div>
            </div>
            {latestHealthReport && (
                <DetailItem label="Status">
                    {(() => {
                        const status = getHealthStatus(latestHealthReport.healthPercentage);
                        return (
                            <span className={`font-medium flex items-center gap-2 ${status.textColor}`}>
                                <span className={`w-3 h-3 rounded-full ${status.color}`}></span>
                                {latestHealthReport.healthPercentage === 0 ? '0%' : `${latestHealthReport.healthPercentage}%`}
                            </span>
                        );
                    })()}
                </DetailItem>
            )}
             <DetailItem label="Health Trend">
                {renderTrend(healthTrend)}
             </DetailItem>
             <DetailItem label="Growth Trend">
                {renderTrend(growthTrend)}
             </DetailItem>
              {branch.isHeatTolerant && (
                <DetailItem label="Trait">
                    <span className="font-medium text-coral-pink bg-coral-pink/20 px-2 py-1 rounded-full text-sm">
                        Known Heat Tolerant
                    </span>
                </DetailItem>
            )}
          </div>
          <div className="mt-6 flex gap-4">
              <button onClick={() => onEdit(branch)} className="flex-1 bg-ocean-blue/10 hover:bg-ocean-blue/20 text-ocean-blue font-bold py-2 px-4 rounded-lg transition-colors">Edit Details</button>
              <button onClick={() => onMove(branch)} className="flex-1 bg-ocean-blue/10 hover:bg-ocean-blue/20 text-ocean-blue font-bold py-2 px-4 rounded-lg transition-colors">Move Branch</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InfoCard 
              title="Health History"
              headerContent={latestHealthReport && (
                <span className="text-sm font-normal text-gray-500">
                  Latest - {new Date(latestHealthReport.date).toLocaleDateString()}
                </span>
              )}
            >
              <HealthChart reports={branch.healthReports} />
              <div className="mt-4">
                <button 
                  onClick={onNavigateToHealthReports}
                  className="w-full text-sm bg-gray-200 hover:bg-gray-300 text-deep-sea font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  View All Health Reports
                </button>
              </div>
            </InfoCard>

            <InfoCard 
              title="Growth Data"
              headerContent={latestGrowthReport && (
                <span className="text-sm font-normal text-gray-500">
                  Latest - {new Date(latestGrowthReport.date).toLocaleDateString()}
                </span>
              )}
            >
              {latestGrowthReport ? (
                <>
                  <div className="space-y-3">
                    <DetailItem label="Surface Area" value={`${latestGrowthReport.surfaceAreaM2} m²`} />
                    <DetailItem label="Volume" value={`${latestGrowthReport.volumeM3} m³`} />
                  </div>
                  <div className="mt-4 pt-4 border-t">
                     <h4 className="font-semibold text-sm text-gray-600 mb-2">Growth History</h4>
                     <GrowthChart reports={branch.growthReports} />
                     <div className="mt-4">
                        <button
                          onClick={onNavigateToGrowthReports}
                          className="w-full text-sm bg-gray-200 hover:bg-gray-300 text-deep-sea font-semibold py-2 px-4 rounded-lg transition-colors"
                        >
                          View All Growth Reports
                        </button>
                     </div>
                   </div>
                </>
              ) : <p>No growth reports available.</p>}
            </InfoCard>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-8">
          <InfoCard title="Origin">
            <DetailItem label="Collection Site" value={branch.site} />
            <DetailItem label="Zone" value={branch.collectionZone} />
          </InfoCard>
           <InfoCard
                title="Movement History"
                headerContent={
                    initialPlacementMessage && <p className="text-xs text-right text-gray-500">{initialPlacementMessage}</p>
                }
            >
             {movementHistory.length > 0 ? (
                <ul className="space-y-3 text-sm max-h-48 overflow-y-auto">
                    {movementHistory.map(item => (
                        <li key={item.id} className="border-b pb-2 last:border-b-0">
                            <p className="font-semibold text-gray-700">{new Date(item.timestamp).toLocaleString()}</p>
                            <p className="text-gray-600">{item.message}</p>
                        </li>
                    ))}
                </ul>
             ) : (
                <p className="text-sm text-gray-500">No movement history recorded.</p>
             )}
           </InfoCard>
        </div>
      </div>
    </div>
  );
};

export default CoralBranchDisplay;