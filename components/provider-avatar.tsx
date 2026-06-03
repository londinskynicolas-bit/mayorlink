import { getInitials } from "@/lib/providers";

type ProviderAvatarProps = {
  name: string;
  logoUrl: string | null;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-12 w-12 text-sm",
  md: "h-16 w-16 text-lg",
  lg: "h-24 w-24 text-2xl",
};

export function ProviderAvatar({
  name,
  logoUrl,
  size = "md",
}: ProviderAvatarProps) {
  const classes = sizeClasses[size];

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className={`${classes} rounded-lg border-2 border-zinc-200 object-cover`}
      />
    );
  }

  return (
    <div
      className={`${classes} flex items-center justify-center rounded-lg border-2 border-emerald-700 bg-emerald-50 font-black text-emerald-800`}
    >
      {getInitials(name)}
    </div>
  );
}
