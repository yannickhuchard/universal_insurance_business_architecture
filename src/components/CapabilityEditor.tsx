import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

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

interface CapabilityEditorProps {
  capability: Capability | null;
  onClose: () => void;
  onSave: (updated: Capability) => void;
}

export default function CapabilityEditor({ capability, onClose, onSave }: CapabilityEditorProps) {
  const [formData, setFormData] = useState<Partial<Capability>>({});

  useEffect(() => {
    if (capability) {
      setFormData({
        ...capability,
        scores: { ...capability.scores },
        techStack: [...(capability.techStack || [])],
        applications: [...(capability.applications || [])]
      });
    }
  }, [capability]);

  if (!capability) return null;

  const handleChange = (field: keyof Capability, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleScoreChange = (scoreType: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      scores: { ...prev.scores, [scoreType]: value }
    }));
  };

  const handleArrayChange = (field: 'techStack' | 'applications', value: string) => {
    const arr = value.split(',').map(s => s.trim()).filter(s => s);
    setFormData(prev => ({ ...prev, [field]: arr }));
  };

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: '400px', 
      background: 'var(--bg-dark)', borderLeft: '1px solid rgba(255,255,255,0.1)',
      zIndex: 1000, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem',
      boxShadow: '-10px 0 30px rgba(0,0,0,0.5)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.2rem', color: 'var(--white)' }}>Edit Capability</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <X size={20} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>L1 Domain</label>
        <input type="text" value={formData.l1 || ''} onChange={e => handleChange('l1', e.target.value)} className="glass-select" style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.2)', color: 'var(--white)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>L2 Group</label>
        <input type="text" value={formData.l2 || ''} onChange={e => handleChange('l2', e.target.value)} className="glass-select" style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.2)', color: 'var(--white)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>L3 Capability Name</label>
        <input type="text" value={formData.l3 || ''} onChange={e => handleChange('l3', e.target.value)} className="glass-select" style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.2)', color: 'var(--white)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Description</label>
        <textarea value={formData.desc || ''} onChange={e => handleChange('desc', e.target.value)} className="glass-select" style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.2)', color: 'var(--white)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', minHeight: '80px', resize: 'vertical' }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input type="checkbox" checked={formData.isStrategic || false} onChange={e => handleChange('isStrategic', e.target.checked)} id="strategic-check" />
        <label htmlFor="strategic-check" style={{ fontSize: '0.9rem', color: 'var(--white)' }}>Strategic Capability</label>
      </div>

      <h3 style={{ fontSize: '1rem', color: 'var(--white)', marginTop: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Scores (0-100)</h3>
      {['coverage', 'security', 'privacy', 'debt', 'risk'].map(score => (
        <div key={score} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{score}</label>
          <input 
            type="number" min="0" max="100" 
            value={formData.scores?.[score] || 0} 
            onChange={e => handleScoreChange(score, parseInt(e.target.value) || 0)} 
            style={{ width: '80px', padding: '0.3rem', background: 'rgba(0,0,0,0.2)', color: 'var(--white)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }} 
          />
        </div>
      ))}

      <h3 style={{ fontSize: '1rem', color: 'var(--white)', marginTop: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Mappings (Comma Separated)</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tech Stack</label>
        <input type="text" value={formData.techStack?.join(', ') || ''} onChange={e => handleArrayChange('techStack', e.target.value)} className="glass-select" style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.2)', color: 'var(--white)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Applications</label>
        <input type="text" value={formData.applications?.join(', ') || ''} onChange={e => handleArrayChange('applications', e.target.value)} className="glass-select" style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.2)', color: 'var(--white)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }} />
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
        <button 
          onClick={() => onSave(formData as Capability)}
          style={{ width: '100%', padding: '0.75rem', background: 'var(--light-blue)', color: 'var(--white)', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 'bold' }}
        >
          <Save size={18} /> Save Capability
        </button>
      </div>

    </div>
  );
}
