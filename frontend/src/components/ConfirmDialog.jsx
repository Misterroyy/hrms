import { AlertTriangle, X } from 'lucide-react';

/**
 * Confirmation dialog (Delete, etc.)
 */
export default function ConfirmDialog({ title, message, onConfirm, onCancel, loading }) {
    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
                <div className="modal-body" style={{ textAlign: 'center', paddingTop: 28 }}>
                    <div className="confirm-icon">
                        <AlertTriangle />
                    </div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 8 }}>{title}</h3>
                    <p style={{ color: 'var(--clr-text-muted)', fontSize: '.875rem', lineHeight: 1.6 }}>{message}</p>
                </div>
                <div className="modal-footer" style={{ justifyContent: 'center' }}>
                    <button className="btn btn-outline" onClick={onCancel} disabled={loading}>
                        Cancel
                    </button>
                    <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
                        {loading ? <span className="spinner-sm" /> : null}
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
