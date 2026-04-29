import type { Metadata } from 'next';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
import { ContactForm } from '@/components/ContactForm';
import { SITE } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Contact mySRZ - Book a Pakistan Tour',
  description:
    'Get in touch with mySRZ Travel & Tourism to plan your Pakistan trip. Call +92-301-2432222 or send us a message. We reply within 24 hours.',
  alternates: { canonical: '/contact' },
  keywords: [
    'contact mySRZ',
    'book Pakistan tour',
    'Pakistan tour inquiry',
    'Ahmad Fraz contact',
  ],
};

const HELP_LIST = [
  'Trip planning & itineraries',
  'Destination recommendations',
  'Best time to visit',
  'Budget travel tips',
  'Photography spots',
  'Local guide connections',
  'Blog collaborations',
];

export default function ContactPage() {
  return (
    <>
      <div className="bg-brand-primary text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <span className="text-xs uppercase tracking-[0.3em] text-brand-accent font-bold">We&apos;d Love to Hear From You</span>
          <h1 className="text-5xl font-bold mt-3 mb-4">Get in Touch</h1>
          <p className="text-white/60 max-w-xl text-lg">
            Planning a trip, have a question, or want to collaborate? Reach out - we typically respond within 24 hours.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <ContactForm />
          </div>

          <div className="space-y-6">
            <div className="bg-brand-primary text-white rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-5">Direct Contact</h3>
              <div className="space-y-4">
                <a href={SITE.phoneLink} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 bg-brand-accent text-brand-primary rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-brand-accent/90 transition-all">
                    <Phone size={16} />
                  </div>
                  <div>
                    <div className="text-xs text-white/50 uppercase tracking-wider">Phone / WhatsApp</div>
                    <div className="font-semibold group-hover:text-brand-accent transition-colors">{SITE.phoneDisplay}</div>
                  </div>
                </a>
                <a href={`mailto:${SITE.email}`} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 bg-brand-accent text-brand-primary rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-brand-accent/90 transition-all">
                    <Mail size={16} />
                  </div>
                  <div>
                    <div className="text-xs text-white/50 uppercase tracking-wider">Email</div>
                    <div className="font-semibold group-hover:text-brand-accent transition-colors break-all">{SITE.email}</div>
                  </div>
                </a>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand-accent text-brand-primary rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <div className="text-xs text-white/50 uppercase tracking-wider">Based In</div>
                    <div className="font-semibold">Pakistan</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand-accent text-brand-primary rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock size={16} />
                  </div>
                  <div>
                    <div className="text-xs text-white/50 uppercase tracking-wider">Response Time</div>
                    <div className="font-semibold">Within 24 hours</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-brand-paper border border-brand-accent/20 rounded-2xl p-6">
              <h3 className="font-bold text-brand-primary mb-3 flex items-center gap-2">
                <MessageCircle size={16} className="text-brand-primary" /> WhatsApp Us
              </h3>
              <p className="text-brand-primary/70 text-sm mb-4">For quick queries, message us directly on WhatsApp.</p>
              <a
                href={SITE.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-xl font-bold text-sm hover:bg-green-700 transition-all w-full"
              >
                <MessageCircle size={16} /> Open WhatsApp Chat
              </a>
            </div>

            <div className="bg-brand-paper border border-black/5 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-brand-primary mb-3">We can help with</h3>
              <ul className="space-y-2 text-sm text-brand-primary/70">
                {HELP_LIST.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-brand-accent rounded-full flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
