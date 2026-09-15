"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import { setDraft, clearDraft, type ReportDraft } from "@/store/slices/report-draft-slice";

const STORAGE_KEY = "pharmaprice.reportDraft";

// Redux 메모리는 미들웨어의 /login 리다이렉트(전체 페이지 이동)를 넘기지 못해 비워진다.
// locationSlice(Task 010)와 같은 패턴으로 sessionStorage에도 동기화해 로그인 후 복귀 시 복원한다.
export function useReportDraft() {
  const draft = useSelector((state: RootState) => state.reportDraft);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) dispatch(setDraft(JSON.parse(raw) as Partial<ReportDraft>));
    } catch {
      // 시크릿 모드 등 스토리지 접근 불가 시 무시하고 빈 폼으로 시작한다.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateDraft(patch: Partial<ReportDraft>) {
    dispatch(setDraft(patch));
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...draft, ...patch }));
    } catch {
      // 저장 실패는 무시한다 — 이번 세션 동안은 Redux 메모리로만 동작한다.
    }
  }

  function resetDraft() {
    dispatch(clearDraft());
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // 무시
    }
  }

  return { draft, updateDraft, resetDraft };
}
