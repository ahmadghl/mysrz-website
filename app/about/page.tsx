import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart, Award, Users, Phone, Mail,
  Globe, Star, MapPin, BookOpen, Camera, Compass,
  type LucideIcon,
} from 'lucide-react';
import { getSiteSettings } from '@/lib/site-settings';

export const metadata: Metadata = {
  title: 'About mySRZ - Pakistan Travel Experts',
  description:
    "Learn about mySRZ Travel & Tourism - Pakistan's trusted travel guide founded by Ahmad Fraz. Our mission, team, and travel philosophy.",
  alternates: { canonical: '/about' },
};

const VALUE_ICONS: Record<string, LucideIcon> = {
  Heart, Award, Users, Globe, Star, MapPin, BookOpen, Camera, Compass,
};

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <div className="bg-brand-primary text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <span className="text-xs uppercase tracking-[0.3em] text-brand-accent font-bold">{settings.about_kicker}</span>
          <h1 className="text-5xl font-bold mt-3 mb-4">{settings.about_title}</h1>
          <p className="text-white/60 max-w-2xl text-lg">
            {settings.about_intro_subtitle}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <div
              className="prose prose-stone max-w-none text-brand-primary/70 leading-relaxed prose-p:my-3 prose-h2:text-3xl prose-h2:font-bold prose-h2:text-brand-primary prose-h2:mb-6 prose-h2:mt-0 prose-strong:text-brand-primary"
              dangerouslySetInnerHTML={{ __html: settings.about_intro_html }}
            />
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
              src={settings.about_image_url}
              alt="Pakistan travel"
              width={600}
              height={500}
              className="w-full rounded-2xl shadow-xl object-cover"
            />
            <div className="absolute -bottom-6 -left-6 bg-brand-accent text-brand-primary p-5 rounded-2xl shadow-lg">
              <div className="text-3xl font-bold">{settings.about_years_badge_value}</div>
              <div className="text-xs uppercase tracking-wider text-brand-primary/70">{settings.about_years_badge_label}</div>
            </div>
          </div>
        </div>

        {settings.about_values.length > 0 && (
          <div className="bg-brand-paper rounded-3xl p-10 mb-16">
            <h2 className="text-3xl font-bold text-brand-primary mb-10 text-center">What We Stand For</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {settings.about_values.map(({ icon, title, desc }) => {
                const Icon = (icon && VALUE_ICONS[icon]) || Heart;
                return (
                  <div key={title} className="text-center">
                    <div className="w-14 h-14 bg-brand-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon size={24} className="text-brand-primary" />
                    </div>
                    <h3 className="font-bold text-brand-primary text-lg mb-2">{title}</h3>
                    <p className="text-brand-primary/50 text-sm leading-relaxed">{desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-brand-primary mb-10 text-center">The Team</h2>
          <div className="flex justify-center">
            <div className="text-center max-w-sm">
              {settings.founder_image_url ? (
                <Image
                  src={settings.founder_image_url}
                  alt={settings.founder_name}
                  width={128}
                  height={128}
                  className="w-32 h-32 rounded-full object-cover mx-auto mb-5 shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 bg-gradient-to-br from-brand-accent to-amber-600 rounded-full mx-auto mb-5 flex items-center justify-center text-brand-primary text-4xl font-bold shadow-lg">
                  {settings.founder_initials}
                </div>
              )}
              <h3 className="text-xl font-bold text-brand-primary">{settings.founder_name}</h3>
              <p className="text-brand-primary font-semibold text-sm mb-3">{settings.founder_role}</p>
              <p className="text-brand-primary/50 text-sm leading-relaxed mb-4">
                {settings.founder_bio}
              </p>
              <div className="flex justify-center gap-3">
                <a href={settings.phone_link} className="flex items-center gap-2 text-sm text-brand-primary/70 hover:text-brand-primary transition-colors">
                  <Phone size={14} /> {settings.phone_display}
                </a>
                <a href={`mailto:${settings.email}`} className="flex items-center gap-2 text-sm text-brand-primary/70 hover:text-brand-primary transition-colors">
                  <Mail size={14} /> Email
                </a>
              </div>
            </div>
          </div>
        </div>

        {settings.about_stats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {settings.about_stats.map(({ value, label }) => (
              <div key={label} className="text-center bg-brand-paper border border-black/5 rounded-2xl p-6 shadow-sm">
                <div className="text-4xl font-bold text-brand-primary mb-1">{value}</div>
                <div className="text-xs uppercase tracking-wider text-brand-primary/50 font-medium">{label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
