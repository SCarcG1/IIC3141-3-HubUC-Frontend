import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../services/api";
import SolicitarClase from "../alumno/SolicitarClase";

export default function ClasesTutor({ tutorId, user, isOwner }) {
  const navigate = useNavigate();
  const page = 0;
  const pageSize = 5;
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [courses, setCourses] = useState([]);
  const [courseCache, setCourseCache] = useState({});
  const [tutor, setTutor] = useState();

  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchLessons(page, pageSize);
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get("/courses");
      setCourses(res.data);
      const cache = {};
      res.data.forEach((c) => (cache[c.id] = c));
      setCourseCache(cache);
    } catch (e) {
      console.error("Error cargando cursos:", e);
    }
  };

  const fetchLessons = async ({ page, pageSize }) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/private-lessons/search`, {
        params: {
          tutor_id: tutorId,
          page: page,
          page_size: pageSize,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = res.data?.results || [];
      setLessons(result);
      const uniqueTutorIds = [...new Set(result.map((l) => l.tutor_id))];
      uniqueTutorIds.forEach((id) => fetchTutor(id));
    } catch (err) {
      console.error("Error al obtener clases:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTutor = async (tutorId) => {
    try {
      const res = await axios.get(`/users/${tutorId}`);
      setTutor(res.data);
    } catch (e) {
      console.error(`Error cargando tutor ${tutorId}:`, e);
    }
  };

  const handleSolicitarClase = (lesson) => {
    setSelectedLesson(lesson);
    setShowForm(true);
  };

  const handleConfirmarSolicitud = () => {
    alert("Clase solicitada exitosamente");
    setShowForm(false);
  };

  return (
    <div className="bg-neutral-800 p-6 rounded-lg border border-neutral-700 h-full min-h-[300px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Clases</h3>
        {isOwner && (
          <button
            onClick={() => navigate("/mis-clases")}
            className="bg-violet-600 hover:bg-violet-800 px-3 py-1 rounded duration-200 inline-block"
          >
            Manejar clases
          </button>
        )}
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
                      {lesson ? lesson.description : ""}
                    </div>
                    <div className="text-sm text-neutral-400">
                      Tutor: {tutor ? tutor.name : `ID ${lesson.tutor_id}`}
                    </div>
                    <div className="text-sm text-neutral-400">
                      Precio: ${lesson.price}
                    </div>
                  </div>

                  {user?.role === "student" && (
                    <div className="flex flex-col items-end space-y-2">
                      <button
                        onClick={() => handleSolicitarClase(lesson)}
                        className="bg-violet-600 hover:bg-violet-800 px-4 py-2 text-sm rounded"
                      >
                        Solicitar clase
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
      {showForm && selectedLesson && (
        <SolicitarClase
          lesson={selectedLesson}
          courseCache={courseCache}
          onClose={() => setShowForm(false)}
          onSubmit={handleConfirmarSolicitud}
        />
      )}
    </div>
  );
}
