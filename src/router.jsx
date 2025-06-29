import React from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import AppProtected from "./AppProtected";
import Home from "./pages/common/Home";
import AlumnoLogin from "./pages/alumno/AlumnoLogin";
import TutorLogin from "./pages/tutor/TutorLogin";
import Register from "./components/common/Register";
import Clases from "./pages/alumno/Clases";
import Perfil from "./pages/common/Perfil";
import TutorDashboard from "./pages/tutor/TutorDashboard";
import AlumnoDashboard from "./pages/alumno/AlumnoDashboard";
import ClasesTutor from "./pages/tutor/ClasesTutor";
import AlumnoSolicitudes from "./pages/alumno/AlumnoSolicitudes";
import Horarios from "./pages/tutor/HorariosTutor";
import NuevoHorario from "./pages/tutor/NuevoHorario";
import MisClases from "./pages/tutor/MisClases";
import EditarClase from "./pages/tutor/EditarClase";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "ingresar/alumno", element: <AlumnoLogin /> },
      { path: "ingresar/tutor", element: <TutorLogin /> },
      { path: "register", element: <Register /> },
    ],
  },
  {
    path: "/",
    element: <AppProtected />,
    children: [
      { path: "clases", element: <Clases /> },
      { path: "perfil/:id", element: <Perfil /> },
      { path: "dashboard/tutor", element: <TutorDashboard /> },
      { path: "dashboard/alumno", element: <AlumnoDashboard /> },
      { path: "solicitudes/tutor", element: <ClasesTutor /> },
      { path: "solicitudes/alumno", element: <AlumnoSolicitudes /> },
      { path: "horarios", element: <Horarios /> },
      { path: "horarios/nuevo", element: <NuevoHorario /> },
      { path: "mis-clases", element: <MisClases /> },
      { path: "/clases/:id/editar", element: <EditarClase /> }, // Ruta para editar una clase específica
    ],
  },
]);
