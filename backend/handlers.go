package main

import (
	"crypto/rand"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// ── Request Structs ──────────────────────────────────────────

type RegisterRequest struct {
	FirstName      string `json:"firstName" binding:"required"`
	LastName       string `json:"lastName" binding:"required"`
	Email          string `json:"email" binding:"required"`
	Phone          string `json:"phone" binding:"required"`
	Password       string `json:"password" binding:"required,min=6"`
	Address        string `json:"address"`
	SecondaryPhone string `json:"secondaryPhone"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type AdminLoginRequest struct {
	Code string `json:"code" binding:"required"`
}

type ContactRequest struct {
	Name    string `json:"name" binding:"required"`
	Email   string `json:"email" binding:"required"`
	Phone   string `json:"phone"`
	Subject string `json:"subject"`
	Message string `json:"message" binding:"required"`
}

type FeedbackRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required"`
	Phone    string `json:"phone"`
	Message  string `json:"message" binding:"required"`
	Rating   int    `json:"rating"`
	Category string `json:"category"`
}

type SurveyRequest struct {
	Name      string `json:"name" binding:"required"`
	Email     string `json:"email" binding:"required"`
	Phone     string `json:"phone"`
	Responses string `json:"responses" binding:"required"`
}

type ConsultationRequest struct {
	Name        string `json:"name" binding:"required"`
	Email       string `json:"email" binding:"required"`
	Phone       string `json:"phone" binding:"required"`
	Company     string `json:"company"`
	ServiceType string `json:"serviceType" binding:"required"`
	Message     string `json:"message"`
}

type ServiceOrderRequest struct {
	Name        string `json:"name" binding:"required"`
	Email       string `json:"email" binding:"required"`
	Phone       string `json:"phone" binding:"required"`
	Company     string `json:"company"`
	ServiceType string `json:"serviceType" binding:"required"`
	Message     string `json:"message"`
	Date        string `json:"date"`
}

type QuizPaymentRequest struct {
	QuizID string `json:"quizId" binding:"required"`
}

type QuizSubmitAnswer struct {
	QuestionID     string `json:"questionId"`
	SelectedOption int    `json:"selectedOption"`
}

type QuizSubmitRequest struct {
	QuizID  string             `json:"quizId" binding:"required"`
	Answers []QuizSubmitAnswer `json:"answers" binding:"required"`
}

type ExamActionRequest struct {
	Action    string `json:"action" binding:"required"`
	Code      string `json:"code"`
	ExamID    string `json:"examId"`
	Answers   []int  `json:"answers"`
	TimeSpent int    `json:"timeSpent"`
}

type CoursePaymentRequest struct {
	CourseID string `json:"courseId" binding:"required"`
}

type AdminCreateExamRequest struct {
	Title     string              `json:"title" binding:"required"`
	Duration  int                 `json:"duration"`
	EndDate   *string             `json:"endDate"`
	Questions []ExamQuestionInput `json:"questions" binding:"required"`
}

type ExamQuestionInput struct {
	Question string `json:"question" binding:"required"`
	OptionA  string `json:"optionA" binding:"required"`
	OptionB  string `json:"optionB" binding:"required"`
	OptionC  string `json:"optionC" binding:"required"`
	OptionD  string `json:"optionD" binding:"required"`
	Correct  int    `json:"correct" binding:"required"`
}

type AdminCreateCourseRequest struct {
	Title       string  `json:"title" binding:"required"`
	Category    string  `json:"category" binding:"required"`
	Description string  `json:"description" binding:"required"`
	Duration    string  `json:"duration" binding:"required"`
	Price       float64 `json:"price"`
	Schedule    string  `json:"schedule"`
	Location    string  `json:"location"`
	StartDate   string  `json:"startDate"`
	MaxStudents *int    `json:"maxStudents"`
}

type AdminCreateQuizRequest struct {
	Title       string              `json:"title" binding:"required"`
	Description string              `json:"description"`
	Category    string              `json:"category"`
	Price       int                 `json:"price"`
	Questions   []ExamQuestionInput `json:"questions" binding:"required"`
}

type UpdateProfileRequest struct {
	Phone          string `json:"phone"`
	Address        string `json:"address"`
	SecondaryPhone string `json:"secondaryPhone"`
	FirstName      string `json:"firstName"`
	LastName       string `json:"lastName"`
}

// ── Helper ───────────────────────────────────────────────────

func generateCode() string {
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
	code := make([]byte, 6)
	for i := range code {
		n, _ := rand.Int(rand.Reader, big.NewInt(int64(len(chars))))
		code[i] = chars[n.Int64()]
	}
	return string(code)
}

func userResponse(user User) gin.H {
	name := user.FirstName + " " + user.LastName
	return gin.H{
		"userId":    user.ID,
		"email":     user.Email,
		"role":      user.Role,
		"name":      name,
		"firstName": user.FirstName,
		"lastName":  user.LastName,
		"phone":     user.Phone,
	}
}

// ── Auth Handlers ────────────────────────────────────────────

func RegisterHandler(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	var existing User
	if DB.Where("email = ?", req.Email).First(&existing).Error == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Бүртгэлтэй имэйл байна"})
		return
	}
	hash, _ := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	user := User{ID: uuid.New().String(), FirstName: req.FirstName, LastName: req.LastName, Email: req.Email, Phone: req.Phone, Password: string(hash), Address: req.Address, SecondaryPhone: req.SecondaryPhone, Role: "USER"}
	if err := DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}
	token, _ := GenerateToken(user.ID, user.Email, user.Role, user.FirstName+" "+user.LastName)
	c.JSON(http.StatusCreated, gin.H{"user": userResponse(user), "token": token})
}

