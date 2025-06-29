import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import TutorDashboard from "../TutorDashboard";
import { BrowserRouter } from "react-router-dom";
import api from "../../../services/api";

// Mock de la API
vi.mock("../../../services/api");

// Mock liviano del componente Horario, solo para evitar fallos en tests
vi.mock("../../../components/common/Horario", () => ({
  default: () => <div data-testid="horario-mock">[Horario]</div>,
}));

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("TutorDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSolicitudes = [
    { id: 1, private_lesson_id: 101, student_id: 501, status: "pending" },
    { id: 2, private_lesson_id: 102, student_id: 502, status: "accepted" },
  ];

  it("renderiza el panel principal y muestra textos estáticos", async () => {
    api.get.mockResolvedValueOnce({ data: [] });

    renderWithRouter(<TutorDashboard />);

    expect(await screen.findByText(/Panel Principal/i)).toBeInTheDocument();
    expect(screen.getByText(/Mis clases/i)).toBeInTheDocument();
    expect(screen.getByText(/Clases de hoy/i)).toBeInTheDocument();
    expect(screen.getByText(/Próxima clase/i)).toBeInTheDocument();
    expect(screen.getByText(/Solicitudes pendientes/i)).toBeInTheDocument();
    expect(screen.getByTestId("horario-mock")).toBeInTheDocument();
  });

  it("muestra mensaje de carga mientras se obtienen solicitudes", async () => {
    api.get.mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve({ data: [] }), 100))
    );

    renderWithRouter(<TutorDashboard />);
    expect(screen.getByText(/Cargando solicitudes.../i)).toBeInTheDocument();

    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(1));
  });

  it("muestra mensaje cuando no hay solicitudes", async () => {
    api.get.mockResolvedValueOnce({ data: [] });

    renderWithRouter(<TutorDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/No hay solicitudes aún./i)).toBeInTheDocument();
    });
  });

  it("muestra botón para ver solicitudes cuando hay solicitudes", async () => {
    api.get.mockResolvedValueOnce({ data: mockSolicitudes });

    renderWithRouter(<TutorDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Ver solicitudes/i)).toBeInTheDocument();
      expect(
        screen.queryByText(/No hay solicitudes aún./i)
      ).not.toBeInTheDocument();
    });
  });
});
