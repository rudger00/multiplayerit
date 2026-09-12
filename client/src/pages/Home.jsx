import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import FeedLayout from '../components/FeedLayout';

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticoli() {
      setLoading(true);
      const { data, error } = await supabase.from('articoli').select(`*, categorie ( nome )`).order('creato_il', { ascending: false });
      if (!error && data) setArticles(data);
      setLoading(false);
    }
    fetchArticoli();
  }, []);

  if (loading) return <div className="text-center py-20 font-bold text-gray-400">Caricamento Home...</div>;
  return <FeedLayout articles={articles} />;
}