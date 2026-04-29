import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react';

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

type Props = {
  data: Capability[];
  onEdit: (cap: Capability) => void;
};

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

export default function DataTable({ data, onEdit }: Props) {
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    
    // Filter by search term across all text fields
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      sortableItems = sortableItems.filter(item => 
        item.l1.toLowerCase().includes(lowerTerm) ||
        item.l2.toLowerCase().includes(lowerTerm) ||
        item.l3.toLowerCase().includes(lowerTerm) ||
        item.desc.toLowerCase().includes(lowerTerm) ||
        (item.techStack && item.techStack.join(' ').toLowerCase().includes(lowerTerm)) ||
        (item.applications && item.applications.join(' ').toLowerCase().includes(lowerTerm))
      );
    }

    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue: any = a[sortConfig.key as keyof Capability];
        let bValue: any = b[sortConfig.key as keyof Capability];
        
        // Handle nested scores or special fields if needed
        if (sortConfig.key === 'isStrategic') {
          aValue = a.isStrategic ? 1 : 0;
          bValue = b.isStrategic ? 1 : 0;
        } else if (['coverage', 'security', 'privacy', 'debt', 'risk'].includes(sortConfig.key)) {
          aValue = a.scores[sortConfig.key] || 0;
          bValue = b.scores[sortConfig.key] || 0;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig, searchTerm]);

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig?.key === columnKey) {
      return sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
    }
    return <ArrowUpDown size={14} style={{ opacity: 0.3 }} />;
  };

  const getScoreColor = (score: number) => {
    if (score < 20) return 'var(--overlay-0)';
    if (score < 40) return 'var(--overlay-25)';
    if (score < 60) return 'var(--overlay-50)';
    if (score < 80) return 'var(--overlay-75)';
    return 'var(--overlay-100)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search capabilities, domains, tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 1rem 0.6rem 2.5rem',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--white)',
              outline: 'none',
              fontSize: '0.9rem'
            }}
          />
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Showing {sortedData.length} capabilities
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead style={{ position: 'sticky', top: 0, background: 'var(--navy-light)', zIndex: 10, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <tr>
              {['l1', 'l2', 'l3', 'isStrategic', 'coverage', 'security', 'privacy', 'debt', 'risk'].map((key) => {
                const labels: Record<string, string> = {
                  l1: 'Domain (L1)',
                  l2: 'Group (L2)',
                  l3: 'Capability (L3)',
                  isStrategic: 'Strategic',
                  coverage: 'Cov.',
                  security: 'Sec.',
                  privacy: 'Priv.',
                  debt: 'Debt',
                  risk: 'Risk'
                };
                return (
                  <th 
                    key={key}
                    onClick={() => handleSort(key)}
                    style={{ 
                      padding: '0.75rem 1rem', 
                      cursor: 'pointer', 
                      color: 'var(--text-secondary)',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {labels[key]} <SortIcon columnKey={key} />
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((cap, idx) => (
              <tr 
                key={cap.id || idx}
                onClick={() => onEdit(cap)}
                style={{ 
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  cursor: 'pointer',
                  background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
                onMouseOut={(e) => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)'}
              >
                <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{cap.l1.replace(/\[|\]/g, '')}</td>
                <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{cap.l2.replace(/\[|\]/g, '')}</td>
                <td style={{ padding: '0.75rem 1rem', fontWeight: 500, color: 'var(--white)' }}>
                  <div>{cap.l3}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {cap.desc}
                  </div>
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  {cap.isStrategic && (
                    <span style={{ 
                      padding: '0.2rem 0.5rem', 
                      background: 'rgba(234, 179, 8, 0.2)', 
                      color: 'var(--overlay-50)', 
                      borderRadius: '4px',
                      fontSize: '0.75rem' 
                    }}>
                      Strategic
                    </span>
                  )}
                </td>
                {['coverage', 'security', 'privacy', 'debt', 'risk'].map(scoreKey => {
                  const val = cap.scores[scoreKey] || 0;
                  return (
                    <td key={scoreKey} style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '4px',
                        background: 'rgba(255,255,255,0.05)',
                        borderLeft: `3px solid ${getScoreColor(val)}`,
                        textAlign: 'center',
                        minWidth: '40px',
                        color: 'var(--white)'
                      }}>
                        {val}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
            {sortedData.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  No capabilities match your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
