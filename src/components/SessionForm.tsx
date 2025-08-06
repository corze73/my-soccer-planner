import React, { useState } from 'react';
import { X, Calendar, Clock, FileText, Target, Plus, Trash2, Pen } from 'lucide-react';
import { format } from 'date-fns';

interface Drill {
  id: string;
  name: string;
  description: string;
  category: string;
  diagram: any[];
}

interface Activity {
  id: string;
  name: string;
  duration: number;
  description: string;
  category: 'warmup' | 'technical' | 'tactical' | 'physical' | 'cooldown';
  drills?: Drill[];
}

interface SessionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sessionData: {
    title: string;
    session_date: string;
    duration: number;
    session_type: 'training' | 'match';
    notes?: string;
    activities?: Activity[];
  }) => Promise<void>;
  selectedDate?: Date;
  session?: any;
  loading?: boolean;
}

const SessionForm: React.FC<SessionFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  selectedDate,
  session
}) => {
  const [formData, setFormData] = useState({
    title: session?.title || '',
    session_date: session?.session_date || (selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')),
    duration: session?.duration || 90,
    session_type: (session?.session_type || 'training') as 'training' | 'match',
    notes: session?.notes || '',
    activities: session?.activities?.map((activity: any) => ({
      id: activity.id,
      name: activity.name,
      duration: activity.duration,
      description: activity.description || '',
      category: activity.category,
      drills: [] // We'll load drills separately if needed
    })) || [] as Activity[]
  });
  const [error, setError] = useState<string | null>(null);
  const [showDrillDesigner, setShowDrillDesigner] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [newActivity, setNewActivity] = useState({
    name: '',
    duration: 15,
    description: '',
    category: 'technical' as 'warmup' | 'technical' | 'tactical' | 'physical' | 'cooldown',
    drills: [] as Drill[]
  });

  // Update form data when session prop changes
  React.useEffect(() => {
    if (session) {
      setFormData({
        title: session.title || '',
        session_date: session.session_date || format(new Date(), 'yyyy-MM-dd'),
        duration: session.duration || 90,
        session_type: session.session_type || 'training',
        notes: session.notes || '',
        activities: session.activities?.map((activity: any) => ({
          id: activity.id,
          name: activity.name,
          duration: activity.duration,
          description: activity.description || '',
          category: activity.category,
          drills: []
        })) || []
      });
    } else if (!session && selectedDate) {
      setFormData(prev => ({
        ...prev,
        session_date: format(selectedDate, 'yyyy-MM-dd')
      }));
    }
  }, [session, selectedDate]);
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'warmup': 'bg-orange-100 text-orange-800 border-orange-200',
      'technical': 'bg-blue-100 text-blue-800 border-blue-200',
      'tactical': 'bg-purple-100 text-purple-800 border-purple-200',
      'physical': 'bg-red-100 text-red-800 border-red-200',
      'cooldown': 'bg-green-100 text-green-800 border-green-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      console.log('Submitting session form with data:', formData);
      
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Session title is required');
      }
      
      if (!formData.session_date) {
        throw new Error('Session date is required');
      }
      
      // Prepare session data
      const sessionPayload = {
        title: formData.title.trim(),
        session_date: formData.session_date,
        duration: formData.duration,
        session_type: formData.session_type,
        notes: formData.notes.trim() || undefined,
        activities: formData.activities.length > 0 ? formData.activities : undefined
      };
      
      console.log('Session payload:', sessionPayload);
      
      await onSubmit(sessionPayload);
      
      console.log('Session submitted successfully');
      onClose();
      
      // Reset form only if not editing
      if (!session) {
        setFormData({
          title: '',
          session_date: format(new Date(), 'yyyy-MM-dd'),
          duration: 90,
          session_type: 'training',
          notes: '',
          activities: []
        });
      }
    } catch (error: any) {
      console.error('Session submission error:', error);
      setError(error.message);
    }
  };

  const addActivity = () => {
    if (!newActivity.name.trim()) return;

    const activity: Activity = {
      id: Date.now().toString(),
      ...newActivity,
      drills: []
    };

    setFormData(prev => ({
      ...prev,
      activities: [...prev.activities, activity]
    }));

    setNewActivity({
      name: '',
      duration: 15,
      description: '',
      category: 'technical',
      drills: []
    });
    setShowActivityForm(false);
  };

  const removeActivity = (activityId: string) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.filter((a: Activity) => a.id !== activityId)
    }));
  };

  const addDrillToActivity = () => {
    setShowDrillDesigner(true);
  };
  const removeDrill = (activityId: string, drillId: string) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.map((activity: Activity) => 
      activity.id === activityId
        ? { ...activity, drills: (activity.drills as Drill[]).filter((d: Drill) => d.id !== drillId) }
        : activity
      )
    }));
  };

  if (!isOpen) return null;

  // Drill Designer Modal component moved above usage

  // Placeholder DrillDesigner component to prevent compile error
  // Replace this with your actual DrillDesigner implementation or import
  const DrillDesigner: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Drill Designer (Placeholder)</h2>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {session ? 'Edit Training Session' : 'Create Training Session'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session Title
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Enter session title"
          required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
          type="date"
          value={formData.session_date}
          onChange={(e) => setFormData(prev => ({ ...prev, session_date: e.target.value }))}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
          type="number"
          value={formData.duration}
          onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          min="15"
          max="180"
          step="15"
          required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session Type
            </label>
            <div className="relative">
              <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
          value={formData.session_type}
          onChange={(e) => setFormData(prev => ({ ...prev, session_type: e.target.value as 'training' | 'match' }))}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
          <option value="training">Training</option>
          <option value="match">Match</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
              placeholder="Add any notes about this session..."
            />
          </div>

          {/* Activities Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
          Training Activities
              </label>
              <button
          type="button"
          onClick={() => setShowActivityForm(true)}
          className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
          <Plus className="w-3 h-3" />
          <span>Add Activity</span>
              </button>
            </div>

            {/* Activity Form */}
            {showActivityForm && (
              <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              value={newActivity.name}
              onChange={(e) => setNewActivity(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Activity name"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <div className="flex space-x-2">
              <input
                type="number"
                value={newActivity.duration}
                onChange={(e) => setNewActivity(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                placeholder="Duration"
                min="5"
                max="60"
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <select
                value={newActivity.category}
                onChange={(e) => setNewActivity(prev => ({ ...prev, category: e.target.value as any }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="warmup">Warm-up</option>
                <option value="technical">Technical</option>
                <option value="tactical">Tactical</option>
                <option value="physical">Physical</option>
                <option value="cooldown">Cool-down</option>
              </select>
            </div>
          </div>
          <textarea
            value={newActivity.description}
            onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Activity description..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-3"
          />
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => {
                if (!newActivity.name.trim()) {
            alert('Please enter an activity name first');
            return;
                }
            // Open the drill designer modal
            setShowDrillDesigner(true);
              }}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-white bg-opacity-70 rounded-lg hover:bg-opacity-90 transition-all"
            >
              <Pen className="w-3 h-3" />
              <span>Draw Drill</span>
            </button>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setShowActivityForm(false)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addActivity}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Add Activity
              </button>
            </div>
          </div>
              </div>
            )}

            {/* Activities List */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {formData.activities.map((activity: Activity, index: number) => (
          <div key={activity.id} className={`border rounded-lg p-3 ${getCategoryColor(activity.category)}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium">{index + 1}. {activity.name}</span>
            <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded-full">
              {activity.duration}min
            </span>
            <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded-full">
              {activity.category}
            </span>
                </div>
                {activity.description && (
            <p className="text-sm opacity-80">{activity.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeActivity(activity.id)}
                className="text-red-600 hover:text-red-800 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Drills */}
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Drills:</span>
                <button
            type="button"
            onClick={addDrillToActivity}
            className="flex items-center space-x-1 px-2 py-1 text-xs bg-white bg-opacity-70 rounded-lg hover:bg-opacity-90 transition-all"
                >
            <Pen className="w-3 h-3" />
            <span>Draw Drill</span>
                </button>
              </div>
              
              {activity.drills && activity.drills.length > 0 ? (
                <div className="space-y-2">
            {activity.drills.map((drill) => (
              <div key={drill.id} className="flex items-center justify-between bg-white bg-opacity-30 rounded-lg p-2">
                <div>
                  <span className="text-sm font-medium">{drill.name}</span>
                  {drill.description && (
              <p className="text-xs opacity-75">{drill.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeDrill(activity.id, drill.id)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
                </div>
              ) : (
                <p className="text-xs opacity-60">No drills added yet</p>
              )}
            </div>
          </div>
              ))}
    {/* Drill Designer Modal */}
    <DrillDesigner
      isOpen={showDrillDesigner}
      onClose={() => {
        setShowDrillDesigner(false);
      }}
    />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionForm;
