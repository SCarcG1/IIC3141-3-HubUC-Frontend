import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="bg-neutral-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <div
        className="text-2xl font-bold cursor-pointer"
        onClick={() => navigate("/")}
      >
        TutorUC
      </div>

      <div className="flex gap-4 items-center">
        <Link
          to="/dashboard/tutor"
          className="hover:text-violet-400 transition duration-200"
        >
          Dashboard
        </Link>
        <Link
          to="/solicitudes"
          className="hover:text-violet-400 transition duration-200"
        >
          Solicitudes
        </Link>
        <Link
          to="/perfil"
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
