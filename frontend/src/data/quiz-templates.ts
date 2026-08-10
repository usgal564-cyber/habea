export interface QuizQuestion {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correct: number; // 0=A, 1=B, 2=C, 3=D
}

export interface QuizTemplate {
  id: string;
  backendId?: string; // DB-ийн quiz_id (UUID)
  title: string;
  description: string;
  duration: number;
  passingScore: number; // 0-100 хувь
  icon: string;
  category: string;
  questions: QuizQuestion[];
}

// ═══════════════════════════════════════════════════════════
// СОРIL — Т práctica soril
// ═══════════════════════════════════════════════════════════

// Гал түймэр, анхны тусламж — 45 асуулт
const quiz1Questions: QuizQuestion[] = [
  { question: "1 + 1 = ?", optionA: "1", optionB: "2", optionC: "3", optionD: "4", correct: 1 },
  { question: "2 + 2 = ?", optionA: "2", optionB: "4", optionC: "6", optionD: "8", correct: 1 },
  { question: "3 + 3 = ?", optionA: "3", optionB: "6", optionC: "9", optionD: "12", correct: 1 },
  { question: "Ажилтан аюулгүй байх хэрэгтэй юу?", optionA: "Үгүй", optionB: "Тийм", optionC: "Магадгүй", optionD: "Мэдэхгүй", correct: 1 },
  { question: "Хамгаалах хэрэгсэл өмсөх нь аюулгүй байдлыг нэмэгдүүлдэг үү?", optionA: "Үгүй", optionB: "Тийм", optionC: "Магадгүй", optionD: "Мэдэхгүй", correct: 1 },
  { question: "Гал гарахад юу хийх хэрэгтэй вэ?", optionA: "Зугаалах", optionB: "Унтраах", optionC: "Хараах", optionD: "Бодоох", correct: 1 },
  { question: "Ус уух нь эрүүл мэндэд ач тусаа өгдөг үү?", optionA: "Үгүй", optionB: "Тийм", optionC: "Магадгүй", optionD: "Мэдэхгүй", correct: 1 },
  { question: "Ажлын байрнаас гарахдаа гэрэл асааж байх нь зөв үү?", optionA: "Үгүй", optionB: "Тийм", optionC: "Магадгүй", optionD: "Мэдэхгүй", correct: 1 },
  { question: "Аюулгүй ажиллагаа нь ажилтанд ач тусаа өгдөг үү?", optionA: "Үгүй", optionB: "Тийм", optionC: "Магадгүй", optionD: "Мэдэхгүй", correct: 1 },
  { question: "Дотор нүүр үзэгч өмсөх нь аюулгүй байдлыг хангадаг уу?", optionA: "Үгүй", optionB: "Тийм", optionC: "Магадгүй", optionD: "Мэдэхгүй", correct: 1 },
  { question: "5 + 5 = ?", optionA: "5", optionB: "10", optionC: "15", optionD: "20", correct: 1 },
  { question: "4 + 3 = ?", optionA: "5", optionB: "6", optionC: "7", optionD: "8", correct: 2 },
  { question: "Ажил олгогч нь ажилтны эрүүл мэндийг хамгаалах үүрэгтэй юу?", optionA: "Үгүй", optionB: "Тийм", optionC: "Магадгүй", optionD: "Мэдэхгүй", correct: 1 },
  { question: "Осол тохиолдохоос сэргийлэх боломжтой юу?", optionA: "Үгүй", optionB: "Тийм", optionC: "Магадгүй", optionD: "Мэдэхгүй", correct: 1 },
  { question: "Сургалтанд хамрагдах нь ач тусаа өгдөг үү?", optionA: "Үгүй", optionB: "Тийм", optionC: "Магадгүй", optionD: "Мэдэхгүй", correct: 1 },
  { question: "8 - 3 = ?", optionA: "3", optionB: "4", optionC: "5", optionD: "6", correct: 2 },
  { question: "Ажлын байр цэвэр байвал аюулгүй уу?", optionA: "Магадгүй", optionB: "Тийм", optionC: "Үгүй", optionD: "Мэдэхгүй", correct: 1 },
  { question: "6 + 2 = ?", optionA: "6", optionB: "7", optionC: "8", optionD: "9", correct: 2 },
  { question: "Гар утас ашиглахдаа анхаарч байх хэрэгтэй юу?", optionA: "Үгүй", optionB: "Тийм", optionC: "Магадгүй", optionD: "Мэдэхгүй", correct: 1 },
  { question: "Ажилтан өөрийн аюулгүй байдлаар хариуцна уу?", optionA: "Үгүй", optionB: "Тийм", optionC: "Магадгүй", optionD: "Мэдэхгүй", correct: 1 },
  { question: "ХАБЭА гэдэг нь юуны товчлол вэ?", optionA: "Хүний аюулгүй байдал, эрүүл ахуй", optionB: "Хөдөлмөрийн аюулгүй байдал, эрүүл ахуй", optionC: "Хөдөлмөрийн академи, боловсрол", optionD: "Хот ажиллаж байгаа эрүүл ахуй", correct: 1 },
  { question: "Ажил олгогчийн үндсэн үүрэг юу вэ?", optionA: "Ажилтны цалинг төлөх", optionB: "Ажилтны аюулгүй байдлыг хангах", optionC: "Ажилтны амралт зохион байгуулах", optionD: "Шинэ тоног төхөөрөмж авах", correct: 1 },
  { question: "Ажлын байранд хамгаалах хэрэгслээс бүүрээ хэрэглэх ёстойг хэлэх нь:", optionA: "Ангилал", optionB: "Заалт", optionC: "Стандарт", optionD: "Дүрэм", correct: 1 },
  { question: "Ажилтны хувийн хамгаалах хэрэгслийг хэн хангадаг вэ?", optionA: "Дээд байгууллага", optionB: "Үйлдвэр", optionC: "Ажилтан өөрөө", optionD: "ХАБЭА алба", correct: 2 },
  { question: "Ажлын байранд гарсан осолд эхлээд юу хийх ёстой вэ?", optionA: "Ажилаа үргэлжлүүлэх", optionB: "Аюулгүй газар луу шилжих", optionC: "Гар утсаа авах", optionD: "Бусаддаа дуугарах", correct: 1 },
  { question: "Хамгаалах хэрэгсэл өмсөх үүрэг хэн дээр байдаг вэ?", optionA: "Ажилтан", optionB: "Ажил олгогч", optionC: "Удирдлагын хүн", optionD: "ХАБЭА алба", correct: 1 },
  { question: "Ажлын байранд хамгийн түгээмэл осол юу вэ?", optionA: "Унадаг зүйл", optionB: "Мэдээлэл", optionC: "Зугаа", optionD: "Суралцах", correct: 0 },
  { question: "Аюулгүй байдалын дүрэм зохиох хэрэгтэй юу?", optionA: "Тийм", optionB: "Үгүй", optionC: "Магадгүй", optionD: "Мэдэхгүй", correct: 0 },
  { question: "Гал унтраах саванг хаана байрлуулах вэ?", optionA: "Хаалганы ард", optionB: "Тод харагдах газар", optionC: "Шkaarд зүйлсний ард", optionD: "Дэвсгэр доор", correct: 1 },
  { question: "Ажлын байранд ундлага хийх ёстой уу?", optionA: "Үгүй", optionB: "Тийм, тухтайн цаг", optionC: "Байнгын", optionD: "Зөвхөн өдөр", correct: 1 },
  { question: "Анхны тусламж үзүүлэхийн тулд юу сурах хэрэгтэй вэ?", optionA: "Ус хийх", optionB: "НОХ хийх", optionC: "Хоол уух", optionD: "Ярих", correct: 1 },
  { question: "Ажлын байранд гаралт үйлдэх үед юу хийх вэ?", optionA: "Түүнийг зогсоох", optionB: "Дараагийн ажилдаа", optionC: "Ярих", optionD: "Хэлэх", correct: 0 },
  { question: "Ажлын байрны аюулгүй байдалын сургалт жилд хэдэн удаа явагдана?", optionA: "1", optionB: "2", optionC: "0", optionD: "Хамаагүй", correct: 0 },
  { question: "Ажилтан ажлын байрны дүрмийг дагах ёстой уу?", optionA: "Үгүй", optionB: "Тийм", optionC: "Зөвхөн 5өдөр", optionD: "Заримдаа", correct: 1 },
  { question: "Ажлын байрны эрсдэл гэж юу вэ?", optionA: "Аюул осол", optionB: "Амралт", optionC: "Цалин", optionD: "Ажлын цаг", correct: 0 },
  { question: "Ажлын байранд хийгээд гарах үед юу өмсөх ёстой вэ?", optionA: "Хамгаалах хэрэгсэл", optionB: "Уран загвар", optionC: "Спортын", optionD: "Энгийн", correct: 0 },
  { question: "Хамгаалах хэрэгслийг хэрэглэх зааварчилгааг хэн бичдэг вэ?", optionA: "Ажилтан", optionB: "Ажил олгогч", optionC: "Засгийн газар", optionD: "Сургууль", correct: 1 },
  { question: "Ажлын байранд осол гардаг боловсруулах үйлдэл юу вэ?", optionA: "Шууд үргэлжлүүлэх", optionB: "Аюулгүй газар луу шилжих", optionC: "Ярих", optionD: "Хүлээх", correct: 1 },
  { question: "Гал түймрийн үед юу хийх вэ?", optionA: "Гал руу очих", optionB: "Эвакуаци хийх", optionC: "Зогсох", optionD: "Утсаар ярих", correct: 1 },
  { question: "Ажил олгогч юуны тул ажилтныг сургадаг вэ?", optionA: "Ажлын байрны аюулгүй байдал", optionB: "Спорт", optionC: "Дугуй", optionD: "Тоглоом", correct: 0 },
  { question: "Ажлын байранд дуу чимээ хязгаарлагдсан уу?", optionA: "Үгүй", optionB: "Тийм", optionC: "Магадгүй", optionD: "Мэдэхгүй", correct: 1 },
  { question: "Ажилтны эрүүл мэндийн үзлэг хийдэг үү?", optionA: "Үгүй", optionB: "Тийм", optionC: "Магадгүй", optionD: "Зөвхөн өвчтэй үед", correct: 1 },
  { question: "Ажлын байранд химикийн бодис хэрэглэх үед юу зөвшөөрөгдсөн вэ?", optionA: "Хэрэглэхгүй", optionB: "Маск өмсөх", optionC: "Бүүрээ хэрэглэх", optionD: "Амархан", correct: 1 },
  { question: "ХАБЭА сургалт ямар зорилготой вэ?", optionA: "Ажилтныг сургах", optionB: "Ажлын байрны аюулгүй байдлыг дээшлүүлэх", optionC: "Зугаацуулах", optionD: "Мөнгө олгох", correct: 1 },
  { question: "Ажлын байранд хэрэгслийг хэрхэн хадгалах вэ?", optionA: "Таазанд", optionB: "Зааварт заасан байрлалд", optionC: "Хаалганы ард", optionD: "Дэвсгэр дээр", correct: 1 },
];

