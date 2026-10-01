import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import FeedLayout from '../components/FeedLayout';

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticoli() {
      setLoading(true);
      try {
        // STEP 1: Scarichiamo SOLO gli articoli (senza chiedere a Supabase di unire le categorie)
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

        // STEP 2: Scarichiamo la lista delle categorie
        const { data: catData, error: catError } = await supabase
          .from('categorie')
          .select('id, nome');

        if (catError) {
          console.error("Errore fetch categorie Home:", catError);
        }

        // STEP 3: Uniamo i dati noi con JavaScript (infallibile!)
        if (articoliData) {
          const articoliCompleti = articoliData.map(articolo => {
            // Cerchiamo la categoria corrispondente
            const categoriaCorrispondente = catData?.find(c => c.id === articolo.id_categoria);
            
            return {
              ...articolo,
              // Ricreiamo la struttura che si aspetta FeedLayout ( articolo.categorie.nome )
              categorie: { 
                nome: categoriaCorrispondente ? categoriaCorrispondente.nome : 'NEWS' 
              }
            };
          });

          setArticles(articoliCompleti);
        }
        
      } catch (err) {
        console.error("Errore imprevisto Home:", err);
      }
      
      setLoading(false);
    }
    
    fetchArticoli();
  }, []);

  if (loading) return <div className="text-center py-20 font-bold text-gray-400">Caricamento Home...</div>;
  
  return <FeedLayout articles={articles} />;
}