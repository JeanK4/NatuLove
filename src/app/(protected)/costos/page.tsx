import { CostosProduccionView } from "@/components/CostosProduccionView";
import { getProductos, getMateriasPrimas } from "@/lib/services";
import { requireUsuario } from "@/lib/auth";

export default async function CostosPage() {
  const [productos, materias, usuario] = await Promise.all([
    getProductos(),
    getMateriasPrimas(),
    requireUsuario(),
  ]);
  return (
    <CostosProduccionView
      productos={productos}
      materias={materias}
      rol={usuario.rol}
    />
  );
}