// Ажлын байрны эрүүл мэнд — 45 асуулт
const quiz2Questions: QuizQuestion[] = [
  { question: "Гал унтраагч хэрэглэх нь гал түймрийг унтраахад тусалдаг уу?", optionA: "Үгүй", optionB: "Тийм", optionC: "Магадгүй", optionD: "Мэдэхгүй", correct: 1 },
  { question: "1 + 1 = ?", optionA: "1", optionB: "2", optionC: "3", optionD: "4", correct: 1 },
  { question: "2 + 3 = ?", optionA: "3", optionB: "4", optionC: "5", optionD: "6", correct: 2 },
  { question: "Гал авалтын сэрүүлгээр мэдэгдэл сонсвол юу хийх вэ?", optionA: "Хараах", optionB: "Зугаалах", optionC: "Хурдан зугтах", optionD: "Бодоох", correct: 2 },
  { question: "Гал түймэрээс урьдчилан сэргийлэх боломжтой юу?", optionA: "Үгүй", optionB: "Тийм", optionC: "Магадгүй", optionD: "Мэдэхгүй", correct: 1 },
  { question: "4 + 4 = ?", optionA: "6", optionB: "7", optionC: "8", optionD: "9", correct: 2 },
  { question: "Гарны утааны хор уушуулалттай уу?", optionA: "Үгүй", optionB: "Тийм", optionC: "Магадгүй", optionD: "Мэдэхгүй", correct: 1 },
  { question: "Аюултай бодис хадгалахдаа анхаарах хэрэгтэй юу?", optionA: "Үгүй", optionB: "Тийм", optionC: "Магадгүй", optionD: "Мэдэхгүй", correct: 1 },
  { question: "5 + 3 = ?", optionA: "6", optionB: "7", optionC: "8", optionD: "9", correct: 2 },
  { question: "Цахилгаан утас засахдаа гал түймрийн аюултай юу?", optionA: "Үгүй", optionB: "Тийм", optionC: "Магадгүй", optionD: "Мэдэхгүй", correct: 1 },
  { question: "Эвакуацийн гарах замыг мэдэх нь чухал уу?", optionA: "Үгүй", optionB: "Тийм", optionC: "Магадгүй", optionD: "Мэдэхгүй", correct: 1 },
  { question: "7 - 2 = ?", optionA: "3", optionB: "4", optionC: "5", optionD: "6", correct: 2 },
  { question: "Гал таталтаар хиймэл дасгал хийх нь зөв үү?", optionA: "Үгүй", optionB: "Тийм", optionC: "Магадгүй", optionD: "Мэдэхгүй", correct: 1 },
  { question: "6 + 6 = ?", optionA: "10", optionB: "11", optionC: "12", optionD: "13", correct: 2 },
  { question: "Ус гал унтраахад ашигладаг уу?", optionA: "Үгүй", optionB: "Тийм", optionC: "Магадгүй", optionD: "Мэдэхгүй", correct: 1 },
  { question: "9 - 4 = ?", optionA: "3", optionB: "4", optionC: "5", optionD: "6", correct: 2 },
  { question: "Ажлын байр талбай цэвэр байвал гал түймрийн аюул багасдаг уу?", optionA: "Үгүй", optionB: "Тийм", optionC: "Магадгүй", optionD: "Мэдэхгүй", correct: 1 },
  { question: "3 + 7 = ?", optionA: "8", optionB: "9", optionC: "10", optionD: "11", correct: 2 },
  { question: "Гал түймрийн үед цахилгаан татах хэрэгтэй юу?", optionA: "Үгүй", optionB: "Тийм", optionC: "Магадгүй", optionD: "Мэдэхгүй", correct: 1 },
  { question: "8 + 2 = ?", optionA: "8", optionB: "9", optionC: "10", optionD: "11", correct: 2 },
  { question: "Гал унтраахад хамгийн түгээмэл ашигладаг уусгагч нь:", optionA: "Ус", optionB: "Шороон уусгалт", optionC: "Хий уусгалт", optionD: "ABC уусгагч", correct: 2 },
  { question: "Гал түймрийн анхны уусгагч юу вэ?", optionA: "Усан цахилгаан уусгагч", optionB: "Даавуу уусгагч", optionC: "Хий уусгагч", optionD: "ABC уусгагч", correct: 1 },
  { question: "Гал түймрийн үед эвакуацийн зам дээр юу хийх хэрэгтэй вэ?", optionA: "Гэрэлтүүдийг асаах", optionB: "Эд зүйлсээ татаж авах", optionC: "Замыг цэвэрлэх, тэмдэглэх", optionD: "Хаалгаа түгжих", correct: 2 },
  { question: "Гал түймрийн эрсдэл бүхий газар гэж юуныг хэлэх вэ?", optionA: "Хэвтээ газар", optionB: "Шатах боломжтой бодис хадгалсан газар", optionC: "Цонхтой өрөө", optionD: "Усан сан", correct: 1 },
  { question: "Гал түймэрт гарсан үед утсаар юу хийх вэ?", optionA: "Галын мэдээлэл өгөх", optionB: "Нөхцөл байдлыг тайлагнах", optionC: "Гал унтраах албад руу залгах", optionD: "Дээрх бүгд", correct: 3 },
  { question: "Хамгаалах хэрэгсэл өмсөх үүрэг хэн дээр байдаг вэ?", optionA: "Ажилтан", optionB: "Ажил олгогч", optionC: "Удирдлагын хүн", optionD: "ХАБЭА алба", correct: 1 },
  { question: "Ажлын байранд хамгийн түгээмэл осол юу вэ?", optionA: "Унадаг зүйл", optionB: "Мэдээлэл", optionC: "Зугаа", optionD: "Суралцах", correct: 0 },
  { question: "Аюулгүй байдалын дүрэм зохиох хэрэгтэй юу?", optionA: "Тийм", optionB: "Үгүй", optionC: "Магадгүй", optionD: "Мэдэхгүй", correct: 0 },
  { question: "Гал унтраах саванг хаана байрлуулах вэ?", optionA: "Хаалганы ард", optionB: "Тод харагдах газар", optionC: "Шkaarд зүйлсний ард", optionD: "Дэвсгэр доор", correct: 1 },
  { question: "Ажлын байранд ундлага хийх ёстой уу?", optionA: "Үгүй", optionB: "Тийм, тухтайн цаг", optionC: "Байнгын", optionD: "Зөвхөн өдөр", correct: 1 },
  { question: "Анхны тусламж үзүүлэхийн тулд юу сурах хэрэгтэй вэ?", optionA: "Ус хийх", optionB: "НОХ хийх", optionC: "Хоол уух", optionD: "Ярих", correct: 1 },
  { question: "Ажлын байранд гаралт үйлдэх үед юу хийх вэ?", optionA: "Түүнийг зогсоох", optionB: "Дараагийн ажилдаа", optionC: "Ярих", optionD: "Хэлэх", correct: 0 },
  { question: "Ажлын байрны аюулгүй байдалын сургалт жилд хэдэн удаа явагдана?", optionA: "1", optionB: "2", optionC: "0", optionD: "Хамаагүй", correct: 0 },
  { question: "Ажилтан ажлын байрны дүрмийг дагах ёстой уу?", optionA: "Үгүй", optionB: "Тийм", optionC: "Зөвхөн 5өдөр", optionD: "Заримдаа", correct: 1 },
  { question: "Ажлын байрны эрсдэл гэж юу вэ?", optionA: "Аюул осол", optionB: "Амралт", optionC: "Цалин", optionD: "Ажлын цаг", correct: 0 },
  { question: "Ажлын байранд хийгээд гарах үед юу өмсөх ёстой вэ?", optionA: "Хамгаалах хэрэгсэл", optionB: "Уран загвар", optionC: "Спортын", optionD: "Энгийн", correct: 0 },
  { question: "Хамгаалах хэрэгслийг хэрэглэх зааварчилгааг хэн бичдэг вэ?", optionA: "Ажилтан", optionB: "Ажил олгогч", optionC: "Засгийн газар", optionD: "Сургууль", correct: 1 },
  { question: "Ажлын байранд осол гардаг боловсруулах үйлдэл юу вэ?", optionA: "Шууд үргэлжлүүлэх", optionB: "Аюулгүй газар луу шилжих", optionC: "Ярих", optionD: "Хүлээх", correct: 1 },
  { question: "Гал түймрийн үед юу хийх вэ?", optionA: "Гал руу очих", optionB: "Эвакуаци хийх", optionC: "Зогсох", optionD: "Утсаар ярих", correct: 1 },
  { question: "Ажил олгогч юуны тул ажилтныг сургадаг вэ?", optionA: "Ажлын байрны аюулгүй байдал", optionB: "Спорт", optionC: "Дугуй", optionD: "Тоглоом", correct: 0 },
  { question: "Ажлын байранд дуу чимээ хязгаарлагдсан уу?", optionA: "Үгүй", optionB: "Тийм", optionC: "Магадгүй", optionD: "Мэдэхгүй", correct: 1 },
  { question: "Ажилтны эрүүл мэндийн үзлэг хийдэг үү?", optionA: "Үгүй", optionB: "Тийм", optionC: "Магадгүй", optionD: "Зөвхөн өвчтэй үед", correct: 1 },
  { question: "Ажлын байранд химикийн бодис хэрэглэх үед юу зөвшөөрөгдсөн вэ?", optionA: "Хэрэглэхгүй", optionB: "Маск өмсөх", optionC: "Бүүрээ хэрэглэх", optionD: "Амархан", correct: 1 },
  { question: "ХАБЭА сургалт ямар зорилготой вэ?", optionA: "Ажилтныг сургах", optionB: "Ажлын байрны аюулгүй байдлыг дээшлүүлэх", optionC: "Зугаацуулах", optionD: "Мөнгө олгох", correct: 1 },
  { question: "Ажлын байранд хэрэгслийг хэрхэн хадгалах вэ?", optionA: "Таазанд", optionB: "Зааварт заасан байрлалд", optionC: "Хаалганы ард", optionD: "Дэвсгэр дээр", correct: 1 },
];

