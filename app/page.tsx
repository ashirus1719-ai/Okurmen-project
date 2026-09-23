import Landing from "./ui/landing";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; direction?: string; course?: string }>;
}) {
  const query = await searchParams;
  return (
    <Landing
      initialCourse={query.course}
      initialLanguage={query.lang === "ky" ? "ky" : "ru"}
      initialFilter={
        query.direction === "code" || query.direction === "start"
          ? query.direction
          : "all"
      }
    />
  );
}
