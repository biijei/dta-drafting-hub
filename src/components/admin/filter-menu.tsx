"use client";

import { Dropdown } from "@/components/ui/dropdown";

type FilterMenuProps = {
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
};

export function FilterMenu({ value, options, onChange }: FilterMenuProps) {
  return (
    <Dropdown
      ariaLabel="Filter by status"
      value={value}
      onChange={onChange}
      buttonLabel={value === "All" ? "Status" : undefined}
      menuAlign="end"
      compact
      options={options.map((option) => ({
        value: option,
        label: option === "All" ? "All statuses" : option,
      }))}
    />
  );
}
