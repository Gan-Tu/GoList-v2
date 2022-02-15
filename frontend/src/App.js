import './App.css';
import useUserId from './hooks/userId';

function App() {
  const [uid, err] = useUserId("tugan");

  return (
    <div >
      <p>UID: {uid}</p>
      <p>Error: {err}</p>
    </div>
  );
}

export default App;