func LoginHandler(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	var user User
	if err := DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Бүртгэлгүй имэйл байна"})
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Нууц үг буруу"})
		return
	}
	token, _ := GenerateToken(user.ID, user.Email, user.Role, user.FirstName+" "+user.LastName)
	c.JSON(http.StatusOK, gin.H{"user": userResponse(user), "token": token})
}

func MeHandler(c *gin.Context) {
	userID, _ := c.Get("userId")
	var user User
	if err := DB.Where("id = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"user": userResponse(user)})
}

func AdminLoginHandler(c *gin.Context) {
	var req AdminLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Хүсэлт буруу байна: " + err.Error()})
		return
	}
	var account AdminAccount
	if err := DB.Where("code = ?", req.Code).First(&account).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Буруу админ код"})
		return
	}
	token, err := GenerateToken(account.ID, account.Email, account.Role, account.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Токен үүсгэж чадсангүй"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"user": gin.H{
			"userId": account.ID,
			"email":  account.Email,
			"role":   account.Role,
			"name":   account.Name,
		},
		"token": token,
	})
}

// ── Profile Handlers ─────────────────────────────────────────

func GetProfileHandler(c *gin.Context) {
	userID, _ := c.Get("userId")
	section := c.Query("section")

	var user User
	if DB.Where("id = ?", userID).First(&user).Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	switch section {
	case "exams":
		var attempts []ExamAttempt
		DB.Where("user_id = ?", userID).Order("created_at desc").Find(&attempts)
		var results []gin.H
		for _, a := range attempts {
			var exam Exam
			DB.Where("id = ?", a.ExamID).First(&exam)
			results = append(results, gin.H{
				"id": a.ID, "examId": a.ExamID,
				"exam":  gin.H{"id": exam.ID, "title": exam.Title, "code": exam.Code, "duration": exam.Duration, "questionCount": exam.QuestionCount},
				"score": a.Score, "total": a.Total, "passed": a.Passed,
				"timeSpent": a.TimeSpent, "createdAt": a.CreatedAt,
			})
		}
		c.JSON(http.StatusOK, gin.H{"results": results})
		return

	case "quizzes":
		var attempts []QuizAttempt
		DB.Where("user_id = ?", userID).Order("created_at desc").Find(&attempts)
		var results []gin.H
		for _, a := range attempts {
			var quiz Quiz
			DB.Where("id = ?", a.QuizID).First(&quiz)
			results = append(results, gin.H{
				"id": a.ID, "quizId": a.QuizID,
				"quiz":  gin.H{"id": quiz.ID, "title": quiz.Title},
				"score": a.Score, "total": a.Total, "passed": a.Passed, "createdAt": a.CreatedAt,
			})
		}
		c.JSON(http.StatusOK, gin.H{"results": results})
		return

	case "courses":
		var enrollments []Enrollment
		DB.Where("user_id = ?", userID).Order("created_at desc").Find(&enrollments)
		var regs []gin.H
		for _, e := range enrollments {
			var course Course
			DB.Where("id = ?", e.CourseID).First(&course)
			status := "confirmed"
			if !e.Paid {
				status = "pending"
			}
			regs = append(regs, gin.H{
				"id":        e.ID,
				"status":    status,
				"createdAt": e.CreatedAt,
				"course": gin.H{
					"title":       course.Title,
					"category":    course.Category,
					"duration":    course.Duration,
					"description": course.Description,
					"price":       course.Price,
					"schedule":    course.Schedule,
					"location":    course.Location,
				},
			})
		}
		c.JSON(http.StatusOK, gin.H{"registrations": regs})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": userResponse(user)})
}

func UpdateProfileHandler(c *gin.Context) {
	userID, _ := c.Get("userId")
	var user User
	if DB.Where("id = ?", userID).First(&user).Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	var req UpdateProfileRequest
	c.ShouldBindJSON(&req)
	updates := map[string]interface{}{}
	if req.Phone != "" {
		updates["phone"] = req.Phone
	}
	if req.Address != "" {
		updates["address"] = req.Address
	}
	if req.SecondaryPhone != "" {
		updates["secondary_phone"] = req.SecondaryPhone
	}
	if req.FirstName != "" {
		updates["first_name"] = req.FirstName
	}
	if req.LastName != "" {
		updates["last_name"] = req.LastName
	}
	DB.Model(&user).Updates(updates)
	DB.Where("id = ?", userID).First(&user)
	c.JSON(http.StatusOK, gin.H{"user": userResponse(user)})
}

// ── Quiz Handlers ───────────────────────────────────────────

func GetQuizzesHandler(c *gin.Context) {
	var quizzes []Quiz
	DB.Find(&quizzes)
	c.JSON(http.StatusOK, gin.H{"quizzes": quizzes})
}

func GetQuizQuestionsHandler(c *gin.Context) {
	quizID := c.Query("quizId")
	userID, _ := c.Get("userId")
	var questions []QuizQuestion
	DB.Where("quiz_id = ?", quizID).Order("index asc").Find(&questions)

	var prevAttempt QuizAttempt
	DB.Where("quiz_id = ? AND user_id = ?", quizID, userID).Order("created_at desc").First(&prevAttempt)

	result := gin.H{"questions": questions}
	if prevAttempt.ID != "" {
		result["attempt"] = gin.H{"id": prevAttempt.ID, "score": prevAttempt.Score, "total": prevAttempt.Total}
	}
	c.JSON(http.StatusOK, result)
}

func QuizPaymentHandler(c *gin.Context) {
	var req QuizPaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	var quiz Quiz
	if DB.Where("id = ?", req.QuizID).First(&quiz).Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Quiz not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Амжилттай", "paid": true})
}

func QuizSubmitHandler(c *gin.Context) {
	var req QuizSubmitRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	userID, _ := c.Get("userId")
	var questions []QuizQuestion
	DB.Where("quiz_id = ?", req.QuizID).Order("index asc").Find(&questions)

	score := 0
	for _, ans := range req.Answers {
		for _, q := range questions {
			if q.ID == ans.QuestionID && q.Correct == ans.SelectedOption {
				score++
			}
		}
	}

	ansJSON, _ := json.Marshal(req.Answers)
	passed := score >= int(float64(len(questions))*0.8)
	attempt := QuizAttempt{ID: uuid.New().String(), UserID: userID.(string), QuizID: req.QuizID, Score: score, Total: len(questions), Passed: passed, Answers: string(ansJSON)}
	DB.Create(&attempt)

	c.JSON(http.StatusOK, gin.H{"score": score, "total": len(questions), "passed": score >= int(float64(len(questions))*0.8), "attemptId": attempt.ID})
}

// ── Exam Handlers ────────────────────────────────────────────

func ExamHandler(c *gin.Context) {
	var req ExamActionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Action == "verify" {
		var exam Exam
		if DB.Where("code = ? AND is_active = ?", req.Code, true).First(&exam).Error != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Идэвхтэй шалгалт олдсонгүй эсвэл код буруу байна"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"exam": gin.H{"id": exam.ID, "title": exam.Title, "questionCount": exam.QuestionCount, "duration": exam.Duration}})
		return
	}

	if req.Action == "submit" {
		userID, _ := c.Get("userId")

		var questions []ExamQuestion
		DB.Where("exam_id = ?", req.ExamID).Order("index asc").Find(&questions)

		score := 0
		for i, ans := range req.Answers {
			if i < len(questions) && ans == questions[i].Correct {
				score++
			}
		}
		passed := len(questions) > 0 && score >= int(float64(len(questions))*0.8)

		ansJSON, _ := json.Marshal(req.Answers)
		attempt := ExamAttempt{ID: uuid.New().String(), UserID: userID.(string), ExamID: req.ExamID, Score: score, Total: len(questions), Passed: passed, Answers: string(ansJSON), TimeSpent: req.TimeSpent}
		DB.Create(&attempt)

		c.JSON(http.StatusOK, gin.H{"score": score, "total": len(questions), "passed": passed, "timeSpent": req.TimeSpent})
		return
	}

	c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid action"})
}

func GetExamQuestionsHandler(c *gin.Context) {
	examID := c.Query("examId")
	_, _ = c.Get("userId")

	var questions []ExamQuestion
	DB.Where("exam_id = ?", examID).Order("index asc").Find(&questions)
	c.JSON(http.StatusOK, gin.H{"questions": questions})
}

func GetExamHistoryHandler(c *gin.Context) {
	userID, _ := c.Get("userId")
	var attempts []ExamAttempt
	DB.Where("user_id = ?", userID).Order("created_at desc").Find(&attempts)

	var results []gin.H
	for _, a := range attempts {
		var exam Exam
		DB.Where("id = ?", a.ExamID).First(&exam)
		results = append(results, gin.H{
			"id": a.ID, "examId": a.ExamID, "examTitle": exam.Title,
			"score": a.Score, "total": a.Total, "passed": a.Passed, "timeSpent": a.TimeSpent, "createdAt": a.CreatedAt,
		})
	}
	c.JSON(http.StatusOK, gin.H{"history": results})
}

func ExportExamHandler(c *gin.Context) {
	attemptID := c.Param("attemptId")
	var attempt ExamAttempt
	if DB.Where("id = ?", attemptID).First(&attempt).Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Not found"})
		return
	}
	var exam Exam
	DB.Where("id = ?", attempt.ExamID).First(&exam)
	var questions []ExamQuestion
	DB.Where("exam_id = ?", attempt.ExamID).Order("index asc").Find(&questions)

	var answers []int
	json.Unmarshal([]byte(attempt.Answers), &answers)

	c.Header("Content-Type", "text/csv; charset=utf-8")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=exam_%s_result.csv", exam.Code))
	writer := csv.NewWriter(c.Writer)
	writer.Write([]string{"Шалгалт", exam.Title, "", "Код", exam.Code, "", "Огноо", attempt.CreatedAt.Format("2006-01-02 15:04:05")})
	writer.Write([]string{"#", "Асуулт", "A", "B", "C", "D", "Таны хариулт", "Зөв хариулт", "Дүн"})
	for i, q := range questions {
		ansStr := "-"
		correctStr := string([]string{"A", "B", "C", "D"}[q.Correct])
		if i < len(answers) && answers[i] >= 0 {
			ansStr = string([]string{"A", "B", "C", "D"}[answers[i]])
		}
		status := "Буруу"
		if i < len(answers) && answers[i] == q.Correct {
			status = "Зөв"
		}
		writer.Write([]string{fmt.Sprintf("%d", i+1), q.Question, q.OptionA, q.OptionB, q.OptionC, q.OptionD, ansStr, correctStr, status})
	}
	writer.Write([]string{"", "", "", "", "", "", "", "", ""})
	writer.Write([]string{"Нийт", "", "", "", "", "", fmt.Sprintf("%d/%d", attempt.Score, attempt.Total), "", fmt.Sprintf("%v", attempt.Passed)})
	writer.Flush()
}

