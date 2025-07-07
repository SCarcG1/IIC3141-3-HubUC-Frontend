import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AlumnoSolicitudes from "../AlumnoSolicitudes";
import api from "../../../services/api";
import { vi, describe, it, beforeEach, afterEach, expect } from "vitest";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../../services/api", () => ({
  __esModule: true,
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

describe("AlumnoSolicitudes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("token", "fake-token");
    localStorage.setItem("role", "student");
  });

  afterEach(() => {
    localStorage.clear();
  });

  const mockData = [
    {
      id: 1,
      status: "pending",
      start_time: "2025-06-30T09:00:00Z",
      end_time: "2025-06-30T10:00:00Z",
      private_lesson: {
        course: { name: "Matemáticas" },
        tutor: { name: "Profesor Uno", id: 11 },
      },
    },
    {
      id: 2,
      status: "accepted",
      start_time: "2025-07-01T11:00:00Z",
      end_time: "2025-07-01T12:00:00Z",
      private_lesson: {
        course: { name: "Física" },
        tutor: { name: "Profesor Dos", id: 22 },
      },
    },
    {
      id: 3,
      status: "rejected",
      start_time: "2025-07-02T13:00:00Z",
      end_time: "2025-07-02T14:00:00Z",
      private_lesson: {
        course: { name: "Química" },
        tutor: { name: "Profesor Tres", id: 33 },
      },
    },
  ];

  it("renderiza título y botón de volver", async () => {
    api.get.mockResolvedValueOnce({ data: [] });

    render(<AlumnoSolicitudes />, { wrapper: MemoryRouter });

    expect(screen.getByText("Mis solicitudes de clase")).toBeInTheDocument();
    expect(screen.getByText("← Volver")).toBeInTheDocument();
  });

  it("muestra mensaje de carga inicial", async () => {
    api.get.mockResolvedValueOnce({ data: [] });

    render(<AlumnoSolicitudes />, { wrapper: MemoryRouter });

    expect(screen.getByText(/Cargando solicitudes/i)).toBeInTheDocument();
    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(1));
  });

  it("muestra mensaje si no hay solicitudes", async () => {
    api.get.mockResolvedValueOnce({ data: [] });

    render(<AlumnoSolicitudes />, { wrapper: MemoryRouter });

    await waitFor(() =>
      expect(screen.getByText(/No tienes solicitudes aún/i)).toBeInTheDocument()
    );
  });

  it("muestra solicitudes separadas por estado", async () => {
    api.get.mockResolvedValueOnce({ data: mockData });

    render(<AlumnoSolicitudes />, { wrapper: MemoryRouter });

    await waitFor(() => {
      expect(screen.getByText("Pendientes")).toBeInTheDocument();
      expect(screen.getByText("Aceptadas")).toBeInTheDocument();
      expect(screen.getByText("Rechazadas")).toBeInTheDocument();

      expect(screen.getByText(/Matemáticas/)).toBeInTheDocument();
      expect(screen.getByText(/Física/)).toBeInTheDocument();
      expect(screen.getByText(/Química/)).toBeInTheDocument();

      expect(
        screen.getAllByText(/Ver perfil tutor/).length
      ).toBeGreaterThanOrEqual(3);
    });
  });
});
