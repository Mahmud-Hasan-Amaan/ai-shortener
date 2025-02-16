import ShortenUrl from "@/components/url/ShortenUrl";

export default function Page() {
  return (
    <section className="relative min-h-screen pt-40 pb-20">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-gray-900 to-cyan-900/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,0.7),rgba(17,24,39,1))]" />
      <div className="container relative z-10">
        <ShortenUrl />
      </div>
    </section>
  );
}