// ── Course Handlers ───────────────────────────────────────────

func GetCoursesHandler(c *gin.Context) {
	var courses []Course
	DB.Order("created_at desc").Find(&courses)

	var result []gin.H
	for _, co := range courses {
		var count int64
		DB.Model(&Enrollment{}).Where("course_id = ?", co.ID).Count(&count)
		result = append(result, gin.H{
			"id": co.ID, "title": co.Title, "category": co.Category, "description": co.Description,
			"duration": co.Duration, "price": co.Price, "schedule": co.Schedule,
			"location": co.Location, "maxStudents": co.MaxStudents, "enrolled": count, "createdAt": co.CreatedAt,
		})
	}
	c.JSON(http.StatusOK, gin.H{"courses": result})
}

func CoursePaymentHandler(c *gin.Context) {
	var req CoursePaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Амжилттай", "paid": true})
}

func RegisterCourseHandler(c *gin.Context) {
	userID, _ := c.Get("userId")
	courseID := c.Param("id")

	var existing Enrollment
	if DB.Where("course_id = ? AND user_id = ?", courseID, userID).First(&existing).Error == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Та энэ сургалтад бүртгэлтэй байна"})
		return
	}

	enrollment := Enrollment{ID: uuid.New().String(), UserID: userID.(string), CourseID: courseID, Paid: true}
	DB.Create(&enrollment)
	c.JSON(http.StatusOK, gin.H{"message": "Амжилттай бүртгэгдлээ", "enrollmentId": enrollment.ID})
}

