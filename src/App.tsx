import { useState, useMemo } from 'react';
import { Shield, LayoutDashboard, Layers, Server, EyeOff, Wallet, AlertTriangle, Target } from 'lucide-react';
import capabilitiesData from './data/capabilities.json';
import './index.css';

// Type Definitions
type Capability = {
  l1: string;
  l2: string;
  l3: string;
  desc: string;
  scores: Record<string, number>;
  techStack?: string[];
  applications?: string[];
  isStrategic?: boolean;
};

type OverlayType = {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
};

const OVERLAYS: OverlayType[] = [
  { id: 'none', label: 'Default View', icon: LayoutDashboard, description: 'Standard business capability view' },
  { id: 'coverage', label: 'Org Coverage', icon: Layers, description: 'Organizational adoption and coverage' },
  { id: 'techStack', label: 'Tech Stack', icon: Server, description: 'Technology stack modernization level' },
  { id: 'applications', label: 'Applications', icon: Layers, description: 'Business applications supporting capability' },
  { id: 'infrastructure', label: 'Infrastructure', icon: Server, description: 'Cloud vs On-Prem infrastructure hosting' },
  { id: 'security', label: 'Security Compliance', icon: Shield, description: 'Security compliance and controls level' },
  { id: 'privacy', label: 'Data Privacy', icon: EyeOff, description: 'Data privacy handling and risk' },
  { id: 'debt', label: 'Tech Debt', icon: Wallet, description: 'Technical debt accumulation level' },
  { id: 'risk', label: 'Operational Risk', icon: AlertTriangle, description: 'Inherent and residual operational risk' },
  { id: 'strategic', label: 'Strategic Value', icon: Target, description: 'Capabilities marked as highly strategic for the business' }
];

