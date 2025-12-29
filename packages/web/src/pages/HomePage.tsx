import React from 'react';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold text-slate-800 mb-4">
          Mermaid ER Diagram Editor
        </h1>
        <p className="text-xl text-slate-600 mb-8">
          Create and edit ER diagrams visually with real-time Mermaid code synchronization
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            to="/editor"
            className="px-8 py-3 bg-blue-500 text-white rounded-lg font-medium text-lg hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl"
          >
            Start Editing
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon="🎨"
            title="Visual Editing"
            description="Drag and drop entities, connect relationships with intuitive UI"
          />
          <FeatureCard
            icon="🔄"
            title="Bidirectional Sync"
            description="Edit visually or in code - changes sync automatically"
          />
          <FeatureCard
            icon="📦"
            title="Export Ready"
            description="Export to Mermaid code, PNG, or SVG formats"
          />
        </div>
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="bg-white rounded-xl p-6 shadow-md">
    <div className="text-4xl mb-3">{icon}</div>
    <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-600 text-sm">{description}</p>
  </div>
);
