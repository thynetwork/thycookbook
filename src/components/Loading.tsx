interface LoadingProps {
  text?: string;
  fullPage?: boolean;
}

export default function Loading({ text = "Loading...", fullPage = true }: LoadingProps) {
  const spinner = (
    <div className="text-center">
      <div className="inline-block w-12 h-12 border-4 border-[#0fb36a] border-t-transparent rounded-full animate-spin"></div>
      {text && <p className="mt-4 text-muted">{text}</p>}
    </div>
  );

  if (!fullPage) {
    return spinner;
  }

  return (
    <div className="flex-1 flex items-center justify-center py-20">
      {spinner}
    </div>
  );
}
