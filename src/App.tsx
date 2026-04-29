import { useState, useMemo, useEffect } from 'react';
import { Shield, LayoutDashboard, Layers, Server, EyeOff, Wallet, AlertTriangle, Target, Activity, Plus, Table as TableIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  labelKey: string;
  icon: React.ElementType;
  descriptionKey: string;
};

const OVERLAYS: OverlayType[] = [
  { id: 'none', labelKey: 'defaultView', icon: LayoutDashboard, descriptionKey: 'defaultViewDesc' },
  { id: 'analytics', labelKey: 'decisionSupport', icon: Activity, descriptionKey: 'decisionSupportDesc' },
  { id: 'coverage', labelKey: 'orgCoverage', icon: Layers, descriptionKey: 'orgCoverageDesc' },
  { id: 'techStack', labelKey: 'techStack', icon: Server, descriptionKey: 'techStackDesc' },
  { id: 'applications', labelKey: 'applications', icon: Layers, descriptionKey: 'applicationsDesc' },
  { id: 'security', labelKey: 'securityCompliance', icon: Shield, descriptionKey: 'securityComplianceDesc' },
  { id: 'privacy', labelKey: 'dataPrivacy', icon: EyeOff, descriptionKey: 'dataPrivacyDesc' },
  { id: 'debt', labelKey: 'techDebt', icon: Wallet, descriptionKey: 'techDebtDesc' },
  { id: 'risk', labelKey: 'operationalRisk', icon: AlertTriangle, descriptionKey: 'operationalRiskDesc' },
  { id: 'strategic', labelKey: 'strategicValue', icon: Target, descriptionKey: 'strategicValueDesc' }
];

export default function App() {
  const { t, i18n } = useTranslation();
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
      l1: t('newDomain'),
      l2: t('newGroup'),
      l3: t('newCapability'),
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
    const currentLang = i18n.language;
    
    capabilitiesData.forEach(cap => {
      // Filter by state first
      if (cap.state !== viewState) return;

      if (hideNonStrategic && !cap.isStrategic) return;

      const tL1 = cap.translations?.[currentLang]?.l1 || cap.l1;
      const tL2 = cap.translations?.[currentLang]?.l2 || cap.l2;

      // Remove markdown links or weird formatting from L1
      const l1 = tL1.replace(/\[|\]/g, '').trim();
      const l2 = tL2.replace(/\[|\]/g, '').trim();
      
      if (!result[l1]) result[l1] = {};
      if (!result[l1][l2]) result[l1][l2] = [];
      result[l1][l2].push(cap);
    });
    return result;
  }, [capabilitiesData, hideNonStrategic, viewState, i18n.language]);

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
          <h2 className="text-gradient" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{t('appTitle')}</h2>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 400 }}>{t('appSubtitle')}</h3>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { code: 'en', flag: 'gb', label: 'EN' },
              { code: 'fr', flag: 'fr', label: 'FR' },
              { code: 'de', flag: 'de', label: 'DE' },
              { code: 'lb', flag: 'lu', label: 'LB' },
              { code: 'pt', flag: 'pt', label: 'PT' },
              { code: 'es', flag: 'es', label: 'ES' },
              { code: 'it', flag: 'it', label: 'IT' }
            ].map(lang => (
              <button
                key={lang.code}
                onClick={() => i18n.changeLanguage(lang.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: i18n.language === lang.code ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                  border: `1px solid ${i18n.language === lang.code ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.1)'}`,
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.2s',
                  opacity: i18n.language === lang.code ? 1 : 0.5,
                  transform: i18n.language === lang.code ? 'scale(1.1)' : 'scale(1)'
                }}
                title={lang.label}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  if (i18n.language !== lang.code) {
                    e.currentTarget.style.opacity = '0.5';
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                <img 
                  src={`https://flagcdn.com/w20/${lang.flag}.png`} 
                  alt={lang.label}
                  style={{ width: '18px', height: 'auto', borderRadius: '2px' }}
                />
              </button>
            ))}
          </div>

          <h4 style={{ fontSize: '0.8rem', color: 'var(--grey)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
            {t('boardroomOverlays')}
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
                <span>{t(overlay.labelKey)}</span>
              </button>
            );
          })}
        </div>

        {activeOverlay !== 'none' && activeOverlay !== 'analytics' && activeOverlay !== 'techStack' && activeOverlay !== 'applications' && activeOverlay !== 'strategic' && (
          <div className="heatmap-legend" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              {t(activeOverlayInfo?.labelKey || '')} {t('heatmap')}
            </h4>
            <div className="legend-scale"></div>
            <div className="legend-labels">
              <span>{t('low')}</span>
              <span>{t('medium')}</span>
              <span>{t('highCritical')}</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '1rem', lineHeight: 1.4 }}>
              {t(activeOverlayInfo?.descriptionKey || '')}. {t('dynamicData')}
            </p>
          </div>
        )}

        {(activeOverlay === 'techStack' || activeOverlay === 'applications' || activeOverlay === 'strategic') && (
          <div className="heatmap-legend" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              {t(activeOverlayInfo?.labelKey || '')}
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.4 }}>
              {t(activeOverlayInfo?.descriptionKey || '')}. {activeOverlay === 'strategic' ? t('highlightStrategic') : t('listComponents')}
            </p>
            
            {activeOverlay !== 'strategic' && (
            <div style={{ marginTop: '1rem', width: '100%' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--white)', marginBottom: '0.25rem', display: 'block' }}>
                {t('filterLabel')}
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
                <option value="" style={{ color: '#000' }}>{t('showAll')}</option>
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
              <h1 className="text-gradient">Universal {t('appSubtitle')}</h1>
              
              {/* As-Is vs To-Be Toggle */}
              <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                <button 
                  onClick={() => setViewState('as-is')}
                  style={{ padding: '0.4rem 1rem', border: 'none', background: viewState === 'as-is' ? 'var(--light-blue)' : 'transparent', color: viewState === 'as-is' ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                >
                  {t('asis')}
                </button>
                <button 
                  onClick={() => setViewState('to-be')}
                  style={{ padding: '0.4rem 1rem', border: 'none', background: viewState === 'to-be' ? 'var(--light-blue)' : 'transparent', color: viewState === 'to-be' ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                >
                  {t('tobe')}
                </button>
              </div>

              {/* View Format Toggle */}
              <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                <button 
                  onClick={() => setViewFormat('map')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 1rem', border: 'none', background: viewFormat === 'map' ? 'var(--light-blue)' : 'transparent', color: viewFormat === 'map' ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                >
                  <LayoutDashboard size={14} /> {t('map')}
                </button>
                <button 
                  onClick={() => setViewFormat('table')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 1rem', border: 'none', background: viewFormat === 'table' ? 'var(--light-blue)' : 'transparent', color: viewFormat === 'table' ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                >
                  <TableIcon size={14} /> {t('table')}
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
                  {t('strategicOnly')}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button 
                onClick={handleCreateNew}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--white)', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                <Plus size={16} /> {t('addCapability')}
              </button>
              <div style={{ padding: '0.5rem 1rem', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '20px', fontSize: '0.85rem', color: 'var(--light-blue)', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
                {Object.keys(hierarchy).length} {t('domains')} • {capabilitiesData.filter(c => c.state === viewState).length} {t('capabilities')}
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
                                <div className="name">{cap.translations?.[i18n.language]?.l3 || cap.l3}</div>
                                <div className="desc">{cap.translations?.[i18n.language]?.desc || cap.desc}</div>
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
