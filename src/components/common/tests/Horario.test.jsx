import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Horario from "../Horario";
import api from "../../../services/api";

// Mock API
vi.mock("../../../services/api", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockReservas = [
  {
    id: 1,
    start_time: new Date().setHours(8, 20, 0, 0), // hoy 08:20
    end_time: new Date().setHours(9, 40, 0, 0),    // hoy 09:40 (2 bloques)
    status: "accepted",
    private_lesson: {
      course: { name: "Matemáticas" },
      tutor: { name: "Carlos" },
    },
    student: { name: "Juan Pérez" },
  },
  {
    id: 2,
    start_time: new Date().setHours(12, 20, 0, 0),
    end_time: new Date().setHours(13, 30, 0, 0),
    status: "accepted",
    private_lesson: {
      course: { name: "Matemáticas" },
      tutor: { name: "Carlos" },
    },
    student: { name: "Juan Pérez" },
  },
];

describe("Horario", () => {
  beforeEach(async () => {
    api.get.mockResolvedValueOnce({ data: mockReservas });
    render(<Horario />);
    await waitFor(() => {
      expect(screen.getAllByText("Matemáticas").length).toBeGreaterThan(0);
    });
  });

  it("renderiza la tabla con días y horas correctamente", () => {
    expect(screen.getByText("Lunes")).toBeInTheDocument();
    expect(screen.getByText("Martes")).toBeInTheDocument();
    expect(screen.getByText("Domingo")).toBeInTheDocument();
    expect(screen.getByText("08:20")).toBeInTheDocument();
    expect(screen.getByText("20:10")).toBeInTheDocument();
  });

  it("muestra todas las instancias de una clase en distintos horarios", () => {
    const bloques = screen.getAllByText("Matemáticas");
    expect(bloques.length).toBe(2); // Dos clases en horarios distintos
  });

  it("abre el modal al hacer clic en un bloque y muestra su info", async () => {
    const bloque = screen.getAllByText("Matemáticas")[0];
    fireEvent.click(bloque);

    expect(await screen.findByRole("heading", { name: /matemáticas/i })).toBeInTheDocument();
    expect(screen.getByText(/hora:/i)).toBeInTheDocument();
    expect(screen.getByText(/día:/i)).toBeInTheDocument();
    expect(screen.getByText(/duración:/i)).toBeInTheDocument();
    expect(screen.getByText(/tutor:/i)).toBeInTheDocument();
    expect(screen.getByText(/estudiante:/i)).toBeInTheDocument();
  });

  it("cierra el modal al hacer clic en el botón cerrar", async () => {
    const bloque = screen.getAllByText("Matemáticas")[0];
    fireEvent.click(bloque);

    const cerrarBtn = await screen.findByRole("button", { name: /cerrar/i });
    fireEvent.click(cerrarBtn);

    await waitFor(() => {
      expect(screen.queryByRole("heading", { name: /matemáticas/i })).not.toBeInTheDocument();
    });
  });
});
