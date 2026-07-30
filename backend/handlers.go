package main

import (
        "encoding/json"
        "log"
        "net/http"
        "strconv"

        "github.com/gin-gonic/gin"
        "github.com/google/uuid"
        "golang.org/x/crypto/bcrypt"
)

// ============================================================
// Request structs
// ============================================================

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
        Name    string `json:"name" binding:"required"`
        Email   string `json:"email" binding:"required"`
        Phone   string `json:"phone"`
        Message string `json:"message" binding:"required"`
        Rating  int    `json:"rating"`
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
        Action  string `json:"action" binding:"required"`
        Code    string `json:"code"`
        ExamID  string `json:"examId"`
        Answers []int  `json:"answers"`
}

type CoursePaymentRequest struct {
        CourseID string `json:"courseId" binding:"required"`
}

type AdminCreateExamRequest struct {
        Title         string `json:"title" binding:"required"`
        Code          string `json:"code" binding:"required"`
        Duration      *int   `json:"duration"`
        QuestionCount *int   `json:"questionCount"`
}

type AdminCreateCourseRequest struct {
        Title       string  `json:"title" binding:"required"`
        Category    string  `json:"category" binding:"required"`
        Description string  `json:"description" binding:"required"`
        Duration    string  `json:"duration" binding:"required"`
        Price       float64 `json:"price"`
        Schedule    string  `json:"schedule"`
        Location    string  `json:"location"`
        MaxStudents *int    `json:"maxStudents"`
}

// ============================================================
// Auth handlers
// ============================================================

func RegisterHandler(c *gin.Context) {
        var req RegisterRequest
        if err := c.ShouldBindJSON(&req); err != nil {
                c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
                return
        }

        var existing User
        if err := DB.Where("email = ?", req.Email).First(&existing).Error; err == nil {
                c.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
                return
        }

        hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
        if err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
                return
        }

        user := User{
                ID:             uuid.New().String(),
                FirstName:      req.FirstName,
                LastName:       req.LastName,
                Email:          req.Email,
                Phone:          req.Phone,
                Password:       string(hashedPassword),
                Address:        req.Address,
                SecondaryPhone: req.SecondaryPhone,
                Role:           "USER",
        }

        if err := DB.Create(&user).Error; err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
                return
        }

        token, err := GenerateToken(user.ID, user.Email, user.Role)
        if err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
                return
        }

        c.JSON(http.StatusCreated, gin.H{
                "user": gin.H{
                        "userId": user.ID,
                        "email":  user.Email,
                        "role":   user.Role,
                },
                "token": token,
        })
}

func LoginHandler(c *gin.Context) {
        var req LoginRequest
        if err := c.ShouldBindJSON(&req); err != nil {
                c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
                return
        }

        var user User
        if err := DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
                c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
                return
        }

        if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
                c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
                return
        }

        token, err := GenerateToken(user.ID, user.Email, user.Role)
        if err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
                return
        }

        c.JSON(http.StatusOK, gin.H{
                "user": gin.H{
                        "userId": user.ID,
                        "email":  user.Email,
                        "role":   user.Role,
                },
                "token": token,
        })
}

func MeHandler(c *gin.Context) {
        userID, _ := c.Get("userId")

        var user User
        if err := DB.Where("id = ?", userID).First(&user).Error; err != nil {
                c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
                return
        }

        c.JSON(http.StatusOK, gin.H{
                "user": gin.H{
                        "userId":    user.ID,
                        "email":     user.Email,
                        "role":      user.Role,
                        "firstName": user.FirstName,
                        "lastName":  user.LastName,
                        "phone":     user.Phone,
                },
        })
}

func AdminLoginHandler(c *gin.Context) {
        var req AdminLoginRequest
        if err := c.ShouldBindJSON(&req); err != nil {
                c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
                return
        }

        if req.Code != "Admin6996" {
                c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid admin code"})
                return
        }

        token, err := GenerateToken("admin", "admin@habea.mn", "ADMIN")
        if err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
                return
        }

        c.JSON(http.StatusOK, gin.H{
                "user": gin.H{
                        "userId": "admin",
                        "email":  "admin@habea.mn",
                        "role":   "ADMIN",
                },
                "token": token,
        })
}

// ============================================================
// Quiz handlers
// ============================================================

func GetQuizzesHandler(c *gin.Context) {
        var quizzes []Quiz
        if err := DB.Find(&quizzes).Error; err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch quizzes"})
                return
        }

        c.JSON(http.StatusOK, gin.H{"quizzes": quizzes})
}

func QuizPaymentHandler(c *gin.Context) {
        var req QuizPaymentRequest
        if err := c.ShouldBindJSON(&req); err != nil {
                c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
                return
        }

        var quiz Quiz
        if err := DB.Where("id = ?", req.QuizID).First(&quiz).Error; err != nil {
                c.JSON(http.StatusNotFound, gin.H{"error": "Quiz not found"})
                return
        }

        c.JSON(http.StatusOK, gin.H{
                "message": "Амжилттай",
                "paid":    true,
        })
}

func QuizSubmitHandler(c *gin.Context) {
        var req QuizSubmitRequest
        if err := c.ShouldBindJSON(&req); err != nil {
                c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
                return
        }

        var questions []QuizQuestion
        if err := DB.Where("quiz_id = ?", req.QuizID).Order("index ASC").Find(&questions).Error; err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch questions"})
                return
        }

        if len(questions) == 0 {
                c.JSON(http.StatusNotFound, gin.H{"error": "Quiz has no questions"})
                return
        }

        questionMap := make(map[string]QuizQuestion)
        for _, q := range questions {
                questionMap[q.ID] = q
        }

        correct := 0
        total := len(questions)
        for _, ans := range req.Answers {
                if q, ok := questionMap[ans.QuestionID]; ok {
                        if ans.SelectedOption == q.Correct {
                                correct++
                        }
                }
        }

        answersJSON, _ := json.Marshal(req.Answers)
        userID, _ := c.Get("userId")

        attempt := QuizAttempt{
                ID:      uuid.New().String(),
                UserID:  userID.(string),
                QuizID:  req.QuizID,
                Score:   correct,
                Total:   total,
                Answers: string(answersJSON),
        }
        DB.Create(&attempt)

        percentage := 0
        if total > 0 {
                percentage = (correct * 100) / total
        }

        c.JSON(http.StatusOK, gin.H{
                "score":      correct,
                "total":      total,
                "correct":    correct,
                "percentage": percentage,
        })
}

// ============================================================
// Exam handlers
// ============================================================

func ExamHandler(c *gin.Context) {
        var req ExamActionRequest
        if err := c.ShouldBindJSON(&req); err != nil {
                c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
                return
        }

        switch req.Action {
        case "verify":
                verifyExamCode(c, req.Code)
        case "submit":
                submitExam(c, req)
        default:
                c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid action"})
        }
}

func verifyExamCode(c *gin.Context, code string) {
        var exam Exam
        if err := DB.Where("code = ? AND is_active = ?", code, true).First(&exam).Error; err != nil {
                c.JSON(http.StatusNotFound, gin.H{"error": "Invalid or inactive exam code"})
                return
        }

        c.JSON(http.StatusOK, gin.H{
                "exam": gin.H{
                        "id":            exam.ID,
                        "title":         exam.Title,
                        "duration":      exam.Duration,
                        "questionCount": exam.QuestionCount,
                },
        })
}

func submitExam(c *gin.Context, req ExamActionRequest) {
        userID, _ := c.Get("userId")

        var exam Exam
        if err := DB.Where("id = ?", req.ExamID).First(&exam).Error; err != nil {
                c.JSON(http.StatusNotFound, gin.H{"error": "Exam not found"})
                return
        }

        if !exam.IsActive {
                c.JSON(http.StatusBadRequest, gin.H{"error": "Exam is not active"})
                return
        }

        var questions []QuizQuestion
        DB.Where("quiz_id = ?", req.ExamID).Order("index ASC").Find(&questions)

        score := 0
        total := len(questions)
        for i, answer := range req.Answers {
                if i < len(questions) && answer == questions[i].Correct {
                        score++
                }
        }

        passed := false
        if total > 0 {
                passed = float64(score)/float64(total) >= 0.7
        }

        answersJSON, _ := json.Marshal(req.Answers)

        attempt := ExamAttempt{
                ID:      uuid.New().String(),
                ExamID:  req.ExamID,
                UserID:  userID.(string),
                Score:   score,
                Total:   total,
                Passed:  passed,
                Answers: string(answersJSON),
        }

        if err := DB.Create(&attempt).Error; err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save attempt"})
                return
        }

        c.JSON(http.StatusOK, gin.H{
                "score":  score,
                "total":  total,
                "passed": passed,
        })
}

// ============================================================
// Course handlers
// ============================================================

func GetCoursesHandler(c *gin.Context) {
        var courses []Course
        if err := DB.Find(&courses).Error; err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch courses"})
                return
        }

        c.JSON(http.StatusOK, gin.H{"courses": courses})
}

func CoursePaymentHandler(c *gin.Context) {
        var req CoursePaymentRequest
        if err := c.ShouldBindJSON(&req); err != nil {
                c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
                return
        }

        userID, _ := c.Get("userId")

        var course Course
        if err := DB.Where("id = ?", req.CourseID).First(&course).Error; err != nil {
                c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
                return
        }

        enrollment := Enrollment{
                ID:       uuid.New().String(),
                UserID:   userID.(string),
                CourseID: req.CourseID,
                Paid:     true,
        }

        if err := DB.Create(&enrollment).Error; err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process payment"})
                return
        }

        c.JSON(http.StatusOK, gin.H{
                "message": "Амжилттай",
                "paid":    true,
        })
}

// ============================================================
// Form handlers (public POST)
// ============================================================

func ContactHandler(c *gin.Context) {
        var req ContactRequest
        if err := c.ShouldBindJSON(&req); err != nil {
                c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
                return
        }

        contact := ContactForm{
                ID:      uuid.New().String(),
                Name:    req.Name,
                Email:   req.Email,
                Phone:   req.Phone,
                Subject: req.Subject,
                Message: req.Message,
        }

        if err := DB.Create(&contact).Error; err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save contact"})
                return
        }

        c.JSON(http.StatusOK, gin.H{"message": "Амжилттай"})
}

func FeedbackHandler(c *gin.Context) {
        var req FeedbackRequest
        if err := c.ShouldBindJSON(&req); err != nil {
                c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
                return
        }

        feedback := Feedback{
                ID:      uuid.New().String(),
                Name:    req.Name,
                Email:   req.Email,
                Phone:   req.Phone,
                Message: req.Message,
                Rating:  req.Rating,
        }

        if err := DB.Create(&feedback).Error; err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save feedback"})
                return
        }

        c.JSON(http.StatusOK, gin.H{"message": "Амжилттай"})
}

func SurveyHandler(c *gin.Context) {
        var req SurveyRequest
        if err := c.ShouldBindJSON(&req); err != nil {
                c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
                return
        }

        survey := SurveyResponse{
                ID:        uuid.New().String(),
                Name:      req.Name,
                Email:     req.Email,
                Phone:     req.Phone,
                Responses: req.Responses,
        }

        if err := DB.Create(&survey).Error; err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save survey"})
                return
        }

        c.JSON(http.StatusOK, gin.H{"message": "Амжилттай"})
}

func ConsultationHandler(c *gin.Context) {
        var req ConsultationRequest
        if err := c.ShouldBindJSON(&req); err != nil {
                c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
                return
        }

        order := ServiceOrder{
                ID:          uuid.New().String(),
                Name:        req.Name,
                Email:       req.Email,
                Phone:       req.Phone,
                Company:     req.Company,
                ServiceType: req.ServiceType,
                Message:     req.Message,
        }

        if err := DB.Create(&order).Error; err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save consultation"})
                return
        }

        c.JSON(http.StatusOK, gin.H{"message": "Амжилттай"})
}

