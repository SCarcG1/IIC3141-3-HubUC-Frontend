import { describe, it, vi, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

// Mock de navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock de API
const mockGet = vi.fn();
const mockPut = vi.fn();
vi.mock("../../../services/api", () => ({
  default: {
    get: mockGet,
    put: mockPut,
  },
}));

// Setup común
beforeEach(() => {
  mockNavigate.mockReset();
  mockGet.mockReset();
  mockPut.mockReset();
  localStorage.setItem("token", "mock-token");
});

describe("ClasesTutor", () => {
  const mockData = [
    {
      id: 5,
      status: "pending",
      start_time: new Date("2025-06-25T08:20:00").toISOString(),
      end_time: new Date("2025-06-25T09:40:00").toISOString(),
      private_lesson: {
        course: { name: "Álgebra Lineal" },
      },
      student: {
        name: "Juan Pérez",
      },
    },
  ];

  it("muestra correctamente una solicitud pendiente", async () => {
    mockGet.mockResolvedValueOnce({ data: mockData });
    const { default: ClasesTutor } = await import("../ClasesTutor");
    render(<ClasesTutor />);

    await waitFor(() => {
      expect(screen.getByText("Clase: Álgebra Lineal")).toBeInTheDocument();
      expect(screen.getByText("Nombre Estudiante: Juan Pérez")).toBeInTheDocument();
      expect(screen.getByText("Estado: Pendiente")).toBeInTheDocument();
    });
  });

  it("permite aceptar una solicitud", async () => {
    mockGet.mockResolvedValueOnce({ data: mockData });
    const { default: ClasesTutor } = await import("../ClasesTutor");
    render(<ClasesTutor />);

    const aceptarBtn = await screen.findByText("Aceptar");
    fireEvent.click(aceptarBtn);

    await waitFor(() =>
      expect(mockPut).toHaveBeenCalledWith(
        "/reservations/5",
        { status: "accepted" },
        { headers: { Authorization: "Bearer mock-token" } }
      )
    );
  });

  it("permite rechazar una solicitud", async () => {
    mockGet.mockResolvedValueOnce({ data: mockData });
    const { default: ClasesTutor } = await import("../ClasesTutor");
    render(<ClasesTutor />);

    const rechazarBtn = await screen.findByText("Rechazar");
    fireEvent.click(rechazarBtn);

    await waitFor(() =>
      expect(mockPut).toHaveBeenCalledWith(
        "/reservations/5",
        { status: "rejected" },
        { headers: { Authorization: "Bearer mock-token" } }
      )
    );
  });
});
