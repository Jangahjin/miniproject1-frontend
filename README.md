This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 개발 Task 목록 (비공식 캐시)

> ⚠️ **이 목록은 공식 로드맵이 아니다.** 이 프로젝트(pharmaprice / miniProject1)의 공식 로드맵은 `D:\claude\miniProject1\docs\ROADMAP.md`(FS-슬라이스 + T-01~T-37 체계, `development-planner` 에이전트와 mcp-shrimp-task-manager가 관리)이며, 이 문서와 내용이 어긋나면 **공식 로드맵이 항상 우선**한다. 이 목록은 `miniproject1-frontend` 저장소 안에서 진행 상황을 빠르게 훑기 위한 비공식 캐시로, 각 Task마다 대응하는 공식 T-xx를 명시한다. 상세 구현 가이드·완료 판정·함정은 해당 T-xx 카드를 참고할 것 — 여기서 중복 서술하지 않는다.

**표기 규칙** (todo_project 컨벤션 준용)
- Task 번호는 이 문서 전체에서 연속(`Task 001`, `Task 002` …)이며 그룹 안에서 재사용하지 않는다.
- 상태: `✅ 완료` / `🔥 우선순위`(지금 착수) / 표기 없음(대기)
- 각 Task는 **영역**, **선행**, **대응 공식 Task**, 구현 체크리스트를 가진다.
- **각 Task 완료 후 관련 검증(타입체크 `npx tsc --noEmit`, 필요 시 `npm run build`)을 통과시키고, 다음 Task로 넘어가기 전에 멈춰서 사용자에게 진행/커밋 여부를 확인한다.** 사용자 확인 없이 다음 Task로 넘어가거나 임의로 커밋하지 않는다.

---

## 그룹 1 — 셋업 (공식 FS-0 대응)

### Task 001: 환경변수 템플릿 구성 ✅ 완료

**영역**: FE | **대응 공식 Task**: T-01

- [x] `.env.example`에 `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_KAKAO_MAP_KEY` 정의 (스펙에 맞춰 `NEXT_PUBLIC_API_URL`에서 개명)
- [x] `.gitignore`에 `.env*` 무시 + `!.env.example` 예외 규칙

### Task 002: 폴더 구조 스켈레톤 ✅ 완료

**영역**: FE | **선행**: Task 001 | **대응 공식 Task**: T-04

- [x] `components/`, `lib/`, `types/`, `hooks/` 생성
- [ ] (참고, 미처리) 저장소 폴더명이 스펙 표기(`miniProject1_frontEnd`)와 다름(`miniproject1-frontend`) — 이번 라운드에서는 리네임하지 않기로 결정함

### Task 003: 공통 API 클라이언트 ✅ 완료

> ⚠️ **실측 정정**: T-04 완료 판정에 "apiFetch 단위 테스트 4종 통과(정상/JSON 에러/비-JSON 에러/204)"가 있는데 이 Task에서 빠뜨렸다. 아직 테스트 도구 자체가 설치되어 있지 않아 지금 당장 충족 불가 — Task 026으로 분리해 뒤에서 처리한다.

**영역**: FE | **선행**: Task 001 | **대응 공식 Task**: T-04

- [x] `lib/api.ts` 단일 파일로 통합 (`lib/api/client.ts` + `lib/api/price.ts` 분리 구조 폐기)
- [x] `ApiError(status, code, message, fieldErrors?, traceId?)` — API.md §1.2 에러 바디 형식 반영
- [x] `204 No Content` → `undefined` 반환, JSON 파싱 실패 시에도 `ApiError`로 던짐
- [x] `FormData` 자동 감지 시 `Content-Type` 강제 안 함
- [ ] `auth` 옵션은 시그니처만 고정, 실제 토큰 주입은 Task 019(T-25)에서

### Task 004: 배포 관련 설정 원복 ✅ 완료