// ── Form Handlers ────────────────────────────────────────────

func FeedbackHandler(c *gin.Context) {
	var req FeedbackRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	fb := Feedback{ID: uuid.New().String(), Name: req.Name, Email: req.Email, Phone: req.Phone, Message: req.Message, Rating: req.Rating}
	DB.Create(&fb)
	c.JSON(http.StatusCreated, gin.H{"message": "Амжилттай", "id": fb.ID})
}

func GetFeedbackHandler(c *gin.Context) {
	var feedbacks []Feedback
	DB.Order("created_at desc").Find(&feedbacks)
	c.JSON(http.StatusOK, gin.H{"feedback": feedbacks})
}

func DeleteFeedbackHandler(c *gin.Context) {
	id := c.Param("id")
	DB.Where("id = ?", id).Delete(&Feedback{})
	c.JSON(http.StatusOK, gin.H{"message": "Устгагдлаа"})
}

func SurveyHandler(c *gin.Context) {
	var req SurveyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	userID, _ := c.Get("userId")
	resp := SurveyResponse{ID: uuid.New().String(), Name: req.Name, Email: req.Email, Phone: req.Phone, Responses: req.Responses}
	_ = userID
	DB.Create(&resp)
	c.JSON(http.StatusCreated, gin.H{"message": "Амжилттай", "id": resp.ID})
}

func GetSurveyResultsHandler(c *gin.Context) {
	var responses []SurveyResponse
	DB.Order("created_at desc").Find(&responses)

	type Stat struct {
		QuestionID  string   `json:"questionId"`
		Ratings     []int    `json:"ratings"`
		AvgRating   float64  `json:"avgRating"`
		YesCount    int      `json:"yesCount"`
		NoCount     int      `json:"noCount"`
		TextAnswers []string `json:"textAnswers"`
	}

	questionStats := make(map[string]*Stat)
	totalResponses := len(responses)

	for _, r := range responses {
		var parsed map[string]interface{}
		json.Unmarshal([]byte(r.Responses), &parsed)
		for qID, val := range parsed {
			if questionStats[qID] == nil {
				questionStats[qID] = &Stat{QuestionID: qID}
			}
			stat := questionStats[qID]
			switch v := val.(type) {
			case float64:
				stat.Ratings = append(stat.Ratings, int(v))
			case string:
				if v == "yes" {
					stat.YesCount++
				} else if v == "no" {
					stat.NoCount++
				} else {
					stat.TextAnswers = append(stat.TextAnswers, v)
				}
			}
		}
	}

	var stats []*Stat
	for _, s := range questionStats {
		if len(s.Ratings) > 0 {
			sum := 0
			for _, r := range s.Ratings {
				sum += r
			}
			s.AvgRating = float64(sum) / float64(len(s.Ratings))
		}
		stats = append(stats, s)
	}

	c.JSON(http.StatusOK, gin.H{"totalResponses": totalResponses, "stats": stats, "responses": responses})
}

