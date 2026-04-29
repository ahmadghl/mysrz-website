import React, { useState, useEffect, useRef, useCallback } from 'react';
import { applySEO, PAGE_SEO, getBlogPostSEO, applyBlogPostSchema, removeBlogPostSchema } from './seo';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass, Calendar, User, ArrowRight, Search, Menu, X,
  Instagram, Twitter, Facebook, ChevronRight, Sparkles,
  MapPin, Phone, Mail, Globe, Star, Mountain, Camera,
  Utensils, Leaf, Heart, Send, Clock, Eye, BookOpen,
  ChevronDown, Play, Award, Users, TrendingUp, MessageCircle
} from 'lucide-react';
import Markdown from 'react-markdown';
import { format } from 'date-fns';
import { Post, Category, Page } from './types';
import { cn } from './utils';
import { trackPageLoad, trackEvent } from './tracker';

// ─── Static Pakistan Blog Posts ──────────────────────────────────────────────
const STATIC_POSTS: Post[] = [
  {
    id: '1',
    title: 'K2 Base Camp Trek: The Ultimate High-Altitude Adventure',
    excerpt: 'Standing at 8,611 metres, K2 is the world\'s second-highest and most dangerous peak. The trek to its base camp through the Karakoram range is a once-in-a-lifetime journey through raw, breathtaking wilderness.',
    content: `# K2 Base Camp Trek: The Ultimate High-Altitude Adventure

Standing at **8,611 metres**, K2 is the world's second-highest and most dangerous peak. Known as the "Savage Mountain," the trek to its base camp is considered one of the most spectacular and challenging walks on Earth.

## Getting There

The journey begins in **Skardu**, accessible by flight from Islamabad (weather permitting) or a dramatic 20-hour drive through the Karakoram Highway. From Skardu, jeeps take trekkers to **Askole** — the last village before the wilderness begins.

## The Route

The classic route covers approximately **160 km** round trip:

- **Askole to Jhola** — Day 1, crossing the Braldu River
- **Jhola to Paiyu** — Through dramatic river canyons
- **Paiyu to Urdukas** — First views of the Baltoro Glacier
- **Urdukas to Goro II** — Walking on the glacier itself
- **Goro II to Concordia** — The "Throne Room of the Mountain Gods"
- **Concordia to K2 Base Camp** — The final dramatic approach

## Best Time to Visit

**June to August** is the ideal window. The weather is most stable, the glacier crossings are manageable, and wildflowers carpet the lower valleys.

## What to Expect

- Temperatures dropping to **-10°C** at night near base camp
- Daily walks of **6–8 hours** on rough terrain
- Altitude sickness is a real risk above 4,000m — acclimatize properly
- Porters from Askole carry gear at a regulated daily rate

## Permits Required

- **Trekking Permit** from the Tourism Department
- **CNIC/Passport** copies for all team members
- Liaison Officer may be required for certain zones

The reward? Standing at Concordia, surrounded by four 8,000m peaks — K2, Broad Peak, Gasherbrum I and II — is an experience that will stay with you forever.`,
    image_url: 'https://picsum.photos/seed/k2-pakistan/800/600',
    category: 'Adventure',
    author: 'Ahmad Fraz',
    created_at: '2026-01-15T00:00:00Z',
    read_time: 8,
    views: 4230,
  },
  {
    id: '2',
    title: 'Lahore: The City of Gardens, Mughals & Incredible Food',
    excerpt: 'Lahore is Pakistan\'s cultural heartbeat — a city where 17th-century Mughal architecture stands alongside buzzing bazaars, and where the food is so good locals say "Lahore Lahore aye."',
    content: `# Lahore: The City of Gardens, Mughals & Incredible Food

**Lahore Lahore aye** — there's no place like Lahore. Pakistan's cultural capital is a sensory explosion of history, art, and the most extraordinary food you'll ever eat.

## Must-Visit Historical Sites

### Badshahi Mosque
Built in 1673 by Emperor Aurangzeb, this is one of the largest mosques in the world. Its red sandstone and white marble construction is breathtaking at sunset when the domes glow golden.

### Lahore Fort (Shahi Qila)
A UNESCO World Heritage Site, the fort spans over 20 hectares and contains palaces, mosques, and gardens built across centuries of Mughal rule. Don't miss the **Sheesh Mahal** (Palace of Mirrors).

### Shalimar Gardens
Another UNESCO site, these terraced Mughal gardens were built by Shah Jahan in 1641. Three levels of fountains, pavilions and marble walkways — pure serenity.

### The Walled City
Getting lost in the narrow lanes of the **Old City** is an adventure in itself. The **Delhi Gate**, **Shahi Hammam** (Royal Baths), and the bustling **Anarkali Bazaar** are unmissable.

## Food — The Real Reason to Visit

Lahore's food scene is legendary across South Asia:

- **Nihari** at Waris Nihari — slow-cooked beef stew, best eaten at dawn
- **Paye** (trotters) at Data Darbar area
- **Seekh Kebabs** on Food Street near Cocos Den
- **Kulfi Falooda** at Mozang Chowk
- **Halwa Puri** breakfast at Phajja Gee

## Best Time to Visit

**October to March** — the weather is cool and perfect for walking the old city. Avoid June–August when temperatures exceed 40°C.

## Getting Around

Lahore has excellent **rickshaws**, **ride-hailing apps** (InDrive, Bykea), and the **Orange Line Metro** connecting key areas.`,
    image_url: 'https://picsum.photos/seed/lahore-badshahi/800/600',
    category: 'Culture',
    author: 'Ahmad Fraz',
    created_at: '2026-01-22T00:00:00Z',
    read_time: 7,
    views: 5810,
  },
  {
    id: '3',
    title: 'Hunza Valley: Paradise Found in the Karakoram',
    excerpt: 'Nestled between the Karakoram, Hindu Kush and Himalayan ranges, Hunza Valley is Pakistan\'s most photographed destination — and for good reason. Cherry blossoms, ancient forts, and views of Rakaposhi will leave you speechless.',
    content: `# Hunza Valley: Paradise Found in the Karakoram

If there is a single place in Pakistan that defines the phrase "hidden gem," it is **Hunza Valley**. Perched at 2,438 metres in the Gilgit-Baltistan region, it is surrounded by some of the highest peaks on Earth.

## Why Hunza is Special

The Hunza people are known for their exceptional longevity, warm hospitality, and unique **Burushaski** language spoken nowhere else on Earth. The valley has a literacy rate among the highest in Pakistan, and women's education is a point of local pride.

## Top Attractions

### Baltit Fort
Over 700 years old, **Baltit Fort** sits above Karimabad town like a sentinel. The restored fort offers panoramic views of the valley and displays traditional Hunzai culture and artifacts.

### Attabad Lake
Created by a massive landslide in 2010, this impossibly turquoise lake stretches for 21 km. Boat rides across it with Karakoram peaks reflecting in the still water are surreal.

### Eagle's Nest Viewpoint
A steep drive or hike brings you to this legendary viewpoint where on clear days you can see **Rakaposhi (7,788m)**, **Ultar Sar (7,388m)**, and **Ladyfinger Peak** all at once.

### Passu Cones
These dramatic cathedral spires rising from the valley floor are among the most photographed natural features in Pakistan. The ancient **Passu Suspension Bridge** nearby is not for the faint-hearted.

## Cherry Blossom Season

**Late March to mid-April** transforms Hunza into a pink and white wonderland. The old apricot and cherry orchards bloom against snow-capped peaks — it rivals Japan's famous sakura season.

## What to Eat

- **Chapshuro** — meat-filled flatbread, Hunza's signature dish
- **Diram Phitti** — walnut and mulberry cake
- **Apricot oil** — used in everything from cooking to skincare
- **Tumuro tea** — wild rose hip tea, naturally caffeine-free

## Getting There

Fly **Islamabad → Gilgit** (55 minutes), then drive 2 hours to Karimabad. Alternatively, the **Karakoram Highway** drive from Islamabad takes 14–16 hours but passes through some of the world's most dramatic scenery.`,
    image_url: 'https://picsum.photos/seed/hunza-valley/800/600',
    category: 'Nature',
    author: 'Ahmad Fraz',
    created_at: '2026-02-05T00:00:00Z',
    read_time: 9,
    views: 6920,
  },
  {
    id: '4',
    title: 'Karachi Street Food Guide: 20 Dishes You Must Try',
    excerpt: 'Pakistan\'s largest city is a melting pot of cultures, and nowhere is this more evident than in its street food. From Boat Basin to Burns Road, Karachi\'s food scene is unlike anything else in the world.',
    content: `# Karachi Street Food Guide: 20 Dishes You Must Try

**Karachi** — the city of lights, the city of 20 million people, and without question, the street food capital of Pakistan. The diversity of Karachi's population (Sindhis, Baloch, Urdu-speakers, Punjabis, Pashtuns, Memons) has created a culinary landscape of extraordinary richness.

## Burns Road — The Street Food Mecca

**Burns Road** in central Karachi is the undisputed king. At night, this stretch transforms into a glowing corridor of food stalls, each with generations of recipes.

### Top Burns Road Dishes:
1. **Biryani at Student Biryani** — fragrant, spiced, legendary
2. **Nihari** — slow-cooked beef stew with bone marrow
3. **Haleem** — slow-cooked wheat and meat porridge
4. **Brain Masala** — not for the faint-hearted, but extraordinary
5. **Paya Soup** — trotters simmered for hours

## Boat Basin & Phase 5 DHA

For a more upscale street food experience:
- **Bun Kebab** — Pakistan's version of a burger, utterly addictive
- **Gola Ganda** — shaved ice with flavored syrups and cream
- **Dahi Puri** — crispy shells filled with yogurt and chutneys
- **Seekh Kebab rolls** from roadside grills after midnight

## Clifton Beach Area

- **Bhutta (roasted corn)** on the beach at sunset
- **Fried fish** from Fisherman's Cooperative Society — ultra-fresh
- **Chaat** with tamarind and mint chutney

## Sweet Treats

- **Rabri** at Karachi Halwa House
- **Kheer** — rice pudding flavored with cardamom
- **Sohan Halwa** from Multan, available city-wide
- **Jalebi** fresh from the fryer, dripping with syrup

## Practical Tips

- Eat where the locals eat — long queues mean quality
- Carry cash — most stalls don't accept cards
- Best time: **7pm–2am** when the city comes alive
- Hygiene tip: look for high turnover stalls

Karachi's street food is an adventure. Go hungry, go curious, and go often.`,
    image_url: 'https://picsum.photos/seed/karachi-food/800/600',
    category: 'Food',
    author: 'Ahmad Fraz',
    created_at: '2026-02-14T00:00:00Z',
    read_time: 6,
    views: 3890,
  },
  {
    id: '5',
    title: 'Fairy Meadows & Nanga Parbat: A Trek Into the Clouds',
    excerpt: 'Fairy Meadows is the most beautiful alpine meadow in Pakistan — a flat, flower-filled expanse at 3,300m with Nanga Parbat, the world\'s 9th highest peak, as its dramatic backdrop.',
    content: `# Fairy Meadows & Nanga Parbat: A Trek Into the Clouds

**Fairy Meadows (Joot)** sits at 3,300 metres in the Diamer District of Gilgit-Baltistan. It is one of those rare places that genuinely exceeds every photograph you've seen of it.

## The Setting

The meadow stretches across a high plateau, carpeted in wildflowers from June to September, with **Nanga Parbat** (8,126m) — the "Killer Mountain" — filling the entire northern horizon. The scale is incomprehensible until you're standing there.

## Getting to Fairy Meadows

1. **Islamabad → Raikot Bridge** by bus or private vehicle (approx. 10 hours)
2. **Raikot Bridge → Tato Village** by jeep on a notoriously steep and narrow track (1.5 hours — genuinely terrifying but unforgettable)
3. **Tato → Fairy Meadows** on foot (2.5–3 hours, gradual climb through forest)

## The Nanga Parbat Base Camp Trek

From Fairy Meadows, experienced trekkers can continue to **Nanga Parbat Base Camp (Raikot)** at 4,300m:

- **Day 1**: Fairy Meadows → Beyal Camp (3,500m) — 3 hours
- **Day 2**: Beyal Camp → Base Camp (4,300m) — 4 hours
- **Day 3**: Base Camp → Fairy Meadows — descent

The views of the **Raikot Face** from base camp — a 4,600m wall of ice and rock — are among the most dramatic on Earth.

## Camping & Accommodation

Several guesthouses and camping spots exist at Fairy Meadows. **PTDC Motel** is the most established. Camping under the stars with Nanga Parbat glowing above you in moonlight is an experience unlike any other.

## Best Season

**May to October** — with June/July offering the best wildflower blooms and September giving the clearest skies for photography.

## Photography Tips

- **Golden hour** (6am and 6pm) turns Nanga Parbat's glaciers a deep orange
- Bring a **wide-angle lens** — no telephoto can capture the full scale
- Clear mornings are essential — clouds typically roll in by early afternoon`,
    image_url: 'https://picsum.photos/seed/fairy-meadows/800/600',
    category: 'Adventure',
    author: 'Ahmad Fraz',
    created_at: '2026-02-28T00:00:00Z',
    read_time: 7,
    views: 5120,
  },
  {
    id: '6',
    title: 'Mohenjo-daro: Walking Through a 5,000-Year-Old Civilization',
    excerpt: 'One of the world\'s earliest urban settlements, Mohenjo-daro in Sindh was a masterpiece of city planning that predates the Roman Empire by 2,000 years. Visiting it is a journey to the very dawn of human civilization.',
    content: `# Mohenjo-daro: Walking Through a 5,000-Year-Old Civilization

In the dusty plains of **Sindh**, along the banks of the ancient Indus River, lie the ruins of one of humanity's greatest early cities. **Mohenjo-daro** (meaning "Mound of the Dead" in Sindhi) was home to an estimated **40,000–50,000 people** at its peak around 2500 BCE.

## Why Mohenjo-daro Matters

This UNESCO World Heritage Site is evidence of something extraordinary: 5,000 years ago, the **Indus Valley Civilization** had already mastered urban planning in ways that wouldn't be matched for millennia:

- **Grid-pattern streets** running precisely north-south and east-west
- **Covered sewage systems** more sophisticated than many cities today
- **Standardized brick sizes** used consistently across the city
- **Public bath (Great Bath)** — possibly the world's first public water facility
- **Multi-story buildings** with indoor plumbing

## What You'll See

### The Great Bath
This 12m × 7m pool, lined with bitumen for waterproofing, is the most iconic structure. Archaeologists believe it had ritual significance.

### The Granary
A massive storage facility suggesting centralized food management — evidence of an organized state.

### Residential Areas
Walking the excavated streets, you can see individual homes with their own wells, bathrooms, and waste chutes connecting to the main sewer.

### The Stupa Mound
A later Buddhist structure built atop the ancient city — showing 3,000 years of continuous habitation.

## The Mohenjo-daro Museum
On site, the museum houses remarkable artifacts: the famous **Dancing Girl** bronze figurine, **Priest-King** sculpture, and thousands of inscribed seals in a script that has never been fully deciphered.

## Getting There

- **Fly to Sukkur** from Karachi (1 hour), then drive 80km to the site
- Or drive from **Karachi** (approx. 6 hours via M-9 motorway)

## Best Time to Visit

**October to February** — Sindh summers are brutally hot (45°C+). Winter mornings are cool and the light is perfect for photography.`,
    image_url: 'https://picsum.photos/seed/mohenjo-daro/800/600',
    category: 'Culture',
    author: 'Ahmad Fraz',
    created_at: '2026-03-08T00:00:00Z',
    read_time: 8,
    views: 2750,
  },
  {
    id: '7',
    title: 'Deosai Plains: The Roof of the World in Full Bloom',
    excerpt: 'At an average elevation of 4,114m, Deosai is the world\'s second-highest plateau. In summer, it transforms into a vast carpet of wildflowers stretching to the horizon — a landscape so alien it barely feels like Earth.',
    content: `# Deosai Plains: The Roof of the World in Full Bloom

**Deosai National Park** is one of Pakistan's most extraordinary landscapes — and one of the world's least-visited high-altitude plateaus. Covering **3,000 square kilometres** at an average elevation of **4,114 metres**, it is almost entirely above the treeline.

## The Summer Transformation

From **late June to mid-September**, snowmelt transforms Deosai into a flower-filled paradise. Hundreds of species of wildflowers bloom simultaneously — purple irises, yellow buttercups, white daisies — creating a carpet of color that stretches as far as the eye can see.

## Wildlife

Deosai is one of the last refuges of the **Himalayan Brown Bear**. With a population of around 40 individuals, sightings are possible but not guaranteed. Other wildlife includes:

- **Snow Leopard** (extremely rare sighting)
- **Himalayan Ibex**
- **Red Fox**
- **Golden Eagle** and **Lammergeier** (Bearded Vulture)
- **Tibetan Wolf**

## Sheosar Lake

At the heart of the plateau sits **Sheosar Lake** — an impossibly blue high-altitude lake reflecting the sky and surrounding mountains. Camping beside it overnight, when the Milky Way blazes overhead and temperatures drop to near freezing even in July, is unforgettable.

## Getting There

- From **Skardu** (2–3 hours by jeep via Sadpara Lake)
- A 4WD vehicle is essential — roads are rough and stream crossings are common
- The plateau is **closed from October to May** due to snow

## Practical Information

- Entry fee applies at the national park gate
- No petrol stations inside — fill up in Skardu
- Bring warm layers regardless of the season
- Altitude sickness is possible — acclimatize in Skardu first`,
    image_url: 'https://picsum.photos/seed/deosai-plains/800/600',
    category: 'Nature',
    author: 'Ahmad Fraz',
    created_at: '2026-03-01T00:00:00Z',
    read_time: 6,
    views: 3340,
  },
  {
    id: '8',
    title: 'Peshawar: Where the Silk Road Lives On',
    excerpt: 'One of the oldest continuously inhabited cities in the world, Peshawar sits at the gateway to the Khyber Pass. Its bazaars sell everything from hand-embroidered textiles to antique Afghan rifles — and the food is extraordinary.',
    content: `# Peshawar: Where the Silk Road Lives On

**Peshawar** has been a crossroads of civilizations for over 2,000 years. Greeks, Kushans, Mughals, Sikhs, British — every empire that touched South Asia passed through this city. Today it remains one of Pakistan's most culturally rich and historically layered destinations.

## The Old City (Qissa Khwani Bazaar)

**Qissa Khwani Bazaar** — "Bazaar of the Storytellers" — was once where caravanserai travelers would rest and exchange tales. Today it's still a bustling bazaar where:

- **Chappal (sandal) makers** work leather by hand
- **Peshwari caps** are sold in rainbow colors
- **Dried fruits and nuts** from Afghanistan fill enormous sacks
- **Antique dealers** sell tribal jewelry, old coins, and Pashtun artifacts
- **Kebab stalls** fill the air with wood smoke from dawn to midnight

## Mahabat Khan Mosque
This stunning 17th-century Mughal mosque in the heart of the old city is Peshawar's finest architectural gem — decorated with frescoes and intricate tile work.

## Peshawar Museum
One of Pakistan's finest museums, housing the world's greatest collection of **Gandhara Buddhist art** — sculptures created when this region was a center of Buddhist learning 2,000 years ago.

## Khyber Pass
A special permit allows visits to the legendary **Khyber Pass** — the strategic mountain pass connecting Pakistan to Afghanistan that has been fought over for millennia.

## The Food

Pashtun cuisine is distinct from the rest of Pakistan:
- **Chapli Kebab** — Peshawar's signature spiced flat kebab
- **Kabuli Pulao** — rice cooked with meat, carrots, and raisins
- **Mantu** — steamed dumplings with yogurt and tomato sauce
- **Sheer Chai** — pink salty tea, an acquired taste you'll crave forever

## Getting There

- **Flights** from Karachi, Lahore, Islamabad (1 hour)
- **Train** from Lahore (5 hours on the Khyber Mail)`,
    image_url: 'https://picsum.photos/seed/peshawar-bazaar/800/600',
    category: 'Culture',
    author: 'Ahmad Fraz',
    created_at: '2026-03-10T00:00:00Z',
    read_time: 7,
    views: 2980,
  },
];

