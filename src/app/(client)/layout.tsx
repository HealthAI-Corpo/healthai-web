import { ClientSidebar } from "@/components/layout/ClientSidebar";
 
export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ClientSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main
          id="main-content"
          className="flex-1 overflow-y-auto scrollbar-thin"
          tabIndex={0}
        >
          {children}
        </main>
      </div>
    </div>
  );
}