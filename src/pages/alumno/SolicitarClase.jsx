import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function SolicitarClase({
  lesson,
  onClose,
  onSubmit,
  courseCache,
}) {
  const [blocks, setBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [fecha, setFecha] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    // Redirección si no hay token o el rol no es 'alumno'
    if (!token || role !== "student") {
      navigate("/", { replace: true });
      return;
    }
    if (fecha) {
      fetchBlocks();
    }
  }, [fecha]);

  const fetchBlocks = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get(
        `/timeblocks/${lesson.tutor_id}?on_date=${fecha}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBlocks(res.data);
    } catch (err) {
      console.error("Error cargando bloques:", err);
    }
  };

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
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
      date.getSeconds()
    )}`;
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

    const token = localStorage.getItem("token");

    try {
      const url = `/reservations/lesson/${
        lesson.id
      }?start_time=${encodeURIComponent(
        formatNaiveDateTime(start)
      )}&end_time=${encodeURIComponent(formatNaiveDateTime(end))}`;

      await api.post(url, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

        <label className="block mb-2" htmlFor="fecha">
          Fecha:
        </label>
        <input
          id="fecha"
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="p-2 w-full rounded bg-neutral-800 mb-4"
        />

        <h3 className="mb-2">Bloques disponibles:</h3>
        {blocks.length === 0 ? (
          <p className="text-neutral-400">
            No hay bloques disponibles para esta fecha.
          </p>
        ) : (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {blocks.map((b, i) => {
              const isSelected =
                selectedBlock &&
                b.weekday === selectedBlock.weekday &&
                b.start_hour === selectedBlock.start_hour &&
                b.end_hour === selectedBlock.end_hour;
              return (
                <button
                  key={`${b.weekday}-${b.start_hour}-${b.end_hour}-${i}`}
                  onClick={() => setSelectedBlock(b)}
                  className={`block w-full p-3 rounded border ${
                    isSelected
                      ? "border-violet-500 bg-violet-600"
                      : "border-neutral-700 bg-neutral-800"
                  }`}
                >
                  {diasSemana[b.weekday]} de {formatHourString(b.start_hour)} a{" "}
                  {formatHourString(b.end_hour)}
                </button>
              );
            })}
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
