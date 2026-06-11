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

const WM = 'https://upload.wikimedia.org/wikipedia/commons/thumb';

export const HERO_SLIDES: HeroSlide[] = [
  {
    src: `${WM}/e/e0/Ali_Mujtaba_WLM2017_FAISAL_MOSQUE_019.jpg/1920px-Ali_Mujtaba_WLM2017_FAISAL_MOSQUE_019.jpg`,
    label: 'Faisal Mosque · Islamabad',
    credit: 'Ali Mujtaba, CC BY-SA 4.0',
  },
  {
    src: `${WM}/4/47/PK_Karachi_asv2020-02_img52_Mazar-e-Quaid.jpg/1920px-PK_Karachi_asv2020-02_img52_Mazar-e-Quaid.jpg`,
    label: 'Mazar-e-Quaid · Karachi',
    credit: 'A.Savin, FAL',
  },
  {
    src: `${WM}/c/c8/Badshahi_Mosque_front_picture.jpg/1920px-Badshahi_Mosque_front_picture.jpg`,
    label: 'Badshahi Mosque · Lahore',
    credit: 'Romero Maia, CC BY-SA 4.0',
  },
  {
    src: `${WM}/f/f2/Hanna_Lake_Quetta.jpg/1920px-Hanna_Lake_Quetta.jpg`,
    label: 'Hanna Lake · Quetta',
    credit: 'Aysafaran, CC BY-SA 4.0',
  },
  {
    src: `${WM}/a/ab/Islamia_College_Peshawar_%28Public_Sector_University%29%2C_Khyber_Pakhtunkhwa%2C_Pakistan_cropped.jpg/1920px-Islamia_College_Peshawar_%28Public_Sector_University%29%2C_Khyber_Pakhtunkhwa%2C_Pakistan_cropped.jpg`,
    label: 'Islamia College · Peshawar',
    credit: 'Zafarmaini, CC BY-SA 4.0',
  },
  {
    src: `${WM}/c/c2/Pakistan_is_full_of_breathtaking_views_-_Muzafarabad.JPG/1920px-Pakistan_is_full_of_breathtaking_views_-_Muzafarabad.JPG`,
    label: 'Neelum Valley · Muzaffarabad',
    credit: 'Obaid747, CC BY-SA 3.0',
  },
  {
    src: `${WM}/5/52/Attabad.jpg/1920px-Attabad.jpg`,
    label: 'Attabad Lake · Hunza',
    credit: 'Peracha1, CC BY-SA 4.0',
  },
  {
    src: `${WM}/9/9f/Shangrila_resort_skardu.jpg/1920px-Shangrila_resort_skardu.jpg`,
    label: 'Shangrila Lake · Skardu',
    credit: 'S Sher Xaman, CC BY-SA 4.0',
  },
];
