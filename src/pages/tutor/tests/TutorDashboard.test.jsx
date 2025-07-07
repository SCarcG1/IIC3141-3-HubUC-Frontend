import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TutorDashboard from "../TutorDashboard";

// Mock del componente Dashboard
vi.mock("../../../components/common/Dashboard", () => ({
  default: ({
    roleCheck,
    apiEndpoint,
    linkSolicitudes,
    mostrarSoloClasesAceptadas,
    acciones,
  }) => (
    <div data-testid="dashboard-mock">
      <p>Role: {roleCheck}</p>
      <p>Endpoint: {apiEndpoint}</p>
      <p>Solicitudes: {linkSolicitudes}</p>
      <p>Solo aceptadas: {mostrarSoloClasesAceptadas ? "Sí" : "No"}</p>
      <p>Acción: {acciones?.[0]?.title}</p>
      <p>Primer link: {acciones?.[0]?.links?.[0]?.label}</p>
    </div>
  ),
}));

describe("TutorDashboard", () => {
  it("renderiza Dashboard con las props esperadas", () => {
    render(
      <MemoryRouter>
        <TutorDashboard />
      </MemoryRouter>
    );

    expect(screen.getByTestId("dashboard-mock")).toBeInTheDocument();
    expect(screen.getByText("Role: tutor")).toBeInTheDocument();
    expect(
      screen.getByText("Endpoint: /reservations/tutor")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Solicitudes: /solicitudes/tutor")
    ).toBeInTheDocument();
    expect(screen.getByText("Solo aceptadas: No")).toBeInTheDocument();
    expect(screen.getByText("Acción: Mis clases")).toBeInTheDocument();
    expect(screen.getByText("Primer link: Ver clases")).toBeInTheDocument();
  });
});