**영역**: FE | **대응 근거**: PRD.md §2.2 비목표, §8, §11

> PRD가 "프로덕션 클라우드 배포·컨테이너화는 범위 밖, 로컬 직접 실행까지만 다룬다(Docker 미사용)"고 명시한 걸 뒤늦게 확인. 이전에 진행했던 EC2 배포 결정과 `next.config.ts`의 `output: "standalone"` 설정은 스펙 밖이라 되돌림.

- [x] `next.config.ts`의 `output: "standalone"` 제거
- [x] 이전 EC2 배포 결정 무효화 (이 프로젝트는 배포하지 않는다)

### Task 005: Git 커밋 및 원격 push ✅ 완료

**영역**: 공통 | **선행**: Task 001~003 | **대응 공식 Task**: T-01(Git 저장소 구성)

- [x] `.gitignore`, `.env.example`, `lib/`, `types/`, `README.md` 커밋 (`6b49318`, `5af7715`)
- [x] `git push -u origin master`로 `origin` 원격에 push, 브랜치 추적 설정

### Task 006: openapi-typescript 타입 생성 파이프라인

**영역**: FE | **선행**: 백엔드 T-03(Swagger UI 노출) | **대응 공식 Task**: T-04

- [ ] `openapi-typescript`를 devDependency로 추가
- [ ] `package.json`에 `gen:api` 스크립트 추가 (`/v3/api-docs` → `types/api.ts`)
- [ ] 수기 타입 정의 금지 원칙 확인 — 이전에 만들었던 `types/{pharmacy,medicine,price}.ts`는 이미 삭제함

**메모**: 백엔드가 아직 없어 지금은 실행 불가. 백엔드가 T-03까지 진행되어 `/swagger-ui.html`이 열리는 시점에 착수.

### Task 007: 공통 컴포넌트 & 포맷 유틸 ✅ 완료

**영역**: FE | **선행**: Task 002 | **대응 공식 Task**: T-04

- [x] `lib/format.ts` — `formatPrice`, `formatDistance`, `formatRelativeDate`
- [x] `components/ui/PriceTag.tsx`(천단위 콤마), `DistanceBadge.tsx`(1000m 기준 단위 전환)
- [x] `EmptyState.tsx`, `ErrorState.tsx`(재시도 버튼 포함, `"use client"`), `LoadingSkeleton.tsx`
- [ ] 스타일링(Tailwind/shadcn)은 아직 안 함 — 지금은 마크업·시그니처만

### Task 008: 루트 레이아웃 + 목데이터 고지 배너 ✅ 완료

**영역**: FE | **선행**: Task 002, Task 007 | **대응 공식 Task**: T-04

- [x] `app/layout.tsx`에 헤더 / 메인 / 푸터 골격 (위치 표시는 Task 010, 로그인 링크는 Task 016에서 채움)
- [x] `components/ui/NoticeBanner.tsx` — "본 서비스의 가격은 학습용 예시 데이터입니다" (PRD §9)
- [x] 헤더 하단 + 푸터 양쪽에 노출
- [x] `npm run dev` 기동 후 `curl`로 렌더링된 HTML에 배너 텍스트 존재 확인

### Task 009: 상태 관리 · 폼 · 차트 라이브러리 셋업 ✅ 완료

**영역**: FE | **선행**: Task 002, Task 008 | **대응 공식 Task**: T-04

- [x] TanStack Query, Redux Toolkit, React Hook Form + Zod, Recharts 설치
- [x] `app/providers.tsx` — `QueryClientProvider` + Redux `Provider`, `layout.tsx`에 연결
- [x] `store/index.ts` + `store/slices/{location,auth,report-draft}-slice.ts` 골격 (reducers는 비워둠 — Task 010/017/018에서 채움)
- [ ] 검색 결과는 서버 컴포넌트 SSR + URL 쿼리로 유지 — TanStack Query로 옮기지 않는다 (development-planner 프론트 경계 규칙, Task 012에서 지킬 것)

