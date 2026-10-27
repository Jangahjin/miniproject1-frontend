"use client";

import { useId, useMemo, useState, type KeyboardEvent } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useDrugAutocomplete, type DrugSummary } from "@/hooks/use-drug-autocomplete";

export function DrugAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "약 이름을 검색하세요",
  variant = "default",
}: {
  value: string;
  onChange: (value: string) => void;
  onSelect: (drug: DrugSummary) => void;
  placeholder?: string;
  // "hero"는 홈 히어로 전용 — 둥근 흰 카드 안에 입력창과 남색 검색 버튼을 나란히 둔다.
  // 제보·통계 화면은 기존 하드 섀도우 스타일(default)을 그대로 쓴다.
  variant?: "default" | "hero";
}) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const debouncedQuery = useDebouncedValue(value, 300);
  const listboxId = useId();

  const { data, isFetching } = useDrugAutocomplete(debouncedQuery);
  const results = useMemo(() => data?.content ?? [], [data]);
  const isHero = variant === "hero";

  function selectDrug(drug: DrugSummary) {
    onSelect(drug);
    onChange("");
    setActiveIndex(-1);
  }

  // 화살표로 골라둔 항목이 있으면 그걸, 없으면(그냥 타이핑만 하고 엔터) 검색어와
  // 가장 가까운 첫 번째 결과를 선택한다 — 마우스로 목록을 클릭하지 않고도
  // 타이핑 후 엔터(또는 히어로의 검색 버튼)만으로 검색이 끝나야 한다.
  function submit() {
    const target = activeIndex >= 0 ? results[activeIndex] : results[0];
    if (target) {
      selectDrug(target);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (event.key === "Enter") {
      submit();
    } else if (event.key === "Escape") {
      onChange("");
      setActiveIndex(-1);
    }
  }

  const input = (
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
      // 기본형(제보·통계 화면)은 공용 input-field 토큰 스타일을 쓴다.
      className={
        isHero
          ? "min-w-0 flex-1 border-none bg-transparent py-2.5 text-[15px] tracking-[-0.01em] text-gray-950 outline-none placeholder:text-gray-400"
          : "input-field py-3"
      }
    />
  );

  return (
    <div className="relative">
      {isHero ? (
        // 히어로는 라이트/다크와 무관하게 항상 어두운 사진 위에 놓이므로 dark: 변형 없이
        // 흰 카드로 고정한다. 포커스는 카드 전체 링으로 보여준다(입력창 자체는 outline 없음).
        <div className="flex items-center gap-2.5 rounded-xl bg-white py-2 pr-2 pl-5 shadow-[0_18px_40px_rgba(0,0,0,0.25)] focus-within:ring-2 focus-within:ring-sky-400">
          {input}
          {isFetching && <span className="shrink-0 text-xs text-gray-400">검색 중...</span>}
          <button
            type="button"
            onClick={submit}
            className="shrink-0 rounded-lg bg-brand px-5 py-3 text-sm font-bold whitespace-nowrap text-white transition hover:-translate-y-px hover:bg-brand-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
          >
            검색
          </button>
        </div>
      ) : (
        <>
          {input}
          {isFetching && (
            <span className="absolute top-1/2 right-4 -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400">
              검색 중...
            </span>
          )}
        </>
      )}

      {results.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className={
            isHero
              ? "absolute z-10 mt-2 w-full divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-[0_18px_40px_rgba(0,0,0,0.2)]"
              : "absolute z-10 mt-1.5 w-full divide-y divide-gray-100 overflow-hidden rounded-control border border-line bg-white text-left shadow-lg dark:divide-gray-800 dark:border-gray-700 dark:bg-gray-900"
          }
        >
          {results.map((drug, index) => (
            <li
              key={drug.id}
              id={`drug-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onClick={() => selectDrug(drug)}
              className={
                isHero
                  ? `cursor-pointer px-5 py-2.5 text-[15px] text-gray-900 hover:bg-slate-50 ${index === activeIndex ? "bg-slate-50" : ""}`
                  : `cursor-pointer px-4 py-2.5 text-sm text-ink hover:bg-brand-soft dark:text-gray-100 dark:hover:bg-gray-800 ${
                      index === activeIndex ? "bg-brand-soft dark:bg-gray-800" : ""
                    }`
              }
            >
              {drug.displayName} ({drug.packageUnit})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
