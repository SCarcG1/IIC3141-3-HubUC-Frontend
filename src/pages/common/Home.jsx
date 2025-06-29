import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-6 bg-neutral-950 min-h-screen justify-center p-8">
      <h1 className="text-3xl font-bold text-violet-50">
        Bienvenido a Teacher<span className="text-violet-600">UC</span>
      </h1>

      <p className="text-center max-w-md text-violet-50">
        Conecta estudiantes con tutores de forma rápida y segura.
      </p>

      <div className="flex flex-col items-center gap-6 mt-8 w-full max-w-xs">
        <Link
          to="/ingresar/alumno"
          className="bg-violet-600 hover:bg-violet-800 text-white shadow-lg shadow-violet-600/30 px-6 py-3 duration-200 rounded-xl text-center w-full"
        >
          Ingresar como Alumno
        </Link>

        <Link
          to="/ingresar/tutor"
          className="bg-white hover:bg-violet-300 hover:text-white shadow-lg shadow-violet-600/30 text-violet-600 duration-200 px-6 py-3 rounded-xl text-center w-full"
        >
          Ingresar como Tutor
        </Link>
      </div>
    </div>
  );
}