func ContactHandler(c *gin.Context) {
	var req ContactRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	cf := ContactForm{ID: uuid.New().String(), Name: req.Name, Email: req.Email, Phone: req.Phone, Subject: req.Subject, Message: req.Message}
	DB.Create(&cf)
	c.JSON(http.StatusCreated, gin.H{"message": "Амжилттай"})
}

func ConsultationHandler(c *gin.Context) {
	var req ConsultationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	userID, _ := c.Get("userId")
	cons := Consultation{ID: uuid.New().String(), UserID: userID.(string), Name: req.Name, Email: req.Email, Phone: req.Phone, Company: req.Company, ServiceType: req.ServiceType, Message: req.Message, Status: "pending"}
	DB.Create(&cons)
	c.JSON(http.StatusCreated, gin.H{"message": "Амжилттай"})
}

func GetConsultationsHandler(c *gin.Context) {
	userID, _ := c.Get("userId")
	var consultations []Consultation
	DB.Where("user_id = ?", userID).Order("created_at desc").Find(&consultations)
	c.JSON(http.StatusOK, gin.H{"consultations": consultations})
}

func ServiceOrderHandler(c *gin.Context) {
	var req ServiceOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	so := ServiceOrder{ID: uuid.New().String(), Name: req.Name, Email: req.Email, Phone: req.Phone, Company: req.Company, ServiceType: req.ServiceType, Message: req.Message, Date: req.Date}
	DB.Create(&so)
	c.JSON(http.StatusCreated, gin.H{"message": "Амжилттай"})
}

// ── Admin Handlers ───────────────────────────────────────────

func DashboardHandler(c *gin.Context) {
	var totalUsers, totalEnrollments, totalQuizAttempts, totalExamAttempts, totalFeedback, totalSurveys, totalConsultations, totalContactForms int64
	DB.Model(&User{}).Count(&totalUsers)
	DB.Model(&Enrollment{}).Count(&totalEnrollments)
	DB.Model(&QuizAttempt{}).Count(&totalQuizAttempts)
	DB.Model(&ExamAttempt{}).Count(&totalExamAttempts)
	DB.Model(&Feedback{}).Count(&totalFeedback)
	DB.Model(&SurveyResponse{}).Count(&totalSurveys)
	DB.Model(&Consultation{}).Count(&totalConsultations)
	DB.Model(&ContactForm{}).Count(&totalContactForms)

	type CourseStat struct {
		CourseID string `json:"courseId"`
		Title    string `json:"title"`
		Enrolled int64  `json:"enrolled"`
	}
	var courses []Course
	DB.Find(&courses)
	var courseStats []CourseStat
	for _, co := range courses {
		var cnt int64
		DB.Model(&Enrollment{}).Where("course_id = ?", co.ID).Count(&cnt)
		courseStats = append(courseStats, CourseStat{CourseID: co.ID, Title: co.Title, Enrolled: cnt})
	}

	var recentQuizzes []QuizAttempt
	DB.Order("created_at desc").Limit(10).Find(&recentQuizzes)
	var quizResults []gin.H
	for _, qa := range recentQuizzes {
		var quiz Quiz
		DB.Where("id = ?", qa.QuizID).First(&quiz)
		var user User
		DB.Where("id = ?", qa.UserID).First(&user)
		quizResults = append(quizResults, gin.H{
			"id": qa.ID, "quizTitle": quiz.Title, "userName": user.FirstName + " " + user.LastName,
			"score": qa.Score, "total": qa.Total, "createdAt": qa.CreatedAt,
		})
	}

	var recentExams []ExamAttempt
	DB.Order("created_at desc").Limit(10).Find(&recentExams)
	var examResults []gin.H
	for _, ea := range recentExams {
		var exam Exam
		DB.Where("id = ?", ea.ExamID).First(&exam)
		var user User
		DB.Where("id = ?", ea.UserID).First(&user)
		examResults = append(examResults, gin.H{
			"id": ea.ID, "examTitle": exam.Title, "examCode": exam.Code,
			"userName": user.FirstName + " " + user.LastName,
			"score":    ea.Score, "total": ea.Total, "passed": ea.Passed, "createdAt": ea.CreatedAt,
		})
	}

	var feedbacks []Feedback
	DB.Order("created_at desc").Limit(10).Find(&feedbacks)

	var contactForms []ContactForm
	DB.Order("created_at desc").Limit(10).Find(&contactForms)

	var surveys []SurveyResponse
	DB.Order("created_at desc").Limit(10).Find(&surveys)

	var recentEnrollments []Enrollment
	DB.Order("created_at desc").Limit(10).Find(&recentEnrollments)
	var enrollmentResults []gin.H
	for _, en := range recentEnrollments {
		var course Course
		DB.Where("id = ?", en.CourseID).First(&course)
		var user User
		DB.Where("id = ?", en.UserID).First(&user)
		enrollmentResults = append(enrollmentResults, gin.H{
			"id": en.ID, "courseTitle": course.Title, "courseCategory": course.Category,
			"userName": user.FirstName + " " + user.LastName, "userEmail": user.Email,
			"paid": en.Paid, "createdAt": en.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"totalUsers": totalUsers, "totalEnrollments": totalEnrollments,
		"totalQuizAttempts": totalQuizAttempts, "totalExamAttempts": totalExamAttempts,
		"totalFeedback": totalFeedback, "totalSurveys": totalSurveys,
		"totalConsultations": totalConsultations, "totalContactForms": totalContactForms,
		"courseStats": courseStats, "recentQuizResults": quizResults,
		"recentExamResults": examResults, "recentFeedback": feedbacks,
		"recentContactForms": contactForms, "recentSurveys": surveys, "recentEnrollments": enrollmentResults,
	})
}

func AdminGetExamsHandler(c *gin.Context) {
	var exams []Exam
	DB.Order("created_at desc").Find(&exams)
	var result []gin.H
	for _, e := range exams {
		var cnt int64
		DB.Model(&ExamAttempt{}).Where("exam_id = ?", e.ID).Count(&cnt)
		result = append(result, gin.H{
			"id": e.ID, "title": e.Title, "code": e.Code,
			"duration": e.Duration, "questionCount": e.QuestionCount,
			"isActive": e.IsActive, "attempts": cnt, "createdAt": e.CreatedAt,
			"endDate": e.EndDate,
		})
	}
	c.JSON(http.StatusOK, gin.H{"exams": result})
}

func AdminCreateExamHandler(c *gin.Context) {
	var req AdminCreateExamRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	code := generateCode()
	for {
		var ex Exam
		if DB.Where("code = ?", code).First(&ex).Error != nil {
			break
		}
		code = generateCode()
	}
	duration := req.Duration
	if duration == 0 {
		duration = 30
	}

	var endDate *time.Time
	if req.EndDate != nil && *req.EndDate != "" {
		t, err := time.Parse("2006-01-02", *req.EndDate)
		if err == nil {
			endDate = &t
		}
	}

	exam := Exam{ID: uuid.New().String(), Title: req.Title, Code: code, Duration: duration, QuestionCount: len(req.Questions), IsActive: true, EndDate: endDate}
	if err := DB.Create(&exam).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create exam"})
		return
	}

	for i, q := range req.Questions {
		qq := ExamQuestion{ID: uuid.New().String(), ExamID: exam.ID, Question: q.Question, OptionA: q.OptionA, OptionB: q.OptionB, OptionC: q.OptionC, OptionD: q.OptionD, Correct: q.Correct, Index: i}
		DB.Create(&qq)
	}

	log.Printf("Exam created: %s (code: %s, questions: %d)", req.Title, code, len(req.Questions))
	c.JSON(http.StatusCreated, gin.H{"exam": gin.H{"id": exam.ID, "title": exam.Title, "code": code, "duration": duration, "questionCount": len(req.Questions), "isActive": true, "endDate": endDate}})
}

