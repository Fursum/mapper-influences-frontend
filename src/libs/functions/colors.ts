function interpolateColor(color1: number[], color2: number[], factor = 0.5) {
  const result = color1.slice();
  for (let i = 0; i < 3; i++) {
    result[i] = Math.round(result[i] + factor * (color2[i] - result[i]));
  }
  return result;
}

function hexToRgb(hex: string) {
  const bigint = Number.parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

function rgbToHex(rgb: number[]) {
  return `#${rgb
    .map((x) => {
      const hex = x.toString(16);
      return hex.length === 1 ? `0${hex}` : hex;
    })
    .join('')}`;
}

const domain = [0.1, 1.25, 2, 2.5, 3.3, 4.2, 4.9, 5.8, 6.7, 7.7, 9];
const range = [
  '#4290FB',
  '#4FC0FF',
  '#4FFFD5',
  '#7CFF4F',
  '#F6F05C',
  '#FF8068',
  '#FF4E6F',
  '#C645B8',
  '#6563DE',
  '#18158E',
  '#000000',
].map(hexToRgb);

export function getDiffColor(sr: number) {
  for (let i = 0; i < domain.length - 1; i++) {
    if (sr >= domain[i] && sr <= domain[i + 1]) {
      const factor = (sr - domain[i]) / (domain[i + 1] - domain[i]);
      const color = interpolateColor(range[i], range[i + 1], factor);
      return rgbToHex(color);
    }
  }
  return rgbToHex(range[range.length - 1]); // return last color if value exceeds the domain
}
