import React, { useState, useEffect } from "react";
import axios from "../../services/api";
import ReviewCard from "./ReviewCard";

export default function Reviews({ tutorId, isOwner, onAverageCalculated }) {
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    content: "",
    rating: 0,
  });
  const [editing, setEditing] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchReviews();
  }, [tutorId]);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(`/reviews/tutor/${tutorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const reviewsData = response.data;
      const reservationsRes = await axios.get(`/reservations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allReservations = reservationsRes.data;

      const enrichedReviews = await Promise.all(
        reviewsData.map(async (review) => {
          const reservation = allReservations.find(
            (r) => r.id === review.reservation_id
          );

          if (!reservation) {
            return { ...review, reviewer: null };
          }

          try {
            const userRes = await axios.get(
              `/users/${reservation.student_id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            return { ...review, reviewer: userRes.data };
          } catch (error) {
            console.error("Error obteniendo reviewer:", error);
            return { ...review, reviewer: null };
          }
        })
      );

      setReviews(enrichedReviews);

      const reservation = await fetchReservation();
      const existingReview = enrichedReviews.find(
        (r) => r.reservation_id === reservation?.id
      );
      setUserReview(existingReview);

      if (onAverageCalculated && enrichedReviews.length > 0) {
        const avg =
          enrichedReviews.reduce((sum, r) => sum + r.rating, 0) /
          enrichedReviews.length;
        onAverageCalculated(Number(avg.toFixed(1)));
      }
    } catch (error) {
      console.error("Error al cargar reviews:", error);
    }
  };

  const fetchReservation = async () => {
    if (!isOwner) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `/reservations/tutor/${tutorId}/student/${loggedInUser.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const reservation = response.data[0];
        return reservation ? reservation : null;
      } catch (error) {
        console.error("Error al buscar solicitud:", error);
        return null;
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editing) {
      const reservation = await fetchReservation();
      if (!reservation) {
        alert(
          "No tienes una solicitud válida con este tutor para dejar una review."
        );
        return;
      }

      try {
        await axios.post(`/reviews`, {
          reservation_id: reservation.id,
          content: formData.content,
          rating: formData.rating,
        });
        setFormData({ rating: 0, content: "" });
        setShowForm(false);
        fetchReviews();
      } catch (error) {
        console.error("Error al enviar review:", error);
      }
    } else {
      try {
        await axios.patch(`/reviews/${userReview.id}`, {
          content: formData.content,
          rating: formData.rating,
        });
      } catch (error) {
        console.error("Error al editar review:", error);
        return;
      }
    }
    setFormData({ rating: 0, content: "" });
    setShowForm(false);
    setEditing(false);
    fetchReviews();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDeleteReview = (id) => {
    const confirmed = window.confirm("¿Estás seguro de eliminar tu review?");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      axios.delete(`/reviews/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setUserReview(null);
    } catch (error) {
      console.error("Error al eliminar review:", error);
    }
  };

  const openEditForm = () => {
    setFormData({ rating: userReview.rating, content: userReview.content });
    setEditing(true);
    setShowForm(true);
  };

  return (
    <div className="bg-neutral-800 p-6 rounded-lg border border-neutral-700 h-full min-h-[300px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Reviews</h3>
        {!isOwner && loggedInUser?.role === "student" && (
          <div className="mt-2 flex gap-2">
            {!userReview ? (
              <button
                onClick={() => setShowForm(true)}
                className="bg-violet-600 hover:bg-violet-800 px-3 py-1 rounded duration-200"
              >
                Dejar una Review
              </button>
            ) : (
              <>
                <button
                  onClick={openEditForm}
                  className="bg-violet-600 hover:bg-violet-800 px-3 py-1 rounded duration-200"
                >
                  Editar Review
                </button>
                <button
                  onClick={() => handleDeleteReview(userReview.id)}
                  className="bg-red-600 hover:bg-red-800 px-3 py-1 rounded duration-200"
                >
                  Eliminar
                </button>
              </>
            )}
          </div>
        )}
      </div>
      {reviews.length === 0 ? (
        <p className="text-gray-400">Este tutor aún no tiene reviews...</p>
      ) : (
        reviews.map((review, index) => (
          <ReviewCard key={index} review={review} />
        ))
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-800 p-6 rounded-xl w-full max-w-md border border-neutral-700 shadow-xl">
            <h3 className="text-xl font-semibold text-white mb-4">
              {editing ? "Editar Review" : "Nueva Review"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white">
                  Rating (1 a 5 estrellas):
                </label>
                <input
                  type="number"
                  name="rating"
                  min="1"
                  max="5"
                  value={formData.rating}
                  onChange={handleChange}
                  required
                  className="w-full p-2 rounded-lg bg-neutral-700 text-white border border-neutral-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white">
                  Comentario:
                </label>
                <textarea
                  name="content"
                  rows="3"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  className="w-full p-2 rounded-lg bg-neutral-700 text-white border border-neutral-600"
                  placeholder="Escribe tu opinión sobre el tutor..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditing(false);
                    setFormData({ content: "", rating: 0 });
                  }}
                  className="bg-neutral-700 hover:bg-neutral-800 px-4 py-2 rounded duration-200"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="bg-violet-600 hover:bg-violet-800 px-3 py-1 rounded duration-200 inline-block"
                >
                  {editing ? "Actualizar Review" : "Enviar Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
