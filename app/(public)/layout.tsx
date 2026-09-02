import Footer from "@/components/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper font-malayalam text-ink">
      {children}
      <Footer />
    </div>
  );
}
