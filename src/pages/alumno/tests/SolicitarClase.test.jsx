import { describe, it, vi, expect, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SolicitarClase from "../SolicitarClase";
import api from "../../../services/api";

// Mock del módulo api
vi.mock("../../../services/api", () => ({
  __esModule: true,
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

// Mock para useNavigate de react-router-dom para evitar errores en el test
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

describe("SolicitarClase (componente reutilizable)", () => {
  const mockLesson = {
    id: 7,
    tutor_id: 1,
    course_id: 100,
  };

  const mockCache = {
    100: { name: "Física" },
  };

  const mockBlocks = [
    {
      id: 1,
      weekday: "Monday",
      start_hour: "09:00:00",
      end_hour: "10:00:00",
    },
  ];

  const mockOnSubmit = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("token", "fake-token");
    localStorage.setItem("role", "student");

    // Primer fetch de bloques (fecha vacía no hace fetch)
    api.get.mockResolvedValue({ data: [] });
  });

  it("renderiza título y campos básicos", async () => {
    render(
      <SolicitarClase
        lesson={mockLesson}
        courseCache={mockCache}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText(/Solicitar clase de Física/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Fecha/i)).toBeInTheDocument();
  });

  it("permite seleccionar fecha, bloque y enviar reserva", async () => {
    // mock para cuando se pide bloques para la fecha
    api.get.mockResolvedValueOnce({ data: mockBlocks });
    api.post.mockResolvedValueOnce({}); // para la reserva exitosa

    render(
      <SolicitarClase
        lesson={mockLesson}
        courseCache={mockCache}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    // Cambiar fecha para disparar fetch de bloques
    const inputFecha = screen.getByLabelText(/Fecha/i);
    fireEvent.change(inputFecha, { target: { value: "2025-06-30" } });

    // Espera que api.get se llame con fecha y token
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        `/timeblocks/${mockLesson.tutor_id}?on_date=2025-06-30`,
        expect.objectContaining({
          headers: { Authorization: "Bearer fake-token" },
        })
      );
    });

    // Espera que renderice el bloque disponible
    await waitFor(() =>
      expect(screen.getByText(/Lunes de 09:00 a 10:00/)).toBeInTheDocument()
    );

    // Selecciona el bloque
    fireEvent.click(screen.getByText(/Lunes de 09:00 a 10:00/));

    // Confirma la reserva
    fireEvent.click(screen.getByText(/Confirmar/));

    // Espera que se haga post con la url correcta y que onSubmit se llame
    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
      expect(mockOnSubmit).toHaveBeenCalled();
    });

    // Opcional: Puedes verificar que onSubmit se llame con argumentos correctos
    const callArgs = mockOnSubmit.mock.calls[0];
    expect(callArgs[0]).toBe(mockLesson.id);
    expect(callArgs[1]).toMatch(/^2025-06-30T09:00:00/);
  });

  it("muestra alerta si no se selecciona bloque o fecha", () => {
    render(
      <SolicitarClase
        lesson={mockLesson}
        courseCache={mockCache}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    window.alert = vi.fn(); // mock alert

    fireEvent.click(screen.getByText(/Confirmar/));

    expect(window.alert).toHaveBeenCalledWith("Selecciona fecha y bloque");
    expect(api.post).not.toHaveBeenCalled();
  });

  it("permite cancelar la reserva", () => {
    render(
      <SolicitarClase
        lesson={mockLesson}
        courseCache={mockCache}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    fireEvent.click(screen.getByText(/Cancelar/));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
