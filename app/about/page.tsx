import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  Award,
  BookOpen,
  Camera,
  Compass,
  Globe,
  Heart,
  Mail,
  MapPin,
  Phone,
  Star,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { getSiteSettings } from '@/lib/site-settings';
import { SITE } from '@/lib/utils';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { RevealOnScroll } from '@/components/aureate/RevealOnScroll';
import { PaperStack } from '@/components/aureate/PaperStack';
import { AureateButton } from '@/components/aureate/AureateButton';

export const metadata: Metadata = {
  title: 'About mySRZ — Pakistan Travel Experts',
  description:
    "Learn about mySRZ Travel & Tourism — Pakistan's trusted travel guide founded by Ahmad Faraz. Our mission, team, and travel philosophy.",
  alternates: { canonical: '/about' },
};

const VALUE_ICONS: Record<string, LucideIcon> = {
  Heart, Award, Users, Globe, Star, MapPin, BookOpen, Camera, Compass,
};

export default async function AboutPage() {
  const settings = await getSiteSettings();

  const founderName = settings.founder_name || SITE.founder;
  const siteUrl = settings.site_url || SITE.url;
  const siteName = settings.site_name || SITE.name;

  const sameAs = [
    settings.instagram_url || SITE.social.instagram,
    settings.twitter_url || SITE.social.twitter,
    settings.facebook_url || SITE.social.facebook,
  ].filter(Boolean);

  // Canonical Person JSON-LD referenced from every BlogPosting on
  // /blog/[slug] via @id. Lets Google build a single connected
  // author entity across the whole site.
  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${siteUrl}/about#ahmad-fraz`,
    name: founderName,
    url: `${siteUrl}/about`,
    jobTitle: settings.founder_role || 'Travel writer and founder',
    worksFor: {
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
    },
    sameAs,
    knowsAbout: [
      'Pakistan travel',
      'Hunza Valley',
      'Skardu',
      'Karakoram',
      'Pakistani cuisine',
      'cultural tourism',
    ],
    nationality: { '@type': 'Country', name: 'Pakistan' },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'About' },
        ]}
        hideVisual
      />

      {/* ───── HERO ───── */}
      <section className="relative flex h-[70vh] items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={settings.about_image_url}
            alt=""
            fill
            priority
            sizes="100vw"
            aria-hidden="true"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-aureate-background/20 to-aureate-background" />
        </div>
        <RevealOnScroll className="relative z-10 mx-auto w-full max-w-aureate-container px-aureate-mobile md:px-aureate-desktop">
          <div className="max-w-2xl">
            <span className="mb-4 block font-aureate-label text-aureate-label-md uppercase tracking-[0.3em] text-aureate-primary">
              {settings.about_kicker}
            </span>
            <h1 className="mb-8 font-aureate-display text-aureate-display-lg-mobile italic leading-tight text-aureate-on-surface md:text-aureate-display-lg">
              {settings.about_title}
            </h1>
            <div className="mb-8 h-px w-24 bg-aureate-primary-container" />
            <p className="font-aureate-body text-aureate-body-lg text-aureate-on-surface-variant">
              {settings.about_intro_subtitle}
            </p>
          </div>
        </RevealOnScroll>
      </section>

      {/* ───── MISSION / PHILOSOPHY ───── */}
      <section className="mx-auto max-w-aureate-container px-aureate-mobile py-24 md:px-aureate-desktop">
        <RevealOnScroll>
          <div className="grid grid-cols-1 items-center gap-aureate-gutter md:grid-cols-12">
            <div className="mb-12 md:col-span-5 md:mb-0">
              <PaperStack className="group overflow-hidden">
                <Image
                  src={settings.about_image_url}
                  alt={`${siteName} — about`}
                  width={600}
                  height={750}
                  sizes="(max-width: 768px) 100vw, 42vw"
                  className="aspect-[4/5] w-full border border-aureate-outline-variant object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </PaperStack>
            </div>
            <div className="md:col-span-6 md:col-start-7">
              <h2 className="mb-6 font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary">
                Our Mission
              </h2>
              <div
                className="prose prose-stone max-w-none prose-headings:font-aureate-headline prose-headings:text-aureate-on-surface prose-h2:text-aureate-headline-md prose-p:font-aureate-body prose-p:text-aureate-body-lg prose-p:leading-relaxed prose-p:text-aureate-on-surface-variant prose-a:text-aureate-primary prose-strong:text-aureate-on-surface"
                dangerouslySetInnerHTML={{ __html: settings.about_intro_html }}
              />
              <div className="mt-8 flex flex-wrap gap-4">
                <AureateButton href="/contact" variant="primary">
                  Get in Touch
                </AureateButton>
                <AureateButton href="/blog" variant="outline-on-light">
                  Read the Journal
                </AureateButton>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* ───── PILLARS / VALUES ───── */}
      {settings.about_values.length > 0 && (
        <section className="overflow-hidden bg-aureate-surface-container-low py-24 md:py-32">
          <div className="mx-auto max-w-aureate-container px-aureate-mobile md:px-aureate-desktop">
            <RevealOnScroll className="mb-16 text-center">
              <h2 className="mb-4 font-aureate-headline text-aureate-headline-lg-mobile text-aureate-on-surface md:text-aureate-headline-lg">
                What we stand for
              </h2>
              <p className="mx-auto max-w-xl font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary">
                Principles that shape every guide we write
              </p>
            </RevealOnScroll>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {settings.about_values.map(({ icon, title, desc }, i) => {
                const Icon = (icon && VALUE_ICONS[icon]) || Heart;
                return (
                  <RevealOnScroll key={title} delay={i * 100}>
                    <div
                      className={`group flex h-full flex-col justify-between border border-aureate-outline-variant bg-aureate-surface p-10 transition-all duration-500 hover:-translate-y-1 hover:border-aureate-primary hover:shadow-xl md:p-12 ${
                        i === 1 ? 'md:translate-y-12' : ''
                      }`}
                    >
                      <div>
                        <span className="mb-6 block font-aureate-display text-5xl text-aureate-primary-container/30 transition-colors duration-300 group-hover:text-aureate-primary-container/60">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <Icon
                          size={32}
                          className="mb-6 text-aureate-primary"
                          aria-hidden="true"
                        />
                        <h3 className="mb-4 font-aureate-headline text-aureate-headline-md text-aureate-on-surface">
                          {title}
                        </h3>
                        <p className="font-aureate-body text-aureate-body-md leading-relaxed text-aureate-on-surface-variant">
                          {desc}
                        </p>
                      </div>
                    </div>
                  </RevealOnScroll>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ───── FOUNDER ───── */}
      <section className="mx-auto max-w-aureate-container px-aureate-mobile py-24 md:px-aureate-desktop md:py-32">
        <RevealOnScroll className="mb-12">
          <div className="flex items-end justify-between">
            <h2 className="font-aureate-headline text-aureate-headline-lg-mobile text-aureate-on-surface md:text-aureate-headline-lg">
              The Team
            </h2>
            <div className="hidden h-px flex-grow bg-aureate-outline-variant md:ml-12 md:block" />
          </div>
        </RevealOnScroll>
        <RevealOnScroll>
          <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-12">
            <div className="md:col-span-5">
              {settings.founder_image_url ? (
                <PaperStack className="group overflow-hidden">
                  <Image
                    src={settings.founder_image_url}
                    alt={founderName}
                    width={500}
                    height={625}
                    sizes="(max-width: 768px) 100vw, 42vw"
                    className="aspect-[4/5] w-full border border-aureate-outline-variant object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </PaperStack>
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center border border-aureate-outline-variant bg-aureate-primary text-6xl font-bold text-aureate-on-primary">
                  {settings.founder_initials}
                </div>
              )}
            </div>
            <div className="space-y-6 md:col-span-7">
              <span className="block font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary">
                Founder &amp; Curator
              </span>
              <h3 className="font-aureate-headline text-aureate-headline-lg-mobile text-aureate-on-surface md:text-aureate-headline-lg">
                {founderName}
              </h3>
              <p className="font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-on-surface-variant">
                {settings.founder_role}
              </p>
              <p className="font-aureate-body text-aureate-body-lg leading-relaxed text-aureate-on-surface-variant">
                {settings.founder_bio}
              </p>
              <div className="flex flex-wrap gap-6 pt-4">
                <a
                  href={settings.phone_link}
                  className="inline-flex items-center gap-2 font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-on-surface underline decoration-aureate-outline-variant decoration-1 underline-offset-4 transition-all hover:decoration-aureate-primary"
                >
                  <Phone size={12} aria-hidden="true" /> {settings.phone_display}
                </a>
                <a
                  href={`mailto:${settings.email}`}
                  className="inline-flex items-center gap-2 font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-on-surface underline decoration-aureate-outline-variant decoration-1 underline-offset-4 transition-all hover:decoration-aureate-primary"
                >
                  <Mail size={12} aria-hidden="true" /> Email
                </a>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* ───── STATS ───── */}
      {settings.about_stats.length > 0 && (
        <section className="border-y border-aureate-outline-variant bg-aureate-surface">
          <RevealOnScroll className="mx-auto max-w-aureate-container px-aureate-mobile py-16 md:px-aureate-desktop md:py-20">
            <div className="grid grid-cols-2 gap-aureate-gutter text-center md:grid-cols-4">
              {settings.about_stats.map(({ value, label }, i) => {
                const isLast = i === settings.about_stats.length - 1;
                return (
                  <div
                    key={label}
                    className={`p-6 transition-colors duration-500 hover:bg-aureate-surface-container-low md:border-r md:border-aureate-outline-variant ${
                      isLast ? 'md:border-r-0' : ''
                    }`}
                  >
                    <p className="mb-2 font-aureate-display text-aureate-headline-lg text-aureate-primary">
                      {value}
                    </p>
                    <p className="font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-on-surface-variant">
                      {label}
                    </p>
                  </div>
                );
              })}
            </div>
          </RevealOnScroll>
        </section>
      )}

      {/* ───── BOTTOM CTA ───── */}
      <section className="border-t border-aureate-outline-variant py-24">
        <RevealOnScroll className="mx-auto max-w-2xl px-aureate-mobile text-center md:px-aureate-desktop">
          <h2 className="mb-4 font-aureate-headline text-aureate-headline-lg-mobile text-aureate-on-surface md:text-aureate-headline-lg">
            Begin your Pakistan story
          </h2>
          <p className="mb-8 font-aureate-body text-aureate-body-lg italic leading-relaxed text-aureate-on-surface-variant">
            Some places stay open long after the last visitor leaves. This one was built to wait, and it still is.
          </p>
          <div className="flex flex-col justify-center gap-4 md:flex-row md:gap-6">
            <AureateButton href="/destinations" variant="primary">
              View Destinations
            </AureateButton>
            <AureateButton href="/blog" variant="outline-on-light">
              The Journal
            </AureateButton>
          </div>
        </RevealOnScroll>
      </section>
    </>
  );
}
