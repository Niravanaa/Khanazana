'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addCommentAction, deleteCommentAction } from '@/app/recipes/public/[id]/actions';
import type { CommentRecord } from '@/lib/social';

interface CommentSectionProps {
  recipeId: string;
  initialComments: CommentRecord[];
  isLoggedIn: boolean;
  currentUserId?: string | null;
  recipeOwnerId?: string;
}

export function CommentSection({
  recipeId,
  initialComments,
  isLoggedIn,
  currentUserId,
  recipeOwnerId,
}: CommentSectionProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [comments, setComments] = useState<CommentRecord[]>(initialComments);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await addCommentAction(recipeId, formData);
      formRef.current?.reset();
      router.refresh();
    });
  }

  function handleDelete(commentId: string) {
    if (!recipeOwnerId) return;
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    startTransition(async () => {
      await deleteCommentAction(recipeId, commentId, recipeOwnerId);
    });
  }

  function canDelete(comment: CommentRecord): boolean {
    if (!currentUserId) return false;
    return currentUserId === comment.user_id || currentUserId === recipeOwnerId;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Comments</h2>

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-foreground">{comment.body}</p>
                {canDelete(comment) && (
                  <button
                    type="button"
                    onClick={() => handleDelete(comment.id)}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    aria-label="Delete comment"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                )}
              </div>
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
