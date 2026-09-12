export const PLATFORMS = {
  'pc': { id: 1, name: 'PC', desc: 'Tutto su PC: giochi, notizie, articoli, nuove uscite, recensioni, video e approfondimenti sul mondo del gaming su computer.' },
  'ps5': { id: 2, name: 'PLAYSTATION 5', desc: 'Tutto su PlayStation 5, la console di nona generazione di casa Sony: giochi, notizie, articoli, nuove uscite, recensioni, video e offerte.' },
  'ps4': { id: 3, name: 'PLAYSTATION 4', desc: 'Tutto su PlayStation 4: giochi, notizie, articoli, nuove uscite e recensioni per la console Sony.' },
  'xbox-series-x-s': { id: 4, name: 'XBOX SERIES X/S', desc: 'Tutto su Xbox Series X e Series S, le console next-gen di Microsoft: giochi, notizie, Xbox Game Pass e recensioni.' },
  'xbox-one': { id: 5, name: 'XBOX ONE', desc: 'Tutto su Xbox One, la console di ottava generazione di Microsoft: giochi, notizie, articoli, nuove uscite, recensioni, video, offerte.' },
  'nintendo-switch': { id: 6, name: 'NINTENDO SWITCH', desc: 'Tutto su Nintendo Switch, la console ibrida di Nintendo: giochi, notizie, esclusive di Mario e Zelda, recensioni e video.' },
  'ios': { id: 7, name: 'IOS', desc: 'Tutto sul gaming per ecosistema Apple iOS: iPhone, iPad e Apple Arcade.' },
  'android': { id: 8, name: 'ANDROID', desc: 'Tutto sul gaming per ecosistema Android: smartphone, tablet e nuove uscite mobile.' }
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