"use client";

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import DataTable from '@/components/DataTable';
import { 
  Plus, 
  Search, 
  Users, 
  Edit,
  Trash2,
  MoreVertical,
  Shield,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Clock,
  Settings,
  Key,
  CheckCircle
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'owner' | 'admin' | 'dispatcher' | 'tech' | 'viewer';
  status: 'active' | 'suspended' | 'pending';
  last_login?: string;
  created_at: string;
  permissions?: string[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  user_count: number;
  system_role: boolean;
}

// Mock users data
const mockUsers: User[] = [
  {
    id: 'u1',
    email: 'sarah@plumbco.com',
    first_name: 'Sarah',
    last_name: 'Johnson',
    phone: '+15551234567',
    role: 'owner',
    status: 'active',
    last_login: '2024-01-15T10:30:00Z',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'u2',
    email: 'mike@plumbco.com',
    first_name: 'Mike',
    last_name: 'Chen',
    phone: '+15559876543',
    role: 'admin',
    status: 'active',
    last_login: '2024-01-14T16:45:00Z',
    created_at: '2024-01-02T00:00:00Z'
  },
  {
    id: 'u3',
    email: 'lisa@plumbco.com',
    first_name: 'Lisa',
    last_name: 'Wong',
    role: 'dispatcher',
    status: 'active',
    last_login: '2024-01-15T08:15:00Z',
    created_at: '2024-01-05T00:00:00Z'
  },
  {
    id: 'u4',
    email: 'dave@plumbco.com',
    first_name: 'Dave',
    last_name: 'Smith',
    phone: '+15555555555',
    role: 'tech',
    status: 'active',
    last_login: '2024-01-13T14:20:00Z',
    created_at: '2024-01-08T00:00:00Z'
  },
  {
    id: 'u5',
    email: 'john@plumbco.com',
    first_name: 'John',
    last_name: 'Miller',
    role: 'viewer',
    status: 'suspended',
    last_login: '2024-01-10T11:30:00Z',
    created_at: '2024-01-10T00:00:00Z'
  }
];

// Mock roles data
const mockRoles: Role[] = [
  {
    id: 'owner',
    name: 'Owner',
    description: 'Full system access and billing control',
    permissions: ['*'],
    user_count: 1,
    system_role: true
  },
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Manage users, settings, and operations',
    permissions: ['users.manage', 'settings.manage', 'jobs.manage', 'calls.view', 'reports.view'],
    user_count: 1,
    system_role: true
  },
  {
    id: 'dispatcher',
    name: 'Dispatcher',
    description: 'Manage jobs and schedule technicians',
    permissions: ['jobs.manage', 'calls.view', 'customers.manage'],
    user_count: 1,
    system_role: true
  },
  {
    id: 'tech',
    name: 'Technician',
    description: 'View assigned jobs and update status',
    permissions: ['jobs.view', 'jobs.update_own'],
    user_count: 1,
    system_role: true
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to reports and data',
    permissions: ['jobs.view', 'calls.view', 'reports.view'],
    user_count: 1,
    system_role: false
  }
];

const roleColors: Record<string, string> = {
  owner: 'bg-purple-100 text-purple-800',
  admin: 'bg-red-100 text-red-800',
  dispatcher: 'bg-blue-100 text-blue-800',
  tech: 'bg-green-100 text-green-800',
  viewer: 'bg-gray-100 text-gray-800'
};

const statusIcons: Record<string, JSX.Element> = {
  active: <UserCheck className="w-4 h-4 text-green-500" />,
  suspended: <UserX className="w-4 h-4 text-red-500" />,
  pending: <Clock className="w-4 h-4 text-yellow-500" />
};

