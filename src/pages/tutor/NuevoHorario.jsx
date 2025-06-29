import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const WEEKDAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const HORAS = [
  '08:20', '09:40', '11:00', '12:20',
  '13:30', '14:50', '16:10', '17:30',
  '18:50', '20:10',
];

// Función para sumar 1h 10min a un string "HH:MM"
const sumarHora = (horaStr) => {
  const [h, m] = horaStr.split(':').map(Number);
  const date = new Date(0, 0, 0, h, m + 70); // + 70 min
  const hh = date.getHours().toString().padStart(2, '0');
  const mm = date.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
};

export default function CrearHorario() {
  const navigate = useNavigate();
  const [selectedBlocks, setSelectedBlocks] = useState([]); // [{weekday, hora}]
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');

  const toggleBlock = (day, hora) => {
    const exists = selectedBlocks.find(
      (b) => b.weekday === day && b.hora === hora
    );
    if (exists) {
      setSelectedBlocks(selectedBlocks.filter(
        (b) => !(b.weekday === day && b.hora === hora)
      ));
    } else {
      setSelectedBlocks([...selectedBlocks, { weekday: day, hora }]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toNaiveDateTime = (dateStr) => {
      return new Date(dateStr).toISOString().split('.')[0];
    };
    const valid_from_naive = toNaiveDateTime(validFrom);
    const valid_until_naive = toNaiveDateTime(validUntil);
    const token = localStorage.getItem('token');

    try {
      for (const b of selectedBlocks) {
        const payload = {
          weekday: {
            Lunes: 'Monday',
            Martes: 'Tuesday',
            Miércoles: 'Wednesday',
            Jueves: 'Thursday',
            Viernes: 'Friday',
            Sábado: 'Saturday',
            Domingo: 'Sunday',
          }[b.weekday],
          start_hour: `${b.hora}:00`,                    // HH:MM:00
          end_hour: `${sumarHora(b.hora)}:00`,           // HH:MM + 1h10m
          valid_from: valid_from_naive,
          valid_until: valid_until_naive,
        };
        await api.post('/weekly-timeblocks', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      navigate('/horarios');
    } catch (err) {
      console.error('Error al crear horarios:', err);
      alert('Ocurrió un error al crear los horarios.');
    }
  };

  const isSelected = (day, hora) => {
    return selectedBlocks.some(
      (b) => b.weekday === day && b.hora === hora
    );
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Crear horarios disponibles</h1>

      <div className="overflow-x-auto mb-6">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-neutral-700 px-4 py-2">Hora</th>
              {WEEKDAYS.map((day) => (
                <th key={day} className="border border-neutral-700 px-4 py-2">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HORAS.map((hora) => (
              <tr key={hora}>
                <td className="border border-neutral-700 px-4 py-2 text-center">{hora}</td>
                {WEEKDAYS.map((day) => (
                  <td
                    key={day}
                    className={`border border-neutral-700 px-4 py-2 text-center cursor-pointer ${
                      isSelected(day, hora)
                        ? 'bg-violet-600'
                        : 'hover:bg-neutral-800'
                    }`}
                    onClick={() => toggleBlock(day, hora)}
                  >
                    {isSelected(day, hora) ? '✓' : '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
        <label className="flex flex-col">
          Vigente desde:
          <input
            type="date"
            value={validFrom}
            onChange={(e) => setValidFrom(e.target.value)}
            required
            className="bg-neutral-800 p-2 rounded mt-1"
          />
        </label>

        <label className="flex flex-col">
          Vigente hasta:
          <input
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            required
            className="bg-neutral-800 p-2 rounded mt-1"
          />
        </label>

        <div className="flex gap-4 mt-4">
          <button
            type="submit"
            className="bg-violet-600 hover:bg-violet-800 px-4 py-2 rounded"
          >
            Publicar horarios
          </button>
          <button
            type="button"
            onClick={() => navigate('/horarios')}
            className="bg-neutral-700 hover:bg-neutral-800 px-4 py-2 rounded"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
