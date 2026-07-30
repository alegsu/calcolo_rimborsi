import React, { useState, useEffect, useRef } from 'react';
import { Download, Settings } from 'lucide-react';
import { generateMonthDays, months } from './utils/date';
import { getClients } from './utils/clients';
import TripModal from './components/TripModal';
import BackendPanel from './components/BackendPanel';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import firmaAle from './assets/signatures/Firma_Ale.png';
import firmaCarlo from './assets/signatures/Firma_Carlo.png';

const FORFETTARIO = 46.48;
const TARIFFA_KM = 0.3574;

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [admin, setAdmin] = useState('CARLO ZABEO');
  
  const [trips, setTrips] = useState({}); // { [dayNumber]: { nome, citta, provincia, km, type } }
  const [customSignature, setCustomSignature] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBackendOpen, setIsBackendOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  
  const pdfRef = useRef(null);
  const [days, setDays] = useState([]);

  useEffect(() => {
    setDays(generateMonthDays(selectedYear, selectedMonth));
    setTrips({});
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    const savedSig = localStorage.getItem('shinyup_signature');
    if (savedSig) setCustomSignature(savedSig);
  }, []);

  const defaultSignature = admin === 'ALESSANDRO GARBUIO' ? firmaAle : firmaCarlo;
  const effectiveSignature = customSignature || defaultSignature;

  const handleSignatureUpload = (dataUrl) => {
    setCustomSignature(dataUrl);
    localStorage.setItem('shinyup_signature', dataUrl);
  };

  const handleDayClick = (day) => {
    if (day.isWeekend || day.isHoliday) return;
    setSelectedDay(day);
    setIsModalOpen(true);
  };

  const handleSaveTrip = (tripData) => {
    if (tripData) {
      setTrips({ ...trips, [selectedDay.dayNumber]: tripData });
    } else {
      const newTrips = { ...trips };
      delete newTrips[selectedDay.dayNumber];
      setTrips(newTrips);
    }
    setIsModalOpen(false);
  };

  const handleRandomFill = (count) => {
    const clients = getClients();
    const availableDays = days.filter(d => !d.isWeekend && !d.isHoliday);
    
    // Shuffle available days
    const shuffledDays = [...availableDays].sort(() => 0.5 - Math.random());
    const daysToFill = shuffledDays.slice(0, Math.min(count, shuffledDays.length));
    
    const newTrips = { ...trips };
    daysToFill.forEach(day => {
      const randomClient = clients[Math.floor(Math.random() * clients.length)];
      newTrips[day.dayNumber] = {
        nome: randomClient.nome,
        citta: randomClient.citta,
        provincia: randomClient.provincia,
        km: 0,
        type: 'trip'
      };
    });
    setTrips(newTrips);
  };

  const handleReset = () => {
    if (window.confirm("Sei sicuro di voler cancellare tutte le trasferte di questo mese?")) {
      setTrips({});
    }
  };

  const generatePDF = async () => {
    if (!pdfRef.current) return;
    try {
      const dataUrl = await toJpeg(pdfRef.current, { quality: 1, backgroundColor: '#ffffff', pixelRatio: 2 });
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgProps = pdf.getImageProperties(dataUrl);
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      let finalWidth = pageWidth;
      let finalHeight = (imgProps.height * pageWidth) / imgProps.width;
      
      // Se l'altezza supera quella della pagina A4, scaliamo in base all'altezza per farci stare tutto
      if (finalHeight > pageHeight) {
        finalHeight = pageHeight;
        finalWidth = (imgProps.width * pageHeight) / imgProps.height;
      }
      
      // Centriamo orizzontalmente in caso sia stato scalato
      const xOffset = (pageWidth - finalWidth) / 2;
      
      pdf.addImage(dataUrl, 'JPEG', xOffset, 0, finalWidth, finalHeight);
      
      const fileName = `Rimborso_${months[selectedMonth]}_${selectedYear}_${admin.replace(/ /g, '_')}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error("Failed to generate PDF", err);
      alert("Errore durante la generazione del PDF.");
    }
  };

  // Calcolo Totali
  let totaleForfettario = 0;
  let totaleKm = 0;
  let totaleRimborsoKm = 0;

  Object.values(trips).forEach(t => {
    if (t.type === 'trip') {
      totaleForfettario += FORFETTARIO;
      if (t.km) {
        totaleKm += parseFloat(t.km);
        totaleRimborsoKm += parseFloat(t.km) * TARIFFA_KM;
      }
    }
  });

  return (
    <div className="container">
      
      {/* Header Interattivo - Non va nel PDF */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="title">Calcolo Rimborsi</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>ShinyUp S.R.L.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Mese</label>
            <select className="select-field" value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))}>
              {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Anno</label>
            <input type="number" className="input-field" value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} style={{ width: '80px' }} />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Amministratore</label>
            <select className="select-field" value={admin} onChange={e => setAdmin(e.target.value)}>
              <option value="CARLO ZABEO">CARLO ZABEO</option>
              <option value="ALESSANDRO GARBUIO">ALESSANDRO GARBUIO</option>
            </select>
          </div>
          
          <button className="btn btn-secondary" onClick={() => setIsBackendOpen(true)}>
            <Settings size={18} /> Backend
          </button>
          <button className="btn btn-primary" onClick={generatePDF}>
            <Download size={18} /> Scarica PDF
          </button>
        </div>
      </div>

      {/* Contenitore PDF - Questo viene esportato */}
      <div style={{ overflowX: 'auto', padding: '1rem', background: '#e5e7eb', borderRadius: 'var(--radius-lg)' }}>
        <div className="pdf-document" ref={pdfRef}>
          
          {/* Intestazione PDF */}
          <div className="pdf-header-container">
            <div className="pdf-header-left">
              <div className="pdf-title">RIMBORSO FORFETTARIO TRASFERTE</div>
              <div className="pdf-subtitle">
                Mese: <strong>{months[selectedMonth]} {selectedYear}</strong> &nbsp;&nbsp;&nbsp;&nbsp;
                Amministratore: <strong>{admin}</strong>
              </div>
            </div>
            <div className="pdf-header-right">
              <strong>ShinyUp S.R.L.</strong><br/>
              Via Venezia, 52<br/>
              35010 - VIGONZA (PD)<br/>
              C.F. e P.I. 04492640273
            </div>
          </div>

          {/* Tabella PDF (stessa UI dell'app, ma controllata dal CSS pdf-table) */}
          <table className="pdf-table">
            <thead>
              <tr>
                <th className="col-gg">GG</th>
                <th className="col-desc">descrizione trasferta</th>
                <th className="col-forfettario">Importo Rimborso<br/>Forfettario - Max<br/>46,48/giorno</th>
                <th className="col-km">Km</th>
                <th className="col-rimborso-km">Rimborso spese<br/>chilometrico</th>
              </tr>
            </thead>
            <tbody>
              {days.map((day) => {
                const trip = trips[day.dayNumber];
                let rowClass = 'app-row ';
                if (day.isWeekend) rowClass += 'weekend';
                else if (day.isHoliday) rowClass += 'holiday';
                else if (trip) {
                  if (trip.type === 'ferie' || trip.type === 'assenza') rowClass += 'absence';
                  else rowClass += 'filled interactive';
                }
                else rowClass += 'interactive';

                // Formattazione descrizione
                let desc = '';
                if (trip) {
                  if (trip.type === 'trip') {
                    desc = `Incontro Cliente ${trip.nome} - ${trip.citta} (${trip.provincia})`;
                  } else {
                    desc = trip.nome; // "FERIE" o "ASSENZA"
                  }
                }

                return (
                  <tr 
                    key={day.dayNumber} 
                    className={rowClass}
                    onClick={() => {
                      if (!day.isWeekend && !day.isHoliday) handleDayClick(day);
                    }}
                    style={(!day.isWeekend && !day.isHoliday) ? { cursor: 'pointer' } : {}}
                  >
                    <td className="col-gg" style={{ textAlign: 'center' }}>{day.dayNumber}</td>
                    <td className="col-desc">{desc}</td>
                    <td className="col-forfettario">
                      {trip && trip.type === 'trip' ? FORFETTARIO.toFixed(2).replace('.', ',') : ''}
                    </td>
                    <td className="col-km">
                      {trip && trip.type === 'trip' && trip.km ? trip.km : ''}
                    </td>
                    <td className="col-rimborso-km">
                      {trip && trip.type === 'trip' && trip.km ? (parseFloat(trip.km) * TARIFFA_KM).toFixed(2).replace('.', ',') : ''}
                    </td>
                  </tr>
                );
              })}
              
              {/* Riga Totali */}
              <tr className="pdf-totals-row">
                <td colSpan={2} style={{ textAlign: 'right' }}>Totale Rimborso</td>
                <td className="col-forfettario" style={{ textAlign: 'center' }}>
                  {totaleForfettario > 0 ? totaleForfettario.toFixed(2).replace('.', ',') : ''}
                </td>
                <td className="col-km" style={{ textAlign: 'center' }}>
                  {totaleKm > 0 ? totaleKm : ''}
                </td>
                <td className="col-rimborso-km" style={{ textAlign: 'center' }}>
                  {totaleRimborsoKm > 0 ? totaleRimborsoKm.toFixed(2).replace('.', ',') : ''}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Firma in fondo */}
          <div className="pdf-signature-section">
            <div className="pdf-signature-box">
              {effectiveSignature && <img src={effectiveSignature} alt="Firma" className="pdf-signature-img" />}
              <div className="pdf-signature-line"></div>
              <div>Firma</div>
            </div>
          </div>

        </div>
      </div>

      <TripModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTrip}
        day={selectedDay}
        initialData={selectedDay ? trips[selectedDay.dayNumber] : null}
      />
      
      <BackendPanel 
        isOpen={isBackendOpen}
        onClose={() => setIsBackendOpen(false)}
        onRandomFill={handleRandomFill}
        onReset={handleReset}
        signature={effectiveSignature}
        onSignatureUpload={handleSignatureUpload}
      />

    </div>
  );
}