---

## 그룹 2 — 최저가 검색 (공식 FS-2 대응, 핵심 슬라이스)

### Task 010: 위치 획득 및 지역 폴백 ✅ 완료 (백엔드 의존 부분 제외)

**영역**: FE | **선행**: Task 008, Task 009 | **대응 공식 Task**: T-16

> ⚠️ T-14(`GET /api/v1/regions`)가 없어 `RegionPicker`의 실제 데이터 연동은 검증 못 함 — 필드명(`sido`/`districts`/`centerLat` 등)은 API.md §7 추정치이며 백엔드 완성 후 대조 필요.

- [x] `store/slices/location-slice.ts` — T-16 스펙 상태 머신 (`idle/requesting` → `granted`(GPS) / `fallback`(REGION) / `denied`/`unavailable`) + 단위 테스트 6종
- [x] `hooks/use-user-location.ts` — `getCurrentPosition({ enableHighAccuracy: false, timeout: 8000 })`, try/catch로 시크릿 모드 대비, `sessionStorage` rehydrate
- [x] `components/region-picker.tsx` — `denied`/`unavailable` 시 자동 표시 (⚠️ 응답 필드 미검증)
- [x] `components/location-indicator.tsx` — 헤더에 연결, `npm run dev`로 "위치 설정 안 됨" 렌더링 확인
- [x] `npx tsc --noEmit` 통과 중 discriminated union 초기값 관련 실제 타입 버그 발견·수정 (`: Type =` → `as Type` 캐스팅으로 createSlice 제네릭 추론 오류 해결)

### Task 011: 홈 화면 + 약품 자동완성 ✅ 완료 (백엔드 의존 부분 제외)

**영역**: FE | **선행**: Task 009, Task 010 | **대응 공식 Task**: T-17

> ⚠️ T-13(`GET /api/v1/drugs?q=`)가 없어 실제 자동완성 동작은 검증 못 함 — `DrugSummary` 필드명(`id`/`displayName`/`packageUnit`)은 API.md §3 추정치.

- [x] `components/search/drug-search.tsx` — 중앙 검색창 + 인기 약품 칩 6개(타이레놀/게보린/판콜에이/베아제/펜잘/판피린)
- [x] TanStack Query `useQuery`로 `GET /api/v1/drugs?q=&size=8` (300ms 디바운스, `useDebouncedValue` 자체 구현)
- [x] 결과 항목에 `displayName` + `packageUnit` 함께 표시
- [x] 키보드 내비게이션(↑↓/Enter/Esc), `role="combobox"` + `aria-activedescendant`
- [x] 선택 시 `/search?drugId={id}&lat=&lng=&radius=2000`으로 이동, 위치 `idle`이면 Task 010의 `requestLocation` 먼저 호출
- [x] `app/page.tsx`를 create-next-app 기본 템플릿에서 실제 홈 화면으로 교체, `npm run dev`로 렌더링 확인

### Task 012: 검색 결과 화면 ✅ 완료 (백엔드 의존 부분 제외)

**영역**: FE | **선행**: Task 011 | **대응 공식 Task**: T-18

> ⚠️ T-15(`GET /api/v1/search`)가 없어 실제 검색 동작은 검증 못 함. 다만 응답 구조는 API.md §5 예시 JSON을 그대로 읽고 만들어서(추정 아님) `SearchResultItem`/`SearchResponse` 필드가 실제 스펙과 일치한다.

