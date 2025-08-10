export default function FormInput({ label, error, ...props }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm text-slate-300">{label}</span>
      <input {...props} className={`input ${error ? 'ring-2 ring-red-400' : ''}`} />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </label>
  );
}