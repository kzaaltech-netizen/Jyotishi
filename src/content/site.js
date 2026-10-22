// Site-wide facts used by the landing page, page meta, JSON-LD, sitemap and llms.txt.
// Plain data only (no JSX) so the Node prerender script can import it too.

export const SITE = {
  name: 'Jyotishly',
  url: 'https://jyotishly.com',
  tagline: 'Your Kundli, one message away',
  description:
    'Jyotishly is a Vedic astrology chat. Ask about career, marriage, money or timing in English, Hindi or Hinglish, and get short, warm replies read from your own Kundli — with the houses and planets behind each answer highlighted on your chart.',
  publisher: { name: 'FAS FAS Labs', url: 'https://www.fasfaslabs.com/' },
  locale: 'en_IN',
  themeColor: '#F4EBDA',
};

export const HOME_META = {
  title: 'Jyotishly — Vedic astrology on chat | Ask your Kundli anything',
  description:
    'Chat with a Vedic astrology guide about career, shaadi, paisa and timing. Free to start. Replies in Hindi, English or Hinglish, read from your own birth chart.',
};

export const LEARN_META = {
  title: 'Learn Vedic astrology — Kundli, Lagna, Nakshatra, Dasha | Jyotishly',
  description:
    'Short, clear guides to the building blocks of Vedic astrology: the Kundli, Lagna, the 27 nakshatras, Vimshottari dasha, Navamsa, Sade Sati and Mangal Dosha.',
};

// Answer-first FAQ shown on the landing page and published as FAQPage schema.
export const HOME_FAQ = [
  {
    q: 'What is Jyotishly?',
    a: 'Jyotishly is a Vedic astrology app you use like a chat. You ask a question, share your birth date, time and place once, and a guide replies in short, simple messages based on your own Kundli.',
  },
  {
    q: 'Do I need an account?',
    a: 'Only to get answers. Your Kundli, daily horoscope and the Learn guides work without signing up. When you send your first question, you create a free account; your question and Kundli come with you.',
  },
  {
    q: 'Which languages can I chat in?',
    a: 'English, Hindi or Hinglish. Write the way you normally text and your guide replies in the same language.',
  },
  {
    q: 'What do I need to get my Kundli?',
    a: 'Your date, time and place of birth. The time matters most: the Lagna (ascendant) changes about every two hours, so an accurate time gives a more accurate chart.',
  },
  {
    q: 'Which system does Jyotishly use?',
    a: 'The sidereal zodiac with the Lahiri (Chitra Paksha) ayanamsa, the standard in Indian astrology. Charts are shown in North and South Indian styles, and timing uses the Vimshottari dasha system.',
  },
  {
    q: 'Am I talking to a real astrologer?',
    a: 'You are chatting with Jyotishly’s AI astrology guide. It reads your calculated chart and explains it conversationally; it does not pretend to be a person.',
  },
  {
    q: 'Is Jyotishly free?',
    a: 'Starting is free. Questions use tokens; you can add tokens or choose a Pro plan for longer conversations.',
  },
  {
    q: 'Can astrology predict the future with certainty?',
    a: 'No. Jyotish is a traditional system for reflection and timing, not a guarantee. Use it as one perspective, and talk to qualified professionals for medical, legal or financial decisions.',
  },
];
