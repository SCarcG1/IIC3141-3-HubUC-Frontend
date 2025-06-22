import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../services/api";
import Reservacion from "./Reservacion";

export default function Clases({ initialLessons = null }) {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState(initialLessons || []);
  const [loading, setLoading] = useState(initialLessons ? false : true);
  const [filters, setFilters] = useState({
    course_id: "",
    tutor_id: "",
  });

  const [courseCache, setCourseCache] = useState({});
  const [tutorCache, setTutorCache] = useState({});
  const [allLessons, setAllLessons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleSolicitarClase = (lesson) => {
    setSelectedLesson(lesson);
    setShowForm(true);
  };

  const handleConfirmarSolicitud = async (lessonId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/reservations/lesson/${lessonId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Clase solicitada exitosamente");
      setShowForm(false);
    } catch (e) {
      console.error("Error al solicitar clase:", e);
      alert("Hubo un error al solicitar la clase.");
    }
  };

  const handleChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const fetchAllCourses = async () => {
    try {
      const res = await axios.get("/courses");
      setCourses(res.data);
      console.log("Cursos cargados:", courses);
      const cache = {};
      res.data.forEach((c) => (cache[c.id] = c));
      setCourseCache(cache);
    } catch (e) {
      console.error("Error cargando cursos:", e);
    }
  };

  const fetchTutor = async (tutorId) => {
    try {
      const res = await axios.get(`/users/${tutorId}`);
      setTutorCache((prev) => ({ ...prev, [tutorId]: res.data }));
    } catch (e) {
      console.error(`Error cargando tutor ${tutorId}:`, e);
    }
  };

  const fetchAllLessons = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/private-lessons");
      setAllLessons(response.data);
      setLessons(response.data);
      const uniqueTutorIds = [...new Set(response.data.map((l) => l.tutor_id))];
      uniqueTutorIds.forEach((id) => fetchTutor(id));
    } catch (error) {
      console.error("Error cargando todas las clases:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const { course_id, tutor_id } = filters;

    const filtered = allLessons.filter((lesson) => {
      const course = courseCache[lesson.course_id];
      const tutor = tutorCache[lesson.tutor_id];

      const matchCourse =
        !course_id ||
        lesson.course_id === Number(course_id) ||
        (course && course.name.toLowerCase().includes(course_id.toLowerCase()));

      const matchTutor =
        !tutor_id ||
        lesson.tutor_id === Number(tutor_id) ||
        (tutor && tutor.name.toLowerCase().includes(tutor_id.toLowerCase()));

      return matchCourse && matchTutor;
    });

    setLessons(filtered);
  };

  useEffect(() => {
    if (initialLessons) return;
    fetchAllLessons();
    fetchAllCourses();
  }, [initialLessons]);

  return (
    <div className="bg-neutral-950 min-h-screen text-white p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clases disponibles</h1>
        <button
          onClick={() => navigate("/dashboard/alumno")}
          className="bg-neutral-700 hover:bg-neutral-800 px-4 py-2 rounded duration-200"
        >
          ← Volver al panel principal
        </button>
      </div>

      <div className="bg-neutral-900 p-4 rounded-lg mb-6 flex flex-wrap gap-4">
        <input
          name="course_id"
          type="text"
          placeholder="Nombre de curso"
          className="bg-neutral-800 text-white px-3 py-2 rounded"
          value={filters.course_id}
          onChange={handleChange}
        />
        <input
          name="tutor_id"
          type="text"
          placeholder="Nombre del tutor"
          className="bg-neutral-800 text-white px-3 py-2 rounded"
          value={filters.tutor_id}
          onChange={handleChange}
        />
        <button
          onClick={handleSearch}
          className="bg-violet-600 hover:bg-violet-800 px-4 py-2 rounded text-sm"
        >
          Buscar
        </button>
      </div>

      {loading ? (
        <p className="text-center text-neutral-400">Cargando clases...</p>
      ) : (
        <div className="flex flex-col gap-4">
          {lessons.length === 0 ? (
            <p className="text-center text-neutral-400">
              No se encontraron clases.
            </p>
          ) : (
            lessons.map((lesson) => {
              const course = courseCache[lesson.course_id];
              const tutor = tutorCache[lesson.tutor_id];

              return (
                <div
                  key={lesson.id}
                  className="bg-neutral-800 p-4 rounded-lg border border-neutral-700 hover:bg-neutral-700 transition-all duration-200 flex justify-between items-center"
                >
                  <div>
                    <div className="text-lg font-semibold">
                      {course ? course.name : `Curso ID: ${lesson.course_id}`}
                    </div>
                    <div className="text-sm text-neutral-400">
                      {course ? course.description : ""}
                    </div>
                    <div className="text-sm text-neutral-400">
                      Tutor: {tutor ? tutor.name : `ID ${lesson.tutor_id}`}
                    </div>
                    <div className="text-sm text-neutral-400">
                      Precio: ${lesson.price}
                    </div>
                    <div className="text-sm text-neutral-400">
                      Fecha:{" "}
                      {new Date(lesson.start_time).toLocaleString("es-CL", {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: "America/Santiago",
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <button
                      onClick={() => navigate(`/perfil/${lesson.tutor_id}`)}
                      className="text-violet-400 hover:text-violet-600 text-sm underline"
                      type="button"
                    >
                      Ver perfil tutor
                    </button>

                    <button
                      onClick={() => handleSolicitarClase(lesson)}
                      className="bg-violet-600 hover:bg-violet-800 px-4 py-2 text-sm rounded"
                    >
                      Solicitar clase
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
      {showForm && selectedLesson && (
        <Reservacion
          lesson={selectedLesson}
          courseCache={courseCache}
          onClose={() => setShowForm(false)}
          onSubmit={handleConfirmarSolicitud}
        />
      )}
    </div>
  );
}