- [x] `app/search/page.tsx` — 서버 컴포넌트로 `GET /api/v1/search` 호출(SSR), `drugId`+(`lat`+`lng` 또는 `regionCode`) 필수 검증
- [x] `radius`(500/1000/2000/5000, 기본 2000), `sort`(SCORE/PRICE/DISTANCE, 기본 SCORE) 값 검증 및 기본값 처리
- [x] `components/pharmacy-result-card.tsx` — 대표가격/최저가, 거리, 제보 수, 갱신일, 절약액, 뱃지(`LOWEST_PRICE`/`LOW_CONFIDENCE`/`STALE_DATA`) 표시
- [x] `components/sort-toggle.tsx` — `SortToggle`(정렬), `RadiusFilter`(반경) — `<Link>` 기반 URL 쿼리 변경(뒤로가기 자동 지원)
- [x] 결과 0건 시 `suggestion.recommendedRadius`로 반경 확대 링크 제공
- [x] `dataSource`가 `SEED`/`MIXED`면 결과 상단에 고지 배너 추가 노출
- [x] 파라미터 누락 / API 에러 시 크래시 없이 안내 메시지 표시 — `curl`로 두 경우 모두 확인
- [ ] 지도 영역(우측, T-22)은 아직 자리만 비워둠 — Task 015에서 채움

---

## 그룹 3 — 약국 상세 (공식 FS-3 대응)

### Task 013: 약국 상세 페이지 ✅ 완료 (백엔드 의존 부분 제외)

**영역**: FE | **선행**: Task 012 | **대응 공식 Task**: T-21

> ⚠️ T-19(백엔드, 약국 상세 API)가 없어 실제 데이터 연동은 검증 못 함. 응답 타입은 API.md §4 예시 JSON을 그대로 반영(추정 아님).

- [x] `app/pharmacies/[id]/page.tsx` — 약국 정보(주소·전화 `tel:`·카카오맵 길찾기 링크·영업시간·거리), `drugPrices` 표(가격 오름차순, 전국 평균 대비 색상)
- [x] "가격 제보하기" 버튼 — FS-4(Task 018) 전까지 `disabled`
- [x] `components/pharmacy-result-card.tsx`에서 약국명 클릭 시 상세 페이지로 이동 (T-21 완료 판정 항목)
- [x] API 에러 시 크래시 없이 안내 메시지 — `curl`로 확인

### Task 014: 가격 이력 차트 ✅ 완료 (백엔드 의존 부분 제외)

**영역**: FE | **선행**: Task 009, Task 013 | **대응 공식 Task**: T-21

> ⚠️ T-20(백엔드, 가격 이력 API)이 없어 실제 데이터 연동은 검증 못 함.

- [x] `components/pharmacy-drug-prices.tsx` — 약품 행 클릭 시 펼침/접힘, 펼치면 `PriceHistoryChart` 렌더
- [x] `components/price-history-chart.tsx` — Recharts `LineChart`, TanStack Query로 이력 fetch
- [x] `flagged:true` 점은 회색 점(테두리 대시) + 툴팁에 "통계에서 제외된 제보" 표시
- [x] 이력 0건이면 안내 메시지 표시 (코드로 분기 처리)
- [ ] 이력 1건일 때 `LineChart`가 깨지지 않는지는 실제 데이터로 검증 못 함 — 백엔드 연동 후 확인 필요

### Task 015: 카카오맵 마커 연동 ✅ 완료 (실제 지도 렌더링은 육안 미검증)

**영역**: FE | **선행**: Task 012 | **대응 공식 Task**: T-22 (P1)

> ⚠️ 이 세션엔 브라우저가 없고 백엔드도 없어서 실제 지도 렌더링(마커 위치, 가격 라벨, SDK 로딩)은 **육안으로 확인 못 함**. 타입체크·린트·빌드만 통과 상태. 실제 카카오 키를 `.env.local`에 넣고 브라우저에서 직접 확인 필요.

