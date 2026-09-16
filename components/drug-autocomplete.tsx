"use client";

import { useId, useMemo, useState, type KeyboardEvent } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useDrugAutocomplete, type DrugSummary } from "@/hooks/use-drug-autocomplete";

export function DrugAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "약 이름을 검색하세요",
}: {
  value: string;
  onChange: (value: string) => void;
  onSelect: (drug: DrugSummary) => void;
  placeholder?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const debouncedQuery = useDebouncedValue(value, 300);
  const listboxId = useId();

  const { data, isFetching } = useDrugAutocomplete(debouncedQuery);
  const results = useMemo(() => data?.content ?? [], [data]);

  function selectDrug(drug: DrugSummary) {
    onSelect(drug);
    onChange("");
    setActiveIndex(-1);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (event.key === "Enter") {
      if (activeIndex >= 0 && results[activeIndex]) {
        selectDrug(results[activeIndex]);
      }
    } else if (event.key === "Escape") {
      onChange("");
      setActiveIndex(-1);
    }
  }

  return (
    <div className="relative">
      <input
        role="combobox"
        aria-expanded={results.length > 0}
        aria-controls={listboxId}
        aria-activedescendant={activeIndex >= 0 ? `drug-option-${activeIndex}` : undefined}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setActiveIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
      {isFetching && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">
          검색 중...
        </span>
      )}

      {results.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-lg"
        >
          {results.map((drug, index) => (
            <li
              key={drug.id}
              id={`drug-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onClick={() => selectDrug(drug)}
              className={`cursor-pointer px-4 py-2 text-sm hover:bg-blue-50 ${
                index === activeIndex ? "bg-blue-50" : ""
              }`}
            >
              {drug.displayName} ({drug.packageUnit})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
