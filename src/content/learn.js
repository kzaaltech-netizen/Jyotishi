// "Learn" guides: answer-first explainers that search engines and AI assistants
// can quote. Plain data only (no JSX) — the prerender script imports this file.
//
// Each guide: slug, title (H1), metaTitle, description (<160 chars), short
// (40–60 word direct answer), sections, faqs, related, ask (prefilled chat question).

export const LEARN_UPDATED = '2026-10-18';

export const GUIDES = [
  {
    slug: 'what-is-a-kundli',
    title: 'What is a Kundli?',
    metaTitle: 'What is a Kundli (Janam Kundli)? Vedic birth chart explained',
    description: 'A Kundli is your Vedic birth chart: the positions of the nine grahas across 12 houses at the moment you were born. Here is how it works.',
    short:
      'A Kundli (Janam Kundli or Janam Patri) is a map of the sky at the exact moment and place of your birth. It shows where the nine grahas — Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu and Ketu — sat across the twelve signs and twelve houses.',
    sections: [
      {
        heading: 'What a Kundli is made of',
        paragraphs: [
          'Every Kundli has three layers. The twelve rashis (signs) divide the zodiac into 30° segments. The twelve bhavas (houses) describe areas of life such as self, wealth, home, partnership and career. The nine grahas are placed in signs and houses according to their positions at birth.',
          'The first house is set by the Lagna, the sign rising on the eastern horizon when you were born. All other houses follow from it in order.',
        ],
      },
      {
        heading: 'What you need to calculate one',
        paragraphs: [
          'You need your date of birth, time of birth and place of birth. The place gives latitude, longitude and time zone. The time is the most sensitive input: the Lagna moves through a full sign in roughly two hours, so a small error in time can change the houses.',
        ],
      },
      {
        heading: 'Sidereal zodiac and ayanamsa',
        paragraphs: [
          'Vedic astrology uses the sidereal zodiac, which is aligned with the fixed stars. Western astrology usually uses the tropical zodiac, aligned with the seasons. The gap between them is called the ayanamsa; the Lahiri (Chitra Paksha) ayanamsa is the standard used in India and is about 24° today. This is why your Vedic Sun sign is often one sign earlier than your Western one.',
        ],
      },
      {
        heading: 'North Indian and South Indian charts',
        paragraphs: [
          'The same Kundli can be drawn in two styles. The North Indian chart is a diamond in which the houses stay fixed and the signs move. The South Indian chart is a square grid in which the signs stay fixed and the Lagna is marked. Both contain exactly the same information.',
        ],
      },
    ],
    faqs: [
      { q: 'Is a Kundli the same as a horoscope?', a: 'In India the words are often used interchangeably. Strictly, the Kundli is the birth chart itself; a horoscope reading is an interpretation of it.' },
      { q: 'What if I do not know my exact birth time?', a: 'You can still calculate a chart with an approximate time. Planet signs will mostly be right, but the Lagna and houses may be off. An astrologer can attempt birth-time rectification using past life events.' },
    ],
    related: ['what-is-lagna', 'what-is-a-nakshatra', 'vimshottari-dasha'],
    ask: 'Give me an overview of my Kundli: my Lagna, Moon sign and the most important placements.',
  },
  {
    slug: 'what-is-lagna',
    title: 'What is Lagna (the ascendant)?',
    metaTitle: 'What is Lagna? The ascendant in Vedic astrology explained',
    description: 'Lagna is the zodiac sign rising on the eastern horizon at your birth. It sets your first house and shapes how the whole Kundli is read.',
    short:
      'Lagna, or the ascendant, is the zodiac sign that was rising on the eastern horizon at the moment of your birth. It becomes your first house, sets the order of all twelve houses, and is considered the single most personal point in a Vedic chart.',
    sections: [
      {
        heading: 'Why the Lagna matters',
        paragraphs: [
          'The first house describes the self: body, temperament and general direction in life. Because the Lagna fixes which sign falls in each house, it decides which planet rules your career house, your marriage house and every other area of life.',
          'The planet that rules the Lagna sign is called the Lagna lord. Its sign, house and strength are read as a key to overall wellbeing.',
        ],
      },
      {
        heading: 'Lagna versus Moon sign versus Sun sign',
        paragraphs: [
          'Indian astrology gives the Moon sign (rashi) great weight for daily forecasts, and the Lagna for the structure of the chart. The Sun sign, used most in Western columns, is one factor among many. A full reading looks at all three.',
        ],
      },
      {
        heading: 'How fast the Lagna changes',
        paragraphs: [
          'The Earth turns through all twelve signs in about 24 hours, so on average a new sign rises roughly every two hours. Some signs rise faster or slower depending on latitude. Two people born on the same day in the same city a few hours apart can have different Lagnas.',
        ],
      },
    ],
    faqs: [
      { q: 'Can my Lagna and Moon sign be the same?', a: 'Yes. If the Moon was in the rising sign at birth, your Lagna and rashi are the same sign.' },
      { q: 'What is a Lagna chart?', a: 'It is another name for the D1 or Rashi chart — the main Kundli with houses counted from the Lagna.' },
    ],
    related: ['what-is-a-kundli', 'navamsa-d9-chart', 'what-is-a-nakshatra'],
    ask: 'What does my Lagna say about me, and where is my Lagna lord placed?',
  },
  {
    slug: 'what-is-a-nakshatra',
    title: 'What is a nakshatra?',
    metaTitle: 'What is a nakshatra? The 27 lunar mansions explained',
    description: 'Nakshatras are the 27 lunar mansions of Vedic astrology, each 13°20′ wide. Your janma nakshatra is where the Moon stood at your birth.',
    short:
      'A nakshatra is one of 27 lunar mansions that divide the zodiac into equal parts of 13°20′. Your janma (birth) nakshatra is the one the Moon occupied when you were born. It shapes temperament, sets the starting point of your Vimshottari dasha and is used for names, muhurta and compatibility.',
    sections: [
      {
        heading: 'How nakshatras divide the sky',
        paragraphs: [
          'The 360° zodiac is split into 27 nakshatras of 13°20′ each, starting with Ashwini at 0° Aries and ending with Revati at the end of Pisces. Each nakshatra is further split into four padas (quarters) of 3°20′.',
          'Every nakshatra is linked to a group of stars in the sky, a presiding deity, a symbol and a ruling planet. For example, Rohini is ruled by the Moon and Krittika — the Pleiades — by the Sun.',
        ],
      },
      {
        heading: 'The ruling-planet sequence',
        paragraphs: [
          'Nakshatra lords repeat in a fixed order of nine: Ketu, Venus, Sun, Moon, Mars, Rahu, Jupiter, Saturn, Mercury. Ashwini is ruled by Ketu, Bharani by Venus, Krittika by the Sun, and so on three times around the zodiac. This same order drives the Vimshottari dasha.',
        ],
      },
      {
        heading: 'Where nakshatras are used',
        paragraphs: [
          'Your janma nakshatra decides your first dasha period. Its pada gives the traditional starting syllable for a baby name. Nakshatras are central to Guna Milan (Kundli matching) and to choosing muhurtas, the auspicious times for important events.',
        ],
      },
    ],
    faqs: [
      { q: 'How many nakshatras are there?', a: 'There are 27 in standard use. A 28th, Abhijit, appears in some muhurta calculations.' },
      { q: 'Is my nakshatra the same as my rashi?', a: 'No. The rashi is the Moon’s sign (30°); the nakshatra is the Moon’s narrower 13°20′ mansion within or across signs.' },
    ],
    related: ['vimshottari-dasha', 'what-is-a-kundli', 'what-is-lagna'],
    ask: 'What does my birth nakshatra say about my nature, and which pada is my Moon in?',
  },
  {
    slug: 'vimshottari-dasha',
    title: 'What is Vimshottari dasha?',
    metaTitle: 'Vimshottari dasha explained: the 120-year planetary periods',
    description: 'Vimshottari dasha is a 120-year cycle of planetary periods that Vedic astrologers use for timing. Here is how Mahadasha and Antardasha work.',
    short:
      'Vimshottari dasha is the main timing system of Vedic astrology. It divides life into a 120-year cycle of nine planetary periods called Mahadashas. The first period is set by the lord of your birth nakshatra, and each Mahadasha is split into sub-periods called Antardashas.',
    sections: [
      {
        heading: 'The nine periods and their length',
        paragraphs: [
          'The Mahadashas always run in the same order and add up to 120 years: Ketu 7 years, Venus 20, Sun 6, Moon 10, Mars 7, Rahu 18, Jupiter 16, Saturn 19 and Mercury 17.',
        ],
      },
      {
        heading: 'Where your cycle starts',
        paragraphs: [
          'Your first Mahadasha belongs to the lord of the nakshatra the Moon occupied at birth. How far the Moon had already travelled through that nakshatra decides how much of the first period remained — the dasha balance at birth. Most people therefore begin part-way through their first dasha.',
        ],
      },
      {
        heading: 'Mahadasha, Antardasha and beyond',
        paragraphs: [
          'Each Mahadasha is divided into nine Antardashas (also called bhuktis) in the same order, beginning with the Mahadasha lord itself. Each Antardasha can be divided again into Pratyantardashas. Astrologers read the period lords’ placement, strength and house rulership in your chart to describe what each period brings.',
        ],
      },
    ],
    faqs: [
      { q: 'Why is it called Vimshottari?', a: 'Vimshottari means “one hundred and twenty” in Sanskrit, the length of the full cycle in years.' },
      { q: 'Is a Saturn Mahadasha always difficult?', a: 'No. Results depend on where Saturn sits in your chart, which houses it rules and its strength. For some charts Saturn’s period is the most productive of all.' },
    ],
    related: ['what-is-a-nakshatra', 'sade-sati', 'what-is-a-kundli'],
    ask: 'Which Mahadasha and Antardasha am I in now, and what does this period mean for me?',
  },
  {
    slug: 'navamsa-d9-chart',
    title: 'What is the Navamsa (D9) chart?',
    metaTitle: 'Navamsa (D9) chart explained: marriage and planet strength',
    description: 'The Navamsa (D9) divides each sign into nine parts. Vedic astrologers use it for marriage, inner strength and to confirm planets in the main chart.',
    short:
      'The Navamsa, or D9 chart, is a divisional chart made by splitting each zodiac sign into nine parts of 3°20′. After the main Rashi chart it is the most important chart in Vedic astrology, used especially for marriage and partnership and to judge the true strength of each planet.',
    sections: [
      {
        heading: 'How the D9 is built',
        paragraphs: [
          'Each 30° sign is divided into nine navamsas of 3°20′. A planet’s navamsa position depends on which of these slices it falls in. The result is a full chart with its own Lagna and houses, drawn in the same North or South Indian style.',
        ],
      },
      {
        heading: 'What it is used for',
        paragraphs: [
          'Traditionally the Navamsa shows the nature of marriage and the spouse, a person’s dharma and the fruit of the main chart over time. A planet weak in the Rashi chart but strong in the Navamsa is often read as improving with age.',
          'When a planet occupies the same sign in both D1 and D9 it is called vargottama, which is considered a mark of strength.',
        ],
      },
    ],
    faqs: [
      { q: 'Does the Navamsa need an accurate birth time?', a: 'Yes. The Navamsa Lagna changes roughly every 13 minutes, so it is more sensitive to birth time than the main chart.' },
      { q: 'What other divisional charts are there?', a: 'There are sixteen classical vargas. Common ones include D10 (Dashamsha) for career, D7 for children and D12 for parents.' },
    ],
    related: ['what-is-lagna', 'mangal-dosha', 'what-is-a-kundli'],
    ask: 'What does my Navamsa (D9) chart say about marriage and my partner?',
  },
  {
    slug: 'sade-sati',
    title: 'What is Sade Sati?',
    metaTitle: 'What is Sade Sati? Saturn’s 7½-year transit explained',
    description: 'Sade Sati is the roughly 7½-year period when Saturn moves through the signs before, on and after your natal Moon. Here are its phases and meaning.',
    short:
      'Sade Sati is the period of about seven and a half years when Saturn transits the sign before your natal Moon sign, your Moon sign itself, and the sign after it. Because Saturn spends roughly two and a half years in each sign, the three phases together last about 7½ years.',
    sections: [
      {
        heading: 'The three phases',
        paragraphs: [
          'The first phase begins when Saturn enters the 12th sign from your Moon. The second, often called the peak, is when Saturn moves over the Moon sign itself. The third begins when Saturn enters the 2nd sign from the Moon and ends when it leaves.',
        ],
      },
      {
        heading: 'What it is associated with',
        paragraphs: [
          'Tradition links Sade Sati with pressure, responsibility, slower progress and lessons in patience. It is also described as a time of maturity and lasting results for steady work. Its effect varies widely with Saturn’s role in the individual chart, the current dasha and other transits.',
          'Most people experience Sade Sati two or three times in a lifetime, since Saturn takes about 29½ years to circle the zodiac.',
        ],
      },
    ],
    faqs: [
      { q: 'How do I know if I am in Sade Sati?', a: 'Compare Saturn’s current sign with your natal Moon sign. If Saturn is in the sign before, the same sign or the sign after your Moon, you are in Sade Sati.' },
      { q: 'What is Dhaiya (Shani Dhaiya)?', a: 'It is a shorter Saturn transit of about two and a half years through the 4th or 8th sign from the Moon, also watched closely in tradition.' },
    ],
    related: ['vimshottari-dasha', 'what-is-a-kundli', 'mangal-dosha'],
    ask: 'Am I in Sade Sati now? If not, when does my next one begin?',
  },
  {
    slug: 'mangal-dosha',
    title: 'What is Mangal Dosha?',
    metaTitle: 'What is Mangal Dosha (Manglik)? Houses and cancellation',
    description: 'Mangal Dosha is a Vedic marriage factor based on Mars’ house position. Learn which houses count, how traditions differ and how it can be cancelled.',
    short:
      'Mangal Dosha, also called Kuja Dosha or being Manglik, is a traditional marriage consideration in Vedic astrology. It is said to be present when Mars occupies certain houses — most often the 1st, 4th, 7th, 8th or 12th, and in some traditions the 2nd — counted from the Lagna, and sometimes also from the Moon or Venus.',
    sections: [
      {
        heading: 'How it is checked',
        paragraphs: [
          'Astrologers look at Mars’ house from the Lagna and, in many traditions, also from the Moon and from Venus. North and South Indian practice differ on whether the 1st or 2nd house is included, so two calculators can disagree about the same chart.',
        ],
      },
      {
        heading: 'Cancellation and balance',
        paragraphs: [
          'Classical texts list many conditions that cancel or reduce the dosha, such as Mars in its own sign or exaltation, or both partners having a similar Mars placement. In Kundli matching, Mangal Dosha is one factor among many and is weighed together with Guna Milan and the overall charts.',
        ],
      },
    ],
    faqs: [
      { q: 'Is Mangal Dosha very common?', a: 'Yes. Because several houses qualify, a large share of all charts meet at least one version of the rule.' },
      { q: 'Should Mangal Dosha alone decide a marriage?', a: 'No. Even traditional practice treats it as one consideration within a full compatibility reading, not a verdict on its own.' },
    ],
    related: ['navamsa-d9-chart', 'what-is-lagna', 'sade-sati'],
    ask: 'Do I have Mangal Dosha in my chart, and is it cancelled by anything?',
  },
  {
    slug: 'how-to-read-a-kundli',
    title: 'How to read a Kundli',
    metaTitle: 'How to read a Kundli: a step-by-step guide for beginners',
    description: 'Read your own birth chart in seven steps: find the Lagna, the houses and signs, the planets, their lords and strength, the Moon sign and your current dasha.',
    short:
      'To read a Kundli, start with the Lagna (the 1st house), then see which sign falls in each of the 12 houses, which planets sit in them, and where each house’s lord is placed. Then check planet strength, the Moon sign and nakshatra, and finally the dasha running now — that tells you which part of the chart is active.',
    sections: [
      {
        heading: 'Step 1: Find the Lagna',
        paragraphs: [
          'In a North Indian chart the houses are fixed: the top centre diamond is always the 1st house (Lagna), and houses run anticlockwise from there. The number written in each house is the sign, from 1 (Aries) to 12 (Pisces). So if the top diamond shows 5, the person has a Leo Lagna.',
          'In a South Indian chart the signs are fixed in the same boxes every time — Pisces top left, then clockwise — and the Lagna box is marked with a line or the word “Lagna”.',
        ],
      },
      {
        heading: 'Step 2: Read the houses and their signs',
        paragraphs: [
          'Each of the 12 houses covers an area of life: self, wealth, siblings, home, children, health, marriage, longevity, fortune, career, gains and losses. The sign in a house colours how that area works, and the planet that rules that sign becomes the house’s lord.',
        ],
      },
      {
        heading: 'Step 3: Note the planets in each house',
        paragraphs: [
          'Write down where the nine grahas sit. A planet in a house brings its own nature into that area of life: Jupiter tends to expand and protect, Saturn to slow down and test, Mars to energise, Venus to harmonise.',
        ],
      },
      {
        heading: 'Step 4: Follow the house lords',
        paragraphs: [
          'This is the step most beginners skip. The lord of a house carries that house’s matters wherever it goes. If the 10th lord (career) sits in the 7th house (partnership), work and partnerships tend to be linked — business with others, or a career that involves the public.',
        ],
      },
      {
        heading: 'Step 5: Judge strength',
        paragraphs: [
          'A planet is generally stronger in its own sign or its exaltation sign, and weaker in its debilitation sign. Also note retrograde planets and planets very close to the Sun (combust). Aspects matter too: every planet aspects the 7th house from itself, and Mars, Jupiter and Saturn have extra special aspects.',
        ],
      },
      {
        heading: 'Step 6: Check the Moon sign and nakshatra',
        paragraphs: [
          'The Moon’s sign (your rashi) and nakshatra describe the mind and emotions, and are used for daily forecasts, Sade Sati and compatibility.',
        ],
      },
      {
        heading: 'Step 7: Look at the current dasha',
        paragraphs: [
          'The Vimshottari dasha tells you which planet’s period you are in. The houses that planet rules and occupies are the parts of your chart most active right now. A good placement in a dormant period may show little; an ordinary one in its own dasha can become very visible.',
        ],
      },
    ],
    faqs: [
      { q: 'Can I read my own Kundli without an astrologer?', a: 'You can learn the basics — Lagna, houses, planets and dashas — and understand a lot about your chart. Detailed judgement, such as weighing many factors against each other, takes practice.' },
      { q: 'Which is more important, the Lagna or the Moon sign?', a: 'Both. The Lagna sets the structure of the whole chart; the Moon sign shows the mind and is used for timing and daily forecasts. A full reading uses both.' },
      { q: 'What do the numbers in a North Indian Kundli mean?', a: 'They are sign numbers, not house numbers: 1 is Aries, 2 Taurus, and so on to 12, Pisces. The house is fixed by position, starting from the top centre diamond.' },
    ],
    related: ['houses-in-kundli', 'what-is-lagna', 'vimshottari-dasha'],
    ask: 'Walk me through my Kundli step by step: my Lagna, the key houses and the dasha I am in now.',
  },
  {
    slug: 'houses-in-kundli',
    title: 'The 12 houses of a Kundli',
    metaTitle: 'The 12 houses in a Kundli: what each bhava rules (1st to 12th)',
    description: 'What each of the 12 houses (bhavas) rules in Vedic astrology — from the 1st house of self to the 7th of marriage and the 10th of career — and how houses are grouped.',
    short:
      'A Kundli is divided into 12 houses, or bhavas, each ruling an area of life. The 1st house is the self, the 2nd wealth and family, the 4th home and mother, the 5th children and intelligence, the 7th marriage and partners, the 10th career, and the 12th losses, expenses and liberation. Houses are counted from the Lagna.',
    sections: [
      {
        heading: 'What each house rules',
        paragraphs: ['The traditional meanings of the twelve houses are:'],
        list: [
          '1st (Tanu): self, body, health, temperament and general direction in life.',
          '2nd (Dhana): wealth, savings, family, speech and food.',
          '3rd (Sahaja): younger siblings, courage, effort, short journeys and communication.',
          '4th (Sukha): mother, home, property, vehicles and inner peace.',
          '5th (Putra): children, intelligence, education, creativity and merit from past lives.',
          '6th (Ripu): enemies, debts, illness, daily work and service.',
          '7th (Yuvati): marriage, spouse, business partners and the public.',
          '8th (Randhra): longevity, sudden events, inheritance and hidden knowledge.',
          '9th (Dharma): fortune, father, teachers, faith and long journeys.',
          '10th (Karma): career, status, authority and public reputation.',
          '11th (Labha): income, gains, wishes fulfilled, friends and elder siblings.',
          '12th (Vyaya): expenses, losses, foreign lands, sleep and liberation (moksha).',
        ],
      },
      {
        heading: 'How houses are grouped',
        paragraphs: [
          'Kendras (1, 4, 7, 10) are the pillars of the chart; planets here act strongly. Trikonas (1, 5, 9) are houses of fortune and dharma. Dusthanas (6, 8, 12) are houses of difficulty, though they also bring endurance and spiritual growth. Upachayas (3, 6, 10, 11) are houses that improve with time and effort.',
        ],
      },
      {
        heading: 'Natural significators',
        paragraphs: [
          'Each house also has a planet that naturally signifies it, called its karaka. The Sun signifies the 1st and 10th, the Moon the 4th, Jupiter the 2nd, 5th, 9th and 11th, Mars the 3rd and 6th, Venus the 7th, and Saturn the 8th and 12th. Astrologers read a house, its lord and its karaka together.',
        ],
      },
    ],
    faqs: [
      { q: 'Which house is for marriage?', a: 'The 7th house, along with its lord and Venus. The Navamsa (D9) chart is used to confirm.' },
      { q: 'Which house is for career?', a: 'The 10th house is the main house of career and status. The 2nd and 11th houses show income and gains, and the 6th shows daily work and service.' },
      { q: 'What does an empty house mean?', a: 'Nothing bad. An empty house works through its lord — the planet that rules its sign — and through planets that aspect it.' },
    ],
    related: ['how-to-read-a-kundli', 'what-is-lagna', 'marriage-timing-in-kundli'],
    ask: 'Explain my 12 houses: which ones are strongest in my chart and what does that mean for me?',
  },
  {
    slug: 'marriage-timing-in-kundli',
    title: 'When will I get married? Marriage timing in a Kundli',
    metaTitle: 'When will I get married? Marriage timing in a Kundli',
    description: 'How Vedic astrologers estimate marriage timing: the 7th house and its lord, Venus and Jupiter, the Navamsa, dashas and Jupiter–Saturn transits.',
    short:
      'Astrologers estimate marriage timing by combining three things: the promise of marriage in the 7th house, its lord, Venus and the Navamsa (D9) chart; a dasha or antardasha of a planet connected with these; and transits — especially Jupiter and Saturn — touching the 7th house, its lord or the Lagna at the same time.',
    sections: [
      {
        heading: '1. Is marriage promised, and what kind?',
        paragraphs: [
          'The 7th house shows marriage and the spouse. Its lord, planets placed in it and planets aspecting it describe how partnership comes and what it is like. Venus is the natural significator of marriage; in women’s charts tradition also looks at Jupiter. The Navamsa (D9) confirms whether the promise in the main chart holds up.',
        ],
      },
      {
        heading: '2. Which dasha can bring it?',
        paragraphs: [
          'Marriage usually happens in the dasha or antardasha of a planet linked to marriage: the 7th lord, a planet in the 7th house, Venus, the lord of the Navamsa Lagna or 7th, or Rahu when connected with the 7th. The order of periods in your Vimshottari dasha narrows the possible years.',
        ],
      },
      {
        heading: '3. Which transit triggers it?',
        paragraphs: [
          'Many astrologers look for a “double transit”: Jupiter and Saturn both influencing the 7th house or its lord, by placement or aspect, during a supporting dasha. Jupiter’s transit over the 7th house, the 7th lord or the Lagna is a common trigger.',
        ],
      },
      {
        heading: 'Why marriage can be delayed',
        paragraphs: [
          'Tradition associates delay with Saturn influencing the 7th house, its lord or Venus, a weak or afflicted 7th lord, or long dashas of planets unconnected with marriage. Delay is not denial: Saturn’s influence is often read as a later but stable marriage.',
        ],
      },
    ],
    faqs: [
      { q: 'Can a Kundli tell the exact date of marriage?', a: 'No chart reading can promise an exact date. Astrologers can point to periods that look more likely, which narrow down with an accurate birth time.' },
      { q: 'Does Manglik dosha delay marriage?', a: 'Mangal Dosha is a compatibility consideration rather than a timing rule. It has many cancellations and is one factor among many.' },
      { q: 'Is love or arranged marriage shown in the chart?', a: 'Tradition links love marriage to connections between the 5th house (romance) and the 7th, and to Rahu or Venus influence, but readings differ and no single rule decides it.' },
    ],
    related: ['houses-in-kundli', 'navamsa-d9-chart', 'kundli-milan-guna-milan'],
    ask: 'When does my chart show good periods for marriage? Look at my 7th house, its lord, Venus and my dashas.',
  },
  {
    slug: 'kundli-milan-guna-milan',
    title: 'Kundli Milan and Guna Milan: how the 36 gunas work',
    metaTitle: 'Kundli Milan & Guna Milan: 36 gunas and Nadi dosha',
    description: 'How Kundli matching works: the eight kootas of Guna Milan worth 36 points, what scores mean, Nadi and Bhakoot dosha, and why the full charts still matter.',
    short:
      'Kundli Milan is the matching of two birth charts before marriage. Its best-known part, Guna Milan (Ashtakoota), compares the Moon’s nakshatra and sign of both partners across eight factors worth 36 points in total. By common convention 18 or more is considered acceptable, but astrologers also check Mangal Dosha and both full charts.',
    sections: [
      {
        heading: 'The eight kootas and their points',
        paragraphs: ['Guna Milan has eight parts (kootas). Higher-numbered kootas carry more weight:'],
        list: [
          'Varna — 1 point: temperament and spiritual outlook.',
          'Vashya — 2 points: mutual attraction and influence.',
          'Tara — 3 points: wellbeing, from the distance between the two birth nakshatras.',
          'Yoni — 4 points: physical and instinctive compatibility.',
          'Graha Maitri — 5 points: friendship between the lords of the two Moon signs.',
          'Gana — 6 points: nature (deva, manushya or rakshasa).',
          'Bhakoot — 7 points: the relation between the two Moon signs.',
          'Nadi — 8 points: considered linked to health and progeny.',
        ],
      },
      {
        heading: 'What the score means',
        paragraphs: [
          'A commonly used guide: below 18 is not recommended, 18 to 24 is acceptable, 25 to 32 is good, and above 32 is excellent. These are conventions, not rules from a single classical text, and practice varies between families and regions.',
        ],
      },
      {
        heading: 'Nadi dosha and Bhakoot dosha',
        paragraphs: [
          'Nadi dosha arises when both partners have the same nadi, giving 0 of 8 points. Bhakoot dosha arises when the two Moon signs are 2–12, 5–9 or 6–8 from each other, giving 0 of 7 points. Both have recognised cancellations — for example, when the Moon signs share a lord or are friendly — so a dosha on paper is not automatically a rejection.',
        ],
      },
      {
        heading: 'Beyond the score',
        paragraphs: [
          'Guna Milan only uses the Moon. A careful match also compares the Lagnas, the 7th houses, Venus, the Navamsa charts, Mangal Dosha in both charts, and the dashas each partner will run in the coming years. In South India, matching usually uses the ten poruthams instead of the eight kootas.',
        ],
      },
    ],
    faqs: [
      { q: 'Is 18 gunas enough for marriage?', a: 'By the common convention 18 is the minimum considered acceptable. A match with a lower score can still work if the full charts support it, and a high score does not guarantee harmony.' },
      { q: 'Can Kundli Milan be done by name only?', a: 'Name-based matching uses the first syllable of the name to guess a nakshatra. It is far less reliable than matching with actual birth details.' },
      { q: 'What is the highest Guna Milan score?', a: '36 out of 36. Very high scores are rare, and astrologers still check the full charts.' },
    ],
    related: ['mangal-dosha', 'what-is-a-nakshatra', 'marriage-timing-in-kundli'],
    ask: 'What does my chart need in a partner? Explain how Kundli matching would work for me, starting with my Moon sign and nakshatra.',
  },
  {
    slug: 'rahu-mahadasha',
    title: 'Rahu Mahadasha: the 18-year period explained',
    metaTitle: 'Rahu Mahadasha: effects and antardashas explained',
    description: 'Rahu Mahadasha lasts 18 years. What Rahu signifies, what decides whether the period goes well, and the order and length of its nine antardashas.',
    short:
      'Rahu Mahadasha is the 18-year period of Rahu in the Vimshottari dasha system. Rahu is the Moon’s north node, a shadow point rather than a physical planet, associated with ambition, desire, foreign lands, technology and sudden change. Its results depend on Rahu’s house, sign, sign lord and the planets with it.',
    sections: [
      {
        heading: 'What Rahu signifies',
        paragraphs: [
          'Rahu and Ketu are the two points where the Moon’s path crosses the Sun’s, which is why they are linked with eclipses. Rahu amplifies whatever it touches: hunger for success, unconventional paths, foreign connections, technology, media and sudden rises — as well as confusion, restlessness and illusion when poorly placed.',
        ],
      },
      {
        heading: 'What decides the results',
        paragraphs: [
          'Because Rahu has no sign of its own, it acts largely like the lord of the sign it occupies (its dispositor) and the planets it sits with. Astrologers look at its house (Rahu in the 3rd, 6th, 10th or 11th is often considered helpful), the strength of its dispositor, its nakshatra and conjunctions.',
        ],
      },
      {
        heading: 'The nine antardashas',
        paragraphs: ['Rahu’s 18 years are divided into sub-periods in this order (approximate lengths):'],
        list: [
          'Rahu–Rahu: 2 years 8 months',
          'Rahu–Jupiter: 2 years 4 months',
          'Rahu–Saturn: 2 years 10 months',
          'Rahu–Mercury: 2 years 6 months',
          'Rahu–Ketu: 1 year',
          'Rahu–Venus: 3 years',
          'Rahu–Sun: 11 months',
          'Rahu–Moon: 1 year 6 months',
          'Rahu–Mars: 1 year',
        ],
      },
    ],
    faqs: [
      { q: 'Is Rahu Mahadasha always bad?', a: 'No. For many people it is a period of strong ambition and visible growth, especially in career and foreign matters. The chart decides how it plays out.' },
      { q: 'What comes after Rahu Mahadasha?', a: 'Jupiter Mahadasha, which lasts 16 years. Many people experience it as a steadier, more settled period.' },
      { q: 'Does Rahu Mahadasha affect marriage?', a: 'It can, especially if Rahu is connected with the 7th house or Venus. Tradition links it with unconventional or sudden decisions in relationships.' },
    ],
    related: ['vimshottari-dasha', 'kaal-sarp-dosh', 'shani-mahadasha'],
    ask: 'Where is Rahu in my chart, and what would Rahu Mahadasha or a Rahu antardasha bring for me?',
  },
  {
    slug: 'shani-mahadasha',
    title: 'Shani Mahadasha: the 19-year Saturn period',
    metaTitle: 'Shani Mahadasha: effects, antardashas, vs Sade Sati',
    description: 'Shani Mahadasha lasts 19 years. What Saturn signifies, when its period tends to go well, its nine antardashas, and how it differs from Sade Sati.',
    short:
      'Shani Mahadasha is Saturn’s 19-year period in the Vimshottari dasha system. Saturn signifies discipline, hard work, responsibility, endurance and karma. Its period tends to reward patience and steady effort; how it unfolds depends on Saturn’s strength and the houses it rules in your chart.',
    sections: [
      {
        heading: 'What Saturn signifies',
        paragraphs: [
          'Saturn is the slowest of the visible planets, taking about 29½ years to circle the zodiac. In Jyotish it stands for time, structure, duty, service, labour, old age and justice. It rules Capricorn and Aquarius, is exalted in Libra and debilitated in Aries.',
        ],
      },
      {
        heading: 'When the period tends to go well',
        paragraphs: [
          'Saturn usually gives better results when it is strong by sign, placed in the 3rd, 6th, 10th or 11th house, or when it rules good houses for your Lagna. For Taurus and Libra Lagnas Saturn rules both a kendra and a trikona, which makes it especially favourable (a yogakaraka).',
        ],
      },
      {
        heading: 'Shani Mahadasha is not Sade Sati',
        paragraphs: [
          'Sade Sati is a transit: Saturn moving through the signs around your natal Moon for about 7½ years. Shani Mahadasha is a dasha: a 19-year period set at birth by your nakshatra. They can overlap, but they are different things.',
        ],
      },
      {
        heading: 'The nine antardashas',
        paragraphs: ['Saturn’s 19 years are divided into sub-periods in this order (approximate lengths):'],
        list: [
          'Saturn–Saturn: 3 years',
          'Saturn–Mercury: 2 years 8 months',
          'Saturn–Ketu: 1 year 1 month',
          'Saturn–Venus: 3 years 2 months',
          'Saturn–Sun: 11 months',
          'Saturn–Moon: 1 year 7 months',
          'Saturn–Mars: 1 year 1 month',
          'Saturn–Rahu: 2 years 10 months',
          'Saturn–Jupiter: 2 years 6 months',
        ],
      },
    ],
    faqs: [
      { q: 'Is Shani Mahadasha always difficult?', a: 'No. For well-placed Saturn it is often the period of most lasting achievement, built through steady work.' },
      { q: 'What comes after Shani Mahadasha?', a: 'Mercury Mahadasha, which lasts 17 years.' },
      { q: 'Does everyone get Shani Mahadasha?', a: 'Not necessarily within a lifetime. Which dashas you experience depends on the dasha you are born into; the full cycle takes 120 years.' },
    ],
    related: ['sade-sati', 'vimshottari-dasha', 'rahu-mahadasha'],
    ask: 'How strong is Saturn in my chart, and what would Shani Mahadasha or a Saturn antardasha mean for me?',
  },
  {
    slug: 'kaal-sarp-dosh',
    title: 'What is Kaal Sarp Dosh?',
    metaTitle: 'What is Kaal Sarp Dosh? Meaning, types and the facts',
    description: 'Kaal Sarp Dosh is said to form when all seven planets fall between Rahu and Ketu. Its twelve types, and why many astrologers do not treat it as classical.',
    short:
      'Kaal Sarp Dosh (or Kaal Sarp Yoga) is said to form when all seven visible planets, Sun to Saturn, lie on one side of the Rahu–Ketu axis in a birth chart. It is associated in popular belief with obstacles and delays, but it does not appear in the major classical texts such as Brihat Parashara Hora Shastra, and many astrologers give it little weight.',
    sections: [
      {
        heading: 'How it is identified',
        paragraphs: [
          'Rahu and Ketu are always exactly opposite each other. If all seven planets fall within the arc from Rahu to Ketu (or Ketu to Rahu), the chart is described as having Kaal Sarp Yoga. If even one planet falls outside, it is not formed; some practitioners speak of a “partial” form when a planet is outside by a few degrees.',
        ],
      },
      {
        heading: 'The twelve named types',
        paragraphs: [
          'Popular practice names twelve types by the house Rahu occupies: Anant (1st), Kulik (2nd), Vasuki (3rd), Shankhpal (4th), Padma (5th), Mahapadma (6th), Takshak (7th), Karkotak (8th), Shankhachud (9th), Ghatak (10th), Vishdhar (11th) and Sheshnag (12th).',
        ],
      },
      {
        heading: 'A balanced view',
        paragraphs: [
          'Because it is a later tradition rather than a classical rule, readings differ widely. Many people with this pattern lead ordinary or very successful lives. What matters more is the actual strength of planets, the houses Rahu and Ketu occupy and the dashas you run. Be cautious of anyone who uses it to create fear or sell expensive remedies.',
        ],
      },
    ],
    faqs: [
      { q: 'Is Kaal Sarp Dosh mentioned in classical texts?', a: 'It is not described in Brihat Parashara Hora Shastra or the other major classical works. It became popular in later practice.' },
      { q: 'Is Kaal Sarp Dosh permanent?', a: 'The pattern is fixed in the birth chart, but tradition says its effects are felt mainly in the dashas of Rahu and Ketu, and that they ease with age.' },
      { q: 'Do I need a puja for Kaal Sarp Dosh?', a: 'That is a personal choice. Nothing in the chart requires it, and no remedy should be bought out of fear.' },
    ],
    related: ['rahu-mahadasha', 'mangal-dosha', 'what-is-a-kundli'],
    ask: 'Is there a Kaal Sarp pattern in my chart? Where are Rahu and Ketu, and what do they actually mean for me?',
  },
  {
    slug: 'moon-sign',
    title: 'What is your Moon sign (Rashi)?',
    metaTitle: 'Moon sign (Rashi): meaning, and Moon sign vs Sun sign',
    description: 'Your Moon sign, or rashi, is the sign the Moon was in when you were born. Why Indian astrology uses it for horoscopes, and how it differs from your Sun sign.',
    short:
      'Your Moon sign, or rashi, is the zodiac sign the Moon occupied at the moment of your birth. Indian astrology uses it for daily horoscopes (rashifal), Sade Sati, Kundli matching and timing, because the Moon describes the mind and emotions. It is calculated in the sidereal zodiac, so it can differ from a Western sign.',
    sections: [
      {
        heading: 'Why the Moon sign matters in Jyotish',
        paragraphs: [
          'Western columns are written by Sun sign; Indian rashifal is written by Moon sign. The Moon moves fast — about one sign every 2¼ days — so it is far more personal than the Sun, which stays in a sign for a month. The chart drawn with the Moon’s sign as the 1st house, called Chandra Lagna, is read alongside the main chart.',
        ],
      },
      {
        heading: 'Moon sign vs Sun sign vs Lagna',
        paragraphs: [
          'The Sun sign shows the soul and authority; the Moon sign the mind, feelings and habits; the Lagna the body and the structure of the whole chart. Because Vedic astrology uses the sidereal zodiac, your Vedic Sun sign is often one sign earlier than the Western one.',
        ],
      },
      {
        heading: 'How to find your Moon sign',
        paragraphs: [
          'You need your date, time and place of birth. If you were born on a day the Moon changed sign, the birth time decides which sign it is. Your birth nakshatra lies within or across your Moon sign.',
        ],
      },
    ],
    faqs: [
      { q: 'Is rashi the same as Moon sign?', a: 'Yes. In everyday Indian usage “rashi” means the Moon sign.' },
      { q: 'Can I find my Moon sign from my date of birth alone?', a: 'Usually, but not always. The Moon changes sign roughly every 2¼ days, so on some dates you need the birth time to be sure.' },
      { q: 'Should I read my horoscope by Moon sign or Lagna?', a: 'Indian daily horoscopes use the Moon sign. Reading by Lagna is also common for transits; many people read both.' },
    ],
    related: ['what-is-a-nakshatra', 'what-is-lagna', 'sade-sati'],
    ask: 'What is my Moon sign and nakshatra, and what do they say about my mind and emotions?',
  },
];

