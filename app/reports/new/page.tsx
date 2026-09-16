"use client";

import { Suspense, useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { PharmacyPicker, type PharmacySummary } from "@/components/pharmacy-picker";
import { DrugAutocomplete } from "@/components/drug-autocomplete";
import type { DrugSummary } from "@/hooks/use-drug-autocomplete";
import { useReportDraft } from "@/hooks/use-report-draft";

// API.md §6 "POST /api/v1/uploads" 응답 스키마
interface UploadResponse {
  id: number;
  originalName: string;
  contentType: string;
  sizeBytes: number;
  url: string;
  createdAt: string;
}

const RECEIPT_ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const RECEIPT_MAX_BYTES = 5 * 1024 * 1024;

// TODO: 백엔드 T-26이 준비되면 API.md §6 실제 응답과 대조해 필드명을 검증한다.
interface PriceReportResponse {
  id: number;
  pharmacyId: number;
  drugId: number;
  price: number;
  purchasedAt: string;
  status: string;
  flagged: boolean;
  flagReason: string | null;
  warning?: string;
  updatedStat: {
    repPrice: number;
    minPrice: number;
    avgPrice: number;
    reportCount: number;
    lastReportedAt: string;
  };
}

function formatPriceDisplay(digits: string): string {
  if (!digits) return "";
  return Number(digits).toLocaleString("ko-KR");
}

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

function ReportForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { draft, updateDraft, resetDraft } = useReportDraft();

  const [drugQuery, setDrugQuery] = useState("");
  const [priceError, setPriceError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);

  // ?pharmacyId= 프리필 — 약국 상세에서 "가격 제보하기"로 진입한 경우 (T-29 완료 판정)
  useEffect(() => {
    const pharmacyIdParam = searchParams.get("pharmacyId");
    if (!pharmacyIdParam || draft.pharmacyId) return;

    apiFetch<{ id: number; name: string }>(`/api/v1/pharmacies/${pharmacyIdParam}`)
      .then((pharmacy) => updateDraft({ pharmacyId: pharmacy.id, pharmacyName: pharmacy.name }))
      .catch(() => {
        // 프리필 실패는 조용히 무시한다 — 사용자가 직접 검색하면 된다.
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // blob: URL은 브라우저 메모리를 쓰므로 페이지를 떠날 때 반드시 해제한다.
  useEffect(() => {
    return () => {
      if (receiptPreviewUrl) URL.revokeObjectURL(receiptPreviewUrl);
    };
  }, [receiptPreviewUrl]);

  function handlePriceChange(raw: string) {
    // 콤마는 formatPriceDisplay가 넣은 표시용 문자라 무시하지만, 마이너스 부호는
    // 조용히 지워서 "-100"이 "100"으로 둔갑하게 두지 않는다 — 바로 에러로 알린다.
    if (raw.includes("-")) {
      setPriceError("가격은 음수로 입력할 수 없습니다.");
      return;
    }
    const digits = raw.replace(/[^\d]/g, "").slice(0, 6);
    updateDraft({ price: digits });
    setPriceError(null);
  }

  async function handleReceiptChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // 같은 파일을 다시 골라도 onChange가 또 뜨도록 초기화한다.
    if (!file) return;

    setReceiptError(null);

    // API.md §6 검증 규칙: jpg/png/webp만, 5MB 이하.
    // 서버(T-27)가 최종 판정하지만, 사용자가 업로드 실패를 기다리지 않도록 화면에서 먼저 걸러준다.
    if (!RECEIPT_ACCEPTED_TYPES.includes(file.type)) {
      setReceiptError("jpg, png, webp 형식의 이미지만 올릴 수 있어요.");
      return;
    }
    if (file.size > RECEIPT_MAX_BYTES) {
      setReceiptError("파일 크기는 5MB 이하여야 해요.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setReceiptPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return previewUrl;
    });
    setReceiptFileName(file.name);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("purpose", "RECEIPT");

    setIsUploadingReceipt(true);
    try {
      const uploaded = await apiFetch<UploadResponse>("/api/v1/uploads", {
        method: "POST",
        auth: true,
        body: formData,
      });
      updateDraft({ receiptFileId: uploaded.id });
    } catch (error) {
      setReceiptError(
        error instanceof ApiError ? error.message : "영수증 업로드에 실패했어요. 다시 시도해주세요."
      );
      clearReceipt();
    } finally {
      setIsUploadingReceipt(false);
    }
  }

  function clearReceipt() {
    setReceiptPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setReceiptFileName(null);
    updateDraft({ receiptFileId: null });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitError(null);
    setWarning(null);

    if (!draft.pharmacyId) {
      setSubmitError("약국을 선택하세요.");
      return;
    }
    if (!draft.drugId) {
      setSubmitError("약품을 선택하세요.");
      return;
    }

    const price = Number(draft.price);
    if (!draft.price || price < 100 || price > 200000) {
      setPriceError("100원 이상 200,000원 이하로 입력하세요.");
      return;
    }

    if (draft.purchasedAt) {
      const purchased = new Date(draft.purchasedAt);
      const today = new Date(todayISODate());
      const diffDays = (today.getTime() - purchased.getTime()) / (1000 * 60 * 60 * 24);
      if (purchased > today) {
        setSubmitError("구매일은 미래일 수 없습니다.");
        return;
      }
      if (diffDays > 180) {
        setSubmitError("구매일은 180일 이전일 수 없습니다.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const response = await apiFetch<PriceReportResponse>("/api/v1/price-reports", {
        method: "POST",
        auth: true,
        body: JSON.stringify({
          pharmacyId: draft.pharmacyId,
          drugId: draft.drugId,
          price,
          ...(draft.purchasedAt ? { purchasedAt: draft.purchasedAt } : {}),
          ...(draft.receiptFileId ? { receiptFileId: draft.receiptFileId } : {}),
          ...(draft.memo ? { memo: draft.memo } : {}),
        }),
      });

      resetDraft();
      setSuccess(true);
      if (response.flagged && response.warning) {
        setWarning(response.warning);
      }
      setTimeout(
        () => router.push(`/pharmacies/${response.pharmacyId}`),
        response.flagged ? 3000 : 1000
      );
    } catch (error) {
      if (error instanceof ApiError && error.code === "DUPLICATE_REPORT") {
        setSubmitError("오늘 이미 이 약국의 해당 약품 가격을 제보하셨습니다.");
      } else if (error instanceof ApiError) {
        setSubmitError(error.message);
      } else {
        setSubmitError("제보에 실패했습니다. 잠시 후 다시 시도해주세요.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success && !warning) {
    return <p role="status">제보 감사합니다! 잠시 후 약국 상세로 이동합니다.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-3xl">
      <h1>가격 제보하기</h1>

      <section>
        <h2>약국</h2>
        {draft.pharmacyName ? (
          <p>
            {draft.pharmacyName}{" "}
            <button
              type="button"
              onClick={() => updateDraft({ pharmacyId: null, pharmacyName: "" })}
            >
              변경
            </button>
          </p>
        ) : (
          <PharmacyPicker
            onSelect={(pharmacy: PharmacySummary) =>
              updateDraft({ pharmacyId: pharmacy.id, pharmacyName: pharmacy.name })
            }
          />
        )}
      </section>

      <section>
        <h2>약품</h2>
        {draft.drugName ? (
          <p>
            {draft.drugName} ({draft.packageUnit}){" "}
            <button
              type="button"
              onClick={() => updateDraft({ drugId: null, drugName: "", packageUnit: "" })}
            >
              변경
            </button>
          </p>
        ) : (
          <DrugAutocomplete
            value={drugQuery}
            onChange={setDrugQuery}
            onSelect={(drug: DrugSummary) => {
              updateDraft({
                drugId: drug.id,
                drugName: drug.displayName,
                packageUnit: drug.packageUnit,
              });
              setDrugQuery("");
            }}
          />
        )}
      </section>

      <section>
        <h2>가격</h2>
        <label htmlFor="price">가격 (원)</label>
        <input
          id="price"
          inputMode="numeric"
          value={formatPriceDisplay(draft.price)}
          onChange={(event) => handlePriceChange(event.target.value)}
        />
        {priceError && <p role="alert">{priceError}</p>}
      </section>

      <details>
        <summary>구매일 · 영수증 · 메모 (선택)</summary>

        <label htmlFor="purchasedAt">구매일</label>
        <input
          id="purchasedAt"
          type="date"
          max={todayISODate()}
          value={draft.purchasedAt}
          onChange={(event) => updateDraft({ purchasedAt: event.target.value })}
        />

        <label htmlFor="receipt">영수증 (선택)</label>
        {receiptPreviewUrl ? (
          <p>
            {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL 미리보기라 next/image 최적화 대상이 아니다 */}
            <img src={receiptPreviewUrl} alt="영수증 미리보기" width={80} height={80} />
            {receiptFileName}
            {isUploadingReceipt && " (업로드 중...)"}
            {draft.receiptFileId && !isUploadingReceipt && " (업로드 완료)"}{" "}
            <button type="button" onClick={clearReceipt} disabled={isUploadingReceipt}>
              삭제
            </button>
          </p>
        ) : (
          <input
            id="receipt"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleReceiptChange}
            disabled={isUploadingReceipt}
          />
        )}
        {receiptError && <p role="alert">{receiptError}</p>}

        <label htmlFor="memo">메모</label>
        <textarea
          id="memo"
          maxLength={200}
          value={draft.memo}
          onChange={(event) => updateDraft({ memo: event.target.value })}
        />
      </details>

      {submitError && <p role="alert">{submitError}</p>}
      {warning && (
        <div role="alert">
          <p>{warning}</p>
          <p>그래도 제보되었습니다. 잠시 후 약국 상세로 이동합니다.</p>
        </div>
      )}

      <button type="submit" disabled={isSubmitting || isUploadingReceipt}>
        제보하기
      </button>
    </form>
  );
}

export default function NewReportPage() {
  return (
    <Suspense>
      <ReportForm />
    </Suspense>
  );
}
