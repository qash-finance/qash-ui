// Generate consistent random avatar for token based on address
export const generateTokenAvatar = (tokenAddress: string, symbol?: string) => {
  // Create a simple hash from the token address
  let hash = 0;
  for (let i = 0; i < tokenAddress.length; i++) {
    const char = tokenAddress.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Generate consistent colors from hash
  const hue = Math.abs(hash) % 360;
  const saturation = 60 + (Math.abs(hash) % 40); // 60-100%
  const lightness = 45 + (Math.abs(hash) % 20); // 45-65%

  const backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  const textColor = lightness > 55 ? "#000" : "#fff";

  // Create a data URL for the avatar
  const size = 32;
  const canvas = typeof window !== "undefined" ? document.createElement("canvas") : null;

  if (!canvas) {
    // Fallback for SSR
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="${backgroundColor}"/>
        <text x="50%" y="50%" font-family="Arial" font-size="12" font-weight="bold" 
              text-anchor="middle" dominant-baseline="central" fill="${textColor}">
          ${(symbol || tokenAddress.slice(0, 2)).toUpperCase()}
        </text>
      </svg>
    `)}`;
  }

  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (!ctx) return "";

  // Draw background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, size, size);

  // Draw text
  ctx.fillStyle = textColor;
  ctx.font = "bold 12px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText((symbol || tokenAddress.slice(0, 2)).toUpperCase(), size / 2, size / 2);

  return canvas.toDataURL();
};
