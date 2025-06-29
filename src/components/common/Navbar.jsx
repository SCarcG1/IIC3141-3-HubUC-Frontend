import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const role =
    user.role === "tutor"
      ? "Tutor"
      : user.role === "student"
      ? "Alumno"
      : "Invitado";

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleClick = () => {
    if (user.role === "tutor") {
      navigate("/dashboard/tutor");
    } else {
      navigate("/dashboard/alumno");
    }
  };

  return (
    <nav className="bg-neutral-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <div className="flex items-center gap-4">
        <div
          className="text-2xl font-bold cursor-pointer"
          onClick={() => handleClick()}
        >
          TutorUC
        </div>
        <div className="text-xl">{role}</div>
      </div>

      <div className="flex gap-4 items-center">
        <button
          onClick={handleClick}
          className="hover:text-violet-400 transition duration-200"
        >
          Panel Principal
        </button>

        <Link
          to={`/perfil/${user.id}`}
          className="hover:text-violet-400 transition duration-200"
        >
          Perfil
        </Link>

        <button
          onClick={handleLogout}
          className="bg-violet-600 hover:bg-violet-800 px-3 py-1 rounded text-white transition duration-200"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
