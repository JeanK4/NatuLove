import { BarraBusqueda } from "@/components/BarraBusqueda";
import { CampanaNotificaciones } from "@/components/CampanaNotificaciones";
import { getAlertasStock } from "@/lib/services";
import type { UsuarioActual } from "@/lib/auth";

export async function Topbar({ usuario }: { usuario: UsuarioActual }) {
  const alertas = await getAlertasStock();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-8">
      <BarraBusqueda />
      <div className="flex items-center">
        <CampanaNotificaciones alertas={alertas} />
      </div>
    </header>
  );
}
