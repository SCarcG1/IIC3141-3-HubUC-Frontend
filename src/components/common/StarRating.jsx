export default function StarRating({ rating }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <span className="text-lg font-semibold select-none tracking-wider">
      <span className="text-yellow-400">
        {"★".repeat(fullStars)}
        {hasHalf ? "⯪" : ""}
      </span>
      <span className="text-neutral-500">{"☆".repeat(emptyStars)}</span>
    </span>
  );
}
