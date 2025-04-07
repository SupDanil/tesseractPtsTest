import { ParsedRegistration } from './App.tsx';

export const parsePtsString = (text: string): ParsedRegistration => {
  const lines = text
    .split('\n')
    .map((line) =>
      line
        .replace(/[ОO]/g, 'О')
        .replace(/[AА]/g, 'А')
        .replace(/[ЕE]/g, 'Е')
        .replace(/[ТT]/g, 'Т')
        .replace(/[РP]/g, 'Р')
        .replace(/[СC]/g, 'С')
        .replace(/[МM]/g, 'М')
        .replace(/[ВB]/g, 'В')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .filter(Boolean);

  const getValueAfter = (label: string): string | null => {
    const idx = lines.findIndex((l) => l.toLowerCase().includes(label.toLowerCase()));
    if (idx !== -1 && lines[idx + 1]) {
      return lines[idx + 1].trim();
    }
    return null;
  };

  const extractValue = (label: string): string | null => {
    const line = lines.find((l) => l.toLowerCase().startsWith(label.toLowerCase()));
    if (line) {
      return line.replace(new RegExp(`${label}[:\\s]*`, 'i'), '').trim();
    }
    return null;
  };

  const brand = extractValue('Марка') || extractValue('MoaeAb');
  const vin = getValueAfter('VIN');

  const vehicleTypeLine = lines.find((line) => {
    const upperLine = line.toUpperCase().replace(/T/g, 'Т').replace(/C/g, 'С');
    return upperLine.includes('N ТС') || upperLine.includes('Н ТС') || upperLine.includes('П ТС');
  });
  const vehicleType = vehicleTypeLine?.split(/ТС /i)[1]?.trim() || null;

  const yearLine = lines.find((l) => /Год выпуска ТС/.test(l));
  const year = yearLine?.match(/\d{4}/)?.[0] || null;

  const bodyIdx = lines.findIndex((l) => /Кузов.*№/i.test(l));
  const bodyNumber =
    bodyIdx !== -1 && lines[bodyIdx + 1] ? lines[bodyIdx + 1].replace(/^[:\s]*/, '') : null;

  const color = extractValue('Цвет');
  const passport = extractValue('Паспорт ТС №') || getValueAfter('Паспорт ТС №');

  const documentLine = lines.find((line) => /^\d{2}\s?\d{3}\s?\d{6,}$/.test(line));
  const documentNumber = documentLine?.trim() || null;

  return {
    brand,
    vin,
    vehicleType,
    year,
    bodyNumber,
    color,
    passportNumber: passport,
    documentNumber,
  };
};
