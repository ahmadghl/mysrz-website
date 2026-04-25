export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const SITE = {
  name: 'mySRZ Travel & Tourism',
  url: 'https://www.mysrztourism.com',
  description:
    "Pakistan's trusted travel guide — expert articles, destination guides, and trip planning by Ahmad Fraz.",
  phone: '+92-301-2432222',
  phoneDisplay: '+92 301 2432222',
  phoneLink: 'tel:+923012432222',
  whatsapp: 'https://wa.me/923012432222',
  email: 'ahmadfraz009@gmail.com',
  founder: 'Ahmad Fraz',
  social: {
    instagram: 'https://instagram.com/mysrz',
    twitter: 'https://twitter.com/mysrz',
    facebook: 'https://facebook.com/mysrz',
  },
  contactWebhook: 'https://n8n.mysrztourism.com/webhook/contact_form',
  newsletterWebhook: 'https://n8n.mysrztourism.com/webhook/newsletter_form',
};
