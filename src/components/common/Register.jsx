import React, { useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    role: 'student',
  });

  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      await api.post('/register', form);
      setMessage('✅ Registro exitoso');
      setTimeout(() => {
        navigate('/clases');
      }, 1000);
    } catch (err) {
      const detail = err.response?.data?.detail || 'Error al registrar';
      setMessage(`❌ ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Registro</h2>

      {message && (
        <p className={`text-sm mb-4 ${message.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="name"
          placeholder="Nombre"
          value={form.name}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Correo"
          value={form.email}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="student">Estudiante</option>
          <option value="tutor">Tutor</option>
          <option value="admin">Administrador</option>
        </select>

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Registrarse
        </button>
      </form>
    </div>
  );
}
