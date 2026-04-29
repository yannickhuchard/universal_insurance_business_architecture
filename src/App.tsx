import { useState, useMemo, useEffect } from 'react';
import { Shield, LayoutDashboard, Layers, Server, EyeOff, Wallet, AlertTriangle, Target, Activity, Plus, Table as TableIcon } from 'lucide-react';
import './index.css';
import AnalyticsPanel from './components/AnalyticsPanel';
import CapabilityEditor from './components/CapabilityEditor';
import DataTable from './components/DataTable';

// Type Definitions
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

type OverlayType = {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
};

const OVERLAYS: OverlayType[] = [
  { id: 'none', label: 'Default View', icon: LayoutDashboard, description: 'Standard business capability view' },
  { id: 'analytics', label: 'Decision Support', icon: Activity, description: 'Deterministic gap analysis and redundancy detection' },
  { id: 'coverage', label: 'Org Coverage', icon: Layers, description: 'Organizational adoption and coverage' },
  { id: 'techStack', label: 'Tech Stack', icon: Server, description: 'Technology stack modernization level' },
  { id: 'applications', label: 'Applications', icon: Layers, description: 'Business applications supporting capability' },
  { id: 'security', label: 'Security Compliance', icon: Shield, description: 'Security compliance and controls level' },
  { id: 'privacy', label: 'Data Privacy', icon: EyeOff, description: 'Data privacy handling and risk' },
  { id: 'debt', label: 'Tech Debt', icon: Wallet, description: 'Technical debt accumulation level' },
  { id: 'risk', label: 'Operational Risk', icon: AlertTriangle, description: 'Inherent and residual operational risk' },
  { id: 'strategic', label: 'Strategic Value', icon: Target, description: 'Capabilities marked as highly strategic for the business' }
];

