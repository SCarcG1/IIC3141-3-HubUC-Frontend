export default function StarRating({ rating }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <span className="text-yellow-400 text-sm font-semibold select-none">
      {"★".repeat(fullStars)}
      {hasHalf ? "⯪" : ""}
      {"☆".repeat(emptyStars)}
    </span>
  );
}