// Further reading for each guide, shown at the end of the page and listed as
// `citation` in its Article schema. Every link was checked to resolve.
const wiki = (page, title = page.replace(/_/g, ' ')) => ({ title: `${title} — Wikipedia`, url: `https://en.wikipedia.org/wiki/${page}` });
const BPHS = wiki('Brihat_Parashara_Hora_Shastra', 'Brihat Parashara Hora Shastra');
const SATURN_NASA = { title: 'Saturn fact sheet (orbital period) — NASA', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/saturnfact.html' };

const SOURCES = {
  'what-is-a-kundli': [wiki('Kundali'), wiki('Hindu_astrology'), wiki('Sidereal_and_tropical_astrology', 'Sidereal and tropical astrology'), wiki('Ayanamsa'), BPHS],
  'what-is-lagna': [wiki('Ascendant'), wiki('Bhava'), BPHS],
  'what-is-a-nakshatra': [wiki('Nakshatra'), wiki('Lunar_mansion', 'Lunar mansion')],
  'vimshottari-dasha': [wiki('Dasha_(astrology)', 'Dasha (astrology)'), BPHS],
  'navamsa-d9-chart': [wiki('Varga_(astrology)', 'Varga (astrology)'), BPHS],
  'sade-sati': [wiki('Sade_Sati', 'Sade Sati'), wiki('Shani'), SATURN_NASA],
  'mangal-dosha': [wiki('Mangal_Dosha', 'Mangal Dosha'), wiki('Hindu_wedding', 'Hindu wedding')],
  'how-to-read-a-kundli': [wiki('Kundali'), wiki('Bhava'), wiki('Rashi'), wiki('Navagraha'), BPHS],
  'houses-in-kundli': [wiki('Bhava'), wiki('Kundali'), BPHS],
  'marriage-timing-in-kundli': [wiki('Bhava'), wiki('Dasha_(astrology)', 'Dasha (astrology)'), wiki('Varga_(astrology)', 'Varga (astrology)')],
  'kundli-milan-guna-milan': [wiki('Hindu_wedding', 'Hindu wedding'), wiki('Nakshatra'), wiki('Mangal_Dosha', 'Mangal Dosha')],
  'rahu-mahadasha': [wiki('Rahu'), wiki('Lunar_node', 'Lunar node'), wiki('Dasha_(astrology)', 'Dasha (astrology)')],
  'shani-mahadasha': [wiki('Shani'), wiki('Dasha_(astrology)', 'Dasha (astrology)'), SATURN_NASA],
  'kaal-sarp-dosh': [wiki('Rahu'), wiki('Lunar_node', 'Lunar node'), BPHS],
  'moon-sign': [wiki('Rashi'), wiki('Nakshatra'), wiki('Sidereal_and_tropical_astrology', 'Sidereal and tropical astrology')],
};
for (const g of GUIDES) g.sources = SOURCES[g.slug] || [];

// Guides shown on the home page: the questions people search for most (Google India autocomplete, Oct 2026).
export const FEATURED_GUIDES = ['how-to-read-a-kundli', 'marriage-timing-in-kundli', 'kundli-milan-guna-milan', 'houses-in-kundli', 'sade-sati', 'mangal-dosha'];

export const guideBySlug = (slug) => GUIDES.find((g) => g.slug === slug) || null;
