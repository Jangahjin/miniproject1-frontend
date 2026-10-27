import Link from "next/link";
import type { ReactNode } from "react";
import { DrugSearch } from "@/components/search/drug-search";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SiteIntro } from "@/components/site-intro";
import { ScrollProgress } from "@/components/home/scroll-progress";
import { PriceCompareVisual } from "@/components/home/price-compare-visual";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { formatPrice } from "@/lib/format";
import { getHomeSnapshot, pickSpread, type PriceRow } from "@/lib/home-snapshot";

// 제목은 줄 단위로 묶고, 각 단어가 순서대로 올라오도록 전체 인덱스로 delay를 매긴다.
const HERO_LINES = [
  ["가장", "합리적인", "약값을"],
  ["가장", "가까운", "곳에서"],
];

// 백엔드가 꺼져 있을 때만 쓰는 대체 그래프 — caption에 "예시"임을 분명히 밝힌다.
const FALLBACK_ROWS: PriceRow[] = [
  { pharmacyId: 1, name: "약국 A", price: 1700, distanceM: 300 },
  { pharmacyId: 2, name: "약국 B", price: 1950, distanceM: 650 },
  { pharmacyId: 3, name: "약국 C", price: 2100, distanceM: 900 },
  { pharmacyId: 4, name: "약국 D", price: 2500, distanceM: 1300 },
  { pharmacyId: 5, name: "약국 E", price: 4000, distanceM: 1800 },
];

const ICONS = {
  search: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21c4.5-4.6 7-8.3 7-11.5a7 7 0 1 0-14 0C5 12.7 7.5 16.4 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  ),
  receipt: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
      <path d="M9 8h6M9 12h6" />
    </svg>
  ),
};

function StepCard({ step, title, description, icon }: { step: string; title: string; description: string; icon: ReactNode }) {
  return (
    <article className="card flex h-full flex-col gap-4 p-6 sm:p-7">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand dark:bg-sky-400/10 dark:text-sky-300">
        {icon}
      </span>
      <div>
        <p className="mb-1.5 text-xs font-extrabold tracking-[0.12em] text-sub dark:text-gray-400">{step}</p>
        <h3 className="mb-2 text-lg font-extrabold tracking-[-0.02em] text-ink dark:text-gray-50">{title}</h3>
        <p className="text-[15px] leading-[1.65] text-sub dark:text-gray-400">{description}</p>
      </div>
    </article>
  );
}

