import Dashboard from "../../components/common/Dashboard";

export default function TutorDashboard() {
  return (
    <Dashboard
      roleCheck="tutor"
      apiEndpoint="/reservations/tutor"
      linkSolicitudes="/solicitudes/tutor"
      mostrarClasesAceptadasSolo={false}
      acciones={[
        {
          title: "Mis clases",
          links: [
            { to: "/mis-clases", label: "Ver clases" },
            { to: "/horarios", label: "Editar horarios" },
          ],
        },
      ]}
    />
  );
}
