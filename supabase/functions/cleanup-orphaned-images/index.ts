import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const BUCKET = 'recipe-images';

async function listAllStoragePaths(supabase: ReturnType<typeof createClient>): Promise<string[]> {
  const paths: string[] = [];

  const { data: rootItems, error: rootError } = await supabase.storage
    .from(BUCKET)
    .list('', { limit: 1000 });

  if (rootError) throw new Error(`Failed to list bucket root: ${rootError.message}`);

  for (const item of rootItems ?? []) {
    if (item.id !== null) {
      // File at root level (unexpected but handle it)
      paths.push(item.name);
      continue;
    }

    // Folder — list its contents paginated
    let offset = 0;
    while (true) {
      const { data: files, error: folderError } = await supabase.storage
        .from(BUCKET)
        .list(item.name, { limit: 100, offset });

      if (folderError)
        throw new Error(`Failed to list folder ${item.name}: ${folderError.message}`);
      if (!files || files.length === 0) break;

      for (const f of files) {
        if (f.id !== null) paths.push(`${item.name}/${f.name}`);
      }

      if (files.length < 100) break;
      offset += 100;
    }
  }

  return paths;
}

Deno.serve(async (_req: Request) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // 1. Collect every image_path currently referenced by a recipe row
  const { data: recipes, error: dbError } = await supabase
    .from('recipes')
    .select('image_path')
    .not('image_path', 'is', null);

  if (dbError) {
    console.error('DB error:', dbError.message);
    return new Response(JSON.stringify({ error: dbError.message }), { status: 500 });
  }

  const referenced = new Set<string>(
    (recipes as { image_path: string }[]).map((r) => r.image_path),
  );

  // 2. Walk the storage bucket
  let allPaths: string[];
  try {
    allPaths = await listAllStoragePaths(supabase);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Storage walk error:', message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }

  // 3. Delete orphans in batches of 100
  const orphans = allPaths.filter((p) => !referenced.has(p));
  let deleted = 0;

  for (let i = 0; i < orphans.length; i += 100) {
    const batch = orphans.slice(i, i + 100);
    const { error: delError } = await supabase.storage.from(BUCKET).remove(batch);
    if (delError) {
      console.error('Delete batch error:', delError.message);
    } else {
      deleted += batch.length;
    }
  }

  const result = { checked: allPaths.length, orphans: orphans.length, deleted };
  console.log('Cleanup complete:', result);

  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  });
});
