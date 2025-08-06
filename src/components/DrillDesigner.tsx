import React, { useState } from 'react';
import { X, Save, Eye, EyeOff } from 'lucide-react';
import DrawingCanvas from './DrawingCanvas';

interface DrillDesignerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (drill: {
    name: string;
    description: string;
    diagram: any[];
    category: string;
  }) => void;
  drill?: {
    name: string;
    description: string;
    diagram: any[];
    category: string;
  };
}

const DrillDesigner: React.FC<DrillDesignerProps> = ({
  isOpen,
  onClose,
  onSave,
  drill
}) => {
  const [drillData, setDrillData] = useState({
    name: drill?.name || '',
    description: drill?.description || '',
    category: drill?.category || 'technical',
    diagram: drill?.diagram || []
  });
  const [pitchType, setPitchType] = useState<'full' | 'half' | 'unmarked'>('full');

  const handleSave = () => {
    if (!drillData.name.trim()) {
      alert('Please enter a drill name');
      return;
    }

    onSave(drillData);
    onClose();
  };

  const handleDiagramSave = (elements: any[]) => {
    setDrillData(prev => ({ ...prev, diagram: elements }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {drill ? 'Edit Drill' : 'Draw New Drill'}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const types: ('full' | 'half' | 'unmarked')[] = ['full', 'half', 'unmarked'];
                const currentIndex = types.indexOf(pitchType);
                const nextIndex = (currentIndex + 1) % types.length;
                setPitchType(types[nextIndex]);
              }}
              className="flex items-center space-x-2 px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>
                {pitchType === 'full' ? 'Full Pitch' : 
                 pitchType === 'half' ? 'Half Pitch' : 'Unmarked'}
              </span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Drill Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Drill Name
              </label>
              <input
                type="text"
                value={drillData.name}
                onChange={(e) => setDrillData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter drill name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={drillData.category}
                onChange={(e) => setDrillData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="warmup">Warm-up</option>
                <option value="technical">Technical</option>
                <option value="tactical">Tactical</option>
                <option value="physical">Physical</option>
                <option value="cooldown">Cool-down</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={drillData.description}
              onChange={(e) => setDrillData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
              placeholder="Describe the drill setup, objectives, and instructions..."
            />
          </div>

          {/* Drawing Canvas */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Drill Diagram</h4>
            <DrawingCanvas
              width={800}
              height={500}
              onSave={handleDiagramSave}
              initialElements={drillData.diagram}
              pitchType={pitchType}
            />
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Drawing Instructions:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use the <strong>Pen</strong> tool to draw lines and paths</li>
              <li>• Use <strong>Shapes</strong> (rectangle, circle) to mark areas or equipment</li>
              <li>• Use <strong>Arrows</strong> to show player movement or ball direction</li>
              <li>• Use <strong>Player</strong> tool to place numbered players on the field</li>
              <li>• Use <strong>Football</strong> tool to place the ball</li>
              <li>• Use <strong>Text</strong> tool to add labels and instructions</li>
              <li>• Adjust <strong>Player Size</strong> with the slider</li>
              <li>• Switch between <strong>Full/Half/Unmarked</strong> pitch views</li>
              <li>• Select colors and line width from the toolbar</li>
              <li>• Use Undo/Redo to correct mistakes</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Drill</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrillDesigner;