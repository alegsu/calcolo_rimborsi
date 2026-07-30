import React, { useState } from 'react';
import { X, Shuffle, Trash2, Upload, Plus } from 'lucide-react';
import { getClients, saveClient, removeClient } from '../utils/clients';

export default function BackendPanel({ isOpen, onClose, onRandomFill, onReset, signature, onSignatureUpload }) {
  const [randomCount, setRandomCount] = useState(10);
  const [clients, setClients] = useState([]);
  const [newClient, setNewClient] = useState({ nome: '', citta: '', provincia: '' });

  React.useEffect(() => {
    if (isOpen) {
      setClients(getClients());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddClient = (e) => {
    e.preventDefault();
    if (newClient.nome && newClient.citta && newClient.provincia) {
      const updated = saveClient(newClient);
      setClients(updated);
      setNewClient({ nome: '', citta: '', provincia: '' });
    }
  };

  const handleRemoveClient = (id) => {
    const updated = removeClient(id);
    setClients(updated);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onSignatureUpload(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2 className="title" style={{ fontSize: '1.25rem', marginBottom: 0 }}>
            Pannello Backend & Automazioni
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} color="var(--text-muted)" />
          </button>
        </div>
        
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Autocompilazione */}
          <section>
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              Autocompilazione
            </h3>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
              <div className="input-group" style={{ marginBottom: 0, width: '150px' }}>
                <label className="input-label">N. Trasferte Random</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={randomCount}
                  onChange={e => setRandomCount(parseInt(e.target.value) || 0)}
                  min="1"
                  max="31"
                />
              </div>
              <button 
                className="btn btn-primary"
                onClick={() => { onRandomFill(randomCount); onClose(); }}
              >
                <Shuffle size={18} /> Genera Casuali
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => { onReset(); onClose(); }}
                style={{ marginLeft: 'auto' }}
              >
                <Trash2 size={18} /> Resetta Mese
              </button>
            </div>
          </section>

          {/* Firma */}
          <section>
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              Firma Amministratore
            </h3>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <input 
                  type="file" 
                  accept="image/png, image/jpeg"
                  id="signature-upload"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <label htmlFor="signature-upload" className="btn btn-secondary" style={{ width: '100%' }}>
                  <Upload size={18} /> Carica Nuova Firma (PNG)
                </label>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  L'immagine verrà salvata nel browser in modo permanente.
                </p>
              </div>
              {signature && (
                <div style={{ border: '1px dashed var(--border)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
                  <img src={signature} alt="Firma attuale" style={{ maxHeight: '60px', maxWidth: '150px', mixBlendMode: 'multiply' }} />
                </div>
              )}
            </div>
          </section>

          {/* Gestione Clienti */}
          <section>
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              Database Clienti
            </h3>
            <form onSubmit={handleAddClient} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Nome" 
                required
                value={newClient.nome}
                onChange={e => setNewClient({...newClient, nome: e.target.value})}
              />
              <input 
                type="text" 
                className="input-field" 
                placeholder="Città" 
                required
                value={newClient.citta}
                onChange={e => setNewClient({...newClient, citta: e.target.value})}
              />
              <input 
                type="text" 
                className="input-field" 
                placeholder="Pr." 
                maxLength={2}
                style={{ width: '60px' }}
                required
                value={newClient.provincia}
                onChange={e => setNewClient({...newClient, provincia: e.target.value.toUpperCase()})}
              />
              <button type="submit" className="btn btn-secondary" style={{ padding: '0.5rem' }}>
                <Plus size={18} />
              </button>
            </form>

            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              {clients.map(c => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 1rem', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.875rem' }}>
                    <strong>{c.nome}</strong> - {c.citta} ({c.provincia})
                  </div>
                  {/* Default clients typically don't have long timestamps as IDs, but our custom ones do */}
                  {c.id.length > 5 && (
                    <button 
                      onClick={() => handleRemoveClient(c.id)}
                      style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

        </div>
        
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Chiudi</button>
        </div>
      </div>
    </div>
  );
}
