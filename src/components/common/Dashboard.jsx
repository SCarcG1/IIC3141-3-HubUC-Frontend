import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Horario from "../../components/common/Horario";
import api from "../../services/api";

export default function Dashboard({
  roleCheck,
  apiEndpoint,
  acciones = [],
  linkSolicitudes,
  mostrarSoloClasesAceptadas = false,
}) {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clases, setClases] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));
  const now = new Date();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== roleCheck) {
      navigate("/", { replace: true });
      return;
    }

    const fetchData = async () => {
      try {
        const res = await api.get(apiEndpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSolicitudes(res.data);
        setClases(res.data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const clasesFiltradas = mostrarSoloClasesAceptadas
    ? clases.filter((r) => r.status === "accepted")
    : clases;

  const clasesHoy = clasesFiltradas.filter((r) => {
    const localStart = new Date(
      new Date(r.start_time).toLocaleString("en-US", {
        timeZone: "America/Santiago",
      })
    );
    return (
      localStart.getDate() === now.getDate() &&
      localStart.getMonth() === now.getMonth() &&
      localStart.getFullYear() === now.getFullYear()
    );
  });

  const proximaClase = clasesFiltradas
    .filter((r) => new Date(r.start_time) > now)
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))[0];

  return (
    <div className="bg-neutral-950 min-h-screen text-white p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Horario De Esta Semana</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 overflow-x-auto">
          <Horario user={user} />
        </div>

        <div className="w-full lg:w-80 flex flex-col gap-4">
          {acciones.map((accion) => (
            <div
              key={accion.title}
              className="bg-neutral-800 p-4 rounded-lg border border-neutral-700"
            >
              <h2 className="text-lg font-semibold mb-1">{accion.title}</h2>
              {accion.links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="bg-violet-600 hover:bg-violet-800 px-3 py-1 rounded duration-200 inline-block mr-2"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}

          <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
            <h2 className="text-lg font-semibold mb-1">Clases de hoy</h2>
            <p className="text-xl mb-4">{clasesHoy.length}</p>
          </div>

          <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
            <h2 className="text-lg font-semibold mb-1">Próxima clase</h2>
            {proximaClase ? (
              <p>
                {proximaClase.private_lesson?.course?.name || "Clase"} -{" "}
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
                  to={linkSolicitudes}
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