export default function UsersPage() {
  const [users, setUsers] = useState(mockUsers);
  const [roles, setRoles] = useState(mockRoles);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [inviteUserOpen, setInviteUserOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('users');

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      if (selectedRole !== 'all' && user.role !== selectedRole) return false;
      if (selectedStatus !== 'all' && user.status !== selectedStatus) return false;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return user.first_name.toLowerCase().includes(searchLower) ||
               user.last_name.toLowerCase().includes(searchLower) ||
               user.email.toLowerCase().includes(searchLower);
      }
      return true;
    });
  }, [users, searchTerm, selectedRole, selectedStatus]);

  const handleUserStatusToggle = (userId: string) => {
    setUsers(users => users.map(user =>
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'suspended' : 'active' }
        : user
    ));
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users => users.filter(user => user.id !== userId));
    }
  };

  const userColumns = [
    {
      header: 'User',
      accessorKey: 'email',
      cell: ({ row }: { row: { original: User } }) => (
        <div>
          <div className="font-medium text-text-primary">
            {row.original.first_name} {row.original.last_name}
          </div>
          <div className="text-sm text-text-secondary flex items-center gap-1">
            <Mail className="w-3 h-3" />
            {row.original.email}
          </div>
          {row.original.phone && (
            <div className="text-sm text-text-secondary flex items-center gap-1 mt-1">
              <Phone className="w-3 h-3" />
              {row.original.phone}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Role',
      accessorKey: 'role',
      cell: ({ row }: { row: { original: User } }) => (
        <Badge className={`capitalize ${roleColors[row.original.role]}`}>
          {row.original.role}
        </Badge>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }: { row: { original: User } }) => (
        <div className="flex items-center gap-2">
          {statusIcons[row.original.status]}
          <span className="capitalize">{row.original.status}</span>
        </div>
      )
    },
    {
      header: 'Last Login',
      accessorKey: 'last_login',
      cell: ({ row }: { row: { original: User } }) => (
        <div>
          {row.original.last_login ? (
            <div>
              <div className="text-sm">
                {new Date(row.original.last_login).toLocaleDateString()}
              </div>
              <div className="text-xs text-text-secondary">
                {new Date(row.original.last_login).toLocaleTimeString()}
              </div>
            </div>
          ) : (
            <span className="text-text-secondary">Never</span>
          )}
        </div>
      )
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }: { row: { original: User } }) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSelectedUser(row.original);
              setEditUserOpen(true);
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleUserStatusToggle(row.original.id)}
            disabled={row.original.role === 'owner'}
          >
            {row.original.status === 'active' ? (
              <UserX className="w-4 h-4 text-red-500" />
            ) : (
              <UserCheck className="w-4 h-4 text-green-500" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDeleteUser(row.original.id)}
            disabled={row.original.role === 'owner'}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Users & Roles</h1>
            <p className="text-text-secondary mt-1">
              Manage user accounts and role-based permissions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Permissions
          </Button>
          <Dialog open={inviteUserOpen} onOpenChange={setInviteUserOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Invite User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New User</DialogTitle>
                <DialogDescription>
                  Send an invitation to add a new team member.
                </DialogDescription>
              </DialogHeader>
              <InviteUserForm onClose={() => setInviteUserOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content */}
      <div className="venlyn-card p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-gray-200 px-6">
            <TabsList className="bg-transparent">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="users" className="mt-0 space-y-6">
              {/* Filters */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                  <Input
                    placeholder="Search users..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="all">All Roles</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              {/* Users Summary */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-text-secondary">
                  Showing {filteredUsers.length} of {users.length} users
                </p>
                
                <div className="flex items-center gap-4 text-sm text-text-secondary">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-green-500" />
                    <span>{users.filter(u => u.status === 'active').length} Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserX className="w-4 h-4 text-red-500" />
                    <span>{users.filter(u => u.status === 'suspended').length} Suspended</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <span>{users.filter(u => u.status === 'pending').length} Pending</span>
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <DataTable
                columns={userColumns}
                data={filteredUsers}
                onRowClick={(user) => {
                  setSelectedUser(user as User);
                  setEditUserOpen(true);
                }}
              />
            </TabsContent>

            <TabsContent value="roles" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map(role => (
                  <div key={role.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-text-secondary" />
                        <h3 className="font-semibold">{role.name}</h3>
                      </div>
                      {role.system_role && (
                        <Badge variant="outline" className="text-xs">
                          System
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-text-secondary mb-4">{role.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Users:</span>
                        <Badge variant="outline">{role.user_count}</Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Permissions:</div>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 3).map(permission => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                          {role.permissions.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{role.permissions.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {!role.system_role && (
                        <div className="flex gap-2 pt-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                <button className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <Plus className="w-8 h-8 mx-auto mb-3 text-text-tertiary" />
                  <p className="text-sm font-medium text-text-secondary">Create Custom Role</p>
                </button>
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="mt-0 space-y-6">
              <PermissionMatrix roles={roles} />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit User - {selectedUser?.first_name} {selectedUser?.last_name}
            </DialogTitle>
            <DialogDescription>
              Update user information and permissions.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <EditUserForm 
              user={selectedUser} 
              onClose={() => setEditUserOpen(false)}
              onSave={(updatedUser) => {
                setUsers(users => users.map(u => u.id === updatedUser.id ? updatedUser : u));
                setEditUserOpen(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InviteUserForm({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('viewer');

  const handleInvite = () => {
    // Simulate invite
    alert(`Invitation sent to ${email}`);
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">First Name</label>
          <Input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="John"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Last Name</label>
          <Input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Email Address</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="john@company.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Role</label>
        <select 
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-2 border border-gray-200 rounded-lg"
        >
          <option value="viewer">Viewer</option>
          <option value="tech">Technician</option>
          <option value="dispatcher">Dispatcher</option>
          <option value="admin">Administrator</option>
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleInvite} disabled={!email || !firstName || !lastName}>
          Send Invitation
        </Button>
      </div>
    </div>
  );
}

interface EditUserFormProps {
  user: User;
  onClose: () => void;
  onSave: (user: User) => void;
}

function EditUserForm({ user, onClose, onSave }: EditUserFormProps) {
  const [formData, setFormData] = useState(user);

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">First Name</label>
          <Input
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Last Name</label>
          <Input
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Phone</label>
        <Input
          value={formData.phone || ''}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+1 (555) 123-4567"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Role</label>
        <select 
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
          className="w-full p-2 border border-gray-200 rounded-lg"
          disabled={user.role === 'owner'}
        >
          <option value="owner">Owner</option>
          <option value="admin">Administrator</option>
          <option value="dispatcher">Dispatcher</option>
          <option value="tech">Technician</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Status</label>
        <select 
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as User['status'] })}
          className="w-full p-2 border border-gray-200 rounded-lg"
          disabled={user.role === 'owner'}
        >
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}

function PermissionMatrix({ roles }: { roles: Role[] }) {
  const permissions = [
    'users.manage',
    'settings.manage',
    'jobs.manage',
    'jobs.view',
    'jobs.update_own',
    'calls.view',
    'customers.manage',
    'reports.view',
    'billing.manage'
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Permission Matrix</h3>
        <p className="text-sm text-text-secondary">
          Overview of permissions across all roles
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 font-medium border-b border-gray-200">
                Permission
              </th>
              {roles.map(role => (
                <th key={role.id} className="text-center p-4 font-medium border-b border-gray-200 min-w-[100px]">
                  {role.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissions.map(permission => (
              <tr key={permission} className="border-b border-gray-200">
                <td className="p-4 font-mono text-sm">
                  {permission}
                </td>
                {roles.map(role => (
                  <td key={role.id} className="p-4 text-center">
                    {role.permissions.includes('*') || role.permissions.includes(permission) ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded mx-auto"></div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}