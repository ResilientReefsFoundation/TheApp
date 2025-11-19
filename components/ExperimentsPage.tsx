import * as React from 'react';
import type { Page } from '../types';

interface ExperimentsPageProps {
  onNavigateToPage: (page: Page) => void;
}

const ExperimentButton: React.FC<{ title: string; description: string; onClick?: () => void; disabled?: boolean; }> = ({ title, description, onClick, disabled }) => (
    <button 
        onClick={onClick}
        disabled={disabled}
        className="p-4 bg-gray-50 hover:bg-ocean-blue/10 border border-gray-200 rounded-lg text-left transition-colors shadow-sm hover:shadow-md h-full disabled:bg-gray-100 disabled:cursor-not-allowed disabled:shadow-none disabled:opacity-60"
    >
        <h4 className="font-semibold text-deep-sea">{title}</h4>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
    </button>
);

const ExperimentsPage: React.FC<ExperimentsPageProps> = ({ onNavigateToPage }) => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b pb-4">
        <h2 className="text-2xl font-bold text-deep-sea mb-2 sm:mb-0">Experiments</h2>
        <button
          onClick={() => onNavigateToPage('dashboard')}
          className="bg-gray-200 hover:bg-gray-300 text-deep-sea font-bold py-2 px-4 rounded-lg transition-colors duration-200 self-start sm:self-center"
        >
          &larr; Back to Dashboard
        </button>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Select an Experiment</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ExperimentButton 
                title="Tree Shade" 
                description="Compare a shaded tree vs. a control tree to test heat stress mitigation." 
                onClick={() => onNavigateToPage('treeShadeExperiment')}
            />
            <ExperimentButton 
                title="Rope on Rubble" 
                description="Long term study on health and growth of rope frags above substrate."
                onClick={() => onNavigateToPage('ropeOnRubbleExperiment')}
            />
            <ExperimentButton 
                title="Square Rope Frame" 
                description="Long term study on growth and health of corals on a square rope frame."
                onClick={() => onNavigateToPage('squareRopeFrameExperiment')}
            />
            <ExperimentButton 
                title="Cube Rope Frame" 
                description="Long term study on growth and health of corals on a cube rope frame."
                onClick={() => onNavigateToPage('cubeRopeFrameExperiment')}
            />
            <ExperimentButton title="Experiment 5 (Coming Soon)" description="Description for the fifth experiment." disabled />
            <ExperimentButton title="Experiment 6 (Coming Soon)" description="Description for the sixth experiment." disabled />
        </div>
      </div>
    </div>
  );
};

export default ExperimentsPage;
