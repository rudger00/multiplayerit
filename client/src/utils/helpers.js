export const PLATFORMS = {
  'pc': { id: 1, name: 'PC', color: 'bg-gray-500' },
  'ps5': { id: 2, name: 'PlayStation 5', color: 'bg-blue-600' },
  'ps4': { id: 3, name: 'PlayStation 4', color: 'bg-blue-500' },
  'xbox-series-x': { id: 4, name: 'Xbox Series X/S', color: 'bg-green-600' },
  'xbox-one': { id: 5, name: 'Xbox One', color: 'bg-green-500' },
  'switch': { id: 6, name: 'Nintendo Switch', color: 'bg-red-600' },
  'ios': { id: 7, name: 'iOS', color: 'bg-gray-400' },
  'android': { id: 8, name: 'ANDROID', color: 'bg-green-400' } 
};

export const FALLBACK_IMG = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800";

export const getImg = (url) => (url && url.trim() !== '') ? url : FALLBACK_IMG;

export const formatTime = (dateString) => {
  if (!dateString) return "ORA";
  return new Date(dateString).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
};

export const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
};

export const getTag = (titolo) => {
  if (!titolo) return "MULTIPLAYER";
  return titolo.includes(':') ? titolo.split(':')[0].toUpperCase() : "MULTIPLAYER";
};