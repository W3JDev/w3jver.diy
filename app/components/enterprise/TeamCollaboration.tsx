import React, { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  ShareIcon, 
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  DocumentDuplicateIcon,
  CursorArrowRaysIcon,
  PencilIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'offline' | 'busy';
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  cursor?: { x: number; y: number };
  currentFile?: string;
}

interface TeamCollaborationProps {
  projectId: string;
  currentUser: TeamMember;
  onInviteUser?: (email: string, role: string) => void;
  onUpdatePermissions?: (userId: string, role: string) => void;
}

export const TeamCollaboration: React.FC<TeamCollaborationProps> = ({
  projectId,
  currentUser,
  onInviteUser,
  onUpdatePermissions
}) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john@w3jverse.com',
      status: 'online',
      role: 'owner',
      currentFile: 'src/App.tsx'
    },
    {
      id: '2', 
      name: 'Sarah Wilson',
      email: 'sarah@w3jverse.com',
      status: 'online',
      role: 'editor',
      currentFile: 'components/Header.tsx'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@w3jverse.com',
      status: 'busy',
      role: 'viewer',
      currentFile: 'styles/main.css'
    }
  ]);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isLiveSession, setIsLiveSession] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <CursorArrowRaysIcon className="w-4 h-4" />;
      case 'admin': return <PencilIcon className="w-4 h-4" />;
      case 'editor': return <DocumentDuplicateIcon className="w-4 h-4" />;
      default: return <EyeIcon className="w-4 h-4" />;
    }
  };

  const handleInviteUser = () => {
    if (inviteEmail && onInviteUser) {
      onInviteUser(inviteEmail, inviteRole);
      setInviteEmail('');
      setShowInviteModal(false);
    }
  };

  const startLiveSession = () => {
    setIsLiveSession(true);
    // Implement WebRTC/Socket.io live session
  };

  return (
    <div className="w3j-glass-morphism p-6 m-4" data-testid="team-dashboard">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <UsersIcon className="w-6 h-6" />
          Team Collaboration
        </h2>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowInviteModal(true)}
            className="w3j-button flex items-center gap-2"
          >
            <ShareIcon className="w-4 h-4" />
            Invite Member
          </button>
          
          <button
            onClick={startLiveSession}
            className={`w3j-button flex items-center gap-2 ${
              isLiveSession ? 'bg-red-500' : ''
            }`}
          >
            <VideoCameraIcon className="w-4 h-4" />
            {isLiveSession ? 'End Session' : 'Start Live Session'}
          </button>
        </div>
      </div>

      {/* Live Session Banner */}
      {isLiveSession && (
        <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-red-300">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="font-medium">Live collaboration session active</span>
            <span className="text-sm opacity-75">• 3 members connected</span>
          </div>
        </div>
      )}

      {/* Team Members List */}
      <div className="space-y-3 mb-6">
        <h3 className="text-lg font-medium text-white mb-3">Team Members ({teamMembers.length})</h3>
        
        {teamMembers.map((member) => (
          <div 
            key={member.id}
            className="w3j-glass-morphism p-4 flex items-center justify-between hover:bg-opacity-20 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-w3j-orange to-w3j-blue rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(member.status)} rounded-full border-2 border-gray-800`}></div>
              </div>
              
              <div>
                <div className="text-white font-medium">{member.name}</div>
                <div className="text-sm text-gray-400">{member.email}</div>
                {member.currentFile && (
                  <div className="text-xs text-w3j-blue">Editing: {member.currentFile}</div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-w3j-gold">
                {getRoleIcon(member.role)}
                <span className="text-sm capitalize">{member.role}</span>
              </div>
              
              {currentUser.role === 'owner' && member.id !== currentUser.id && (
                <select 
                  value={member.role}
                  onChange={(e) => onUpdatePermissions?.(member.id, e.target.value)}
                  className="bg-transparent border border-w3j-glass-border rounded px-2 py-1 text-white text-sm"
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Real-time Activity Feed */}
      <div className="w3j-glass-morphism p-4">
        <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
          <ChatBubbleLeftRightIcon className="w-5 h-5" />
          Activity Feed
        </h3>
        
        <div className="space-y-2 max-h-60 overflow-y-auto">
          <div className="text-sm text-gray-300 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-w3j-blue">Sarah Wilson</span> 
            <span>edited</span>
            <span className="text-w3j-gold">Header.tsx</span>
            <span className="text-gray-500">2 min ago</span>
          </div>
          
          <div className="text-sm text-gray-300 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-w3j-blue">John Smith</span>
            <span>created new file</span>
            <span className="text-w3j-gold">utils/helpers.ts</span>
            <span className="text-gray-500">5 min ago</span>
          </div>
          
          <div className="text-sm text-gray-300 flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-w3j-blue">Mike Johnson</span>
            <span>left a comment on</span>
            <span className="text-w3j-gold">App.tsx:42</span>
            <span className="text-gray-500">8 min ago</span>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w3j-glass-morphism p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Invite Team Member</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w3j-prompt-input"
                  placeholder="colleague@company.com"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-300 mb-2">Role</label>
                <select 
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w3j-prompt-input"
                >
                  <option value="viewer">Viewer - Can view only</option>
                  <option value="editor">Editor - Can edit files</option>
                  <option value="admin">Admin - Can manage team</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleInviteUser}
                  className="w3j-button flex-1"
                >
                  Send Invite
                </button>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="w3j-icon-button px-4"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};