import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import PublicarClase from "../../components/tutor/PublicarClase";

export default function MisClases() {
  const navigate = useNavigate();
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [CursosCache, setCursosCache] = useState({});
  const user = JSON.parse(localStorage.getItem("user"));

  const [filters, setFilters] = useState({
    course_id: "",
  });

  const fetchCurso = async (courseId) => {
    if (CursosCache[courseId]) return; // evitar fetch duplicado
    try {
      const res = await api.get(`/courses/${courseId}`);
      setCursosCache((prev) => ({ ...prev, [courseId]: res.data }));
    } catch (e) {
      console.error(`Error cargando curso ${courseId}:`, e);
    }
  };

  const fetchClases = async () => {
    setLoading(true);
    try {
      const { course_id } = filters;
      const query = new URLSearchParams({
        ...(course_id && { course_id: parseInt(course_id).toString() }),
        tutor_id: user.id.toString(),
        order_by: "created_at",
        order: "desc",
        page: "1",
        page_size: "10",
      });

      const token = localStorage.getItem("token");
      const res = await api.get(`/private-lessons/search?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const clasesObtenidas = res.data?.results || [];
      setClases(clasesObtenidas);
    } catch (err) {
      console.error("Error al obtener clases:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClases();
  }, []);

  useEffect(() => {
    const uniqueCourseIds = [...new Set(clases.map((c) => c.course_id))];
    uniqueCourseIds.forEach((id) => {
      if (!CursosCache[id]) {
        fetchCurso(id);
      }
    });
  }, [clases]);

  const handleEliminar = async (id) => {
    const confirmar = confirm("¿Estás seguro de eliminar esta clase?");
    if (!confirmar) return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/private-lessons/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClases((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Error al eliminar clase:", err);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mis Clases</h1>
        <button
          onClick={() => navigate("/dashboard/tutor")}
          className="bg-neutral-700 hover:bg-neutral-800 px-4 py-2 rounded duration-200"
        >
          ← Volver al panel principal
        </button>
      </div>

      <PublicarClase onPublicar={fetchClases} />

      {loading ? (
        <p className="text-neutral-400">Cargando clases...</p>
      ) : clases.length === 0 ? (
        <p className="text-neutral-400">No has publicado ninguna clase aún.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {clases.map((c) => (
            <div
              key={c.id}
              className="bg-neutral-800 p-4 rounded-lg border border-neutral-700"
            >
              <p className="text-xl text-neutral-100 font-semibold mb-2">
                {CursosCache[c.course_id]?.name || "Desconocida"}
              </p>
              <p className="text-sm text-neutral-300 mb-1">{c.description}</p>
              <p className="text-sm text-neutral-400">
                Precio: ${c.price.toLocaleString()}
              </p>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => navigate(`/clases/${c.id}/editar`)}
                  className="bg-violet-500 hover:bg-violet-700 px-3 py-1 rounded text-sm"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleEliminar(c.id)}
                  className="bg-red-600 hover:bg-red-800 px-3 py-1 rounded text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => navigate("/dashboard/tutor")}
        className="mt-8 bg-neutral-700 hover:bg-neutral-800 px-4 py-2 rounded"
      >
        ← Volver al panel principal
      </button>
    </div>
  );
}
