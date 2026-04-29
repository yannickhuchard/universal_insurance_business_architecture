import React, { useMemo } from 'react';
import { AlertTriangle, Layers } from 'lucide-react';

type Capability = {
  id?: number;
  l1: string;
  l2: string;
  l3: string;
  desc: string;
  scores: Record<string, number>;
  techStack?: string[];
  applications?: string[];
  isStrategic?: boolean;
  state?: string;
};

interface AnalyticsPanelProps {
  capabilities: Capability[];
}

export default function AnalyticsPanel({ capabilities }: AnalyticsPanelProps) {
  // Gap Analysis logic
  const gaps = useMemo(() => {
    return capabilities.filter(cap => {
      // Flag strategic capabilities with high debt/risk or low coverage
      if (!cap.isStrategic) return false;
      return cap.scores.debt > 70 || cap.scores.risk > 70 || cap.scores.coverage < 30;
    });
  }, [capabilities]);

  // Redundancy Detection logic
  const redundancies = useMemo(() => {
    // 1. Capability Bloat: Capabilities with > 1 application
    const bloatedCaps = capabilities.filter(cap => (cap.applications?.length || 0) > 1);

    // 2. App Sprawl: Applications mapped to many capabilities
    const appMap: Record<string, string[]> = {};
    capabilities.forEach(cap => {
      if (cap.applications) {
        cap.applications.forEach(app => {
          if (!appMap[app]) appMap[app] = [];
          appMap[app].push(cap.l3);
        });
      }
    });
    
    // Flag apps mapped to > 3 capabilities
    const sprawledApps = Object.entries(appMap)
      .filter(([_, caps]) => caps.length > 3)
      .map(([app, caps]) => ({ app, caps }));

    return { bloatedCaps, sprawledApps };
  }, [capabilities]);

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h2 className="text-gradient" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Deterministic Analytics</h2>
      
      <div>
        <h3 style={{ fontSize: '0.9rem', color: 'var(--white)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <AlertTriangle size={16} color="var(--overlay-75)" />
          Gap Analysis (Strategic Anomalies)
        </h3>
        {gaps.length === 0 ? (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No anomalies found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
            {gaps.map((cap, i) => (
              <div key={i} style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '3px solid var(--overlay-100)', borderRadius: '4px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--white)' }}>{cap.l3}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {cap.scores.debt > 70 && <span style={{ marginRight: '8px' }}>Debt: {cap.scores.debt}</span>}
                  {cap.scores.risk > 70 && <span style={{ marginRight: '8px' }}>Risk: {cap.scores.risk}</span>}
                  {cap.scores.coverage < 30 && <span style={{ marginRight: '8px' }}>Coverage: {cap.scores.coverage}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 style={{ fontSize: '0.9rem', color: 'var(--white)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Layers size={16} color="var(--overlay-25)" />
          Redundancy Detection
        </h3>
        
        <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Capability Bloat (&gt;1 App)</h4>
        {redundancies.bloatedCaps.length === 0 ? (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>No capability bloat detected.</p>
        ) : (
           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem' }}>
            {redundancies.bloatedCaps.map((cap, i) => (
               <div key={i} style={{ padding: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
                 <div style={{ fontSize: '0.8rem', color: 'var(--white)' }}>{cap.l3} <span style={{ color: 'var(--overlay-50)' }}>({cap.applications?.length} apps)</span></div>
                 <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{cap.applications?.join(', ')}</div>
               </div>
            ))}
           </div>
        )}

        <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Application Sprawl (&gt;3 Capabilities)</h4>
        {redundancies.sprawledApps.length === 0 ? (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>No app sprawl detected.</p>
        ) : (
           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
            {redundancies.sprawledApps.map((sprawl, i) => (
               <div key={i} style={{ padding: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
                 <div style={{ fontSize: '0.8rem', color: 'var(--white)' }}>{sprawl.app} <span style={{ color: 'var(--overlay-25)' }}>({sprawl.caps.length} caps)</span></div>
               </div>
            ))}
           </div>
        )}
      </div>

    </div>
  );
}
