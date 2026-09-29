import React from 'react';
import ArticleCard from './ArticleCard';
import { getImg, formatTime, getTag } from '../utils/helpers';

// IMPORT DEI 3 WIDGET DELLA SIDEBAR
import WidgetSondaggio from './home/WidgetSondaggio';
import WidgetUltimeRecensioni from './home/WidgetUltimeRecensioni';
import WidgetGiochiAttesi from './home/WidgetGiochiAttesi';

export default function FeedLayout({ articles, showIntro = null }) {
  const topArticles = articles.slice(0, 3);
  const bottomArticles = articles.slice(3, 7);
  const ultimeNotizie = articles.slice(7, 12);
  const centroFeed = articles.slice(12, 17);

  return (
    <>
      <header className="max-w-[1450px] mx-auto p-1 mt-2">
        {articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-1 mb-1">
              {topArticles.map((article) => <ArticleCard key={article.id} article={article} heightClass="h-[320px]" titleClass="text-base md:text-lg" />)}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
              {bottomArticles.map((article) => <ArticleCard key={article.id} article={article} heightClass="h-[220px]" titleClass="text-xs md:text-sm" />)}
            </div>
          </>
        ) : (
          <div className="text-center py-20 font-bold text-gray-400">Nessun articolo trovato.</div>
        )}
      </header>

      {showIntro && articles.length > 0 && (
        <div className="max-w-[1000px] mx-auto text-center py-10 px-4">
          <h1 className="text-2xl font-black text-[#ff2020] uppercase tracking-wider mb-3">{showIntro.name}</h1>
          <p className="text-gray-300 text-[13px] leading-relaxed font-semibold">{showIntro.desc}</p>
        </div>
      )}

      {articles.length > 0 && (
        <main className="max-w-[1450px] mx-auto p-1 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 flex flex-col">
              <div className="bg-[#2A153A] border border-[#3b1d52] p-4 mb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">PROSSIME LIVE</span>
                <div className="flex flex-col"><span className="text-yellow-500 text-[11px] font-bold mb-0.5">16:00</span><span className="font-bold text-[13px] text-white">16-BIT + Nintendo Direct con Serino</span></div>
              </div>
              <div className="flex flex-col mt-4">
                {ultimeNotizie.map((news) => (
                  <div key={news.id} className="flex gap-4 py-4 border-b border-gray-800/60 hover:bg-[#1a1a1a] cursor-pointer group transition-colors">
                    <div className="relative w-[130px] h-[75px] shrink-0 overflow-hidden"><img src={getImg(news.url_immagine)} alt={news.titolo} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /><div className="absolute top-1 right-1 bg-red-600 text-white text-[9px] font-bold px-1.5 flex items-center gap-1">💬 {news.commenti ?? 0}</div></div>
                    <div className="flex flex-col justify-start">
                      <p className="text-[9px] font-bold text-gray-500 uppercase mb-1.5 tracking-wider">{formatTime(news.creato_il)} <span className="mx-1">|</span> {news.categorie?.nome || 'NEWS'} <span className="mx-1">|</span> <span className="text-red-500">{getTag(news.titolo)}</span></p>
                      <h4 className="text-[14px] font-bold leading-snug group-hover:text-red-500 transition-colors text-gray-100">{news.titolo}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-3 flex flex-col gap-6">
               {centroFeed.map((item) => (
                  <div key={item.id} className="cursor-pointer group flex flex-col bg-[#141414]">
                    <div className="relative h-[170px] w-full overflow-hidden shrink-0"><img src={getImg(item.url_immagine)} alt={item.titolo} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /><div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-1.5 flex items-center gap-1 z-10">💬 {item.commenti ?? 0}</div></div>
                    <div className="pt-3 pb-2 flex flex-col"><p className="text-[10px] font-bold uppercase mb-1.5 text-gray-500 tracking-wider">{item.categorie?.nome || 'SPECIALE'} <span className="mx-1">|</span> <span className="text-red-500">{getTag(item.titolo)}</span></p><h2 className="text-[15px] font-bold leading-snug group-hover:text-red-500 transition-colors">{item.titolo}</h2></div>
                  </div>
               ))}
            </div>

            <div className="lg:col-span-3 flex flex-col gap-0">
              {/* COMPONENTI SIDEBAR NELL'ORDINE CORRETTO */}
              <WidgetSondaggio />
              <WidgetUltimeRecensioni />
              <WidgetGiochiAttesi />
            </div>
            
          </div>
        </main>
      )}
    </>
  );
}