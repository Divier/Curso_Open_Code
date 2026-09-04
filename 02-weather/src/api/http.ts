export async function safeFetchJson(url: string): Promise<unknown> {
  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    throw new Error("Error de conexión. Revisa tu internet e intenta de nuevo.");
  }
  if (!res.ok) {
    throw new Error(`La API respondió con código ${res.status}.`);
  }
  return res.json();
}
