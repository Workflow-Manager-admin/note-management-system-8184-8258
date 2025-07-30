import { render, screen } from '@testing-library/react';
import App from './App';

test('renders main notes title', () => {
  render(<App />);
  const titleElement = screen.getByText(/notes/i);
  expect(titleElement).toBeInTheDocument();
});
