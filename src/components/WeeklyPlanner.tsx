import React, { useState } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Plus, Clock, Users, MapPin, Edit, Trash2 } from 'lucide-react';
import { useTrainingSessions } from '../hooks/useTrainingSessions';
import SessionForm from './SessionForm';

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

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {weekDays.map((day, index) => {
          const daySessions = getSessionsForDay(day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div
              key={index}
              className={`bg-white rounded-lg shadow-md overflow-hidden ${
                isToday ? 'ring-2 ring-green-500' : ''
              }`}
            >
              <div className={`p-4 ${isToday ? 'bg-green-50' : 'bg-gray-50'} border-b`}>
                <h3 className="font-semibold text-gray-900">
                  {format(day, 'EEEE')}
                </h3>
                <p className="text-sm text-gray-600">{format(day, 'MMM d')}</p>
              </div>
              
              <div className="p-4 space-y-3 min-h-[200px]">
                {daySessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group p-3 rounded-lg border-l-4 relative ${
                      session.session_type === 'match'
                        ? 'bg-red-50 border-red-500'
                        : 'bg-green-50 border-green-500'
                    } hover:shadow-md transition-shadow`}
                  >
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                      <button
                        onClick={() => handleEditSession(session)}
                        className="p-1 bg-white rounded shadow-sm hover:bg-gray-50 transition-colors"
                        title="Edit session"
                      >
                        <Edit className="w-3 h-3 text-gray-600" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(session.id)}
                        className="p-1 bg-white rounded shadow-sm hover:bg-gray-50 transition-colors"
                        title="Delete session"
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </button>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">{session.title}</h4>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{session.duration} mins</span>
                      </div>
                      {session.notes && (
                        <p className="text-gray-500 truncate">{session.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={() => handleAddSession(day)}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-green-500 hover:text-green-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Session</span>
                </button>
              </div>
            </div>
          );
        })}
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
    </div>
  );
};

export default WeeklyPlanner;