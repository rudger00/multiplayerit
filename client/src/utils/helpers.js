export const PLATFORMS = {
  'pc': { 
    id: 1, 
    name: 'PC', 
    color: 'bg-gray-500',
    desc: 'Il Master Race non delude mai. Hardware, schede video, mod, offerte Steam e recensioni dei giochi che spingono al limite i PC.'
  },
  'ps5': { 
    id: 2, 
    name: 'PlayStation 5', 
    color: 'bg-blue-600',
    desc: 'Tutte le notizie, le recensioni, le anteprime e le esclusive dedicate a PlayStation 5, la console ammiraglia di Sony che ha definito una nuova era del gaming.'
  },
  'ps4': { 
    id: 3, 
    name: 'PlayStation 4', 
    color: 'bg-blue-500',
    desc: "Il glorioso ecosistema PlayStation 4. Trova qui tutti gli aggiornamenti e le recensioni sui titoli che hanno fatto la storia dell'ottava generazione."
  },
  'xbox-series-x': { 
    id: 4, 
    name: 'Xbox Series X/S', 
    color: 'bg-green-600',
    desc: "Entra nel mondo Xbox Series X e Series S. Le console di Microsoft che garantiscono potenza assoluta e l'incredibile offerta del Game Pass."
  },
  'xbox-one': { 
    id: 5, 
    name: 'Xbox One', 
    color: 'bg-green-500',
    desc: "L'archivio delle recensioni e delle notizie legate all'ecosistema Xbox One, il pilastro fondamentale della strategia Microsoft."
  },
  'switch': { 
    id: 6, 
    name: 'Nintendo Switch', 
    color: 'bg-red-600',
    desc: 'L\'ibrida dei miracoli di casa Nintendo. Scopri le recensioni e le news su Mario, Zelda e tutti i capolavori per Switch, da giocare ovunque tu voglia.'
  },
  'ios': { 
    id: 7, 
    name: 'iOS', 
    color: 'bg-gray-400',
    desc: 'Il mondo del mobile gaming sui dispositivi Apple. Le migliori uscite e le recensioni per il tuo iPhone e iPad.'
  },
  'android': { 
    id: 8, 
    name: 'ANDROID', 
    color: 'bg-green-400',
    desc: 'News e recensioni dei migliori titoli sbarcati su smartphone e tablet del robottino verde, tra gacha, puzzle e grandi porting.'
  } 
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