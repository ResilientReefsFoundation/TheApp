import * as React from 'react';
import type { FormEvent } from 'react';
import { SunIcon, GlobeAltIcon, ArrowUpIcon, ChevronDownIcon, TrashIcon } from './Icons';
import type { TemperatureLogger, Site, Anchor } from '../types';

interface EnvironmentalPageProps {
  onNavigateBack: () => void;
  tempLoggers: TemperatureLogger[];
  sites: Site[];
  anchors: Anchor[];
  onAddTempLogger: (siteId: string, anchorId: string, depth: number) => void;
  onRemoveTempLogger: (loggerId: string) => void;
}

const DataUploadCard: React.FC<{ title: string; description: string; }> = ({ title, description }) => (
    <div className="p-4 border rounded-lg space-y-3 bg-gray-50">
        <h3 className="font-semibold text-gray-700 text-lg">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
        <div className="flex justify-end pt-2">
            <input
                type="file"
                className="block w-full text-sm text-deep-sea bg-white rounded-lg border border-ocean-blue cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-ocean-blue/10 file:text-ocean-blue hover:file:bg-ocean-blue/20"
            />
        </div>
    </div>
);

interface TideData {
    currentHeight: number;
    trend: 'rising' | 'falling';
    nextHigh: { time: string; height: number };
    nextLow: { time: string; height: number };
}

interface UvData {
    currentIndex: number;
    maxIndex: number;
}

const getUvInfo = (index: number): { level: string; color: string; textColor: string; } => {
    if (index <= 2) return { level: 'Low', color: 'bg-green-500', textColor: 'text-green-600' };
    if (index <= 5) return { level: 'Moderate', color: 'bg-yellow-500', textColor: 'text-yellow-600' };
    if (index <= 7) return { level: 'High', color: 'bg-orange-500', textColor: 'text-orange-600' };
    if (index <= 10) return { level: 'Very High', color: 'bg-red-500', textColor: 'text-red-600' };
    return { level: 'Extreme', color: 'bg-purple-600', textColor: 'text-purple-700' };
};

const LiveDataCardSkeleton: React.FC = () => (
    <div className="p-4 border rounded-lg bg-gray-50 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-10 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
    </div>
);