func AdminGetExamAttemptsHandler(c *gin.Context) {
	var attempts []ExamAttempt
	DB.Order("created_at desc").Find(&attempts)
	var result []gin.H
	for _, a := range attempts {
		var exam Exam
		DB.Where("id = ?", a.ExamID).First(&exam)
		var user User
		DB.Where("id = ?", a.UserID).First(&user)
		name := user.FirstName + " " + user.LastName
		if name == " " {
			name = user.Email
		}
		result = append(result, gin.H{
			"id": a.ID, "examTitle": exam.Title, "examCode": exam.Code,
			"userId": a.UserID, "userName": name,
			"score": a.Score, "total": a.Total, "passed": a.Passed, "createdAt": a.CreatedAt,
		})
	}
	c.JSON(http.StatusOK, gin.H{"attempts": result})
}

func AdminExportExamAttemptsHandler(c *gin.Context) {
	var attempts []ExamAttempt
	DB.Order("created_at desc").Find(&attempts)

	c.Header("Content-Type", "text/csv; charset=utf-8")
	c.Header("Content-Disposition", "attachment; filename=exam_attempts.csv")
	writer := csv.NewWriter(c.Writer)
	writer.Write([]string{"ID", "Шалгалт", "Код", "Хэрэглэгч", "Оноо", "Нийт", "Тэнцсэн", "Огноо"})
	for _, a := range attempts {
		var exam Exam
		DB.Where("id = ?", a.ExamID).First(&exam)
		var user User
		DB.Where("id = ?", a.UserID).First(&user)
		name := user.FirstName + " " + user.LastName
		writer.Write([]string{a.ID, exam.Title, exam.Code, name, fmt.Sprintf("%d", a.Score), fmt.Sprintf("%d", a.Total), fmt.Sprintf("%v", a.Passed), a.CreatedAt.Format("2006-01-02 15:04:05")})
	}
	writer.Flush()
}

func AdminGetCoursesHandler(c *gin.Context) {
	var courses []Course
	DB.Order("created_at desc").Find(&courses)
	var result []gin.H
	for _, co := range courses {
		var cnt int64
		DB.Model(&Enrollment{}).Where("course_id = ?", co.ID).Count(&cnt)
		result = append(result, gin.H{"id": co.ID, "title": co.Title, "category": co.Category, "description": co.Description, "duration": co.Duration, "price": co.Price, "schedule": co.Schedule, "location": co.Location, "maxStudents": co.MaxStudents, "enrolled": cnt})
	}
	c.JSON(http.StatusOK, gin.H{"courses": result})
}

