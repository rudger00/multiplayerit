import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function PaginaRegolamento() {
  
  // Assicuriamoci che la pagina parta sempre dall'alto quando viene aperta
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="bg-[#111111] min-h-screen font-sans flex justify-center pb-20">
      <div className="w-full max-w-[900px] flex flex-col px-4 md:px-8 mt-12">
        
        {/* Intestazione */}
        <div className="border-b-4 border-[#ff4444] pb-6 mb-10">
          <h1 className="text-white font-black text-4xl md:text-5xl uppercase tracking-tight mb-4">
            Regolamento Commenti
          </h1>
          <p className="text-gray-300 text-[16px] md:text-[18px] leading-relaxed font-medium">
            La sezione commenti è uno spazio in cui puoi vivere le tue passioni, scambiare opinioni, confrontarti e conversare assieme ad altri appassionati come te. Per fare in modo che la tua permanenza e quella degli altri utenti sia il più possibile serena, devi seguire delle regole di comportamento.
          </p>
          <div className="mt-6 bg-[#1a1a1a] p-4 border-l-4 border-[#00bfff]">
            <p className="text-gray-300 text-[15px] leading-relaxed">
              <strong>Inoltre, per sbloccare la possibilità di commentare i nostri contenuti devi raggiungere il livello 2</strong> e per farlo dovrai leggere gli articoli e seguire i giochi e gli argomenti che ti interessano. Una volta sbloccati, anche la pubblicazione di commenti contribuirà alla progressione del livello.
            </p>
          </div>
        </div>

        {/* Corpo del Regolamento */}
        <div className="flex flex-col gap-12">
          
          {/* Sezione 1 */}
          <section>
            <h2 className="text-[#ff4444] font-black text-2xl uppercase tracking-widest mb-4 flex items-center gap-3">
              <span className="text-3xl">1.</span> Rispetto, Discussioni e Member War
            </h2>
            <div className="text-gray-300 text-[15.5px] leading-loose space-y-4">
              <p>Sono vietati commenti offensivi o irrispettosi verso gli altri utenti e lo staff, le bestemmie e i commenti denigratori in base all’etnia, al sesso, all'orientamento sessuale, all’identità di genere, per disabilità ecc.</p>
              <p>Se non sei d’accordo con quello che ha scritto un utente puoi replicare esprimendo il tuo punto di vista dando il via ad una discussione, oppure puoi nascondere l’utente in modo da non vedere più i suoi commenti.</p>
              <p>I commenti possono essere utilizzati per discutere gli argomenti trattati negli articoli anche attraverso un acceso scambio di opinioni, ma è vietato usarli per fare <strong>member war</strong>, ovvero: risolvere diverbi personali, rivolgere attacchi e ostilità verso altri utenti o denigrarli, taggare o riferirti (anche implicitamente) con intenzioni ostili ad altri utenti; inoltre è bene essere ospitali con i nuovi iscritti.</p>
              <p>Non è possibile utilizzare i commenti per dare vita a discussioni off-topic, come ad esempio polemiche inerenti i ban ricevuti.</p>
            </div>
          </section>

          {/* Sezione 2 */}
          <section>
            <h2 className="text-[#ff4444] font-black text-2xl uppercase tracking-widest mb-4 flex items-center gap-3">
              <span className="text-3xl">2.</span> Spam, Spoiler e Pirateria
            </h2>
            <div className="text-gray-300 text-[15.5px] leading-loose space-y-4">
              <p>Non puoi pubblicare link di siti italiani concorrenti, commenti e link con scopi promozionali (es. promozione di canali Twitch, Youtube, siti web personali, e-commerce ecc.) e contenuti pornografici.</p>
              <p>Gli spoiler (ovvero le anticipazioni di un gioco, di un film, di una serie TV o di un qualsiasi altro media) devono essere inseriti nel tag dedicato <code className="bg-[#222] text-[#ff4444] px-2 py-0.5 rounded-sm font-bold">[spoiler]testo[/spoiler]</code>.</p>
              <p>Puoi discutere della pirateria come fenomeno o argomento, purché la discussione avvenga in modo responsabile e legale. Non puoi pubblicare link a siti pirata o condividere tutorial su come effettuare attività di pirateria. Sono permesse le discussioni che vertono sugli emulatori, purché non si promuova l’utilizzo di tali emulatori con copie illegittime e non autorizzate del software. La retro emulazione verrà trattata con più tolleranza.</p>
            </div>
          </section>

          {/* Sezione 3 */}
          <section>
            <h2 className="text-[#ff4444] font-black text-2xl uppercase tracking-widest mb-4 flex items-center gap-3">
              <span className="text-3xl">3.</span> Utenti Tossici/Troll, Meme e Multiaccount
            </h2>
            <div className="text-gray-300 text-[15.5px] leading-loose space-y-4">
              <p>Se infrangerai sistematicamente il regolamento o se utilizzerai il tuo account allo scopo di disturbare la sezione commenti attraverso provocazioni intenzionali, atteggiamenti esasperanti e molesti, dimostrerai di essere un utente tossico/troll e di conseguenza il tuo account verrà <strong>bannato definitivamente</strong> (agli utenti di vecchia data verrà prima dato un ultimatum).</p>
              <p>I meme divertenti sotto forma di immagini o GIF sono ammessi, ma solo se non sono denigratori nei confronti delle varie community (ad esempio immagini che ritraggono giocatori in lacrime ecc.), se non disturbano lo svolgersi del dibattito (ad esempio pubblicati in una discussione seria o in un contesto fuori luogo) e se non infrangono una delle altre regole (rispetto, member war, spam, spoiler ecc.).</p>
              <p>Non puoi possedere più di un account contemporaneamente o crearne uno nuovo per aggirare un ban. Se l’amministrazione dovesse venire a conoscenza dell’utilizzo di account secondari, verranno bannati definitivamente tutti gli account secondari e anche quello principale. Se pensi che un utente abbia un doppio account puoi segnalarlo solo attraverso le opzioni di segnalazione ed è vietato discuterne nei commenti.</p>
            </div>
          </section>

          {/* Sezione 4 */}
          <section>
            <h2 className="text-[#ff4444] font-black text-2xl uppercase tracking-widest mb-4 flex items-center gap-3">
              <span className="text-3xl">4.</span> Ban, Segnalazioni e Moderazione
            </h2>
            <div className="text-gray-300 text-[15.5px] leading-loose space-y-4">
              <p>Se infrangerai una regola il tuo account riceverà un ban e i tuoi commenti verranno modificati o cancellati. I ban si distinguono in <strong>temporanei</strong> (durano qualche giorno o settimana) e <strong>definitivi</strong> (non hanno una scadenza). La durata dei ban temporanei è proporzionata alla gravità dell’infrazione commessa e aumenterà progressivamente ogni volta che accumulerai un nuovo ban.</p>
              <p>Durante il ban non potrai interagire con gli altri utenti attraverso commenti e messaggi.</p>
              <p>Se noti dei commenti inappropriati, è buona prassi segnalarli e non rispondere a tua volta con un commento contrario alle regole. I commenti e i profili possono essere segnalati solo attraverso gli appositi pulsanti. I moderatori interverranno quando avranno del tempo a disposizione (potrebbero passare anche un paio di giorni), solo se lo giudicheranno necessario, nel modo che riterranno più appropriato.</p>
              <p>Nel caso in cui tu abbia ricevuto un ban per errore (una svista, un fraintendimento o se è riportato un motivo che non è presente nel regolamento) puoi inviare una richiesta di riammissione alla redazione attraverso l’indirizzo e-mail <a href="mailto:community@multiplayer.it" className="text-[#00bfff] hover:underline font-bold">community@multiplayer.it</a>, spiegando nel dettaglio in cosa consiste l’errore. Se la richiesta verrà respinta non potrai presentarne una nuova, se invece verrà accolta il ban sarà revocato.</p>
              <p>A volte i commenti potrebbero essere rimossi solamente per tenere ordinata la discussione. Quando necessario potranno essere modificati i nickname e rimossi gli avatar inappropriati.</p>
            </div>
          </section>

          {/* Sezione 5 */}
          <section>
            <h2 className="text-[#ff4444] font-black text-2xl uppercase tracking-widest mb-4 flex items-center gap-3">
              <span className="text-3xl">5.</span> Feedback e Contenuti Editoriali
            </h2>
            <div className="text-gray-300 text-[15.5px] leading-loose space-y-4">
              <p>Se vuoi lasciare un qualunque feedback puoi contattare la redazione privatamente attraverso gli appositi indirizzi e-mail. Ti invitiamo, per cortesia, a non farlo nei commenti perchè è poco probabile che lo staff lo legga e in più la discussione finirebbe off-topic.</p>
              
              <ul className="bg-[#1a1a1a] p-5 border border-gray-800 rounded-sm my-4 space-y-2 font-bold">
                <li>Segnalare notizie: <a href="mailto:news@multiplayer.it" className="text-[#00bfff] hover:underline font-medium">news@multiplayer.it</a></li>
                <li>Proporre un contenuto: <a href="mailto:redazione@multiplayer.it" className="text-[#00bfff] hover:underline font-medium">redazione@multiplayer.it</a></li>
                <li>Lasciare un feedback o segnalare un bug: <a href="mailto:supporto@multiplayer.it" className="text-[#00bfff] hover:underline font-medium">supporto@multiplayer.it</a></li>
                <li>Inviare una richiesta di riammissione o chiedere aiuto: <a href="mailto:community@multiplayer.it" className="text-[#00bfff] hover:underline font-medium">community@multiplayer.it</a></li>
              </ul>

              <p>Non verranno prese in considerazione e-mail contenenti offese, insulti o testi divaganti. Il testo dovrà essere il più conciso possibile e riportare gli elementi fondamentali della tua richiesta. Se farai delle richieste insistenti, potrà essere considerata come una forma di spam e potrai essere bloccato.</p>
              <p>Nei commenti puoi esprimere disaccordo in merito al contenuto di un articolo, ma in modo costruttivo e con rispetto nei confronti del lavoro svolto dalla redazione.</p>
              <p>Sul sito trattiamo anche altri argomenti oltre ai videogiochi, come tecnologia, anime, manga, film, serie TV, cosplaying e Twitch; se non ti interessa un argomento, ignora l’articolo.</p>
            </div>
          </section>

        </div>

        {/* Pulsante Torna Indietro */}
        <div className="mt-16 flex justify-center">
          <Link to="/" className="bg-[#2a2a2a] text-white px-8 py-3 rounded-sm font-bold uppercase tracking-widest text-[13px] hover:bg-[#ff4444] transition-colors border border-gray-700 hover:border-[#ff4444]">
            Torna alla Homepage
          </Link>
        </div>

      </div>
    </main>
  );
}