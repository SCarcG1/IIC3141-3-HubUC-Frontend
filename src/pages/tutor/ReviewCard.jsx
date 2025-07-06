import StarRating from "../../components/common/StarRating";

export default function ReviewCard({ review }) {
  const { reviewerName, rating, comment, date } = review;

  return (
    <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-4 shadow-sm mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{reviewerName}</h3>
        <span className="text-sm text-neutral-400">
          {new Date(date).toLocaleDateString()}
        </span>
      </div>
      <p className="text-neutral-300">{comment}</p>
      <div className="text-right">
        <StarRating rating={rating} />
      </div>
    </div>
  );
}
