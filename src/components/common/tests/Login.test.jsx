import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Login from "../Login";
import api from "../../../services/api";

// Mock de módulos
vi.mock("../../../services/api");
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ role: "student" }),
  };
});

describe("Login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const setup = () =>
    render(
      <MemoryRouter initialEntries={["/ingresar/student"]}>
        <Routes>
          <Route path="/ingresar/:role" element={<Login />} />
        </Routes>
      </MemoryRouter>
    );

  it("renderiza el formulario de login por defecto", () => {
    setup();
    expect(screen.getByText("Ingreso")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Correo")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Contraseña")).toBeInTheDocument();
  });

  it("permite alternar entre login y registro", () => {
    setup();
    fireEvent.click(screen.getByText("¿No tienes cuenta? Regístrate aquí"));
    expect(screen.getByText("Registro")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Nombre")).toBeInTheDocument();
  });

  it("realiza login exitoso", async () => {
    const mockUser = {
      id: 1,
      name: "Juan",
      role: "student",
    };

    api.post.mockResolvedValueOnce({
      data: {
        access_token: "fake-token",
        user: mockUser,
      },
    });

    setup();

    fireEvent.change(screen.getByPlaceholderText("Correo"), {
      target: { value: "juan@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Contraseña"), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByText("Ingresar"));

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe("fake-token");
      expect(JSON.parse(localStorage.getItem("user"))).toEqual(mockUser);
      expect(localStorage.getItem("role")).toBe("student");
    });
  });

  it("muestra mensaje de error si login falla", async () => {
    api.post.mockRejectedValueOnce({ response: { status: 401 } });

    setup();

    fireEvent.change(screen.getByPlaceholderText("Correo"), {
      target: { value: "error@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Contraseña"), {
      target: { value: "wrong" },
    });

    fireEvent.click(screen.getByText("Ingresar"));

    await waitFor(() => {
      expect(
        screen.getByText("❌ Correo o contraseña incorrectos.")
      ).toBeInTheDocument();
    });
  });
});
