type FeatureRowProps = {
  index: string;
  title: string;
  description: string;
};

// 번호 매긴 기능 한 줄. 카드로 안 가두고 선으로만 구분
export default function FeatureRow({ index, title, description }: FeatureRowProps) {
  return (
    <div className="group grid gap-4 border-t border-line py-8 transition-colors sm:grid-cols-[auto_1fr] sm:gap-10 sm:py-10">
      <span className="font-hub-label text-4xl font-bold text-primary/70 transition-colors group-hover:text-primary sm:text-5xl">
        {index}
      </span>
      <div>
        <h3 className="font-hub-display text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
          {title}
        </h3>
        <p className="mt-3 max-w-2xl text-pretty text-base leading-relaxed text-ink-soft sm:text-lg sm:leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