- [x] `components/pharmacy-map.tsx` — `next/script`(`strategy="afterInteractive"`)로 SDK 로드, `"use client"`
- [x] 사용자 위치 + 후보 약국 마커, `CustomOverlay`로 가격 라벨(1위는 파란색, 나머지는 검정)
- [x] `components/search-results.tsx` — 리스트 hover 시 마커로 pan, 마커 클릭 시 리스트로 스크롤(`scrollIntoView`)
- [x] `LatLngBounds`로 전체 결과가 보이게 자동 줌
- [x] SDK `onError` 시 `sdkFailed` 상태로 지도 영역만 숨김 (실제 스크립트 실패 시나리오는 미검증)
- [x] window.kakao 타입을 `any` 대신 실제 사용하는 API 표면만 최소 인터페이스로 선언 (eslint `no-explicit-any` 통과)
- [ ] `NEXT_PUBLIC_KAKAO_MAP_KEY` 실제 값 발급 및 카카오 콘솔에 `http://localhost:3000` 도메인 등록 — 사용자가 직접 처리해야 함

---

## 그룹 4 — 인증 + 제보 (공식 FS-4 대응)

### Task 016: 로그인 / 회원가입 화면 ✅ 완료 (백엔드 의존 부분 제외)

**영역**: FE | **선행**: Task 009 | **대응 공식 Task**: T-25 (⚠️ 이전에 T-24로 잘못 매핑했었음 — T-24는 백엔드 전용 인증 API)

> ⚠️ T-23/T-24(백엔드)가 없어 실제 가입·로그인은 검증 못 함. `curl`로 라우트 핸들러가 500을 정상 반환하고 서버가 죽지 않는 것만 확인.

- [x] `app/(auth)/login/page.tsx`, `app/(auth)/signup/page.tsx` — React Hook Form + Zod 클라이언트 검증 (API.md §2 규칙과 동일: 비밀번호 8~64자 영문+숫자, 닉네임 2~30자)
- [x] `useSearchParams()`를 쓰는 로그인 폼은 `Suspense`로 감싸야 정적 프리렌더가 통과함 (빌드 에러로 발견)

### Task 017: 인증 상태 관리 및 세션 유지 ✅ 완료 (백엔드 의존 부분 제외)

**영역**: FE | **선행**: Task 016 | **대응 공식 Task**: T-25

> ⚠️ 아래 항목 중 실제 토큰 발급·검증이 필요한 부분은 백엔드 없이 코드만 작성했고 end-to-end 검증은 못 함.

- [x] `store/slices/auth-slice.ts` — `login`/`logout` thunk, `setSession`/`clearSession`, `accessToken`은 Redux 메모리에만 보관 (localStorage 사용 안 함)
- [x] `lib/auth-cookie.ts` + `app/api/auth/{login,signup,refresh,logout}/route.ts` — refreshToken은 Next Route Handler가 httpOnly 쿠키로만 다루고 클라이언트 JS에 노출 안 됨. `/auth/refresh`는 토큰 회전(rotation) 반영
- [x] `lib/api.ts`에 401 인터셉터 추가 — `auth:true` 호출이 401이면 `/api/auth/refresh` 1회 시도 후 재요청, 무한 루프 방지용 `isRetry` 플래그
- [x] `components/auth-bootstrap.tsx` — 새로고침 시 `accessToken`이 없으면 refreshToken 쿠키로 세션 자동 복원 시도
- [x] `components/auth-status.tsx` — 헤더에 닉네임/로그아웃 또는 로그인 링크 표시
- [x] `middleware.ts` — `/reports/new`, `/me`, `/admin/*`를 refreshToken 쿠키 존재 여부로 보호, `?next=`로 복귀 경로 전달 (`curl`로 307 리다이렉트 확인)
- [ ] "가입→로그인→헤더 표시→로그아웃", "만료 후 자동 갱신", "새로고침해도 유지" — 전부 실제 백엔드 필요, 미검증
- **메모**: `lib/api.ts`가 `@/store`를 동적 import — Node 서버 프로세스에서 모듈이 프로세스 전역에 캐시되는 특성상 서버 컴포넌트 컨텍스트에서는 요청 간 상태 공유가 이론상 가능하나, `auth:true` 호출은 전부 클라이언트 컴포넌트에서만 발생하므로 이 스코프에서는 문제 없음

