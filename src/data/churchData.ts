import archive from './legacyArchive.json';

export interface Ministry {
  id: string;
  name: string;
  category: 'Fellowship' | 'Teaching & Discipleship' | 'Service & Operations' | 'Outreach & Care';
  leaderOrTeam?: string;
  description: string;
  iconName: string;
}

export interface Sermon {
  id: string;
  title: string;
  preacher: string;
  date: string;
  scripture: string;
  type: string;
  videoUrl?: string;
  audioDuration?: string;
  summary: string;
  content?: ArchiveBlock[];
  imageSrc?: string;
  audioUrl?: string;
  series?: string;
  sourceUrl?: string;
}

export interface ArchiveBlock {
  kind: string;
  text: string;
}

export interface Leader {
  name: string;
  role: string;
  section: 'Board / Pastor' | 'Board of Trustees' | 'Ministers';
  bio: string;
}

export interface Program {
  title: string;
  frequency: string;
  day: string;
  time: string;
  location: string;
  description: string;
  badge?: string;
}

export const CHURCH_INFO = {
  name: "RCCG Dominion Hope of Glory",
  acronym: "DHOG",
  denomination: "The Redeemed Christian Church of God",
  pastor: "Pastor Remi Afolabi",
  firstLady: "Deaconess Omowumi Afolabi",
  
  // Official published address per PDF content audit & RCCG North America parish listing
  officialParishAddress: "337 Avon Avenue, Newark, NJ 07108, United States",
  displayAddress: "337 Avon Avenue, Newark, NJ 07108",
  historicalMockupAddress: "31-39 Van Buren St, Newark, NJ 07105",
  cityStateZip: "Newark, NJ 07108",
  
  phone: "(973) 609-5858",
  directoryPhone: "(609) 744-7424",
  email: "admin@rccgdhog.org",
  
  // Social & Media
  youtubeUrl: "https://www.youtube.com/channel/UCbaf7qittz4vReSJfeJUiZA",
  facebookUrl: "https://www.facebook.com/DominionHopeOfGlory",
  liveStreamEmbedId: "UCbaf7qittz4vReSJfeJUiZA",
  
  // Giving channels verified in PDF
  giving: {
    smsText: "GIVE",
    smsNumber: "973-609-5858",
    zelleEmail: "dhopeofglory@gmail.com",
    onlinePortal: "https://rccgdhog.org/donate.html"
  },
  
  // Core mission and statement
  eyebrow: "THE REDEEMED CHRISTIAN CHURCH OF GOD",
  heroHeadingLine1: "Dominion",
  heroHeadingLine2: "Hope of Glory",
  tagline: "A place to worship God, grow in faith, discover purpose, and experience His glory.",
  
  aboutSummary: "RCCG Dominion Hope of Glory (DHOG) is a parish of The Redeemed Christian Church of God, committed to raising a people of faith, purpose, and impact for the glory of God.",
  
  visionStatement: "Raise Christ-centered disciples and leaders who demonstrate faith in everyday life, serve their neighbors and help others prepare for Christ's return.",
  
  coreValues: [
    "Word-based Biblical Teaching",
    "Fervent Prayer & Holy Ghost Revival",
    "Warm, Multicultural Fellowship",
    "Generational Discipleship & Youth Empowerment",
    "Loving Community Care & Compassion"
  ]
};

export const WEEKLY_PROGRAMS = archive.recurringPrograms as Program[];
export const MINISTRIES_CATALOG = archive.ministries as Ministry[];

