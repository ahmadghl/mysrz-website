// Single source of truth for the Tours system — the listing page,
// the per-package detail pages (/tours/[slug]) and the itinerary PDFs
// all read from here. Prices are PKR, benchmarked to the local market.
//
// Standing rule: 4x4 jeep hire and ALL entry tickets / permits are
// EXCLUDED from every price (customer pays on the ground). Keep the
// `excludes` list honest on every package.

const MEDIA =
  'https://sptdzsvuswdpykvgblfm.supabase.co/storage/v1/object/public/media/content/';

export interface TourDay {
  title: string;
  body: string;
}

export interface TourPrices {
  solo: number;
  couple: number;
  deluxe: number;
}

export interface Tour {
  slug: string;
  name: string;
  days: number;
  nights: number;
  region: string;
  image: string;
  tagline: string;
  /** Short bullets used on the listing card. */
  highlights: string[];
  itinerary: TourDay[];
  includes: string[];
  excludes: string[];
  goodToKnow: string[];
  prices: TourPrices;
}

const SHARED_INCLUDES = [
  'Accommodation in clean, well-kept hotels (private room per the package tier)',
  'Road transport throughout as per the package',
  'Daily breakfast and dinner',
  'An experienced local tour guide and on-trip support',
];

const SHARED_EXCLUDES = [
  '4x4 jeep hire (Saif ul Malook, Deosai, Mahodand, Ratti Gali and similar tracks)',
  'All entry tickets, national-park fees and permits',
  'Domestic flights (where the fly option is chosen), booked at the current fare',
  'Lunch, mineral water, snacks and refreshments',
  'Anything not listed under What is included',
];

const SHARED_GOOD_TO_KNOW = [
  'Rooms are shared on a same-family or married-couple basis; the Couple and Deluxe tiers get a private room.',
  'Carry your CNIC or passport at all times; some areas need it at checkposts.',
  'Mountain weather can change the plan; if a route closes we adjust it with you, we never just cancel a day.',
  'The high passes and lakes involve altitude, take it easy the first day and stay hydrated.',
  'Northern hotels are simple but clean; the mountains, not the marble, are the point.',
];

