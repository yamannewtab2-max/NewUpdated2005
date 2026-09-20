/**
 * Real roster of the dormitory (المهجع) — transcribed from "أصحاب المهجع.pdf",
 * STAI Imam Syafii Cianjur. Mahjas 26–31, rooms 1–9 each.
 *
 * The year column of the PDF is the student's level; students printed with the
 * letter "ت" belong to the new intake and are stored as level 0.
 * Rooms listed in the PDF as "غرفة المشرف" (supervisor room) have no students.
 */
import type { Mahja, Room, Student } from '../types';
import { levelLabel } from '../utils/level';

export interface RosterStudent {
  name: string;
  level: number;
}

export interface RosterRoom {
  room: number;
  students: RosterStudent[];
}

export interface RosterMahja {
  mahja: number;
  rooms: RosterRoom[];
}

export const ALMAHJA_ROSTER: RosterMahja[] = [
  {
    mahja: 26,
    rooms: [
      { room: 1, students: [
        { name: 'نجاري مسلم', level: 4 },
        { name: 'أحمد علوي', level: 3 },
        { name: 'محمد عماد الدين', level: 3 },
        { name: 'أوف ري محمد', level: 2 },
      ] },
      { room: 2, students: [
        { name: 'أولو الفضل', level: 4 },
        { name: 'أحمد قارئ مزكي', level: 3 },
        { name: 'سوكما ويسنو أجي', level: 2 },
        { name: 'حفيظ الخير', level: 2 },
      ] },
      { room: 3, students: [
        { name: 'مطلوف أبراري', level: 3 },
        { name: 'نسائي', level: 3 },
        { name: 'مفتاح الحافظ', level: 2 },
        { name: 'عزمي زياد الرفق', level: 2 },
      ] },
      { room: 4, students: [
        { name: 'محمد رجال مصطفى', level: 3 },
        { name: 'محمد الرضا فرمان مستقيم', level: 3 },
        { name: 'محمد توفيق النجا', level: 2 },
        { name: 'إي انوار فوروا كارينا', level: 2 },
      ] },
      { room: 5, students: [
        { name: 'سلمان فانج ليسن', level: 3 },
        { name: 'محمد هيكل بن إسماعيل', level: 2 },
        { name: 'محمد كفى الكفافي', level: 2 },
        { name: 'محمد فاي معتصم', level: 2 },
      ] },
      { room: 6, students: [
        { name: 'محمد الهذّار', level: 4 },
        { name: 'أحمد غومردي', level: 3 },
        { name: 'محمد عزّ الوافي', level: 3 },
        { name: 'إرشاد العباد', level: 2 },
      ] },
      { room: 7, students: [
        { name: 'محمد فوزان', level: 3 },
        { name: 'محمد الحق النازل', level: 3 },
        { name: 'محمد صابر إسها', level: 3 },
        { name: 'حفي مبارك', level: 2 },
      ] },
      { room: 8, students: [] }, // غرفة المشرف
      { room: 9, students: [
        { name: 'نزيل جمدي', level: 4 },
        { name: 'ديتا أريا رمضاني', level: 2 },
        { name: 'ريزي أديتيا فراما', level: 2 },
        { name: 'ألدي إحزا ماهيندرا', level: 2 },
      ] },
    ],
  },
  {
    mahja: 27,
    rooms: [
      { room: 1, students: [] }, // غرفة المشرف
      { room: 2, students: [
        { name: 'جيلانج أجناي', level: 3 },
        { name: 'عبد المعز', level: 3 },
        { name: 'شوال الدين', level: 2 },
        { name: 'أحمد فيصل أنصاري', level: 2 },
      ] },
      { room: 3, students: [
        { name: 'عبد الله الحق', level: 4 },
        { name: 'عبد المطلب', level: 2 },
        { name: 'إرحام مالك فوزان', level: 2 },
        { name: 'فرحان صفا مروة', level: 2 },
      ] },
      { room: 4, students: [
        { name: 'محمد فخر الريحان', level: 4 },
        { name: 'محمد الفياض', level: 3 },
        { name: 'نظام الدين', level: 3 },
        { name: 'يحيى حنيف يحيى', level: 2 },
      ] },
      { room: 5, students: [
        { name: 'علمان نافع النور', level: 4 },
        { name: 'محمد ذات الكهف', level: 3 },
        { name: 'فيرستيو أفنديتو', level: 3 },
        { name: 'فائز زهير تقي', level: 2 },
      ] },
      { room: 6, students: [
        { name: 'أسعد همام', level: 3 },
        { name: 'حنيف صفوان رشيق', level: 3 },
        { name: 'محمد تقيب', level: 3 },
        { name: 'محمد فاطر رزقي مولنا', level: 2 },
      ] },
      { room: 7, students: [
        { name: 'زوائد الخير', level: 4 },
        { name: 'محمد محفوظ زبير', level: 3 },
        { name: 'محمد بحر العلوم', level: 2 },
        { name: 'محمد برهان الدين', level: 2 },
      ] },
      { room: 8, students: [
        { name: 'أحمد فارس', level: 4 },
        { name: 'محمد رزقي برتا', level: 3 },
        { name: 'محمد أكمل', level: 3 },
        { name: 'حنيف ريحان رحيم', level: 2 },
      ] },
      { room: 9, students: [
        { name: 'محمد أدريان شاه', level: 3 },
        { name: 'فردوس ليل الرحمن', level: 3 },
        { name: 'محمد رفعان ذكران', level: 2 },
        { name: 'محمد حيدر الدينوري', level: 2 },
      ] },
    ],
  },
  {
    mahja: 28,
    rooms: [
      { room: 1, students: [
        { name: 'نبيل الحكيم', level: 2 },
        { name: 'أحمد فجر هداية', level: 2 },
        { name: 'عبد الله شهداين نور', level: 1 },
      ] },
      { room: 2, students: [
        { name: 'هداية طاين علام شاه', level: 1 },
        { name: 'إرشاد فتح', level: 1 },
        { name: 'محمد الرفيع الخير', level: 1 },
        { name: 'محمد فاضل مديح عثماني', level: 1 },
      ] },
      { room: 3, students: [
        { name: 'داوود شريف', level: 1 },
        { name: 'محمد فخر الأمم', level: 1 },
        { name: 'أحمد غفران مولانا', level: 1 },
        { name: 'أحمد داني عارفين', level: 1 },
      ] },
      { room: 4, students: [
        { name: 'عزيز مولانا', level: 1 },
        { name: 'محمد التاكي', level: 1 },
        { name: 'أحمد عبد العزيز', level: 1 },
        { name: 'محمد بخاري', level: 1 },
      ] },
      { room: 5, students: [
        { name: 'ديفاين ريحانديكا', level: 1 },
        { name: 'عكاشة عبد الجبار', level: 1 },
        { name: 'أحمد الغفاري', level: 1 },
        { name: 'محمد نور الإيمان', level: 1 },
      ] },
      { room: 6, students: [
        { name: 'عصام الدين أحمد', level: 3 },
        { name: 'محمد حلمي الفارسي', level: 3 },
        { name: 'سويي أندرسون', level: 1 },
        { name: 'معصوم الفؤاد', level: 1 },
      ] },
      { room: 7, students: [] }, // غرفة المشرف
      { room: 8, students: [
        { name: 'ديراج لالك فيلحان محمد', level: 1 },
        { name: 'مخلص', level: 1 },
        { name: 'أحار خليلي', level: 1 },
        { name: 'توفيق سيتيو بودي', level: 1 },
      ] },
      { room: 9, students: [
        { name: 'أحمد نافع', level: 4 },
        { name: 'إيان مليادين', level: 4 },
        { name: 'محمد الحافظ كلمي', level: 1 },
      ] },
    ],
  },
  {
    mahja: 29,
    rooms: [
      { room: 1, students: [
        { name: 'عيدروس فدعق', level: 2 },
        { name: 'أغنوج أدريانشا', level: 2 },
        { name: 'عبد الله', level: 1 },
        { name: 'محمد أديب سلوك النجا', level: 1 },
      ] },
      { room: 2, students: [
        { name: 'أحمد مرشد محداً', level: 1 },
        { name: 'محمد زياد تقوى', level: 1 },
        { name: 'عفوان المرتضى', level: 1 },
        { name: 'ظلال رمضان', level: 1 },
      ] },
      { room: 3, students: [
        { name: 'إخلاص يواناندا بوترا', level: 3 },
        { name: 'محمد ربيع بيهقي', level: 3 },
        { name: 'أحمد عبد الخالق محمد', level: 1 },
      ] },
      { room: 4, students: [
        { name: 'محمد ريف مشكور رمضان', level: 1 },
        { name: 'يسير يابن شوقي', level: 1 },
        { name: 'معمر ديفا فراسنيا', level: 1 },
        { name: 'محمد شاتور رينديكا', level: 1 },
      ] },
      { room: 5, students: [
        { name: 'زمرودي حسن', level: 1 },
        { name: 'محمد أرضن السماء', level: 1 },
        { name: 'عرفة دسوقي ممتاز خي', level: 1 },
        { name: 'نور فوزان الإحسان', level: 1 },
      ] },
      { room: 6, students: [
        { name: 'محمد ابن عقيل', level: 1 },
        { name: 'تقي عبد الحي', level: 1 },
        { name: 'عبد العزيز', level: 1 },
        { name: 'محمد غازي نوفل', level: 1 },
      ] },
      { room: 7, students: [] }, // غرفة المشرف
      { room: 8, students: [
        { name: 'أحمد فقهي وحيو عارف', level: 1 },
        { name: 'شهر الرمضان', level: 1 },
        { name: 'عبد الرحيم', level: 1 },
        { name: 'نوفل أزكى', level: 1 },
      ] },
      { room: 9, students: [
        { name: 'عليك نعمة المولى', level: 4 },
        { name: 'رفلي الرشيد', level: 4 },
        { name: 'شهاب رملي', level: 1 },
        { name: 'محمد ألون الفؤاد', level: 1 },
      ] },
    ],
  },
  {
    mahja: 30,
    rooms: [
      { room: 1, students: [
        { name: 'أحمد رزقي فضل الرحمن', level: 0 },
        { name: 'بلال أحمد توفيق', level: 0 },
        { name: 'أحمد غازي سيف الحق', level: 0 },
        { name: 'خيرومي همرازي', level: 0 },
      ] },
      { room: 2, students: [
        { name: 'أحمد سيف الدين حليم', level: 4 },
        { name: 'عبد الزكي', level: 4 },
        { name: 'محمد رزق لوبيس', level: 0 },
        { name: 'محمد حافظ الفرقان', level: 0 },
      ] },
      { room: 3, students: [
        { name: 'جانكي داوسات حزة', level: 0 },
        { name: 'محمد ريحان عطاء الله', level: 0 },
        { name: 'روبرتا خير الورى', level: 0 },
        { name: 'سلمان محمد فارس', level: 0 },
      ] },
      { room: 4, students: [
        { name: 'دافا موخّد', level: 0 },
        { name: 'فتح الله محمد رشاد', level: 0 },
        { name: 'محمد ألفان ماجد الأبراري', level: 0 },
        { name: 'إسجانا ماهيندرا', level: 0 },
      ] },
      { room: 5, students: [
        { name: 'محمد زكي عالم السعدني', level: 0 },
        { name: 'محمد فارس أغوس هداية الله', level: 0 },
        { name: 'أحمد فخري الغفاري', level: 0 },
        { name: 'محمد ناظر الرحمن', level: 0 },
      ] },
      { room: 6, students: [
        { name: 'محمد توفيق إحسان', level: 0 },
        { name: 'محمد حلمان رمضاني', level: 0 },
        { name: 'زلفان أفريزندي', level: 0 },
        { name: 'محمد يحي عبد الملك فردوس', level: 0 },
      ] },
      { room: 7, students: [
        { name: 'محمد علي ألزم', level: 0 },
        { name: 'محمد ضياء الرحمن', level: 0 },
        { name: 'محمد لطفي فوزان', level: 0 },
        { name: 'محمد', level: 0 },
      ] },
      { room: 8, students: [
        { name: 'مولانا عبد الله فقيه', level: 0 },
        { name: 'محمد أندري', level: 0 },
        { name: 'ساتيا مادا أبيمانوي', level: 0 },
      ] },
      { room: 9, students: [
        { name: 'غاتين أديت سولونج', level: 2 },
        { name: 'محمد خليل علوي', level: 2 },
        { name: 'فهميزار', level: 0 },
        { name: 'حلمان الصديقي', level: 0 },
      ] },
    ],
  },
  {
    mahja: 31,
    rooms: [
      { room: 1, students: [
        { name: 'سيد عبد الله', level: 0 },
        { name: 'بينا سلام من استوى', level: 0 },
        { name: 'دافا ذكي سامري', level: 0 },
        { name: 'محمد إرحام مولودي', level: 0 },
      ] },
      { room: 2, students: [
        { name: 'أحمد لواء الصديقي', level: 2 },
        { name: 'إسماعيل فخر الرازي', level: 0 },
        { name: 'دمياس مولانا إثبات', level: 2 },
        { name: 'محمد صميداء', level: 0 },
      ] },
      { room: 3, students: [
        { name: 'محمد نجاحي فوزي', level: 0 },
        { name: 'أحمد إرحام مولدا', level: 0 },
        { name: 'نوفل ديراي', level: 0 },
        { name: 'محمد فوائد', level: 0 },
      ] },
      { room: 4, students: [
        { name: 'عارف فيزمانشاه', level: 0 },
        { name: 'محمد عمر الفاروق', level: 0 },
        { name: 'عبد الله عزي', level: 0 },
      ] },
      { room: 5, students: [
        { name: 'محمد زكريا', level: 0 },
        { name: 'هاشم العيدروس', level: 0 },
        { name: 'حبيب محمد عبد الرزاق', level: 0 },
        { name: 'محب الرضا', level: 0 },
      ] },
      { room: 6, students: [
        { name: 'فارس ناصر الدين العبقري', level: 0 },
        { name: 'محمد زيران نور فتح العارفين', level: 0 },
        { name: 'محمد روشن فكري', level: 0 },
        { name: 'أحمد رفيق عزيز', level: 0 },
      ] },
      { room: 7, students: [
        { name: 'محمد فايل', level: 0 },
        { name: 'أحمد نوفل زمرمي', level: 0 },
        { name: 'حنيف مسلم', level: 0 },
        { name: 'محمود', level: 0 },
      ] },
      { room: 8, students: [
        { name: 'محمد مبيج مقداد', level: 0 },
        { name: 'سهلاان أمر الله', level: 0 },
        { name: 'حيدر فاضل', level: 0 },
        { name: 'ويلدان ويجاكسونو', level: 0 },
      ] },
      { room: 9, students: [
        { name: 'محمد خليل', level: 4 },
        { name: 'معتصم بالله', level: 4 },
        { name: 'محمد أحسن العمل الأمين', level: 0 },
        { name: 'سيد محمد أنيس', level: 0 },
      ] },
    ],
  },
];

/** One-time import: mahjas → rooms → students with stable ids. */
export const buildRosterSeed = () => {
  const mahjas: Mahja[] = [];
  const rooms: Room[] = [];
  const students: Student[] = [];
  const now = new Date().toISOString();
  ALMAHJA_ROSTER.forEach((m) => {
    const mahjaId = `mahja-${m.mahja}`;
    mahjas.push({
      id: mahjaId,
      name: `المهجع ${m.mahja}`,
      description: undefined,
      createdAt: now,
    });
    m.rooms.forEach((r) => {
      const roomId = `room-${m.mahja}-${r.room}`;
      rooms.push({ id: roomId, name: `Room ${r.room}`, mahjaId: mahjaId, createdAt: now });
      r.students.forEach((s, i) => {
        students.push({
          id: `student-${m.mahja}-${r.room}-${i + 1}`,
          name: s.name,
          level: levelLabel(s.level) as string,
          mahjaId: mahjaId,
          roomId: roomId,
          createdAt: now,
        });
      });
    });
  });
  return { mahjas, rooms, students };
};
