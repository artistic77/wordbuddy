import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, Trophy, ShieldCheck, Search, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import type { Profile } from '../../types';

interface UserWithStats extends Profile {
  setsCount?: number;
}

export const AdminDashboardPage: React.FC = () => {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [totalSets, setTotalSets] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // 2. Fetch sets count
      const { data: setsData } = await supabase.from('vocab_sets').select('id, owner_id');
      setTotalSets(setsData?.length || 0);

      // 3. Fetch study sessions count
      const { data: sessionsData } = await supabase.from('study_sessions').select('id');
      setTotalSessions(sessionsData?.length || 0);

      // Map sets count per user
      const setMap: Record<string, number> = {};
      (setsData || []).forEach((s) => {
        setMap[s.owner_id] = (setMap[s.owner_id] || 0) + 1;
      });

      const enrichedUsers = (profilesData || []).map((u) => ({
        ...u,
        setsCount: setMap[u.id] || 0,
      }));

      setUsers(enrichedUsers);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleSuspend = async (user: UserWithStats) => {
    const newStatus = !user.is_suspended;
    if (
      !window.confirm(
        `Are you sure you want to ${newStatus ? 'suspend' : 'unsuspend'} user "${user.display_name}"?`
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_suspended: newStatus })
        .eq('id', user.id);

      if (error) throw error;
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_suspended: newStatus } : u))
      );
    } catch (err) {
      console.error('Failed to toggle suspension:', err);
    }
  };

  const handleToggleRole = async (user: UserWithStats) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change role of "${user.display_name}" to ${newRole.toUpperCase()}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', user.id);

      if (error) throw error;
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error('Failed to change role:', err);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-secondary flex items-center justify-center">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-outfit font-bold text-text-primary tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-text-secondary text-sm">
            Platform user directory, activity metrics, and content management.
          </p>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center text-primary">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Total Users
            </p>
            <p className="text-2xl font-outfit font-bold text-text-primary">{users.length}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Vocab Sets
            </p>
            <p className="text-2xl font-outfit font-bold text-text-primary">{totalSets}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Study Sessions
            </p>
            <p className="text-2xl font-outfit font-bold text-text-primary">{totalSessions}</p>
          </div>
        </Card>
      </div>

      {/* User Management Section */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-outfit font-bold text-text-primary">Registered Users</h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Inspect user decks, manage permissions, and oversee accounts.
            </p>
          </div>

          <div className="w-full sm:w-72">
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto border border-border rounded-xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface border-b border-border text-xs uppercase font-semibold text-text-secondary">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Sets</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-text-secondary">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-text-secondary">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary-light text-primary font-outfit font-bold flex items-center justify-center text-sm">
                          {u.display_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-text-primary">{u.display_name}</p>
                          <p className="text-xs text-text-secondary font-mono">{u.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <Badge variant={u.role === 'admin' ? 'admin' : 'user'} size="sm">
                        {u.role}
                      </Badge>
                    </td>

                    <td className="px-5 py-4 font-semibold text-text-primary">
                      {u.setsCount || 0}
                    </td>

                    <td className="px-5 py-4">
                      {u.is_suspended ? (
                        <Badge variant="suspended" size="sm">
                          Suspended
                        </Badge>
                      ) : (
                        <Badge variant="active" size="sm">
                          Active
                        </Badge>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/admin/users/${u.id}`}>
                          <Button variant="secondary" size="sm" className="h-8 px-2.5 text-xs">
                            View Sets
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleToggleRole(u)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-border hover:border-primary text-text-secondary hover:text-primary transition-colors"
                          title="Toggle Admin role"
                        >
                          {u.role === 'admin' ? 'Demote' : 'Promote'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleSuspend(u)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            u.is_suspended
                              ? 'border-accent-green/30 text-accent-emerald hover:bg-accent-green-light'
                              : 'border-secondary/30 text-secondary hover:bg-secondary-light'
                          }`}
                          title={u.is_suspended ? 'Unsuspend' : 'Suspend'}
                        >
                          {u.is_suspended ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
