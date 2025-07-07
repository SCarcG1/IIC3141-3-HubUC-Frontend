import Dashboard from "../../components/common/Dashboard";

export default function AlumnoDashboard() {
  return (
    <Dashboard
      roleCheck="student"
      apiEndpoint="/reservations/student"
      linkSolicitudes="/solicitudes/alumno"
      mostrarSoloClasesAceptadas={true}
      acciones={[
        {
          title: "Buscar clases",
          links: [{ to: "/clases", label: "Ver clases" }],
        },
      ]}
    />
  );
}
