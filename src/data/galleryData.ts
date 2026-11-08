export interface GalleryItem {
  id: string;
  title: string;
  category: 'worship' | 'fellowship' | 'youth-teens' | 'events' | 'community';
  categoryLabel: string;
  imageSrc: string;
  date?: string;
  description: string;
  scripture?: string;
  featured?: boolean;
}

export const GALLERY_CATEGORIES = [
  { id: 'all', label: 'All Photos' },
  { id: 'worship', label: 'Sunday Worship & Choir' },
  { id: 'fellowship', label: 'Men & Women Fellowships' },
  { id: 'youth-teens', label: 'Teens & Young Adults' },
  { id: 'events', label: 'Conferences & Vigils' },
  { id: 'community', label: 'Couples & Community Care' },
] as const;

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'g-worship-1',
    title: 'Glorious Sunday Celebration',
    category: 'worship',
    categoryLabel: 'Sunday Worship',
    imageSrc: '/assets/gallery/SUNDAY-SERVICE.jpg',
    date: 'Sunday Worship Service',
    description: 'Congregation lifting hands in adoration during our Sunday morning praise and worship encounter.',
    scripture: 'Psalm 100:4',
    featured: true
  },
  {
    id: 'g-choir-1',
    title: 'Voices of Dominion Choir',
    category: 'worship',
    categoryLabel: 'Sunday Worship',
    imageSrc: '/assets/gallery/Choir2.jpg',
    date: 'Worship Ministry',
    description: 'The church choir ministering anointed gospel praise and hymns that usher in God’s presence.',
    scripture: '2 Chronicles 5:13',
    featured: true
  },
  {
    id: 'g-couples-1',
    title: 'Community Couples Dinner & Fellowship',
    category: 'community',
    categoryLabel: 'Couples & Community Care',
    imageSrc: '/assets/gallery/Couples-Dinner.jpg',
    date: 'Annual Marriage Celebration',
    description: 'Strengthening godly marriages, covenant relationships, and building loving homes in Christ.',
    scripture: 'Ecclesiastes 4:12',
    featured: true
  },
  {
    id: 'g-teens-1',
    title: 'Teens & Parents Connect',
    category: 'youth-teens',
    categoryLabel: 'Teens & Young Adults',
    imageSrc: '/assets/gallery/TEENS-PARENTS-CONNECT-Copy.jpg',
    date: 'Youth & Family Forum',
    description: 'Bridging generational communication, biblical parenting wisdom, and equipping kingdom teenagers.',
    scripture: 'Proverbs 22:6',
    featured: true
  },
  {
    id: 'g-house-fellowship-1',
    title: 'House Fellowship Network',
    category: 'fellowship',
    categoryLabel: 'Men & Women Fellowships',
    imageSrc: '/assets/gallery/HOUSE-FELLOWSHIP-New-Now.jpg',
    date: 'Weekly Neighborhood Centers',
    description: 'Intimate home fellowships across Newark and neighboring New Jersey townships for discipleship and communion.',
    scripture: 'Acts 2:46',
    featured: true
  },
  {
    id: 'g-men-1',
    title: 'Kingdom Men Fellowship',
    category: 'fellowship',
    categoryLabel: 'Men & Women Fellowships',
    imageSrc: '/assets/gallery/Kingdom-Men-Fellowship.jpg',
    date: 'Men of Honor',
    description: 'Brothers standing together in prayer, leadership, fatherhood, and marketplace impact.',
    scripture: '1 Corinthians 16:13',
    featured: true
  },
  {
    id: 'g-women-1',
    title: 'Good Women Fellowship & Ministry',
    category: 'fellowship',
    categoryLabel: 'Men & Women Fellowships',
    imageSrc: '/assets/gallery/Kingdom-Women-Ministry.jpg',
    date: 'Virtuous Daughters of Zion',
    description: 'Sisters gathering to pray, mentor, encourage one another, and build godly families.',
    scripture: 'Proverbs 31:25-26',
    featured: true
  },
  {
    id: 'g-youth-1',
    title: 'Kingdom Youths in Worship',
    category: 'youth-teens',
    categoryLabel: 'Teens & Young Adults',
    imageSrc: '/assets/gallery/Kingdom-Youths.jpg',
    date: 'Ignited Generation',
    description: 'Young adults discovering divine purpose, academic excellence, career boldness, and holy passion.',
    scripture: '1 Timothy 4:12',
    featured: true
  },
  {
    id: 'g-teens-2',
    title: 'Dominion Teens Ministry',
    category: 'youth-teens',
    categoryLabel: 'Teens & Young Adults',
    imageSrc: '/assets/gallery/Kingdom-Teens.jpg',
    date: 'Teens Fellowship',
    description: 'Engaging, faith-filled environment where teenagers learn God’s word and grow in peer discipleship.',
    scripture: 'Ecclesiastes 12:1'
  },
  {
    id: 'g-teens-3',
    title: 'Teens Discipleship Class',
    category: 'youth-teens',
    categoryLabel: 'Teens & Young Adults',
    imageSrc: '/assets/gallery/Kingdom-Teens2.jpg',
    date: 'Discipleship Session',
    description: 'Interactive bible study and mentorship session equipping teens with foundational biblical truth.',
    scripture: 'Psalm 119:9'
  },
  {
    id: 'g-events-1',
    title: 'Night of Glory & Miracle Vigil',
    category: 'events',
    categoryLabel: 'Conferences & Vigils',
    imageSrc: '/assets/site/NIGHT-OF-GLORY-FLYER.jpg',
    date: 'Special Monthly Holy Ghost Vigil',
    description: 'Overnight supernatural prayer encounter with prophetic ministration, deliverance, and praise.',
    scripture: 'Acts 16:25-26',
    featured: true
  },
  {
    id: 'g-fellowship-women-2',
    title: 'Women of Purpose Conference',
    category: 'fellowship',
    categoryLabel: 'Men & Women Fellowships',
    imageSrc: '/assets/gallery/Women-1.jpg',
    date: 'Annual Women’s Gathering',
    description: 'Empowering women through faith, sisterhood, career encouragement, and fervent prayer.',
    scripture: 'Luke 1:45'
  },
  {
    id: 'g-fellowship-women-3',
    title: 'Mothers in Zion Celebration',
    category: 'fellowship',
    categoryLabel: 'Men & Women Fellowships',
    imageSrc: '/assets/gallery/Women2.jpg',
    date: 'Fellowship Day',
    description: 'Joyful smiles and communion among sisters in the house of the Lord.',
    scripture: 'Psalm 113:9'
  },
  {
    id: 'g-event-gathering',
    title: 'Holy Convocation & Praise Festival',
    category: 'events',
    categoryLabel: 'Conferences & Vigils',
    imageSrc: '/assets/gallery/Event2.jpg',
    date: 'Church Anniversary Celebration',
    description: 'Celebrating God’s goodness and expansion across Essex County, NJ.',
    scripture: 'Psalm 126:3'
  },
  {
    id: 'g-sunday-2',
    title: 'Celebration of God’s Word',
    category: 'worship',
    categoryLabel: 'Sunday Worship',
    imageSrc: '/assets/gallery/sunday_service.jpg',
    date: 'Sunday Morning',
    description: 'Fellowship in the sanctuary as members listen attentively to the preaching of the Word.',
    scripture: 'Romans 10:17'
  },
  {
    id: 'g-teens-connect',
    title: 'Youth Mentorship & Leadership',
    category: 'youth-teens',
    categoryLabel: 'Teens & Young Adults',
    imageSrc: '/assets/gallery/Teens.jpg',
    date: 'Mentorship Workshop',
    description: 'Encouraging youth to lead with godly character, integrity, and faith.',
    scripture: 'Joshua 1:9'
  },
  {
    id: 'g-memory-2024-1',
    title: 'Annual Thanksgiving Feast',
    category: 'community',
    categoryLabel: 'Couples & Community Care',
    imageSrc: '/assets/gallery/IMG-20240907-WA0010.jpg',
    date: 'Church Family Day',
    description: 'Brethren breaking bread together in unity and thankfulness after service.',
    scripture: 'Acts 2:46'
  },
  {
    id: 'g-memory-2024-2',
    title: 'Special Anointing Service',
    category: 'events',
    categoryLabel: 'Conferences & Vigils',
    imageSrc: '/assets/gallery/IMG-20240919-WA0008.jpg',
    date: 'Midweek Communion Service',
    description: 'Setting hearts apart for supernatural breakthrough and holy living.',
    scripture: 'Isaiah 10:27'
  },
  {
    id: 'g-memory-2024-3',
    title: 'Workers in the Vineyard',
    category: 'worship',
    categoryLabel: 'Sunday Worship',
    imageSrc: '/assets/gallery/IMG-20240925-WA0001.jpg',
    date: 'Workers Sanctuary Assembly',
    description: 'Ministers and department stewards dedicating their talents to God.',
    scripture: 'Colossians 3:23'
  },
  {
    id: 'g-memory-2024-4',
    title: 'Children’s Church & Presentation',
    category: 'community',
    categoryLabel: 'Couples & Community Care',
    imageSrc: '/assets/site/children.jpg',
    date: 'Children’s Ministry',
    description: 'Instilling the love of Jesus into the hearts of our young champions.',
    scripture: 'Matthew 19:14'
  },
  {
    id: 'g-memory-2023-1',
    title: 'Cross-Over Watchnight Service',
    category: 'events',
    categoryLabel: 'Conferences & Vigils',
    imageSrc: '/assets/gallery/IMG-20230109-WA0006.jpg',
    date: 'New Year Vigil',
    description: 'Entering the new year in intense prayers, praise, and prophetic declarations.',
    scripture: 'Isaiah 43:19'
  },
  {
    id: 'g-memory-2023-2',
    title: 'Intercessory Prayer Meeting',
    category: 'worship',
    categoryLabel: 'Sunday Worship',
    imageSrc: '/assets/site/prayer.jpg',
    date: 'Hour of Divine Mercy',
    description: 'Standing in the gap for Newark, New Jersey, the United States, and nations of the earth.',
    scripture: '1 Timothy 2:1'
  },
  {
    id: 'g-memory-2023-3',
    title: 'Digging Deep Bible Exposition',
    category: 'worship',
    categoryLabel: 'Sunday Worship',
    imageSrc: '/assets/site/Bible-study-edited.jpg',
    date: 'Wednesday Bible Study',
    description: 'Systematic study of the holy scriptures for doctrinal soundness and Christian maturity.',
    scripture: '2 Timothy 2:15'
  },
  {
    id: 'g-memory-welcome',
    title: 'Welcoming Newcomers to Church',
    category: 'community',
    categoryLabel: 'Couples & Community Care',
    imageSrc: '/assets/site/RCCG-DHOG-WELCOME-TO-CHURCH.jpg',
    date: 'Hospitality & Ushering',
    description: 'A warm smile and a loving embrace for every guest that walks through our sanctuary doors.',
    scripture: 'Hebrews 13:2'
  }
];
