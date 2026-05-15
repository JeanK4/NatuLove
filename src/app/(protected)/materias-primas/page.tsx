import { MateriasPrimasTable } from "@/components/MateriasPrimasTable";
import { getMateriasPrimas } from "@/lib/services";
import { requireUsuario } from "@/lib/auth";

export default async function MateriasPrimasPage() {
  const [materias, usuario] = await Promise.all([
    getMateriasPrimas(),
    requireUsuario(),
  ]);
  return <MateriasPrimasTable materias={materias} rol={usuario.rol} />;
}
