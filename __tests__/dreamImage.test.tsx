import { fireEvent, render, screen } from '@testing-library/react';
import DreamImage from '@/app/(private)/dream/[id]/_components/DreamImage';

afterEach(() => jest.restoreAllMocks());

it('завершает загрузку при успехе', () => {
  render(<DreamImage src="/dream.png" alt="Сон" />);
  expect(screen.getByLabelText('Загрузка изображения')).toBeTruthy();
  fireEvent.load(screen.getByRole('img'));
  expect(screen.queryByLabelText('Загрузка изображения')).toBeNull();
  expect(screen.getByRole('img').getAttribute('data-loaded')).toBe('true');
});

it('показывает заглушку при ошибке и начинает загрузку нового адреса', () => {
  const { rerender } = render(<DreamImage src="/bad.png" alt="Сон" />);
  const previous = screen.getByRole('img');
  fireEvent.error(previous);
  expect(screen.queryByLabelText('Загрузка изображения')).toBeNull();
  expect(screen.getByText('Не удалось загрузить изображение')).toBeTruthy();
  expect(screen.getByRole('img').getAttribute('aria-label')).toBe('Сон');
  rerender(<DreamImage src="/new.png" alt="Новый сон" />);
  fireEvent.load(previous);
  expect(screen.getByLabelText('Загрузка изображения')).toBeTruthy();
  expect(screen.queryByText('Не удалось загрузить изображение')).toBeNull();
  fireEvent.load(screen.getByRole('img'));
  expect(screen.queryByLabelText('Загрузка изображения')).toBeNull();
});

it.each([0, 100])('проверяет завершённое изображение с шириной %s', (width) => {
  jest
    .spyOn(HTMLImageElement.prototype, 'complete', 'get')
    .mockReturnValue(true);
  jest
    .spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get')
    .mockReturnValue(width);
  render(<DreamImage src="/cached.png" alt="Сон" />);
  expect(screen.queryByLabelText('Загрузка изображения')).toBeNull();
  if (width === 0) {
    expect(screen.getByText('Не удалось загрузить изображение')).toBeTruthy();
  } else {
    expect(screen.getByRole('img').getAttribute('data-loaded')).toBe('true');
  }
});