export default function App() {
  const [activeOverlay, setActiveOverlay] = useState<string>('none');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  
  // Group capabilities by L1 -> L2 -> Array<L3>
  const hierarchy = useMemo(() => {
    const data = capabilitiesData as Capability[];
    const result: Record<string, Record<string, Capability[]>> = {};
    
    data.forEach(cap => {
      // Remove markdown links or weird formatting from L1
      const l1 = cap.l1.replace(/\[|\]/g, '').trim();
      const l2 = cap.l2.replace(/\[|\]/g, '').trim();
      
      if (!result[l1]) result[l1] = {};
      if (!result[l1][l2]) result[l1][l2] = [];
      result[l1][l2].push(cap);
    });
    return result;
  }, []);

  const uniqueTags = useMemo(() => {
    if (activeOverlay !== 'techStack' && activeOverlay !== 'applications') return [];
    const tags = new Set<string>();
    (capabilitiesData as Capability[]).forEach(cap => {
      if (activeOverlay === 'techStack' && cap.techStack) {
        cap.techStack.forEach(t => tags.add(t));
      } else if (activeOverlay === 'applications' && cap.applications) {
        cap.applications.forEach(a => tags.add(a));
      }
    });
    return Array.from(tags).sort();
  }, [activeOverlay]);

  const getHeatmapColor = (score: number) => {
    // Return CSS variable based on score (0-100)
    if (score < 20) return 'var(--overlay-0)'; // Green
    if (score < 40) return 'var(--overlay-25)'; // Blue
    if (score < 60) return 'var(--overlay-50)'; // Yellow
    if (score < 80) return 'var(--overlay-75)'; // Red
    return 'var(--overlay-100)'; // Dark Red
  };

  const activeOverlayInfo = OVERLAYS.find(o => o.id === activeOverlay);

  return (
    <div className="app-container">
      {/* Sidebar Controls */}
      <div className="sidebar glass-panel">
        <div>
          <h2 className="text-gradient" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Universal Insurance</h2>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 400 }}>Enterprise Architecture Capability Map</h3>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h4 style={{ fontSize: '0.8rem', color: 'var(--grey)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
            Boardroom Overlays
          </h4>
          {OVERLAYS.map(overlay => {
            const Icon = overlay.icon;
            return (
              <button
                key={overlay.id}
                className={`control-btn ${activeOverlay === overlay.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveOverlay(overlay.id);
                  setSelectedFilter(null); // Reset filter when changing overlays
                }}
              >
                <Icon className="icon" size={18} />
                <span>{overlay.label}</span>
              </button>
            );
          })}
        </div>

        {activeOverlay !== 'none' && activeOverlay !== 'techStack' && activeOverlay !== 'applications' && activeOverlay !== 'strategic' && (
          <div className="heatmap-legend" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              {activeOverlayInfo?.label} Heatmap
            </h4>
            <div className="legend-scale"></div>
            <div className="legend-labels">
              <span>Low</span>
              <span>Medium</span>
              <span>High/Critical</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '1rem', lineHeight: 1.4 }}>
              {activeOverlayInfo?.description}. Showing dynamically generated overlay data for the selected context.
            </p>
          </div>
        )}

        {(activeOverlay === 'techStack' || activeOverlay === 'applications' || activeOverlay === 'strategic') && (
          <div className="heatmap-legend" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              {activeOverlayInfo?.label}
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.4 }}>
              {activeOverlayInfo?.description}. {activeOverlay === 'strategic' ? 'Highlighting strategic nodes.' : 'Listing explicit components.'}
            </p>
            
            {activeOverlay !== 'strategic' && (
            <div style={{ marginTop: '1rem', width: '100%' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--white)', marginBottom: '0.25rem', display: 'block' }}>
                Reverse Mapping Filter:
              </label>
              <select 
                className="glass-select"
                value={selectedFilter || ''}
                onChange={e => setSelectedFilter(e.target.value || null)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'var(--white)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  outline: 'none',
                  fontSize: '0.85rem'
                }}
              >
                <option value="" style={{ color: '#000' }}>-- Show All --</option>
                {uniqueTags.map(tag => (
                  <option key={tag} value={tag} style={{ color: '#000' }}>{tag}</option>
                ))}
              </select>
            </div>
            )}
          </div>
        )}
      </div>

      {/* Main Map Viewer */}
      <div className="main-content glass-panel">
        <div className="header">
          <h1 className="text-gradient">Capabilities Map</h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Active View: <strong style={{ color: 'var(--white)' }}>{activeOverlayInfo?.label}</strong>
            </span>
            <div style={{ padding: '0.5rem 1rem', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '20px', fontSize: '0.85rem', color: 'var(--light-blue)', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
              {Object.keys(hierarchy).length} Domains • {capabilitiesData.length} Capabilities
            </div>
          </div>
        </div>

        <div className="map-container">
          {Object.entries(hierarchy).map(([l1, groups]) => (
            <div key={l1} className="domain-section">
              <h2 className="domain-header">{l1}</h2>
              <div className="groups-grid">
                {Object.entries(groups).map(([l2, caps]) => (
                  <div key={l2} className="group-card glass-card">
                    <h3 className="group-header">{l2}</h3>
                    <div className="capabilities-list">
                      {caps.map((cap, idx) => {
                        const isTagView = activeOverlay === 'techStack' || activeOverlay === 'applications';
                        const isStrategicView = activeOverlay === 'strategic';
                        const score = isTagView || isStrategicView || activeOverlay === 'none' ? 0 : cap.scores[activeOverlay];
                        const color = getHeatmapColor(score);
                        const borderLeftColor = activeOverlay === 'none' || isTagView || isStrategicView ? 
                          (isStrategicView && cap.isStrategic ? 'var(--overlay-50)' : 'var(--grey)') : color;
                        
                        let isHighlighted = true;
                        if (isStrategicView) {
                          isHighlighted = cap.isStrategic === true;
                        } else if (selectedFilter) {
                          if (activeOverlay === 'applications') {
                            isHighlighted = cap.applications?.includes(selectedFilter) ?? false;
                          } else if (activeOverlay === 'techStack') {
                            isHighlighted = cap.techStack?.includes(selectedFilter) ?? false;
                          }
                        }

                        return (
                          <div 
                            key={idx} 
                            className="capability-item"
                            style={{ 
                              borderLeftColor,
                              opacity: isHighlighted ? 1 : 0.15,
                              filter: isHighlighted ? 'none' : 'grayscale(100%)',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            {activeOverlay !== 'none' && !isTagView && (
                              <div 
                                className="heatmap-fill" 
                                style={{ width: `${score}%`, backgroundColor: color }}
                              />
                            )}
                            <div className="name">{cap.l3}</div>
                            <div className="desc">{cap.desc}</div>
                            {activeOverlay === 'techStack' && cap.techStack && (
                              <div className="tags-list">
                                {cap.techStack.map((tech, i) => (
                                  <span key={i} className={`tag-badge ${selectedFilter === tech ? 'highlight-tag' : ''}`}>{tech}</span>
                                ))}
                              </div>
                            )}
                            {activeOverlay === 'applications' && cap.applications && (
                              <div className="tags-list">
                                {cap.applications.map((app, i) => (
                                  <span key={i} className={`tag-badge app-badge ${selectedFilter === app ? 'highlight-tag' : ''}`}>{app}</span>
                                ))}
                              </div>
                            )}
                            {activeOverlay === 'strategic' && cap.isStrategic && (
                              <div className="tags-list">
                                <span className="tag-badge highlight-tag" style={{ backgroundColor: 'rgba(234, 179, 8, 0.2)', color: 'var(--overlay-50)', borderColor: 'var(--overlay-50)' }}>
                                  <Target size={12} style={{ marginRight: '4px', display: 'inline' }}/> Strategic
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