export const SERMONS_ARCHIVE: Sermon[] = [
  {
    id: "sermon-1",
    title: "Keys to Accessing Your Miracle",
    preacher: "Pastor M. K. Daramola",
    date: "June 4, 2023",
    scripture: "Mark 2:2",
    type: "Sunday Service",
    summary: "Exploring how faith, desperate prayer, and persistence overcome every barrier to receive divine intervention."
  },
  {
    id: "sermon-2",
    title: "Benefit of His Presence",
    preacher: "Rev. Francis Adesola",
    date: "May 28, 2023",
    scripture: "Genesis 39:1–2",
    type: "Sunday Service",
    summary: "How God's presence turned Joseph's adversity into elevation, and why hosting the Holy Spirit is our highest treasure."
  },
  {
    id: "sermon-3",
    title: "Growing in His Presence",
    preacher: "Pastor Remi Afolabi",
    date: "May 7, 2023",
    scripture: "Psalm 84:7",
    type: "Sunday Service",
    summary: "Moving from strength to strength through personal altar devotion, humility, and steadfast communion with Christ."
  },
  {
    id: "sermon-4",
    title: "Praying in His Presence",
    preacher: "Minister Ayooluwa Ige",
    date: "May 3, 2023",
    scripture: "Psalm 16:11",
    type: "Bible Study",
    summary: "Understanding biblical intercession, prayers of alignment, and entering the secret place of answered petitions."
  },
  {
    id: "sermon-5",
    title: "The Dignity in Singlehood",
    preacher: "Pastor Remi Afolabi",
    date: "April 30, 2023",
    scripture: "Genesis 34:2",
    type: "Sunday Service",
    summary: "Cultivating wholeness, godly purpose, spiritual depth, and emotional maturity before entering marriage."
  },
  {
    id: "sermon-6",
    title: "What Shall I Do with Jesus",
    preacher: "Pastor Remi Afolabi",
    date: "April 30, 2023",
    scripture: "Matthew 27:22",
    type: "Sunday Service",
    summary: "Facing the pivotal question every soul must answer: surrender to Christ as Lord, or compromise with the world."
  },
  {
    id: "sermon-7",
    title: "A Transformed Life",
    preacher: "Pastor Remi Afolabi",
    date: "January 28, 2022",
    scripture: "2 Corinthians 3:18",
    type: "Bible Study",
    summary: "The mirror of God's Word transforming believers from one degree of glory to another by the Spirit of the Lord."
  },
  {
    id: "sermon-8",
    title: "True and False Repentance",
    preacher: "Pastor Remi Afolabi",
    date: "January 28, 2022",
    scripture: "2 Corinthians 7:10",
    type: "Bible Study",
    summary: "Examining godly sorrow that produces genuine repentance leading to salvation, versus worldly sorrow."
  },
  {
    id: "sermon-9",
    title: "Sodom Had No Bible",
    preacher: "Pastor Remi Afolabi",
    date: "January 28, 2022",
    scripture: "Hebrews 12:1–2",
    type: "Sunday Service",
    summary: "A solemn, urgent call to holy living and discipleship in a generation blessed with unprecedented access to God's Word."
  },
  {
    id: "sermon-10",
    title: "Unto a Perfect Man",
    preacher: "Pastor Remi Afolabi",
    date: "January 28, 2022",
    scripture: "Ephesians 4:11–16",
    type: "Sunday Service",
    summary: "Growing up in all things into Christ through the five-fold ministry gifts and mutual edification in the Body."
  },
  {
    id: "sermon-11",
    title: "Winning Together in Marriage",
    preacher: "Pastor Remi Afolabi",
    date: "December 4, 2022",
    scripture: "Ecclesiastes 4:12",
    type: "Special Meeting",
    summary: "Building an unbreakable threefold cord in Christian marriage through mutual honor, open communication, and shared prayer."
  },
  {
    id: "sermon-12",
    title: "Jesus is Coming Conference: Prepared for His Return",
    preacher: "Pastor Remi Afolabi",
    date: "October 12, 2022",
    scripture: "Philippians 3:17–21",
    type: "Conference",
    summary: "Living with eternity in view, watching and praying as citizens of heaven eagerly awaiting our Savior."
  }
];

export const CHURCH_LEADERSHIP: Leader[] = [
  {
    name: "Pastor Remi Afolabi",
    role: "Pastor in Charge",
    section: "Board / Pastor",
    bio: "Founding pastor called to pioneer Dominion Hope of Glory in September 2012. Born again in March 1990 and mission-trained, Pastor Remi emphasizes holiness, biblical discipleship, Holy Spirit revival, and practical Christian maturity."
  },
  {
    name: "Obiora Egbuna",
    role: "Board Chairman",
    section: "Board of Trustees",
    bio: "Provides strategic board governance, legal oversight, and pastoral counsel to advance the church's spiritual and community mission."
  },
  {
    name: "Toyin Beatrice Omidire",
    role: "Board Secretary",
    section: "Board of Trustees",
    bio: "Professional nursing background; passionately supports church governance, member welfare, health initiatives, and community wellbeing."
  },
  {
    name: "Victor Igbinovia",
    role: "Trustee Member",
    section: "Board of Trustees",
    bio: "Devoted leader with a deep heart for intercessory prayer, follow-up of converts, and family reconciliation."
  },
  {
    name: "Deaconess Omowumi Afolabi",
    role: "Trustee Member & Teens Ministry",
    section: "Board of Trustees",
    bio: "Co-laboring with Pastor Remi since inception, leading youth empowerment, campus mentorship, and spiritual formation."
  },
  {
    name: "Dcn. Adeyinka Fadehan",
    role: "Trustee Member & Evangelism Lead",
    section: "Board of Trustees",
    bio: "Leads church administrative operations, house fellowships, marital counseling initiatives, and open-air evangelism."
  },
  {
    name: "Minister Julia Egbuna",
    role: "Finance & Ministers' Affairs",
    section: "Ministers",
    bio: "Directs financial stewardship, transparency, accounting controls, and ministerial welfare support."
  },
  {
    name: "Deaconess Olubimpe Oyesanya",
    role: "Praise & Worship; Prayer Team",
    section: "Ministers",
    bio: "Ministers in worship leading, sacred choral music, and coordinating church-wide prayer vigils."
  },
  {
    name: "Pastor Adedeji Ibraheem",
    role: "Elders Fellowship & Transportation",
    section: "Ministers",
    bio: "Guides senior congregants and oversees church vans and commuter transportation logistics."
  },
  {
    name: "Pastor Taiwo Olulana",
    role: "Workers in Training & Men's Fellowship",
    section: "Ministers",
    bio: "Focuses on deep biblical exposition, discipleship training, and strengthening Christian brotherhood."
  },
  {
    name: "Deaconess Ebunoluwa Olulana",
    role: "Sanctuary Keeper & Community Impact",
    section: "Ministers",
    bio: "Directs temple hospitality, sanctuary beautification, food drives, and compassionate Newark outreach."
  },
  {
    name: "Minister Kolawole Afolabi",
    role: "Believers & Baptismal Class; Social Media",
    section: "Ministers",
    bio: "Oversees new believer orientation, digital streaming outreach, audio-visual engineering, and Sunday School teaching."
  },
  {
    name: "Minister Olawumi Oguntola",
    role: "Children & Women's Ministries",
    section: "Ministers",
    bio: "Passionate educator guiding children in Scripture memory, nursery care, and uplifting women's fellowship programs."
  }
];

export function programmeSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

