import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Flag, ExternalLink } from 'lucide-react';
import { reportService } from '../../services/report.service';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'reviewed', label: 'Revisado' },
  { value: 'dismissed', label: 'Descartado' }
];

const reasonLabels = {
  offensive: 'Contenido ofensivo',
  false_info: 'Información falsa',
  spam_scam: 'Spam o estafa',
  other: 'Otro'
};

const AdminReportsPanel = ({ reports, onRefresh }) => {
  const [local, setLocal] = useState({});
  const [savingId, setSavingId] = useState(null);

  const getDraft = (report) => ({
    status: local[report.id]?.status ?? report.status,
    admin_notes: local[report.id]?.admin_notes ?? (report.admin_notes ?? '')
  });

  const setDraft = (id, patch) => {
    setLocal((prev) => {
      const report = reports.find((r) => r.id === id);
      if (!report) return prev;
      const base = {
        status: prev[id]?.status ?? report.status,
        admin_notes: prev[id]?.admin_notes ?? (report.admin_notes ?? '')
      };
      return { ...prev, [id]: { ...base, ...patch } };
    });
  };

  const handleSave = async (report) => {
    const draft = getDraft(report);
    setSavingId(report.id);
    const { error } = await reportService.updateReport(report.id, {
      status: draft.status,
      admin_notes: draft.admin_notes.trim() || null
    });
    setSavingId(null);
    if (error) {
      alert('No se pudo actualizar el reporte: ' + error.message);
      return;
    }
    setLocal((prev) => {
      const next = { ...prev };
      delete next[report.id];
      return next;
    });
    onRefresh();
  };

  if (!reports.length) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 p-8 text-center text-gray-500">
        <Flag className="mx-auto mb-3 text-gray-300" size={40} />
        <p className="font-medium text-dark">No hay reportes por ahora</p>
        <p className="text-sm mt-1">Cuando los usuarios reporten un negocio, aparecerán aquí.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => {
        const draft = getDraft(report);
        const business = report.businesses;
        const reporter = report.users;
        const dirty =
          draft.status !== report.status ||
          (draft.admin_notes || '') !== (report.admin_notes || '');

        return (
          <div
            key={report.id}
            className="rounded-xl border border-gray-100 bg-white p-4 md:p-5 shadow-sm space-y-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Reporte</p>
                <p className="font-bold text-dark mt-0.5">
                  {reasonLabels[report.reason] || report.reason}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Por {reporter?.full_name || 'Usuario'} ·{' '}
                  {new Date(report.created_at).toLocaleString('es')}
                </p>
              </div>
              {business?.id && (
                <Link
                  to={`/business/${business.id}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  {business.name}
                  <ExternalLink size={14} />
                </Link>
              )}
            </div>
            {report.details && (
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-100">
                {report.details}
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div className="md:col-span-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
                <select
                  value={draft.status}
                  onChange={(e) => setDraft(report.id, { status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Notas internas (solo admin)</label>
                <input
                  type="text"
                  value={draft.admin_notes}
                  onChange={(e) => setDraft(report.id, { admin_notes: e.target.value })}
                  placeholder="Ej. Revisado, sin incumplimiento"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                disabled={!dirty || savingId === report.id}
                onClick={() => handleSave(report)}
                className="bg-dark text-white text-sm font-bold px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {savingId === report.id ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminReportsPanel;
