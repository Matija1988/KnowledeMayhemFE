import type { GameSession } from "../../domain/game/gameTypes";
import type { Category } from "../../domain/questionBank/questionBankTypes";

type GameCategoryLegendProps = {
  session: GameSession;
  categories: Category[];
};

export function GameCategoryLegend({ session, categories }: GameCategoryLegendProps) {
  const categoriesById = new Map(categories.map((category) => [category.id, category]));
  const legend = [...new Set(session.tiles.map((tile) => tile.categoryId).filter((id): id is string => Boolean(id)))]
    .map((categoryId) => categoriesById.get(categoryId) ?? {
      id: categoryId,
      name: "Unknown category",
      color: "#64748B",
    })
    .sort((left, right) => left.name.localeCompare(right.name));

  return (
    <aside className="game-category-legend" aria-labelledby="game-category-legend-title">
      <h2 id="game-category-legend-title">Categories</h2>
      <ul>
        {legend.map((category) => (
          <li key={category.id}>
            <span className="game-category-dot" style={{ backgroundColor: category.color }} aria-hidden="true" />
            <span>{category.name}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
