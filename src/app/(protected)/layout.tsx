import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { requireUsuario } from "@/lib/auth";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await requireUsuario();

  return (
    <>
      <Sidebar usuario={usuario} />
      <div className="ml-64 flex min-h-screen flex-col">
        <Topbar usuario={usuario} />
        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </>
  );
}
