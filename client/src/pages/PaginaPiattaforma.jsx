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
      const { data, error } = await supabase
        .from('articoli')
        .select(`*, categorie ( nome ), articoli_piattaforme!inner(id_piattaforma)`)
        .eq('articoli_piattaforme.id_piattaforma', platformInfo.id)
        .order('creato_il', { ascending: false });
        
      if (!error && data) setArticles(data);
      setLoading(false);
    }
    fetchPlatformArticles();
  }, [slug, platformInfo]);

  if (!platformInfo) return <div className="text-center py-20 font-bold text-red-500">Piattaforma non trovata.</div>;
  if (loading) return <div className="text-center py-20 font-bold text-gray-400">Caricamento piattaforma {platformInfo.name}...</div>;

  return <FeedLayout articles={articles} showIntro={platformInfo} />;
}