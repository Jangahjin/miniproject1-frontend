import { DrugSearch } from "@/components/search/drug-search";

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-8 py-12 text-center">
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
        약 이름으로 근처 최저가 약국을 찾아보세요
      </h1>
      <div className="w-full max-w-md">
        <DrugSearch />
      </div>
    </div>
  );
}