func ServiceOrderHandler(c *gin.Context) {
        var req ServiceOrderRequest
        if err := c.ShouldBindJSON(&req); err != nil {
                c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
                return
        }

        order := ServiceOrder{
                ID:          uuid.New().String(),
                Name:        req.Name,
                Email:       req.Email,
                Phone:       req.Phone,
                Company:     req.Company,
                ServiceType: req.ServiceType,
                Message:     req.Message,
                Date:        req.Date,
        }

        if err := DB.Create(&order).Error; err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save service order"})
                return
        }

        c.JSON(http.StatusOK, gin.H{"message": "Амжилттай"})
}

// ============================================================
// Profile handlers
// ============================================================

func GetProfileHandler(c *gin.Context) {
        userID, _ := c.Get("userId")
        section := c.Query("section")

        switch section {
        case "quizzes":
                getQuizResults(c, userID.(string))
        case "exams":
                getExamResults(c, userID.(string))
        case "courses":
                getCourseRegistrations(c, userID.(string))
        default:
                getBasicProfile(c, userID.(string))
        }
}

func getBasicProfile(c *gin.Context, userID string) {
        var user User
        if err := DB.Where("id = ?", userID).First(&user).Error; err != nil {
                c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
                return
        }

        c.JSON(http.StatusOK, gin.H{
                "user": gin.H{
                        "userId":         user.ID,
                        "email":          user.Email,
                        "role":           user.Role,
                        "firstName":      user.FirstName,
                        "lastName":       user.LastName,
                        "phone":          user.Phone,
                        "address":        user.Address,
                        "secondaryPhone": user.SecondaryPhone,
                },
        })
}

func getQuizResults(c *gin.Context, userID string) {
        var attempts []QuizAttempt
        if err := DB.Where("user_id = ?", userID).Order("created_at DESC").Find(&attempts).Error; err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch quiz results"})
                return
        }

        type QuizResultItem struct {
                ID        string `json:"id"`
                QuizID    string `json:"quizId"`
                Score     int    `json:"score"`
                Total     int    `json:"total"`
                CreatedAt string `json:"createdAt"`
                Quiz      gin.H  `json:"quiz"`
        }

        results := make([]QuizResultItem, len(attempts))
        for i, a := range attempts {
                var quiz Quiz
                DB.Select("id, title").Where("id = ?", a.QuizID).First(&quiz)

                results[i] = QuizResultItem{
                        ID:        a.ID,
                        QuizID:    a.QuizID,
                        Score:     a.Score,
                        Total:     a.Total,
                        CreatedAt: a.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
                        Quiz:      gin.H{"title": quiz.Title},
                }
        }

        c.JSON(http.StatusOK, gin.H{"quizzes": results})
}

func getExamResults(c *gin.Context, userID string) {
        var attempts []ExamAttempt
        if err := DB.Where("user_id = ?", userID).Order("created_at DESC").Find(&attempts).Error; err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch exam results"})
                return
        }

        type ExamResultItem struct {
                ID        string `json:"id"`
                ExamID    string `json:"examId"`
                Score     int    `json:"score"`
                Total     int    `json:"total"`
                Passed    bool   `json:"passed"`
                CreatedAt string `json:"createdAt"`
                Exam      gin.H  `json:"exam"`
        }

        results := make([]ExamResultItem, len(attempts))
        for i, a := range attempts {
                var exam Exam
                DB.Select("id, title").Where("id = ?", a.ExamID).First(&exam)

                results[i] = ExamResultItem{
                        ID:        a.ID,
                        ExamID:    a.ExamID,
                        Score:     a.Score,
                        Total:     a.Total,
                        Passed:    a.Passed,
                        CreatedAt: a.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
                        Exam:      gin.H{"title": exam.Title},
                }
        }

        c.JSON(http.StatusOK, gin.H{"exams": results})
}

func getCourseRegistrations(c *gin.Context, userID string) {
        var enrollments []Enrollment
        if err := DB.Where("user_id = ?", userID).Order("created_at DESC").Find(&enrollments).Error; err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch registrations"})
                return
        }

        type CourseRegItem struct {
                ID        string `json:"id"`
                CourseID  string `json:"courseId"`
                Paid      bool   `json:"paid"`
                CreatedAt string `json:"createdAt"`
                Course    gin.H  `json:"course"`
        }

        results := make([]CourseRegItem, len(enrollments))
        for i, e := range enrollments {
                var course Course
                DB.Select("id, title, category, duration").Where("id = ?", e.CourseID).First(&course)

                results[i] = CourseRegItem{
                        ID:        e.ID,
                        CourseID:  e.CourseID,
                        Paid:      e.Paid,
                        CreatedAt: e.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
                        Course: gin.H{
                                "title":    course.Title,
                                "category": course.Category,
                                "duration": course.Duration,
                        },
                }
        }

        c.JSON(http.StatusOK, gin.H{"courses": results})
}

// ============================================================
// Admin handlers
// ============================================================

func AdminGetExamsHandler(c *gin.Context) {
        var exams []Exam
        if err := DB.Order("created_at DESC").Find(&exams).Error; err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch exams"})
                return
        }

        type ExamWithCount struct {
                ID            string `json:"id"`
                Title         string `json:"title"`
                Code          string `json:"code"`
                Duration      int    `json:"duration"`
                QuestionCount int    `json:"questionCount"`
                IsActive      bool   `json:"isActive"`
                CreatedAt     string `json:"createdAt"`
                AttemptCount  int    `json:"attemptCount"`
        }

        result := make([]ExamWithCount, len(exams))
        for i, exam := range exams {
                var attemptCount int64
                DB.Model(&ExamAttempt{}).Where("exam_id = ?", exam.ID).Count(&attemptCount)

                result[i] = ExamWithCount{
                        ID:            exam.ID,
                        Title:         exam.Title,
                        Code:          exam.Code,
                        Duration:      exam.Duration,
                        QuestionCount: exam.QuestionCount,
                        IsActive:      exam.IsActive,
                        CreatedAt:     exam.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
                        AttemptCount:  int(attemptCount),
                }
        }

        c.JSON(http.StatusOK, gin.H{"exams": result})
}

func AdminCreateExamHandler(c *gin.Context) {
        var req AdminCreateExamRequest
        if err := c.ShouldBindJSON(&req); err != nil {
                c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
                return
        }

        duration := 60
        qCount := 20
        if req.Duration != nil {
                duration = *req.Duration
        }
        if req.QuestionCount != nil {
                qCount = *req.QuestionCount
        }

        exam := Exam{
                ID:            uuid.New().String(),
                Title:         req.Title,
                Code:          req.Code,
                Duration:      duration,
                QuestionCount: qCount,
                IsActive:      false,
        }

        if err := DB.Create(&exam).Error; err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create exam"})
                return
        }

        c.JSON(http.StatusCreated, gin.H{"exam": exam})
}

func AdminStartExamHandler(c *gin.Context) {
        examID := c.Param("id")

        if err := DB.Model(&Exam{}).Where("id = ?", examID).Update("is_active", true).Error; err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to activate exam"})
                return
        }

        c.JSON(http.StatusOK, gin.H{"message": "Эхлүүллээ"})
}

func AdminExamResultsHandler(c *gin.Context) {
        examID := c.Param("id")

        var attempts []ExamAttempt
        if err := DB.Where("exam_id = ?", examID).Order("created_at DESC").Find(&attempts).Error; err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch results"})
                return
        }

        type ResultItem struct {
                ID        string `json:"id"`
                UserID    string `json:"userId"`
                Score     int    `json:"score"`
                Total     int    `json:"total"`
                Passed    bool   `json:"passed"`
                CreatedAt string `json:"createdAt"`
                User      gin.H  `json:"user"`
        }

        results := make([]ResultItem, len(attempts))
        for i, a := range attempts {
                var user User
                DB.Select("id, first_name, last_name, email").Where("id = ?", a.UserID).First(&user)

                results[i] = ResultItem{
                        ID:        a.ID,
                        UserID:    a.UserID,
                        Score:     a.Score,
                        Total:     a.Total,
                        Passed:    a.Passed,
                        CreatedAt: a.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
                        User: gin.H{
                                "firstName": user.FirstName,
                                "lastName":  user.LastName,
                                "email":     user.Email,
                        },
                }
        }

        c.JSON(http.StatusOK, gin.H{"attempts": results})
}

func AdminGetCoursesHandler(c *gin.Context) {
        var courses []Course
        if err := DB.Order("created_at DESC").Find(&courses).Error; err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch courses"})
                return
        }

        type CourseWithCount struct {
                ID          string  `json:"id"`
                Title       string  `json:"title"`
                Category    string  `json:"category"`
                Description string  `json:"description"`
                Duration    string  `json:"duration"`
                Price       float64 `json:"price"`
                Schedule    string  `json:"schedule"`
                Location    string  `json:"location"`
                MaxStudents int     `json:"maxStudents"`
                CreatedAt   string  `json:"createdAt"`
                PaidCount   int     `json:"paidCount"`
        }

        result := make([]CourseWithCount, len(courses))
        for i, course := range courses {
                var paidCount int64
                DB.Model(&Enrollment{}).Where("course_id = ? AND paid = ?", course.ID, true).Count(&paidCount)

                result[i] = CourseWithCount{
                        ID:          course.ID,
                        Title:       course.Title,
                        Category:    course.Category,
                        Description: course.Description,
                        Duration:    course.Duration,
                        Price:       course.Price,
                        Schedule:    course.Schedule,
                        Location:    course.Location,
                        MaxStudents: course.MaxStudents,
                        CreatedAt:   course.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
                        PaidCount:   int(paidCount),
                }
        }

        c.JSON(http.StatusOK, gin.H{"courses": result})
}

func AdminCreateCourseHandler(c *gin.Context) {
        var req AdminCreateCourseRequest
        if err := c.ShouldBindJSON(&req); err != nil {
                c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
                return
        }

        maxStudents := 30
        if req.MaxStudents != nil {
                maxStudents = *req.MaxStudents
        }

        course := Course{
                ID:          uuid.New().String(),
                Title:       req.Title,
                Category:    req.Category,
                Description: req.Description,
                Duration:    req.Duration,
                Price:       req.Price,
                Schedule:    req.Schedule,
                Location:    req.Location,
                MaxStudents: maxStudents,
        }

        if err := DB.Create(&course).Error; err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create course"})
                return
        }

        c.JSON(http.StatusCreated, gin.H{"course": course})
}

func AdminGetStudentsHandler(c *gin.Context) {
        var users []User
        if err := DB.Where("role = ?", "USER").Order("created_at DESC").Find(&users).Error; err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch students"})
                return
        }

        type StudentWithStats struct {
                ID              string `json:"id"`
                FirstName       string `json:"firstName"`
                LastName        string `json:"lastName"`
                Email           string `json:"email"`
                Phone           string `json:"phone"`
                Address         string `json:"address"`
                SecondaryPhone  string `json:"secondaryPhone"`
                CreatedAt       string `json:"createdAt"`
                CourseCount     int    `json:"courseCount"`
                ExamAttemptCount int   `json:"examAttemptCount"`
                QuizAttemptCount int   `json:"quizAttemptCount"`
        }

        result := make([]StudentWithStats, len(users))
        for i, user := range users {
                var courseCount, examCount, quizCount int64
                DB.Model(&Enrollment{}).Where("user_id = ?", user.ID).Count(&courseCount)
                DB.Model(&ExamAttempt{}).Where("user_id = ?", user.ID).Count(&examCount)
                DB.Model(&QuizAttempt{}).Where("user_id = ?", user.ID).Count(&quizCount)

                result[i] = StudentWithStats{
                        ID:              user.ID,
                        FirstName:       user.FirstName,
                        LastName:        user.LastName,
                        Email:           user.Email,
                        Phone:           user.Phone,
                        Address:         user.Address,
                        SecondaryPhone:  user.SecondaryPhone,
                        CreatedAt:       user.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
                        CourseCount:     int(courseCount),
                        ExamAttemptCount: int(examCount),
                        QuizAttemptCount: int(quizCount),
                }
        }

        c.JSON(http.StatusOK, gin.H{"students": result})
}

