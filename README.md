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

## 개발 Task 목록

크라우드소싱 기반 약국별 OTC 단가 DB 구축 및 최저가 추천 시스템.

**진행 규칙**
- Task는 번호 순서대로 하나씩 진행한다.
- Task 하나를 완료하면 그 자리에서 멈추고, 사용자에게 (1) 다음 Task로 진행할지 (2) 지금까지 변경사항을 커밋할지 확인한다. 사용자 확인 없이 다음 Task로 넘어가거나 임의로 커밋하지 않는다.
- 다음 Task로 넘어가기 전 관련 파일이 실제로 존재하는지 · 타입체크(`npx tsc --noEmit`)가 통과하는지 확인한다.

### Phase 0 — 프로젝트 기초 세팅 (완료)

- [x] Next.js 16 / React 19 / TypeScript strict 초기화
- [x] `.env.example` + `.gitignore` 예외 규칙 (`NEXT_PUBLIC_API_URL`)
- [x] 폴더 구조 (`components/{ui,pharmacy,price}`, `lib/api`, `types`, `hooks`)
- [x] `lib/api/client.ts` — 공통 fetch 래퍼 (`apiFetch`, `ApiError`, FormData 자동 감지)
- [x] 도메인 타입 정의 (`types/pharmacy.ts`, `types/medicine.ts`, `types/price.ts`)
- [x] `lib/api/price.ts` — `getRecommendations`, `submitPriceReport`
- [x] GitHub 원격 저장소(`origin`) 연결 확인

### Phase 1 — Git / 배포 준비

- [ ] Task 1.1: 지금까지 변경사항 커밋
  - 해야 할 것: `.gitignore`, `.env.example`, `lib/`, `types/` 변경사항을 `git add`로 스테이징하고 한글 커밋 메시지로 커밋한다.
- [ ] Task 1.2: 원격에 첫 push
  - 해야 할 것: `git push -u origin master`로 로컬 커밋을 GitHub 원격 저장소에 올리고 브랜치 추적을 설정한다.
- [ ] Task 1.3: 배포 타겟 결정
  - 해야 할 것: Vercel 등 배포 플랫폼을 사용자와 상의해 확정한다.
- [ ] Task 1.4: 배포 타겟에 프로젝트 연결
  - 해야 할 것: 확정된 플랫폼에 저장소를 연결하고 빌드 명령(`npm run build`)이 정상 동작하는지 확인한다.
- [ ] Task 1.5: 프로덕션 환경변수 등록
  - 해야 할 것: `.env.example`의 키를 배포 플랫폼 대시보드에 실제 값으로 등록한다.

### Phase 2 — 백엔드 연동 확정

- [ ] Task 2.1: 백엔드 API 스펙 확인
  - 해야 할 것: 백엔드 저장소의 API 문서/컨트롤러를 확인해 실제 엔드포인트 경로를 확정하고, `lib/api/price.ts`의 자리표시자 경로(`/api/recommendations`, `/api/price-reports`)를 교체한다.
- [ ] Task 2.2: 인증 방식 결정
  - 해야 할 것: 로그인/인증이 필요한지 사용자와 확정하고, 필요하다면 `apiFetch`에 토큰 주입 로직을 추가한다.
- [ ] Task 2.3: CORS 설정 확인
  - 해야 할 것: 백엔드 CORS 설정에 프론트엔드 origin(로컬/배포 도메인)이 허용되어 있는지 확인한다.
- [ ] Task 2.4: 에러 응답 포맷 반영
  - 해야 할 것: 백엔드 에러 응답 구조(에러코드 등)를 확인해 `ApiError`에 해당 필드를 추가한다.
- [ ] Task 2.5: 목데이터/모킹 방식 결정
  - 해야 할 것: 백엔드가 준비되지 않은 구간에서 프론트를 독립적으로 개발할 방법(MSW 등)을 결정한다.

### Phase 3 — 가격 제보 기능

- [ ] Task 3.1: 가격 제보 폼 컴포넌트
  - 해야 할 것: `components/price/PriceReportForm.tsx`를 만들어 약국명 · 약품명 · 가격 입력 필드를 구성한다.
- [ ] Task 3.2: 영수증 이미지 첨부 필드
  - 해야 할 것: 클라이언트 컴포넌트로 `<input type="file">`과 이미지 미리보기를 추가한다 (선택 입력).
- [ ] Task 3.3: 폼 제출 연동
  - 해야 할 것: 폼 제출 시 `submitPriceReport`를 호출하고 로딩 · 에러 상태를 처리한다.
