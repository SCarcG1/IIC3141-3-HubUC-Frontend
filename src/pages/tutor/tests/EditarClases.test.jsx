import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import EditarClase from '../EditarClase';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import api from '../../../services/api';

vi.mock('../../../services/api');

const renderWithRouter = (component, route = '/clases/1/editar') => {
  window.history.pushState({}, 'Test page', route);
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/clases/:id/editar" element={component} />
      </Routes>
    </BrowserRouter>
  );
};

describe('EditarClase', () => {
  const mockClase = {
    id: 1,
    description: 'Clase de prueba',
    price: 10000,
  };

  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.setItem('token', 'fake-token');
  });

  it('muestra el formulario con los datos de la clase', async () => {
    api.get.mockResolvedValueOnce({ data: mockClase });

    renderWithRouter(<EditarClase />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Clase de prueba')).toBeInTheDocument();
      expect(screen.getByDisplayValue('10000')).toBeInTheDocument();
    });
  });

  it('permite editar y enviar el formulario', async () => {
    api.get.mockResolvedValueOnce({ data: mockClase });
    api.patch.mockResolvedValueOnce({});

    renderWithRouter(<EditarClase />);

    await waitFor(() => screen.getByDisplayValue('Clase de prueba'));

    fireEvent.change(screen.getByLabelText(/descripción/i), {
      target: { value: 'Nueva descripcion' },
    });
    fireEvent.change(screen.getByLabelText(/precio/i), {
      target: { value: '12000' },
    });

    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith(
        '/private-lessons/1',
        {
          description: 'Nueva descripcion',
          price: 12000,
        },
        expect.objectContaining({ headers: expect.any(Object) })
      );
    });
  });

  it('muestra error si la petición de actualización falla', async () => {
    api.get.mockResolvedValueOnce({ data: mockClase });
    api.patch.mockRejectedValueOnce(new Error('fail'));

    renderWithRouter(<EditarClase />);

    await waitFor(() => screen.getByDisplayValue('Clase de prueba'));

    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(screen.getByText(/error al actualizar clase/i)).toBeInTheDocument();
    });
  });
});