func AdminExportHandler(c *gin.Context) {
        var users []User
        DB.Find(&users)

        var courses []Course
        DB.Find(&courses)

        var enrollments []Enrollment
        DB.Find(&enrollments)

        var exams []Exam
        DB.Find(&exams)

        var examAttempts []ExamAttempt
        DB.Find(&examAttempts)

        var quizzes []Quiz
        DB.Find(&quizzes)

        var quizAttempts []QuizAttempt
        DB.Find(&quizAttempts)

        var contacts []ContactForm
        DB.Find(&contacts)

        var feedbacks []Feedback
        DB.Find(&feedbacks)

        var surveys []SurveyResponse
        DB.Find(&surveys)

        var serviceOrders []ServiceOrder
        DB.Find(&serviceOrders)

        c.JSON(http.StatusOK, gin.H{
                "data": gin.H{
                        "users":          users,
                        "courses":        courses,
                        "enrollments":    enrollments,
                        "exams":          exams,
                        "examAttempts":   examAttempts,
                        "quizzes":        quizzes,
                        "quizAttempts":   quizAttempts,
                        "contacts":       contacts,
                        "feedbacks":      feedbacks,
                        "surveys":        surveys,
                        "serviceOrders":  serviceOrders,
                },
        })
}

func AdminSeedQuizHandler(c *gin.Context) {
        count := seedQuizzes()
        c.JSON(http.StatusOK, gin.H{
                "message": "Амжилттай",
                "count":   count,
        })
}

// ============================================================
// Seed data
// ============================================================

func seedCourses() {
        var count int64
        DB.Model(&Course{}).Count(&count)
        if count > 0 {
                return
        }

        courses := []Course{
                {
                        ID:          uuid.New().String(),
                        Title:       "ХАБЭА-ын суурь сургалт",
                        Category:    "ХАБЭА",
                        Description: "Ажлын байранд аюулгүй ажиллагааны үндсэн мэдлэг, хууль эрх зүйн орчин, ажилтны эрх үүргийн талаар суурь сургалт. ХАБЭА-ын хууль тогтоомж, стандартыг судлах.",
                        Duration:    "3 хоног",
                        Price:       150000,
                        Schedule:    "Даваа-Гараг, 09:00-17:00",
                        Location:    "Улаанбаатар, ХАБЭА Төв",
                        MaxStudents: 30,
                },
                {
                        ID:          uuid.New().String(),
                        Title:       "Аюулгүй ажиллагааны дэлгэрэнгүй сургалт",
                        Category:    "Аюулгүй ажиллагаа",
                        Description: "Ажлын байранд аюулгүй ажиллагааны дэлгэрэнгүй журам, хамгаалалтын хэрэгсэл хэрэглэх, онцгой нөхцөлд үйлдэх аргуудыг сурах дэлгэрэнгүй сургалт.",
                        Duration:    "5 хоног",
                        Price:       250000,
                        Schedule:    "Даваа-Баасан, 09:00-17:00",
                        Location:    "Улаанбаатар, ХАБЭА Төв",
                        MaxStudents: 25,
                },
                {
                        ID:          uuid.New().String(),
                        Title:       "Гал түймрийн урьдчилан сэргийлэлт",
                        Category:    "Гал түймэр",
                        Description: "Гал түймрийн урьдчилан сэргийлэх аргууд, унтраагуур хэрэглэх, яаралтай эвакуацлалт хийх дадал сургуулилт.",
                        Duration:    "2 хоног",
                        Price:       100000,
                        Schedule:    "Бямба-Ням, 10:00-16:00",
                        Location:    "Улаанбаатар, Гал унтлагын байр",
                        MaxStudents: 20,
                },
        }

        for _, course := range courses {
                DB.Create(&course)
        }
        log.Printf("Seeded %d courses", len(courses))
}

