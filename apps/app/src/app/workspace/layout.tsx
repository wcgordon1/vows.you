export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col bg-sand-50 overflow-hidden">
      {children}
    </div>
  );
}
