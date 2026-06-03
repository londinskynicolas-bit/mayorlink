type ProviderBadgesProps = {
  isVerified: boolean;
  isFounder: boolean;
};

export function ProviderBadges({ isVerified, isFounder }: ProviderBadgesProps) {
  if (!isVerified && !isFounder) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {isVerified && (
        <span className="rounded-sm bg-emerald-600 px-2 py-0.5 text-[11px] font-black uppercase tracking-wide text-white">
          Verificado
        </span>
      )}
      {isFounder && (
        <span className="rounded-sm bg-black px-2 py-0.5 text-[11px] font-black uppercase tracking-wide text-white">
          Fundador
        </span>
      )}
    </div>
  );
}
