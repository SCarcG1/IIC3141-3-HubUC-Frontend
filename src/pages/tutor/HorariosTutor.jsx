import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api"; // Ajusta según tu estructura de carpetas

export default function Horarios() {
  const navigate = useNavigate();
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const diasSemana = {
    Monday: "Lunes",
    Tuesday: "Martes",
    Wednesday: "Miércoles",
    Thursday: "Jueves",
    Friday: "Viernes",
    Saturday: "Sábado",
    Sunday: "Domingo",
  };

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const formatHourString = (timeStr) => {
    // "08:00:00" => "08:00"
    const parts = timeStr.split(":");
    return `${parts[0]}:${parts[1]}`;
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este bloque?"))
      return;

    try {
      await api.delete(`/weekly-timeblocks/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Elimina de la lista localmente sin recargar toda la página:
      setHorarios(horarios.filter((h) => h.id !== id));
    } catch (err) {
      console.error("Error al eliminar bloque:", err);
      alert("Ocurrió un error al eliminar el bloque.");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    // Redirección si no hay token o el rol no es 'tutor'
    if (!token || role !== "tutor") {
      navigate("/", { replace: true });
      return;
    }
    const fetchHorarios = async () => {
      try {
        const res = await api.get(`/weekly-timeblocks/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setHorarios(res.data);
      } catch (err) {
        console.error("Error al obtener horarios:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHorarios();
  }, [user.id, token]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mis horarios disponibles</h1>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/horarios/nuevo")}
            className="bg-violet-600 hover:bg-violet-800 px-4 py-2 rounded duration-200"
          >
            + Crear nuevo horario
          </button>
          <button
            onClick={() => navigate(-1)}
            className="bg-neutral-700 hover:bg-neutral-800 px-4 py-2 rounded duration-200"
          >
            ← Volver
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-neutral-400">Cargando horarios...</p>
      ) : horarios.length === 0 ? (
        <p className="text-neutral-400">No tienes horarios publicados.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {horarios.map((h) => (
            <div
              key={h.id}
              className="bg-neutral-800 p-4 rounded-lg border border-neutral-700"
            >
              <div className="font-semibold text-lg">
                {diasSemana[h.weekday] || h.weekday} de{" "}
                {formatHourString(h.start_hour)} a{" "}
                {formatHourString(h.end_hour)}
              </div>
              <div className="text-sm text-neutral-400">
                Vigente desde {new Date(h.valid_from).toLocaleDateString()}{" "}
                hasta {new Date(h.valid_until).toLocaleDateString()}
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => handleDelete(h.id)}
                  className="bg-red-600 hover:bg-red-800 px-3 py-1 rounded text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
