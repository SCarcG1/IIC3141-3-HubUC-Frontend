import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AlumnoDashboard from "../AlumnoDashboard";
import { MemoryRouter } from "react-router-dom";

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
    </div>
  ),
}));

describe("AlumnoDashboard", () => {
  it("renderiza Dashboard con las props esperadas", () => {
    render(
      <MemoryRouter>
        <AlumnoDashboard />
      </MemoryRouter>
    );

    expect(screen.getByTestId("dashboard-mock")).toBeInTheDocument();
    expect(screen.getByText("Role: student")).toBeInTheDocument();
    expect(
      screen.getByText("Endpoint: /reservations/student")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Solicitudes: /solicitudes/alumno")
    ).toBeInTheDocument();
    expect(screen.getByText("Solo aceptadas: Sí")).toBeInTheDocument();
    expect(screen.getByText("Acción: Buscar clases")).toBeInTheDocument();
  });
});