// ХАБЭА хяналт, үнэлгээ — 45 асуулт
const quiz3Questions: QuizQuestion[] = [
  { question: "1 + 1 = ?", optionA: "1", optionB: "2", optionC: "3", optionD: "4", correct: 1 },
  { question: "Амиа авах үед тусламж дуудах нь зөв үү?", optionA: "Үгүй", optionB: "Тийм", optionC: "Магадгүй", optionD: "Мэдэхгүй", correct: 1 },
  { question: "2 + 2 = ?", optionA: "2", optionB: "4", optionC: "6", optionD: "8", correct: 1 },
  { question: "Нот god хийх үед гараа зүрхнийх нь дээр тавих нь зөв үү?", optionA: "Үгүй", optionB: "Тийм", optionC: "Магадгүй", optionD: "Мэдэхгүй", correct: 1 },
  { question: "3 + 3 = ?", optionA: "3", optionB: "6", optionC: "9", optionD: "12", correct: 1 },
  { question: "Фактын талаарх мэдлэгтэй байх нь ач тустай юу?", optionA: "Үгүй", optionB: "Тийм", optionC: "Магадгүй", optionD: "Мэдэхгүй", correct: 1 },
  { question: "4 + 2 = ?", optionA: "4", optionB: "5", optionC: "6", optionD: "7", correct: 2 },
  { question: "Эрүүл мэндийн тусламж авах хэрэгтэй юу?", optionA: "Үгүй", optionB: "Тийм", optionC: "Магадгүй", optionD: "Мэдэхгүй", correct: 1 },
  { question: "5 + 5 = ?", optionA: "5", optionB: "10", optionC: "15", optionD: "20", correct: 1 },
  { question: "Хүний биед цус эргэлддөг үү?", optionA: "Үгүй", optionB: "Тийм", optionC: "Магадгүй", optionD: "Мэдэхгүй", correct: 1 },
  { question: "7 - 3 = ?", optionA: "2", optionB: "3", optionC: "4", optionD: "5", correct: 2 },
  { question: "Хүйтэнд хувцаслахаар халуун байдаг уу?", optionA: "Үгүй", optionB: "Тийм", optionC: "Магадгүй", optionD: "Мэдэхгүй", correct: 1 },
  { question: "6 + 4 = ?", optionA: "8", optionB: "9", optionC: "10", optionD: "11", correct: 2 },
  { question: "Үрэвсэл өвчин эмчлэх боломжтой юу?", optionA: "Үгүй", optionB: "Тийм", optionC: "Магадгүй", optionD: "Мэдэхгүй", correct: 1 },
  { question: "9 - 5 = ?", optionA: "2", optionB: "3", optionC: "4", optionD: "5", correct: 2 },
  { question: "Ус их уух нь эрүүл мэндэд сайн уу?", optionA: "Үгүй", optionB: "Тийм", optionC: "Магадгүй", optionD: "Мэдэхгүй", correct: 1 },
  { question: "8 + 1 = ?", optionA: "7", optionB: "8", optionC: "9", optionD: "10", correct: 2 },
  { question: "Тунгалаг агаарт амьсгалах нь ач тустай юу?", optionA: "Үгүй", optionB: "Тийм", optionC: "Магадгүй", optionD: "Мэдэхгүй", correct: 1 },
  { question: "3 + 8 = ?", optionA: "9", optionB: "10", optionC: "11", optionD: "12", correct: 2 },
  { question: "Нойр ханах нь эрүүл мэндэд чухал юу?", optionA: "Үгүй", optionB: "Тийм", optionC: "Магадгүй", optionD: "Мэдэхгүй", correct: 1 },
  { question: "НОХ гэж юу вэ?", optionA: "Нойр бүхий оролттой хүний сэргээлт", optionB: "Нүүрний ороо хаалттай кибернетик", optionC: "Зүрхний гадаад гүйцэтгэл", optionD: "Зүрхэнд цус хайлуулах", correct: 0 },
  { question: "НОХ хийх үед гараа хаана тавих вэ?", optionA: "Хэвлийн дээд хэсэг", optionB: "Зүрхний хоёр талд", optionC: "Цээжний доод хэсэг", optionD: "Бэлэг зулвай", correct: 0 },
  { question: "НОХ compressions:ventilations харьцаа:", optionA: "30:2", optionB: "15:1", optionC: "30:5", optionD: "15:2", correct: 0 },
  { question: "Хүний ухаан алдагдсан үед эхлээд юу хийх вэ?", optionA: "Ухаантай хүнийг дуудах", optionB: "Түүний ухааныг шалгах", optionC: "Анхны тусламж үзүүлэх", optionD: "Тээвэрлэх", correct: 1 },
  { question: "Цус алдагдсан үед эхлээд юу хийх вэ?", optionA: "Цус алдагдсан газар дарах", optionB: "Цус хайлуулах", optionC: "Тээвэрлэх", optionD: "Ус уух", correct: 0 },
  { question: "Хамгаалах хэрэгсэл өмсөх үүрэг хэн дээр байдаг вэ?", optionA: "Ажилтан", optionB: "Ажил олгогч", optionC: "Удирдлагын хүн", optionD: "ХАБЭА алба", correct: 1 },
  { question: "Ажлын байранд хамгийн түгээмэл осол юу вэ?", optionA: "Унадаг зүйл", optionB: "Мэдээлэл", optionC: "Зугаа", optionD: "Суралцах", correct: 0 },
  { question: "Аюулгүй байдалын дүрэм зохиох хэрэгтэй юу?", optionA: "Тийм", optionB: "Үгүй", optionC: "Магадгүй", optionD: "Мэдэхгүй", correct: 0 },
  { question: "Гал унтраах саванг хаана байрлуулах вэ?", optionA: "Хаалганы ард", optionB: "Тод харагдах газар", optionC: "Шkaarд зүйлсний ард", optionD: "Дэвсгэр доор", correct: 1 },
  { question: "Ажлын байранд ундлага хийх ёстой уу?", optionA: "Үгүй", optionB: "Тийм, тухтайн цаг", optionC: "Байнгын", optionD: "Зөвхөн өдөр", correct: 1 },
  { question: "Анхны тусламж үзүүлэхийн тулд юу сурах хэрэгтэй вэ?", optionA: "Ус хийх", optionB: "НОХ хийх", optionC: "Хоол уух", optionD: "Ярих", correct: 1 },
  { question: "Ажлын байранд гаралт үйлдэх үед юу хийх вэ?", optionA: "Түүнийг зогсоох", optionB: "Дараагийн ажилдаа", optionC: "Ярих", optionD: "Хэлэх", correct: 0 },
  { question: "Ажлын байрны аюулгүй байдалын сургалт жилд хэдэн удаа явагдана?", optionA: "1", optionB: "2", optionC: "0", optionD: "Хамаагүй", correct: 0 },
  { question: "Ажилтан ажлын байрны дүрмийг дагах ёстой уу?", optionA: "Үгүй", optionB: "Тийм", optionC: "Зөвхөн 5өдөр", optionD: "Заримдаа", correct: 1 },
  { question: "Ажлын байрны эрсдэл гэж юу вэ?", optionA: "Аюул осол", optionB: "Амралт", optionC: "Цалин", optionD: "Ажлын цаг", correct: 0 },
  { question: "Ажлын байранд хийгээд гарах үед юу өмсөх ёстой вэ?", optionA: "Хамгаалах хэрэгсэл", optionB: "Уран загвар", optionC: "Спортын", optionD: "Энгийн", correct: 0 },
  { question: "Хамгаалах хэрэгслийг хэрэглэх зааварчилгааг хэн бичдэг вэ?", optionA: "Ажилтан", optionB: "Ажил олгогч", optionC: "Засгийн газар", optionD: "Сургууль", correct: 1 },
  { question: "Ажлын байранд осол гардаг боловсруулах үйлдэл юу вэ?", optionA: "Шууд үргэлжлүүлэх", optionB: "Аюулгүй газар луу шилжих", optionC: "Ярих", optionD: "Хүлээх", correct: 1 },
  { question: "Гал түймрийн үед юу хийх вэ?", optionA: "Гал руу очих", optionB: "Эвакуаци хийх", optionC: "Зогсох", optionD: "Утсаар ярих", correct: 1 },
  { question: "Ажил олгогч юуны тул ажилтныг сургадаг вэ?", optionA: "Ажлын байрны аюулгүй байдал", optionB: "Спорт", optionC: "Дугуй", optionD: "Тоглоом", correct: 0 },
  { question: "Ажлын байранд дуу чимээ хязгаарлагдсан уу?", optionA: "Үгүй", optionB: "Тийм", optionC: "Магадгүй", optionD: "Мэдэхгүй", correct: 1 },
  { question: "Ажилтны эрүүл мэндийн үзлэг хийдэг үү?", optionA: "Үгүй", optionB: "Тийм", optionC: "Магадгүй", optionD: "Зөвхөн өвчтэй үед", correct: 1 },
  { question: "Ажлын байранд химикийн бодис хэрэглэх үед юу зөвшөөрөгдсөн вэ?", optionA: "Хэрэглэхгүй", optionB: "Маск өмсөх", optionC: "Бүүрээ хэрэглэх", optionD: "Амархан", correct: 1 },
  { question: "ХАБЭА сургалт ямар зорилготой вэ?", optionA: "Ажилтныг сургах", optionB: "Ажлын байрны аюулгүй байдлыг дээшлүүлэх", optionC: "Зугаацуулах", optionD: "Мөнгө олгох", correct: 1 },
  { question: "Ажлын байранд хэрэгслийг хэрхэн хадгалах вэ?", optionA: "Таазанд", optionB: "Зааварт заасан байрлалд", optionC: "Хаалганы ард", optionD: "Дэвсгэр дээр", correct: 1 },
];

