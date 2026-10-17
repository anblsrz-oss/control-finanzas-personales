// ¿Hay una sesión de Supabase guardada en este navegador? Se consulta mientras la auth
// todavía carga, para decidir si "/" muestra la landing (visitante) o espera al dashboard.
// supabase-js guarda la sesión en localStorage bajo la clave sb-<ref>-auth-token.
export function hasStoredSession(): boolean {
  try {
    return Object.keys(localStorage).some((k) => /^sb-.+-auth-token$/.test(k))
  } catch {
    return false
  }
}
