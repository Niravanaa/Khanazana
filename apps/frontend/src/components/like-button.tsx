'use client';

import { useState, useTransition } from 'react';
import { toggleLikeAction } from '@/app/recipes/public/[id]/actions';

interface LikeButtonProps {
  recipeId: string;
  initialCount: number;
  initialLiked: boolean;
  isLoggedIn: boolean;
}

export function LikeButton({ recipeId, initialCount, initialLiked, isLoggedIn }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [, startTransition] = useTransition();

  function handleToggle() {
    if (!isLoggedIn) {
      window.location.href = '/login';
      return;
    }
    const next = !liked;
    setLiked(next);
    setCount((c) => c + (next ? 1 : -1));
    startTransition(() => toggleLikeAction(recipeId));
  }

  return (
    <button
      onClick={handleToggle}
      aria-label={liked ? 'Unlike recipe' : 'Like recipe'}
      aria-pressed={liked}
      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        liked
          ? 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400'
          : 'border border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      }`}
    >
      <span aria-hidden="true">{liked ? '♥' : '♡'}</span>
      <span>{count}</span>
    </button>
  );
}
