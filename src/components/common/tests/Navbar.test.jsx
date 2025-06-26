// src/components/common/tests/Navbar.test.jsx
import { describe, it, vi, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "../Navbar";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Navbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("muestra el nombre y rol de tutor", () => {
    localStorage.setItem("user", JSON.stringify({ id: 1, role: "tutor" }));

    render(<Navbar />, { wrapper: MemoryRouter });

    expect(screen.getByText("TutorUC")).toBeInTheDocument();
    expect(screen.getByText("Tutor")).toBeInTheDocument();
    expect(screen.getByText("Panel Principal")).toBeInTheDocument();
    expect(screen.getByText("Perfil")).toBeInTheDocument();
    expect(screen.getByText("Cerrar sesión")).toBeInTheDocument();
  });

  it("redirige al dashboard de tutor al hacer clic en 'TutorUC' o 'Panel Principal'", () => {
    localStorage.setItem("user", JSON.stringify({ id: 1, role: "tutor" }));
    render(<Navbar />, { wrapper: MemoryRouter });

    fireEvent.click(screen.getByText("TutorUC"));
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/tutor");

    mockNavigate.mockClear();

    fireEvent.click(screen.getByText("Panel Principal"));
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/tutor");
  });

  it("redirige al dashboard de alumno si el rol es 'student'", () => {
    localStorage.setItem("user", JSON.stringify({ id: 2, role: "student" }));
    render(<Navbar />, { wrapper: MemoryRouter });

    fireEvent.click(screen.getByText("TutorUC"));
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/alumno");
  });

  it("redirige al perfil al hacer clic en 'Perfil'", () => {
    localStorage.setItem("user", JSON.stringify({ id: 123, role: "student" }));
    render(<Navbar />, { wrapper: MemoryRouter });

    const perfilLink = screen.getByText("Perfil");
    expect(perfilLink.closest("a")).toHaveAttribute("href", "/perfil/123");
  });

  it("cierra sesión correctamente", () => {
    localStorage.setItem("token", "fake-token");
    localStorage.setItem("user", JSON.stringify({ id: 1, role: "tutor" }));

    render(<Navbar />, { wrapper: MemoryRouter });

    fireEvent.click(screen.getByText("Cerrar sesión"));

    expect(localStorage.getItem("token")).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
