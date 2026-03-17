import React, { useState } from 'react';

export const HierarchyTree = ({ personnel, supervisorId }: { personnel: any[], supervisorId: string | null }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const subordinates = personnel.filter(p => p.supervisorId === supervisorId);

  if (subordinates.length === 0) return null;

  const toggle = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <ul className="ml-6 border-l pl-4">
      {subordinates.map(p => (
        <li key={p.id} className="mb-2">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => toggle(p.id)}
              className="w-5 h-5 flex items-center justify-center bg-stone-200 rounded text-xs"
            >
              {expanded[p.id] ? '-' : '+'}
            </button>
            <div className="font-semibold">{p.name} - {p.rank}</div>
          </div>
          {expanded[p.id] && <HierarchyTree personnel={personnel} supervisorId={p.id} />}
        </li>
      ))}
    </ul>
  );
};
