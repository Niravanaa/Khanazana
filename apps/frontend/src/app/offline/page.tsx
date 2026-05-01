export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-8">
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-bold text-foreground">You&apos;re offline</h1>
        <p className="text-muted-foreground">
          Check your connection. Your shopping list will reload automatically when you&apos;re back
          online.
        </p>
      </div>
    </main>
  );
}
