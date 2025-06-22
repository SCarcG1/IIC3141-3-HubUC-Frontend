import React, { useState } from "react";

export default function Horario() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [infoClase, setInfoClase] = useState(null);

  const abrirModal = (clase) => {
    setInfoClase(clase);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setInfoClase(null);
  };

  const dias = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];
  const bloques = [
    "08:20",
    "09:40",
    "11:00",
    "12:20",
    "13:30",
    "14:50",
    "16:10",
    "17:30",
    "18:50",
    "20:10",
  ];

  // clases que ya han sido agendadas
  const [clases] = useState([
    // {
    //   id: 1,
    //   dia: "Lunes",
    //   horaInicio: "08:20",
    //   duracionBloques: 2,
    //   titulo: "Matemáticas",
    //   tutor: "Nombre tutor",
    //   estudiante: "Nombre estudiante",
    // },
    // {
    //   id: 2,
    //   dia: "Martes",
    //   horaInicio: "11:00",
    //   duracionBloques: 1,
    //   titulo: "Cálculo I",
    //   tutor: "Nombre tutor",
    //   estudiante: "Nombre estudiante",
    // },
    // {
    //   id: 3,
    //   dia: "Jueves",
    //   horaInicio: "12:20",
    //   duracionBloques: 1,
    //   titulo: "Cálculo II",
    //   tutor: "Nombre tutor",
    //   estudiante: "Nombre estudiante",
    // },
    // {
    //   id: 3,
    //   dia: "Lunes",
    //   horaInicio: "12:20",
    //   duracionBloques: 1,
    //   titulo: "Álgebra Lineal",
    //   tutor: "Nombre tutor",
    //   estudiante: "Nombre estudiante",
    // },
  ]);

  // Para controlar qué celdas se deben omitir (ocupadas por rowspan)
  const bloquesOmitidos = {};

  return (
    <div>
      <table className="w-full table-fixed text-sm border-collapse">
        <thead>
          <tr>
            <th className="border border-neutral-700 p-2 w-24">Hora</th>
            {dias.map((dia) => (
              <th key={dia} className="border border-neutral-700 p-2 w-32">
                {dia}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bloques.map((hora, rowIndex) => (
            <tr key={hora}>
              <td className="border border-neutral-700 p-2 font-semibold text-center w-24">
                {hora}
              </td>
              {dias.map((dia) => {
                const key = `${dia}-${hora}`;

                if (bloquesOmitidos[key]) return null;

                const clase = clases.find(
                  (c) => c.dia === dia && c.horaInicio === hora
                );

                if (clase) {
                  for (let i = 1; i < clase.duracionBloques; i++) {
                    const siguienteBloque = bloques[rowIndex + i];
                    if (siguienteBloque) {
                      bloquesOmitidos[`${dia}-${siguienteBloque}`] = true;
                    }
                  }

                  return (
                    <td
                      key={key}
                      rowSpan={clase.duracionBloques}
                      className="border border-neutral-700 p-2 text-center bg-violet-700 rounded cursor-pointer select-none"
                      onClick={() => abrirModal(clase)}
                    >
                      {clase.titulo}
                    </td>
                  );
                }

                return (
                  <td
                    key={key}
                    className="border border-neutral-700 p-2 h-16 text-center text-neutral-400"
                  >
                    -
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-neutral-900 rounded-lg p-6 max-w-md w-full text-white">
            <h2 className="text-xl font-bold mb-4">{infoClase?.titulo}</h2>
            <p>Hora: {infoClase?.horaInicio}</p>
            <p>Día: {infoClase?.dia}</p>
            <p>Duración: {infoClase?.duracionBloques} bloque(s)</p>
            <p>Tutor: {infoClase?.tutor}</p>
            <p>Estudiante: {infoClase?.estudiante}</p>

            <button
              onClick={cerrarModal}
              className="mt-6 bg-violet-600 hover:bg-violet-800 px-4 py-2 rounded"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
