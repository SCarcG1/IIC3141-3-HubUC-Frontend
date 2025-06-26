import React, { useEffect, useState } from "react";
import api from "../../services/api";

export default function SolicitarClase({ lesson, onClose, onSubmit, courseCache }) {
  const [blocks, setBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [fecha, setFecha] = useState("");

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const token = localStorage.getItem("token");
        const params = {};
        if (fecha) {
          params.on_date = fecha;
        }
        const res = await api.get(`/weekly-timeblocks/${lesson.tutor_id}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: params,
        });
        setBlocks(res.data);
      } catch (err) {
        console.error("Error cargando bloques:", err);
      }
    };
    fetchBlocks();
  }, [lesson.tutor_id, fecha]);

  const diasSemana = {
    Monday: "Lunes",
    Tuesday: "Martes",
    Wednesday: "Miércoles",
    Thursday: "Jueves",
    Friday: "Viernes",
    Saturday: "Sábado",
    Sunday: "Domingo",
  };

  const formatHourString = (timeStr) => {
    // "08:00:00" => "08:00"
    const parts = timeStr.split(":");
    return `${parts[0]}:${parts[1]}`;
  };

  const getHourAndMinute = (timeStr) => {
    const [h, m] = timeStr.split(":");
    return [parseInt(h, 10), parseInt(m, 10)];
  };

  const formatNaiveDateTime = (date) => {
    const pad = (n) => n.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

const handleReservar = async () => {
  if (!selectedBlock || !fecha) {
    alert("Selecciona fecha y bloque");
    return;
  }

  // Hora/minuto reales del bloque
  const [startHour, startMinute] = getHourAndMinute(selectedBlock.start_hour);
  const [endHour, endMinute] = getHourAndMinute(selectedBlock.end_hour);

  // Construye la fecha correcta sin timezone shift:
  const [year, month, day] = fecha.split("-").map(Number);
  const start = new Date(year, month - 1, day, startHour, startMinute, 0, 0);
  const end = new Date(year, month - 1, day, endHour, endMinute, 0, 0);

  const formatNaiveDateTime = (date) => {
    const pad = (n) => n.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const token = localStorage.getItem("token");

  try {
    // ✅ Construye URL con query params explícitos:
    const url = `/reservations/lesson/${lesson.id}?start_time=${encodeURIComponent(formatNaiveDateTime(start))}&end_time=${encodeURIComponent(formatNaiveDateTime(end))}`;

    await api.post(
      url,
      null,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    onSubmit(lesson.id, formatNaiveDateTime(start));
  } catch (error) {
    console.error("Error al solicitar clase:", error);
  }
};






  const course = courseCache[lesson.course_id];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-neutral-900 p-6 rounded w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">
          Solicitar clase de {course?.name || "Clase"}
        </h2>

        <label className="block mb-2" htmlFor="fecha">Fecha:</label>
        <input
          id="fecha"
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="p-2 w-full rounded bg-neutral-800 mb-4"
        />

        <h3 className="mb-2">Bloques disponibles:</h3>
        {blocks.length === 0 ? (
          <p className="text-neutral-400">No hay bloques disponibles para esta fecha.</p>
        ) : (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {blocks.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedBlock(b)}
                className={`block w-full p-3 rounded border ${
                  selectedBlock?.id === b.id
                    ? "border-violet-500 bg-violet-600"
                    : "border-neutral-700 bg-neutral-800"
                }`}
              >
                {diasSemana[b.weekday]} de {formatHourString(b.start_hour)} a {formatHourString(b.end_hour)}
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={handleReservar}
            className="bg-violet-600 hover:bg-violet-800 px-4 py-2 rounded"
          >
            Confirmar
          </button>
          <button
            onClick={onClose}
            className="bg-neutral-700 hover:bg-neutral-800 px-4 py-2 rounded"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
