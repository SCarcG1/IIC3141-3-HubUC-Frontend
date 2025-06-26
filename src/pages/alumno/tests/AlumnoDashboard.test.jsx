import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import AlumnoDashboard from "../AlumnoDashboard";
import { MemoryRouter } from "react-router-dom";
import api from "../../../services/api";

// Mock del módulo API
vi.mock("../../../services/api");

// Mock del componente Horario
vi.mock("../../../components/common/Horario", () => ({
  default: () => <div data-testid="horario-mock">[Horario]</div>,
}));

describe("AlumnoDashboard", () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 20); // hoy a las 08:20
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0); // mañana a las 10:00

  const mockClases = [
    {
      id: 1,
      status: "accepted",
      start_time: today.toISOString(),
      end_time: new Date(today.getTime() + 80 * 60000).toISOString(),
      private_lesson: {
        course: { name: "Álgebra Lineal" },
        tutor: { name: "Tutor X" },
      },
      student: { name: "Alumno" },
    },
    {
      id: 2,
      status: "accepted",
      start_time: tomorrow.toISOString(),
      end_time: new Date(tomorrow.getTime() + 80 * 60000).toISOString(),
      private_lesson: {
        course: { name: "Cálculo I" },
        tutor: { name: "Tutor Y" },
      },
      student: { name: "Alumno" },
    },
    {
      id: 3,
      status: "pending",
      start_time: tomorrow.toISOString(),
      end_time: new Date(tomorrow.getTime() + 80 * 60000).toISOString(),
      private_lesson: {
        course: { name: "Física" },
        tutor: { name: "Tutor Z" },
      },
      student: { name: "Alumno" },
    },
  ];

  beforeEach(() => {
    localStorage.setItem("token", "mock-token");
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("muestra cantidad de solicitudes pendientes", async () => {
    api.get.mockResolvedValueOnce({ data: mockClases });

    render(
      <MemoryRouter>
        <AlumnoDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      const count = screen.getByTestId("solicitudes-pendientes-count");
      expect(count.textContent).toBe("1"); // sólo 1 pendiente
    });
  });

  it("muestra correctamente clases de hoy y próxima clase", async () => {
    api.get.mockResolvedValueOnce({ data: mockClases });

    render(
      <MemoryRouter>
        <AlumnoDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("clases-hoy-count").textContent).toBe("1");
      expect(screen.getByTestId("proxima-clase-info").textContent).toMatch(/Cálculo I/i);
    });
  });

  it("muestra el componente Horario", async () => {
    api.get.mockResolvedValueOnce({ data: mockClases });

    render(
      <MemoryRouter>
        <AlumnoDashboard />
      </MemoryRouter>
    );

    expect(await screen.findByTestId("horario-mock")).toBeInTheDocument();
  });
});
