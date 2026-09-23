import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { getErrorMessage } from "@/lib/error-message";
import { DistanceBadge } from "@/components/ui/DistanceBadge";
import { PharmacyDrugPrices, type DrugPrice } from "@/components/pharmacy-drug-prices";
import { PharmacyImageCarousel } from "@/components/pharmacy-image-carousel";
import { ErrorRetryLink } from "@/components/ui/ErrorRetryLink";

// docs/API.md §4 (T-19) 실제 응답 형태와 맞춰뒀다.
interface PharmacyDetail {
  id: number;
  name: string;
  addressRoad: string;
  addressJibun: string;
  lat: number;
  lng: number;
  phone: string;
  businessHours: Record<string, [string, string] | null>;
  distanceM: number | null;
  region: { code: string; sido: string; sigungu: string };
  drugPrices: DrugPrice[];
}

const DAY_LABEL: Record<string, string> = {
  mon: "월",
  tue: "화",
  wed: "수",
  thu: "목",
  fri: "금",
  sat: "토",
  sun: "일",
  holiday: "공휴일",
};

// businessHours는 JSON 객체 키 순서라 월~일 순서가 보장되지 않는다. 표시 순서를 직접 고정한다.
const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun", "holiday"];

interface PharmacyPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PharmacyDetailPage({ params, searchParams }: PharmacyPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const lat = typeof query.lat === "string" ? query.lat : undefined;
  const lng = typeof query.lng === "string" ? query.lng : undefined;

  const qs = new URLSearchParams();
  if (lat && lng) {
    qs.set("lat", lat);
    qs.set("lng", lng);
  }

  let pharmacy: PharmacyDetail;
  try {
    pharmacy = await apiFetch<PharmacyDetail>(
      `/api/v1/pharmacies/${id}${qs.toString() ? `?${qs}` : ""}`
    );
  } catch (error) {
    return <ErrorRetryLink message={getErrorMessage(error, "약국 정보를 불러오지 못했습니다.")} />;
  }

  const orderedHours = DAY_ORDER.filter((day) => day in pharmacy.businessHours);
  const today = new Date().getDay(); // 0=일 ... 6=토
  const todayKey = DAY_ORDER[(today + 6) % 7]; // DAY_ORDER는 월요일 시작이라 보정한다.

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PharmacyImageCarousel pharmacyName={pharmacy.name} />

      <section className="flex flex-col gap-3 rounded-none border-2 border-gray-950 bg-white p-4 dark:border-gray-50 dark:bg-gray-900">
        <h1 className="text-2xl font-black text-gray-950 dark:text-gray-50">{pharmacy.name}</h1>

        <div className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-300">
          <p className="flex flex-wrap items-center gap-2">
            <span>{pharmacy.addressRoad}</span>
            {pharmacy.distanceM !== null && <DistanceBadge meters={pharmacy.distanceM} />}
          </p>
          <a href={`tel:${pharmacy.phone}`} className="w-fit text-blue-600 hover:underline dark:text-blue-400">
            {pharmacy.phone}
          </a>
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
          <a
            href={`https://map.kakao.com/link/to/${encodeURIComponent(pharmacy.name)},${pharmacy.lat},${pharmacy.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-none border-2 border-gray-950 px-3 py-1.5 text-sm font-semibold uppercase tracking-wide text-gray-950 transition-colors hover:bg-gray-950 hover:text-white dark:border-gray-50 dark:text-gray-50 dark:hover:bg-gray-50 dark:hover:text-gray-950"
          >
            길찾기
          </a>
          {/* 이 사이트의 시그니처인 하드 섀도우 버튼 — 흰/검정 대비 위에 블루 섀도우가
              어긋나게 깔리고, 누르면 눌리는 듯 섀도우가 줄어든다. */}
          <Link
            href={`/reports/new?pharmacyId=${pharmacy.id}`}
            className="rounded-none border-2 border-gray-950 bg-gray-950 px-3 py-1.5 text-sm font-semibold uppercase tracking-wide text-white shadow-[3px_3px_0_0_#2563eb] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_#2563eb] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0_0_#2563eb] dark:border-gray-50 dark:bg-gray-50 dark:text-gray-950 dark:shadow-[3px_3px_0_0_#60a5fa] dark:hover:shadow-[5px_5px_0_0_#60a5fa] dark:active:shadow-[1px_1px_0_0_#60a5fa]"
          >
            이 약국에 가격 제보하기
          </Link>
        </div>
      </section>

      <section className="rounded-none border-2 border-gray-950 bg-white p-4 dark:border-gray-50 dark:bg-gray-900">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">영업시간</h2>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-4">
          {orderedHours.map((day) => {
            const hours = pharmacy.businessHours[day];
            const isToday = day === todayKey;
            return (
              <li
                key={day}
                className={`flex justify-between gap-2 ${isToday ? "font-semibold text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-300"}`}
              >
                <span>{DAY_LABEL[day] ?? day}</span>
                <span className={hours ? "" : "text-gray-500 dark:text-gray-400"}>
                  {hours ? `${hours[0]} - ${hours[1]}` : "휴무"}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-none border-2 border-gray-950 bg-white p-4 dark:border-gray-50 dark:bg-gray-900">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">취급 의약품</h2>
        <PharmacyDrugPrices pharmacyId={pharmacy.id} drugPrices={pharmacy.drugPrices} />
      </section>
    </div>
  );
}
