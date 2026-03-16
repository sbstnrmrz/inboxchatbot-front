const avatarBackgroundColors = [
  "bg-blue-500",
  "bg-fuchsia-500",
  "bg-pink-500",
  "bg-orange-400",
  "bg-amber-400",
  "bg-teal-500",
  "bg-purple-600",
  "bg-rose-500",
  "bg-emerald-500",
  "bg-sky-500",
  "bg-yellow-500",
  "bg-violet-500",
  "bg-indigo-500",
  "bg-cyan-500",
  "bg-lime-500",
] as const;

/**
 * Devuelve una clase Tailwind de color de fondo determinística basada en un ID.
 * El mismo ID siempre produce el mismo color.
 */
export const getAvatarBackgroundColor = (id: string): string => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarBackgroundColors[Math.abs(hash) % avatarBackgroundColors.length];
}

