import React from 'react';

export const HierarchyTree = ({ personnel, supervisorId }: { personnel: any[], supervisorId: string | null }) => {
  const subordinates = personnel.filter(p => p.supervisorId === supervisorId);

  if (subordinates.length === 0) return null;

  return (
    <ul className="ml-6 border-l pl-4">
      {subordinates.map(p => (
        <li key={p.id} className="mb-2">
          <div className="font-semibold">{p.name} - {p.rank}</div>
          <HierarchyTree personnel={personnel} supervisorId={p.id} />
        </li>
      ))}
    </ul>
  );
};