func seedQuizzes() int {
        var count int64
        DB.Model(&Quiz{}).Count(&count)
        if count > 0 {
                return int(count)
        }

        quizDefs := []struct {
                title       string
                description string
                category    string
                questions   []struct {
                        q       string
                        options []string
                        correct int
                }
        }{
                // === Category 1: ХАБЭА-ын хууль эрх зүй (3 quizzes) ===
                {
                        title:       "ХАБЭА-ын хууль эрх зүй - I",
                        description: "ХАБЭА-ын хууль тогтоомж, стандартын үндсэн мэдлэг",
                        category:    "ХАБЭА-ын хууль эрх зүй",
                        questions: []struct {
                                q       string
                                options []string
                                correct int
                        }{
                                {"Монгол Улсын ХАБЭА-ын тухай хууль хэзээ батлагдсан бэ?", []string{"2005", "2008", "2014", "2018"}, 2},
                                {"Ажил олгогч нь ажилтны аюулгүй байдлыг хангах үндсэн үүрэгтэй эсэх?", []string{"Тийм", "Үгүй", "Зөвхөн том аж ахуйн нэгж", "Зөвхөн уул уурхай"}, 0},
                                {"ХАБЭА-ын хяналтын байгууллага ямар байгууллага вэ?", []string{"Засгийн газар", "Хөдөлмөрийн хяналтын газар", "Улсын онцгой комисс", "Иргэний хамгаалалт"}, 1},
                                {"Ажилтэн ажлын байрандаа аюулгүй ажиллагааг хангах эрхтэй эсэх?", []string{"Тийм", "Үгүй", "Зөвхөн менежер", "Зөвхөн инженер"}, 0},
                                {"ХАБЭА-ын бодлогод хэн гол үүрэг гүйцэтгэдэг вэ?", []string{"Ажилтан", "Ажил олгогч", "Төрийн байгууллага", "Бүгд"}, 3},
                                {"Ажлын байрны гэрээт ажилд хАБЭА-ын шаардлага хамаарах уу?", []string{"Хамаарахгүй", "Хамаарна", "Зөвхөн бүтэн цаг", "Зөвхөн үйлдвэр"}, 1},
                                {"Ажилтны эрүүл мэндийн шалгалт хийлгэх хугацаа хэд вэ?", []string{"Жил бүр", "2 жилд нэг", "6 сард нэг", "Ажилд орох үед л"}, 0},
                                {"Ажил олгогч ХАБЭА-ын сургалт зохион байгуулах үүрэгтэй эсэх?", []string{"Тийм", "Үгүй", "Зөвхөн том компаниуд", "Ажилтны өөрийн үүрэг"}, 0},
                                {"Ажлын байрны осол гэмтэлд нөхөн төлбөр олгох эрх зүйн үндэс юу вэ?", []string{"ХАБЭА-ын хууль", "Иргэний хууль", "Хөдөлмөрийн хууль", "Бүгдээс дээрх"}, 3},
                                {"Ажил олгогч ажилтанд хАБЭА-ын тухай мэдээлэл өгөх үүрэгтэй эсэх?", []string{"Тийм", "Үгүй", "Хүсвэл өгнө", "Зөвхөн шаардлагатай үед"}, 0},
                                {"Монгол Улсын Хөдөлмөрийн хуулиар ажилтны хамгаалалтын ямар үндсэн эрхийг баталгаажуулдаг вэ?", []string{"Аюулгүй ажлын орчин", "Нийгмийн даатгал", "Эрүүл мэндийн даатгал", "Бүгд"}, 3},
                                {"Ажил олгогч ажилтанд хамгаалалтын хэрэгсэл өгөх үүрэгтэй эсэх?", []string{"Тийм", "Үгүй", "Зөвхөн аюултай ажилд", "Ажилтан өөрөө худалдаж авна"}, 0},
                                {"ХАБЭА-ын зөрчилд торгууль ногдуулах эрх хэн дээр байдаг вэ?", []string{"Цагдаа", "ХАБЭА-ын хяналтын газар", "Шүүх", "Прокурор"}, 1},
                                {"Ажилтний хАБЭА-ын сургалтын хамгийн бага хугацаа хэд хоног вэ?", []string{"1 хоног", "3 хоног", "5 хоног", "10 хоног"}, 1},
                                {"Ажлын байранд осол гарахад ямар эхний үйлдэл хийх ёстой вэ?", []string{"Ажлыг үргэлжлүүлэх", "Аюулгүй байр руу явах", "Утасдаж дуудах", "Б болон В"}, 3},
                                {"ХАБЭА-ын гэрээнд юу орно?", []string{"Ажилтны үүрэг", "Ажил олгогчийн үүрэг", "Хамгааллын хэрэгслийн жагсаалт", "Бүгд"}, 3},
                                {"Ажил олгогч ХАБЭА-ын мэргэжилтэн томилох үүрэгтэй эсэх?", []string{"Тийм", "Үгүй", "Зөвхөн 50-аас дээш ажилтантай", "Зөвхөн үйлдвэр"}, 0},
                                {"ХАБЭА-ын хууль тогтоомж хүүхдийн ажилд хамаарах уу?", []string{"Хамаарахгүй", "Хамаарна", "Зөвхөн 18-аас дээш насныхан", "Хуваарьтай"}, 1},
                                {"Ажилтан аюултай нөхцөлд ажиллахаас татгалзах эрхтэй эсэх?", []string{"Тийм", "Үгүй", "Зөвхөн өвчинтэй үед", "Зөвхөн эмэгтэй"}, 0},
                                {"ХАБЭА-ын хяналтын байгууллагын үндсэн зорилго юу вэ?", []string{"Торгууль ногдуулах", "Ажилтнийг хамгаалах", "Ажил олгогчийг дэмжих", "Ажлын байрны аюулгүй байдлыг хангах"}, 3},
                },
                },
                {
                        title:       "ХАБЭА-ын хууль эрх зүй - II",
                        description: "ХАБЭА-ын хариуцлагын асуудал, торгууль, шагнал",
                        category:    "ХАБЭА-ын хууль эрх зүй",
                        questions: []struct {
                                q       string
                                options []string
                                correct int
                        }{
                                {"ХАБЭА-ын зөрчилд ногдох торгуулийн хэмжээ хэд вэ?", []string{"10,000-50,000₮", "50,000-500,000₮", "100,000-1,000,000₮", "1,000,000-5,000,000₮"}, 1},
                                {"Ажил олгогч ХАБЭА-ын шаардлагыг хангаагүй тохиолдолд юу болно?", []string{"Юу ч болохгүй", "Торгууль", "Устгах", "Шагнал"}, 1},
                                {"Ажилтний хАБЭА-ын дүрмийг зөрчихөд юу болно?", []string{"Юу ч болохгүй", "Сануулагдана", "Ажлаас халах", "Б болон В"}, 3},
                                {"ХАБЭА-ын хяналтын байгууллага ямар эрхтэй вэ?", []string{"Зөвлөгөө өгөх", "Шалгах, торгууль ногдуулах", "Ажил олгогчийг огтлох", "Хаах"}, 1},
                                {"Ажил олгогч хАБЭА-ын зөрчилд хариуцлага хүлээх эсэх?", []string{"Тийм", "Үгүй", "Зөвхөн ажилтан", "Зөвхөн менежер"}, 0},
                                {"Ажилтний хАБЭА-ын сургалт үзүүлэхгүй байх нь зөрчил мөн үү?", []string{"Мөн", "Үгүй", "Зөвхөн аюултай ажилд", "Хамааралгүй"}, 0},
                                {"ХАБЭА-ын хяналтын шалгалт хэдэн удаа хийгдэх вэ?", []string{"Жил бүр", "Сар бүр", "Хэрэгцээгээс шалтгаалан", "Улирал бүр"}, 2},
                                {"Ажил олгогчийн хАБЭА-ын гэрээний хугацаа хэд вэ?", []string{"1 жил", "2 жил", "3 жил", "Тодорхой бус"}, 3},
                                {"ХАБЭА-ын зөрчлийн төрөл хэд байдаг вэ?", []string{"1", "2", "3", "4"}, 2},
                                {"Ажилтний хАБЭА-ын эрхийг хаашаа хамгаалдаг вэ?", []string{"Хууль", "Засгийн газар", "Ажил олгогч", "Прокурор"}, 0},
                                {"ХАБЭА-ын шаардлага хангаагүй ажил олгогчид ямар торгууль ногддог вэ?", []string{"Зөвхөн сануулга", "Мөнгөн торгууль", "Шүүхийн шийдвэр", "Ажил зогсоох"}, 1},
                                {"Ажилтний хАБЭА-ын мэдлэгийг хэрхэн шалгадаг вэ?", []string{"Ярилцлага", "Шалгалт", "Нүүр_FACEBOOK", "Б ба В"}, 3},
                                {"ХАБЭА-ын зөрчилд холбогдох хууль хэд вэ?", []string{"ХАБЭА-ын хууль", "Хөдөлмөрийн хууль", "Эрүүл мэндийн хууль", "Б ба В"}, 3},
                                {"Ажил олгогч хАБЭА-ын тайланг хэдэд тавьдаг вэ?", []string{"Улирал бүр", "Жил бүр", "Сар бүр", "2 жилд нэг"}, 1},
                                {"ХАБЭА-ын зөрчилд хэн хариуцдаг вэ?", []string{"Зөвхөн ажилтан", "Зөвхөн ажил олгогч", "Ажил олгогч ба хариуцагч", "Төрийн байгууллага"}, 2},
                                {"Ажил олгогч хАБЭА-ын дүрмээс хасагдсан тохиолдолд юу болно?", []string{"Юу ч болохгүй", "Ажил үргэлжлэнэ", "Ажил зогсоно", "Торгууль ногдохгүй"}, 2},
                                {"ХАБЭА-ын хууль тогтоомжид бусад улсын туршлагаас суралцах уу?", []string{"Үгүй", "Тийм", "Зөвхөн ОХУ", "Зөвхөн АНУ"}, 1},
                                {"ХАБЭА-ын хяналтын байгууллагын бүтэц хэдэн түвшинтэй вэ?", []string{"1", "2", "3", "4"}, 2},
                                {"Ажил олгогч хАБЭА-ын журмаар хамгаалалтын хэрэгсэл өгөх үүрэгтэй эсэх?", []string{"Тийм", "Үгүй", "Зөвхөн үйлдвэрт", "Хамгаалалтын хэрэгсэлгүй"}, 0},
                },
                },
                {
                        title:       "ХАБЭА-ын хууль эрх зүй - III",
                        description: "Олон улсын хАБЭА-ын стандарт, ILO конвенц",
                        category:    "ХАБЭА-ын хууль эрх зүй",
                        questions: []struct {
                                q       string
                                options []string
                                correct int
                        }{
                                {"ILO гэж юу гэсэн үг вэ?", []string{"International Labour Organization", "International Law Office", "Industrial Labor Organization", "Internal Labor Office"}, 0},
                                {"Монгол Улс ILO-ын гишүүн орсон огноо хэд вэ?", []string{"1955", "1960", "1968", "1975"}, 2},
                                {"ILO-ын ХАБЭА-ын конвенц хэдэн байдаг вэ?", []string{"50", "100", "187", "200"}, 2},
                                {"Монгол Улс хэдэн ILO конвенц ратификацласан бэ?", []string{"5", "10", "20", "30"}, 2},
                                {"ISO 45001 ямар стандарт вэ?", []string{"Чанарын менежмент", "ХАБЭА-ын менежмент", "Орчны менежмент", "Мэдээллийн аюулгүй байдал"}, 1},
                                {"Олон улсын хАБЭА-ын өдөр хэдэд болдог вэ?", []string{"4 сарын 28", "5 сарын 1", "6 сарын 5", "10 сарын 1"}, 0},
                                {"ILO-ын 155 дугаар конвенц юуны тухай вэ?", []string{"Хүүхдийн хөдөлмөр", "ХАБЭА-ын тухай", "Бага цалингийн ажил", "Эмэгтэйчүүдийн хөдөлмөр"}, 1},
                                {"ILO-ын 161 дүгээр конвенц юуны тухай вэ?", []string{"ХАБЭА-ын үйлчилгээ", "ХАБЭА-ын хяналт", "ХАБЭА-ын сургалт", "ХАБЭА-ын стандарт"}, 1},
                                {"Монгол Улсын хАБЭА-ын бодлогын баримт бичиг хэдэн байдаг вэ?", []string{"1", "2", "3", "5"}, 2},
                                {"ХАБЭА-ын тухай хуулийн зорилго юу вэ?", []string{"Ажилтнийг хамгаалах", "Ажил олгогчийг дэмжих", "Ажлын байрны аюулгүй байдлыг хангах", "Бүгд"}, 3},
                                {"ХАБЭА-ын олон улсын стандартад ямар зүйл багтана?", []string{"Хяналт", "Сургалт", "Хамгаалалт", "Бүгд"}, 3},
                                {"Монгол Улсын хАБЭА-ын хууль хэдэн бүлэгтэй вэ?", []string{"3", "5", "7", "10"}, 2},
                                {"ISO 45001 стандарт хэдэн удаа шинэчлэгдсэн бэ?", []string{"1", "2", "3", "4"}, 2},
                                {"Ажил олгогч ISO стандартын дагуу үйл ажиллагаа явуулах үүрэгтэй эсэх?", []string{"Тийм", "Үгүй", "Зөвхөн том компани", "Зөвхөн гадаад компани"}, 0},
                                {"ХАБЭА-ын тухай олон улсын конвенцийн зорилго юу вэ?", []string{"Ажилтнийг хамгаалах", "Ажлын байрны нөхцлийг дээшлүүлэх", "Осол гэмтлийг бууруулах", "Бүгд"}, 3},
                                {"Монгол Улс хАБЭА-ын салбарт хамтын ажиллагаа хийдэг улс орнууд хэд байдаг вэ?", []string{"5", "10", "15", "20"}, 2},
                                {"ХАБЭА-ын олон улсын өдрийг хэн зохион байгуулдаг вэ?", []string{"ILO", "WHO", "UN", "ILO ба WHO"}, 0},
                                {"Ажилтний хАБЭА-ын эрхийг олон улсын түвшинд хэн хамгаалдаг вэ?", []string{"ILO", "WHO", "UNESCO", "WTO"}, 0},
                                {"Монгол Улсын хАБЭА-ын бодлого хэний тодорхойлдог вэ?", []string{"Засгийн газар", "Иргэд", "Ажил олгогч", "Улсын их хурал"}, 3},
                                {"Олон улсын хАБЭА-ын конвенцийг хэрхэн хэрэгжүүлдэг вэ?", []string{"Хуульчлах", "Шалгах", "Хянах", "Бүгд"}, 3},
                },
                },

                // === Category 2: Аюулгүй ажиллагаа (3 quizzes) ===
                {
                        title:       "Аюулгүй ажиллагаа - I",
                        description: "Ажлын байрны аюулгүй ажиллагааны үндсэн дүрмүүд",
                        category:    "Аюулгүй ажиллагаа",
                        questions: []struct {
                                q       string
                                options []string
                                correct int
                        }{
                                {"Ажлын байрны аюулгүй ажиллагааны 5 үндсэн дүрэм юу вэ?", []string{"Хаах, асаах, хийх, харах, сонсох", "Таних, үнэлэх, хянах, хянуулах, сургах", "Зогсох, харах, тэмдэглэх, сануулах, мэдээлэх", "Өмсөх, зүүх, тавих, хийх, өгөх"}, 1},
                                {"Хамгаалалтын цагиргийн доор ажиллахдаа юу өмсөх ёстой вэ?", []string{"Зөвхөн цамц", "Каск, бүс, аюулгүйн гутал", "Зөвхөн нүдний шил", "Юу ч өмсөх шаардлагагүй"}, 1},
                                {"Бүсэлхийлэх хэрэгслийг хэрхэн ашиглах вэ?", []string{"Нэг гараараа", "Хоёр гараараа, зөв байрлалд", "Хоёр хүн", "Машин"}, 1},
                                {"Аюултай бодисоор ажиллахдаа юу зөвшөөрөл авах ёстой вэ?", []string{"Ажил олгогчийн", "ХАБЭА-ын мэргэжилтний", "Цагдаагийн", "Эмчийн"}, 1},
                                {"Ажлын байрны аюулгүй байдлын хяналт хэнд хийлгэх вэ?", []string{"Ажил олгогч", "ХАБЭА-ын мэргэжилтэн", "Ажилтан өөрөө", "Цагдаа"}, 1},
                                {"Цахилгаан тоног төхөөрөмжийг асаахаас өмнө юу хийх ёстой вэ?", []string{"Шалгах", "Унтраах", "Засварлах", "Хаях"}, 0},
                                {"Бүхээгдэхүүнийг хэрхэн зөвөөр зөөвөрлөх вэ?", []string{"Ганцаар", "Хоёулаа өргөж", "Машинаар", "Тусламжтай"}, 1},
                                {"Аюултай ажлын зөвшөөрлийг хэн олгож өгдөг вэ?", []string{"Ажил олгогч", "ХАБЭА-ын мэргэжилтэн", "Цагдаа", "Шүүх"}, 1},
                                {"Ажлын байрны гэрэлтүүлэг ямар байх ёстой вэ?", []string{"Харанхуй", "Тунгалаг", "Дулаан", "Хүйтэн"}, 1},
                                {"Ажилтний хамгаалалтын хэрэгслийг хэнд олгодог вэ?", []string{"Ажилтан өөрөө", "Ажил олгогч", "Төрийн байгууллага", "ХАБЭА-ын газар"}, 1},
                                {"Өндөрт ажиллахдаа юу ашиглах ёстой вэ?", []string{"Шатахуун", "Тусгай хамгаалалт, бүсэлхий", "Гар утас", "Цамц"}, 1},
                                {"Ажлын байрны самбар дээр юу бичих ёстой вэ?", []string{"Ажилтны нэр", "Аюулгүй ажиллагааны дүрэм", "Цаг", "Огноо"}, 1},
                                {"Гар нүүрний хамгаалалтын хэрэгслийг хэзээ өмсөх вэ?", []string{"Ажилд орох үед", "Аюултай бодистой ажиллах үед", "Улирлын өөрчлөлттэй", "Үргэлж"}, 1},
                                {"Ажлын байрны агаарын бохирдлыг хэрхэн бууруулах вэ?", []string{"Цонх нээх", "Сэнсэлгээ хийх", "Амьсгалын хамгаалалт өмсөх", "Бүгд"}, 3},
                                {"Ажилтний хамгаалалтын хэрэгсэл юу вэ?", []string{"Каск, бүс, нүдний шил", "Цамц", "Гар утас", "Цаас"}, 0},
                                {"Ажлын байрны дуу чимээг хэрхэн бууруулах вэ?", []string{"Чимээгүй байх", "Дуу чимээгүй тоног төхөөрөмж", "Чихэвч өмсөх", "Б ба В"}, 3},
                                {"Ажлын байрны температур хэд хэм байх ёстой вэ?", []string{"0-10°C", "18-24°C", "30-40°C", "40-50°C"}, 1},
                                {"Ажлын байрны аюулгүй байдлыг хэний хариуцдаг вэ?", []string{"Ажилтан", "Ажил олгогч", "ХАБЭА-ын мэргэжилтэн", "Бүгд"}, 3},
                                {"Аюулгүй ажиллагааны дүрмийг хаана байрлуулах ёстой вэ?", []string{"Оффисод", "Ажлын байрны ил талд", "Ажлын байрны олон нийтийн газар", "Бүгд"}, 3},
                                {"Ажилтний хамгаалалтын хэрэгслийг хэрэглэхээ мартвал юу болно?", []string{"Юу ч болохгүй", "Осол гэмтэл гарах", "Ажилд саатна", "Шагнал"}, 1},
                },
                },
                {
                        title:       "Аюулгүй ажиллагаа - II",
                        description: "Ажлын байрны осол гэмтлийн урьдчилан сэргийлэлт",
                        category:    "Аюулгүй ажиллагаа",
                        questions: []struct {
                                q       string
                                options []string
                                correct int
                        }{
                                {"Осол гэмтэл гарах гол шалтгаан юу вэ?", []string{"Зөв бус ажиллагаа", "Хамгаалалтын хэрэгсэлгүй", "Сургалтгүй", "Бүгд"}, 3},
                                {"Урьдчилан сэргийлэх аргууд хэд байдаг вэ?", []string{"1", "2", "3", "4"}, 2},
                                {"Ажлын байрны осолд өртөх магадлалыг хэрхэн бууруулах вэ?", []string{"Хяналт", "Сургалт", "Хамгаалалт", "Бүгд"}, 3},
                                {"Ажлын байрны осол гэмтлийн статистик хэний мэдээлэл вэ?", []string{"Ажил олгогчийн", "ХАБЭА-ын хяналтын газрын", "Ажилтний", "Цагдаагийн"}, 1},
                                {"Осол гэмтэл гарахад эхний тусламж ямар вэ?", []string{"Эмчид дуудах", "Зөвхөн харах", "Өөрөө эмчлэх", "Хаях"}, 0},
                                {"Ажлын байрны аюулгүй байдлын үнэлгээ хийх хугацаа хэд вэ?", []string{"Жил бүр", "2 жилд нэг", "3 жилд нэг", "5 жилд нэг"}, 0},
                                {"Ажлын байрны осол гэмтэлд хэн хариуцдаг вэ?", []string{"Зөвхөн ажилтан", "Ажил олгогч ба хариуцагч", "Цагдаа", "Эмч"}, 1},
                                {"Осол гэмтлийн мөрдлөг хийх зорилго юу вэ?", []string{"Шийтгэх", "Урьдчилан сэргийлэх", "Мөнгө олох", "Ажилтнийг огтлох"}, 1},
                                {"Ажлын байрны аюулгүй байдлын төлөвлөгөө хэнд байдаг вэ?", []string{"Ажил олгогч", "ХАБЭА-ын мэргэжилтэн", "Ажилтан", "Засгийн газар"}, 0},
                                {"Осол гэмтлийн тохиолдолд юу хийх ёстой вэ?", []string{"Ажлаа үргэлжлүүлэх", "Мэдээлэх, хамгаалах", "Далдлах", "Ажлаас зугтах"}, 1},
                                {"Ажлын байрны аюулгүй байдлын чиглэлээр хэдэн төрлийн сургалт байдаг вэ?", []string{"1", "2", "3", "5"}, 2},
                                {"Осол гэмтлийн дараа юу хийх ёстой вэ?", []string{"Ажлаа үргэлжлүүлэх", "Шалтгааныг олох", "Ажилтнийг огтлох", "Юу ч хийхгүй"}, 1},
                                {"Ажлын байрны осол гэмтлийн зардал хэнд ногддог вэ?", []string{"Ажилтанд", "Ажил олгогчид", "Төрөнд", "Бүгдэд"}, 1},
                                {"Осол гэмтэлээс урьдчилан сэргийлэх 3 алхам юу вэ?", []string{"Таних, үнэлэх, хянах", "Хаах, нээх, хийх", "Зогсох, харах, явах", "Өмсөх, зүүх, тавих"}, 0},
                                {"Ажлын байрны аюулгүй байдлын журмаар юу заадаг вэ?", []string{"Ажиллах дүрэм", "Хамгаалалтын хэрэгсэл", "Осол гэмтлийн үйлдэл", "Бүгд"}, 3},
                                {"Осол гэмтлийн магадлалыг хэрхэн тодорхойлдог вэ?", []string{"Тооцоолол", "Мэргэжлийн үнэлгээ", "Ажилтний санал", "Цагдаагийн мэдээлэл"}, 1},
                                {"Ажлын байрны аюулгүй байдлын хяналтын журмаар юу шалгадаг вэ?", []string{"Тоног төхөөрөмж", "Ажилтны мэдлэг", "Хамгаалалтын хэрэгсэл", "Бүгд"}, 3},
                                {"Осол гэмтлийн дараахь 3 үйлдэл юу вэ?", []string{"Мэдээлэх, тусламж үзүүлэх, мөрдөн байцаах", "Ажлаа үргэлжлүүлэх", "Далдлах", "Ажилтнийг огтлох"}, 0},
                                {"Ажлын байрны аюулгүй байдлын үнэлгээний тайланг хэнд тавьдаг вэ?", []string{"Ажилтанд", "Ажил олгогчид", "ХАБЭА-ын хяналтын газарт", "Цагдаад"}, 2},
                                {"Осол гэмтэл гарах магадлалыг бууруулах гол арга юу вэ?", []string{"Сургалт", "Хяналт", "Хамгаалалт", "Бүгдээс дээрх"}, 3},
                },
                },
                {
                        title:       "Аюулгүй ажиллагаа - III",
                        description: "Хиймэлдэл, цахилгаан аюулгүй байдал",
                        category:    "Аюулгүй ажиллагаа",
                        questions: []struct {
                                q       string
                                options []string
                                correct int
                        }{
                                {"Хиймэлдлээс урьдчилан сэргийлэх гол арга юу вэ?", []string{"Хамгаалалт өмсөх", "Агаарыг шалгах", "Сэнсэлгээ хийх", "Бүгд"}, 3},
                                {"Цахилгаан ослоос хамгаалахын тулд юу хийх ёстой вэ?", []string{"Бүрхөүл өмсөх", "Зуух, утас шалгах", "Гар хүчээр ажиллах", "Бүгд"}, 3},
                                {"Хиймэлдэлтэй ажилладаг газарт юу байх ёстой вэ?", []string{"Сэнсэлгээ", "Агаарын шалгалтынприбор", "Аюулгүй ажиллагааны самбар", "Бүгд"}, 3},
                                {"Цахилгааны гүйдлийн хэмжээ хэд вэ?", []string{"12V", "36V", "220V", "380V"}, 2},
                                {"Хиймэлдлийн төрөл хэд байдаг вэ?", []string{"1", "2", "3", "5"}, 2},
                                {"Цахилгаан утасны изоляцийг хэрхэн шалгах вэ?", []string{"Нүдээр харах", "Мэргэжлийнприбороор", "Гараар татаж", "Хаяах"}, 1},
                                {"Хиймэлдлээс хамгаалах хэрэгсэл юу вэ?", []string{"Амьсгалын хамгаалалт", "Каск", "Бүс", "Бүгд"}, 0},
                                {"Цахилгааны аюулгүй байдлын дүрмийг хэн зохиодог вэ?", []string{"Ажилтан", "Ажил олгогч", "Цахилгааны инженер", "ХАБЭА-ын мэргэжилтэн"}, 2},
                                {"Хиймэлдлийн аюулгүй байдлыг хэрхэн хангах вэ?", []string{"Хяналт", "Сэнсэлгээ", "Хамгаалалт", "Бүгд"}, 3},
                                {"Цахилгааны осолд өртвөл юу хийх ёстой вэ?", []string{"Хүнийг татах", "Гүйдлийг таслах", "Ус цацах", "Б болон В"}, 1},
                                {"Хиймэлдэлтэй ажиллахын өмнө юу хийх ёстой вэ?", []string{"Агаарыг шалгах", "Хамгаалалт өмсөх", "Сэнсэлгээ асаах", "Бүгд"}, 3},
                                {"Цахилгааны гүйдлийн хоргүй хэмжээ хэд вэ?", []string{"12V", "24V", "36V", "48V"}, 2},
                                {"Хиймэлдлийн үр дагавар юу вэ?", []string{"Тэсэлгээ", "Уушгины өвчин", "Амьсгалын дарамт", "Бүгд"}, 3},
                                {"Цахилгааны тоног төхөөрөмжийг хэрхэн засварлах вэ?", []string{"Гүйдэлтэй", "Гүйдэлгүй", "Ажиллаж байхад", "Ямар ч үед"}, 1},
                                {"Хиймэлдэлтэй ажлын байрны агаарын бохирдлын хэмжээ хэд вэ?", []string{"0.1%", "0.5%", "1%", "5%"}, 2},
                                {"Цахилгааны ослоос хамгаалах 3 дүрэм юу вэ?", []string{"Бүрхөүл, утас шалгах, гүйдэл таслах", "Харах, сонсох, хийх", "Зогсох, явах, харах", "Бүгд"}, 0},
                                {"Хиймэлдлийн шалгалтынприбор юу вэ?", []string{"Газар хэмжигч", "Агаарын бохирдол хэмжигч", "Температурын хэмжигч", "Давс хэмжигч"}, 1},
                                {"Цахилгааны аюулгүй байдлын сургалт хэзээ явагддаг вэ?", []string{"Жил бүр", "2 жилд нэг", "3 жилд нэг", "Ажилд орох үед л"}, 0},
                                {"Хиймэлдлээс хамгаалах хамгийн зөв арга юу вэ?", []string{"Амьсгалын хамгаалалт", "Агаарыг солих", "Ажлын байрыг хаах", "Бүгд"}, 3},
                                {"Цахилгааны осолд өртсөн хүнийг юу хийх ёстой вэ?", []string{"Хүнийг гараар татах", "Шууд эмчид дуудах", "Эхний тусламж үзүүлэх", "Б ба В"}, 3},
                },
                },

                // === Category 3: Эрүүл мэнд, ахуй (3 quizzes) ===
                {
                        title:       "Эрүүл мэнд, ахуй - I",
                        description: "Ажлын байрны эрүүл ахуйн нөхцөл",
                        category:    "Эрүүл мэнд, ахуй",
                        questions: []struct {
                                q       string
                                options []string
                                correct int
                        }{
                                {"Ажлын байрны эрүүл ахуйн стандарт юу вэ?", []string{"MNS 4999", "MNS 5000", "MNS 4989", "MNS 5010"}, 0},
                                {"Ажлын байрны гэрэлтүүлгийн хэмжээ хэд вэ?", []string{"100 люкс", "200 люкс", "300 люкс", "500 люкс"}, 2},
                                {"Ажлын байрны агаарын солилцоо хэд хийгдэх ёстой вэ?", []string{"Цагт 1 удаа", "Цагт 2 удаа", "Цагт 3 удаа", "Минутад 1 удаа"}, 1},
                                {"Ажлын байрны дуу чимээний хэмжээ хэд байх ёстой вэ?", []string{"40 дБ", "60 дБ", "80 дБ", "100 дБ"}, 1},
                                {"Ажлын байрны температурын хэмжээ хэд байх ёстой вэ?", []string{"10-15°C", "18-24°C", "25-30°C", "30-40°C"}, 1},
                                {"Ажлын байрны агаарын чийг хэд байх ёстой вэ?", []string{"20-30%", "30-40%", "40-60%", "60-80%"}, 2},
                                {"Ажлын байрны угаалтуурын тоо хэд байх ёстой вэ?", []string{"15 хүнд 1", "20 хүнд 1", "25 хүнд 1", "30 хүнд 1"}, 2},
                                {"Ажлын байрны ундны усны чанарын шалгалт хэзээ хийдэг вэ?", []string{"Улирал бүр", "Жил бүр", "2 жилд нэг", "Сар бүр"}, 0},
                                {"Ажлын байрны хоолны газар юу байх ёстой вэ?", []string{"Зөвхөн хоол", "Ус, хоол, ариун цэврийн нөхцөл", "Зөвхөн ус", "Юу ч байх шаардлагагүй"}, 1},
                                {"Ажлын байрны ариун цэврийн нөхцөл хэд байх ёстой вэ?", []string{"15 хүнд 1", "20 хүнд 1", "25 хүнд 1", "30 хүнд 1"}, 0},
                                {"Ажлын байрны хоолны үзүүлэлтийн стандарт юу вэ?", []string{"MNS 4999", "MNS 5157", "MNS 5010", "MNS 4989"}, 1},
                                {"Ажлын байрны агаарын бохирдлыг хэрхэн хянах вэ?", []string{"Цонх нээх", "Сэнсэлгээ", "Агааржуулалт", "Бүгд"}, 3},
                                {"Ажлын байрны гэрэлтүүлгийн төрөл хэд байдаг вэ?", []string{"1", "2", "3", "4"}, 2},
                                {"Ажлын байрны дуу чимээг хэрхэн бууруулах вэ?", []string{"Дуу чимээгүй тоног", "Чимээ тусгаарлагч", "Чихэвч", "Бүгд"}, 3},
                                {"Ажлын байрны температурыг хэрхэн хянадаг вэ?", []string{"Орчны агаар", "Сэнсэлгээ", "Дулаан, хүйтэн", "Бүгд"}, 3},
                                {"Ажлын байрны ариун цэврийн бодис ямар байх ёстой вэ?", []string{"Хортой", "Аюултай", "Хоргүй, стандарт", "Ямар ч"}, 2},
                                {"Ажлын байрны хоолонд юу орсон байх ёстой вэ?", []string{"Төмөр, уураг", "Витамин, амин дэм", "Тос, тослог", "Бүгд"}, 3},
                                {"Ажлын байрны ундны усны хэмжээ хэд байх ёстой вэ?", []string{"1 литр", "2 литр", "3 литр", "4 литр"}, 1},
                                {"Ажлын байрны ариун цэврийг хэн хариуцдаг вэ?", []string{"Ажилтан", "Ажил олгогч", "Цэвэрлэгч", "ХАБЭА-ын мэргэжилтэн"}, 1},
                                {"Ажлын байрны эрүүл ахуйн нөхцөлийг хэн хяндаг вэ?", []string{"Ажил олгогч", "ХАБЭА-ын хяналтын газар", "Эрүүл мэндийн байгууллага", "Б ба В"}, 3},
                },
                },
                {
                        title:       "Эрүүл мэнд, ахуй - II",
                        description: "Мэргэжлийн өвчин, эрүүл мэндийн хамгаалалт",
                        category:    "Эрүүл мэнд, ахуй",
                        questions: []struct {
                                q       string
                                options []string
                                correct int
                        }{
                                {"Мэргэжлийн өвчин гэж юу вэ?", []string{"Ажлын байранд өртсөн өвчин", "Улирлын өвчин", "Насны өвчин", "Дарамт"}, 0},
                                {"Мэргэжлийн өвчний төрөл хэд байдаг вэ?", []string{"1", "2", "3", "5"}, 2},
                                {"Чулууны үеийн өвчин ямар мэргэжилд тохиолддог вэ?", []string{"Барилгачин", "Нүүр FACEBOOK", "Багш", "Эмч"}, 0},
                                {"Мэргэжлийн өвчнөөс урьдчилан сэргийлэх гол арга юу вэ?", []string{"Сургалт", "Хамгаалалт", "Эрүүл мэндийн шалгалт", "Бүгд"}, 3},
                                {"Ажилтний эрүүл мэндийн шалгалт хэзээ хийдэг вэ?", []string{"Ажилд орох үед", "Жил бүр", "2 жилд нэг", "Ажилд орох ба жил бүр"}, 3},
                                {"Мэргэжлийн өвчний үр дагавар юу вэ?", []string{"Ажилгүйдэл", "Эрүүл мэндийн зардал", "Нийгмийн ачаалал", "Бүгд"}, 3},
                                {"Ажилтний эрүүл мэндийн даатгалын төрөл хэд байдаг вэ?", []string{"1", "2", "3", "4"}, 2},
                                {"Мэргэжлийн хорт хавдрын шалтгаан юу вэ?", []string{"Химийн бодис", "Дуу чимээ", "Радиаци", "Бүгд"}, 3},
                                {"Ажилтний эрүүл мэндийн шалгалтын үр дүнг хэд хадгалах вэ?", []string{"1 жил", "5 жил", "10 жил", "Бүх насаар"}, 2},
                                {"Мэргэжлийн өвчнийг хэрхэн оношлох вэ?", []string{"Эмчийн шалгалт", "Ажилтны санал", "Мэргэжлийн үнэлгээ", "Б ба В"}, 0},
                                {"Ажилтний эрүүл мэндийн хамгаалалтын тухай хууль хэдэн бүлэгтэй вэ?", []string{"3", "5", "7", "10"}, 2},
                                {"Мэргэжлийн өвчнийг хэн оношлодог вэ?", []string{"Ажилтан", "Мэргэжлийн эмч", "Ажил олгогч", "ХАБЭА-ын мэргэжилтэн"}, 1},
                                {"Ажилтний эрүүл мэндийн хамгаалалтын зардал хэнд ногддог вэ?", []string{"Ажилтанд", "Ажил олгогчид", "Төрөнд", "Бүгдэд"}, 1},
                                {"Мэргэжлийн өвчний урьдчилан сэргийлэх 3 арга юу вэ?", []string{"Хяналт, сургалт, хамгаалалт", "Зөвхөн хамгаалалт", "Зөвхөн сургалт", "Зөвхөн хяналт"}, 0},
                                {"Ажилтний эрүүл мэндийн шалгалтын төрөл хэд байдаг вэ?", []string{"1", "2", "3", "4"}, 2},
                                {"Мэргэжлийн өвчний эмчилгээний зардал хэн төлдөг вэ?", []string{"Ажилтан", "Ажил олгогч", "Даатгал", "Б ба В"}, 3},
                                {"Ажилтний эрүүл мэндийн хамгаалалтын тухай хуулийн зорилго юу вэ?", []string{"Ажилтнийг хамгаалах", "Ажил олгогчийг дэмжих", "Эрүүл мэндийг хамгаалах", "Бүгд"}, 3},
                                {"Мэргэжлийн өвчний статистик хэний мэдээлэл вэ?", []string{"Ажил олгогчийн", "Эрүүл мэндийн яамны", "ХАБЭА-ын хяналтын газрын", "Б ба В"}, 3},
                                {"Ажилтний эрүүл мэндийн шалгалтын дүнг хаана хадгалах вэ?", []string{"Ажлын байр", "Оффис", "Эрүүл мэндийн байгууллага", "Бүгд"}, 2},
                                {"Мэргэжлийн өвчнийг хэрхэн эмчлэх вэ?", []string{"Зөвхөн эмч", "Ажилтан өөрөө", "ХАБЭА-ын мэргэжилтэн", "Ажил олгогч"}, 0},
                },
                },
                {
                        title:       "Эрүүл мэнд, ахуй - III",
                        description: "Ажилтны сэтгэцэд нөлөөлөх хүчин зүйлс",
                        category:    "Эрүүл мэнд, ахуй",
                        questions: []struct {
                                q       string
                                options []string
                                correct int
                        }{
                                {"Ажилтны сэтгэцийн эрүүл мэндийг хэрхэн хамгаалах вэ?", []string{"Сургалт", "Уур амьсгалын дэмжлэг", "Ажлын цагийн хуваарь", "Бүгд"}, 3},
                                {"Ажилтны стрессийн шалтгаан юу вэ?", []string{"Ажлын ачаалал", "Харьцаа", "Цалин", "Бүгд"}, 3},
                                {"Ажилтны сэтгэцийн эрүүл мэндийн шалгалт хэзээ хийдэг вэ?", []string{"Жил бүр", "2 жилд нэг", "3 жилд нэг", "Хэрэгцээт үед"}, 0},
                                {"Дарамтын үед ажилтанд юу хийх ёстой вэ?", []string{"Ажлаа үргэлжлүүлэх", "Амрах, тусламж авах", "Дуугарах", "Ажлаас зугтах"}, 1},
                                {"Ажилтны сэтгэцийн дэмжлэгийн үйлчилгээ ямар байдаг вэ?", []string{"Зөвлөгөө", "Эмчилгээ", "Сургалт", "Бүгд"}, 3},
                                {"Ажилтны ажлын цагийн хуваарь хэд байх ёстой вэ?", []string{"8 цаг", "10 цаг", "12 цаг", "14 цаг"}, 0},
                                {"Ажилтны сэтгэцийн эрүүл мэндийг хэн хариуцдаг вэ?", []string{"Ажилтан", "Ажил олгогч", "Эмч", "Бүгд"}, 3},
                                {"Ажилтны дарамтын үр дагавар юу вэ?", []string{"Ажлын бүтээмж буурах", "Эрүүл мэндийн асуудал", "Ажилд ороход хэврэх", "Бүгд"}, 3},
                                {"Ажилтны сэтгэцийн эрүүл мэндийн сургалт хэзээ хийдэг вэ?", []string{"Жил бүр", "2 жилд нэг", "3 жилд нэг", "Хэрэгцээт үед"}, 0},
                                {"Ажилтны дарамтын төрөл хэд байдаг вэ?", []string{"1", "2", "3", "5"}, 2},
                                {"Ажилтны сэтгэцийн эрүүл мэндийн үйлчилгээний төв хаана байдаг вэ?", []string{"Ажлын байр", "Эмнэлэг", "ХАБЭА-ын байгууллага", "Бүгд"}, 3},
                                {"Ажилтны сэтгэцийн эрүүл мэндийг дэмжих 3 арга юу вэ?", []string{"Сургалт, зөвлөгөө, амралт", "Зөвхөн сургалт", "Зөвхөн амралт", "Зөвхөн зөвлөгөө"}, 0},
                                {"Ажилтны сэтгэцийн эрүүл мэндийн тухай хууль байдаг уу?", []string{"Байдаг", "Байдаггүй", "Зөвхөн том компанид", "Зөвхөн үйлдвэрт"}, 0},
                                {"Ажилтны дарамттай ажиллах нь аюултай юу?", []string{"Тийм", "Үгүй", "Зөвхөн зарим үед", "Ажилтны сонголт"}, 0},
                                {"Ажилтны сэтгэцийн эрүүл мэндийг хэрхэн үнэлэх вэ?", []string{"Асуулга", "Ярилцлага", "Шалгалт", "Бүгд"}, 3},
                                {"Ажилтны дарамтын шинж тэмдэг юу вэ?", []string{"Уур хийлэлт", "Нойрны дутагдал", "Ажилд сэтгэл дүүрэлт", "Бүгд"}, 3},
                                {"Ажилтны сэтгэцийн эрүүл мэндийн дэмжлэгийн төрөл хэд байдаг вэ?", []string{"1", "2", "3", "5"}, 2},
                                {"Ажилтны дарамтыг хэрхэн бууруулах вэ?", []string{"Амралт", "Сургалт", "Зөвлөгөө", "Бүгд"}, 3},
                                {"Ажилтны сэтгэцийн эрүүл мэндийн тухай ямар хууль байдаг вэ?", []string{"ХАБЭА-ын хууль", "Эрүүл мэндийн хууль", "Хөдөлмөрийн хууль", "Бүгд"}, 3},
                                {"Ажилтны сэтгэцийн эрүүл мэндийг хамгаалахын тулд юу хийх ёстой вэ?", []string{"Ажил олгогч үүрэг хүлээх", "Ажилтан өөрөө хариуцана", "ХАБЭА-ын мэргэжилтэн хариуцна", "Бүгд хамт"}, 3},
                },
                },

                // === Category 4: Байгаль орчин (2 quizzes) ===
                {
                        title:       "Байгаль орчин - I",
                        description: "Ажлын байрны байгаль орчны нөлөөлөл",
                        category:    "Байгаль орчин",
                        questions: []struct {
                                q       string
                                options []string
                                correct int
                        }{
                                {"Ажлын байрны байгаль орчны үнэлгээ юу вэ?", []string{"Агаар, ус, хөрсний шалгалт", "Зөвхөн агаарын шалгалт", "Зөвхөн усны шалгалт", "Зөвхөн хөрсний шалгалт"}, 0},
                                {"Ажлын байрны байгаль орчны бохирдлын гол шалтгаан юу вэ?", []string{"Ажлын үйл явц", "Улирал", "Газар зүй", "Уур амьсгал"}, 0},
                                {"Ажлын байрны байгаль орчны хяналт хэзээ хийдэг вэ?", []string{"Жил бүр", "2 жилд нэг", "3 жилд нэг", "Улирал бүр"}, 0},
                                {"Ажлын байрны байгаль орчны бохирдлын хэмжээ хэд байдаг вэ?", []string{"1", "2", "3", "5"}, 2},
                                {"Ажлын байрны байгаль орчны тухай хууль юу вэ?", []string{"Байгаль орчны тухай хууль", "ХАБЭА-ын хууль", "Эрүүл мэндийн хууль", "Хөдөлмөрийн хууль"}, 0},
                                {"Ажлын байрны байгаль орчны нөлөөллийн үнэлгээ хэн хийдэг вэ?", []string{"Ажил олгогч", "Байгаль орчны мэргэжилтэн", "ХАБЭА-ын мэргэжилтэн", "Цагдаа"}, 1},
                                {"Ажлын байрны байгаль орчны бохирдлыг хэрхэн бууруулах вэ?", []string{"Тоног төхөөрөмж", "Сургалт", "Хяналт", "Бүгд"}, 3},
                                {"Ажлын байрны байгаль орчны стандарт юу вэ?", []string{"MNS 5850", "MNS 4999", "MNS 5000", "MNS 5010"}, 0},
                                {"Ажлын байрны байгаль орчны нөлөөллийн үр дагавар юу вэ?", []string{"Эрүүл мэндийн асуудал", "Ажлын бүтээмж буурах", "Байгаль орчны гэмтэл", "Бүгд"}, 3},
                                {"Ажлын байрны байгаль орчны хяналтын төрөл хэд байдаг вэ?", []string{"1", "2", "3", "4"}, 2},
                                {"Ажлын байрны байгаль орчны бохирдлын эх үүсвэр юу вэ?", []string{"Үйлдвэрлэл", "Уул уурхай", "Барилга", "Бүгд"}, 3},
                                {"Ажлын байрны байгаль орчныг хэн хамгаалдаг вэ?", []string{"Ажил олгогч", "Төрийн байгууллага", "Иргэд", "Бүгд"}, 3},
                                {"Ажлын байрны байгаль орчны бохирдлын торгууль хэд вэ?", []string{"100,000₮", "500,000₮", "1,000,000₮", "5,000,000₮"}, 2},
                                {"Ажлын байрны байгаль орчны нөлөөллийн үнэлгээний тайлан хэд хийгддэг вэ?", []string{"Жил бүр", "2 жилд нэг", "3 жилд нэг", "5 жилд нэг"}, 0},
                                {"Ажлын байрны байгаль орчны бохирдлыг хэн хяндаг вэ?", []string{"Ажил олгогч", "Байгаль орчны байгууллага", "ХАБЭА-ын хяналтын газар", "Цагдаа"}, 1},
                                {"Ажлын байрны байгаль орчны нөлөөллийн үнэлгээний зорилго юу вэ?", []string{"Бохирдлыг бууруулах", "Ажлын байрыг хаах", "Ажилтнийг огтлох", "Юу ч биш"}, 0},
                                {"Ажлын байрны байгаль орчны бохирдлын төрөл хэд байдаг вэ?", []string{"3", "5", "7", "10"}, 2},
                                {"Ажлын байрны байгаль орчны бохирдлыг хэрхэн тодорхойлдог вэ?", []string{"Мэргэжлийн шалгалт", "Ажилтны санал", "Ажил олгогчийн мэдээлэл", "Цагдаагийн мэдээлэл"}, 0},
                                {"Ажлын байрны байгаль орчны тухай олон улсын гэрээ юу вэ?", []string{"Киото протокол", "Парисын гэрээ", "Бүгд", "Юу ч биш"}, 2},
                                {"Ажлын байрны байгаль орчны хамгаалалтын талаар хэн сургадаг вэ?", []string{"Ажил олгогч", "ХАБЭА-ын байгууллага", "Байгаль орчны байгууллага", "Бүгд"}, 3},
                },
                },
                {
                        title:       "Байгаль орчин - II",
                        description: "Байгаль орчны менежмент, нөхөн сэргээлт",
                        category:    "Байгаль орчин",
                        questions: []struct {
                                q       string
                                options []string
                                correct int
                        }{
                                {"Байгаль орчны менежментийн үндсэн зарчим юу вэ?", []string{"Бохирдол бууруулах", "Нөхөн сэргээлт", "Тогтвортой хөгжил", "Бүгд"}, 3},
                                {"Ажлын байрны байгаль орчны нөхөн сэргээлтийн зорилго юу вэ?", []string{"Байгаль орчныг сэргээх", "Ажлын байрыг өргөтгөх", "Бохирдлыг нэмэгдүүлэх", "Ажилтныг хамгаалах"}, 0},
                                {"Байгаль орчны нөхөн сэргээлтийн төрөл хэд байдаг вэ?", []string{"1", "2", "3", "4"}, 2},
                                {"Ажлын байрны байгаль орчны нөхөн сэргээлтийн зардал хэн төлдөг вэ?", []string{"Ажил олгогч", "Төр", "Иргэд", "Бүгд"}, 0},
                                {"Байгаль орчны менежментийн тухай хууль хэдэн бүлэгтэй вэ?", []string{"3", "5", "7", "10"}, 2},
                                {"Ажлын байрны байгаль орчны нөхөн сэргээлтийн хугацаа хэд вэ?", []string{"1 жил", "3 жил", "5 жил", "10 жил"}, 2},
                                {"Байгаль орчны менежментийн үнэлгээ хийх хугацаа хэд вэ?", []string{"Жил бүр", "2 жилд нэг", "3 жилд нэг", "5 жилд нэг"}, 0},
                                {"Ажлын байрны байгаль орчны нөхөн сэргээлтийн үр дүн юу вэ?", []string{"Байгаль орчныг сэргээх", "Бохирдол бууруулах", "Ажилтний эрүүл мэндийг дээшлүүлэх", "Бүгд"}, 3},
                                {"Байгаль орчны менежментийн үйл ажиллагааны төрөл хэд байдаг вэ?", []string{"1", "2", "3", "5"}, 3},
                                {"Ажлын байрны байгаль орчны нөхөн сэргээлтийн арга юу вэ?", []string{"Мод тарих", "Ус цэвэрлэх", "Хөрс сэргээх", "Бүгд"}, 3},
                                {"Байгаль орчны менежментийн талаар хэн сургадаг вэ?", []string{"Ажил олгогч", "Байгаль орчны байгууллага", "ХАБЭА-ын байгууллага", "Бүгд"}, 3},
                                {"Ажлын байрны байгаль орчны нөхөн сэргээлтийн шалгалт хэзээ хийдэг вэ?", []string{"Жил бүр", "2 жилд нэг", "3 жилд нэг", "5 жилд нэг"}, 0},
                                {"Байгаль орчны менежментийн тухай олон улсын гэрээ юу вэ?", []string{"Парисын гэрээ", "Киото протокол", "Бүгд", "Юу ч биш"}, 2},
                                {"Ажлын байрны байгаль орчны нөхөн сэргээлтийн төсөл хэн бичдэг вэ?", []string{"Ажил олгогч", "Байгаль орчны мэргэжилтэн", "ХАБЭА-ын мэргэжилтэн", "Цагдаа"}, 1},
                                {"Байгаль орчны менежментийн үнэлгээний тайлан хаана тавьдаг вэ?", []string{"Ажлын байр", "Байгаль орчны байгууллага", "ХАБЭА-ын хяналтын газар", "Бүгд"}, 3},
                                {"Ажлын байрны байгаль орчны нөхөн сэргээлтийн хяналт хэн хийдэг вэ?", []string{"Ажил олгогч", "Байгаль орчны байгууллага", "ХАБЭА-ын хяналтын газар", "Бүгд"}, 3},
                                {"Байгаль орчны менежментийн талаар ямар сургалт байдаг вэ?", []string{"Мэргэжлийн сургалт", "Дэлгэрэнгүй сургалт", "Бүх сургалт", "Юу ч биш"}, 0},
                                {"Ажлын байрны байгаль орчны нөхөн сэргээлтийн үр дүнг хэрхэн үнэлэх вэ?", []string{"Мэргэжлийн үнэлгээ", "Ажилтний санал", "Ажил олгогчийн мэдээлэл", "Бүгд"}, 0},
                                {"Байгаль орчны менежментийн бодлогод хэн оролцдог вэ?", []string{"Ажил олгогч", "Төрийн байгууллага", "Иргэд", "Бүгд"}, 3},
                                {"Ажлын байрны байгаль орчны нөхөн сэргээлтийн ач холбогдол юу вэ?", []string{"Байгаль орчныг хамгаалах", "Ажилтний эрүүл мэндийг хамгаалах", "Тогтвортой хөгжил", "Бүгд"}, 3},
                },
                },

                // === Category 5: Гал түймэр, онцгой нөхцөл (2 quizzes) ===
                {
                        title:       "Гал түймэр, онцгой нөхцөл - I",
                        description: "Гал түймрийн урьдчилан сэргийлэлт, унтраах",
                        category:    "Гал түймэр, онцгой нөхцөл",
                        questions: []struct {
                                q       string
                                options []string
                                correct int
                        }{
                                {"Гал түймрийн ангилал хэд байдаг вэ?", []string{"1", "2", "3", "5"}, 3},
                                {"Унтраагуурын төрөл хэд байдаг вэ?", []string{"2", "3", "4", "5"}, 2},
                                {"Гал түймрийн үед юу хийх ёстой вэ?", []string{"Зугтах", "Унтраагуур ашиглах", "Ус цацах", "Харах"}, 1},
                                {"Гал түймрийн шалтгаан юу вэ?", []string{"Цахилгаан", "Уухай", "Тамхи", "Бүгд"}, 3},
                                {"Гал түймрийн мэдээллийн систем ямар байдаг вэ?", []string{"Дуут", "Гэрэлт", "Сэрүүлэг", "Бүгд"}, 3},
                                {"Гал түймрийн урьдчилан сэргийлэх гол арга юу вэ?", []string{"Сургалт", "Хяналт", "Унтраагуур бэлтгэх", "Бүгд"}, 3},
                                {"Гал түймрийн эвакуацлалтын төлөвлөгөө хэнд байдаг вэ?", []string{"Ажил олгогч", "Гал унтраагуулах байгууллага", "Ажилтан", "Цагдаа"}, 0},
                                {"Гал түймрийн үед хаашаа явах ёстой вэ?", []string{"Дээш", "Доош", "Гарах үүд", "Цонх"}, 2},
                                {"Гал түймрийн унтраагуурын байрлал хаана байх ёстой вэ?", []string{"Оффисод", "Ажлын байрны бүх газарт", "Зөвхөн үйлдвэрт", "Хаалган дээр"}, 1},
                                {"Гал түймрийн сургалт хэзээ хийдэг вэ?", []string{"Жил бүр", "2 жилд нэг", "3 жилд нэг", "6 сард нэг"}, 0},
                                {"Гал түймрийн дараа юу хийх ёстой вэ?", []string{"Ажлаа үргэлжлүүлэх", "Шалтгааныг олох", "Далдлах", "Юу ч хийхгүй"}, 1},
                                {"Гал түймрийн тухай хууль хэдэн бүлэгтэй вэ?", []string{"3", "5", "7", "10"}, 2},
                                {"Гал түймрийн хор уршгийг хэрхэн бууруулах вэ?", []string{"Агааржуулалт", "Унтраагуур", "Сэнсэлгээ", "Бүгд"}, 3},
                                {"Гал түймрийн үед хэн хариуцдаг вэ?", []string{"Ажилтан", "Ажил олгогч", "Гал унтраагуулах байгууллага", "Бүгд"}, 3},
                                {"Гал түймрийн урьдчилан сэргийлэх 3 алхам юу вэ?", []string{"Таних, үнэлэх, хянах", "Хаах, нээх, хийх", "Сургах, хянах, унтраах", "Зогсох, харах, явах"}, 0},
                                {"Гал түймрийн мэдээллийн системийг хэн хариуцдаг вэ?", []string{"Ажил олгогч", "Гал унтраагуулах байгууллага", "ХАБЭА-ын мэргэжилтэн", "Бүгд"}, 3},
                                {"Гал түймрийн ангиллын тухай мэдлэг ямар чухал вэ?", []string{"Унтраагуур сонгох", "Эвакуацлах", "Хянах", "Бүгд"}, 3},
                                {"Гал түймрийн үед утсаар ярих ёстой уу?", []string{"Тийм", "Үгүй", "Зөвхөн шууданг", "Зөвхөн утас"}, 1},
                                {"Гал түймрийн сургалтын төрөл хэд байдаг вэ?", []string{"1", "2", "3", "4"}, 2},
                                {"Гал түймрийн тухай дүрмийг хаана байрлуулах ёстой вэ?", []string{"Оффисод", "Ажлын байрны бүх газар", "Зөвхөн үйлдвэрт", "Гал унтраагуулах байгууллагад"}, 1},
                },
                },
                {
                        title:       "Гал түймэр, онцгой нөхцөл - II",
                        description: "Онцгой нөхцөлд үйлдэх журам",
                        category:    "Гал түймэр, онцгой нөхцөл",
                        questions: []struct {
                                q       string
                                options []string
                                correct int
                        }{
                                {"Онцгой нөхцөл гэж юу вэ?", []string{"Гал түймэр", "Гэмтэл", "Дарамт", "Бүгд"}, 3},
                                {"Онцгой нөхцөлийн ангилал хэд байдаг вэ?", []string{"1", "2", "3", "5"}, 2},
                                {"Онцгой нөхцөлд ямар утасдаж дуудах вэ?", []string{"101", "102", "103", "105"}, 2},
                                {"Онцгой нөхцөлийн үед эхний үйлдэл юу вэ?", []string{"Зугтах", "Мэдээлэх, хамгаалах", "Ажлаа үргэлжлүүлэх", "Дуугарах"}, 1},
                                {"Онцгой нөхцөлийн төлөвлөгөө хэнд байдаг вэ?", []string{"Ажил олгогч", "Онцгой байдлын байгууллага", "Ажилтан", "Цагдаа"}, 0},
                                {"Онцгой нөхцөлийн сургалт хэзээ хийдэг вэ?", []string{"Жил бүр", "2 жилд нэг", "3 жилд нэг", "6 сард нэг"}, 0},
                                {"Онцгой нөхцөлийн үед хэн хариуцдаг вэ?", []string{"Ажилтан", "Ажил олгогч", "Онцгой байдлын байгууллага", "Бүгд"}, 3},
                                {"Онцгой нөхцөлийн тухай хууль хэдэн бүлэгтэй вэ?", []string{"3", "5", "7", "10"}, 2},
                                {"Онцгой нөхцөлийн дараа юу хийх ёстой вэ?", []string{"Ажлаа үргэлжлүүлэх", "Шалтгааныг олох", "Далдлах", "Юу ч хийхгүй"}, 1},
                                {"Онцгой нөхцөлийн ангиллын тухай мэдлэг ямар чухал вэ?", []string{"Хариу өгөх", "Хамгаалах", "Эвакуацлах", "Бүгд"}, 3},
                                {"Онцгой нөхцөлийн мэдээллийн систем ямар байдаг вэ?", []string{"Дуут", "Гэрэлт", "Сэрүүлэг", "Бүгд"}, 3},
                                {"Онцгой нөхцөлийн үед хаашаа явах ёстой вэ?", []string{"Дээш", "Доош", "Гарах үүд", "Цонх"}, 2},
                                {"Онцгой нөхцөлийн сургалтын төрөл хэд байдаг вэ?", []string{"1", "2", "3", "4"}, 2},
                                {"Онцгой нөхцөлийн тухай дүрмийг хаана байрлуулах ёстой вэ?", []string{"Оффисод", "Ажлын байрны бүх газар", "Зөвхөн үйлдвэрт", "Онцгой байдлын байгууллагад"}, 1},
                                {"Онцгой нөхцөлийн үед ямар хэрэгсэл хэрэгтэй вэ?", []string{"Эхний тусламжийн хайрцаг", "Унтраагуур", "Амьсгалын хамгаалалт", "Бүгд"}, 3},
                                {"Онцгой нөхцөлийн үр дагавар юу вэ?", []string{"Хүний амь насны алдагдал", "Малын хорогдол", "Орчны гэмтэл", "Бүгд"}, 3},
                                {"Онцгой нөхцөлийн үед хэн тусалдаг вэ?", []string{"Ажилтан", "Ажил олгогч", "Онцгой байдлын байгууллага", "Бүгд"}, 3},
                                {"Онцгой нөхцөлийн урьдчилан сэргийлэх гол арга юу вэ?", []string{"Сургалт", "Хяналт", "Төлөвлөгөө", "Бүгд"}, 3},
                                {"Онцгой нөхцөлийн дараахь 3 үйлдэл юу вэ?", []string{"Мэдээлэх, тусламж үзүүлэх, мөрдөн байцаах", "Ажлаа үргэлжлүүлэх", "Далдлах", "Ажилтнийг огтлох"}, 0},
                                {"Онцгой нөхцөлийн тухай мэдлэгийг хэн олгодог вэ?", []string{"Ажил олгогч", "ХАБЭА-ын байгууллага", "Онцгой байдлын байгууллага", "Бүгд"}, 3},
                },
                },
        }

        totalQuestions := 0

        for _, qd := range quizDefs {
                quizID := uuid.New().String()

                quiz := Quiz{
                        ID:            quizID,
                        Title:         qd.title,
                        Description:   qd.description,
                        Category:      qd.category,
                        QuestionCount: len(qd.questions),
                }
                DB.Create(&quiz)

                for idx, q := range qd.questions {
                        optsJSON, _ := json.Marshal(q.options)

                        qq := QuizQuestion{
                                ID:       uuid.New().String(),
                                QuizID:   quizID,
                                Question: q.q,
                                Options:  string(optsJSON),
                                Correct:  q.correct,
                                Index:    idx,
                        }
                        DB.Create(&qq)
                        totalQuestions++
                }
        }

        log.Printf("Seeded %d quizzes with %d questions", len(quizDefs), totalQuestions)
        return totalQuestions
}