// ═══════════════════════════════════════════════════════════
// Сорилын Template-үүд
// ═══════════════════════════════════════════════════════════

export const quizTemplates: QuizTemplate[] = [
  {
    id: "quiz-1",
    backendId: "7005740a-ac53-462a-8cd7-b3015773a6ea",
    title: "Гал түймэр, анхны тусламж",
    description: "Гал түймрийг урьдчилан сэргийлэх, анхны тусламж үзүүлэх, яаралтай үйлдлүүдийн мэдлэгийг сорих",
    duration: 25,
    passingScore: 60,
    icon: "flame",
    category: "fire-safety",
    questions: quiz1Questions,
  },
  {
    id: "quiz-2",
    backendId: "d15456c9-40b4-4906-bdb5-1915045baa8e",
    title: "Ажлын байрны эрүүл мэнд",
    description: "Физик, химийн, биологийн аюулууд, сэтгэлзүйн хамгаалалт, эрүүл мэндийн сэдвүүдээр мэдлэг сорих",
    duration: 25,
    passingScore: 60,
    icon: "heart",
    category: "health",
    questions: quiz2Questions,
  },
  {
    id: "quiz-3",
    backendId: "a9ba5e3c-8a68-4c2f-b100-0af2c719993d",
    title: "ХАБЭА хяналт, үнэлгээ",
    description: "ХАБЭА-ийн хяналтын байгууллага, үнэлгээний аргууд, хууль эрх зүйн актуудын мэдлэгийг сорих",
    duration: 25,
    passingScore: 60,
    icon: "clipboard-check",
    category: "compliance",
    questions: quiz3Questions,
  },
];

// Template ID-гоор эсвэл Backend UUID-гаар олох
export function getQuizById(id: string): QuizTemplate | undefined {
  return quizTemplates.find((t) => t.id === id || t.backendId === id);
}

// Сорилын жагсаалт авах
export function getQuizList(): { id: string; title: string; description: string; questionCount: number; price: number }[] {
  return quizTemplates.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    questionCount: t.questions.length,
    price: 5000,
  }));
}
