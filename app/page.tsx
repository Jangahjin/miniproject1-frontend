import { DrugSearch } from "@/components/search/drug-search";

export default function Home() {
  return (
    <div>
      <h1>약 이름으로 근처 최저가 약국을 찾아보세요</h1>
      <DrugSearch />
    </div>
  );
}
