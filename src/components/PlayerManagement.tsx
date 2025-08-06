import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, User, MapPin, Users, AlertCircle } from 'lucide-react';
import { usePlayers } from '../hooks/usePlayers';
import { usePositions } from '../hooks/usePositions';
import PlayerForm from './PlayerForm';

const PlayerManagement: React.FC = () => {
  const { players, loading, error, deletePlayer } = usePlayers();
  const { positions } = usePositions();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('All');
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const positionOptions = ['All', ...positions.map(p => p.name)];

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = selectedPosition === 'All' || player.position?.name === selectedPosition;
    return matchesSearch && matchesPosition;
  });

  const handleDeletePlayer = async (playerId: string) => {
    const result = await deletePlayer(playerId);
    if (result.error) {
      alert('Error deleting player: ' + result.error);
    }
    setDeleteConfirm(null);
    if (selectedPlayer?.id === playerId) {
      setSelectedPlayer(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <p className="text-red-600">Error loading players: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Player Management</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Player</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Position:</span>
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {positionOptions.map(position => (
                <option key={position} value={position}>{position}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Players List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {filteredPlayers.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredPlayers.map((player) => (
                  <div
                    key={player.id}
                    className={`p-6 cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedPlayer?.id === player.id ? 'bg-green-50 border-l-4 border-green-500' : ''
                    }`}
                    onClick={() => setSelectedPlayer(player)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                          style={{ backgroundColor: player.position?.color || '#6B7280' }}
                        >
                          {player.jersey_number}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{player.name}</h3>
                          <div className="flex items-center space-x-3 text-sm text-gray-500">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span>{player.position?.name || 'No position'}</span>
                            </div>
                            <span>•</span>
                            <span>Preferred foot: {player.preferred_foot}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPlayer(player);
                          }}
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm(player.id);
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {player.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {players.length === 0 ? 'No players added yet' : 'No players match your search'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {players.length === 0 
                    ? 'Start building your squad by adding your first player'
                    : 'Try adjusting your search criteria'
                  }
                </p>
                {players.length === 0 && (
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add Your First Player
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Player Details */}
        <div className="bg-white rounded-lg shadow-md">
          {selectedPlayer ? (
            <div>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-4 mb-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                    style={{ backgroundColor: selectedPlayer.position?.color || '#6B7280' }}
                  >
                    {selectedPlayer.jersey_number}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{selectedPlayer.name}</h3>
                    <p className="text-gray-600">{selectedPlayer.position?.name || 'No position'}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Player Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Jersey Number:</span>
                      <span className="font-medium">#{selectedPlayer.jersey_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Position:</span>
                      <span className="font-medium">{selectedPlayer.position?.name || 'No position'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Preferred Foot:</span>
                      <span className="font-medium capitalize">{selectedPlayer.preferred_foot}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Skills & Attributes</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPlayer.skills.length > 0 ? (
                      selectedPlayer.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No skills added yet</p>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200 space-y-3">
                  <button 
                    onClick={() => setEditingPlayer(selectedPlayer)}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Edit Player
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Select a player to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Player Form Modal */}
      <PlayerForm
        isOpen={showAddModal || !!editingPlayer}
        onClose={() => {
          setShowAddModal(false);
          setEditingPlayer(null);
        }}
        player={editingPlayer}
        onSuccess={() => {
          setShowAddModal(false);
          setEditingPlayer(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Player</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this player? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeletePlayer(deleteConfirm)}
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

export default PlayerManagement;