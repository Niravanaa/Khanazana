'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { toggleItemAction, consolidateItemsAction } from '@/app/shopping-list/actions';
import type { ShoppingListItemRecord } from '@/lib/shopping-list';

interface ShoppingListClientProps {
  items: ShoppingListItemRecord[];
  week: string;
  exportUrl: string;
}

// ── Similarity helpers ──────────────────────────────────────────────────────

function levenshtein(a: string, b: string): number {
  const m = a.length,
    n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

const UNIT_RE =
  /^\d+\.?\d*(?:\/\d+)?\s*(g|kg|ml|l|cups?|tbsp?|tsp?|oz|lbs?|pieces?|slices?|cloves?|cans?|bunch(?:es)?|handful|pinch|dash)?\s*/i;

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(UNIT_RE, '') // strip leading qty + unit
    .replace(/\(.*?\)/g, '') // strip parenthetical notes
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function similarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const maxLen = Math.max(a.length, b.length);
  return 1 - levenshtein(a, b) / maxLen;
}

interface SimilarPair {
  item1: ShoppingListItemRecord;
  item2: ShoppingListItemRecord;
  score: number;
}

const THRESHOLD = 0.72;

function findSimilarPairs(items: ShoppingListItemRecord[]): SimilarPair[] {
  const pairs: SimilarPair[] = [];
  const norms = items.map((i) => normalize(i.ingredient));
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (norms[i].length < 3 || norms[j].length < 3) continue;
      const score = similarity(norms[i], norms[j]);
      if (score >= THRESHOLD) pairs.push({ item1: items[i], item2: items[j], score });
    }
  }
  return pairs;
}

// ── Consolidation modal ─────────────────────────────────────────────────────

interface ConsolidationModalProps {
  pair: SimilarPair;
  onMerge: (keepId: string, removeId: string, text: string) => void;
  onKeepBoth: () => void;
}

function ConsolidationModal({ pair, onMerge, onKeepBoth }: ConsolidationModalProps) {
  const suggestion = `${pair.item1.ingredient} + ${pair.item2.ingredient}`;
  const [merged, setMerged] = useState(suggestion);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMerged(`${pair.item1.ingredient} + ${pair.item2.ingredient}`);
    inputRef.current?.focus();
  }, [pair]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-lg">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">Similar items found</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            These two items look like duplicates. Merge them into one?
          </p>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* The two items */}
          <div className="flex items-center gap-3">
            <div className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
              {pair.item1.ingredient}
            </div>
            <span className="text-xs text-muted-foreground">≈</span>
            <div className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
              {pair.item2.ingredient}
            </div>
          </div>

          {/* Editable merged text */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Merged item text</label>
            <input
              ref={inputRef}
              value={merged}
              onChange={(e) => setMerged(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex gap-2 border-t border-border px-5 py-4">
          <button
            onClick={onKeepBoth}
            className="flex-1 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            Keep both
          </button>
          <button
            onClick={() => onMerge(pair.item1.id, pair.item2.id, merged)}
            disabled={!merged.trim()}
            className="flex-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Merge
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

export function ShoppingListClient({ items, week, exportUrl }: ShoppingListClientProps) {
  const [, startTransition] = useTransition();
  const [pendingPairs, setPendingPairs] = useState<SimilarPair[]>([]);
  const [checked, setChecked] = useState(false);

  const similarPairs = useMemo(() => findSimilarPairs(items), [items]);

  // Show modal once when items first load
  useEffect(() => {
    if (!checked && items.length > 0) {
      setChecked(true);
      setPendingPairs(similarPairs);
    }
  }, [items, checked, similarPairs]);

  const currentPair = pendingPairs[0] ?? null;

  function handleMerge(keepId: string, removeId: string, newIngredient: string) {
    startTransition(() => consolidateItemsAction(keepId, removeId, newIngredient));
    setPendingPairs((prev) => prev.slice(1));
  }

  function handleKeepBoth() {
    setPendingPairs((prev) => prev.slice(1));
  }

  function handleToggle(itemId: string) {
    startTransition(() => toggleItemAction(itemId, week));
  }

  const pending = items.filter((i) => !i.bought);
  const bought = items.filter((i) => i.bought);

  return (
    <>
      <div>
        <div className="mb-4 flex justify-end">
          <a
            href={exportUrl}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            Export CSV
          </a>
        </div>

        {items.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">
            No items yet. Generate a shopping list from your meal plan.
          </p>
        ) : (
          <div className="space-y-1">
            {[...pending, ...bought].map((item) => (
              <label
                key={item.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 hover:bg-accent/50"
              >
                <input
                  type="checkbox"
                  checked={item.bought}
                  onChange={() => handleToggle(item.id)}
                  className="h-4 w-4 accent-primary"
                />
                <span
                  className={item.bought ? 'text-muted-foreground line-through' : 'text-foreground'}
                >
                  {item.ingredient}
                </span>
              </label>
            ))}
          </div>
        )}

        {bought.length > 0 && (
          <p className="mt-4 text-right text-xs text-muted-foreground">
            {bought.length} of {items.length} bought
          </p>
        )}
      </div>

      {currentPair && (
        <ConsolidationModal pair={currentPair} onMerge={handleMerge} onKeepBoth={handleKeepBoth} />
      )}
    </>
  );
}
