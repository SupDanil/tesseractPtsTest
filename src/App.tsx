import { useState } from 'react';
import { createWorker, LoggerMessage, PSM } from 'tesseract.js';

import { parsePtsString } from './utils.ts';

export type ParsedRegistration = {
  brand: string | null;
  vin: string | null;
  vehicleType: string | null;
  year: string | null;
  bodyNumber: string | null;
  color: string | null;
  passportNumber: string | null;
  documentNumber: string | null;
};

function App() {
  const [progressData, setProgressData] = useState<LoggerMessage | null>(null);
  const [ptsData, setPtsData] = useState<ParsedRegistration | null>(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const updateProgress = (data: LoggerMessage) => {
    if (data.progress === 1) {
      setProgressData(null);
      return;
    }

    setProgressData(data);
  };
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      setImagePreview(reader.result as string);
      setLoading(true);
      const worker = await createWorker(['rus', 'eng'], undefined, {
        logger: (data) => {
          updateProgress(data);
        },
      });

      await worker.setParameters({
        tessedit_pageseg_mode: PSM.AUTO,
      });

      const {
        data: { text },
      } = await worker.recognize(file);
      parsePtsData(text.replace(/\n\s*\n/g, '\n'));
      setLoading(false);
      await worker.terminate();
    };
    reader.readAsDataURL(file);
  };

  const parsePtsData = (text: string) => setPtsData(parsePtsString(text));

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <input type="file" accept="image/*" onChange={handleImageUpload} disabled={loading} />
      {imagePreview && (
        <div>
          <h3>Предпросмотр:</h3>
          <img
            src={imagePreview}
            alt="Uploaded PTS"
            style={{ maxWidth: '100%', maxHeight: '300px' }}
          />
        </div>
      )}
      {progressData && (
        <div style={{ marginTop: '1rem' }}>
          <div>{progressData.status}</div>
          <progress max={1} value={progressData.progress}></progress>
        </div>
      )}
      {ptsData && (
        <div>
          <p>Марка: {ptsData.brand}</p>
          <p>Тип ТС: {ptsData.vehicleType}</p>
          <p>Год выпуска: {ptsData.year}</p>
          <p>Кузов: {ptsData.bodyNumber}</p>
          <p>Цвет: {ptsData.color}</p>
          <p>Паспорт: {ptsData.passportNumber}</p>
          <p>НОМЕР ПТС: {ptsData.documentNumber}</p>
        </div>
      )}
    </div>
  );
}

export default App;
