import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function ClasesTutor() {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatFecha = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleAceptar = async (solicitud) => {
    try {
      const token = localStorage.getItem("token");
      await api.patch(
        `/reservations/tutor/${solicitud.id}`,
        {
          private_lesson_id: solicitud.private_lesson_id,
          student_id: solicitud.student_id,
          status: "accepted",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSolicitudes((prev) =>
        prev.map((s) =>
          s.id === solicitud.id ? { ...s, status: "accepted" } : s
        )
      );
      await handleUpdate(solicitud);
    } catch (error) {
      console.error(`Error al aceptar solicitud ${solicitud.id}:`, error);
    }
  };

  const handleRechazar = async (solicitud) => {
    try {
      const token = localStorage.getItem("token");
      await api.patch(
        `/reservations/tutor/${solicitud.id}`,
        {
          private_lesson_id: solicitud.private_lesson_id,
          student_id: solicitud.student_id,
          status: "rejected",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSolicitudes((prev) =>
        prev.map((s) =>
          s.id === solicitud.id ? { ...s, status: "rejected" } : s
        )
      );
    } catch (error) {
      console.error(`Error al rechazar solicitud ${solicitud.id}:`, error);
    }
  };

  const handleUpdate = async (aceptada) => {
    const topeHorario = solicitudes.filter(
      (s) =>
        s.status === "pending" &&
        s.id !== aceptada.id &&
        s.start_time === aceptada.start_time
    );
    for (const solicitud of topeHorario) {
      await handleRechazar(solicitud);
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

    fetchSolicitudes();
  }, []);

  const fetchSolicitudes = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/reservations/tutor", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSolicitudes(res.data);
    } catch (error) {
      console.error("Error al obtener solicitudes:", error);
    } finally {
      setLoading(false);
    }
  };

  const pendientes = solicitudes.filter((s) => s.status === "pending");
  const aceptadas = solicitudes.filter((s) => s.status === "accepted");
  const rechazadas = solicitudes.filter((s) => s.status === "rejected");

  return (
    <div className="bg-neutral-950 min-h-screen text-white p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Solicitudes de clase</h1>
        <button
          onClick={() => navigate(-1)}
          className="bg-neutral-700 hover:bg-neutral-800 px-4 py-2 rounded duration-200"
        >
          ← Volver
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-neutral-300">Cargando solicitudes...</p>
      ) : pendientes.length === 0 && aceptadas.length === 0 ? (
        <p className="mt-6 text-neutral-400">No hay solicitudes disponibles.</p>
      ) : (
        <>
          {pendientes.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mb-2">Pendientes</h2>
              <div className="flex flex-col gap-4 mb-6">
                {pendientes.map((s) => {
                  const startDate = new Date(s.start_time);
                  const endDate = new Date(s.end_time);
                  const fecha = formatFecha(startDate);
                  const desde = startDate.toLocaleTimeString("es-CL", {
                    hour: "numeric",
                    minute: "2-digit",
                  });
                  const hasta = endDate.toLocaleTimeString("es-CL", {
                    hour: "numeric",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={s.id}
                      className="bg-neutral-800 p-4 rounded-lg border border-neutral-700 flex justify-between items-center"
                    >
                      <div>
                        <div className="text-lg font-semibold">
                          Clase: {s.private_lesson.course.name}
                        </div>
                        <div className="text-sm text-neutral-400">
                          Nombre Estudiante: {
                            s.student
                            ?
                            s.student.name
                            :
                            "[Eliminado]"
                          }
                        </div>
                        <div className="text-sm text-neutral-400">
                          Fecha: {fecha}
                        </div>
                        <div className="text-sm text-neutral-400">
                          Desde: {desde}
                        </div>
                        <div className="text-sm text-neutral-400">
                          Hasta: {hasta}
                        </div>
                        <div className="text-sm text-neutral-500">
                          Estado: Pendiente
                        </div>
                      </div>

                      <div className="flex flex-col items-end space-y-2">
                        <button
                          onClick={() => navigate(`/perfil/${s.student.id}`)}
                          className="text-violet-400 hover:text-violet-600 text-sm underline"
                          type="button"
                        >
                          Ver perfil alumno
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAceptar(s)}
                            className="bg-violet-600 hover:bg-violet-800 px-3 py-1 rounded duration-200"
                          >
                            Aceptar
                          </button>
                          <button
                            onClick={() => handleRechazar(s)}
                            className="bg-violet-50 text-violet-600 hover:bg-red-400 hover:text-violet-50 px-4 py-2 rounded duration-200"
                          >
                            Rechazar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {aceptadas.length > 0 && (
            <div className="flex flex-col gap-4 mb-6">
              <h2 className="text-xl font-semibold">Aceptadas</h2>
              <div className="flex flex-col gap-4">
                {aceptadas.map((s) => {
                  const startDate = new Date(s.start_time);
                  const endDate = new Date(s.end_time);
                  const fecha = formatFecha(startDate);
                  const desde = startDate.toLocaleTimeString("es-CL", {
                    hour: "numeric",
                    minute: "2-digit",
                  });
                  const hasta = endDate.toLocaleTimeString("es-CL", {
                    hour: "numeric",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={s.id}
                      className="bg-neutral-800 p-4 rounded-lg border border-neutral-700 flex justify-between items-center"
                    >
                      <div>
                        <div className="text-lg font-semibold">
                          Clase: {s.private_lesson.course.name}
                        </div>
                        <div className="text-sm text-neutral-400">
                          Nombre Estudiante: {
                            s.student
                            ?
                            s.student.name
                            :
                            "[Eliminado]"
                          }
                        </div>
                        <div className="text-sm text-neutral-400">
                          Fecha: {fecha}
                        </div>
                        <div className="text-sm text-neutral-400">
                          Desde: {desde}
                        </div>
                        <div className="text-sm text-neutral-400">
                          Hasta: {hasta}
                        </div>
                        <div className="text-sm text-green-500">
                          Estado: Aceptada
                        </div>
                      </div>

                      <div className="flex flex-col items-end space-y-2">
                        <button
                          onClick={() => navigate(`/perfil/${s.student.id}`)}
                          className="text-violet-400 hover:text-violet-600 text-sm underline"
                          type="button"
                        >
                          Ver perfil alumno
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {rechazadas.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mb-2">Rechazadas</h2>
              <div className="flex flex-col gap-4">
                {rechazadas.map((s) => {
                  const startDate = new Date(s.start_time);
                  const endDate = new Date(s.end_time);
                  const fecha = formatFecha(startDate);
                  const desde = startDate.toLocaleTimeString("es-CL", {
                    hour: "numeric",
                    minute: "2-digit",
                  });
                  const hasta = endDate.toLocaleTimeString("es-CL", {
                    hour: "numeric",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={s.id}
                      className="bg-neutral-800 p-4 rounded-lg border border-neutral-700 flex justify-between items-center"
                    >
                      <div>
                        <div className="text-lg font-semibold">
                          Clase: {s.private_lesson.course.name}
                        </div>
                        <div className="text-sm text-neutral-400">
                          Nombre Estudiante: {
                            s.student
                            ?
                            s.student.name
                            :
                            "[Eliminado]"
                          }
                        </div>
                        <div className="text-sm text-neutral-400">
                          Fecha: {fecha}
                        </div>
                        <div className="text-sm text-neutral-400">
                          Desde: {desde}
                        </div>
                        <div className="text-sm text-neutral-400">
                          Hasta: {hasta}
                        </div>
                        <div className="text-sm text-red-500">
                          Estado: Rechazada
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <button
                          onClick={() => navigate(`/perfil/${s.student.id}`)}
                          className="text-violet-400 hover:text-violet-600 text-sm underline"
                          type="button"
                        >
                          Ver perfil alumno
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
