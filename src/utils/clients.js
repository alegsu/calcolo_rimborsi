export const DEFAULT_CLIENTS = [
  { id: '1', nome: 'Emmesport', citta: 'Cadoneghe', provincia: 'PD' },
  { id: '2', nome: 'Bioisotherm', citta: 'Padova', provincia: 'PD' },
  { id: '3', nome: 'Nautica Biondi', citta: 'Treviso', provincia: 'TV' },
  { id: '4', nome: 'Meggetto', citta: 'Quinto di Treviso', provincia: 'TV' },
  { id: '5', nome: 'I-Tol', citta: 'Noventa', provincia: 'PD' },
  { id: '6', nome: 'Ecosistem', citta: 'Cavallino Treporti', provincia: 'VE' },
  { id: '7', nome: 'Ottica Daniele', citta: 'Padova', provincia: 'PD' },
  { id: '8', nome: 'HIT', citta: 'Padova', provincia: 'PD' },
  { id: '9', nome: 'Cooperativa Padovana', citta: 'Padova', provincia: 'PD' },
  { id: '10', nome: 'Isotta', citta: 'Zola Predosa', provincia: 'BO' }
];

export function getClients() {
  const stored = localStorage.getItem('shinyup_clients');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse clients from local storage", e);
    }
  }
  return DEFAULT_CLIENTS;
}

export function saveClient(client) {
  const clients = getClients();
  const newClient = { ...client, id: Date.now().toString() };
  const updated = [...clients, newClient];
  localStorage.setItem('shinyup_clients', JSON.stringify(updated));
  return updated;
}

export function removeClient(id) {
  const clients = getClients();
  const updated = clients.filter(c => c.id !== id);
  localStorage.setItem('shinyup_clients', JSON.stringify(updated));
  return updated;
}
