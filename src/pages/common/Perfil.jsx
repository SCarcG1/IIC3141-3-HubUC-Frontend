import React, { useEffect, useState } from "react";
import axios from "../../services/api";
import { useParams, useNavigate } from "react-router-dom";
import Reviews from "../tutor/Reviews.jsx";
import ClasesTutor from "./ClasesTutor.jsx";
import StarRating from "../../components/common/StarRating.jsx";

export default function Perfil() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name || "[placeholder]");
  const [email, setEmail] = useState(user?.email || "[placeholder]");

  const token = localStorage.getItem("token");
  const roleNames = {
    tutor: "Tutor",
    student: "Alumno",
  };
  const displayRole = roleNames[user?.role] || user?.role || "[placeholder]";
  const [averageRating, setAverageRating] = useState(null);

  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const isOwner = id === String(loggedInUser?.id);

  const handleDeleteProfile = async () => {
    const confirmed = window.confirm(
      "¿Estás seguro de que deseas eliminar tu perfil? Esta acción no se puede deshacer."
    );

    if (!confirmed) return;

    try {
      await axios.delete(`/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Limpiar datos del usuario y redirigir a la página de inicio o login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    } catch (err) {
      console.error("Error al eliminar el perfil:", err);
      alert("Ocurrió un error al eliminar el perfil.");
    }
  };

  useEffect(() => {
    // Redirección si no hay token
    if (!token) {
      navigate("/", { replace: true });
      return;
    }
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    setLoading(true);
    try {
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
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();

    try {
      await axios.patch(
        `/users/${id}`,
        {
          name: name,
          email: email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      console.error(err);
    }
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
        <div className="flex flex-col gap-6 flex-[2]">
          <div className="bg-neutral-800 p-6 rounded-lg border border-neutral-700 h-full min-h-[300px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white leading-none">
                Datos personales
              </h2>
              <div className="flex items-center gap-2">
                <span className="bg-indigo-500 text-white text-xs px-3 py-[1px] rounded-full font-semibold select-none">
                  {displayRole}
                </span>
                {averageRating && (
                  <div className="flex items-center gap-2">
                    <StarRating rating={averageRating} />
                    <span className="text-sm text-white font-semibold">
                      {averageRating} / 5
                    </span>
                  </div>
                )}
              </div>
            </div>

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
                  <p className="text-white text-lg">
                    {name || "[placeholder]"}
                  </p>
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
                  <>
                    <button
                      onClick={() => setEditMode(true)}
                      className="bg-violet-600 hover:bg-violet-800 px-3 py-1 rounded duration-200 inline-block"
                    >
                      Editar perfil
                    </button>
                    <button
                      onClick={handleDeleteProfile}
                      className="bg-red-600 hover:bg-red-800 px-3 py-1 rounded duration-200 inline-block ml-2"
                    >
                      Eliminar perfil
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {user?.role === "tutor" && (
            <div className="flex-[3]">
              <Reviews
                tutorId={user?.id}
                isOwner={isOwner}
                onAverageCalculated={(avg) => setAverageRating(avg)}
              />
            </div>
          )}
        </div>

        {user?.role === "tutor" && (
          <div className="flex-[3]">
            <ClasesTutor
              tutorId={user.id}
              user={loggedInUser}
              isOwner={isOwner}
            />
          </div>
        )}
      </div>
    </div>
  );
}
