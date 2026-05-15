import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Award, Users, Phone, Mail } from 'lucide-react';
import { SITE } from '@/lib/utils';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'About mySRZ — Pakistan Travel Experts',
  description:
    "Learn about mySRZ Travel & Tourism — Pakistan's trusted travel guide founded by Ahmad Fraz. Our mission, team, and travel philosophy.",
  alternates: { canonical: '/about' },
};

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${SITE.url}/about#ahmad-fraz`,
  name: SITE.founder,
  url: `${SITE.url}/about`,
  jobTitle: 'Travel writer and founder',
  worksFor: {
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.url,
  },
  sameAs: [
    SITE.social.instagram,
    SITE.social.twitter,
    SITE.social.facebook,
  ],
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

const VALUES = [
  { icon: Heart, title: 'Authentic Coverage', desc: "We write from real experience. Every destination we cover, we've personally visited and vetted." },
  { icon: Award, title: 'Responsible Travel', desc: "We promote sustainable tourism that benefits local communities and preserves Pakistan's natural heritage." },
  { icon: Users, title: 'Community First', desc: 'We connect travelers with local guides, guesthouses, and businesses - keeping tourism money in local hands.' },
];

const STATS = [
  { value: '50+', label: 'Destinations Covered' },
  { value: '100+', label: 'Articles Published' },
  { value: '10K+', label: 'Monthly Readers' },
  { value: '40+', label: 'Cities Visited' },
];

export default function AboutPage() {
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
      <div className="bg-brand-primary text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <span className="text-xs uppercase tracking-[0.3em] text-brand-accent font-bold">Our Story</span>
          <h1 className="text-5xl font-bold mt-3 mb-4">About mySRZ</h1>
          <p className="text-white/60 max-w-2xl text-lg">
            A passion project turned into Pakistan&apos;s trusted travel resource.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold text-brand-primary mb-6">Why We Started</h2>
            <div className="space-y-4 text-brand-primary/70 leading-relaxed">
              <p>Pakistan is one of the most stunning, culturally rich, and historically layered countries on Earth - yet it remains deeply underrepresented in mainstream travel media. We started mySRZ to change that.</p>
              <p>Our team has trekked to K2 base camp, eaten street food in every major city, slept under the stars in Deosai, and explored ruins that predate Rome. We share everything we&apos;ve learned to help you travel Pakistan with confidence.</p>
              <p>Whether you&apos;re a Pakistani looking to explore your own incredible country, or an international visitor planning your first trip - we&apos;re here to be your trusted guide.</p>
            </div>
            <div className="mt-8 flex gap-4">
              <Link href="/contact" className="bg-brand-accent text-brand-primary px-6 py-3 rounded-xl font-bold text-sm hover:bg-brand-accent/90 transition-all">
                Get in Touch
              </Link>
              <Link href="/blog" className="border border-stone-300 text-brand-primary/80 px-6 py-3 rounded-xl font-bold text-sm hover:border-brand-accent transition-all">
                Read Our Blog
              </Link>
            </div>
          </div>
          <div className="relative">
            <Image
              src="https://picsum.photos/seed/pakistan-about/1200/1000"
              alt="Pakistan travel"
              width={600}
              height={500}
              className="w-full rounded-2xl shadow-xl object-cover"
            />
            <div className="absolute -bottom-6 -left-6 bg-brand-accent text-brand-primary p-5 rounded-2xl shadow-lg">
              <div className="text-3xl font-bold">5+</div>
              <div className="text-xs uppercase tracking-wider text-brand-primary/70">Years Exploring Pakistan</div>
            </div>
          </div>
        </div>

        <div className="bg-brand-paper rounded-3xl p-10 mb-16">
          <h2 className="text-3xl font-bold text-brand-primary mb-10 text-center">What We Stand For</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="w-14 h-14 bg-brand-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon size={24} className="text-brand-primary" />
                </div>
                <h3 className="font-bold text-brand-primary text-lg mb-2">{title}</h3>
                <p className="text-brand-primary/50 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-brand-primary mb-10 text-center">The Team</h2>
          <div className="flex justify-center">
            <div className="text-center max-w-sm">
              <div className="w-32 h-32 bg-gradient-to-br from-brand-accent to-amber-600 rounded-full mx-auto mb-5 flex items-center justify-center text-brand-primary text-4xl font-bold shadow-lg">
                AF
              </div>
              <h3 className="text-xl font-bold text-brand-primary">{SITE.founder}</h3>
              <p className="text-brand-primary font-semibold text-sm mb-3">Founder & Lead Writer</p>
              <p className="text-brand-primary/50 text-sm leading-relaxed mb-4">
                Travel writer and photographer who has explored over 40 destinations across Pakistan. Passionate about showing the world what this extraordinary country has to offer.
              </p>
              <div className="flex justify-center gap-3">
                <a href={SITE.phoneLink} className="flex items-center gap-2 text-sm text-brand-primary/70 hover:text-brand-primary transition-colors">
                  <Phone size={14} /> {SITE.phoneDisplay}
                </a>
                <a href={`mailto:${SITE.email}`} className="flex items-center gap-2 text-sm text-brand-primary/70 hover:text-brand-primary transition-colors">
                  <Mail size={14} /> Email
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center bg-brand-paper border border-black/5 rounded-2xl p-6 shadow-sm">
              <div className="text-4xl font-bold text-brand-primary mb-1">{value}</div>
              <div className="text-xs uppercase tracking-wider text-brand-primary/50 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