func AdminGetCourseEnrollmentsHandler(c *gin.Context) {
	courseID := c.Param("id")
	var enrollments []Enrollment
	DB.Where("course_id = ?", courseID).Order("created_at desc").Find(&enrollments)

	var result []gin.H
	for _, e := range enrollments {
		var user User
		DB.Where("id = ?", e.UserID).First(&user)
		result = append(result, gin.H{
			"enrollmentId": e.ID,
			"userId":       user.ID,
			"firstName":    user.FirstName,
			"lastName":     user.LastName,
			"email":        user.Email,
			"phone":        user.Phone,
			"paid":         e.Paid,
			"createdAt":    e.CreatedAt,
		})
	}
	c.JSON(http.StatusOK, gin.H{"enrollments": result, "total": len(result)})
}

func AdminCreateCourseHandler(c *gin.Context) {
	var req AdminCreateCourseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	max := 30
	if req.MaxStudents != nil {
		max = *req.MaxStudents
	}
	course := Course{ID: uuid.New().String(), Title: req.Title, Category: req.Category, Description: req.Description, Duration: req.Duration, Price: req.Price, Schedule: req.Schedule, Location: req.Location, StartDate: req.StartDate, MaxStudents: max}
	DB.Create(&course)
	c.JSON(http.StatusCreated, gin.H{"course": course})
}

func AdminGetQuizzesHandler(c *gin.Context) {
	var quizzes []Quiz
	DB.Order("created_at desc").Find(&quizzes)
	c.JSON(http.StatusOK, gin.H{"quizzes": quizzes})
}

func AdminCreateQuizHandler(c *gin.Context) {
	var req AdminCreateQuizRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	quiz := Quiz{ID: uuid.New().String(), Title: req.Title, Description: req.Description, Category: req.Category, QuestionCount: len(req.Questions)}
	DB.Create(&quiz)
	for i, q := range req.Questions {
		qq := QuizQuestion{ID: uuid.New().String(), QuizID: quiz.ID, Question: q.Question, OptionA: q.OptionA, OptionB: q.OptionB, OptionC: q.OptionC, OptionD: q.OptionD, Correct: q.Correct, Index: i}
		DB.Create(&qq)
	}
	c.JSON(http.StatusCreated, gin.H{"quiz": quiz})
}

func AdminGetStudentsHandler(c *gin.Context) {
	var users []User
	DB.Where("role = ?", "USER").Order("created_at desc").Find(&users)
	var result []gin.H
	for _, u := range users {
		var enrollCount int64
		DB.Model(&Enrollment{}).Where("user_id = ?", u.ID).Count(&enrollCount)
		var quizCount int64
		DB.Model(&QuizAttempt{}).Where("user_id = ?", u.ID).Count(&quizCount)
		var examCount int64
		DB.Model(&ExamAttempt{}).Where("user_id = ?", u.ID).Count(&examCount)
		result = append(result, gin.H{"userId": u.ID, "name": u.FirstName + " " + u.LastName, "email": u.Email, "phone": u.Phone, "enrollments": enrollCount, "quizAttempts": quizCount, "examAttempts": examCount, "createdAt": u.CreatedAt})
	}
	c.JSON(http.StatusOK, gin.H{"students": result})
}

func AdminGetFeedbackHandler(c *gin.Context) {
	var feedbacks []Feedback
	DB.Order("created_at desc").Find(&feedbacks)
	c.JSON(http.StatusOK, gin.H{"feedback": feedbacks})
}

func AdminGetSurveyResultsHandler(c *gin.Context) {
	GetSurveyResultsHandler(c)
}

func AdminExportHandler(c *gin.Context) {
	var users []User
	DB.Find(&users)
	var enrollments []Enrollment
	DB.Find(&enrollments)
	var quizAttempts []QuizAttempt
	DB.Find(&quizAttempts)
	var examAttempts []ExamAttempt
	DB.Find(&examAttempts)
	var feedbacks []Feedback
	DB.Find(&feedbacks)
	var surveys []SurveyResponse
	DB.Find(&surveys)

	c.JSON(http.StatusOK, gin.H{
		"users": users, "enrollments": enrollments, "quizAttempts": quizAttempts,
		"examAttempts": examAttempts, "feedback": feedbacks, "surveys": surveys,
		"exportedAt": time.Now().Format(time.RFC3339),
	})
}

func AdminStartExamHandler(c *gin.Context) {
	id := c.Param("id")
	DB.Model(&Exam{}).Where("id = ?", id).Update("is_active", true)
	c.JSON(http.StatusOK, gin.H{"message": "Шалгалт идэвхжлээ"})
}

