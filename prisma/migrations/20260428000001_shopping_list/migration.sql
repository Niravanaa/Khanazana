-- CreateTable
CREATE TABLE "shopping_list_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "week_start" DATE NOT NULL,
    "ingredient" TEXT NOT NULL,
    "bought" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "shopping_list_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shopping_list_items_user_id_week_start_ingredient_key" ON "shopping_list_items"("user_id", "week_start", "ingredient");

-- CreateIndex
CREATE INDEX "shopping_list_items_user_id_week_start_idx" ON "shopping_list_items"("user_id", "week_start");
