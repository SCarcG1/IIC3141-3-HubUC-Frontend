
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Register from '../Register'
import { BrowserRouter } from 'react-router-dom'
import api from '../../../services/api'

vi.mock('../../../services/api')

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('Register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('muestra el formulario de registro correctamente', () => {
    renderWithRouter(<Register />)
    expect(screen.getByPlaceholderText(/nombre/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/correo/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('envía el formulario correctamente y muestra mensaje de éxito', async () => {
    api.post.mockResolvedValueOnce({})

    renderWithRouter(<Register />)

    fireEvent.change(screen.getByPlaceholderText(/nombre/i), {
      target: { value: 'Test User' },
    })
    fireEvent.change(screen.getByPlaceholderText(/correo/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText(/contraseña/i), {
      target: { value: '123456' },
    })

    fireEvent.click(screen.getByRole('button', { name: /registrarse/i }))

    await waitFor(() =>
      expect(screen.getByText(/registro exitoso/i)).toBeInTheDocument()
    )
  })

  it('muestra mensaje de error si falla el registro', async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { detail: 'Correo ya registrado' } },
    })

    renderWithRouter(<Register />)

    fireEvent.change(screen.getByPlaceholderText(/nombre/i), {
      target: { value: 'Test User' },
    })
    fireEvent.change(screen.getByPlaceholderText(/correo/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText(/contraseña/i), {
      target: { value: '123456' },
    })

    fireEvent.click(screen.getByRole('button', { name: /registrarse/i }))

    await waitFor(() =>
      expect(screen.getByText(/correo ya registrado/i)).toBeInTheDocument()
    )
  })
})