export const TOURS: Tour[] = [
  {
    slug: 'naran-kaghan',
    name: 'Naran & Kaghan',
    days: 3,
    nights: 2,
    region: 'Kaghan Valley, KPK',
    image: `${MEDIA}lake-saif-ul-malook-naran.jpg`,
    tagline:
      'Alpine lakes and the climb to Babusar Top, an easy first taste of the mountains.',
    highlights: [
      'Lake Saif ul Malook by jeep',
      'Lulusar Lake & Babusar Top',
      'Kunhar River & Naran bazaar',
    ],
    itinerary: [
      {
        title: 'Day 1 — Up to Naran, and Lake Saif ul Malook',
        body: 'Early start on the motorway, with a breakfast stop on the way. We reach Naran by afternoon, check in and rest, then head up to the famous Lake Saif ul Malook by jeep for the evening light. Dinner and overnight in Naran.',
      },
      {
        title: 'Day 2 — Babusar Top and the high valley',
        body: 'A full day north towards Babusar Top at around 4,170 m, stopping at Lulusar Lake, the meadows around Battakundi and Besal, and the Kunhar River viewpoints. We keep the plan loose so you can stop for the light. Back to Naran for dinner and the night.',
      },
      {
        title: 'Day 3 — The road home',
        body: 'After breakfast we check out and begin the drive back, with short stops for photos and refreshments along the Kaghan valley. End of tour.',
      },
    ],
    includes: SHARED_INCLUDES,
    excludes: SHARED_EXCLUDES,
    goodToKnow: SHARED_GOOD_TO_KNOW,
    prices: { solo: 18500, couple: 45000, deluxe: 66000 },
  },
  {
    slug: 'swat-kalam',
    name: 'Swat & Kalam',
    days: 4,
    nights: 3,
    region: 'Swat Valley, KPK',
    image: `${MEDIA}swat-ushu-valley.jpg`,
    tagline:
      'Green river valleys, pine forest and the high lakes of upper Swat.',
    highlights: [
      'Bahrain & Kalam on the Swat River',
      'Mahodand Lake & the Ushu forest',
      'Malam Jabba, with a Kumrat option',
    ],
    itinerary: [
      {
        title: 'Day 1 — Into the Swat Valley',
        body: 'Depart early and drive up through Mingora and Bahrain, following the Swat River into Kalam. Check in, then an easy evening walk along the river and the bazaar. Dinner and overnight in Kalam.',
      },
      {
        title: 'Day 2 — Mahodand Lake and the Ushu forest',
        body: 'A jeep day up the Ushu valley through thick pine forest to Mahodand Lake, with the Falak Sar peaks behind it. Time by the water, then back down to Kalam for the night.',
      },
      {
        title: 'Day 3 — Upper Swat, or a Malam Jabba day',
        body: 'Depending on your interest, either a jeep morning to the upper lakes above Kalam, or a run across to Malam Jabba for the resort and the forest. Overnight in Kalam or Bahrain.',
      },
      {
        title: 'Day 4 — Down the valley and home',
        body: 'A relaxed drive back down the Swat River with stops at Fizagat and any spot that catches the eye. End of tour.',
      },
    ],
    includes: SHARED_INCLUDES,
    excludes: SHARED_EXCLUDES,
    goodToKnow: SHARED_GOOD_TO_KNOW,
    prices: { solo: 23000, couple: 56000, deluxe: 80000 },
  },
  {
    slug: 'hunza-valley',
    name: 'Hunza Valley',
    days: 5,
    nights: 4,
    region: 'Hunza & Gilgit, GB',
    image: `${MEDIA}hunza-guide-eagles-nest-view.jpg`,
    tagline:
      'The classic Karakoram week: turquoise lakes, ancient forts and the China border.',
    highlights: [
      'Karimabad with Baltit & Altit forts',
      'Attabad Lake & the Passu Cones',
      'Khunjerab Pass & sunrise at Duikar',
    ],
    itinerary: [
      {
        title: 'Day 1 — North to Chilas',
        body: 'A long, scenic day north via Naran and Babusar Top (or the Karakoram Highway, weather depending), past Lulusar Lake. Dinner and overnight at Chilas or Gilgit.',
      },
      {
        title: 'Day 2 — Into Hunza',
        body: 'On to Karimabad, stopping at the Rakaposhi View Point on the way. Check in, then the thousand-year-old Baltit and Altit forts and the old town, finishing with sunset from Duikar above the valley. Overnight in Hunza.',
      },
      {
        title: 'Day 3 — Upper Hunza',
        body: 'North along the Karakoram Highway to the turquoise Attabad Lake with a boat ride, the iconic Passu Cones, the Hussaini suspension bridge and quiet Borith Lake. Overnight in Hunza.',
      },
      {
        title: 'Day 4 — Khunjerab Pass, then back down',
        body: 'Up to the Pakistan-China border at Khunjerab Pass, around 4,700 m, through Khunjerab National Park where marmots and ibex are often seen. We keep the time at the top short for the altitude, then begin the drive back towards Naran or Chilas for the night.',
      },
      {
        title: 'Day 5 — The road home',
        body: 'After breakfast, the final leg back to your city with short stops for the views. End of tour.',
      },
    ],
    includes: SHARED_INCLUDES,
    excludes: SHARED_EXCLUDES,
    goodToKnow: SHARED_GOOD_TO_KNOW,
    prices: { solo: 27500, couple: 65000, deluxe: 95000 },
  },
  {
    slug: 'skardu-baltistan',
    name: 'Skardu & Baltistan',
    days: 6,
    nights: 5,
    region: 'Baltistan, GB',
    image: `${MEDIA}skardu-guide-sheosar-lake.jpg`,
    tagline:
      'Lakes, heritage forts and the Deosai Plateau, the wild heart of the north.',
    highlights: [
      'Shangrila & the Kachura lakes',
      'Shigar & Khaplu heritage valleys',
      'Deosai Plateau & Sheosar Lake',
    ],
    itinerary: [
      {
        title: 'Day 1 — North to Chilas or Jaglot',
        body: 'A long day north via Naran and Babusar Top, past Lulusar Lake, following the Indus towards Chilas or Jaglot. Dinner and overnight on the way.',
      },
      {
        title: 'Day 2 — On to Skardu',
        body: 'Along the Indus to Skardu, passing the meeting point of three great ranges near Jaglot. In Skardu, the Shangrila resort at Lower Kachura Lake and the deep blue Upper Kachura. Overnight in Skardu.',
      },
      {
        title: 'Day 3 — Shigar and the cold desert',
        body: 'To the Shigar valley and its restored fort, then the Sarfaranga Cold Desert and the Katpana dunes, high-altitude sand under snow peaks. Overnight in Skardu.',
      },
      {
        title: 'Day 4 — The Deosai Plateau',
        body: 'A full day up onto Deosai, the second-highest plateau on earth, with Sadpara Lake, Bara Pani, the summer wildflowers and marmots, and Sheosar Lake at the far side. Overnight in Skardu.',
      },
      {
        title: 'Day 5 — Khaplu, then the road back',
        body: 'East to the Khaplu valley for the palace and the old Chaqchan mosque, before starting the drive back towards Naran or Chilas for the night.',
      },
      {
        title: 'Day 6 — The road home',
        body: 'The final leg back to your city with short stops along the way. End of tour.',
      },
    ],
    includes: SHARED_INCLUDES,
    excludes: SHARED_EXCLUDES,
    goodToKnow: SHARED_GOOD_TO_KNOW,
    prices: { solo: 32000, couple: 77000, deluxe: 115000 },
  },
  {
    slug: 'hunza-skardu',
    name: 'Hunza & Skardu',
    days: 8,
    nights: 7,
    region: 'Gilgit-Baltistan',
    image: `${MEDIA}northern-itinerary-passu-glacier.jpg`,
    tagline:
      'The grand tour, both great valleys and the best of the Karakoram in one journey.',
    highlights: [
      'Hunza, Khunjerab & the upper valleys',
      'Skardu, Deosai & the Baltistan forts',
      'Fly one way to save the long road days',
    ],
    itinerary: [
      {
        title: 'Day 1 — North to Chilas or Gilgit',
        body: 'The long scenic drive north via Naran and Babusar Top, past Lulusar Lake. Dinner and overnight at Chilas or Gilgit.',
      },
      {
        title: 'Day 2 — Into Hunza',
        body: 'On to Karimabad via the Rakaposhi View Point, the Baltit and Altit forts, and sunset from Duikar. Overnight in Hunza.',
      },
      {
        title: 'Day 3 — Upper Hunza',
        body: 'Attabad Lake with a boat ride, the Passu Cones, the Hussaini bridge and Borith Lake. Overnight in Hunza.',
      },
      {
        title: 'Day 4 — Khunjerab Pass',
        body: 'Up to the China border at Khunjerab, around 4,700 m, through Khunjerab National Park. Overnight in Hunza.',
      },
      {
        title: 'Day 5 — Hunza to Skardu',
        body: 'The drive south to Skardu via Gilgit and along the Indus, arriving for the Shangrila and Kachura lakes. Overnight in Skardu.',
      },
      {
        title: 'Day 6 — The Deosai Plateau',
        body: 'A full day on Deosai with Sadpara Lake, Bara Pani and Sheosar Lake. Overnight in Skardu.',
      },
      {
        title: 'Day 7 — Shigar and the cold desert, then back',
        body: 'The Shigar valley, its fort and the Katpana desert, before starting the drive back towards Chilas or Naran for the night.',
      },
      {
        title: 'Day 8 — The road home',
        body: 'The final leg back to your city. End of tour.',
      },
    ],
    includes: SHARED_INCLUDES,
    excludes: SHARED_EXCLUDES,
    goodToKnow: SHARED_GOOD_TO_KNOW,
    prices: { solo: 39500, couple: 92000, deluxe: 150000 },
  },
  {
    slug: 'neelum-kashmir',
    name: 'Neelum Valley',
    days: 4,
    nights: 3,
    region: 'Azad Kashmir',
    image: `${MEDIA}neelum-valley-sharda-river.jpg`,
    tagline:
      'A quieter green valley of rushing rivers, Arang Kel and hidden alpine lakes.',
    highlights: [
      'Keran & Sharda along the Neelum',
      'Arang Kel by chairlift and a short climb',
      'The jeep-and-hike day to Ratti Gali Lake',
    ],
    itinerary: [
      {
        title: 'Day 1 — Along the Neelum River',
        body: 'Drive via Muzaffarabad into the Neelum valley, following the river up to Keran with its green terraces facing the Line of Control. Dinner and overnight at Keran or Sharda.',
      },
      {
        title: 'Day 2 — Sharda and Arang Kel',
        body: 'On to Sharda and Kel, then up to Arang Kel, the green shelf reached by a short chairlift and a climb. An unhurried day among the meadows and wooden houses. Overnight at Sharda or Kel.',
      },
      {
        title: 'Day 3 — Ratti Gali Lake',
        body: 'A long jeep-and-hike day up to the alpine Ratti Gali Lake, ringed by summer wildflowers, or the quiet run up to Taobat near the head of the valley. Overnight in the valley.',
      },
      {
        title: 'Day 4 — The road home',
        body: 'A relaxed drive back down the Neelum with stops along the river. End of tour.',
      },
    ],
    includes: SHARED_INCLUDES,
    excludes: SHARED_EXCLUDES,
    goodToKnow: SHARED_GOOD_TO_KNOW,
    prices: { solo: 23000, couple: 56000, deluxe: 80000 },
  },
];

export function getTour(slug: string): Tour | undefined {
  return TOURS.find((t) => t.slug === slug);
}

/** PKR formatter for prices, e.g. 45000 -> "45,000". */
export function pkr(n: number): string {
  return n.toLocaleString('en-PK');
}