- [ ] Task 3.4: 클라이언트 유효성 검사
  - 해야 할 것: 가격이 숫자이고 0보다 큰지, 필수 필드가 비어있지 않은지 제출 전에 검증한다.
- [ ] Task 3.5: 제출 성공/실패 피드백 UI
  - 해야 할 것: 토스트 또는 인라인 메시지로 제출 결과를 사용자에게 표시한다.
- [ ] Task 3.6: 약국명 · 약품명 자동완성
  - 해야 할 것: 백엔드의 `pg_trgm` 기반 검색 API가 준비되면 입력 필드에 자동완성을 연동한다 (Phase 2 완료 후 착수).
- [ ] Task 3.7: 제보 완료 후 폼 초기화
  - 해야 할 것: 제출 성공 시 폼을 초기화해 연속으로 여러 건을 제보할 수 있게 한다.

### Phase 4 — 최저가 추천 기능

- [ ] Task 4.1: 검색 페이지 UI
  - 해야 할 것: 약품명을 입력받는 검색 페이지를 만든다.
- [ ] Task 4.2: 위치 확보 로직
  - 해야 할 것: Phase 5에서 결정된 방식으로 위도 · 경도를 확보하는 로직을 구현한다.
- [ ] Task 4.3: 추천 결과 연동
  - 해야 할 것: `getRecommendations`를 호출하고 `components/pharmacy/RecommendationList.tsx`에 결과를 렌더링한다.
- [ ] Task 4.4: 로딩 · 빈 결과 · 에러 상태 UI
  - 해야 할 것: 각 상태에 맞는 화면(스피너, "결과 없음" 안내, 에러 메시지)을 구현한다.
- [ ] Task 4.5: 결과 정렬 옵션
  - 해야 할 것: 가격순 · 거리순으로 정렬할 수 있는 UI를 추가한다.
- [ ] Task 4.6: 약국 상세 정보 표시
  - 해야 할 것: 약국 주소와 최근 가격 이력을 볼 수 있는 상세 뷰를 추가한다.
- [ ] Task 4.7: 검색 결과 없음 안내
  - 해야 할 것: 검색 결과가 없을 때 재검색을 유도하는 안내 문구/UI를 추가한다.

### Phase 5 — 지도 / 위치 (미정)

- [ ] Task 5.1: 지도 방식 결정
  - 해야 할 것: 카카오맵 API 도입 여부를 사용자와 최종 확정한다.
- [ ] Task 5.2: 관련 키 추가
  - 해야 할 것: 결정된 방식에 필요한 API 키를 `.env.example`에 추가한다.
- [ ] Task 5.3: 위치 권한 UX
  - 해야 할 것: 위치 권한 요청 흐름과, 거부됐을 때의 대체 입력 방식(수동 주소 입력 등)을 구현한다.
- [ ] Task 5.4: 지도 마커 표시 (카카오맵 채택 시)
  - 해야 할 것: 추천 결과의 약국 위치를 지도 위에 마커로 표시한다.

### Phase 6 — 품질 / 테스트

- [ ] Task 6.1: 테스트 프레임워크 결정
  - 해야 할 것: Vitest, Playwright 등 도입 여부와 범위를 사용자와 확정한다.
- [ ] Task 6.2: 가격 제보 폼 단위 테스트
  - 해야 할 것: 폼 유효성 검사와 제출 로직에 대한 테스트를 작성한다.
- [ ] Task 6.3: 추천 로직 단위 테스트
  - 해야 할 것: 정렬 · 필터링 등 추천 관련 로직에 대한 테스트를 작성한다.
- [ ] Task 6.4: 포맷터 도입 결정
  - 해야 할 것: Prettier 등 포맷터 도입 여부를 확정하고, 도입 시 설정 파일을 추가한다.
- [ ] Task 6.5: 반응형 레이아웃 점검
  - 해야 할 것: 모바일 화면 폭 기준으로 주요 페이지 레이아웃을 점검하고 수정한다.
- [ ] Task 6.6: 접근성 점검
  - 해야 할 것: 폼 라벨 연결, 키보드만으로 조작 가능한지 등을 점검한다.

### Phase 7 — 마무리

- [ ] Task 7.1: 데모 링크 · 스크린샷 추가
  - 해야 할 것: 배포 완료 후 README에 실제 서비스 링크와 스크린샷을 추가한다.
- [ ] Task 7.2: 알려진 제약사항 정리
  - 해야 할 것: 목데이터 비중, 지도 미도입 여부 등 미니프로젝트 범위의 한계를 README에 명시한다.
