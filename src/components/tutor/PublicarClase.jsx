import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function PublicarClase({ onPublicar }) {
  /* ──────────────── State ──────────────── */
  const [ramo, setRamo] = useState('');
  const [horarios, setHorarios] = useState([]);          // ← sin <string[]>
  const [precio, setPrecio] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [expandido, setExpandido] = useState(false);
  const [ramosDisponibles, setRamosDisponibles] = useState([]);

  /* ──────────────── Constantes UI ──────────────── */
  const HORAS = [
    '08:20', '09:40', '11:00', '12:20',
    '13:30', '14:50', '16:10', '17:30',
    '18:50', '20:10',
  ];
  const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  /* ──────────────── Efectos ──────────────── */
  useEffect(() => {
    const fetchRamos = async () => {
      try {
        const { data } = await api.get('/courses');
        setRamosDisponibles(data);
      } catch {
        setRamosDisponibles([]);
      }
    };
    fetchRamos();
  }, []);

  /* ──────────────── Handlers ──────────────── */
  const handleHorarioChange = (e) => {
    const { value, checked } = e.target;
    setHorarios((prev) =>
      checked ? [...prev, value] : prev.filter((h) => h !== value),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    try {
      await api.post(
        '/private-lessons',
        {
          tutor_id: user.id,
          course_id: parseInt(ramo, 10),
          price: parseInt(precio, 10),
          description: descripcion,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMensaje('✅ Clase publicada correctamente');
      setRamo('');
      setHorarios([]);
      setPrecio('');
      setDescripcion('');
      if (onPublicar) onPublicar();
    } catch (err) {
      console.error(err);
      setMensaje('❌ Error al publicar la clase');
    }
  };


  /* ──────────────── Render ──────────────── */
  return (
    <div className="mb-8">
      <button
        onClick={() => setExpandido(!expandido)}
        className="w-full text-left bg-neutral-900 text-white border border-violet-600 px-4 py-4 font-semibold rounded hover:bg-neutral-800 transition-colors"
      >
        {expandido ? '➖' : '➕'} Publicar nueva clase
      </button>

      {expandido && (
        <form
          onSubmit={handleSubmit}
          className="bg-neutral-800 p-6 rounded-xl mt-4 space-y-4"
        >
          {/* Ramo */}
          <div>
            <label className="block mb-2">Ramo/Curso</label>
            <select
              value={ramo}
              onChange={(e) => setRamo(e.target.value)}
              required
              className="p-2 rounded w-full bg-neutral-900 text-white border border-neutral-600"
            >
              <option key="placeholder" value="">
                Seleccione un ramo
              </option>
              {ramosDisponibles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label className="block mb-2">Descripción de la clase</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Breve descripción del contenido, modalidad, etc."
              rows={3}
              maxLength={300}
              className="p-2 rounded w-full bg-neutral-900 text-white border border-neutral-600 resize-none"
              required
            />
          </div>

          {/* Precio */}
          <div>
            <label className="block mb-2">Precio por sesión (CLP)</label>
            <input
              type="number"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              placeholder="$ CLP"
              className="p-2 rounded w-full bg-neutral-900 text-white border border-neutral-600"
              required
            />
          </div>

          {/* Botón enviar */}
          <button
            type="submit"
            className="bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded text-white"
          >
            Publicar clase
          </button>

          {/* Mensaje */}
          {mensaje && <p className="text-sm">{mensaje}</p>}
        </form>
      )}
    </div>
  );
}
