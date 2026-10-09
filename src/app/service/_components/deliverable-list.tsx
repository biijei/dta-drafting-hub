export function DeliverableList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-full bg-notice px-2.5 py-1 text-xs text-muted"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