// 시안(pharmacy-front-redesign-final.html) 구조를 따르되 디자인 리뷰에서 나온 보완을 반영했다:
// - 히어로 배경은 실사 약국 사진 슬라이드쇼(HeroSlideshow) 위에 남색 그라디언트를 깐다.
// - 근거 없는 수치 대신 백엔드에서 받은 실제 가격 분포를 보여주고, 출처(시드/제보)를 항상 밝힌다.
// - 흘러가는 티커 대신 멈춰 있는 수치 3칸, 벤토는 서비스의 핵심인 "최저가"를 가장 크게.
// - 한글 단어 단위 줄바꿈(body의 keep-all), 본문 15px 이상, 행간 1.65~1.85, 문단 폭 46ch 이하.
export default async function Home() {
  const snapshot = await getHomeSnapshot();
  let wordIndex = 0;

  const ratio = snapshot ? (snapshot.maxPrice / snapshot.minPrice).toFixed(1) : null;
  const stats = snapshot
    ? [
        { value: `최대 ${ratio}배`, label: `${snapshot.areaLabel} 반경 ${snapshot.radiusLabel}, 같은 약의 약국별 가격 차이` },
        { value: formatPrice(snapshot.maxSaving), label: "같은 동네 안에서 아낄 수 있는 최대 금액" },
        snapshot.drugCount
          ? { value: `${snapshot.drugCount}종`, label: "가격을 비교할 수 있는 일반의약품" }
          : { value: `${snapshot.resultCount}곳`, label: `반경 ${snapshot.radiusLabel} 안에서 비교한 약국` },
      ]
    : [
        { value: "최대 5km", label: "반경 안의 약국을 한 화면에서 비교" },
        { value: "최저가순", label: "약국별 실제 판매가로 정렬" },
        { value: "가입 없이", label: "검색 한 번으로 바로 시작" },
      ];

  return (
    <>
      <SiteIntro />
      <ScrollProgress />

      {/* ---------- HERO ---------- */}
      {/* main의 pt-8을 -mt-8로 상쇄해 헤더 바로 아래부터 사진이 꽉 차게 붙인다. */}
      <section id="hero" className="relative -mt-8 mx-[calc(50%-50vw)] w-screen overflow-hidden bg-brand-deep">
        {/* 실사 약국 사진 3장이 5초마다 교차 페이드로 바뀐다 — 위에 남색 그라디언트를 깔아 흰 글자 가독성을 지킨다. */}
        <HeroSlideshow />

        <div className="relative z-[2] mx-auto flex max-w-6xl flex-col justify-center px-6 py-20 sm:px-10 sm:py-24 lg:min-h-[min(calc(100svh-62px),720px)]">
          <div>
            <p className="home-fade-up mb-5 text-xs font-bold tracking-[0.18em] text-[#C9D4E6]" style={{ animationDelay: "0.1s" }}>
              PHARMACY PRICE FINDER
            </p>
            <h1 className="mb-6 text-[clamp(34px,5vw,56px)] leading-[1.25] font-extrabold tracking-[-0.03em] text-white">
              {HERO_LINES.map((line, li) => (
                <span key={li} className="block">
                  {line.map((word) => {
                    const delay = 0.05 + wordIndex++ * 0.07;
                    return (
                      <span key={word + li} className="mr-[0.28em] inline-block overflow-hidden pb-[0.06em] align-top last:mr-0">
                        <span className="home-word" style={{ animationDelay: `${delay}s` }}>
                          {word}
                        </span>
                      </span>
                    );
                  })}
                </span>
              ))}
            </h1>
            <p
              className="home-fade-up mb-10 max-w-[32rem] text-base leading-[1.75] tracking-[-0.01em] text-[#DCE1E9] sm:text-[17px]"
              style={{ animationDelay: "0.55s" }}
            >
              약 이름 하나만 검색하면 내 주변 약국들의 판매가를 한눈에 비교할 수 있어요. 더 이상 발품 팔지 않아도 됩니다.
            </p>
            <div className="home-fade-up relative z-10 w-full max-w-[540px]" style={{ animationDelay: "0.75s" }}>
              <DrugSearch variant="hero" />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- 수치 띠 — 흘러가는 티커 대신 멈춰 있는 3칸 ---------- */}
      <div className="mx-[calc(50%-50vw)] w-screen bg-brand-deep">
        <dl className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-white/10 px-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-10">
          {stats.map((stat) => (
            <div key={stat.value} className="flex flex-col gap-1.5 py-6 sm:px-8 sm:py-8 sm:first:pl-0">
              <dt className="order-2 text-[13px] leading-snug text-[#AEB9CB]">{stat.label}</dt>
              <dd className="order-1 text-2xl font-extrabold tracking-[-0.02em] text-white tabular-nums sm:text-[28px]">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* ---------- HOW IT WORKS — 핵심(최저가)을 가장 크게 ---------- */}
      <section className="py-20 sm:py-28">
        <ScrollReveal className="mb-12 max-w-[640px] sm:mb-14">
          <p className="eyebrow mb-4">HOW IT WORKS</p>
          <h2 className="text-[clamp(26px,3vw,36px)] leading-[1.35] font-extrabold tracking-[-0.02em] text-balance text-ink dark:text-gray-50">
            약핏이 가격 비교를 대신해드립니다
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[auto_auto]">
          <ScrollReveal className="md:col-span-2 lg:row-span-2">
            <article className="flex h-full flex-col justify-between gap-10 rounded-card border border-mint/50 bg-mint-soft p-7 sm:p-9 dark:border-mint/20 dark:bg-mint/5">
              <div>
                <p className="mb-2 text-xs font-extrabold tracking-[0.12em] text-mint-strong dark:text-mint">STEP 03 · 핵심</p>
                <h3 className="mb-3 text-2xl font-extrabold tracking-[-0.02em] text-ink sm:text-[28px] dark:text-gray-50">
                  가장 싼 약국부터 보여드려요
                </h3>
                <p className="max-w-[40ch] text-[15px] leading-[1.7] text-ink-soft dark:text-gray-300">
                  거리와 정보의 신선도까지 따져 추천하고, 원하면 가격순으로 바로 바꿔 볼 수 있어요.
                </p>
              </div>
              {snapshot ? (
                <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
                  <div>
                    <p className="text-xs font-semibold text-sub dark:text-gray-400">최저가</p>
                    <p className="text-[clamp(32px,4vw,44px)] leading-none font-extrabold tracking-[-0.03em] text-mint-strong tabular-nums dark:text-mint">
                      {formatPrice(snapshot.minPrice)}
                    </p>
                  </div>
                  <p className="pb-1 text-lg font-bold text-sub dark:text-gray-500">vs</p>
                  <div>
                    <p className="text-xs font-semibold text-sub dark:text-gray-400">최고가</p>
                    <p className="text-[clamp(24px,3vw,32px)] leading-none font-extrabold tracking-[-0.03em] text-sub line-through decoration-2 tabular-nums dark:text-gray-500">
                      {formatPrice(snapshot.maxPrice)}
                    </p>
                  </div>
                  <p className="w-full text-xs text-sub dark:text-gray-500">
                    {snapshot.drugName} · {snapshot.areaLabel} 반경 {snapshot.radiusLabel} · {snapshot.sourceLabel}
                  </p>
                </div>
              ) : (
                <p className="text-[15px] font-bold text-mint-strong dark:text-mint">최저가 약국에 민트색 표시가 붙어요.</p>
              )}
            </article>
          </ScrollReveal>
          <ScrollReveal delayMs={80}>
            <StepCard step="STEP 01" title="약 이름 검색" description="찾는 약 이름만 입력하면 판매 중인 약국 목록이 바로 나타나요." icon={ICONS.search} />
          </ScrollReveal>
          <ScrollReveal delayMs={160}>
            <StepCard step="STEP 02" title="근처 약국 비교" description="내 위치 기준 반경 500m~5km 안의 가격과 거리를 함께 비교해요." icon={ICONS.pin} />
          </ScrollReveal>
          <ScrollReveal delayMs={240} className="md:col-span-2">
            <StepCard
              step="STEP 04"
              title="제보로 최신 유지"
              description="다녀온 약국의 가격을 영수증과 함께 제보하면, 다음 사람의 검색 결과가 더 정확해져요."
              icon={ICONS.receipt}
            />
          </ScrollReveal>
        </div>
      </section>

      {/* ---------- STORY — 왼쪽 고정 그래픽 + 오른쪽 본문 ---------- */}
      <section className="mx-[calc(50%-50vw)] w-screen bg-mist dark:bg-gray-950">
        {/* 넓은 화면에서도 어두운 패널이 화면 왼쪽 끝까지 차도록 컨테이너로 가두지 않는다. */}
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="relative">
            <div className="flex min-h-[480px] items-center justify-center bg-[linear-gradient(160deg,#13233F_0%,#0B1424_100%)] py-14 lg:sticky lg:top-[62px] lg:h-[calc(100vh-62px)]">
              {snapshot ? (
                <PriceCompareVisual
                  title={snapshot.drugName}
                  rows={pickSpread(snapshot.rows)}
                  caption={`${snapshot.areaLabel} 반경 ${snapshot.radiusLabel} 약국 ${snapshot.resultCount}곳 중 가격대별로 고른 5곳 · 출처: ${snapshot.sourceLabel}`}
                />
              ) : (
                <PriceCompareVisual title="타이레놀 500mg 8정" rows={FALLBACK_ROWS} caption="위 수치는 이해를 돕기 위한 예시입니다." />
              )}
            </div>
          </div>
          <div className="flex max-w-[640px] flex-col justify-center gap-12 px-6 py-16 sm:px-10 lg:py-[12vh] lg:pr-14 lg:pl-16">
            <ScrollReveal>
              <p className="eyebrow mb-4">WHY WE BUILT THIS</p>
              <h2 className="mb-6 text-[clamp(24px,2.6vw,32px)] leading-[1.4] font-extrabold tracking-[-0.02em] text-ink dark:text-gray-50">
                약국마다 다른 가격,
                <br />
                소비자는 알기 어렵습니다
              </h2>
              <p className="max-w-[46ch] text-base leading-[1.85] text-ink-soft dark:text-gray-300">
                같은 일반의약품도 약국에 따라 판매가가 꽤 차이 나지만, 정작 그 정보를 미리 확인할 방법은 거의 없었습니다.
              </p>
              <p className="mt-4 max-w-[46ch] text-base leading-[1.85] text-ink-soft dark:text-gray-300">
                약핏은 무작정 가까운 약국이 아니라, 가까우면서도 가장 합리적인 약국을 먼저 알려드립니다.
              </p>
            </ScrollReveal>
            <ScrollReveal>
              <dl className="grid grid-cols-1 gap-8 border-t border-line pt-8 sm:grid-cols-2 sm:gap-6 dark:border-gray-800">
                <div>
                  <dt className="mb-2 text-xl font-extrabold tracking-[-0.02em] text-brand dark:text-sky-400">데이터 기반</dt>
                  <dd className="text-[15px] leading-[1.7] text-sub dark:text-gray-400">
                    판매가와 이용자 제보를 모아, 튀는 값은 걸러내고 대표 가격을 계산합니다.
                  </dd>
                </div>
                <div>
                  <dt className="mb-2 text-xl font-extrabold tracking-[-0.02em] text-brand dark:text-sky-400">위치 기반</dt>
                  <dd className="text-[15px] leading-[1.7] text-sub dark:text-gray-400">내 위치에서 가까운 약국부터 거리와 함께 보여드립니다.</dd>
                </div>
              </dl>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="relative mx-[calc(50%-50vw)] w-screen overflow-hidden bg-ink px-6 py-24 text-center text-white sm:py-28">
        <div
          aria-hidden="true"
          className="home-drift absolute -inset-x-[10%] -inset-y-[40%] bg-[radial-gradient(circle_at_30%_30%,rgba(31,60,102,0.55),transparent_60%)]"
        />
        <ScrollReveal className="relative z-[1] mx-auto flex max-w-xl flex-col items-center">
          <h2 className="mb-4 text-[clamp(26px,3.2vw,40px)] leading-[1.3] font-extrabold tracking-[-0.025em] text-balance">
            지금 바로 약값을 비교해보세요
          </h2>
          <p className="mb-10 text-base leading-[1.7] text-[#B7BAC0]">가입 없이, 검색 한 번으로 시작할 수 있습니다.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="#hero"
              className="inline-flex items-center gap-2 rounded-control bg-white px-8 py-4 text-[15px] font-extrabold text-ink transition hover:-translate-y-[3px] hover:shadow-[0_14px_30px_rgba(0,0,0,0.3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
            >
              약핏 시작하기 →
            </a>
            <Link
              href="/signup"
              className="inline-flex items-center rounded-control border border-white/30 px-6 py-4 text-[15px] font-bold text-white transition hover:border-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
            >
              회원가입하고 가격 제보하기
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
