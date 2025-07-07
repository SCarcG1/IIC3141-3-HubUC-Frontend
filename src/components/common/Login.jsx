import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useNavigate, useParams } from "react-router-dom";

export default function Login() {
  const { role } = useParams();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    number: "",
    password: "",
    role: role === "tutor" ? "tutor" : "student",
  });
  const [message, setMessage] = useState(null);
  const [numberError, setNumberError] = useState("");

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setForm({ ...form, name: "" });
    setMessage(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "number") {
      const cleaned = value.trim();
      if (cleaned && !/^\+569\d{8}$/.test(cleaned)) {
        setNumberError(
          "El número debe comenzar con +569 y tener 12 caracteres en total."
        );
      } else {
        setNumberError("");
      }
    }
    setForm({ ...form, [name]: value });
  };

  const handleLogin = async (email, password) => {
    const res = await api.post("/login", { email, password });
    const token = res.data.access_token;
    const role = res.data.user.role;

    if (!token) throw new Error("No se recibió token");

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    localStorage.setItem("role", role);

    setMessage("✅ Ingreso exitoso.");
    if (role === "tutor") {
      navigate("/dashboard/tutor");
    } else if (role === "student") {
      navigate("/dashboard/alumno");
    } else {
      navigate("/");
    }
  };

  const handleRegister = async (form) => {
    await api.post("/register", form);
    await handleLogin(form.email, form.password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!isLogin && numberError) {
      setMessage("❌ Corrige el número de teléfono.");
      return;
    }

    try {
      if (isLogin) {
        await handleLogin(form.email, form.password);
      } else {
        await handleRegister(form);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setMessage("❌ Correo o contraseña incorrectos.");
      } else {
        setMessage("❌ Error inesperado. Intente nuevamente.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 bg-neutral-950 min-h-screen justify-center p-8 text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-neutral-800 p-6 rounded-xl flex flex-col gap-4 w-full max-w-sm"
      >
        <h2 className="text-xl font-semibold text-center mb-2">
          {isLogin ? "Ingreso" : "Registro"}
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

        {!isLogin && (
          <>
            <input
              type="text"
              name="number"
              className="bg-neutral-900 border border-neutral-600 rounded px-3 py-2 text-white w-full text-base"
              value={form.number}
              onChange={handleChange}
              placeholder="Teléfono (Ej: +56912345678)"
            />
            {numberError && (
              <p className="text-red-500 text-sm mt-1">{numberError}</p>
            )}
          </>
        )}

        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          className="p-2 rounded bg-neutral-900 text-white border border-neutral-600"
          required
        />

        {!isLogin && <input type="hidden" name="role" value={role} />}

        <button
          type="submit"
          className="bg-violet-600 hover:bg-violet-800 py-2 rounded text-white font-semibold"
        >
          {isLogin ? "Ingresar" : "Registrarse"}
        </button>

        {message && <p className="text-sm text-center mt-2">{message}</p>}

        <button
          type="button"
          onClick={handleToggle}
          className="text-sm text-violet-300 hover:underline"
        >
          {isLogin
            ? "¿No tienes cuenta? Regístrate aquí"
            : "¿Ya tienes cuenta? Inicia sesión"}
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
