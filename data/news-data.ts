import { v4 as uuidv4 } from 'uuid';

export const newsItems = [
  {
    id: uuidv4(),
    category: 'PRODUKTE',
    title: 'HOW TO BRING VEO 2 VIDEOS TO LIFE WITH ELEVENLABS VOICEOVERS AND SOUND EFFECTS',
    description: 'This article explores how to use ElevenLabs\' AI voiceovers and sound effects to enhance Google\'s Veo 2 photorealistic videos, creating truly immersive viewing experiences.',
    date: '7. Mai 2025',
    image: '/images/news/veo-neon.jpg',
    authorName: 'Ryan Morrison',
    authorRole: 'Growth',
    authorImage: '/images/avatars/ryan.jpg',
    href: '/blog/veo-2-videos-elevenlabs'
  },
  {
    id: uuidv4(),
    category: 'UNTERNEHMEN',
    title: 'EINFÜHRUNG DER EUROPÄISCHEN DATENRESIDENZ',
    description: 'Entwickeln Sie mit den führenden KI-Audio-Modellen, in voller Übereinstimmung mit den lokalen Anforderungen an die Datensouveränität',
    date: '2. Mai 2025',
    image: '/images/news/data-residency.jpg',
    authorName: 'Jane Doe',
    authorRole: 'Legal',
    authorImage: '/images/avatars/jane.jpg',
    href: '/blog/european-data-residency'
  },
  {
    id: uuidv4(),
    category: 'PRODUKTE',
    title: 'SOUNDEFFEKTE SIND JETZT IN STUDIO VERFÜGBAR',
    description: 'Entdecken Sie unsere neue Sammlung von KI-generierten Soundeffekten für Ihre Projekte und Produktionen.',
    date: '1. Mai 2025',
    image: '/images/news/sfx-studio.jpg',
    authorName: 'James McAulay',
    authorRole: 'Growth',
    authorImage: '/images/avatars/james.jpg',
    href: '/blog/sound-effects-studio'
  }
]; 