### Task 018: 가격 제보 폼

**영역**: FE | **선행**: Task 017 | **대응 공식 Task**: T-26, T-29

- [ ] 약국 선택(검색/지도) → 약품 선택(자동완성) → 가격 → 구매일
- [ ] `reportDraftSlice`(Redux Toolkit)로 임시 입력 보존 (비로그인 시 로그인 페이지 리다이렉트 후 복원)
- [ ] 가격 100~200,000원 정수 검증 (React Hook Form + Zod)

### Task 019: 영수증 업로드

**영역**: FE | **선행**: Task 018 | **대응 공식 Task**: T-27 (P1 — 일정 빠듯하면 잘라낼 항목)

- [ ] jpg/png/webp, 5MB 이하 첨부 필드, 미리보기 (필수 아님, OCR 없음)

### Task 020: 내 제보 목록

**영역**: FE | **선행**: Task 018 | **대응 공식 Task**: T-30 (P1 — 일정 빠듯하면 잘라낼 항목)

- [ ] `/me` — 내가 올린 제보 목록과 상태 표시

---

## 그룹 5 — 관리자 (공식 FS-5 대응, P2)

### Task 021: 관리자 대시보드 · 통계

**영역**: FE | **선행**: Task 017 | **대응 공식 Task**: T-31~T-33 (P2 — 일정 빠듯하면 가장 먼저 통째로 잘라내는 그룹)

- [ ] 요약 지표, 지역별·약품별 통계 테이블/차트 (TanStack Query)

### Task 022: 이상치 제보 관리

**영역**: FE | **선행**: Task 021 | **대응 공식 Task**: T-34 (P2)

- [ ] `flagged=true` 제보 목록, 숨김/복구 처리

---

## 그룹 6 — 마감 (공식 FS-6 대응)

### Task 023: 예외 처리 · 에러 바운더리

**영역**: FE | **대응 공식 Task**: T-35

- [ ] `ApiError` 기반 공통 에러 처리, 사용자 메시지 매핑

### Task 024: 반응형 점검

**영역**: FE | **대응 공식 Task**: T-36

- [ ] 모바일 우선 — 지도 상단 40vh + 리스트 바텀시트 구조
- [ ] 375px 폭에서 레이아웃 깨짐 없는지 확인

### Task 025: 수동 완주 체크리스트

**영역**: 공통 | **대응 공식 Task**: T-37

- [ ] 검색 → 결과 → 상세 → 제보 → 재검색 흐름 무중단 확인
- [ ] 클린 클론 상태에서 README 절차만으로 재현 가능한지 확인

---

## 그룹 7 — 누락분 보강

### Task 026: apiFetch 단위 테스트 (T-04 완료 판정 누락분) ✅ 완료

**영역**: FE | **선행**: Task 003 | **대응 공식 Task**: T-04

> Task 003을 완료 처리할 때 빠뜨린 걸 여기서 보강했다. PRD §4가 프론트 유틸 테스트 도구로 Vitest를 이미 확정해뒀다 (열린 질문 아님).
> ⚠️ **부수 발견**: `@types/node`가 `^20`으로 고정돼 있었는데, development-planner.md 고정 스택은 **Node.js 22**다. vitest 5가 `@types/node >=22`를 요구해 설치 중 충돌로 드러났다 — `^22.20.2`로 올려서 스펙에 맞춤.

- [x] Vitest devDependency 설치 (`^5.0.0`) + `package.json`에 `test` 스크립트(`vitest run`) 추가
- [x] `@types/node`를 `^20` → `^22.20.2`로 정정 (Node 22 고정 스펙 반영)
- [x] `lib/api.test.ts` — `apiFetch` 단위 테스트 4종: 정상 응답 / JSON 에러 응답 / 비-JSON 에러 응답(HTML) / `204 No Content` — `npm test` 4개 전부 통과
