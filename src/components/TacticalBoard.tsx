import React, { useState } from 'react';
import { formations } from '../data/formations';
import { Formation, FormationPosition } from '../types';
import { RotateCcw, Save, Download, Upload } from 'lucide-react';

const TacticalBoard: React.FC = () => {
  const [selectedFormation, setSelectedFormation] = useState<Formation>(formations[0]);
  const [positions, setPositions] = useState<FormationPosition[]>(formations[0].positions);
  const [isDragging, setIsDragging] = useState<string | null>(null);

  const handlePositionDrag = (positionId: string, newX: number, newY: number) => {
    setPositions(prev => prev.map(pos => 
      pos.id === positionId 
        ? { ...pos, x: Math.max(5, Math.min(95, newX)), y: Math.max(5, Math.min(95, newY)) }
        : pos
    ));
  };

  const handleFormationChange = (formation: Formation) => {
    setSelectedFormation(formation);
    setPositions(formation.positions);
  };

  const resetPositions = () => {
    setPositions(selectedFormation.positions);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Tactical Board</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={resetPositions}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          <button 
            onClick={() => {
              // Save formation functionality
              console.log('Saving formation:', selectedFormation.name, positions);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Formation Selector */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Formations</h3>
          <div className="space-y-2">
            {formations.map((formation) => (
              <button
                key={formation.id}
                onClick={() => handleFormationChange(formation)}
                className={`w-full p-3 text-left rounded-lg transition-colors ${
                  selectedFormation.id === formation.id
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="font-medium">{formation.name}</div>
                <div className="text-sm text-gray-500">{formation.positions.length} players</div>
              </button>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Actions</h4>
            <div className="space-y-2">
              <button 
                onClick={() => {
                  // Import formation functionality
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Import Formation</span>
              </button>
              <button 
                onClick={() => {
                  // Export formation functionality
                  const formationData = {
                    formation: selectedFormation,
                    positions: positions
                  };
                  console.log('Exporting formation:', formationData);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export Formation</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tactical Field */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="relative w-full h-[600px] bg-gradient-to-b from-green-400 to-green-500 rounded-lg overflow-hidden">
              {/* Field Markings */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Field outline */}
                <rect x="2" y="2" width="96" height="96" fill="none" stroke="white" strokeWidth="0.3" />
                
                {/* Center line */}
                <line x1="50" y1="2" x2="50" y2="98" stroke="white" strokeWidth="0.2" />
                
                {/* Center circle */}
                <circle cx="50" cy="50" r="8" fill="none" stroke="white" strokeWidth="0.2" />
                
                {/* Penalty areas */}
                <rect x="2" y="25" width="18" height="50" fill="none" stroke="white" strokeWidth="0.2" />
                <rect x="80" y="25" width="18" height="50" fill="none" stroke="white" strokeWidth="0.2" />
                
                {/* Goal areas */}
                <rect x="2" y="40" width="8" height="20" fill="none" stroke="white" strokeWidth="0.2" />
                <rect x="90" y="40" width="8" height="20" fill="none" stroke="white" strokeWidth="0.2" />
                
                {/* Goals */}
                <rect x="0" y="45" width="2" height="10" fill="white" strokeWidth="0.1" />
                <rect x="98" y="45" width="2" height="10" fill="white" strokeWidth="0.1" />
              </svg>

              {/* Player Positions */}
              {positions.map((position) => (
                <div
                  key={position.id}
                  className="absolute cursor-move transform -translate-x-1/2 -translate-y-1/2 group"
                  style={{
                    left: `${position.x}%`,
                    top: `${position.y}%`,
                  }}
                  onMouseDown={(e) => {
                    setIsDragging(position.id);
                    const field = e.currentTarget.parentElement!;
                    const fieldRect = field.getBoundingClientRect();

                    const handleMouseMove = (e: MouseEvent) => {
                      const newX = ((e.clientX - fieldRect.left) / fieldRect.width) * 100;
                      const newY = ((e.clientY - fieldRect.top) / fieldRect.height) * 100;
                      handlePositionDrag(position.id, newX, newY);
                    };

                    const handleMouseUp = () => {
                      setIsDragging(null);
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };

                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                >
                  <div
                    className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-lg transition-transform group-hover:scale-110 ${
                      isDragging === position.id ? 'scale-110' : ''
                    }`}
                    style={{ backgroundColor: position.position.color }}
                  >
                    {position.position.abbreviation}
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {position.position.name}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p className="mb-2">
                <strong>Current Formation:</strong> {selectedFormation.name}
              </p>
              <p>Drag players to customize positions. Changes are saved automatically.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TacticalBoard;