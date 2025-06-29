import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

export default function EditarClase() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clase, setClase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const fetchClase = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/private-lessons/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClase(res.data);
      } catch (err) {
        console.error("Error al cargar la clase:", err);
        setMensaje("❌ No se pudo cargar la clase");
      } finally {
        setLoading(false);
      }
    };

    fetchClase();
  }, [id]);

  const handleChange = (e) => {
    setClase({ ...clase, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await api.patch(
        `/private-lessons/${id}`,
        {
          description: clase.description,
          price: parseFloat(clase.price),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMensaje("✅ Clase actualizada con éxito");
      setTimeout(() => navigate("/mis-clases"), 1000);
    } catch (err) {
      console.error("Error al actualizar clase:", err);
      setMensaje("❌ Error al actualizar clase");
    }
  };

  if (loading) return <p className="text-white p-8">Cargando...</p>;

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Editar Clase</h1>
        <button
          onClick={() => navigate("/dashboard/tutor")}
          className="bg-neutral-700 hover:bg-neutral-800 px-4 py-2 rounded duration-200"
        >
          ← Volver al panel principal
        </button>
      </div>

      {mensaje && <p className="mb-4">{mensaje}</p>}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label htmlFor="description" className="block mb-2">
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            value={clase.description || ""}
            onChange={handleChange}
            className="p-2 w-full rounded bg-neutral-800 text-white border border-neutral-600"
            rows={3}
            required
          />
        </div>

        <div>
          <label htmlFor="price" className="block mb-2">
            Precio
          </label>
          <input
            id="price"
            type="number"
            name="price"
            value={clase.price || ""}
            onChange={handleChange}
            className="p-2 w-full rounded bg-neutral-800 text-white border border-neutral-600"
            required
          />
        </div>

        <div className="flex gap-4 mt-4">
          <button
            type="submit"
            className="bg-violet-600 hover:bg-violet-800 px-4 py-2 rounded"
          >
            Guardar cambios
          </button>
          <button
            type="button"
            onClick={() => navigate("/mis-clases")}
            className="bg-neutral-700 hover:bg-neutral-800 px-4 py-2 rounded"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
