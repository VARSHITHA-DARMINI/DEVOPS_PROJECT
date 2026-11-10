import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', danger = true }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="bg-navy-800 rounded-2xl border border-white/10 w-full max-w-sm p-6 animate-fadeIn">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${danger ? 'bg-red-500/20' : 'bg-yellow-500/20'}`}>
            <AlertTriangle size={20} className={danger ? 'text-red-400' : 'text-yellow-400'} />
          </div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <p className="text-sm text-gray-400 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 justify-center font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 text-sm ${
              danger ? 'bg-red-500 hover:bg-red-600 text-white' : 'btn-primary'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
