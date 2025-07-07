import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Horario from "../Horario";
import api from "../../../services/api";

vi.mock("../../../services/api", () => {
  return {
    __esModule: true,
    default: {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
      patch: vi.fn(),
    },
  };
});

describe("Horario", () => {
  const user = { id: 10, role: "tutor", name: "Tutor Test" };
  const token = "mock-token";

  const mockReservations = [
    {
      id: 1,
      status: "accepted",
      start_time: new Date().setHours(9, 40, 0, 0), // hoy 09:40
      end_time: new Date().setHours(11, 0, 0, 0), // hoy 11:00
      private_lesson: {
        course: { name: "Programación" },
        tutor: { id: 10, name: "Tutor Test" },
      },
      student: { id: 20, name: "Alumno Test" },
    },
  ];

  beforeEach(() => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    api.get.mockReset();
  });

  it("muestra la tabla y abre modal con info de clase", async () => {
    api.get.mockResolvedValueOnce({ data: mockReservations });

    render(
      <MemoryRouter>
        <Horario user={user} />
      </MemoryRouter>
    );

    // Esperar que el curso aparezca en la tabla
    await waitFor(() => {
      expect(screen.getByText("Programación")).toBeInTheDocument();
    });

    // Hacer click en el bloque para abrir modal
    fireEvent.click(screen.getByText("Programación"));

    // Comprobar que modal aparece con info
    const matches = screen.getAllByText("Programación");
    expect(matches.length).toBe(2);
    expect(screen.getByText(/Hora:/)).toBeInTheDocument();
    expect(screen.getByText(/Día:/)).toBeInTheDocument();
    expect(screen.getByText(/Duración:/)).toBeInTheDocument();

    // Cerrar modal
    fireEvent.click(screen.getByText("Cerrar"));

    // Modal ya no debería estar visible
    await waitFor(() => {
      expect(screen.queryByText("Cerrar")).not.toBeInTheDocument();
    });
  });
});