const EnvironmentalPage: React.FC<EnvironmentalPageProps> = ({
  onNavigateBack,
  tempLoggers,
  sites: activeSites,
  anchors: activeAnchors,
  onAddTempLogger,
  onRemoveTempLogger
}) => {
    const [tideData, setTideData] = React.useState<TideData | null>(null);
    const [uvData, setUvData] = React.useState<UvData | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    // Form state for new temp logger
    const [loggerSiteId, setLoggerSiteId] = React.useState('');
    const [loggerAnchorId, setLoggerAnchorId] = React.useState('');
    const [loggerDepth, setLoggerDepth] = React.useState('');

    React.useEffect(() => {
        setIsLoading(true);
        // Simulate fetching data
        const timer = setTimeout(() => {
            setTideData({
                currentHeight: 1.82,
                trend: 'falling',
                nextHigh: { time: '08:45 PM', height: 2.5 },
                nextLow: { time: '02:30 PM', height: 0.9 },
            });
            setUvData({
                currentIndex: 7,
                maxIndex: 12,
            });
            setIsLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    const handleAddLoggerSubmit = (e: FormEvent) => {
        e.preventDefault();
        const depthNum = parseFloat(loggerDepth);
        if (!loggerSiteId || !loggerAnchorId || isNaN(depthNum) || depthNum < 0) {
            alert('Please select a site, anchor, and enter a valid depth.');
            return;
        }
        onAddTempLogger(loggerSiteId, loggerAnchorId, depthNum);
        // Reset form
        setLoggerSiteId('');
        setLoggerAnchorId('');
        setLoggerDepth('');
    };

    const uvInfo = uvData ? getUvInfo(uvData.currentIndex) : null;
    const filteredAnchors = loggerSiteId ? activeAnchors.filter(a => a.siteId === loggerSiteId) : [];

    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg space-y-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b pb-4">
                <h2 className="text-2xl font-bold text-deep-sea mb-2 sm:mb-0">Environmental Monitoring</h2>
                <button
                    onClick={onNavigateBack}
                    className="bg-gray-200 hover:bg-gray-300 text-deep-sea font-bold py-2 px-4 rounded-lg transition-colors duration-200 self-start sm:self-center"
                >
                    &larr; Back to Details
                </button>
            </div>
            
            {/* Live Data Section */}
            <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Live Environmental Data</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isLoading || !tideData ? (
                        <LiveDataCardSkeleton />
                    ) : (
                        <div className="p-4 border rounded-lg bg-gray-50">
                            <h4 className="font-semibold text-gray-700 text-lg flex items-center gap-2">
                                <GlobeAltIcon className="w-6 h-6 text-ocean-blue" />
                                Tide Information
                            </h4>
                            <div className="mt-3">
                                <p className="text-4xl font-bold text-deep-sea">{tideData.currentHeight}m</p>
                                <div className="flex items-center gap-2 text-sm">
                                    {tideData.trend === 'falling' ? <ChevronDownIcon className="w-5 h-5 text-red-500" /> : <ArrowUpIcon className="w-5 h-5 text-green-500" />}
                                    <span>Currently {tideData.trend}</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-2">
                                    <p>Next Low: {tideData.nextLow.height}m at {tideData.nextLow.time}</p>
                                    <p>Next High: {tideData.nextHigh.height}m at {tideData.nextHigh.time}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {isLoading || !uvData || !uvInfo ? (
                        <LiveDataCardSkeleton />
                    ) : (
                        <div className="p-4 border rounded-lg bg-gray-50">
                            <h4 className="font-semibold text-gray-700 text-lg flex items-center gap-2">
                                <SunIcon className="w-6 h-6 text-yellow-500" />
                                UV Index
                            </h4>
                            <div className="mt-3">
                                <p className={`text-4xl font-bold ${uvInfo.textColor}`}>{uvData.currentIndex}</p>
                                <p className="text-sm">
                                    <span className={`font-semibold ${uvInfo.textColor}`}>{uvInfo.level}</span> out of {uvData.maxIndex}
                                </p>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                    <div className={`${uvInfo.color} h-2.5 rounded-full`} style={{ width: `${(uvData.currentIndex / uvData.maxIndex) * 100}%` }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Data Upload Section */}
            <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Data Upload</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DataUploadCard 
                        title="Upload Temperature Data"
                        description="Upload .csv or .xlsx files from your temperature loggers."
                    />
                    <DataUploadCard 
                        title="Upload Water Quality Data"
                        description="Upload lab results or data from water quality monitoring devices."
                    />
                </div>
            </div>
            
            {/* Temperature Logger Management */}
            <div className="space-y-6">
                <form onSubmit={handleAddLoggerSubmit} className="p-4 border rounded-lg space-y-4 bg-gray-50">
                    <h3 className="font-semibold text-gray-700 text-lg">Register New Temperature Logger</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                            <label htmlFor="loggerSite" className="block text-sm font-medium text-gray-700">Site</label>
                            <select id="loggerSite" value={loggerSiteId} onChange={e => {setLoggerSiteId(e.target.value); setLoggerAnchorId('');}} required className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900">
                                <option value="">-- Choose site --</option>
                                {activeSites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="loggerAnchor" className="block text-sm font-medium text-gray-700">Anchor</label>
                            <select id="loggerAnchor" value={loggerAnchorId} onChange={e => setLoggerAnchorId(e.target.value)} required disabled={!loggerSiteId} className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white disabled:bg-gray-100 text-gray-900">
                                <option value="">-- Choose anchor --</option>
                                {filteredAnchors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="loggerDepth" className="block text-sm font-medium text-gray-700">Depth (m)</label>
                            <input type="number" step="0.1" id="loggerDepth" value={loggerDepth} onChange={e => setLoggerDepth(e.target.value)} required placeholder="e.g., 8.5" className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm p-2 bg-white text-gray-900"/>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="bg-ocean-blue hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded-lg">
                            Register Logger
                        </button>
                    </div>
                </form>

                <div>
                    <h3 className="font-semibold text-gray-700 text-lg mb-4">Registered Loggers</h3>
                    <div className="border rounded-lg max-h-96 overflow-y-auto">
                        {tempLoggers.length > 0 ? (
                            <ul className="divide-y divide-gray-200">
                                {tempLoggers.map(logger => (
                                    <li key={logger.id} className="p-3 flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-deep-sea">
                                                {activeSites.find(s => s.id === logger.siteId)?.name} - {activeAnchors.find(a => a.id === logger.anchorId)?.name}
                                            </p>
                                            <p className="text-sm text-gray-500">Depth: {logger.depth}m</p>
                                        </div>
                                        <button onClick={() => onRemoveTempLogger(logger.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full">
                                            <TrashIcon className="w-5 h-5"/>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-gray-500 p-8">No temperature loggers registered.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnvironmentalPage;