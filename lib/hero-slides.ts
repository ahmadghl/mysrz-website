/**
 * Homepage hero slideshow — one slide per major city/region.
 *
 * Every URL below is a Wikimedia Commons pre-rendered 1920px
 * thumbnail, verified live (HTTP 200) and visually confirmed to
 * show the right landmark before shipping. All are freely
 * licensed (CC BY / CC BY-SA / public domain per Commons policy).
 *
 * TO SWAP A SLIDE: replace `src` with any image URL whose host is
 * allowed in next.config.mjs `images.remotePatterns` (Supabase
 * storage, Unsplash, Wikimedia, etc). Keep images landscape and
 * ≥1600px wide — the hero renders full-viewport.
 *
 * Slide order follows the brand's city list: Islamabad → Karachi
 * → Lahore → Quetta → Peshawar → Muzaffarabad → Hunza → Skardu.
 * The FIRST slide is the LCP image on the homepage, so lead with
 * the strongest photo.
 */
export interface HeroSlide {
  src: string;
  /** Short caption shown bottom-right of the hero, fades with the slide. */
  label: string;
  /** Photographer attribution. Required by the CC BY-SA / FAL licenses
   *  of the Wikimedia images; rendered as a small line under the
   *  caption. Keep when swapping in other Commons photos; drop only
   *  for images you own. */
  credit: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    src: 'https://sptdzsvuswdpykvgblfm.supabase.co/storage/v1/object/public/media/content/slide-islamabad-faisal-mosque.jpg',
    label: 'Faisal Mosque · Islamabad',
    credit: 'Ali Mujtaba, CC BY-SA 4.0',
  },
  {
    src: 'https://sptdzsvuswdpykvgblfm.supabase.co/storage/v1/object/public/media/content/slide-karachi-mazar-e-quaid.jpg',
    label: 'Mazar-e-Quaid · Karachi',
    credit: 'A.Savin, FAL',
  },
  {
    src: 'https://sptdzsvuswdpykvgblfm.supabase.co/storage/v1/object/public/media/content/slide-lahore-badshahi-mosque.jpg',
    label: 'Badshahi Mosque · Lahore',
    credit: 'Romero Maia, CC BY-SA 4.0',
  },
  {
    src: 'https://sptdzsvuswdpykvgblfm.supabase.co/storage/v1/object/public/media/content/slide-quetta-hanna-lake.jpg',
    label: 'Hanna Lake · Quetta',
    credit: 'Aysafaran, CC BY-SA 4.0',
  },
  {
    src: 'https://sptdzsvuswdpykvgblfm.supabase.co/storage/v1/object/public/media/content/slide-peshawar-islamia-college.jpg',
    label: 'Islamia College · Peshawar',
    credit: 'Zafarmaini, CC BY-SA 4.0',
  },
  {
    src: 'https://sptdzsvuswdpykvgblfm.supabase.co/storage/v1/object/public/media/content/slide-muzaffarabad-neelum.jpg',
    label: 'Neelum Valley · Muzaffarabad',
    credit: 'Obaid747, CC BY-SA 3.0',
  },
  {
    src: 'https://sptdzsvuswdpykvgblfm.supabase.co/storage/v1/object/public/media/content/slide-hunza-attabad-lake.jpg',
    label: 'Attabad Lake · Hunza',
    credit: 'Peracha1, CC BY-SA 4.0',
  },
  {
    src: 'https://sptdzsvuswdpykvgblfm.supabase.co/storage/v1/object/public/media/content/slide-skardu-shangrila.jpg',
    label: 'Shangrila Lake · Skardu',
    credit: 'S Sher Xaman, CC BY-SA 4.0',
  },
];
