import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import FeedLayout from '../components/FeedLayout';
import { PLATFORMS } from '../utils/helpers';

export default function PaginaPiattaforma() {
  const { slug } = useParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const platformInfo = PLATFORMS[slug];

  useEffect(() => {
    async function fetchPlatformArticles() {
      if (!platformInfo) return;
      setLoading(true);

      try {
        console.log(`Sto cercando gli articoli per la piattaforma: ${platformInfo.name} (ID: ${platformInfo.id})`);

        // STEP 1: Cerchiamo gli ID degli articoli nella tabella ponte
        const { data: relazioni, error: errRelazioni } = await supabase
          .from('articoli_piattaforme')
          .select('id_articolo')
          .eq('id_piattaforma', platformInfo.id);

        if (errRelazioni) {
          console.error("Errore Step 1 (Relazioni):", errRelazioni);
          setLoading(false);
          return;
        }

        console.log("Relazioni trovate:", relazioni);

        if (!relazioni || relazioni.length === 0) {
          setArticles([]);
          setLoading(false);
          return;
        }

        const articleIds = relazioni.map(rel => rel.id_articolo);

        // STEP 2: Scarichiamo direttamente gli articoli SENZA join ambigui
        const { data: articoliData, error: errArticoli } = await supabase
          .from('articoli')
          .select('*')
          .in('id', articleIds)
          .order('creato_il', { ascending: false });

        if (errArticoli) {
          console.error("Errore Step 2 (Articoli):", errArticoli);
        } else if (articoliData) {
          setArticles(articoliData);
        }

      } catch (err) {
        console.error("Errore imprevisto:", err);
      }

      setLoading(false);
    }
    
    fetchPlatformArticles();
  }, [slug, platformInfo]);

  if (!platformInfo) return <div className="text-center py-20 font-bold text-red-500">Piattaforma non trovata.</div>;
  if (loading) return <div className="text-center py-20 font-bold text-gray-400">Caricamento piattaforma {platformInfo.name}...</div>;

  return <FeedLayout articles={articles} showIntro={platformInfo} />;
}