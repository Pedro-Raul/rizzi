const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  loading = false,
  onConfirm,
  onCancel,
  variant = 'danger' // danger, primary, success
}) => {
  if (!open) return null;

  const btnClasses = {
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    primary: 'bg-primary hover:bg-opacity-95 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white'
  };

  const confirmBtnClass = btnClasses[variant] || btnClasses.danger;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-dark/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-gray-100">
        <h2 className="text-xl font-bold text-dark mb-2">{title}</h2>
        <p className="text-gray-600 text-sm leading-relaxed mb-6">{description}</p>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2 rounded-lg font-bold transition-colors disabled:opacity-60 ${confirmBtnClass}`}
          >
            {loading ? 'Procesando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
