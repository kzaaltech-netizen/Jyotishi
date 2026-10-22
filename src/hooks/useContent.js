import { useApp } from '../context/AppContext.jsx';
import { contentFor } from '../content/index.js';

// Public-page text (home, Learn, header, footer) in the visitor's language.
export default function useContent() {
  const { locale } = useApp();
  return contentFor(locale);
}
