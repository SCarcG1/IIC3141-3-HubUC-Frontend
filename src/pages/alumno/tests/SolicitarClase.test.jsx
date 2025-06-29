// src/components/common/__tests__/SolicitarClase.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SolicitarClase from '../SolicitarClase';
import { vi } from 'vitest';
import api from '../../../services/api';

vi.mock('../../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('SolicitarClase (componente reutilizable)', () => {
  const mockLesson = {
    id: 7,
    tutor_id: 1,
    course_id: 100,
  };

  const mockCache = {
    100: { name: 'Física' },
  };

  const mockBlocks = [
    {
      id: 1,
      weekday: 'Monday',
      start_hour: '09:00:00',
      end_hour: '10:00:00',
    },
  ];

  const mockOnSubmit = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'fake-token');

    api.get.mockResolvedValueOnce({ data: mockBlocks }); // blocks fetch
  });

  it('renderiza título y campos básicos', async () => {
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

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        `/weekly-timeblocks/${mockLesson.tutor_id}`,
        expect.objectContaining({
          headers: { Authorization: 'Bearer fake-token' },
          params: {},
        })
      );
    });
  });

  it('permite seleccionar fecha, bloque y enviar reserva', async () => {
    api.get.mockResolvedValueOnce({ data: mockBlocks }); // segunda llamada por cambio de fecha
    api.post.mockResolvedValueOnce({}); // reserva exitosa

    render(
      <SolicitarClase
        lesson={mockLesson}
        courseCache={mockCache}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const inputFecha = screen.getByLabelText(/Fecha/i);
    fireEvent.change(inputFecha, { target: { value: '2025-06-30' } });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        `/weekly-timeblocks/${mockLesson.tutor_id}`,
        expect.objectContaining({
          headers: { Authorization: 'Bearer fake-token' },
          params: { on_date: '2025-06-30' },
        })
      );
    });

    // Espera a que se rendericen los bloques
    await waitFor(() =>
      expect(screen.getByText(/Lunes de 09:00 a 10:00/)).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText(/Lunes de 09:00 a 10:00/));
    fireEvent.click(screen.getByText(/Confirmar/));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        expect.stringMatching(/\/reservations\/lesson\/7\?start_time=.*&end_time=.*/),
        null,
        expect.objectContaining({
          headers: { Authorization: 'Bearer fake-token' },
        })
      );

      expect(mockOnSubmit).toHaveBeenCalledWith(
        7,
        expect.stringMatching(/^2025-06-30T09:00:00$/)
      );
    });
  });

  it('muestra mensaje si no se selecciona bloque o fecha', () => {
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

    expect(window.alert).toHaveBeenCalledWith('Selecciona fecha y bloque');
    expect(api.post).not.toHaveBeenCalled();
  });

  it('permite cancelar la reserva', () => {
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
