import React, { useEffect, useState } from "react";
import api from "../../services/api";

export default function Horario() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [infoClase, setInfoClase] = useState(null);
  const [clases, setClases] = useState([]);

  const abrirModal = (clase) => {
    setInfoClase(clase);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setInfoClase(null);
  };

  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const horas = [
    "08:20", "09:40", "11:00", "12:20",
    "13:30", "14:50", "16:10", "17:30",
    "18:50", "20:10",
  ];

  const bloquesPorSlot = {};

  const now = new Date();
  const day = now.getDay();
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const slotMinutos = horas.map((h) => {
    const [hh, mm] = h.split(":").map(Number);
    return hh * 60 + mm;
  });

  clases.forEach((r) => {
    if (r.status !== "accepted") return;

    const start = new Date(r.start_time);
    const end = new Date(r.end_time);
    const localStart = new Date(start.toLocaleString("en-US", { timeZone: "America/Santiago" }));
    const localEnd = new Date(end.toLocaleString("en-US", { timeZone: "America/Santiago" }));

    if (localStart < monday || localStart > sunday) return;

    const startMinutos = localStart.getHours() * 60 + localStart.getMinutes();
    let slot = horas[0];
    for (let i = 0; i < slotMinutos.length; i++) {
      if (startMinutos >= slotMinutos[i]) {
        slot = horas[i];
      } else {
        break;
      }
    }

    const diaSemana = dias[localStart.getDay() === 0 ? 6 : localStart.getDay() - 1];
    const key = `${diaSemana}-${slot}`;

    if (!bloquesPorSlot[key]) bloquesPorSlot[key] = [];

    const duracionMinutos = (localEnd - localStart) / 60000;
    const duracion = Math.max(1, Math.round(duracionMinutos / 80));

    bloquesPorSlot[key].push({
      dia: diaSemana,
      horaInicio: slot,
      duracion,
      titulo: r.private_lesson?.course?.name || "Clase",
      tutor: r.private_lesson?.tutor?.name || "N/A",
      estudiante: r.student?.name || "N/A",
    });
  });

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));
        const isTutor = user?.role === "tutor";

        const res = await api.get(
          isTutor ? "/reservations/tutor" : "/reservations/student",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setClases(res.data);
      } catch (err) {
        console.error("Error cargando reservas:", err);
      }
    };

    fetchReservations();
  }, []);

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed text-sm border-collapse">
        <thead>
          <tr>
            <th className="border border-neutral-700 p-2 w-24 bg-neutral-900">Hora</th>
            {dias.map((dia) => (
              <th key={dia} className="border border-neutral-700 p-2 w-32 bg-neutral-900">
                {dia}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {horas.map((hora) => (
            <tr key={hora}>
              <td className="border border-neutral-700 p-2 font-semibold text-center bg-neutral-900">
                {hora}
              </td>
              {dias.map((dia) => {
                const key = `${dia}-${hora}`;
                const bloques = bloquesPorSlot[key] || [];

                return (
                  <td
                    key={key}
                    className="border border-neutral-700 p-2 h-16 text-center bg-neutral-800"
                  >
                    {bloques.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {bloques.map((bloque, idx) => (
                          <div
                            key={idx}
                            className="bg-violet-600 text-white rounded px-2 py-1 cursor-pointer hover:brightness-110 duration-200"
                            onClick={() => abrirModal(bloque)}
                          >
                            {bloque.titulo}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-neutral-400"></span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-neutral-900 rounded-lg p-6 max-w-md w-full text-white">
            <h2 className="text-xl font-bold mb-4">{infoClase?.titulo}</h2>
            <p>Hora: {infoClase?.horaInicio}</p>
            <p>Día: {infoClase?.dia}</p>
            <p>Duración: {infoClase?.duracion} bloque(s) de 1h20</p>
            <p>Tutor: {infoClase?.tutor}</p>
            <p>Estudiante: {infoClase?.estudiante}</p>

            <button
              onClick={cerrarModal}
              className="mt-6 bg-violet-600 hover:bg-violet-800 px-4 py-2 rounded duration-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
