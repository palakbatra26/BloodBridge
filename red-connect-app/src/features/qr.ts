export interface DonorCardData {
  id: string;
  name: string;
  bloodType: string;
}

export function generateDonorCardSVG(data: DonorCardData): string {
  const payload = `${data.id}|${data.name}|${data.bloodType}`;
  const blocks = Array.from(payload).map((c, i) => ((c.charCodeAt(0) + i * 13) % 2));
  const size = 12;
  const cols = 32;
  const rows = Math.ceil(blocks.length / cols);
  let rects = "";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      if (blocks[idx] === 1) {
        rects += `<rect x="${c * size}" y="${r * size}" width="${size}" height="${size}" fill="#000"/>`;
      }
    }
  }
  const w = cols * size;
  const h = rows * size + 80;
  const svg = `<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect width="100%" height="100%" fill="#fff"/>
    <text x="10" y="${rows * size + 24}" font-size="18" fill="#111">Donor: ${data.name}</text>
    <text x="10" y="${rows * size + 48}" font-size="16" fill="#555">Blood: ${data.bloodType}</text>
    ${rects}
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

