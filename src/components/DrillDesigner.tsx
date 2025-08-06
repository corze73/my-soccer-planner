import React, { useState } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Plus, Clock, Users, MapPin, Edit, Trash2 } from 'lucide-react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useTrainingSessions } from '../hooks/useTrainingSessions';
import SessionForm from './SessionForm';

// Define Drill type if not imported from elsewhere
export interface Drill {
  id: string;
  name: string;
  description: string;
  diagram: any[];
  category: string;
}

export interface DrillDesignerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (drillData: { name: string; description: string; diagram: any[]; category: string }) => void;
  drill?: Drill;
}

const WeeklyPlanner: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingSession, setEditingSession] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { sessions, createSession, updateSession, deleteSession, loading } = useTrainingSessions();

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getSessionsForDay = (date: Date) => {
    return sessions.filter(session => isSameDay(new Date(session.session_date), date));
  };

  const handleAddSession = (date: Date) => {
    setSelectedDate(date);
    setShowAddModal(true);
  };

  const handleCreateSession = async (sessionData: any) => {
    console.log('WeeklyPlanner: Creating session with data:', sessionData);
    
    let result;
    if (editingSession) {
      console.log('WeeklyPlanner: Updating existing session:', editingSession.id);
      result = await updateSession(editingSession.id, sessionData);
    } else {
      console.log('WeeklyPlanner: Creating new session');
      result = await createSession(sessionData);
    }
    
    console.log('WeeklyPlanner: Session operation result:', result);
    
    if (result.error) {
      console.error('WeeklyPlanner: Session operation failed:', result.error);
      throw new Error(result.error);
    } else {
      console.log('WeeklyPlanner: Session operation successful');
    }
  };

  const handleEditSession = (session: any) => {
    setEditingSession(session);
    setShowAddModal(true);
  };

  const handleDeleteSession = async (sessionId: string) => {
    const result = await deleteSession(sessionId);
    if (result.error) {
      alert('Error deleting session: ' + result.error);
    }
    setDeleteConfirm(null);
  };


  const closeModal = () => {
    setShowAddModal(false);
    setSelectedDate(null);
    setEditingSession(null);
  };
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Weekly Training Plan</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Previous Week
            </button>
            <span className="text-lg font-medium text-gray-900">
              {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
            </span>
            <button
              onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Next Week
            </button>
          </div>
        </div>
        {/* Add your week days rendering here */}
        <div className="grid grid-cols-7 gap-4 mt-6">
          {weekDays.map((date) => (
            <div key={date.toISOString()} className="bg-gray-100 rounded-lg p-4 min-h-[180px] flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{format(date, 'EEE d')}</span>
                <button
                  className="p-1 rounded hover:bg-gray-200"
                  onClick={() => handleAddSession(date)}
                  title="Add session"
                >
                  <Plus size={18} />
                </button>
              </div>
              <div className="flex-1 space-y-2">
                {getSessionsForDay(date).map((session: any) => (
                  <div
                    key={session.id}
                    className="bg-white rounded shadow p-2 flex flex-col space-y-1 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{session.title}</span>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          className="p-1 hover:bg-gray-100 rounded"
                          onClick={() => handleEditSession(session)}
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="p-1 hover:bg-gray-100 rounded"
                          onClick={() => setDeleteConfirm(session.id)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 space-x-2">
                      <Clock size={14} />
                      <span>{session.time}</span>
                      <Users size={14} />
                      <span>{session.players || 0}</span>
                      <MapPin size={14} />
                      <span>{session.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <SessionForm
        isOpen={showAddModal || !!editingSession}
        onClose={closeModal}
        onSubmit={handleCreateSession}
        selectedDate={selectedDate || undefined}
        session={editingSession}
        loading={loading}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Session</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this session? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeleteSession(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DndProvider>
  );
};

export default WeeklyPlanner;