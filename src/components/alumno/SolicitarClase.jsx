// src/pages/alumno/SolicitarClase.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function SolicitarClase() {
  const { lessonId } = useParams(); // private_lesson_id
  const navigate = useNavigate();
  const [blocks, setBlocks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [fecha, setFecha] = useState('');
  const [loading, setLoading] = useState(true);

  // 1) Cargar bloques disponibles del tutor
  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const token = localStorage.getItem("token");
        const resLesson = await api.get(`/private-lessons/${lessonId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const tutorId = resLesson.data.tutor_id;

        const resBlocks = await api.get(`/weekly-timeblocks/${tutorId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBlocks(resBlocks.data);
      } catch (err) {
        console.error("Error cargando bloques:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlocks();
  }, [lessonId]);

  const diasSemana = {
    Monday: "Lunes",
    Tuesday: "Martes",
    Wednesday: "Miércoles",
    Thursday: "Jueves",
    Friday: "Viernes",
    Saturday: "Sábado",
    Sunday: "Domingo",
  };

  const handleReservar = async () => {
    if (!selected || !fecha) {
      alert("Selecciona fecha y bloque");
      return;
    }
    const token = localStorage.getItem("token");

    // Combinar fecha seleccionada + hora de inicio
    const start = new Date(fecha);
    start.setHours(selected.start_hour, 0, 0, 0);
    const startISO = start.toISOString();

    try {
      await api.post(`/reservations/lesson/${lessonId}`, {
        start_time: startISO,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Clase solicitada correctamente");
      navigate("/mis-reservas");
    } catch (err) {
      console.error("Error reservando clase:", err);
      alert("Error reservando");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Solicitar Clase</h1>
      {loading ? (
        <p>Cargando bloques...</p>
      ) : (
        <>
          <label className="block mb-2">Fecha (dentro de la vigencia):</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="p-2 rounded bg-neutral-800 mb-4"
          />

          <h2 className="text-lg font-semibold mb-2">Bloques disponibles:</h2>
          <div className="space-y-2">
            {blocks.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelected(b)}
                className={`block w-full p-3 rounded border ${
                  selected?.id === b.id
                    ? "border-violet-500 bg-violet-600"
                    : "border-neutral-700 bg-neutral-800"
                }`}
              >
                {diasSemana[b.weekday]} de {b.start_hour}:00 a {b.end_hour}:00
                <br />
                Vigente hasta {new Date(b.valid_until).toLocaleDateString()}
              </button>
            ))}
          </div>

          <button
            onClick={handleReservar}
            className="mt-6 bg-violet-600 px-4 py-2 rounded"
          >
            Confirmar Reserva
          </button>
        </>
      )}
    </div>
  );
}
