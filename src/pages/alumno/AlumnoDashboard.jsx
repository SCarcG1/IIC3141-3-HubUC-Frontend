import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Horario from "../../components/common/Horario";
import api from "../../services/api";
import { useNavigate } from 'react-router-dom';

export default function AlumnoDashboard() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [clases, setClases] = useState([]);
  const navigate = useNavigate();

  const now = new Date();
  const clasesHoy = clases.filter((r) => {
    const localStart = new Date(new Date(r.start_time).toLocaleString("en-US", { timeZone: "America/Santiago" }));
    return r.status === "accepted" &&
      localStart.getDate() === now.getDate() &&
      localStart.getMonth() === now.getMonth() &&
      localStart.getFullYear() === now.getFullYear();
  });

  const proximaClase = clases
    .filter((r) => r.status === "accepted" && new Date(r.start_time) > now)
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))[0];

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    // Redirección si no hay token o el rol no es 'alumno'
    if (!token || role !== "student") {
      navigate("/", { replace: true });
      return;
    }
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res1 = await api.get("/reservations/student", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSolicitudes(res1.data);
        setClases(res1.data);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-neutral-950 min-h-screen text-white p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Horario De Esta Semana</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <Horario />
        </div>

        <div className="w-full lg:w-80 flex flex-col gap-4">
          <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
            <h2 className="text-lg font-semibold mb-1">Buscar clases</h2>
            <Link
              to="/clases"
              className="bg-violet-600 hover:bg-violet-800 px-3 py-1 rounded duration-200 inline-block"
            >
              Ver clases
            </Link>
          </div>

          <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
            <h2 className="text-lg font-semibold mb-1">Clases de hoy</h2>
            <p className="text-xl mb-4" data-testid="clases-hoy-count">{clasesHoy.length}</p>
          </div>

          <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
            <h2 className="text-lg font-semibold mb-1">Próxima clase</h2>
            {proximaClase ? (
              <p data-testid="proxima-clase-info">
                {proximaClase.private_lesson?.course?.name} -{" "}
                {new Date(proximaClase.start_time).toLocaleTimeString("es-CL", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            ) : (
              <p className="text-neutral-400">Sin próximas clases</p>
            )}
          </div>

          <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
            <h2 className="text-lg font-semibold mb-1">
              Solicitudes pendientes
            </h2>
            <p className="text-xl mb-4" data-testid="solicitudes-pendientes-count">
              {solicitudes.filter((s) => s.status === "pending").length}
            </p>
            <Link
              to="/solicitudes/alumno"
              className="bg-violet-600 hover:bg-violet-800 px-3 py-1 rounded duration-200 inline-block"
            >
              Ver solicitudes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
