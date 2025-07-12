import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [recordatorios, setRecordatorios] = useState([]);
  const [nuevoRecordatorio, setNuevoRecordatorio] = useState('');
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevaHora, setNuevaHora] = useState('');
  const [emojiSeleccionado, setEmojiSeleccionado] = useState('📝');

  const [proximoRecordatorio, setProximoRecordatorio] = useState(null);
  const [tiempoRestante, setTiempoRestante] = useState('');

  useEffect(() => {
    const datosGuardados = localStorage.getItem('recordatorios');
    if (datosGuardados) {
      setRecordatorios(JSON.parse(datosGuardados));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('recordatorios', JSON.stringify(recordatorios));
  }, [recordatorios]);

  const agregarRecordatorio = () => {
    if (nuevoRecordatorio.trim() && nuevaFecha && nuevaHora) {
      const nuevosRecordatorios = [
        ...recordatorios,
        {
          texto: `${emojiSeleccionado} ${nuevoRecordatorio}`,
          fecha: nuevaFecha,
          hora: nuevaHora,
          cumplido: false,
        },
      ];

      nuevosRecordatorios.sort((a, b) => {
        const fechaHoraA = new Date(`${a.fecha}T${a.hora}`);
        const fechaHoraB = new Date(`${b.fecha}T${b.hora}`);
        return fechaHoraA - fechaHoraB;
      });

      setRecordatorios(nuevosRecordatorios);
      setNuevoRecordatorio('');
      setNuevaFecha('');
      setNuevaHora('');
      setEmojiSeleccionado('📝');
    }
  };

  const eliminarRecordatorio = (index) => {
    const nuevos = recordatorios.filter((_, i) => i !== index);
    setRecordatorios(nuevos);
  };

  const marcarComoCumplido = (index) => {
    const nuevos = recordatorios.map((item, i) =>
      i === index ? { ...item, cumplido: !item.cumplido } : item
    );
    setRecordatorios(nuevos);
  };

  const calcularTiempoRestante = (fecha, hora) => {
    const fechaObjetivo = new Date(`${fecha}T${hora}`);
    const ahora = new Date();
    const diferencia = fechaObjetivo - ahora;

    if (diferencia <= 0) return '¡Venció!';

    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferencia / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diferencia / (1000 * 60)) % 60);
    const segundos = Math.floor((diferencia / 1000) % 60);

    return `${dias}d ${horas}h ${minutos}m ${segundos}s`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const tareasPendientes = recordatorios.filter(r => !r.cumplido);
      if (tareasPendientes.length > 0) {
        const siguiente = [...tareasPendientes].sort((a, b) => {
          return new Date(`${a.fecha}T${a.hora}`) - new Date(`${b.fecha}T${b.hora}`);
        })[0];

        setProximoRecordatorio(siguiente);
        setTiempoRestante(calcularTiempoRestante(siguiente.fecha, siguiente.hora));
      } else {
        setProximoRecordatorio(null);
        setTiempoRestante('');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [recordatorios]);

  return (
    <div className="App">
      <h1>Mi Calendario de Recordatorios</h1>

      {proximoRecordatorio && (
        <div style={{ marginTop: '20px', fontSize: '18px', color: '#b3649d' }}>
          ⏳ Próxima tarea: <strong>{proximoRecordatorio.texto}</strong><br />
          🕐 Tiempo restante: <strong>{tiempoRestante}</strong>
        </div>
      )}

      <div className="formulario">
        <input
          type="text"
          placeholder="Escribe tu recordatorio..."
          value={nuevoRecordatorio}
          onChange={(e) => setNuevoRecordatorio(e.target.value)}
        />
        <select
          value={emojiSeleccionado}
          onChange={(e) => setEmojiSeleccionado(e.target.value)}
        >
          <option value="📝">📝 Nota</option>
          <option value="🎉">🎉 Fiesta</option>
          <option value="🎂">🎂 Cumpleaños</option>
          <option value="🏥">🏥 Cita médica</option>
          <option value="💼">💼 Trabajo</option>
          <option value="💸">💸 Pagar</option>
        </select>
        <input
          type="date"
          value={nuevaFecha}
          onChange={(e) => setNuevaFecha(e.target.value)}
        />
        <input
          type="time"
          value={nuevaHora}
          onChange={(e) => setNuevaHora(e.target.value)}
        />
        <button onClick={agregarRecordatorio}>Agregar</button>
      </div>

      <ul className="lista">
        {recordatorios.map((item, index) => (
          <li key={index} className={item.cumplido ? 'cumplido' : ''}>
            <span>
              📅 {item.fecha} ⏰ {item.hora} — {item.texto}
            </span>
            <div>
              <button onClick={() => marcarComoCumplido(index)}>
                {item.cumplido ? 'Desmarcar' : 'Cumplido'}
              </button>
              <button onClick={() => eliminarRecordatorio(index)}>Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
