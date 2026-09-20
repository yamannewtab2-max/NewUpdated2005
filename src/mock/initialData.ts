import { Student, TrackingGroup, PaymentRecord, Mahja, Room } from '../types';

export const initialMahjas: Mahja[] = [
  {
    id: 'mahja-26',
    name: 'Mahja 26',
    description: 'Mahja 26 complex',
    createdAt: new Date().toISOString(),
  },
];

export const initialRooms: Room[] = [
  {
    id: 'room-26-1',
    mahjaId: 'mahja-26',
    name: 'Room 1',
    description: 'Ground floor',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'room-26-2',
    mahjaId: 'mahja-26',
    name: 'Room 2',
    description: 'Ground floor',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'room-26-3',
    mahjaId: 'mahja-26',
    name: 'Room 3',
    description: 'Ground floor',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'room-26-4',
    mahjaId: 'mahja-26',
    name: 'Room 4',
    description: 'Floor 2',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'room-26-5',
    mahjaId: 'mahja-26',
    name: 'Room 5',
    description: 'Floor 2',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'room-26-6',
    mahjaId: 'mahja-26',
    name: 'Room 6',
    description: 'Floor 2',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'room-26-7',
    mahjaId: 'mahja-26',
    name: 'Room 7',
    description: 'Floor 3',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'room-26-8',
    mahjaId: 'mahja-26',
    name: 'Room 8',
    description: 'Floor 3',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'room-26-9',
    mahjaId: 'mahja-26',
    name: 'Room 9',
    description: 'Floor 3',
    createdAt: new Date().toISOString(),
  },
];

export const initialStudents: Student[] = [
  // Room 1
  {
    id: 'std-26-1-1',
    name: 'محمد عماد الدين',
    level: 'Level 3',
    mahjaId: 'mahja-26',
    roomId: 'room-26-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'std-26-1-2',
    name: 'أحمد علوي',
    level: 'Level 3',
    mahjaId: 'mahja-26',
    roomId: 'room-26-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'std-26-1-3',
    name: 'بخاري مسلم',
    level: 'Level 4',
    mahjaId: 'mahja-26',
    roomId: 'room-26-1',
    createdAt: new Date().toISOString(),
  },

  // Room 2
  {
    id: 'std-26-2-1',
    name: 'عزمي زياد الرفق',
    level: 'Level 2',
    mahjaId: 'mahja-26',
    roomId: 'room-26-2',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'std-26-2-2',
    name: 'حفيظ الخير',
    level: 'Level 2',
    mahjaId: 'mahja-26',
    roomId: 'room-26-2',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'std-26-2-3',
    name: 'مفتاح الحافظ',
    level: 'Level 2',
    mahjaId: 'mahja-26',
    roomId: 'room-26-2',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'std-26-2-4',
    name: 'سوكما ويسنو أجي',
    level: 'Level 3',
    mahjaId: 'mahja-26',
    roomId: 'room-26-2',
    createdAt: new Date().toISOString(),
  },

  // Room 3
  {
    id: 'std-26-3-1',
    name: 'نسائي',
    level: 'Level 2',
    mahjaId: 'mahja-26',
    roomId: 'room-26-3',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'std-26-3-2',
    name: 'أحمد قارئ مزكي',
    level: 'Level 3',
    mahjaId: 'mahja-26',
    roomId: 'room-26-3',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'std-26-3-3',
    name: 'ملطوف أبراري',
    level: 'Level 3',
    mahjaId: 'mahja-26',
    roomId: 'room-26-3',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'std-26-3-4',
    name: 'أولو الفضل',
    level: 'Level 4',
    mahjaId: 'mahja-26',
    roomId: 'room-26-3',
    createdAt: new Date().toISOString(),
  },

  // Room 4
  {
    id: 'std-26-4-1',
    name: 'يا نوار فوروا كارينا',
    level: 'Level 2',
    mahjaId: 'mahja-26',
    roomId: 'room-26-4',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'std-26-4-2',
    name: 'أوفى ربي محمد',
    level: 'Level 2',
    mahjaId: 'mahja-26',
    roomId: 'room-26-4',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'std-26-4-3',
    name: 'محمد توفيق النجا',
    level: 'Level 2',
    mahjaId: 'mahja-26',
    roomId: 'room-26-4',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'std-26-4-4',
    name: 'محمد الرضا فرمان مستقيم',
    level: 'Level 3',
    mahjaId: 'mahja-26',
    roomId: 'room-26-4',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'std-26-4-5',
    name: 'محمد رجال مصطفى',
    level: 'Level 3',
    mahjaId: 'mahja-26',
    roomId: 'room-26-4',
    createdAt: new Date().toISOString(),
  },

  // Room 5
  {
    id: 'std-26-5-1',
    name: 'محمد فاي معتصم',
    level: 'Level 2',
    mahjaId: 'mahja-26',
    roomId: 'room-26-5',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'std-26-5-2',
    name: 'محمد كفى الكفافي',
    level: 'Level 2',
    mahjaId: 'mahja-26',
    roomId: 'room-26-5',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'std-26-5-3',
    name: 'محمد هيكل بن إسماعيل',
    level: 'Level 2',
    mahjaId: 'mahja-26',
    roomId: 'room-26-5',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'std-26-5-4',
    name: 'سلمان فانج ليسن',
    level: 'Level 3',
    mahjaId: 'mahja-26',
    roomId: 'room-26-5',
    createdAt: new Date().toISOString(),
  },

  // Room 6
  {
    id: 'std-26-6-1',
    name: 'ألدي إحزى ماهيندرا',
    level: 'Level 2',
    mahjaId: 'mahja-26',
    roomId: 'room-26-6',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'std-26-6-2',
    name: 'ريزي أديتيا فراتما',
    level: 'Level 2',
    mahjaId: 'mahja-26',
    roomId: 'room-26-6',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'std-26-6-3',
    name: 'دينا أريا رمضاني',
    level: 'Level 2',
    mahjaId: 'mahja-26',
    roomId: 'room-26-6',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'std-26-6-4',
    name: 'أحمد غوماردي',
    level: 'Level 3',
    mahjaId: 'mahja-26',
    roomId: 'room-26-6',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'std-26-6-5',
    name: 'محمد الهدار',
    level: 'Level 4',
    mahjaId: 'mahja-26',
    roomId: 'room-26-6',
    createdAt: new Date().toISOString(),
  },

  // Room 7
  {
    id: 'std-26-7-1',
    name: 'حفني مبارك',
    level: 'Level 2',
    mahjaId: 'mahja-26',
    roomId: 'room-26-7',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'std-26-7-2',
    name: 'محمد صابر إسها',
    level: 'Level 3',
    mahjaId: 'mahja-26',
    roomId: 'room-26-7',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'std-26-7-3',
    name: 'محمد الحق النازل',
    level: 'Level 3',
    mahjaId: 'mahja-26',
    roomId: 'room-26-7',
    createdAt: new Date().toISOString(),
  },

  // Room 8
  {
    id: 'std-26-8-1',
    name: 'محمد فوزان',
    level: 'Level Unknown',
    mahjaId: 'mahja-26',
    roomId: 'room-26-8',
    createdAt: new Date().toISOString(),
  },

  // Room 9
  {
    id: 'std-26-9-1',
    name: 'إرشاد العباد',
    level: 'Level 2',
    mahjaId: 'mahja-26',
    roomId: 'room-26-9',
    createdAt: new Date().toISOString(),
  },
];

export const initialGroups: TrackingGroup[] = [];

export const initialPayments: PaymentRecord[] = [];


