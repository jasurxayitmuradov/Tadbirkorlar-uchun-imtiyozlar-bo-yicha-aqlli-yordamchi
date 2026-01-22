// Backend contract (kelajak uchun):
// GET /api/courses
// GET /api/courses/:id
// GET /api/courses/:id/lessons/:lessonId
// POST /api/progress { courseId, lessonId, status, time }
export const coursesMock = [
  {
    id: 'real-001',
    title: 'Biznesni boshlash: birinchi qadamlar',
    description: "Tadbirkorlikni boshlash uchun asosiy qadamlar va amaliy tavsiyalar.",
    difficulty: 'beginner',
    tags: ['startap', 'asoslar'],
    isDemo: false,
    isPremium: false,
    coverType: 'gradient',
    totalDurationMin: 18,
    lessons: [
      {
        id: 'lesson-1',
        title: 'G‘oyadan amaliyotga: MVP haqida',
        summary: 'MVP nima va uni qanday tez boshlash mumkin.',
        durationMin: 18,
        isDemo: false,
        videoProvider: 'youtube',
        youtubeUrl: 'https://youtu.be/9-I3idsUrn4?si=WjNBGyg2fM6W0rhS',
        notes: [
          'MVP — minimal ishlaydigan mahsulot.',
          'Bozorga tez chiqish uchun muhim.',
          'Foydalanuvchi fikri asosida takomillashtiriladi.'
        ],
        quiz: [
          {
            q: 'MVP nimani anglatadi?',
            options: ['Minimal ishlaydigan mahsulot', 'Maksimal bozorli platforma', 'Marketing vositasi'],
            correctIndex: 0,
            explanation: 'MVP — Minimal Viable Product, ya’ni minimal ishlaydigan mahsulot.'
          },
          {
            q: 'MVPning asosiy maqsadi nima?',
            options: ['Tez feedback olish', 'Darhol maksimal foyda olish', 'Faqat reklama qilish'],
            correctIndex: 0,
            explanation: 'MVP bozorni sinash va tez feedback olish uchun yaratiladi.'
          }
        ],
        materials: [
          { label: 'MVP checklist (demo)', url: '#', isDemo: true }
        ],
        faq: [
          { q: 'MVP qachon kerak?', a: 'G‘oya tekshiruvi va tez feedback uchun.' }
        ]
      }
    ]
  },
  {
    id: 'demo-101',
    title: 'Soliq va hisobotlar',
    description: 'Soliq turlari, hisobot topshirish tartibi va tez-tez uchraydigan xatolar.',
    difficulty: 'intermediate',
    tags: ['soliq', 'hisobot'],
    isDemo: true,
    isPremium: true,
    coverType: 'gradient',
    totalDurationMin: 60,
    lessons: [
      {
        id: 'l1',
        title: 'Soliq turlari bo‘yicha umumiy ko‘rinish',
        summary: 'Asosiy soliq turlari va farqlari.',
        durationMin: 12,
        isDemo: true,
        videoProvider: 'none',
        notes: ['Soliq turlari (demo)', 'Kimga qaysi soliq turi mos'],
        quiz: [
          {
            q: 'Soliq rejimini tanlash nimaga bog‘liq?',
            options: ['Faoliyat turi va hajmiga', 'Faqat hududga', 'Faqat reklama byudjetiga'],
            correctIndex: 0,
            explanation: 'Soliq rejimi odatda faoliyat turi va hajmiga bog‘liq bo‘ladi.'
          }
        ],
        materials: [{ label: 'Demo material', url: '#', isDemo: true }],
        faq: [{ q: 'Qaysi soliq rejimi mos?', a: 'Faoliyat turiga bog‘liq (demo).' }]
      },
      {
        id: 'l2',
        title: 'Hisobot topshirish jarayoni',
        summary: 'Hisobotlarni tayyorlash va topshirish bosqichlari.',
        durationMin: 14,
        isDemo: true,
        videoProvider: 'none',
        notes: ['Hisobot turlari', 'Topshirish jadvali (demo)'],
        quiz: [
          {
            q: 'Hisobot topshirishda eng muhim narsa?',
            options: ['Hujjatlarni to‘liq tayyorlash', 'Faqat grafika chizish', 'Faqat og‘zaki xabar berish'],
            correctIndex: 0,
            explanation: 'Hisobotlar aniq va to‘liq bo‘lishi kerak.'
          }
        ],
        materials: [{ label: 'Hisobot shabloni (demo)', url: '#', isDemo: true }],
        faq: [{ q: 'Qachon topshiriladi?', a: 'Muddatlar hujjatga bog‘liq (demo).' }]
      },
      {
        id: 'l3',
        title: 'Xatolar va profilaktika',
        summary: 'Amaliy xatolar va ularni oldini olish.',
        durationMin: 10,
        isDemo: true,
        videoProvider: 'none',
        notes: ['Eng ko‘p uchraydigan xatolar', 'Oldini olish bo‘yicha maslahatlar'],
        quiz: [
          {
            q: 'Xatolarni kamaytirishning eng oddiy yo‘li?',
            options: ['Tekshiruv listi tuzish', 'Hujjatlarni kechiktirish', 'Hisobotni to‘ldirmaslik'],
            correctIndex: 0,
            explanation: 'Checklist xatolarni kamaytirishga yordam beradi.'
          }
        ],
        materials: [{ label: 'Checklist (demo)', url: '#', isDemo: true }],
        faq: [{ q: 'Xatolarni qanday kamaytiramiz?', a: 'Tekshiruv listi tuzing (demo).' }]
      }
    ]
  },
  {
    id: 'demo-102',
    title: 'Biznesni ro‘yxatdan o‘tkazish',
    description: 'YTT va MChJ ro‘yxatdan o‘tkazish bosqichlari.',
    difficulty: 'beginner',
    tags: ['ro‘yxat', 'yuridik'],
    isDemo: true,
    isPremium: false,
    coverType: 'gradient',
    totalDurationMin: 48,
    lessons: [
      {
        id: 'l1',
        title: 'Tashkiliy shaklni tanlash',
        summary: 'YTT yoki MChJ — farqlar va tanlov.',
        durationMin: 12,
        isDemo: true,
        videoProvider: 'none',
        notes: ['YTT va MChJ taqqoslash', 'Soddalashtirilgan mezonlar (demo)'],
        quiz: [
          {
            q: 'Tashkiliy shaklni tanlashda nima muhim?',
            options: ['Faoliyat ko‘lami va javobgarlik', 'Faqat nom', 'Faqat logotip'],
            correctIndex: 0,
            explanation: 'Tashkiliy shakl biznes ko‘lami va javobgarlikka bog‘liq.'
          }
        ],
        materials: [{ label: 'Taqqoslash jadvali (demo)', url: '#', isDemo: true }],
        faq: [{ q: 'Qaysi shakl tezroq?', a: 'Talablar farq qiladi (demo).' }]
      },
      {
        id: 'l2',
        title: 'Hujjatlar to‘plami',
        summary: 'Kerak bo‘ladigan asosiy hujjatlar.',
        durationMin: 14,
        isDemo: true,
        videoProvider: 'none',
        notes: ['Ariza', 'Ro‘yxatdan o‘tish ma’lumotlari (demo)'],
        quiz: [
          {
            q: 'Hujjatlar to‘plami nima uchun kerak?',
            options: ['Arizani asoslash uchun', 'Faqat rasm uchun', 'Faqat reklama uchun'],
            correctIndex: 0,
            explanation: 'Hujjatlar ariza va qaror uchun asos bo‘ladi.'
          }
        ],
        materials: [{ label: 'Hujjatlar ro‘yxati (demo)', url: '#', isDemo: true }],
        faq: [{ q: 'Hujjatlar yetishmasa?', a: 'Qo‘shimcha ma’lumot so‘raladi (demo).' }]
      },
      {
        id: 'l3',
        title: 'Ariza topshirish',
        summary: 'Portal orqali topshirish bosqichlari.',
        durationMin: 10,
        isDemo: true,
        videoProvider: 'none',
        notes: ['Portalga kirish', 'Arizani yuborish (demo)'],
        quiz: [
          {
            q: 'Ariza qayerga topshiriladi?',
            options: ['Portal orqali', 'Faqat telefon orqali', 'Faqat og‘zaki'],
            correctIndex: 0,
            explanation: 'MVP’da ariza portal yoki vakolatli organ orqali yuboriladi.'
          }
        ],
        materials: [{ label: 'Portal yo‘riqnomasi (demo)', url: '#', isDemo: true }],
        faq: [{ q: 'Qancha vaqt ketadi?', a: 'Muddat hujjatga bog‘liq (demo).' }]
      }
    ]
  },
  {
    id: 'demo-103',
    title: 'Grant va subsidiya',
    description: 'Grantlar va subsidiyalar uchun tayyorgarlik.',
    difficulty: 'intermediate',
    tags: ['grant', 'subsidiya'],
    isDemo: true,
    isPremium: true,
    coverType: 'gradient',
    totalDurationMin: 72,
    lessons: [
      {
        id: 'l1',
        title: 'Moslik mezonlari',
        summary: 'Kimlar ariza topshira oladi.',
        durationMin: 12,
        isDemo: true,
        videoProvider: 'none',
        notes: ['Mezonlar (demo)', 'Hudud/soha talablari'],
        quiz: [
          {
            q: 'Moslik mezonlari nima uchun kerak?',
            options: ['Kimlar ariza bera olishini aniqlash', 'Faqat brending uchun', 'Faqat dizayn uchun'],
            correctIndex: 0,
            explanation: 'Mezonlar moslikni aniqlash uchun ishlatiladi.'
          }
        ],
        materials: [{ label: 'Mezonlar ro‘yxati (demo)', url: '#', isDemo: true }],
        faq: [{ q: 'Moslik qanday tekshiriladi?', a: 'Rasmiy mezonlarga qarab (demo).' }]
      },
      {
        id: 'l2',
        title: 'Biznes reja va hisob-kitob',
        summary: 'Ariza uchun zarur asosiy bo‘limlar.',
        durationMin: 20,
        isDemo: true,
        videoProvider: 'none',
        notes: ['Biznes reja tuzilmasi', 'Moliyaviy hisob (demo)'],
        quiz: [
          {
            q: 'Biznes reja nimani ko‘rsatadi?',
            options: ['Maqsad va resurslar taqsimoti', 'Faqat logotip', 'Faqat shior'],
            correctIndex: 0,
            explanation: 'Biznes reja maqsad va resurslarni ko‘rsatadi.'
          }
        ],
        materials: [{ label: 'Biznes reja shabloni (demo)', url: '#', isDemo: true }],
        faq: [{ q: 'Qaysi ko‘rsatkichlar kerak?', a: 'Dastur talablari bo‘yicha (demo).' }]
      },
      {
        id: 'l3',
        title: 'Ariza topshirish va monitoring',
        summary: 'Ariza topshirishdan keyingi bosqichlar.',
        durationMin: 14,
        isDemo: true,
        videoProvider: 'none',
        notes: ['Monitoring talablari', 'Hisobot tartibi (demo)'],
        quiz: [
          {
            q: 'Monitoring nima uchun kerak?',
            options: ['Jarayonni kuzatish va natijani baholash', 'Faqat reklama', 'Faqat rasmiyatchilik'],
            correctIndex: 0,
            explanation: 'Monitoring natijani baholash va nazorat qilish uchun kerak.'
          }
        ],
        materials: [{ label: 'Monitoring checklist (demo)', url: '#', isDemo: true }],
        faq: [{ q: 'Hisobot talab qilinadimi?', a: 'Dastur shartiga bog‘liq (demo).' }]
      }
    ]
  },
  {
    id: 'demo-104',
    title: 'Marketing asoslari',
    description: 'Mijoz topish va marketing reja tuzish.',
    difficulty: 'beginner',
    tags: ['marketing', 'sotuv'],
    isDemo: true,
    isPremium: false,
    coverType: 'gradient',
    totalDurationMin: 54,
    lessons: [
      {
        id: 'l1',
        title: 'Maqsadli auditoriya',
        summary: 'Mijoz segmentlarini aniqlash.',
        durationMin: 12,
        isDemo: true,
        videoProvider: 'none',
        notes: ['Mijoz profili', 'Segmentatsiya (demo)'],
        quiz: [
          {
            q: 'Maqsadli auditoriya nima?',
            options: ['Sizning asosiy mijoz segmentingiz', 'Barcha internet foydalanuvchilari', 'Faqat raqobatchilar'],
            correctIndex: 0,
            explanation: 'Maqsadli auditoriya — asosiy mijoz segmenti.'
          }
        ],
        materials: [{ label: 'Auditoriya shabloni (demo)', url: '#', isDemo: true }],
        faq: [{ q: 'Segmentlar qanday tanlanadi?', a: 'Bozor tahliliga qarab (demo).' }]
      },
      {
        id: 'l2',
        title: 'Kanal va kontent',
        summary: 'Marketing kanallarini tanlash.',
        durationMin: 16,
        isDemo: true,
        videoProvider: 'none',
        notes: ['Kanal turlari', 'Kontent rejasi (demo)'],
        quiz: [
          {
            q: 'Marketing kanali tanlashda nima muhim?',
            options: ['Auditoriya qaerda ekanligi', 'Faqat narx', 'Faqat trend'],
            correctIndex: 0,
            explanation: 'Kanal tanlovi auditoriya joylashuviga bog‘liq.'
          }
        ],
        materials: [{ label: 'Kontent reja (demo)', url: '#', isDemo: true }],
        faq: [{ q: 'Qaysi kanal samarali?', a: 'Auditoriyaga bog‘liq (demo).' }]
      },
      {
        id: 'l3',
        title: 'Sotuv voronkasi',
        summary: 'Leaddan sotuvgacha bosqichlar.',
        durationMin: 14,
        isDemo: true,
        videoProvider: 'none',
        notes: ['Voronka bosqichlari', 'Konversiya (demo)'],
        quiz: [
          {
            q: 'Sotuv voronkasi nimani bildiradi?',
            options: ['Mijoz yo‘lini bosqichma-bosqich ko‘rsatadi', 'Faqat sotuv narxi', 'Faqat reklama matni'],
            correctIndex: 0,
            explanation: 'Voronka mijoz yo‘lini bosqichma-bosqich ko‘rsatadi.'
          }
        ],
        materials: [{ label: 'Voronka shabloni (demo)', url: '#', isDemo: true }],
        faq: [{ q: 'Konversiya qanday oshiriladi?', a: 'Test va optimizatsiya (demo).' }]
      }
    ]
  }
];
