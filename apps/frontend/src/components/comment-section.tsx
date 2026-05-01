'use client';

import { useRef, useTransition } from 'react';
import { addCommentAction } from '@/app/recipes/public/[id]/actions';
import type { CommentRecord } from '@/lib/social';

interface CommentSectionProps {
  recipeId: string;
  initialComments: CommentRecord[];
  isLoggedIn: boolean;
}

export function CommentSection({ recipeId, initialComments, isLoggedIn }: CommentSectionProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await addCommentAction(recipeId, formData);
      formRef.current?.reset();
    });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Comments</h2>

      {initialComments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {initialComments.map((comment) => (
            <div key={comment.id} className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-foreground">{comment.body}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(comment.created_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          ))}
        </div>
      )}

      {isLoggedIn ? (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-2">
          <textarea
            name="body"
            placeholder="Add a comment..."
            maxLength={500}
            required
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? 'Posting...' : 'Post comment'}
          </button>
        </form>
      ) : (
        <a href="/login" className="text-sm text-muted-foreground hover:text-foreground">
          Sign in to leave a comment →
        </a>
      )}
    </div>
  );
}
