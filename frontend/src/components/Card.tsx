import { forwardRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card as CardType, ColumnKey } from "../types";
import { Edit, Trash } from "lucide-react";

interface CardProps {
  card: CardType;
  columnKey: ColumnKey;
  index: number;
  onEditCard?: (card: CardType, columnKey: ColumnKey) => void;
  onDeleteCard?: (card: CardType, columnKey: ColumnKey) => Promise<void> | void;
}

type CardContentProps = React.HTMLAttributes<HTMLDivElement> & {
  card: CardType;
  columnKey?: ColumnKey;
  isDragging?: boolean;
  onEditCard?: (card: CardType, columnKey: ColumnKey) => void;
  onDeleteCard?: (card: CardType, columnKey: ColumnKey) => Promise<void> | void;
};

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  (
    {
      card,
      columnKey,
      isDragging = false,
      style,
      onEditCard,
      onDeleteCard,
      ...rest
    },
    ref
  ) => {
    const handleEdit = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      event.preventDefault();
      if (columnKey && onEditCard) {
        onEditCard(card, columnKey);
      }
    };

    const handleDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      event.preventDefault();
      if (columnKey && onDeleteCard) {
        void onDeleteCard(card, columnKey);
      }
    };

    return (
      <div
        ref={ref}
        style={style}
        className={`bg-zinc-700 p-3 rounded shadow transition select-none flex justify-between ${
          isDragging ? "  bg-zinc-600" : "hover:bg-zinc-600"
        }`}
        {...rest}
      >
        <div className="flex flex-col">
          <h3 className="font-medium">{card.title}</h3>
          {card.description && (
            <p className="text-sm text-zinc-400 mt-1 whitespace-pre-line">
              {card.description}
            </p>
          )}
        </div>
        <div className="flex flex-col">
          <button
            type="button"
            onClick={handleEdit}
            className="px-1 py-1 rounded disabled:opacity-50"
          >
            <Edit className="size-4" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-1 py-1 rounded disabled:opacity-50"
          >
            <Trash className="size-4  text-red-500" />
          </button>
        </div>
      </div>
    );
  }
);

CardContent.displayName = "CardContent";

export const Card: React.FC<CardProps> = ({
  card,
  columnKey,
  index,
  onEditCard,
  onDeleteCard,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: "card", columnKey, index },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition:
      transition ||
      "transform 110ms cubic-bezier(0.33, 1, 0.68, 1), box-shadow 80ms",
    opacity: isDragging ? 0.85 : 1,
    cursor: "grab",
  };

  return (
    <CardContent
      ref={setNodeRef}
      card={card}
      columnKey={columnKey}
      isDragging={isDragging}
      onEditCard={onEditCard}
      onDeleteCard={onDeleteCard}
      style={style}
      {...attributes}
      {...listeners}
    />
  );
};

export const CardPreview: React.FC<{ card: CardType }> = ({ card }) => {
  return (
    <CardContent
      card={card}
      isDragging
      style={{
        cursor: "grabbing",
        transform: "scale(1.02)",
      }}
    />
  );
};
