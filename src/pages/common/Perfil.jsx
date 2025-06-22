import React, { useEffect, useState } from "react";
import axios from "../../services/api";
import { useParams, useNavigate } from "react-router-dom";

// Placeholder contenedor Reviews
function Reviews() {
  return (
    <div className="w-full h-full min-h-[300px] bg-neutral-800 p-6 rounded-lg border border-neutral-700">
      <h3 className="text-lg font-semibold mb-2 text-white">Reviews</h3>
      <p className="text-gray-400">Aquí irán las reviews del tutor...</p>
    </div>
  );
}

export default function Perfil() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name || "[placeholder]");
  const [email, setEmail] = useState(user?.email || "[placeholder]");

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        // Ejemplo: API para obtener usuario por id
        const res = await axios.get(`/users/${id}`);
        const data = res.data;
        setUser(data);
        setName(data.name);
        setEmail(data.email);
      } catch (error) {
        console.error(error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [id]);

  const roleNames = {
    tutor: "Tutor",
    student: "Alumno",
  };
  const displayRole = roleNames[user?.role] || user?.role || "[placeholder]";

  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const isOwner = id === String(loggedInUser?.id);

  const handleSaveChanges = () => {
    // Llamada API
    console.log("Guardando", { name, email });
    setEditMode(false);
  };

  if (loading) return <p className="text-white p-8">Cargando perfil...</p>;
  if (!user) return <p className="text-white p-8">Usuario no encontrado</p>;

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isOwner ? "Mi Perfil" : `Perfil de ${user.name}`}
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="bg-neutral-700 hover:bg-neutral-800 px-4 py-2 rounded duration-200"
        >
          ← Volver
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="bg-neutral-800 pt-10 px-6 pb-6 rounded-lg border border-neutral-700 flex-1 max-h-[400px] flex flex-col relative">
          <span className="absolute top-4 right-4 bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-semibold select-none z-10">
            {displayRole}
          </span>

          <div className="overflow-auto mb-4">
            <div className="mb-4">
              <label
                className="block text-base font-semibold text-white mb-1"
                htmlFor="name"
              >
                Nombre
              </label>
              {editMode ? (
                <input
                  id="name"
                  type="text"
                  className="bg-neutral-900 border border-neutral-600 rounded px-3 py-2 text-white w-full text-base"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Escribe tu nombre"
                />
              ) : (
                <p className="text-white text-lg">{name || "[placeholder]"}</p>
              )}
            </div>

            <div className="mb-4">
              <label
                className="block text-base font-semibold text-white mb-1"
                htmlFor="email"
              >
                Correo
              </label>
              {editMode ? (
                <input
                  id="email"
                  type="email"
                  className="bg-neutral-900 border border-neutral-600 rounded px-3 py-2 text-white w-full text-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Escribe tu correo"
                />
              ) : (
                <p className="text-gray-400 text-lg">
                  {email || "[placeholder]"}
                </p>
              )}
            </div>
          </div>

          {isOwner && (
            <div className="flex justify-end space-x-3 mt-auto">
              {editMode ? (
                <>
                  <button
                    onClick={handleSaveChanges}
                    className="bg-violet-600 hover:bg-violet-800 px-3 py-1 rounded duration-200 inline-block"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => {
                      setName(user?.name || "");
                      setEmail(user?.email || "");
                      setEditMode(false);
                    }}
                    className="bg-neutral-700 hover:bg-neutral-800 px-4 py-2 rounded duration-200"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-violet-600 hover:bg-violet-800 px-3 py-1 rounded duration-200 inline-block"
                >
                  Editar perfil
                </button>
              )}
            </div>
          )}
        </div>

        {user?.role === "tutor" && (
          <div className="flex-[4]">
            <Reviews />
          </div>
        )}
      </div>
    </div>
  );
}
