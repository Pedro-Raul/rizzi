import { useState } from 'react';
import { X } from 'lucide-react';

const REASONS = [
  { value: 'offensive', label: 'Lenguaje o contenido ofensivo' },
  { value: 'false_info', label: 'Información falsa o engañosa' },
  { value: 'spam_scam', label: 'Spam, estafa o venta no autorizada' },
  { value: 'other', label: 'Otro motivo' }
];

const ReportBusinessModal = ({ open, businessName, saving, onClose, onSubmit }) => {
  const [reason, setReason] = useState(REASONS[0].value);
  const [details, setDetails] = useState('');

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ reason, details: details.trim() });
  };

  const handleClose = () => {
    setReason(REASONS[0].value);
    setDetails('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" role="dialog" aria-modal="true" aria-labelledby="report-title">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-100">
        <div className="flex items-start justify-between gap-4 p-5 border-b border-gray-100">
          <div>
            <h2 id="report-title" className="text-lg font-bold text-dark">Reportar negocio</h2>
            <p className="text-sm text-gray-500 mt-1">{businessName}</p>
          </div>
          <button type="button" onClick={handleClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg" aria-label="Cerrar">
            <X size={22} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
            >
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Detalles (opcional)</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="Describe lo que viste para ayudar al equipo de moderación."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-y"
            />
            <p className="text-xs text-gray-400 mt-1">{details.length}/2000</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-primary text-white font-bold py-2.5 px-4 rounded-lg hover:bg-opacity-90 disabled:opacity-50"
            >
              {saving ? 'Enviando...' : 'Enviar reporte'}
            </button>
            <button type="button" onClick={handleClose} className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportBusinessModal;
