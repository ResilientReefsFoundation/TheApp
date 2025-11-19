import * as React from 'react';
import type { FormEvent } from 'react';
import type { Rule, RuleTarget, CheckType } from '../types';

interface RulesPageProps {
  rules: Rule[];
  onAddRule: (newRule: Omit<Rule, 'id'>) => void;
  onNavigateBack: () => void;
}

const RulesPage: React.FC<RulesPageProps> = ({ rules, onAddRule, onNavigateBack }) => {
    const [newRuleTarget, setNewRuleTarget] = React.useState<RuleTarget>('Branch');
    const [newRuleInterval, setNewRuleInterval] = React.useState<string>('1');
    const [newRuleCheckType, setNewRuleCheckType] = React.useState<CheckType>('Health Report');

    const handleAddRuleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const interval = parseInt(newRuleInterval, 10);
        if (isNaN(interval) || interval <= 0) {
            alert('Please enter a valid number of months.');
            return;
        }
        onAddRule({
            target: newRuleTarget,
            intervalMonths: interval,
            checkType: newRuleCheckType,
        });
        // Reset form
        setNewRuleTarget('Branch');
        setNewRuleInterval('1');
        setNewRuleCheckType('Health Report');
    };

    const RULE_TARGETS: RuleTarget[] = ['Site', 'Collection Zone', 'Anchor', 'Tree', 'Branch', 'Float'];
    const CHECK_TYPES: CheckType[] = ['Health Report', 'Scan', 'Check'];

    return (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b pb-4">
                <h2 className="text-2xl font-bold text-deep-sea mb-2 sm:mb-0">Rules Management</h2>
                <button
                    onClick={onNavigateBack}
                    className="bg-gray-200 hover:bg-gray-300 text-deep-sea font-bold py-2 px-4 rounded-lg transition-colors duration-200 self-start sm:self-center"
                >
                    &larr; Back to Details
                </button>
            </div>
            
            <form onSubmit={handleAddRuleSubmit} className="p-4 border rounded-lg space-y-4 bg-gray-50">
              <h3 className="font-semibold text-gray-700 text-lg">Add New Rule</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label htmlFor="ruleTarget" className="block text-sm font-medium text-gray-700">Item to Check</label>
                  <select id="ruleTarget" value={newRuleTarget} onChange={(e) => setNewRuleTarget(e.target.value as RuleTarget)} className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm focus:ring-ocean-blue sm:text-sm p-2 bg-white text-gray-900">
                    {RULE_TARGETS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="ruleInterval" className="block text-sm font-medium text-gray-700">Frequency (Months)</label>
                  <input type="number" id="ruleInterval" value={newRuleInterval} onChange={(e) => setNewRuleInterval(e.target.value)} min="1" className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm focus:border-ocean-blue focus:ring-ocean-blue sm:text-sm p-2 bg-white text-gray-900" />
                </div>
                <div>
                  <label htmlFor="ruleCheckType" className="block text-sm font-medium text-gray-700">Check Type</label>
                  <select id="ruleCheckType" value={newRuleCheckType} onChange={(e) => setNewRuleCheckType(e.target.value as CheckType)} className="mt-1 block w-full rounded-md border border-ocean-blue shadow-sm focus:ring-ocean-blue sm:text-sm p-2 bg-white text-gray-900">
                    {CHECK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="bg-ocean-blue hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200">
                    Add Rule
                </button>
              </div>
            </form>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2 text-lg">Current Rules</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 md:table">
                  <thead className="hidden md:table-header-group bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 md:divide-y-0">
                    {rules.length > 0 ? rules.map(rule => (
                      <tr key={rule.id} className="block md:table-row mb-4 md:mb-0 shadow md:shadow-none rounded-lg md:rounded-none">
                        <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap text-sm font-medium text-gray-900 block md:table-cell text-right md:text-left border-b md:border-b-0">
                           <span className="font-semibold md:hidden float-left">Item</span>
                           {rule.target}
                        </td>
                        <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-500 block md:table-cell text-right md:text-left border-b md:border-b-0">
                           <span className="font-semibold md:hidden float-left">Check Type</span>
                           {rule.checkType}
                        </td>
                        <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-500 block md:table-cell text-right md:text-left">
                           <span className="font-semibold md:hidden float-left">Frequency</span>
                           Every {rule.intervalMonths} month(s)
                        </td>
                      </tr>
                    )) : (
                      <tr className="block md:table-row">
                        <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500 block md:table-cell">No rules defined yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
        </div>
    );
};

export default RulesPage;