export default function App() {
  const [capabilitiesData, setCapabilitiesData] = useState<Capability[]>([]);
  const [activeOverlay, setActiveOverlay] = useState<string>('none');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [hideNonStrategic, setHideNonStrategic] = useState<boolean>(false);
  const [viewState, setViewState] = useState<string>('as-is');
  const [viewFormat, setViewFormat] = useState<'map' | 'table'>('map');
  const [editingCapability, setEditingCapability] = useState<Capability | null>(null);

  const fetchCapabilities = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/capabilities');
      const data = await res.json();
      setCapabilitiesData(data);
    } catch (e) {
      console.error("Failed to fetch capabilities. Is backend running?", e);
    }
  };

  useEffect(() => {
    fetchCapabilities();
  }, []);

  const handleSave = async (updated: Capability) => {
    try {
      if (updated.id) {
        await fetch(`http://localhost:3001/api/capabilities/${updated.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
      } else {
        await fetch('http://localhost:3001/api/capabilities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
      }
      setEditingCapability(null);
      fetchCapabilities();
    } catch (e) {
      console.error("Failed to save capability", e);
    }
  };

  const handleCreateNew = () => {
    setEditingCapability({
      l1: 'New Domain',
      l2: 'New Group',
      l3: 'New Capability',
      desc: '',
      scores: { coverage: 0, security: 0, privacy: 0, debt: 0, risk: 0 },
      isStrategic: false,
      state: viewState,
      techStack: [],
      applications: []
    });
  };

  // Group capabilities by L1 -> L2 -> Array<L3>
  const hierarchy = useMemo(() => {
    const result: Record<string, Record<string, Capability[]>> = {};
    
    capabilitiesData.forEach(cap => {
      // Filter by state first
      if (cap.state !== viewState) return;

      if (hideNonStrategic && !cap.isStrategic) return;

      // Remove markdown links or weird formatting from L1
      const l1 = cap.l1.replace(/\[|\]/g, '').trim();
      const l2 = cap.l2.replace(/\[|\]/g, '').trim();
      
      if (!result[l1]) result[l1] = {};
      if (!result[l1][l2]) result[l1][l2] = [];
      result[l1][l2].push(cap);
    });
    return result;
  }, [capabilitiesData, hideNonStrategic, viewState]);

  const uniqueTags = useMemo(() => {
    if (activeOverlay !== 'techStack' && activeOverlay !== 'applications') return [];
    const tags = new Set<string>();
    capabilitiesData.forEach(cap => {
      if (cap.state !== viewState) return;
      if (activeOverlay === 'techStack' && cap.techStack) {
        cap.techStack.forEach(t => tags.add(t));
      } else if (activeOverlay === 'applications' && cap.applications) {
        cap.applications.forEach(a => tags.add(a));
      }
    });
    return Array.from(tags).sort();
  }, [capabilitiesData, activeOverlay, viewState]);

  const getHeatmapColor = (score: number) => {
    if (score < 20) return 'var(--overlay-0)';
    if (score < 40) return 'var(--overlay-25)';
    if (score < 60) return 'var(--overlay-50)';
    if (score < 80) return 'var(--overlay-75)';
    return 'var(--overlay-100)';
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
                  setSelectedFilter(null);
                }}
              >
                <Icon className="icon" size={18} />
                <span>{overlay.label}</span>
              </button>
            );
          })}
        </div>

        {activeOverlay !== 'none' && activeOverlay !== 'analytics' && activeOverlay !== 'techStack' && activeOverlay !== 'applications' && activeOverlay !== 'strategic' && (
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
      <div className="main-content glass-panel" style={{ display: 'flex', gap: '2rem' }}>
        
        {/* Render Map */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <h1 className="text-gradient">Capabilities Map</h1>
              
              {/* As-Is vs To-Be Toggle */}
              <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                <button 
                  onClick={() => setViewState('as-is')}
                  style={{ padding: '0.4rem 1rem', border: 'none', background: viewState === 'as-is' ? 'var(--light-blue)' : 'transparent', color: viewState === 'as-is' ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                >
                  As-Is
                </button>
                <button 
                  onClick={() => setViewState('to-be')}
                  style={{ padding: '0.4rem 1rem', border: 'none', background: viewState === 'to-be' ? 'var(--light-blue)' : 'transparent', color: viewState === 'to-be' ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                >
                  To-Be
                </button>
              </div>

              {/* View Format Toggle */}
              <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                <button 
                  onClick={() => setViewFormat('map')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 1rem', border: 'none', background: viewFormat === 'map' ? 'var(--light-blue)' : 'transparent', color: viewFormat === 'map' ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                >
                  <LayoutDashboard size={14} /> Map
                </button>
                <button 
                  onClick={() => setViewFormat('table')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 1rem', border: 'none', background: viewFormat === 'table' ? 'var(--light-blue)' : 'transparent', color: viewFormat === 'table' ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                >
                  <TableIcon size={14} /> Table
                </button>
              </div>

              <div 
                className="switch-container" 
                onClick={() => setHideNonStrategic(!hideNonStrategic)}
                style={{ background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.8rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div className={`switch-track ${hideNonStrategic ? 'active' : ''}`}>
                  <div className="switch-thumb" />
                </div>
                <span style={{ color: hideNonStrategic ? 'var(--white)' : 'var(--text-secondary)', fontWeight: 500, userSelect: 'none' }}>
                  Strategic Only
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button 
                onClick={handleCreateNew}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--white)', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                <Plus size={16} /> Add Capability
              </button>
              <div style={{ padding: '0.5rem 1rem', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '20px', fontSize: '0.85rem', color: 'var(--light-blue)', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
                {Object.keys(hierarchy).length} Domains • {capabilitiesData.filter(c => c.state === viewState).length} Capabilities
              </div>
            </div>
          </div>

          {viewFormat === 'map' ? (
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
                            const isAnalyticsView = activeOverlay === 'analytics';
                            const score = isTagView || isStrategicView || isAnalyticsView || activeOverlay === 'none' ? 0 : cap.scores[activeOverlay];
                            const color = getHeatmapColor(score);
                            const borderLeftColor = activeOverlay === 'none' || isTagView || isStrategicView || isAnalyticsView ? 
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
                                className="capability-item clickable"
                                onClick={() => setEditingCapability(cap)}
                                style={{ 
                                  borderLeftColor,
                                  opacity: isHighlighted ? 1 : 0.15,
                                  filter: isHighlighted ? 'none' : 'grayscale(100%)',
                                  transition: 'all 0.3s ease',
                                  cursor: 'pointer'
                                }}
                              >
                                {activeOverlay !== 'none' && !isTagView && !isAnalyticsView && !isStrategicView && (
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
          ) : (
            <div className="map-container" style={{ paddingRight: 0 }}>
              <DataTable 
                data={capabilitiesData.filter(c => {
                  if (c.state !== viewState) return false;
                  if (hideNonStrategic && !c.isStrategic) return false;
                  if (selectedFilter) {
                    if (activeOverlay === 'applications') return c.applications?.includes(selectedFilter) ?? false;
                    if (activeOverlay === 'techStack') return c.techStack?.includes(selectedFilter) ?? false;
                  }
                  return true;
                })}
                onEdit={setEditingCapability} 
              />
            </div>
          )}
        </div>

        {/* Analytics Panel View */}
        {activeOverlay === 'analytics' && (
          <div style={{ width: '350px', flexShrink: 0 }}>
            <AnalyticsPanel capabilities={capabilitiesData.filter(c => c.state === viewState)} />
          </div>
        )}

      </div>

      {/* Editing Modal */}
      <CapabilityEditor 
        capability={editingCapability} 
        onClose={() => setEditingCapability(null)} 
        onSave={handleSave} 
      />

    </div>
  );
}
