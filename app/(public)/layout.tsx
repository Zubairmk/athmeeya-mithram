export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-shell font-malayalam text-shell-muted">
      {children}
    </div>
  );
}
