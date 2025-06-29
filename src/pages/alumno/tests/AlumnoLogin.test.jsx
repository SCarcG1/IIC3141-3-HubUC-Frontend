import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AlumnoLogin from "../AlumnoLogin";
import * as apiModule from "../../../services/api";
import { BrowserRouter } from "react-router-dom";

vi.mock("../../../services/api", () => ({
  default: {
    post: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("AlumnoLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra los campos de login por defecto", () => {
    render(<AlumnoLogin />, { wrapper: MemoryRouter });
    expect(screen.getByPlaceholderText(/correo/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/contraseña/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /ingresar/i })
    ).toBeInTheDocument();
  });

  it("muestra los campos de registro al hacer toggle", () => {
    render(<AlumnoLogin />, { wrapper: MemoryRouter });
    fireEvent.click(screen.getByRole("button", { name: /¿no tienes cuenta/i }));
    expect(screen.getByPlaceholderText(/nombre/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /registrarse/i })
    ).toBeInTheDocument();
  });

  it("realiza login correctamente y redirige", async () => {
    apiModule.default.post.mockResolvedValue({ data: {} });
    render(<AlumnoLogin />, { wrapper: BrowserRouter });
    fireEvent.change(screen.getByPlaceholderText(/correo/i), {
      target: { value: "test@uc.cl" },
    });
    fireEvent.change(screen.getByPlaceholderText(/contraseña/i), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /ingresar/i }));
    await screen.findByText(/ingreso exitoso/i);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/alumno");
  });
});
