/**
 * Reads the singleton site_settings row from Supabase via PostgREST.
 * Server-only (uses SUPABASE_ANON_KEY which is fine for read; admin writes
 * happen from the separate admin panel using the service role key).
 *
 * Cached with the 'site_settings' tag — the admin panel revalidates by
 * POSTing /api/revalidate after every save.
 */

import { SITE as FALLBACK_SITE } from '@/lib/utils';

export interface StatItem {
  value: string;
  label: string;
  icon?: string;
}

export interface ValueItem {
  icon: string;
  title: string;
  desc: string;
}

export interface SubjectOption {
  value: string;
  label: string;
}

export interface SiteSettings {
  // Brand
  site_name: string;
  site_description: string;
  site_url: string;

  // Contact
  phone: string;
  phone_display: string;
  phone_link: string;
  whatsapp_url: string;
  email: string;
  address_label: string;

  // Social
  instagram_url: string;
  twitter_url: string;
  facebook_url: string;

  // Hero
  hero_title_line_1: string;
  hero_title_line_2: string;
  hero_title_line_3: string;
  hero_kicker: string;
  hero_subtitle: string;
  hero_image_url: string;
  hero_cta_primary_text: string;
  hero_cta_primary_href: string;
  hero_cta_secondary_text: string;
  hero_cta_secondary_href: string;

  // Stats
  homepage_stats: StatItem[];
  about_stats: StatItem[];

  // About
  about_kicker: string;
  about_title: string;
  about_intro_subtitle: string;
  about_intro_html: string;
  about_image_url: string;
  about_years_badge_value: string;
  about_years_badge_label: string;
  about_values: ValueItem[];

  // Founder
  founder_name: string;
  founder_role: string;
  founder_bio: string;
  founder_image_url: string | null;
  founder_initials: string;

  // Contact page
  contact_kicker: string;
  contact_title: string;
  contact_subtitle: string;
  contact_response_time: string;
  contact_help_list: string[];
  contact_subjects: SubjectOption[];

  // Footer
  footer_tagline: string;
  footer_copyright_holder: string;
  footer_show_year: boolean;

  // SEO
  default_og_image_url: string;
  seo_keywords: string[];
}

// Fallback that mirrors the old hardcoded SITE constant. Used when the DB
// is unreachable so the website never goes blank.
const FALLBACK: SiteSettings = {
  site_name: FALLBACK_SITE.name,
  site_description: FALLBACK_SITE.description,
  site_url: FALLBACK_SITE.url,
  phone: FALLBACK_SITE.phone,
  phone_display: FALLBACK_SITE.phoneDisplay,
  phone_link: FALLBACK_SITE.phoneLink,
  whatsapp_url: FALLBACK_SITE.whatsapp,
  email: FALLBACK_SITE.email,
  address_label: 'Pakistan',
  instagram_url: FALLBACK_SITE.social.instagram,
  twitter_url: FALLBACK_SITE.social.twitter,
  facebook_url: FALLBACK_SITE.social.facebook,
  hero_kicker: 'Explore Pakistan',
  hero_title_line_1: 'Discover the',
  hero_title_line_2: 'Soul of',
  hero_title_line_3: 'Pakistan',
  hero_subtitle:
    "From the Karakoram peaks to ancient Mughal cities - your complete guide to Pakistan's most extraordinary destinations, food, and culture.",
  hero_image_url: 'https://picsum.photos/seed/pakistan-mountains-hero/1920/1080',
  hero_cta_primary_text: 'Explore Destinations',
  hero_cta_primary_href: '/destinations',
  hero_cta_secondary_text: 'Read the Blog',
  hero_cta_secondary_href: '/blog',
  homepage_stats: [
    { value: '50+', label: 'Destinations Covered', icon: 'MapPin' },
    { value: '100+', label: 'Travel Guides', icon: 'BookOpen' },
    { value: '10K+', label: 'Monthly Readers', icon: 'Users' },
    { value: '5★', label: 'Reader Rating', icon: 'Star' },
  ],
  about_stats: [
    { value: '50+', label: 'Destinations Covered' },
    { value: '100+', label: 'Articles Published' },
    { value: '10K+', label: 'Monthly Readers' },
    { value: '40+', label: 'Cities Visited' },
  ],
  about_kicker: 'Our Story',
  about_title: 'About mySRZ',
  about_intro_subtitle: "A passion project turned into Pakistan's trusted travel resource.",
  about_intro_html: '',
  about_image_url: 'https://picsum.photos/seed/pakistan-about/1200/1000',
  about_years_badge_value: '5+',
  about_years_badge_label: 'Years Exploring Pakistan',
  about_values: [],
  founder_name: FALLBACK_SITE.founder,
  founder_role: 'Founder & Lead Writer',
  founder_bio: '',
  founder_image_url: null,
  founder_initials: 'AF',
  contact_kicker: "We'd Love to Hear From You",
  contact_title: 'Get in Touch',
  contact_subtitle: 'Planning a trip, have a question, or want to collaborate? Reach out, we typically respond within 24 hours.',
  contact_response_time: 'Within 24 hours',
  contact_help_list: [],
  contact_subjects: [],
  footer_tagline: "Your ultimate guide to exploring Pakistan's breathtaking landscapes, rich culture, and incredible cuisine. Discover hidden gems from Karakoram to the Arabian Sea.",
  footer_copyright_holder: 'mySRZ',
  footer_show_year: true,
  default_og_image_url: '/og-image.jpg',
  seo_keywords: [],
};

