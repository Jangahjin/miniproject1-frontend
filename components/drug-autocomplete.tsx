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
      // 화살표로 골라둔 항목이 있으면 그걸, 없으면(그냥 타이핑만 하고 엔터) 검색어와
      // 가장 가까운 첫 번째 결과를 선택한다 — 마우스로 목록을 클릭하지 않고도
      // 타이핑 후 엔터만으로 검색이 끝나야 한다.
      const target = activeIndex >= 0 ? results[activeIndex] : results[0];
      if (target) {
        selectDrug(target);
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
        enterKeyHint="search"
        // 검색창을 이 사이트의 시그니처 요소로 삼아, 흰 배경 + 검정 테두리 + 어긋난
        // 하늘색 섀도우("포스터"식 하드 섀도우)로 확실한 대비를 준다. 포커스 시
        // 섀도우가 살짝 커지며 눌리는 듯한 반응을 준다.
        className="w-full rounded-none border-2 border-gray-950 bg-white px-4 py-3 text-base text-gray-950 shadow-[4px_4px_0_0_#0ea5e9] outline-none transition-shadow focus:shadow-[6px_6px_0_0_#0ea5e9] dark:border-gray-50 dark:bg-gray-900 dark:text-gray-50 dark:shadow-[4px_4px_0_0_#38bdf8] dark:placeholder:text-gray-500 dark:focus:shadow-[6px_6px_0_0_#38bdf8]"
      />
      {isFetching && (
        <span className="absolute top-1/2 right-4 -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400">
          검색 중...
        </span>
      )}

      {results.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-10 mt-1.5 w-full divide-y divide-gray-100 overflow-hidden border-2 border-gray-950 bg-white text-left dark:divide-gray-800 dark:border-gray-50 dark:bg-gray-900"
        >
          {results.map((drug, index) => (
            <li
              key={drug.id}
              id={`drug-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onClick={() => selectDrug(drug)}
              className={`cursor-pointer px-4 py-2 text-sm text-gray-900 hover:bg-blue-50 dark:text-gray-100 dark:hover:bg-gray-800 ${
                index === activeIndex ? "bg-blue-50 dark:bg-gray-800" : ""
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
