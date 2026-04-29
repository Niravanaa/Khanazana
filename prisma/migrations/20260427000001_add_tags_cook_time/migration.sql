-- AlterTable: add tags array and optional cook_time (minutes) to recipes
ALTER TABLE "recipes" ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "recipes" ADD COLUMN "cook_time" INTEGER;
