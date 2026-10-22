import { Sparkles, Briefcase, Coins, Heart, Compass, Sunrise } from '../components/icons/index.jsx';

// Six guides, each named after a rishi of the Jyotish tradition.
// `mode` is the chat mode the server accepts (server/src/routes/chat.js → agents/index.js).
export const GUIDES = [
  {
    mode: 'general',
    name: 'Parashara',
    topic: 'Any question',
    about: 'Author of Brihat Parashara Hora Shastra',
    deva: 'प',
    Icon: Sparkles,
    placeholder: 'Ask anything about your chart…',
  },
  {
    mode: 'career',
    name: 'Bhrigu',
    topic: 'Career & work',
    about: 'Sage of the Bhrigu Samhita',
    deva: 'भृ',
    Icon: Briefcase,
    placeholder: 'Ask about career, work or study…',
  },
  {
    mode: 'wealth',
    name: 'Garga',
    topic: 'Money & wealth',
    about: 'Teacher of the Garga Hora',
    deva: 'ग',
    Icon: Coins,
    placeholder: 'Ask about money, savings or business…',
  },
  {
    mode: 'union',
    name: 'Vasishtha',
    topic: 'Love & marriage',
    about: 'With Arundhati, the ideal of marriage',
    deva: 'व',
    Icon: Heart,
    placeholder: 'Ask about love, marriage or family…',
  },
  {
    mode: 'abundance',
    name: 'Jaimini',
    topic: 'Growth & purpose',
    about: 'Author of the Jaimini Sutras',
    deva: 'जै',
    Icon: Compass,
    placeholder: 'Ask about growth, purpose or your next step…',
  },
  {
    mode: 'forecast',
    name: 'Varahamihira',
    topic: 'Forecast & timing',
    about: 'Author of the Brihat Samhita',
    deva: 'व',
    Icon: Sunrise,
    placeholder: 'Ask about the days and months ahead, or good dates…',
  },
];

export const guideFor = (mode) => GUIDES.find((g) => g.mode === mode) || GUIDES[0];
