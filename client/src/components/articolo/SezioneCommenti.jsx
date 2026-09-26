import React from 'react';
import { Link } from 'react-router-dom';

const ThumbUp = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>;
const ThumbDown = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path></svg>;

export default function SezioneCommenti({
  commentsList,
  newCommentText,
  setNewCommentText,
  replyingTo,
  setReplyingTo,
  isSubmitting,
  handlePostComment,
  handleVote,
  handleReplyClick,
  formatCommentDate,
  commentInputRef,
  user,
  openModal
}) {
  const parentComments = commentsList.filter(c => !c.id_commento_padre);
  const getReplies = (parentId) => commentsList.filter(c => c.id_commento_padre === parentId);

  const renderComment = (comment, isReply = false) => {
    const username = comment.utenti?.username || 'Utente';
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;
    return (
      <div id={`commento-${comment.id}`} key={comment.id} className={`flex flex-col py-6 border-b border-gray-800/60 transition-colors rounded-md px-2 ${isReply ? 'ml-12 border-l-2 border-[#1f1f1f] pl-6 border-b-0 py-4 mt-2 bg-[#141414]' : ''}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <Link to={`/utente/${username}`} className="relative group">
              <img src={avatar} alt={username} className="w-12 h-12 rounded-full bg-gray-800 p-1 border-[2px] border-[#00bfff] group-hover:border-[#ff2020] transition-colors" />
              <div className="absolute -top-1 -right-1 bg-[#00bfff] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md border-[2px] border-[#111111]">1</div>
            </Link>
            <Link to={`/utente/${username}`} className="text-white font-bold text-[15px] hover:text-[#ff2020] transition-colors">{username}</Link>
          </div>
          <div className="flex items-center gap-4 text-gray-500 text-[12px] font-semibold">
            <span>{formatCommentDate(comment.data)}</span>
            <div className="flex items-center gap-3">
              <button onClick={() => handleVote(comment.id, 1)} className="flex items-center gap-1 hover:text-green-500 transition-colors"><ThumbUp /> {comment.upvotes > 0 && <span className="text-green-500 bg-[#162a16] px-1.5 rounded-full text-[10px] font-black">{comment.upvotes}</span>}</button>
              <button onClick={() => handleVote(comment.id, -1)} className="flex items-center gap-1 hover:text-red-500 transition-colors"><ThumbDown />{comment.downvotes > 0 && <span className="text-red-500 bg-[#2a1616] px-1.5 rounded-full text-[10px] font-black">{comment.downvotes}</span>}</button>
            </div>
          </div>
        </div>
        <p className="text-gray-300 text-[14px] leading-relaxed mb-4 whitespace-pre-wrap ml-[64px]">{comment.testo.split('\n').map((line, idx) => <React.Fragment key={idx}>{line.split(' ').map((word, i) => word.startsWith('@') ? <span key={i} className="text-[#00bfff] font-bold">{word} </span> : `${word} `)}<br /></React.Fragment>)}</p>
        <div className="flex items-center justify-between text-[11px] font-bold ml-[64px]">
          <div className="flex items-center gap-4 text-[#ff2020]"><span onClick={() => handleReplyClick(isReply ? comment.id_commento_padre : comment.id, username)} className="cursor-pointer hover:underline transition-colors font-medium text-[12px]">Rispondi</span><span className="cursor-pointer hover:underline transition-colors font-medium text-[12px]">Permalink</span></div>
          <span className="text-gray-500 cursor-pointer hover:text-gray-300 transition-colors font-medium text-[12px]">Segnala</span>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-16 w-full mb-10 font-sans" id="sezione-commenti">
      <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-6">
        <h3 className="text-white font-black text-lg uppercase tracking-tight"><span className="text-[#ff2020]">{commentsList.length}</span> Commenti</h3>
        <span className="text-[#ff2020] text-xs font-black uppercase tracking-widest cursor-pointer hover:text-white transition-colors">Regolamento</span>
      </div>

      <div className="bg-[#2a2a2a] p-1 rounded-sm mb-8 flex items-center border border-transparent focus-within:border-[#ff2020] transition-colors relative shadow-lg">
        <textarea 
          ref={commentInputRef}
          placeholder="Lascia un commento... (Premi Invio per inviare)" 
          className="w-full bg-transparent text-gray-200 p-3 outline-none text-[15px] font-medium placeholder-gray-500 resize-none h-14"
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          onClick={() => { if (!user) openModal(); }}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handlePostComment())}
          disabled={isSubmitting}
        />
        {replyingTo && (<div onClick={() => { setReplyingTo(null); setNewCommentText(''); }} className="absolute -top-7 left-0 text-[11px] font-bold text-[#ff2020] hover:text-white cursor-pointer bg-[#1a1a1a] px-2 py-1 rounded-sm border border-[#ff2020]/30 transition-colors">✕ Annulla risposta</div>)}
        {newCommentText.trim() && user && (<button onClick={handlePostComment} disabled={isSubmitting} className="text-[#ff2020] font-black uppercase text-xs px-6 hover:text-white transition-colors h-full disabled:opacity-50">INVIA</button>)}
      </div>

      <div className="flex flex-col">
        {parentComments.length > 0 ? parentComments.map(parentComment => (
          <React.Fragment key={parentComment.id}>{renderComment(parentComment, false)}{getReplies(parentComment.id).map(reply => renderComment(reply, true))}</React.Fragment>
        )) : <p className="text-gray-500 text-center font-bold">Nessun commento. Sii il primo a rompere il ghiaccio!</p>}
      </div>
    </div>
  );
}