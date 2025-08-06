import React from 'react';
import { Calendar, Users, Target, Clipboard, Clock, Edit } from 'lucide-react';
import { usePlayers } from '../hooks/usePlayers';
import { useTrainingSessions } from '../hooks/useTrainingSessions';
import { format, isThisWeek } from 'date-fns';

interface DashboardProps {
  onTabChange: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onTabChange }) => {
  const { players } = usePlayers();
  const { sessions } = useTrainingSessions();

  const thisWeekSessions = sessions.filter(session => 
    isThisWeek(new Date(session.session_date), { weekStartsOn: 1 })
  );

  const stats = [
    { label: 'Sessions This Week', value: thisWeekSessions.length.toString(), icon: Calendar, color: 'bg-blue-500' },
    { label: 'Total Players', value: players.length.toString(), icon: Users, color: 'bg-green-500' },
    { label: 'Formations', value: '8', icon: Target, color: 'bg-purple-500' },
    { label: 'Templates', value: '2', icon: Clipboard, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome to Soccer Planner</h2>
        <p className="text-green-100">Plan your sessions, manage your squad, and analyze your tactics all in one place.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg p-4 shadow-md">
              <div className="flex items-center space-x-3">
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-green-600" />
            Upcoming Sessions
          </h3>
        </div>
        <div className="p-6">
          {thisWeekSessions.length > 0 ? (
            <div className="space-y-3">
              {thisWeekSessions.slice(0, 3).map((session) => (
                <div
                  key={session.id}
                  className={`group p-4 rounded-lg border-l-4 relative ${
                    session.session_type === 'match'
                      ? 'bg-red-50 border-red-500'
                      : 'bg-green-50 border-green-500'
                  }`}
                >
                  <button
                    onClick={() => onTabChange('weekly')}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white rounded shadow-sm hover:bg-gray-50"
                    title="Edit in Weekly Planner"
                  >
                    <Edit className="w-3 h-3 text-gray-600" />
                  </button>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{session.title}</h4>
                      <p className="text-sm text-gray-600">
                        {format(new Date(session.session_date), 'EEEE, MMM d')} • {session.duration} mins
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      session.session_type === 'match'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {session.session_type}
                    </span>
                  </div>
                </div>
              ))}
              {thisWeekSessions.length > 3 && (
                <p className="text-sm text-gray-500 text-center">
                  +{thisWeekSessions.length - 3} more sessions this week
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="mb-4">No upcoming sessions scheduled</p>
              <button 
                onClick={() => onTabChange('weekly')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Plan Your First Session
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          onClick={() => onTabChange('weekly')}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center space-x-3 mb-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h4 className="font-semibold text-gray-900">Plan Session</h4>
          </div>
          <p className="text-gray-600 text-sm">Create a new training session for your team</p>
        </div>
        
        <div 
          onClick={() => onTabChange('tactical')}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center space-x-3 mb-3">
            <Target className="w-6 h-6 text-purple-600" />
            <h4 className="font-semibold text-gray-900">Design Tactics</h4>
          </div>
          <p className="text-gray-600 text-sm">Create formations and tactical setups</p>
        </div>
        
        <div 
          onClick={() => onTabChange('players')}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center space-x-3 mb-3">
            <Users className="w-6 h-6 text-green-600" />
            <h4 className="font-semibold text-gray-900">Manage Squad</h4>
          </div>
          <p className="text-gray-600 text-sm">Update player information and positions</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;