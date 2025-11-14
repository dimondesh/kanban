import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Card } from "./Card";
import type { Card as CardType, ColumnKey } from "../types";

interface ColumnProps {
  columnKey: ColumnKey;
  title: string;
  cards: CardType[];
  onAddCard: (column: ColumnKey) => void;
  onEditCard: (card: CardType, columnKey: ColumnKey) => void;
  onDeleteCard: (card: CardType, columnKey: ColumnKey) => Promise<void> | void;
}

export const Column: React.FC<ColumnProps> = ({
  columnKey,
  title,
  cards,
  onAddCard,
  onEditCard,
  onDeleteCard,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: columnKey,
    data: { type: "column", columnKey, index: cards.length },
  });

  return (
    <div
      className="flex-1 bg-zinc-900 rounded-xl p-4 shadow-inner"
      ref={setNodeRef}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-xs text-zinc-400">{cards.length}</span>
      </div>

      <SortableContext
        items={cards.map((card) => card.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          className={`space-y-2 min-h-[150px] rounded-lg border border-dashed p-2 transition-colors ${
            isOver ? "border-blue-500 bg-zinc-700/40" : "border-transparent"
          }`}
        >
          {cards.length > 0 ? (
            cards.map((card, index) => (
              <Card
                key={card.id}
                card={card}
                columnKey={columnKey}
                index={index}
                onEditCard={onEditCard}
                onDeleteCard={onDeleteCard}
              />
            ))
          ) : (
            <p className="text-zinc-500 text-sm text-center italic py-4">
              No tasks
            </p>
          )}
        </div>
      </SortableContext>

      <button
        type="button"
        onClick={() => onAddCard(columnKey)}
        className="mt-4 w-full border border-zinc-600 text-sm py-2 rounded hover:border-blue-500 hover:text-blue-400 transition"
      >
        + Add task
      </button>
    </div>
  );
};
