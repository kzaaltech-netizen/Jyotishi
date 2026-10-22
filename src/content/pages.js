// About, contact and policy pages, plus the 404 page. English only.
// Plain data only (no JSX) — the prerender script imports this file.
// Facts here must match how the app actually works; update them when it changes.

export const PAGES_UPDATED = '2026-10-21';

export const CONTACT = {
  email: 'kzaaltech@gmail.com',
  city: 'Ahmedabad',
  region: 'Gujarat',
  country: 'India',
  countryCode: 'IN',
};

// Section shape: { heading, paragraphs: [], list?: [] }
export const INFO_PAGES = {
  about: {
    title: 'About Jyotishly',
    metaTitle: 'About Jyotishly — who we are and how your chart is calculated',
    description:
      'Jyotishly is a Vedic astrology chat made by FAS FAS Labs in Ahmedabad. How charts are calculated, how the AI guides work, and what they will not do.',
    intro:
      'Jyotishly is a Vedic astrology app you use like a chat. You ask a question in your own language, and a guide answers from your own Kundli, showing the houses and planets behind each answer on your chart.',
    sections: [
      {
        heading: 'Who makes Jyotishly',
        paragraphs: [
          'Jyotishly is built by FAS FAS Labs, a small independent team in Ahmedabad, India, that makes its own apps. We built it because most astrology apps either bury people in long reports or push paid consultations, and we wanted something closer to talking with a calm family astrologer.',
        ],
      },
      {
        heading: 'How your chart is calculated',
        paragraphs: [
          'Your Kundli is calculated from your date, time and place of birth. The place is turned into latitude, longitude and time zone, and the planets are placed for that exact moment.',
          'We use the sidereal zodiac with the Lahiri (Chitra Paksha) ayanamsa, the standard in Indian astrology. Positions come from an astronomical calculation service and the Swiss Ephemeris, a widely used astronomical library. Timing uses the Vimshottari dasha system, and divisional charts such as the Navamsa (D9) and Dashamsa (D10) are calculated from the same data.',
          'Charts can be shown in North Indian or South Indian style. Both contain the same information.',
        ],
      },
      {
        heading: 'How the guides answer',
        paragraphs: [
          'The six guides — Parashara, Bhrigu, Garga, Vasishtha, Jaimini and Varahamihira — are AI guides named after rishis of the Jyotish tradition. They are not people, and they say so when asked.',
          'Before a guide answers, the relevant facts of your calculated chart are given to it: your Lagna, house placements, nakshatra and current dasha. The guide is instructed to answer only from those facts, to keep replies short, to give one insight at a time, and to name the houses and planets it relies on so you can check them on your chart.',
        ],
      },
      {
        heading: 'What the guides will not do',
        paragraphs: ['Some lines we hold no matter what is asked:'],
        list: [
          'No predictions of death, serious illness or disasters.',
          'No medical, legal or financial instructions. For those, please speak to a qualified professional.',
          'No fear-based selling: no pressure to buy pujas, gemstones or remedies.',
          'No claims of certainty. Jyotish is a traditional system for reflection and timing, not a guarantee.',
        ],
      },
      {
        heading: 'Languages',
        paragraphs: [
          'The app, the Learn guides and the replies are available in English, Hindi, Marathi, Bengali, Tamil and Telugu. In the chat you can also write in Hinglish; the guide replies in the language you write in.',
        ],
      },
      {
        heading: 'Questions or feedback',
        paragraphs: ['Write to us at kzaaltech@gmail.com. We read every message.'],
      },
    ],
  },
  contact: {
    title: 'Contact us',
    metaTitle: 'Contact Jyotishly',
    description: 'Contact the Jyotishly team at FAS FAS Labs, Ahmedabad, India: support, feedback, privacy requests and account deletion.',
    intro: 'The fastest way to reach us is email. We usually reply within two working days.',
    sections: [
      {
        heading: 'Email',
        paragraphs: ['kzaaltech@gmail.com'],
      },
      {
        heading: 'What to write to us about',
        paragraphs: ['Please include the email address of your Jyotishly account, if you have one.'],
        list: [
          'Help with your account, chart or tokens.',
          'Feedback on an answer, or a reply that seemed wrong.',
          'Privacy requests: a copy of your data, corrections, or deleting your account and data.',
          'Complaints or grievances.',
        ],
      },
      {
        heading: 'Where we are',
        paragraphs: ['FAS FAS Labs, Ahmedabad, Gujarat, India.'],
      },
    ],
  },
  privacy: {
    title: 'Privacy policy',
    metaTitle: 'Privacy policy | Jyotishly',
    description: 'What Jyotishly collects, why, who processes it, how long it is kept, and how to get a copy or delete your data.',
    intro:
      'Birth details are personal. This page explains plainly what we collect, why we need it and what you can ask us to do with it. It applies to jyotishly.com and the Jyotishly app.',
    sections: [
      {
        heading: 'What we collect',
        paragraphs: [],
        list: [
          'Account details: your name, email address and a password. The password is stored only as a secure hash, never as plain text.',
          'Birth details: name, date, time and place of birth, and the latitude, longitude and time zone worked out from the place.',
          'Your calculated charts.',
          'Your conversations with the guides and the readings you save.',
          'Token balance and a history of how tokens were used.',
          'Basic technical data needed to run the service, such as request logs and error logs.',
        ],
      },
      {
        heading: 'Using Jyotishly without an account',
        paragraphs: [
          'You can make a Kundli without signing up. We then create a guest session: your chart is stored on our servers under a random guest ID, and a session token is kept in your browser. If you later create an account, the guest chart moves into it.',
        ],
      },
      {
        heading: 'Why we use it',
        paragraphs: [],
        list: [
          'To calculate your chart and show it to you.',
          'To answer your questions from your chart and keep your conversation history.',
          'To keep your account secure and to prevent abuse, such as limiting how many questions can be asked in a short time.',
          'To fix problems and improve answers.',
        ],
      },
      {
        heading: 'Who processes your data',
        paragraphs: ['We share only what each service needs to do its job:'],
        list: [
          'Google (Gemini API): your question and the relevant facts of your chart are sent to generate a reply.',
          'Astronomical calculation services (FreeAstroAPI, VedAstro): your birth date, time and location are sent to calculate the chart.',
          'OpenStreetMap Nominatim: the place name you type is sent to find matching places.',
          'TimeAPI.io: the coordinates of your birthplace are sent to find its time zone.',
          'Neon: our database host, where account, chart and conversation data is stored.',
          'Vercel: hosts the website and app.',
          'Google Fonts: the site loads its fonts from Google, which receives your IP address when the fonts are downloaded.',
        ],
      },
      {
        heading: 'What we do not do',
        paragraphs: [],
        list: [
          'We do not sell your data.',
          'We do not show ads, and we do not use advertising trackers or third-party analytics.',
          'We do not share your birth details or conversations publicly.',
        ],
      },
      {
        heading: 'Where data is stored',
        paragraphs: [
          'Our database is hosted by Neon on servers in the United States (AWS us-east-2). Our service providers may process data in other countries as described in their own policies.',
        ],
      },
      {
        heading: 'How long we keep it',
        paragraphs: [
          'We keep your account, charts and conversations while your account is active. If you ask us to delete your account, we delete your data from our database, except where the law requires us to keep a record. Guest sessions that are never turned into an account may be deleted after a period of inactivity.',
        ],
      },
      {
        heading: 'Your choices and rights',
        paragraphs: [
          'You can delete your account and all associated data yourself at any time from Settings → Delete account. You can also clear your chat history from inside the app, and ask us for a copy of your data or to correct it. To make a request, email kzaaltech@gmail.com from the address on your account. We follow the Digital Personal Data Protection Act, 2023 (India), and aim to respond within 30 days.',
        ],
      },
      {
        heading: 'Children',
        paragraphs: ['Jyotishly is meant for people aged 18 and over. If you believe a child has created an account, contact us and we will delete it.'],
      },
      {
        heading: 'Changes and contact',
        paragraphs: [
          'If we change this policy we will update this page and the date at the top. For any privacy question or grievance, write to kzaaltech@gmail.com (FAS FAS Labs, Ahmedabad, Gujarat, India).',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms of use',
    metaTitle: 'Terms of use and disclaimer | Jyotishly',
    description: 'The terms for using Jyotishly, including what astrology readings are and are not, AI-generated answers, tokens, and acceptable use.',
    intro: 'By using Jyotishly you agree to these terms. Please read the disclaimer section in particular.',
    sections: [
      {
        heading: 'Disclaimer: what readings are',
        paragraphs: [
          'Jyotishly offers astrology readings for reflection, self-study and entertainment. Jyotish is a traditional system; it is not a science and its interpretations vary between schools. Readings are not predictions of certainty.',
          'Nothing on Jyotishly is medical, psychological, legal or financial advice. Do not delay or replace professional help because of a reading. If you are in distress, please contact a qualified professional or local emergency services.',
        ],
      },
      {
        heading: 'AI-generated answers',
        paragraphs: [
          'Answers in the chat are written by AI guides based on your calculated chart. They can be incomplete or wrong. Use your own judgement, and treat important decisions — marriage, career, money, health — as yours to make with the people you trust.',
        ],
      },
      {
        heading: 'Your account',
        paragraphs: [
          'You must be 18 or older to create an account. Keep your password private; you are responsible for activity on your account. Give accurate birth details for an accurate chart.',
        ],
      },
      {
        heading: 'Tokens and plans',
        paragraphs: [
          'Some features use tokens, and paid plans may be offered. Prices and what each plan includes are shown in the app before you pay. Tokens have no cash value and cannot be transferred.',
        ],
      },
      {
        heading: 'Acceptable use',
        paragraphs: ['Please do not:'],
        list: [
          'Try to break, overload or reverse-engineer the service, or get around usage limits.',
          'Use it to harass anyone, or to make readings about other people without their consent.',
          'Copy the content of the site in bulk or resell answers.',
        ],
      },
      {
        heading: 'Content',
        paragraphs: [
          'The Learn guides, design and software belong to FAS FAS Labs. Your questions and saved readings belong to you; you give us permission to store and process them to run the service.',
        ],
      },
      {
        heading: 'Limitation of liability',
        paragraphs: [
          'Jyotishly is provided as is. To the extent the law allows, FAS FAS Labs is not liable for decisions made based on readings, or for indirect losses arising from use of the service.',
        ],
      },
      {
        heading: 'Changes, law and contact',
        paragraphs: [
          'We may update these terms; the date at the top shows the latest version. These terms are governed by the laws of India, with courts in Ahmedabad, Gujarat having jurisdiction. Questions: kzaaltech@gmail.com.',
        ],
      },
    ],
  },
};

export const NOT_FOUND = {
  title: 'This page is not in the stars',
  description: 'The page you were looking for does not exist or has moved.',
  body: 'The page you were looking for does not exist or has moved. These might help:',
};
