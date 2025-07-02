import React, { useState, useEffect } from "react";
import axios from "../../services/api";
import ReviewCard from "./ReviewCard";

export default function Reviews({ tutorId, isOwner }) {
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    content: "",
    rating: 0,
  });
  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchReviews();
  }, [tutorId]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`/reviews/tutor/${tutorId}`);
      setReviews(response.data);
    } catch (error) {
      console.error("Error al cargar reviews:", error);
    }
  };

  // Busqueda de reservation_id en la API
  const fetchReservationId = async () => {
    try {
      const response = await axios.get(
        "/reservations/tutor/{tutorId}/student/{loggedInUser.id}"
      );
      const reservation = response.data;
      return reservation ? reservation.id : null;
    } catch (error) {
      console.error("Error al buscar solicitud:", error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const reservationId = await fetchReservationId();
    if (!reservationId) {
      alert(
        "No tienes una solicitud válida con este tutor para dejar una review."
      );
      return;
    }

    try {
      await axios.post(`/reviews`, {
        reservation_id: reservationId,
        content: formData.content,
        rating: formData.rating,
      });
      setFormData({ rating: 0, comment: "" });
      setShowForm(false);
      fetchReviews();
    } catch (error) {
      console.error("Error al enviar review:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="w-full h-full min-h-[300px] bg-neutral-800 p-6 rounded-lg border border-neutral-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Reviews</h3>
        {!isOwner && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-violet-600 hover:bg-violet-800 px-3 py-1 rounded duration-200 inline-block"
          >
            Dejar una Review
          </button>
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
              Nueva Review
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
                  name="comment"
                  rows="3"
                  value={formData.comment}
                  onChange={handleChange}
                  required
                  className="w-full p-2 rounded-lg bg-neutral-700 text-white border border-neutral-600"
                  placeholder="Escribe tu opinión sobre el tutor..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-neutral-700 hover:bg-neutral-800 px-4 py-2 rounded duration-200"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="bg-violet-600 hover:bg-violet-800 px-3 py-1 rounded duration-200 inline-block"
                >
                  Enviar Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
