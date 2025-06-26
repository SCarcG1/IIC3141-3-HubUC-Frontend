// src/pages/tutor/tests/NuevoHorario.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CrearHorario from '../NuevoHorario';
import { vi } from 'vitest';
import api from '../../../services/api';

const mockNavigate = vi.fn();

vi.mock('../../../services/api', () => ({
  default: {
    post: vi.fn(),
  }
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('CrearHorario', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    vi.clearAllMocks();
  });

  it('renderiza título y campos de fechas', () => {
    render(<CrearHorario />, { wrapper: MemoryRouter });

    expect(screen.getByText('Crear horarios disponibles')).toBeInTheDocument();
    expect(screen.getByLabelText(/Vigente desde/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Vigente hasta/i)).toBeInTheDocument();
    expect(screen.getByText('Publicar horarios')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  it('permite seleccionar bloques y se marcan con ✓', () => {
    render(<CrearHorario />, { wrapper: MemoryRouter });

    const bloques = screen.getAllByText('-', { selector: 'td' });
    const primerBloque = bloques[0]; // primer horario disponible
    fireEvent.click(primerBloque);

    expect(primerBloque.textContent).toBe('✓');
  });

  it('envía bloques seleccionados al backend al hacer submit', async () => {
    render(<CrearHorario />, { wrapper: MemoryRouter });

    const desdeInput = screen.getByLabelText(/Vigente desde/i);
    const hastaInput = screen.getByLabelText(/Vigente hasta/i);
    fireEvent.change(desdeInput, { target: { value: '2025-06-10' } });
    fireEvent.change(hastaInput, { target: { value: '2025-06-15' } });

    const bloques = screen.getAllByText('-', { selector: 'td' });
    const primerBloque = bloques[0];
    fireEvent.click(primerBloque);

    const btnSubmit = screen.getByRole('button', { name: /publicar horarios/i });
    fireEvent.click(btnSubmit);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledTimes(1);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/horarios');
  });

  it('navega al cancelar sin enviar datos', () => {
    render(<CrearHorario />, { wrapper: MemoryRouter });

    const btn = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(btn);

    expect(mockNavigate).toHaveBeenCalledWith('/horarios');
  });
});
