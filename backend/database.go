package main

import (
	"log"
	"os"
	"path/filepath"

	"github.com/glebarez/sqlite"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	dbDir := "./data"
	os.MkdirAll(dbDir, 0755)

	dbPath := filepath.Join(dbDir, "habea.db")
	var err error
	DB, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	log.Println("Database connected successfully")

	err = DB.AutoMigrate(
		&User{}, &AdminAccount{}, &Course{},
		&Quiz{}, &QuizQuestion{}, &QuizAttempt{},
		&Exam{}, &ExamQuestion{}, &ExamAttempt{},
		&Enrollment{}, &Consultation{}, &ContactForm{},
		&Feedback{}, &SurveyResponse{}, &ServiceOrder{},
	)
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}
	log.Println("Database migration completed")

	seedAdminAccounts()
	seedCourses()
	seedQuizzes()
}

func seedAdminAccounts() {
	admins := []struct{ code, name, email, role string }{
		{"Admin6996", "Систем Админ", "admin@habea.mn", "ADMIN"},
		{"manager1234", "Менежер", "manager@habea.mn", "MANAGER"},
		{"Teacher0001", "Багш 1", "teacher1@habea.mn", "TEACHER"},
		{"Teacher0002", "Багш 2", "teacher2@habea.mn", "TEACHER"},
		{"Teacher0003", "Багш 3", "teacher3@habea.mn", "TEACHER"},
		{"Teacher0004", "Багш 4", "teacher4@habea.mn", "TEACHER"},
	}
	for _, a := range admins {
		var ex AdminAccount
		if DB.Where("code = ?", a.code).First(&ex).Error != nil {
			DB.Create(&AdminAccount{ID: uuid.New().String(), Code: a.code, Name: a.name, Email: a.email, Role: a.role})
			log.Printf("Seeded admin: %s (%s)", a.name, a.role)
		}
	}
}

type seedQ struct{ q, a, b, c, d string; correct int }

func seedCourses() {
	courses := []struct{ title, cat, desc, dur string; price float64; sched, loc string; max int }{
		{"Ажлын байраны аюулгүй байдалын үндэс", "АБҮ", "Ажлын байраны аюулгүй ажиллагааны үндсэн мэдлэг, хууль эрх зүй, стандартуудыг судлах.", "3 хоног (24 цаг)", 30000, "Даваа-Мягмар", "ХАБЭА сургалтын төв", 30},
		{"ХАБЭА удирдлагын систем (ISO 45001)", "ISO", "ISO 45001 стандартын дагуу ХАБЭА удирдлагын системийг боловсруулах, хэрэгжүүлэх.", "5 хоног (40 цаг)", 50000, "Даваа-Баасан", "Сургалтын танхим 201", 20},
		{"Гал түймэрээс урьдчилан сэргийлэх", "Гал", "Гал түймрийн эрсдлийн үнэлгээ, урьдчилан сэргийлэх аргууд, анхны тусламж.", "2 хоног (16 цаг)", 25000, "Бямба-Ням", "Гал унтраах үйлчилгээний төв", 25},
		{"Ачаалтай ажил гүйцэтгэх, өндөрт ажиллах", "Тусгай", "Ачаалтай ажил гүйцэтгэх, өндөрт ажиллахад зориулсан мэргэжлийн сургалт.", "2 хоног (16 цаг)", 25000, "Ням-Бямба", "ХАБЭА сургалтын төв", 20},
		{"Анхны тусламж", "ЭМ", "Ажлын байранд гарах осол гэмтэлд анхны тусламж үзүүлэх, НОХ-ээр сэргээх.", "1 хоног (8 цаг)", 15000, "Бямба", "Эрүүл мэндийн төв", 35},
	}
	for _, c := range courses {
		var ex Course
		if DB.Where("title = ?", c.title).First(&ex).Error != nil {
			DB.Create(&Course{ID: uuid.New().String(), Title: c.title, Category: c.cat, Description: c.desc, Duration: c.dur, Price: c.price, Schedule: c.sched, Location: c.loc, MaxStudents: c.max})
			log.Printf("Seeded course: %s", c.title)
		}
	}
}

