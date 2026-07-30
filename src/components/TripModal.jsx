import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { getClients } from '../utils/clients';

export default function TripModal({ isOpen, onClose, onSave, initialData, day }) {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  
  const [formData, setFormData] = useState({
    nome: '',
    citta: '',
    provincia: '',
    km: '',
    type: 'trip' // 'trip', 'ferie', 'assenza'
  });

  useEffect(() => {
    if (isOpen) {
      setClients(getClients());
      if (initialData) {
        setFormData({
          nome: initialData.nome || '',
          citta: initialData.citta || '',
          provincia: initialData.provincia || '',
          km: initialData.km || '',
          type: initialData.type || 'trip'
        });
      } else {
        setFormData({ nome: '', citta: '', provincia: '', km: '', type: 'trip' });
      }
      setSearch('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const filteredClients = clients.filter(c => 
    c.nome.toLowerCase().includes(search.toLowerCase()) || 
    c.citta.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectClient = (client) => {
    setFormData({
      ...formData,
      nome: client.nome,
      citta: client.citta,
      provincia: client.provincia,
      type: 'trip'
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      km: formData.km ? parseFloat(formData.km) : 0
    });
  };

  const handleSetSpecial = (type) => {
    onSave({
      nome: type === 'ferie' ? 'FERIE' : 'ASSENZA',
      citta: '',
      provincia: '',
      km: 0,
      type: type
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="title" style={{ fontSize: '1.25rem', marginBottom: 0 }}>
            Giorno {day?.dayNumber}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} color="var(--text-muted)" />
          </button>
        </div>
        
        <div className="modal-body">
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ flex: 1, borderColor: formData.type === 'ferie' ? 'var(--primary)' : undefined, background: formData.type === 'ferie' ? '#EEF2FF' : undefined }}
              onClick={() => handleSetSpecial('ferie')}
            >
              Segna Ferie
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              style={{ flex: 1, borderColor: formData.type === 'assenza' ? 'var(--primary)' : undefined, background: formData.type === 'assenza' ? '#EEF2FF' : undefined }}
              onClick={() => handleSetSpecial('assenza')}
            >
              Segna Assenza
            </button>
          </div>

          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <div style={{ position: 'absolute', left: '0.75rem', top: '0.65rem' }}>
              <Search size={18} color="var(--text-muted)" />
            </div>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Cerca cliente dal database..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            {search && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', zIndex: 10, maxHeight: '150px', overflowY: 'auto', boxShadow: 'var(--shadow-md)' }}>
                {filteredClients.length > 0 ? filteredClients.map(c => (
                  <div 
                    key={c.id} 
                    style={{ padding: '0.5rem 1rem', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
                    onClick={() => handleSelectClient(c)}
                  >
                    <strong>{c.nome}</strong> - {c.citta} ({c.provincia})
                  </div>
                )) : (
                  <div style={{ padding: '0.5rem 1rem', color: 'var(--text-muted)' }}>Nessun cliente trovato</div>
                )}
              </div>
            )}
          </div>

          <form id="trip-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Nome Cliente / Descrizione</label>
              <input 
                type="text" 
                className="input-field" 
                required 
                value={formData.nome}
                onChange={e => setFormData({...formData, nome: e.target.value, type: 'trip'})}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="input-group" style={{ flex: 2 }}>
                <label className="input-label">Città</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.citta}
                  onChange={e => setFormData({...formData, citta: e.target.value, type: 'trip'})}
                />
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Provincia</label>
                <input 
                  type="text" 
                  className="input-field" 
                  maxLength={2}
                  value={formData.provincia}
                  onChange={e => setFormData({...formData, provincia: e.target.value.toUpperCase(), type: 'trip'})}
                />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Chilometri (Opzionale)</label>
              <input 
                type="number" 
                className="input-field" 
                min="0"
                step="0.1"
                value={formData.km}
                onChange={e => setFormData({...formData, km: e.target.value})}
              />
            </div>
          </form>
        </div>
        
        <div className="modal-footer">
          {initialData ? (
            <button type="button" className="btn btn-danger" onClick={() => onSave(null)}>
              Rimuovi
            </button>
          ) : <div></div>}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Annulla</button>
            <button type="submit" form="trip-form" className="btn btn-primary">Salva Trasferta</button>
          </div>
        </div>
      </div>
    </div>
  );
}
