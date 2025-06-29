import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Horario from "../../components/common/Horario";
import { useNavigate } from 'react-router-dom';
import api from "../../services/api";

export default function TutorDashboard() {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  console.log(solicitudes);

  // datos hardcodeados
  const resumen = {
    clasesHoy: 2,
    proximaClase: "Matemáticas - 09:40 hrs",
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    // Redirección si no hay token o el rol no es 'tutor'
    if (!token || role !== "tutor") {
      navigate("/", { replace: true });
      return;
    }
    const fetchSolicitudes = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/reservations/tutor", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSolicitudes(res.data);
      } catch (error) {
        console.error("Error al obtener solicitudes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitudes();
  }, []);

  return (
    <div className="bg-neutral-950 min-h-screen text-white p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Panel Principal</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 overflow-x-auto">
          <div className="flex-1 overflow-x-auto">
            <Horario />
          </div>
        </div>

        <div className="w-full lg:w-80 flex flex-col gap-4">
          <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
            <h2 className="text-lg font-semibold mb-1">Mis clases</h2>
            <div className="flex gap-4">
              <Link
                to="/mis-clases"
                className="bg-violet-600 hover:bg-violet-800 px-3 py-1 rounded duration-200 inline-block"
              >
                Ver clases
              </Link>
              <Link
                to="/horarios"
                className="bg-violet-600 hover:bg-violet-800 px-3 py-1 rounded duration-200 inline-block"
              >
                Editar horarios
              </Link>
            </div>
          </div>

          <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
            <h2 className="text-lg font-semibold mb-1">Clases de hoy</h2>
            <p className="text-xl mb-4">{resumen.clasesHoy}</p>
          </div>

          <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
            <h2 className="text-lg font-semibold mb-1">Próxima clase</h2>
            <p className="text-m mb-4">{resumen.proximaClase}</p>
          </div>

          <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
            <h2 className="text-lg font-semibold mb-1">
              Solicitudes pendientes
            </h2>
            {loading ? (
              <p className="mt-6 text-neutral-300">Cargando solicitudes...</p>
            ) : solicitudes.length === 0 ? (
              <p className="mt-6 text-neutral-400">No hay solicitudes aún.</p>
            ) : (
              <div>
                <p className="text-xl mb-4">
                  {solicitudes.filter((s) => s.status === "pending").length}
                </p>
                <Link
                  to="/solicitudes/tutor"
                  className="bg-violet-600 hover:bg-violet-800 px-3 py-1 rounded duration-200 inline-block"
                >
                  Ver solicitudes
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