func seedQuizzes() {
	quizzes := []struct {
		title, desc, cat string
		questions       []seedQ
	}{
		{"ХАБЭА үндсэн мэдлэг", "Ажлын байраны аюулгүй байдалын үндсэн мэдлэгийг шалгах давтлах тест", "АБҮ", []seedQ{
			{"ХАБЭА гэдэг нь юуны товчлол вэ?", "Хүний аюулгүй байдал, эрүүл ахуй", "Хөдөлмөрийн аюулгүй байдал, эрүүл ахуй", "Хөдөлмөрийн академи, боловсрол", "Хот ажиллаж байгаа эрүүл ахуй", 1},
			{"Ажил олгогчийн үндсэн үүрэг юу вэ?", "Ажилтны цалинг төлөх", "Ажилтны аюулгүй байдлыг хангах", "Ажилтны амралт зохион байгуулах", "Шинэ тоног төхөөрөмж авах", 1},
			{"Ажлын байранд хамгаалах хэрэгслээс бүүрээ хэрэглэх ёстойг хэлэх нь:", "Ангилал", "Заалт", "Стандарт", "Дүрэм", 1},
			{"Ажилтны хувийн хамгаалах хэрэгслийг хэн хангадаг вэ?", "Дээд байгууллага", "Үйлдвэр", "Ажилтан өөрөө", "ХАБЭА алба", 2},
			{"Ажлын байранд гарсан осолд эхлээд юу хийх ёстой вэ?", "Ажилаа үргэлжлүүлэх", "Аюулгүй газар луу шилжих", "Гар утсаа авах", "Бусаддаа дуугарах", 1},
		}},
		{"Гал түймэрээс сэргийлэх", "Гал түймрийн эрсдлийн үнэлгээ, урьдчилан сэргийлэх аргууд", "Гал", []seedQ{
			{"Гал унтраахад хамгийн түгээмэл ашигладаг уусгагч нь:", "Ус", "Шороон уусгалт", "Хий уусгалт", "ABC уусгагч", 2},
			{"Гал түймрийн анхны уусгагч юу вэ?", "Усан цахилгаан уусгагч", "Даавуу уусгагч", "Хий уусгагч", "ABC уусгагч", 1},
			{"Гал түймрийн үед эвакуацийн зам дээр юу хийх хэрэгтэй вэ?", "Гэрэлтүүдийг асаах", "Эд зүйлсээ татаж авах", "Замыг цэвэрлэх, тэмдэглэх", "Хаалгаа түгжих", 2},
			{"Гал түймрийн эрсдэл бүхий газар гэж юуныг хэлэх вэ?", "Хэвтээ газар", "Шатах боломжтой бодис хадгалсан газар", "Цонхтой өрөө", "Усан сан", 1},
			{"Гал түймэрт гарсан үед утсаар юу хийх вэ?", "Галын мэдээлэл өгөх", "Нөхцөл байдлыг тайлагнах", "Гал унтраах албад руу залгах", "Дээрх бүгд", 3},
		}},
		{"Анхны тусламж", "Ажлын байранд анхны тусламж үзүүлэх, НОХ сэргээлт", "ЭМ", []seedQ{
			{"НОХ гэж юу вэ?", "Нойр бүхий оролттой хүний сэргээлт", "Нүүрний ороо хаалттай кибернетик", "Зүрхний гадаад гүйцэтгэл", "Зүрхэнд цус хайлуулах", 0},
			{"НОХ хийх үед гараа хаана тавих вэ?", "Хэвлийн дээд хэсэг", "Зүрхний хоёр талд", "Цээжний доод хэсэг", "Бэлэг зулвай", 0},
			{"НОХ compressions:ventilations харьцаа:", "30:2", "15:1", "30:5", "15:2", 0},
			{"Хүний ухаан алдагдсан үед эхлээд юу хийх вэ?", "Ухаантай хүнийг дуудах", "Түүний ухааныг шалгах", "Анхны тусламж үзүүлэх", "Тээвэрлэх", 1},
			{"Цус алдагдсан үед эхлээд юу хийх вэ?", "Цус алдагдсан газар дарах", "Цус хайлуулах", "Тээвэрлэх", "Ус уух", 0},
		}},
	}
	for _, qz := range quizzes {
		var ex Quiz
		if DB.Where("title = ?", qz.title).First(&ex).Error != nil {
			quiz := Quiz{ID: uuid.New().String(), Title: qz.title, Description: qz.desc, Category: qz.cat, QuestionCount: len(qz.questions)}
			DB.Create(&quiz)
			for i, qq := range qz.questions {
				DB.Create(&QuizQuestion{ID: uuid.New().String(), QuizID: quiz.ID, Question: qq.q, OptionA: qq.a, OptionB: qq.b, OptionC: qq.c, OptionD: qq.d, Correct: qq.correct, Index: i})
			}
			log.Printf("Seeded quiz: %s (%d questions)", qz.title, len(qz.questions))
		}
	}
}