function coalesce<T>(raw: T | null | undefined, fallback: T): T {
  if (raw === null || raw === undefined) return fallback;
  if (typeof raw === 'string' && raw.trim() === '') return fallback;
  return raw;
}

function asArray<T>(raw: unknown, fallback: T[]): T[] {
  return Array.isArray(raw) ? (raw as T[]) : fallback;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn('[site-settings] SUPABASE_URL or SUPABASE_ANON_KEY not set, using fallback');
    return FALLBACK;
  }

  try {
    const res = await fetch(`${url}/rest/v1/site_settings?id=eq.1&select=*`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      next: { revalidate: 3600, tags: ['site_settings'] },
    });
    if (!res.ok) {
      console.error('[site-settings] PostgREST returned', res.status);
      return FALLBACK;
    }
    const rows = (await res.json()) as Partial<SiteSettings>[];
    const row = rows?.[0];
    if (!row) return FALLBACK;

    // Per-field coalesce so a NULL/empty in the DB falls back to a sane default.
    return {
      site_name: coalesce(row.site_name, FALLBACK.site_name),
      site_description: coalesce(row.site_description, FALLBACK.site_description),
      site_url: coalesce(row.site_url, FALLBACK.site_url),
      phone: coalesce(row.phone, FALLBACK.phone),
      phone_display: coalesce(row.phone_display, FALLBACK.phone_display),
      phone_link: coalesce(row.phone_link, FALLBACK.phone_link),
      whatsapp_url: coalesce(row.whatsapp_url, FALLBACK.whatsapp_url),
      email: coalesce(row.email, FALLBACK.email),
      address_label: coalesce(row.address_label, FALLBACK.address_label),
      instagram_url: coalesce(row.instagram_url, FALLBACK.instagram_url),
      twitter_url: coalesce(row.twitter_url, FALLBACK.twitter_url),
      facebook_url: coalesce(row.facebook_url, FALLBACK.facebook_url),
      hero_kicker: coalesce(row.hero_kicker, FALLBACK.hero_kicker),
      hero_title_line_1: coalesce(row.hero_title_line_1, FALLBACK.hero_title_line_1),
      hero_title_line_2: coalesce(row.hero_title_line_2, FALLBACK.hero_title_line_2),
      hero_title_line_3: coalesce(row.hero_title_line_3, FALLBACK.hero_title_line_3),
      hero_subtitle: coalesce(row.hero_subtitle, FALLBACK.hero_subtitle),
      hero_image_url: coalesce(row.hero_image_url, FALLBACK.hero_image_url),
      hero_cta_primary_text: coalesce(row.hero_cta_primary_text, FALLBACK.hero_cta_primary_text),
      hero_cta_primary_href: coalesce(row.hero_cta_primary_href, FALLBACK.hero_cta_primary_href),
      hero_cta_secondary_text: coalesce(row.hero_cta_secondary_text, FALLBACK.hero_cta_secondary_text),
      hero_cta_secondary_href: coalesce(row.hero_cta_secondary_href, FALLBACK.hero_cta_secondary_href),
      homepage_stats: asArray(row.homepage_stats, FALLBACK.homepage_stats),
      about_stats: asArray(row.about_stats, FALLBACK.about_stats),
      about_kicker: coalesce(row.about_kicker, FALLBACK.about_kicker),
      about_title: coalesce(row.about_title, FALLBACK.about_title),
      about_intro_subtitle: coalesce(row.about_intro_subtitle, FALLBACK.about_intro_subtitle),
      about_intro_html: coalesce(row.about_intro_html, FALLBACK.about_intro_html),
      about_image_url: coalesce(row.about_image_url, FALLBACK.about_image_url),
      about_years_badge_value: coalesce(row.about_years_badge_value, FALLBACK.about_years_badge_value),
      about_years_badge_label: coalesce(row.about_years_badge_label, FALLBACK.about_years_badge_label),
      about_values: asArray(row.about_values, FALLBACK.about_values),
      founder_name: coalesce(row.founder_name, FALLBACK.founder_name),
      founder_role: coalesce(row.founder_role, FALLBACK.founder_role),
      founder_bio: coalesce(row.founder_bio, FALLBACK.founder_bio),
      founder_image_url: row.founder_image_url ?? null,
      founder_initials: coalesce(row.founder_initials, FALLBACK.founder_initials),
      contact_kicker: coalesce(row.contact_kicker, FALLBACK.contact_kicker),
      contact_title: coalesce(row.contact_title, FALLBACK.contact_title),
      contact_subtitle: coalesce(row.contact_subtitle, FALLBACK.contact_subtitle),
      contact_response_time: coalesce(row.contact_response_time, FALLBACK.contact_response_time),
      contact_help_list: asArray(row.contact_help_list, FALLBACK.contact_help_list),
      contact_subjects: asArray(row.contact_subjects, FALLBACK.contact_subjects),
      footer_tagline: coalesce(row.footer_tagline, FALLBACK.footer_tagline),
      footer_copyright_holder: coalesce(row.footer_copyright_holder, FALLBACK.footer_copyright_holder),
      footer_show_year: row.footer_show_year ?? true,
      default_og_image_url: coalesce(row.default_og_image_url, FALLBACK.default_og_image_url),
      seo_keywords: asArray(row.seo_keywords, FALLBACK.seo_keywords),
    };
  } catch (err) {
    console.error('[site-settings] fetch failed:', err);
    return FALLBACK;
  }
}
