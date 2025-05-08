import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function TutorLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'tutor',
  });
  const [message, setMessage] = useState(null);

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setForm({ ...form, name: '' });
    setMessage(null);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const endpoint = isLogin ? '/login' : '/register';
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : form;

      const res = await api.post(endpoint, payload);
      setMessage(`✅ ${isLogin ? 'Ingreso' : 'Registro'} exitoso`);
    } catch (err) {
      const detail = err.response?.data?.detail || 'Error inesperado';
      setMessage(`❌ ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 bg-neutral-950 min-h-screen justify-center p-8 text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-neutral-800 p-6 rounded-xl flex flex-col gap-4 w-full max-w-sm"
      >
        <h2 className="text-xl font-semibold text-center mb-2">
          {isLogin ? 'Ingreso Tutor' : 'Registro Tutor'}
        </h2>

        {!isLogin && (
          <input
            type="text"
            name="name"
            placeholder="Nombre"
            value={form.name}
            onChange={handleChange}
            className="p-2 rounded bg-neutral-900 text-white border border-neutral-600"
            required
          />
        )}

        <input
          type="email"
          name="email"
          placeholder="Correo"
          value={form.email}
          onChange={handleChange}
          className="p-2 rounded bg-neutral-900 text-white border border-neutral-600"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          className="p-2 rounded bg-neutral-900 text-white border border-neutral-600"
          required
        />

        {!isLogin && (
          <input type="hidden" name="role" value="tutor" />
        )}

        <button
          type="submit"
          className="bg-violet-600 hover:bg-violet-700 py-2 rounded text-white font-semibold"
        >
          {isLogin ? 'Ingresar' : 'Registrarse'}
        </button>

        {message && <p className="text-sm text-center mt-2">{message}</p>}

        <button
          type="button"
          onClick={handleToggle}
          className="text-sm text-violet-300 hover:underline"
        >
          {isLogin
            ? '¿No tienes cuenta? Regístrate aquí'
            : '¿Ya tienes cuenta? Inicia sesión'}
        </button>

        <Link
          to="/"
          className="text-sm text-center text-neutral-400 hover:text-white mt-4"
        >
          ← Volver al inicio
        </Link>
      </form>
    </div>
  );
}
