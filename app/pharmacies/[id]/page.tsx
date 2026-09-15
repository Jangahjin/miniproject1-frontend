import { apiFetch, ApiError } from "@/lib/api";
import { DistanceBadge } from "@/components/ui/DistanceBadge";
import { PharmacyDrugPrices, type DrugPrice } from "@/components/pharmacy-drug-prices";

// TODO(Task 013): 백엔드 T-19가 준비되면 API.md §4 실제 응답과 대조해 필드명을 검증한다.
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
    const message = error instanceof ApiError ? error.message : "약국 정보를 불러오지 못했습니다.";
    return <p role="alert">{message}</p>;
  }

  return (
    <div>
      <h1>{pharmacy.name}</h1>
      <p>
        {pharmacy.addressRoad}
        {pharmacy.distanceM !== null && (
          <>
            {" · "}
            <DistanceBadge meters={pharmacy.distanceM} />
          </>
        )}
      </p>
      <p>
        <a href={`tel:${pharmacy.phone}`}>{pharmacy.phone}</a>
      </p>
      <a
        href={`https://map.kakao.com/link/to/${encodeURIComponent(pharmacy.name)},${pharmacy.lat},${pharmacy.lng}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        길찾기
      </a>

      <ul>
        {Object.entries(pharmacy.businessHours).map(([day, hours]) => (
          <li key={day}>
            {DAY_LABEL[day] ?? day}: {hours ? `${hours[0]} - ${hours[1]}` : "휴무"}
          </li>
        ))}
      </ul>

      {/* FS-4(Task 018) 전까지는 버튼만 두고 비활성화한다 */}
      <button type="button" disabled>
        이 약국에 가격 제보하기
      </button>

      <PharmacyDrugPrices pharmacyId={pharmacy.id} drugPrices={pharmacy.drugPrices} />
    </div>
  );
}