const DESTINATIONS = [
  { name: 'Hunza Valley', region: 'Gilgit-Baltistan', image: 'https://picsum.photos/seed/hunza-dest/600/400', tag: 'Most Popular', icon: Mountain },
  { name: 'Lahore', region: 'Punjab', image: 'https://picsum.photos/seed/lahore-dest/600/400', tag: 'Cultural Hub', icon: Camera },
  { name: 'Karachi', region: 'Sindh', image: 'https://picsum.photos/seed/karachi-dest/600/400', tag: 'Food Capital', icon: Utensils },
  { name: 'Skardu', region: 'Gilgit-Baltistan', image: 'https://picsum.photos/seed/skardu-dest/600/400', tag: 'Adventure Base', icon: Mountain },
  { name: 'Swat Valley', region: 'KPK', image: 'https://picsum.photos/seed/swat-dest/600/400', tag: 'Switzerland of East', icon: Leaf },
  { name: 'Peshawar', region: 'KPK', image: 'https://picsum.photos/seed/peshawar-dest/600/400', tag: 'Ancient City', icon: Globe },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [contactSent, setContactSent] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSent, setNewsletterSent] = useState(false);
  const [dynamicPosts, setDynamicPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  // ── Fetch posts from Supabase API ─────────────────────────────────────────
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/posts');
        if (res.ok) {
          const data: Post[] = await res.json();
          if (data.length > 0) {
            setDynamicPosts(data);
          }
        }
      } catch {
        // Silently fall back to static posts
      } finally {
        setPostsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Use dynamic posts if loaded, otherwise fall back to static
  const ALL_POSTS = dynamicPosts.length > 0 ? dynamicPosts : STATIC_POSTS;

  useEffect(() => {
    trackPageLoad();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    trackEvent('page_view', { page: currentPage });

    // Dynamic SEO on every page/post change
    if (selectedPost) {
      applySEO(getBlogPostSEO(selectedPost));
      applyBlogPostSchema(selectedPost);
    } else {
      removeBlogPostSchema();
      if (PAGE_SEO[currentPage]) {
        applySEO(PAGE_SEO[currentPage]);
      }
    }
  }, [currentPage, selectedPost]);

  const navigate = (page: Page) => {
    setCurrentPage(page);
    setSelectedPost(null);
    setIsMenuOpen(false);
  };

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setAiInsight(null);
    setCurrentPage('blog');
    trackEvent('post_opened', { post_id: post.id, post_title: post.title });
  };

  const filteredPosts = ALL_POSTS.filter(p => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent('contact_form_submitted', contactForm);
    fetch('https://n8n.mysrztourism.com/webhook/contact_form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        form_name: 'Contact Form',
        form_source: 'mySRZ Travel & Tourism',
        website: 'https://my-srz-pakistan.vercel.app',
        submitted_at: new Date().toISOString(),
        contact: {
          full_name: contactForm.name,
          email: contactForm.email,
          phone: contactForm.phone || null,
          subject: contactForm.subject,
          message: contactForm.message,
        },
        meta: {
          page_url: window.location.href,
          referrer: document.referrer || 'Direct',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: navigator.language,
        },
      })
    }).catch(() => {});
    setContactSent(true);
    setTimeout(() => setContactSent(false), 5000);
    setContactForm({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent('newsletter_signup', { email: newsletterEmail });
    fetch('https://n8n.mysrztourism.com/webhook/newsletter_form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        form_name: 'Newsletter Signup',
        form_source: 'mySRZ Travel & Tourism',
        website: 'https://my-srz-pakistan.vercel.app',
        submitted_at: new Date().toISOString(),
        subscriber: {
          email: newsletterEmail,
        },
        meta: {
          page_url: window.location.href,
          referrer: document.referrer || 'Direct',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: navigator.language,
        },
      })
    }).catch(() => {});
    setNewsletterSent(true);
    setNewsletterEmail('');
    setTimeout(() => setNewsletterSent(false), 4000);
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    Adventure: <Mountain size={14} />,
    Culture: <Camera size={14} />,
    Food: <Utensils size={14} />,
    Nature: <Leaf size={14} />,
  };

  // ── NAV ───────────────────────────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const NavBar = () => (
    <>
      <nav className="sticky top-0 z-50 bg-brand-paper/90 backdrop-blur-md border-b border-black/5 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18 py-3">
            <button className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('home')}>
              <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-md">
                <svg width="24" height="24" viewBox="0 0 46 46"><g transform="translate(23,23)"><ellipse cx="0" cy="-15" rx="5" ry="8" fill="#d4af37" opacity="0.9" transform="rotate(0)"/><ellipse cx="0" cy="-15" rx="5" ry="8" fill="#d4af37" opacity="0.7" transform="rotate(90)"/><ellipse cx="0" cy="-15" rx="5" ry="8" fill="#d4af37" opacity="0.9" transform="rotate(180)"/><ellipse cx="0" cy="-15" rx="5" ry="8" fill="#d4af37" opacity="0.7" transform="rotate(270)"/><ellipse cx="0" cy="-14" rx="4" ry="7" fill="#e8c84a" opacity="0.6" transform="rotate(45)"/><ellipse cx="0" cy="-14" rx="4" ry="7" fill="#e8c84a" opacity="0.6" transform="rotate(135)"/><ellipse cx="0" cy="-14" rx="4" ry="7" fill="#e8c84a" opacity="0.6" transform="rotate(225)"/><ellipse cx="0" cy="-14" rx="4" ry="7" fill="#e8c84a" opacity="0.6" transform="rotate(315)"/><circle cx="0" cy="0" r="9" fill="#1a1a1a"/><text x="0" y="3.5" textAnchor="middle" fontSize="7" fontWeight="700" fill="#d4af37" fontFamily="Georgia,serif">SRZ</text></g></svg>
              </div>
              <div className="flex flex-col leading-none text-left">
                <span style={{fontFamily:"Georgia,serif", fontSize:"20px", fontWeight:"700", color:"#d4af37", letterSpacing:"-0.01em"}}>mySRZ</span>
                <span className="text-[9px] uppercase tracking-[0.25em] text-brand-primary/40 font-medium">Travel & Tourism</span>
              </div>
            </button>

            <div className="hidden md:flex items-center gap-1">
              {([
                { label: 'Home', page: 'home' },
                { label: 'Destinations', page: 'destinations' },
                { label: 'Blog', page: 'blog' },
                { label: 'About', page: 'about' },
                { label: 'Contact', page: 'contact' },
              ] as { label: string; page: Page }[]).map(({ label, page }) => (
                <button key={page} onClick={() => navigate(page)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    currentPage === page
                      ? "bg-brand-paper text-brand-primary font-semibold"
                      : "text-brand-primary/70 hover:text-brand-primary hover:bg-brand-paper"
                  )}>
                  {label}
                </button>
              ))}
              <button onClick={() => { navigate('contact'); trackEvent('nav_cta_clicked'); }}
                className="ml-3 bg-brand-primary text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-800 transition-all shadow-sm">
                Plan a Trip
              </button>
            </div>

            <button className="md:hidden p-2 rounded-lg hover:bg-black/5" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed top-[61px] left-0 right-0 z-40 bg-brand-paper border-b border-black/5 shadow-xl px-4 py-5 space-y-1">
            {([
              { label: 'Home', page: 'home' },
              { label: 'Destinations', page: 'destinations' },
              { label: 'Blog', page: 'blog' },
              { label: 'About', page: 'about' },
              { label: 'Contact', page: 'contact' },
            ] as { label: string; page: Page }[]).map(({ label, page }) => (
              <button key={page} onClick={() => navigate(page)}
                className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-brand-primary/80 hover:bg-brand-paper hover:text-brand-primary transition-all">
                {label}
              </button>
            ))}
            <div className="pt-2">
              <button onClick={() => navigate('contact')}
                className="w-full bg-brand-primary text-white py-3 rounded-xl text-sm font-bold uppercase tracking-widest">
                Plan a Trip
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  // ── FOOTER ────────────────────────────────────────────────────────────────
  const Footer = () => (
    <footer className="text-white pt-16 pb-0" style={{background:"#111"}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 46 46"><g transform="translate(23,23)"><ellipse cx="0" cy="-15" rx="5" ry="8" fill="#d4af37" opacity="0.9" transform="rotate(0)"/><ellipse cx="0" cy="-15" rx="5" ry="8" fill="#d4af37" opacity="0.7" transform="rotate(90)"/><ellipse cx="0" cy="-15" rx="5" ry="8" fill="#d4af37" opacity="0.9" transform="rotate(180)"/><ellipse cx="0" cy="-15" rx="5" ry="8" fill="#d4af37" opacity="0.7" transform="rotate(270)"/><ellipse cx="0" cy="-14" rx="4" ry="7" fill="#e8c84a" opacity="0.6" transform="rotate(45)"/><ellipse cx="0" cy="-14" rx="4" ry="7" fill="#e8c84a" opacity="0.6" transform="rotate(135)"/><ellipse cx="0" cy="-14" rx="4" ry="7" fill="#e8c84a" opacity="0.6" transform="rotate(225)"/><ellipse cx="0" cy="-14" rx="4" ry="7" fill="#e8c84a" opacity="0.6" transform="rotate(315)"/><circle cx="0" cy="0" r="9" fill="#1a1a1a"/><text x="0" y="3.5" textAnchor="middle" fontSize="7" fontWeight="700" fill="#d4af37" fontFamily="Georgia,serif">SRZ</text></g></svg>
              </div>
              <div>
                <div className="text-xl font-bold text-brand-accent">mySRZ</div>
                <div className="text-[9px] uppercase tracking-widest text-brand-primary/50">Travel & Tourism</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-6 max-w-sm" style={{color:"rgba(255,255,255,0.45)"}}>
              Your ultimate guide to exploring Pakistan's breathtaking landscapes, rich culture, and incredible cuisine. Discover hidden gems from Karakoram to the Arabian Sea.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Instagram, href: 'https://instagram.com', name: 'Instagram' },
                { Icon: Twitter, href: 'https://twitter.com', name: 'Twitter' },
                { Icon: Facebook, href: 'https://facebook.com', name: 'Facebook' },
              ].map(({ Icon, href, name }) => (
                <a key={name} href={href} target="_blank" rel="noopener noreferrer"
                  onClick={() => trackEvent('social_clicked', { platform: name })}
                  className="w-10 h-10 rounded-xl bg-brand-primary/80 flex items-center justify-center hover:bg-brand-primary transition-all">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{color:"#d4af37",fontSize:"12px",fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.2em",marginBottom:"20px"}}>Quick Links</h4>
            <ul className="space-y-3 text-sm" style={{color:"rgba(255,255,255,0.45)"}}>
              {[
                { label: 'Home', page: 'home' as Page },
                { label: 'Destinations', page: 'destinations' as Page },
                { label: 'Blog', page: 'blog' as Page },
                { label: 'About Us', page: 'about' as Page },
                { label: 'Contact', page: 'contact' as Page },
              ].map(({ label, page }) => (
                <li key={label}>
                  <button onClick={() => navigate(page)} className="hover:text-brand-accent transition-colors text-left">
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{color:"#d4af37",fontSize:"12px",fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.2em",marginBottom:"20px"}}>Contact Us</h4>
            <ul className="space-y-3 text-sm" style={{color:"rgba(255,255,255,0.45)"}}>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-brand-accent flex-shrink-0" />
                <a href="tel:+923012432222" className="hover:text-brand-accent transition-colors" style={{color:"rgba(255,255,255,0.45)"}}>+92 301 2432222</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-brand-accent flex-shrink-0" />
                <a href="mailto:ahmadfraz009@gmail.com" className="hover:text-brand-accent transition-colors break-all">ahmadfraz009@gmail.com</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-brand-accent flex-shrink-0 mt-0.5" />
                <span>Pakistan</span>
              </li>
            </ul>

            <div className="mt-6">
              <h4 className="font-bold text-sm uppercase tracking-widest mb-3 text-white/70">Newsletter</h4>
              <form onSubmit={handleNewsletter} className="flex gap-2">
                <input type="email" value={newsletterEmail} onChange={e => setNewsletterEmail(e.target.value)}
                  placeholder="Your email" required
                  className="bg-brand-primary/80 border border-white/10 rounded-lg px-3 py-2 text-sm flex-grow focus:outline-none focus:border-brand-accent placeholder:text-brand-primary/70" />
                <button type="submit" className="bg-brand-primary px-3 py-2 rounded-lg hover:bg-brand-primary/90 transition-all">
                  <Send size={14} />
                </button>
              </form>
              {newsletterSent && <p className="text-brand-accent text-xs mt-2">✓ Subscribed! Thank you.</p>}
            </div>
          </div>
        </div>

        <div style={{background:"#d4af37",margin:"0 -2rem",padding:"10px 2rem"}} className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs">
          <span style={{color:"#1a1a1a",fontWeight:"700"}}>© 2026 mySRZ. All rights reserved.</span>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Use', 'Sitemap'].map(link => (
              <button key={link} onClick={() => trackEvent('footer_link_clicked', { link })}
                className="hover:text-brand-primary/40 transition-colors">{link}</button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );

  // ── HOME PAGE ─────────────────────────────────────────────────────────────
  const HomePage = () => (
    <div>
      {/* Hero */}
      <section className="relative h-[92vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://picsum.photos/seed/pakistan-mountains-hero/1920/1080"
            className="w-full h-full object-cover" alt="Pakistan mountains" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/85 via-stone-900/50 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white w-full">
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="max-w-2xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-px bg-emerald-400" />
              <span className="text-xs uppercase tracking-[0.3em] text-brand-accent font-semibold">Explore Pakistan</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-[1.05]">
              Discover the<br />
              <span className="text-brand-accent">Soul of</span><br />
              Pakistan
            </h1>
            <p className="text-white/70 text-lg md:text-xl leading-relaxed mb-10 max-w-lg">
              From the Karakoram peaks to ancient Mughal cities — your complete guide to Pakistan's most extraordinary destinations, food, and culture.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => { navigate('destinations'); trackEvent('hero_explore_clicked'); }}
                className="bg-brand-primary text-white px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-brand-primary/90 transition-all shadow-lg">
                Explore Destinations
              </button>
              <button onClick={() => { navigate('blog'); trackEvent('hero_blog_clicked'); }}
                className="border border-white/30 text-white px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-white/10 transition-all">
                Read the Blog
              </button>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown size={28} className="text-white/40" />
        </div>
      </section>

      {/* Stats */}
      <section className="bg-brand-primary text-white py-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '50+', label: 'Destinations Covered', icon: MapPin },
            { value: '100+', label: 'Travel Guides', icon: BookOpen },
            { value: '10K+', label: 'Monthly Readers', icon: Users },
            { value: '5★', label: 'Reader Rating', icon: Star },
          ].map(({ value, label, icon: Icon }) => (
            <div key={label} className="text-center">
              <Icon size={20} className="mx-auto mb-2 text-brand-accent/80" />
              <div className="text-3xl font-bold">{value}</div>
              <div className="text-xs uppercase tracking-wider text-brand-accent/60 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-20 bg-brand-paper">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-primary">Latest Stories</span>
              <h2 className="text-4xl font-bold text-brand-primary mt-2">Featured Articles</h2>
            </div>
            <button onClick={() => navigate('blog')} className="mt-4 md:mt-0 flex items-center gap-2 text-sm font-semibold text-brand-primary hover:gap-4 transition-all">
              View All Articles <ArrowRight size={16} />
            </button>
          </div>

          {/* Hero post */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
            <motion.article whileHover={{ y: -4 }} className="lg:col-span-3 cursor-pointer group"
              onClick={() => handlePostClick(ALL_POSTS[2])}>
              <div className="relative h-80 lg:h-96 rounded-2xl overflow-hidden">
                <img src={ALL_POSTS[2].image_url} alt={ALL_POSTS[2].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <span className="bg-brand-primary/90 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3 inline-block">
                    {ALL_POSTS[2].category}
                  </span>
                  <h3 className="text-2xl font-bold leading-tight mb-2">{ALL_POSTS[2].title}</h3>
                  <div className="flex items-center gap-4 text-xs text-white/60">
                    <span className="flex items-center gap-1"><Clock size={10} /> {ALL_POSTS[2].read_time} min read</span>
                    <span className="flex items-center gap-1"><Eye size={10} /> {ALL_POSTS[2].views.toLocaleString()} views</span>
                  </div>
                </div>
              </div>
            </motion.article>

            <div className="lg:col-span-2 flex flex-col gap-6">
              {ALL_POSTS.slice(0, 2).map(post => (
                <motion.article key={post.id} whileHover={{ x: 4 }} className="cursor-pointer group flex gap-4 bg-brand-paper rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
                  onClick={() => handlePostClick(post)}>
                  <img src={post.image_url} alt={post.title}
                    className="w-24 h-24 rounded-xl object-cover flex-shrink-0 group-hover:scale-105 transition-transform duration-500" />
                  <div className="flex-grow min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-accent">{post.category}</span>
                    <h3 className="text-sm font-bold text-brand-primary leading-tight mt-1 line-clamp-2 group-hover:text-brand-primary transition-colors">{post.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-brand-primary/40 mt-2">
                      <span className="flex items-center gap-1"><Clock size={10} /> {post.read_time} min</span>
                      <span className="flex items-center gap-1"><Eye size={10} /> {post.views.toLocaleString()}</span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>

          {/* More posts grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ALL_POSTS.slice(3, 6).map(post => (
              <motion.article key={post.id} whileHover={{ y: -4 }} className="cursor-pointer group bg-brand-paper rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
                onClick={() => handlePostClick(post)}>
                <div className="relative h-48 overflow-hidden">
                  <img src={post.image_url} alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <span className="absolute top-3 left-3 bg-brand-paper/90 text-[10px] font-bold uppercase tracking-wider text-brand-primary/80 px-2 py-1 rounded-full">
                    {post.category}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-brand-primary leading-tight group-hover:text-brand-primary transition-colors line-clamp-2 mb-2">{post.title}</h3>
                  <p className="text-sm text-brand-primary/50 line-clamp-2 mb-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-brand-primary/40">
                    <span className="flex items-center gap-1"><Clock size={10} /> {post.read_time} min read</span>
                    <span className="flex items-center gap-1 text-brand-accent font-semibold">Read more <ChevronRight size={12} /></span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-primary">Where to Go</span>
            <h2 className="text-4xl font-bold text-brand-primary mt-2">Top Destinations</h2>
            <p className="text-brand-primary/50 mt-3 max-w-xl mx-auto">From northern peaks to ancient cities, Pakistan has something extraordinary for every kind of traveler.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {DESTINATIONS.map((dest, idx) => (
              <motion.div key={dest.name} whileHover={{ y: -6 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                className="cursor-pointer group relative rounded-2xl overflow-hidden shadow-sm"
                onClick={() => { navigate('destinations'); trackEvent('destination_preview_clicked', { destination: dest.name }); }}>
                <div className="relative h-44 md:h-56">
                  <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-brand-accent text-brand-primary text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">{dest.tag}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <div className="font-bold text-lg leading-tight">{dest.name}</div>
                    <div className="text-xs text-white/70 flex items-center gap-1 mt-0.5"><MapPin size={10} />{dest.region}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <button onClick={() => navigate('destinations')}
              className="bg-brand-primary text-white px-8 py-3 rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-brand-primary/90 transition-all">
              See All Destinations
            </button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-brand-primary text-white text-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <span className="text-xs uppercase tracking-[0.3em] text-brand-accent font-bold">Get in Touch</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-4">Plan Your Pakistan Journey</h2>
          <p className="text-brand-primary/40 max-w-xl mx-auto mb-8">Have questions about traveling in Pakistan? We're here to help you plan an unforgettable trip.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => navigate('contact')}
              className="bg-brand-primary text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-brand-primary/90 transition-all">
              Contact Us
            </button>
            <a href="tel:+923012432222"
              className="border border-stone-600 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-sm hover:border-brand-accent transition-all flex items-center gap-2">
              <Phone size={16} /> +92 301 2432222
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  );

  // ── DESTINATIONS PAGE ─────────────────────────────────────────────────────
  const DestinationsPage = () => {
    const allDests = [
      { name: 'Hunza Valley', region: 'Gilgit-Baltistan', desc: 'Turquoise lakes, ancient forts, and Karakoram peaks. Pakistan\'s most beloved valley.', best: 'Apr–Oct', image: 'https://picsum.photos/seed/hunza-full/800/600', tags: ['Scenic', 'Trekking', 'Culture'] },
      { name: 'Lahore', region: 'Punjab', desc: 'Mughal monuments, world-class food, and the beating cultural heart of Pakistan.', best: 'Oct–Mar', image: 'https://picsum.photos/seed/lahore-full/800/600', tags: ['History', 'Food', 'Culture'] },
      { name: 'Skardu', region: 'Gilgit-Baltistan', desc: 'Gateway to K2 and the Karakoram. Cold deserts, emerald lakes, and ancient rock carvings.', best: 'May–Sep', image: 'https://picsum.photos/seed/skardu-full/800/600', tags: ['Adventure', 'Trekking', 'Scenic'] },
      { name: 'Swat Valley', region: 'KPK', desc: 'Called the "Switzerland of the East" — lush green valleys, waterfalls and Buddhist ruins.', best: 'Apr–Oct', image: 'https://picsum.photos/seed/swat-full/800/600', tags: ['Nature', 'History', 'Scenic'] },
      { name: 'Karachi', region: 'Sindh', desc: 'The city of lights. Pakistan\'s largest city with incredible seafood and street food culture.', best: 'Nov–Feb', image: 'https://picsum.photos/seed/karachi-full/800/600', tags: ['Food', 'Beach', 'Urban'] },
      { name: 'Peshawar', region: 'KPK', desc: 'One of the world\'s oldest cities. Ancient bazaars, Pashtun culture, and the Khyber Pass.', best: 'Oct–Mar', image: 'https://picsum.photos/seed/peshawar-full/800/600', tags: ['History', 'Culture', 'Food'] },
      { name: 'Fairy Meadows', region: 'Gilgit-Baltistan', desc: 'Alpine meadow at 3,300m with Nanga Parbat as its dramatic backdrop.', best: 'Jun–Sep', image: 'https://picsum.photos/seed/fairy-full/800/600', tags: ['Adventure', 'Scenic', 'Trekking'] },
      { name: 'Mohenjo-daro', region: 'Sindh', desc: 'Walk through a 5,000-year-old UNESCO World Heritage city of the Indus Civilization.', best: 'Oct–Feb', image: 'https://picsum.photos/seed/mohenjo-full/800/600', tags: ['History', 'UNESCO', 'Culture'] },
      { name: 'Deosai Plains', region: 'Gilgit-Baltistan', desc: 'World\'s second-highest plateau. Vast wildflower meadows, Himalayan bears, and crystal streams.', best: 'Jul–Sep', image: 'https://picsum.photos/seed/deosai-full/800/600', tags: ['Wildlife', 'Nature', 'Adventure'] },
      { name: 'Naran & Kaghan', region: 'KPK', desc: 'The Kaghan Valley with Saiful Maluk lake and Babusar Pass is a summer paradise.', best: 'May–Sep', image: 'https://picsum.photos/seed/naran-full/800/600', tags: ['Scenic', 'Lakes', 'Trekking'] },
      { name: 'Islamabad', region: 'Federal Capital', desc: 'Pakistan\'s clean, green capital with the Margalla Hills, Faisal Mosque, and great food.', best: 'All Year', image: 'https://picsum.photos/seed/islamabad-full/800/600', tags: ['Urban', 'Nature', 'Culture'] },
      { name: 'Makran Coast', region: 'Balochistan', desc: 'Wild, dramatic coastline with golden beaches, hot springs, and the Princess of Hope rock.', best: 'Nov–Mar', image: 'https://picsum.photos/seed/makran-full/800/600', tags: ['Beach', 'Adventure', 'Scenic'] },
    ];

    return (
      <div>
        {/* Header */}
        <div className="bg-brand-primary text-white py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <span className="text-xs uppercase tracking-[0.3em] text-brand-accent font-bold">Explore Pakistan</span>
            <h1 className="text-5xl font-bold mt-3 mb-4">All Destinations</h1>
            <p className="text-brand-primary/40 max-w-2xl text-lg">From the world's highest mountain ranges to ancient civilizations — Pakistan is one of the most diverse travel destinations on Earth.</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allDests.map((dest, idx) => (
              <motion.div key={dest.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                className="group bg-brand-paper rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => { navigate('blog'); trackEvent('destination_clicked', { destination: dest.name }); }}>
                <div className="relative h-52 overflow-hidden">
                  <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 right-3 bg-brand-accent text-brand-primary text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                    Best: {dest.best}
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <div className="flex items-center gap-1 text-white/80 text-xs"><MapPin size={10} />{dest.region}</div>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold text-brand-primary group-hover:text-brand-primary transition-colors mb-2">{dest.name}</h3>
                  <p className="text-brand-primary/50 text-sm leading-relaxed mb-4">{dest.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {dest.tags.map(tag => (
                      <span key={tag} className="bg-black/5 text-brand-primary/70 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ── BLOG PAGE ─────────────────────────────────────────────────────────────
  const BlogPage = () => {
    if (selectedPost) {
      return (
        <div>
          <div className="relative h-[60vh] overflow-hidden">
            <img src={selectedPost.image_url} className="w-full h-full object-cover" alt={selectedPost.title} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end">
              <div className="max-w-4xl mx-auto px-4 pb-12 w-full text-white">
                <button onClick={() => { setSelectedPost(null); trackEvent('back_to_blog'); }}
                  className="mb-6 flex items-center gap-2 text-sm font-semibold text-brand-accent hover:gap-4 transition-all uppercase tracking-widest">
                  <ArrowRight className="rotate-180" size={16} /> All Articles
                </button>
                <span className="bg-brand-primary/90 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 inline-block">
                  {selectedPost.category}
                </span>
                <h1 className="text-3xl md:text-5xl font-bold mb-5 leading-tight">{selectedPost.title}</h1>
                <div className="flex flex-wrap items-center gap-5 text-sm text-white/70">
                  <span className="flex items-center gap-2"><User size={14} /> {selectedPost.author}</span>
                  <span className="flex items-center gap-2"><Calendar size={14} /> {format(new Date(selectedPost.created_at), 'MMMM d, yyyy')}</span>
                  <span className="flex items-center gap-2"><Clock size={14} /> {selectedPost.read_time} min read</span>
                  <span className="flex items-center gap-2"><Eye size={14} /> {selectedPost.views.toLocaleString()} views</span>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-4 py-16">
            <div className="flex flex-col lg:flex-row gap-12">
              <article className="flex-grow min-w-0">
                <div className="markdown-body prose max-w-none">
                  <Markdown>{selectedPost.content}</Markdown>
                </div>

                <div className="mt-12 pt-8 border-t border-black/10">
                  <h3 className="font-bold text-brand-primary mb-4">Share this article</h3>
                  <div className="flex gap-3">
                    {[
                      { name: 'WhatsApp', color: 'bg-green-600', href: `https://wa.me/?text=${encodeURIComponent(selectedPost.title + ' - mySRZ')}` },
                      { name: 'Facebook', color: 'bg-blue-600', href: '#' },
                      { name: 'Twitter/X', color: 'bg-brand-primary', href: '#' },
                    ].map(({ name, color, href }) => (
                      <a key={name} href={href} target="_blank" rel="noopener noreferrer"
                        onClick={() => trackEvent('post_shared', { platform: name, post_id: selectedPost.id })}
                        className={`${color} text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all`}>
                        {name}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Related Posts */}
                <div className="mt-12">
                  <h3 className="font-bold text-brand-primary text-xl mb-6">More Articles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ALL_POSTS.filter(p => p.id !== selectedPost.id).slice(0, 4).map(post => (
                      <div key={post.id} className="flex gap-3 cursor-pointer group" onClick={() => handlePostClick(post)}>
                        <img src={post.image_url} alt={post.title} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-accent">{post.category}</span>
                          <h4 className="text-sm font-semibold text-stone-800 group-hover:text-brand-primary transition-colors line-clamp-2 mt-0.5">{post.title}</h4>
                          <span className="text-xs text-brand-primary/40">{post.read_time} min read</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </article>

              {/* Sidebar */}
              <aside className="lg:w-72 flex-shrink-0">
                <div className="sticky top-24 space-y-6">
                  {/* AI Insight */}
                  <div className="bg-brand-paper p-5 rounded-2xl border border-black/10">
                    <div className="flex items-center gap-2 mb-3 text-brand-primary">
                      <Sparkles size={18} />
                      <span className="text-xs font-bold uppercase tracking-widest">AI Travel Tip</span>
                    </div>
                    {aiInsight ? (
                      <p className="text-sm text-brand-primary/70 leading-relaxed italic">"{aiInsight}"</p>
                    ) : (
                      <>
                        <p className="text-xs text-brand-primary/50 mb-3">Get an AI-generated pro travel tip for this destination.</p>
                        <button onClick={() => {
                          setIsGeneratingInsight(true);
                          trackEvent('ai_insight_requested', { post_id: selectedPost.id });
                          setTimeout(() => {
                            setAiInsight(`Pro tip for ${selectedPost.title.split(':')[0]}: Visit during shoulder season (just before peak) for fewer crowds and better prices while still enjoying ideal weather conditions. Always book accommodation at least 2 weeks in advance.`);
                            setIsGeneratingInsight(false);
                          }, 1500);
                        }} disabled={isGeneratingInsight}
                          className="w-full bg-brand-primary text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-primary/90 transition-all flex items-center justify-center gap-2">
                          {isGeneratingInsight ? <><span className="animate-spin">⟳</span> Generating...</> : <><Sparkles size={12} /> Get Pro Tip</>}
                        </button>
                      </>
                    )}
                  </div>

                  {/* Contact CTA */}
                  <div className="bg-brand-primary text-white p-5 rounded-2xl">
                    <h4 className="font-bold text-lg mb-2">Plan This Trip</h4>
                    <p className="text-brand-primary/40 text-sm mb-4">Need help planning your visit? Contact us for personalized advice.</p>
                    <a href="tel:+923012432222" onClick={() => trackEvent('sidebar_call_clicked')}
                      className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-primary/90 transition-all mb-2 w-full justify-center">
                      <Phone size={14} /> Call Us Now
                    </a>
                    <a href="mailto:ahmadfraz009@gmail.com" onClick={() => trackEvent('sidebar_email_clicked')}
                      className="flex items-center gap-2 border border-white/10 text-white/70 px-4 py-2.5 rounded-xl text-sm font-bold hover:border-brand-accent transition-all w-full justify-center">
                      <Mail size={14} /> Email Us
                    </a>
                  </div>

                  {/* Contact info */}
                  <div className="bg-brand-paper p-5 rounded-2xl border border-brand-accent/20">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-brand-primary mb-3">Quick Contact</h4>
                    <div className="space-y-2 text-sm text-brand-primary/70">
                      <div className="flex items-center gap-2"><Phone size={13} className="text-brand-accent" /> +92 301 2432222</div>
                      <div className="flex items-center gap-2"><Mail size={13} className="text-brand-accent" /> ahmadfraz009@gmail.com</div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="bg-brand-primary text-white py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <span className="text-xs uppercase tracking-[0.3em] text-brand-accent font-bold">Travel Guides & Stories</span>
            <h1 className="text-5xl font-bold mt-3 mb-4">The Blog</h1>
            <p className="text-brand-primary/40 max-w-xl">In-depth travel guides, cultural insights, food discoveries, and adventure stories from across Pakistan.</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-10">
            <div className="flex items-center gap-2 border border-black/10 rounded-xl px-4 py-2 flex-grow max-w-sm bg-white">
              <Search size={16} className="text-brand-primary/40" />
              <input type="text" placeholder="Search articles..." defaultValue={searchQuery}
                onBlur={e => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm outline-none flex-grow placeholder:text-brand-primary/40" />
              {searchQuery && <button onClick={() => setSearchQuery('')}><X size={14} className="text-brand-primary/40" /></button>}
            </div>
            <div className="flex flex-wrap gap-2">
              {(['All', 'Adventure', 'Culture', 'Food', 'Nature'] as Category[]).map(cat => (
                <button key={cat} onClick={() => { setActiveCategory(cat); trackEvent('category_filter', { category: cat }); }}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                    activeCategory === cat ? "bg-brand-primary text-white" : "bg-brand-paper border border-black/10 text-brand-primary/70 hover:border-brand-accent"
                  )}>
                  {cat !== 'All' && categoryIcons[cat]} {cat}
                </button>
              ))}
            </div>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="text-center py-20 text-brand-primary/40">
              <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
              <p>No articles found. Try a different search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, idx) => (
                <motion.article key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }} whileHover={{ y: -4 }}
                  className="cursor-pointer group bg-brand-paper rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
                  onClick={() => handlePostClick(post)}>
                  <div className="relative h-52 overflow-hidden">
                    <img src={post.image_url} alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <span className="absolute top-3 left-3 bg-brand-paper/90 backdrop-blur text-[10px] font-bold uppercase tracking-widest text-brand-primary/80 px-2 py-1 rounded-full flex items-center gap-1">
                      {categoryIcons[post.category]} {post.category}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 text-xs text-brand-primary/40 mb-3">
                      <span className="flex items-center gap-1"><Calendar size={10} /> {format(new Date(post.created_at), 'MMM d, yyyy')}</span>
                      <span className="flex items-center gap-1"><Clock size={10} /> {post.read_time} min read</span>
                      <span className="flex items-center gap-1"><Eye size={10} /> {post.views.toLocaleString()}</span>
                    </div>
                    <h3 className="font-bold text-brand-primary leading-tight group-hover:text-brand-primary transition-colors mb-2 text-lg">{post.title}</h3>
                    <p className="text-brand-primary/50 text-sm line-clamp-2 leading-relaxed mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-brand-primary/40 flex items-center gap-1"><User size={10} /> {post.author}</span>
                      <span className="text-xs font-bold text-brand-primary flex items-center gap-1 group-hover:gap-2 transition-all">Read <ChevronRight size={12} /></span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── ABOUT PAGE ────────────────────────────────────────────────────────────
  const AboutPage = () => (
    <div>
      <div className="bg-brand-primary text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <span className="text-xs uppercase tracking-[0.3em] text-brand-accent font-bold">Our Story</span>
          <h1 className="text-5xl font-bold mt-3 mb-4">About mySRZ</h1>
          <p className="text-brand-primary/40 max-w-2xl text-lg">A passion project turned into Pakistan's trusted travel resource.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold text-brand-primary mb-6">Why We Started</h2>
            <div className="space-y-4 text-brand-primary/70 leading-relaxed">
              <p>Pakistan is one of the most stunning, culturally rich, and historically layered countries on Earth — yet it remains deeply underrepresented in mainstream travel media. We started mySRZ to change that.</p>
              <p>Our team has trekked to K2 base camp, eaten street food in every major city, slept under the stars in Deosai, and explored ruins that predate Rome. We share everything we've learned to help you travel Pakistan with confidence.</p>
              <p>Whether you're a Pakistani looking to explore your own incredible country, or an international visitor planning your first trip — we're here to be your trusted guide.</p>
            </div>
            <div className="mt-8 flex gap-4">
              <button onClick={() => navigate('contact')}
                className="bg-brand-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-brand-primary/90 transition-all">
                Get in Touch
              </button>
              <button onClick={() => navigate('blog')}
                className="border border-stone-300 text-brand-primary/80 px-6 py-3 rounded-xl font-bold text-sm hover:border-brand-accent transition-all">
                Read Our Blog
              </button>
            </div>
          </div>
          <div className="relative">
            <img src="https://picsum.photos/seed/pakistan-about/600/500" alt="Pakistan travel"
              className="w-full rounded-2xl shadow-xl object-cover" referrerPolicy="no-referrer" />
            <div className="absolute -bottom-6 -left-6 bg-brand-primary text-white p-5 rounded-2xl shadow-lg">
              <div className="text-3xl font-bold">5+</div>
              <div className="text-xs uppercase tracking-wider text-brand-accent/60">Years Exploring Pakistan</div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="bg-brand-paper rounded-3xl p-10 mb-16">
          <h2 className="text-3xl font-bold text-brand-primary mb-10 text-center">What We Stand For</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Heart, title: 'Authentic Coverage', desc: 'We write from real experience. Every destination we cover, we\'ve personally visited and vetted.' },
              { icon: Award, title: 'Responsible Travel', desc: 'We promote sustainable tourism that benefits local communities and preserves Pakistan\'s natural heritage.' },
              { icon: Users, title: 'Community First', desc: 'We connect travelers with local guides, guesthouses, and businesses — keeping tourism money in local hands.' },
            ].map(({ icon: Icon, title, desc }) => (
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

        {/* Team */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-brand-primary mb-10 text-center">The Team</h2>
          <div className="flex justify-center">
            <div className="text-center max-w-sm">
              <div className="w-32 h-32 bg-gradient-to-br from-emerald-400 to-emerald-700 rounded-full mx-auto mb-5 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                AF
              </div>
              <h3 className="text-xl font-bold text-brand-primary">Ahmad Fraz</h3>
              <p className="text-brand-primary font-semibold text-sm mb-3">Founder & Lead Writer</p>
              <p className="text-brand-primary/50 text-sm leading-relaxed mb-4">Travel writer and photographer who has explored over 40 destinations across Pakistan. Passionate about showing the world what this extraordinary country has to offer.</p>
              <div className="flex justify-center gap-3">
                <a href="tel:+923012432222" className="flex items-center gap-2 text-sm text-brand-primary/70 hover:text-brand-primary transition-colors">
                  <Phone size={14} /> +92 301 2432222
                </a>
                <a href="mailto:ahmadfraz009@gmail.com" className="flex items-center gap-2 text-sm text-brand-primary/70 hover:text-brand-primary transition-colors">
                  <Mail size={14} /> Email
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '50+', label: 'Destinations Covered' },
            { value: '100+', label: 'Articles Published' },
            { value: '10K+', label: 'Monthly Readers' },
            { value: '40+', label: 'Cities Visited' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center bg-brand-paper border border-black/5 rounded-2xl p-6 shadow-sm">
              <div className="text-4xl font-bold text-brand-primary mb-1">{value}</div>
              <div className="text-xs uppercase tracking-wider text-brand-primary/50 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── CONTACT PAGE ──────────────────────────────────────────────────────────
  const ContactPage = () => (
    <div>
      <div className="bg-brand-primary text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <span className="text-xs uppercase tracking-[0.3em] text-brand-accent font-bold">We'd Love to Hear From You</span>
          <h1 className="text-5xl font-bold mt-3 mb-4">Get in Touch</h1>
          <p className="text-brand-primary/40 max-w-xl text-lg">Planning a trip, have a question, or want to collaborate? Reach out — we typically respond within 24 hours.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-brand-paper rounded-2xl shadow-sm border border-black/5 p-8">
              <h2 className="text-2xl font-bold text-brand-primary mb-6">Send a Message</h2>

              {contactSent && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-brand-paper border border-brand-accent/30 rounded-xl p-4 mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-primary/90 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <div className="font-semibold text-emerald-800">Message sent successfully!</div>
                    <div className="text-sm text-brand-accent">We'll get back to you within 24 hours.</div>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-primary/50 mb-1.5">Full Name *</label>
                    <input type="text" required defaultValue={contactForm.name}
                      onBlur={e => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="Your full name"
                      className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-primary/50 mb-1.5">Email Address *</label>
                    <input type="email" required defaultValue={contactForm.email}
                      onBlur={e => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="your@email.com"
                      className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-primary/50 mb-1.5">Phone Number</label>
                    <input type="tel" defaultValue={contactForm.phone}
                      onBlur={e => setContactForm({ ...contactForm, phone: e.target.value })}
                      placeholder="+92 300 0000000"
                      className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-primary/50 mb-1.5">Subject *</label>
                    <select required defaultValue={contactForm.subject}
                      onBlur={e => setContactForm({ ...contactForm, subject: e.target.value })}
                      className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent bg-white focus:ring-1 focus:ring-brand-accent transition-all">
                      <option value="">Select a subject</option>
                      <option value="trip-planning">Trip Planning</option>
                      <option value="destination-query">Destination Query</option>
                      <option value="collaboration">Collaboration / Partnership</option>
                      <option value="guest-post">Guest Post Submission</option>
                      <option value="general">General Inquiry</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-primary/50 mb-1.5">Message *</label>
                  <textarea required defaultValue={contactForm.message}
                    onBlur={e => setContactForm({ ...contactForm, message: e.target.value })}
                    rows={6} placeholder="Tell us about your trip plans, questions, or anything else..."
                    className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent resize-none transition-all" />
                </div>
                <button type="submit"
                  className="w-full bg-brand-primary text-white py-4 rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-brand-primary/90 transition-all flex items-center justify-center gap-2">
                  <Send size={16} /> Send Message
                </button>
              </form>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-brand-primary text-white rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-5">Direct Contact</h3>
              <div className="space-y-4">
                <a href="tel:+923012432222" onClick={() => trackEvent('contact_phone_clicked')}
                  className="flex items-center gap-4 group">
                  <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-brand-primary/90 transition-all">
                    <Phone size={16} />
                  </div>
                  <div>
                    <div className="text-xs text-brand-primary/40 uppercase tracking-wider">Phone / WhatsApp</div>
                    <div className="font-semibold group-hover:text-brand-accent transition-colors">+92 301 2432222</div>
                  </div>
                </a>
                <a href="mailto:ahmadfraz009@gmail.com" onClick={() => trackEvent('contact_email_clicked')}
                  className="flex items-center gap-4 group">
                  <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-brand-primary/90 transition-all">
                    <Mail size={16} />
                  </div>
                  <div>
                    <div className="text-xs text-brand-primary/40 uppercase tracking-wider">Email</div>
                    <div className="font-semibold group-hover:text-brand-accent transition-colors break-all">ahmadfraz009@gmail.com</div>
                  </div>
                </a>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <div className="text-xs text-brand-primary/40 uppercase tracking-wider">Based In</div>
                    <div className="font-semibold">Pakistan</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock size={16} />
                  </div>
                  <div>
                    <div className="text-xs text-brand-primary/40 uppercase tracking-wider">Response Time</div>
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
              <a href="https://wa.me/923012432222" target="_blank" rel="noopener noreferrer"
                onClick={() => trackEvent('whatsapp_clicked')}
                className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-xl font-bold text-sm hover:bg-green-700 transition-all w-full">
                <MessageCircle size={16} /> Open WhatsApp Chat
              </a>
            </div>

            <div className="bg-brand-paper border border-black/5 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-brand-primary mb-3">We can help with</h3>
              <ul className="space-y-2 text-sm text-brand-primary/70">
                {[
                  'Trip planning & itineraries',
                  'Destination recommendations',
                  'Best time to visit',
                  'Budget travel tips',
                  'Photography spots',
                  'Local guide connections',
                  'Blog collaborations',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-brand-paper0 rounded-full flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-brand-paper">
      <NavBar />
      <main className="flex-grow">
        <AnimatePresence mode="wait" initial={false}>
          {currentPage === 'home' && <HomePage key="home" />}
          {currentPage === 'destinations' && <DestinationsPage key="destinations" />}
          {currentPage === 'blog' && <BlogPage key="blog" />}
          {currentPage === 'about' && <AboutPage key="about" />}
          {currentPage === 'contact' && <ContactPage key="contact" />}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
