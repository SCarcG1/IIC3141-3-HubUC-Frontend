import { describe, it, vi, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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

import api from "../../../services/api";

beforeEach(() => {
  mockNavigate.mockReset();
  vi.clearAllMocks();
  localStorage.setItem("token", "mock-token");
  localStorage.setItem("role", "tutor");
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
        id: 42,
      },
      private_lesson_id: 123,
      student_id: 42,
    },
  ];

  it("muestra correctamente una solicitud pendiente", async () => {
    api.get.mockResolvedValueOnce({ data: mockData });
    const { default: ClasesTutor } = await import("../ClasesTutor");
    render(<ClasesTutor />);

    await waitFor(() => {
      expect(screen.getByText("Clase: Álgebra Lineal")).toBeInTheDocument();
      expect(
        screen.getByText("Nombre Estudiante: Juan Pérez")
      ).toBeInTheDocument();
      expect(screen.getByText("Estado: Pendiente")).toBeInTheDocument();
    });
  });

  it("permite aceptar una solicitud", async () => {
    api.get.mockResolvedValueOnce({ data: mockData });
    api.patch.mockResolvedValueOnce({}); // patch para aceptar
    api.patch.mockResolvedValue({}); // patch para posibles rechazos posteriores

    const { default: ClasesTutor } = await import("../ClasesTutor");
    render(<ClasesTutor />);

    const aceptarBtn = await screen.findByText("Aceptar");
    fireEvent.click(aceptarBtn);

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith(
        `/reservations/tutor/5`,
        {
          private_lesson_id: 123,
          student_id: 42,
          status: "accepted",
        },
        {
          headers: { Authorization: "Bearer mock-token" },
        }
      );
    });
  });

  it("permite rechazar una solicitud", async () => {
    api.get.mockResolvedValueOnce({ data: mockData });
    api.patch.mockResolvedValueOnce({}); // patch para rechazar

    const { default: ClasesTutor } = await import("../ClasesTutor");
    render(<ClasesTutor />);

    const rechazarBtn = await screen.findByText("Rechazar");
    fireEvent.click(rechazarBtn);

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith(
        `/reservations/tutor/5`,
        {
          private_lesson_id: 123,
          student_id: 42,
          status: "rejected",
        },
        {
          headers: { Authorization: "Bearer mock-token" },
        }
      );
    });
  });
});
