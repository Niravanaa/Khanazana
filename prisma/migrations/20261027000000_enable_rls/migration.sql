-- Lock down the PostgREST (anon / authenticated) path to every public table.
-- The app reads and writes these tables only through Prisma on the server, using the
-- table-owner connection, which bypasses RLS. With RLS enabled and no policies, the
-- Supabase REST API can no longer read or modify any row with the public anon key.
ALTER TABLE "recipes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "recipe_likes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "recipe_comments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "meal_plans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "meal_plan_entries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "shopping_list_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
