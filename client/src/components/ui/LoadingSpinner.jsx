export default function LoadingSpinner({ fullScreen }) {
  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-lumina-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return <div className="w-8 h-8 border-3 border-lumina-500 border-t-transparent rounded-full animate-spin" />;
}
