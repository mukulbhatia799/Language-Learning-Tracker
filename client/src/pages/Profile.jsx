import { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import * as prof from '../services/profile';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const [me, setMe] = useState(null);
  const [account, setAccount] = useState({ name: '' });
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '' });
  const [roleFields, setRoleFields] = useState({
    comfortableLanguages: '',
    learningLanguage: '',
    teachingLanguages: '',
    gender: ''
  });

  async function load() {
    const m = await prof.me();
    setMe(m);
    setAccount({ name: m.name });
    setRoleFields({
      gender: m.profile?.gender || '',
      comfortableLanguages: (m.profile?.comfortableLanguages || []).join(', '),
      learningLanguage: m.profile?.learningLanguage || '',
      teachingLanguages: (m.profile?.teachingLanguages || []).join(', ')
    });
  }
  useEffect(() => { load(); }, []);

  async function saveRole(e) {
    e.preventDefault();
    try {
      const payload = {
        gender: roleFields.gender || 'prefer-not-to-say',
        comfortableLanguages: roleFields.comfortableLanguages.split(',').map(s=>s.trim()).filter(Boolean),
      };
      if (me.profile.role === 'learner') {
        payload.learningLanguage = roleFields.learningLanguage || '';
        // Keep previous deadline/hours if already set (optional)
        await prof.updateLearner({ ...payload, deadline: me.profile.deadline || new Date().toISOString(), hoursPerDay: me.profile.hoursPerDay || 0, hoursPerWeek: me.profile.hoursPerWeek || 0 });
      } else {
        payload.teachingLanguages = roleFields.teachingLanguages.split(',').map(s=>s.trim()).filter(Boolean);
        await prof.updateTutor(payload);
      }
      toast.success('Profile saved');
      setUser({ ...user }); load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Save failed');
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    try {
      await prof.changePassword(pwd);
      toast.success('Password changed');
      setPwd({ currentPassword:'', newPassword:'' });
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Password change failed');
    }
  }

  async function deleteAccount() {
    if (!confirm('Delete your account and all data? This cannot be undone.')) return;
    try {
      await prof.deleteMe();
      toast.success('Account deleted');
      logout();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Delete failed');
    }
  }

  if (!me) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Account basics */}
      <div className="card space-y-3">
        <div className="text-lg font-semibold">Account</div>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400">Name</label>
            <input className="input mt-1" value={account.name} onChange={e=>setAccount({ name: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-slate-400">Email</label>
            <input className="input mt-1 opacity-70" value={me.email} disabled />
          </div>
        </div>
        <div className="text-xs text-slate-400">Role: <b>{me.profile.role}</b></div>
      </div>

      {/* Role-specific languages */}
      <form className="card space-y-3" onSubmit={saveRole}>
        <div className="text-lg font-semibold">Preferences</div>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400">Gender</label>
            <input className="input mt-1" placeholder="male/female/non-binary/prefer-not-to-say" value={roleFields.gender} onChange={e=>setRoleFields({...roleFields, gender: e.target.value})} />
          </div>
          <div>
            <label className="text-xs text-slate-400">Comfortable languages (comma)</label>
            <input className="input mt-1" value={roleFields.comfortableLanguages} onChange={e=>setRoleFields({...roleFields, comfortableLanguages: e.target.value})} />
          </div>
          {me.profile.role === 'learner' ? (
            <div className="md:col-span-2">
              <label className="text-xs text-slate-400">Language interested in (learning)</label>
              <input className="input mt-1" value={roleFields.learningLanguage} onChange={e=>setRoleFields({...roleFields, learningLanguage: e.target.value})} />
            </div>
          ) : (
            <div className="md:col-span-2">
              <label className="text-xs text-slate-400">Teaching languages (comma)</label>
              <input className="input mt-1" value={roleFields.teachingLanguages} onChange={e=>setRoleFields({...roleFields, teachingLanguages: e.target.value})} />
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button className="btn btn-primary" type="submit">Save</button>
        </div>
      </form>

      {/* Change password */}
      <form className="card space-y-3" onSubmit={changePassword}>
        <div className="text-lg font-semibold">Change Password</div>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400">Current password</label>
            <input className="input mt-1" type="password" value={pwd.currentPassword} onChange={e=>setPwd({...pwd, currentPassword: e.target.value})} required />
          </div>
          <div>
            <label className="text-xs text-slate-400">New password</label>
            <input className="input mt-1" type="password" value={pwd.newPassword} onChange={e=>setPwd({...pwd, newPassword: e.target.value})} required />
          </div>
        </div>
        <button className="btn btn-primary" type="submit">Update Password</button>
      </form>

      {/* Danger zone */}
      <div className="card space-y-3">
        <div className="text-lg font-semibold text-red-300">Danger Zone</div>
        <button className="btn bg-red-600 hover:bg-red-500 text-white" onClick={deleteAccount}>Delete Account</button>
      </div>
    </div>
  );
}
