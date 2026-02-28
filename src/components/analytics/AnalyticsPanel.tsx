import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/uiStore';
import DeliveryTrendsChart from './DeliveryTrendsChart';
import VehiclePerformanceChart from './VehiclePerformanceChart';
import StatusDistributionChart from './StatusDistributionChart';
import DelayAnalysisChart from './DelayAnalysisChart';
import EventLog from '@/components/panel/EventLog';

type Tab = 'overview' | 'performance' | 'delays' | 'events';

const TAB_KEYS: { key: Tab; tKey: string }[] = [
  { key: 'overview', tKey: 'analytics.overview' },
  { key: 'performance', tKey: 'analytics.performance' },
  { key: 'delays', tKey: 'analytics.delays' },
  { key: 'events', tKey: 'analytics.events' },
];

const AnalyticsPanel = () => {
  const { t } = useTranslation();
  const isOpen = useUIStore((s) => s.isAnalyticsPanelOpen);
  const togglePanel = useUIStore((s) => s.toggleAnalyticsPanel);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const handleClose = useCallback(() => {
    togglePanel();
  }, [togglePanel]);

  if (!isOpen) return null;

  return (
    <div className="absolute top-4 left-4 bottom-4 w-[380px] z-20 glass-panel animate-slide-in-left overflow-hidden flex flex-col pointer-events-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h2 className="text-sm font-bold text-text-primary">{t('analytics.title')}</h2>
        <button
          onClick={handleClose}
          className="text-text-secondary hover:text-text-primary transition-colors text-lg leading-none"
          aria-label="Close analytics"
        >
          &times;
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-4 gap-1 border-b border-white/10">
        {TAB_KEYS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-t-lg transition-colors ${
              activeTab === tab.key
                ? 'text-accent-cyan border-b-2 border-accent-cyan bg-white/5'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {t(tab.tKey)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4">
        {activeTab === 'overview' && (
          <>
            <StatusDistributionChart />
            <DeliveryTrendsChart />
          </>
        )}
        {activeTab === 'performance' && (
          <>
            <VehiclePerformanceChart />
            <DeliveryTrendsChart />
          </>
        )}
        {activeTab === 'delays' && (
          <>
            <DelayAnalysisChart />
            <StatusDistributionChart />
          </>
        )}
        {activeTab === 'events' && <EventLog />}
      </div>
    </div>
  );
};

export default AnalyticsPanel;
