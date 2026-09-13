import { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://127.0.0.1:8000/')
      .then((res) => res.text())
      .then((data) => setMessage(data))
      .catch((err) => console.error("Backend error:", err));
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
      <h1>Academic Project</h1>
      <p>Backend Status: <strong>{message || 'Connecting to backend...'}</strong></p>
    </div>
  );
}

export default App;