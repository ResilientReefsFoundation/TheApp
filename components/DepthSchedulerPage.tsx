import * as React from 'react';
import type { Tree } from '../types';

interface DepthSchedulerPageProps {
  trees: Tree[];
  schedule: Map<string, Tree[]>;
  onGenerateSchedule: (targetDate: string) => void;
  onNavigateBack: () => void;
}

const DepthSchedulerPage: React.FC<DepthSchedulerPageProps> = ({
  trees,
  schedule,
  onGenerateSchedule,
  onNavigateBack,
}) => {
  const [targetDate, setTargetDate] = React.useState('');

  const handleGenerateClick = () => {
    if (!targetDate) {
      alert('Please select a target restoration date.');
      return;
    }
    onGenerateSchedule(targetDate);
  };

  const sortedSchedule = React.useMemo(() => {
    return Array.from(schedule.entries()).sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime());
  }, [schedule]);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b pb-4">
        <h2 className="text-2xl font-bold text-deep-sea mb-2 sm:mb-0">Depth Scheduler</h2>
        <button
          onClick={onNavigateBack}
          className="bg-gray-200 hover:bg-gray-300 text-deep-sea font-bold py-2 px-4 rounded-lg transition-colors duration-200 self-start sm:self-center"
        >
          &larr; Back to Details
        </button>
      </div>

      {/* Current Status Table */}
      <div>
        <h3 className="font-semibold text-gray-700 text-lg mb-4">Current Tree Depths</h3>
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tree #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Depth</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Normal Depth</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trees.sort((a,b) => a.number - b.number).map(tree => (
                <tr key={tree.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">#{tree.number}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{tree.currentDepth}m</td>
                  <td className="px-6 py-4 whitespace-nowrap">{tree.normalDepth}m</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {tree.currentDepth > tree.normalDepth ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Needs moving up
                      </span>
                    ) : (
                       <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        At normal depth
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Generator */}
      <div className="p-4 border rounded-lg space-y-4 bg-gray-50">
        <h3 className="font-semibold text-gray-700 text-lg">Generate Restoration Schedule</h3>
        <p className="text-sm text-gray-600">
          Select a target date to have all trees returned to their normal depth. The system will calculate the required moves at 14-day intervals.
        </p>
        <div className="flex flex-col sm:flex-row items-end gap-4">
          <div className="flex-grow">
            <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700">Target Restoration Date</label>
            <input
              type="date"
              id="targetDate"
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 bg-white"
            />
          </div>
          <button
            onClick={handleGenerateClick}
            className="w-full sm:w-auto bg-ocean-blue hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Generate Schedule
          </button>
        </div>
      </div>

      {/* Schedule Display */}
      <div>
        <h3 className="font-semibold text-gray-700 text-lg mb-4">Generated Schedule</h3>
        {sortedSchedule.length > 0 ? (
          <div className="space-y-6">
            {sortedSchedule.map(([date, treesToMove]) => (
              <div key={date}>
                <h4 className="font-medium bg-gray-100 p-3 rounded-t-md text-deep-sea text-lg">
                  {new Date(date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </h4>
                <div className="border border-t-0 rounded-b-md">
                   <ul className="divide-y divide-gray-200">
                     {treesToMove.map(tree => (
                       <li key={tree.id} className="p-3">
                         <p>Move <span className="font-bold">Tree #{tree.number}</span> up from {tree.currentDepth}m to {tree.currentDepth - 2}m.</p>
                       </li>
                     ))}
                   </ul>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No schedule generated yet, or no trees require moving.</p>
        )}
      </div>

    </div>
  );
};

export default DepthSchedulerPage;
