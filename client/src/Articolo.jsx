import { useParams } from 'react-router-dom';

export default function Articolo() {
  const { id } = useParams(); 

  return (
    <div>
      <h1>Titolo dell'articolo (ID: {id})</h1>
      <p>Testo della recensione...</p>
    </div>
  );
}