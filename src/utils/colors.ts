const avatarBackgroundColors = [
  '#265fff', // Azul vibrante
  '#df41d6', // Magenta
  '#ff4a9c', // Rosa
  '#ff8569', // Coral
  '#ffc352', // Naranja dorado
  '#00d4aa', // Turquesa
  '#7c3aed', // Púrpura
  '#f43f5e', // Rojo rosa
  '#10b981', // Verde esmeralda
  '#3b82f6', // Azul cielo
  '#f59e0b', // Ámbar
  '#8b5cf6', // Violeta
  '#ec4899', // Rosa fucsia
  '#14b8a6', // Teal
  '#6366f1', // Índigo
];

/**
 * Genera un color de fondo para el avatar basado en un ID
 * El mismo ID siempre generará el mismo color
 */
export const getAvatarBackgroundColor = (id: string): string => {
  // Simple hash function para convertir el ID en un número
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Usar el hash para seleccionar un color
  const index = Math.abs(hash) % avatarBackgroundColors.length;
  return avatarBackgroundColors[index];
}

/**
 * @deprecated Usar getAvatarBackgroundColor con un ID para mantener consistencia
 */
export const getRandomAvatarBackgroundColor = () => {
  const ind = Math.floor(Math.random() * avatarBackgroundColors.length);
  return avatarBackgroundColors[ind];
}