func AdminGetExamDetailHandler(c *gin.Context) {
	examID := c.Param("id")

	var exam Exam
	if DB.Where("id = ?", examID).First(&exam).Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Шалгалт олдсонгүй"})
		return
	}

	var attempts []ExamAttempt
	DB.Where("exam_id = ?", examID).Order("created_at desc").Find(&attempts)

	var students []gin.H
	var totalScore int
	for _, a := range attempts {
		var user User
		DB.Where("id = ?", a.UserID).First(&user)
		students = append(students, gin.H{
			"userId":    user.ID,
			"firstName": user.FirstName,
			"lastName":  user.LastName,
			"email":     user.Email,
			"phone":     user.Phone,
			"score":     a.Score,
			"total":     a.Total,
			"passed":    a.Passed,
			"timeSpent": a.TimeSpent,
			"createdAt": a.CreatedAt,
		})
		totalScore += a.Score
	}

	averageScore := 0.0
	if len(attempts) > 0 {
		averageScore = float64(totalScore) / float64(len(attempts))
	}

	c.JSON(http.StatusOK, gin.H{
		"exam":          gin.H{"id": exam.ID, "title": exam.Title, "code": exam.Code, "duration": exam.Duration, "questionCount": exam.QuestionCount, "isActive": exam.IsActive, "endDate": exam.EndDate},
		"students":      students,
		"totalStudents": len(students),
		"averageScore":  averageScore,
	})
}

func AdminGetExamQuestionsHandler(c *gin.Context) {
	id := c.Param("id")
	var exam Exam
	if err := DB.Where("id = ?", id).First(&exam).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Шалгалт олдсонгүй"})
		return
	}
	var questions []ExamQuestion
	DB.Where("exam_id = ?", id).Order("index asc").Find(&questions)
	c.JSON(http.StatusOK, gin.H{
		"exam": gin.H{
			"id": exam.ID, "title": exam.Title, "code": exam.Code,
			"duration": exam.Duration, "questionCount": exam.QuestionCount,
			"isActive": exam.IsActive, "createdAt": exam.CreatedAt, "endDate": exam.EndDate,
		},
		"questions": questions,
	})
}

func AdminStopExamHandler(c *gin.Context) {
	id := c.Param("id")
	DB.Model(&Exam{}).Where("id = ?", id).Update("is_active", false)
	c.JSON(http.StatusOK, gin.H{"message": "Шалгалт зогссон"})
}

func AdminDeleteExamHandler(c *gin.Context) {
	id := c.Param("id")
	DB.Where("exam_id = ?", id).Delete(&ExamQuestion{})
	DB.Where("exam_id = ?", id).Delete(&ExamAttempt{})
	DB.Where("id = ?", id).Delete(&Exam{})
	c.JSON(http.StatusOK, gin.H{"message": "Шалгалт устгагдлаа"})
}

// ── Admin Consultation Handlers ────────────────────────────────

func AdminGetConsultationsHandler(c *gin.Context) {
	var consultations []Consultation
	DB.Order("created_at desc").Find(&consultations)
	c.JSON(http.StatusOK, gin.H{"consultations": consultations})
}

func AdminUpdateConsultationStatusHandler(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Status string `json:"status"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.Status != "pending" && req.Status != "in_progress" && req.Status != "completed" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status"})
		return
	}
	DB.Model(&Consultation{}).Where("id = ?", id).Update("status", req.Status)
	c.JSON(http.StatusOK, gin.H{"message": "Төлөв амжилттай шинэчлэгдлээ"})
}

func AdminDeleteConsultationHandler(c *gin.Context) {
	id := c.Param("id")
	DB.Where("id = ?", id).Delete(&Consultation{})
	c.JSON(http.StatusOK, gin.H{"message": "Зөвлөгөөний хүсэлт устгагдлаа"})
}

func AdminReplyConsultationHandler(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Response string `json:"response"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.Response == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Хариулт хоосон байна"})
		return
	}
	DB.Model(&Consultation{}).Where("id = ?", id).Updates(map[string]interface{}{"admin_response": req.Response, "status": "completed"})
	c.JSON(http.StatusOK, gin.H{"message": "Зөвлөмж амжилттай илгээгдлээ"})
}

func MarkConsultationReadHandler(c *gin.Context) {
	id := c.Param("id")
	userID, _ := c.Get("userId")
	DB.Model(&Consultation{}).Where("id = ? AND user_id = ?", id, userID).Update("user_read", true)
	c.JSON(http.StatusOK, gin.H{"message": "Уншсан боллоо"})
}

func GetUnreadConsultationsCountHandler(c *gin.Context) {
	userID, _ := c.Get("userId")
	var count int64
	DB.Model(&Consultation{}).Where("user_id = ? AND admin_response != '' AND user_read = ?", userID, false).Count(&count)
	c.JSON(http.StatusOK, gin.H{"unreadCount": count})
}

// ── Admin Contact Form Handlers ────────────────────────────────

func AdminGetContactFormsHandler(c *gin.Context) {
	var contactForms []ContactForm
	DB.Order("created_at desc").Find(&contactForms)
	c.JSON(http.StatusOK, gin.H{"contactForms": contactForms})
}

func AdminDeleteContactFormHandler(c *gin.Context) {
	id := c.Param("id")
	DB.Where("id = ?", id).Delete(&ContactForm{})
	c.JSON(http.StatusOK, gin.H{"message": "Холбогдох хүсэлт амжилттай устгагдлаа"})
}

func SeedQuizzesHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Quizzes already seeded from database"})
}