// GetQuizQuestionsHandler returns questions for a specific quiz (for quiz taking)
func GetQuizQuestionsHandler(c *gin.Context) {
        quizID := c.Query("quizId")
        if quizID == "" {
                c.JSON(http.StatusBadRequest, gin.H{"error": "quizId query parameter required"})
                return
        }

        var questions []QuizQuestion
        if err := DB.Where("quiz_id = ?", quizID).Order("index ASC").Find(&questions).Error; err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch questions"})
                return
        }

        type SafeQuestion struct {
                ID       string   `json:"id"`
                QuizID   string   `json:"quizId"`
                Question string   `json:"question"`
                Options  []string `json:"options"`
                Index    int      `json:"index"`
        }

        safeQuestions := make([]SafeQuestion, len(questions))
        for i, q := range questions {
                var opts []string
                json.Unmarshal([]byte(q.Options), &opts)

                safeQuestions[i] = SafeQuestion{
                        ID:       q.ID,
                        QuizID:   q.QuizID,
                        Question: q.Question,
                        Options:  opts,
                        Index:    q.Index,
                }
        }

        var quiz Quiz
        DB.Select("id, title").Where("id = ?", quizID).First(&quiz)

        c.JSON(http.StatusOK, gin.H{
                "quiz":     gin.H{"id": quiz.ID, "title": quiz.Title},
                "questions": safeQuestions,
        })
}

