import Link from "next/link";
import { DrugSearch } from "@/components/search/drug-search";
import { ScrollReveal } from "@/components/scroll-reveal";
import { HeroSlideshow } from "@/components/hero-slideshow";

const STEPS = [
  { number: "01", title: "약 검색", description: "찾는 약 이름을 입력하면 근처 약국 목록이 바로 떠요." },
  { number: "02", title: "가격 비교", description: "약국별 실제 판매가와 최저가를 큰 숫자로 한눈에 비교해요." },
  { number: "03", title: "방문 또는 제보", description: "가까운 약국을 찾아가거나, 다녀온 뒤 가격을 제보해 정보를 더해주세요." },
];

const FEATURES = [
  {
    title: "내 주변에서 바로",
    description: "GPS 또는 지역 선택으로 반경 500m~5km 내 약국을 한눈에 비교해요.",
    icon: (
      <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 29c6-6.5 9-11.2 9-15.5A9 9 0 1 0 7 13.5C7 17.8 10 22.5 16 29Z" />
        <circle cx="16" cy="13" r="3.2" />
      </svg>
    ),
  },
  {
    title: "숫자로 보는 최저가",
    description: "약국별 실제 판매가를 큰 숫자로 정렬해 가장 저렴한 곳이 바로 보여요.",
    icon: (
      <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 27h24M8 27V17M15 27V9M22 27V19" />
        <circle cx="15" cy="9" r="2.4" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    title: "다 같이 만드는 시세",
    description: "영수증으로 가격을 제보하면 다음 사람의 검색 결과가 더 정확해져요.",
    icon: (
      <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 8h22a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H14l-6 5v-5H5a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2Z" />
        <path d="M16 13v6M13 16h6" />
      </svg>
    ),
  },
];

const MARQUEE_ITEMS = ["실시간 최저가 비교", "내 주변 약국 찾기", "영수증으로 가격 제보", "회원가입 없이도 검색 가능"];
// translateX(-50%) 루프가 이음매 없이 반복되려면 두 반쪽이 완전히 같아야 한다 —
// half를 통째로 두 번 이어 붙여 total(=full)을 만든다.
const MARQUEE_HALF = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
const MARQUEE_FULL = [...MARQUEE_HALF, ...MARQUEE_HALF];

// 예전엔 이 자리에 도시 애니메이션(SVG)이 있었지만, 그래픽 없이 대형 타이포그래피와
// 색 블록만으로 히어로를 구성하기로 했다 — 남색(navy) 배경 위에 흰 글자로 강하게
// 대비를 준다. 라이트/다크 모드와 무관하게 히어로 자체는 항상 어두운 톤(라이트=남색,
// 다크=검정)으로 고정해, "네이비·하늘색·검정·회색·흰색" 팔레트를 둘 다 확실히 쓴다.
export default function Home() {
  return (
    <>
      <div className="relative mx-[calc(50%-50vw)] w-screen overflow-hidden bg-blue-950 dark:bg-black">
        <HeroSlideshow />
        <div className="relative z-[2] mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-20 text-center sm:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-400">약값 비교 서비스</p>
          {/* 모바일(390px)은 text-3xl이어야 "약 이름으로 근처 최저가 약국을"이
              한 줄에 들어간다 — 더 키우면 이 줄 자체가 폭을 넘겨 "약국을"이
              "약"/"국을"로 다시 쪼개지는 회귀가 있었다. 데스크톱만 더 키운다. */}
          <h1 className="text-3xl leading-tight font-black text-white sm:text-6xl sm:leading-tight">
            약 이름으로 근처
            <br />
            최저가 약국을 찾아보세요
          </h1>
          <div className="w-full max-w-md pt-2">
            <DrugSearch />
          </div>
        </div>
      </div>

      {/* 흐르는 마퀴 띠 — 밝은 하늘색 배경 대신 검정 바탕에 하늘색 글자로, 통통 튀는
          느낌을 빼고 시크하게 눌렀다. */}
      <div className="mx-[calc(50%-50vw)] w-screen overflow-hidden border-y-2 border-gray-950 bg-black py-2.5 dark:border-gray-50">
        <div className="marquee-track flex w-max gap-10">
          {MARQUEE_FULL.map((item, i) => (
            <span key={i} className="flex items-center gap-10 text-sm font-bold whitespace-nowrap uppercase tracking-widest text-sky-400">
              {item} <span aria-hidden="true" className="text-gray-600">/</span>
            </span>
          ))}
        </div>
      </div>

      <section className="flex flex-col gap-10 py-14 sm:py-20">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600 dark:text-sky-400">WHY 약핏</p>
            <h2 className="text-xl font-black text-gray-950 sm:text-2xl dark:text-gray-50">
              약값, 왜 약국마다 다를까요?
            </h2>
          </div>
          {/* 각진 인용구 카드 — 큰 따옴표 글리프 하나로 포인트를 준다. 둥근 블롭 대신
              직선과 왼쪽 두꺼운 바로 시크하게 눌렀다. sm 이상에서는 max-w-6xl 컨테이너
              오른쪽 여백을 뚫고 우측으로 당기되, 뷰포트 끝에 완전히 붙지 않도록 4rem
              여백을 남긴다 — 넓은 화면에서 카드가 가운데로 쏠려 보이지 않으면서도
              화면 끝에 딱 붙지는 않게. */}
          <div className="relative max-w-sm border-l-4 border-gray-950 bg-gray-950 p-5 pl-6 text-sm leading-relaxed text-gray-300 sm:mr-[calc(50%-50vw+4rem)] dark:border-sky-400 dark:bg-black">
            <span className="font-serif absolute -top-3 left-4 text-4xl text-sky-400" aria-hidden="true">
              &ldquo;
            </span>
            같은 일반의약품도 약국마다 판매가가 다릅니다.
            <br />
            약핏이 가장 저렴한 곳을 바로 찾아드려요.
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6">
          {FEATURES.map((feature, i) => (
            <ScrollReveal key={feature.title} delayMs={i * 100}>
              <div className="flex h-full flex-col items-start gap-4 border-2 border-gray-950 bg-white p-6 dark:border-gray-50 dark:bg-gray-900">
                <div className="flex h-12 w-12 items-center justify-center rounded-none bg-gray-950 text-sky-400 dark:bg-sky-400 dark:text-gray-950">
                  {feature.icon}
                </div>
                <h3 className="text-base font-bold text-gray-950 dark:text-gray-50">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-8 border-t-2 border-gray-950 py-14 sm:py-20 dark:border-gray-50">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600 dark:text-sky-400">HOW IT WORKS</p>
          <h2 className="text-xl font-black text-gray-950 sm:text-2xl dark:text-gray-50">이렇게 이용하세요</h2>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
          {STEPS.map((step, i) => (
            <ScrollReveal key={step.number} delayMs={i * 100}>
              <div className="flex flex-col gap-2">
                <span className="font-serif text-4xl font-semibold text-sky-500 tabular-nums dark:text-sky-400">{step.number}</span>
                <h3 className="text-base font-bold text-gray-950 dark:text-gray-50">{step.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{step.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* 히어로와 같은 남색/검정 블록으로 페이지를 마무리하며, 제보 참여(회원가입)로 이어준다. */}
      <div className="mx-[calc(50%-50vw)] w-screen bg-blue-950 dark:bg-black">
        <div className="relative z-[2] mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center sm:py-20">
          <h2 className="text-2xl font-black text-white sm:text-3xl">가격 제보로 함께 만들어가요</h2>
          <p className="max-w-md text-sm leading-relaxed text-sky-100/80">
            회원가입하고 다녀온 약국의 가격을 제보하면, 다음 사람의 검색 결과가 더 정확해져요.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/signup"
              className="rounded-none border-2 border-white bg-white px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-blue-950 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
            >
              회원가입
            </Link>
            <Link
              href="/login"
              className="rounded-none border-2 border-white px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white hover:bg-white hover:text-blue-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
            >
              로그인
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
