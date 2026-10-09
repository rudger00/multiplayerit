import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import FeedLayout from '../components/FeedLayout';

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [notiziePiuLette, setNotiziePiuLette] = useState([]);
  const [prossimaLive, setProssimaLive] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticoli() {
      setLoading(true);
      try {
        const { data: articoliData, error: artError } = await supabase
          .from('articoli')
          .select('*')
          .eq('stato', 'PUBLISHED')
          .order('creato_il', { ascending: false });
          
        if (artError) {
          console.error("Errore fetch articoli Home:", artError);
          setLoading(false);
          return;
        }

        const { data: catData, error: catError } = await supabase
          .from('categorie')
          .select('id, nome');

        if (catError) {
          console.error("Errore fetch categorie Home:", catError);
        }

        if (articoliData) {
          const articoliCompleti = articoliData.map(articolo => {
            const categoriaCorrispondente = catData?.find(c => c.id === articolo.id_categoria);
            return {
              ...articolo,
              categorie: { 
                nome: categoriaCorrispondente ? categoriaCorrispondente.nome : 'NEWS' 
              }
            };
          });

          setArticles(articoliCompleti);

          // Calcoliamo le 5 notizie più "calde" (con più commenti)
          const newsOnly = articoliCompleti.filter(a => a.id_categoria === 1 || a.categorie.nome.toUpperCase() === 'NEWS');
          const sortedByPop = [...newsOnly].sort((a, b) => (b.commenti || 0) - (a.commenti || 0)).slice(0, 5);
          setNotiziePiuLette(sortedByPop);
        }

        // MODIFICA: Peschiamo dalla tua tabella "palinsesto"
        const { data: liveData, error: liveError } = await supabase
          .from('palinsesto')
          .select('*')
          .order('ordine', { ascending: true }) // Ordina per la tua colonna "ordine"
          .limit(1)
          .maybeSingle();

        if (!liveError && liveData) {
          setProssimaLive(liveData);
        }
        
      } catch (err) {
        console.error("Errore imprevisto Home:", err);
      }
      
      setLoading(false);
    }
    
    fetchArticoli();
  }, []);

  if (loading) return <div className="text-center py-20 font-bold text-gray-400">Caricamento Home...</div>;
  
  return <FeedLayout articles={articles} notiziePiuLette={notiziePiuLette} prossimaLive={prossimaLive} />;
}