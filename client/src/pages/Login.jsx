import { useState } from 'react';
import useAuth from '../hooks/useAuth';
import FormInput from '../components/FormInput';
import { validateRegister } from '../utils/validators';

export default function Login() {
  const { handleLogin, handleRegister } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'learner' });
  const [errors, setErrors] = useState({});
  const [errMsg, setErrMsg] = useState('');

  async function submit(e) {
    e.preventDefault();
    setErrMsg('');
    try {
      if (mode === 'login') {
        await handleLogin(form.email, form.password);
      } else {
        const val = validateRegister(form);
        setErrors(val);
        if (Object.keys(val).length) return;
        await handleRegister(form);
      }
    } catch (err) { setErrMsg(err.message); }
  }

  return (
    <div className="min-h-screen grid place-items-center relative">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
        {errMsg && <div className="mb-4 text-red-400 text-sm">{errMsg}</div>}
        <form onSubmit={submit} className="space-y-4">
          {mode === 'register' && (
            <>
              <FormInput label="Name" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} error={errors.name} />
              <div>
                <label className="text-sm text-slate-300">Role</label>
                <select className="input mt-1" value={form.role} onChange={e=>setForm({...form, role:e.target.value})}>
                  <option value="learner">Learner</option>
                  <option value="tutor">Tutor</option>
                </select>
              </div>
            </>
          )}
          <FormInput label="Email" type="email" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} error={errors.email} />
          {mode === 'register' && (
            <FormInput label="Phone" value={form.phone} onChange={(e)=>setForm({...form, phone:e.target.value})} error={errors.phone} />
          )}
          <FormInput label="Password" type="password" value={form.password} onChange={(e)=>setForm({...form, password:e.target.value})} error={errors.password} />
          <button className="btn btn-primary w-full" type="submit">{mode === 'login' ? 'Login' : 'Register'}</button>
        </form>
        <p className="mt-4 text-sm text-slate-300">
          {mode === 'login'
            ? <>No account? <button className="underline" onClick={()=>setMode('register')}>Register</button></>
            : <>Have an account? <button className="underline" onClick={()=>setMode('login')}>Login</button></>}
        </p>
      </div>
    </div>
  );
}