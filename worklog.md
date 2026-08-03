---
Task ID: 1
Agent: Main Agent
Task: 3 даалгавар хийх - Admin sorilt/shalgalt uusgeh, Profile footer naaldah, Footer conditional

Work Log:
- App.tsx: Footer-ийг зөвхөн "home" болон "about" хуудаст л харагдах болгож conditional rendering хийлээ
- profile-page.tsx: Logout button-д "pt-6 pb-8" padding нэмж, footer-той наалдахгүй болголоо
- exam-page.tsx: 
  - Quiz template-үүдийг POST /api/admin/quizzes руу зөв чиглүүлэв (өмнө нь /api/admin/exams руу буруу очдог байсан)
  - activeCreateType state нэмж, custom create form-д "Шалгалт" эсвэл "Сорил" төрөл сонгох боломж олголоо
  - adminExams, adminQuizzes state нэмж, fetchAdminItems() функцээр үүссэн шалгалт/сорил жагсаалтыг API-аас татаж харууллаа
  - Үүссэн шалгалтуудын жагсаалт card нэмж (код хуулалт, идэвхтэй эсэх badge)
  - Custom create form-д quiz үүсгэх үед "Тайлбар" field харуулна, exam үүсгэх үед "Хугацаа" field харуулна
- quiz-page.tsx:
  - QuizSelection component-д admin creation section нэмж
  - Admin хэрэглэгчдэд "Сорил нэмэх" товчтой card харагдана
  - Асуулт бичих form (title, description, questions with A/B/C/D, correct answer)
  - POST /api/admin/quizzes API руу илгээж, refreshQuizzes() дуудан жагсаалт шинэчлэнэ

Stage Summary:
- Footer зөвхөн Home болон About хуудаст л харагдана
- Profile хуудасны logout button footer-той наалдахгүй (padding нэмсэн)
- Admin шалгалт/сорил үүсгэх system:
  - Exam page: Template сонгох (Шалгалт/Мэдлэг сорих tabs), Custom үүсгэх form
  - Quiz page: Admin section-д шууд сорил үүсгэх form
  - Бүх үүсэлт DB руу хадгалагдана (refresh хийхэд алга болохгүй)
  - Үүссэн шалгалтуудын жагсаалт харагдана

---
Task ID: 2
Agent: Main Agent
Task: Сургалт, Сорилууд хуудаснуудад gradient hero banner нэмж бусад хуудастай ижил загвартай болгох

Work Log:
- training-page.tsx: Text-center header-ийг арилгаж, gradient hero banner нэмсэн (bg-gradient-to-b from-brand-900 to-brand-800 py-16)
- quiz-page.tsx: QuizSelection component-д text-center header-ийг арилгаж, gradient hero banner нэмсэн (адил загвартай)
- Хоёр хуудсын контент хэсгийг -mt-8 margin-тай болгож, banner доор overlap хийв
- Бусад хуудас (Шалгалт, Зөвлөх үйлчилгээ, Санал хүсэлт, Сэтгэл ханамж) бүгд адил gradient hero banner-тэй байсан
- Одоо бүх хуудас нэгэн төрлийн consistent загвартай боллоо

Stage Summary:
- Сургалт хуудас: gradient hero banner нэмсэн
- Сорилууд хуудас: gradient hero banner нэмсэн
- Бүх хуудас uniform загвартай боллоо