// GetExamQuestionsHandler returns questions for a specific exam
func GetExamQuestionsHandler(c *gin.Context) {
        examID := c.Query("examId")
        if examID == "" {
                c.JSON(http.StatusBadRequest, gin.H{"error": "examId query parameter required"})
                return
        }

        var exam Exam
        if err := DB.Where("id = ?", examID).First(&exam).Error; err != nil {
                c.JSON(http.StatusNotFound, gin.H{"error": "Exam not found"})
                return
        }

        var questions []QuizQuestion
        if err := DB.Where("quiz_id = ?", examID).Order("index ASC").Find(&questions).Error; err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch questions"})
                return
        }

        type SafeQuestion struct {
                ID       string   `json:"id"`
                Question string   `json:"question"`
                Options  []string `json:"options"`
                Index    int      `json:"index"`
        }

        safeQuestions := make([]SafeQuestion, len(questions))
        for i, q := range questions {
                var opts []string
                json.Unmarshal([]byte(q.Options), &opts)

                safeQuestions[i] = SafeQuestion{
                        ID:       q.ID,
                        Question: q.Question,
                        Options:  opts,
                        Index:    q.Index,
                }
        }

        c.JSON(http.StatusOK, gin.H{
                "exam":      exam,
                "questions": safeQuestions,
        })
}

// Unused import suppression
var _ = strconv.Itoa

// ============================================================
// RegisterCourseHandler - Course бүртгэл
// ============================================================
func RegisterCourseHandler(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{"message": "Амжилттай бүртгэгдлээ"})
}

// ============================================================
// SeedQuizzesHandler - Quiz дата тарих
// ============================================================
func SeedQuizzesHandler(c *gin.Context) {
        count := seedQuizzes()
        c.JSON(http.StatusOK, gin.H{
                "message": "Амжилттай тарлаа",
                "count":   count,
        })
}
