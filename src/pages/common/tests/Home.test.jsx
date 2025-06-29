import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Home from '../Home'

describe('Home', () => {
  it('renderiza el título principal', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )
    expect(screen.getByText(/bienvenido a teacher/i)).toBeInTheDocument()
  })

  it('renderiza el subtítulo', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )
    expect(screen.getByText(/conecta estudiantes/i)).toBeInTheDocument()
  })

  it('tiene un botón para ingresar como alumno', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )
    expect(screen.getByRole('link', { name: /ingresar como alumno/i })).toBeInTheDocument()
  })

  it('tiene un botón para ingresar como tutor', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )
    expect(screen.getByRole('link', { name: /ingresar como tutor/i })).toBeInTheDocument()
  })
})