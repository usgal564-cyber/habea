package main

import (
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize database (includes migration and seeding)
	InitDB()

	// Set gin to release mode
	gin.SetMode(gin.ReleaseMode)

	r := gin.Default()
	r.Use(CORSMiddleware())

	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Writer.Header().Set("Access-Control-Max-Age", "86400")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// ============================================================
	// Auth routes (public)
	// ============================================================
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Backend API is running successfully!",
		})
	})
	r.POST("/api/auth/register", RegisterHandler)
	r.POST("/api/auth/login", LoginHandler)
	r.GET("/api/auth/me", AuthMiddleware(), MeHandler)
	r.POST("/api/admin/login", AdminLoginHandler)

	// ============================================================
	// Quiz routes (Мэдлэг сорих)
	// ============================================================
	r.GET("/api/quiz", GetQuizzesHandler)
	r.GET("/api/quiz/questions", AuthMiddleware(), GetQuizQuestionsHandler)
	r.POST("/api/quiz/payment", AuthMiddleware(), QuizPaymentHandler)
	r.POST("/api/quiz/submit", AuthMiddleware(), QuizSubmitHandler)

	// ============================================================
	// Exam routes (Шалгалт)
	// ============================================================
	r.POST("/api/exam", ExamHandler)                                          // verify + submit actions
	r.GET("/api/exam", AuthMiddleware(), GetExamQuestionsHandler)             // get questions by examId
	r.GET("/api/exam/history", AuthMiddleware(), GetExamHistoryHandler)       // user exam history
	r.GET("/api/exam/export/:attemptId", AuthMiddleware(), ExportExamHandler) // export single attempt as CSV

	// ============================================================
	// Course routes (Сургалт)
	// ============================================================
	r.GET("/api/courses", GetCoursesHandler)
	r.POST("/api/courses/payment", AuthMiddleware(), CoursePaymentHandler)
	r.POST("/api/courses/:id/register", AuthMiddleware(), RegisterCourseHandler)
	r.GET("/api/courses", func(c *gin.Context) {
		c.JSON(200, gin.H{"courses": []string{}})
	})

	r.GET("/api/exam/history", AuthMiddleware(), func(c *gin.Context) {
		c.JSON(200, gin.H{"history": []string{}})
	})

	// ============================================================
	// Profile routes
	// ============================================================
	r.GET("/api/profile", AuthMiddleware(), GetProfileHandler)
	r.PUT("/api/profile", AuthMiddleware(), UpdateProfileHandler)

	// ============================================================
	// Form routes (public)
	// ============================================================
	r.POST("/api/feedback", FeedbackHandler)
	r.GET("/api/feedback", GetFeedbackHandler)
	r.DELETE("/api/feedback/:id", AuthMiddleware(), AdminMiddleware(), DeleteFeedbackHandler)

	r.POST("/api/survey", AuthMiddleware(), SurveyHandler)
	r.GET("/api/survey/results", AuthMiddleware(), AdminMiddleware(), GetSurveyResultsHandler)

	r.POST("/api/contact", ContactHandler)

	r.POST("/api/consultations", AuthMiddleware(), ConsultationHandler)
	r.GET("/api/consultations", AuthMiddleware(), GetConsultationsHandler)

	r.POST("/api/service-order", ServiceOrderHandler)

	// ============================================================
	// Admin routes (ADMIN, MANAGER, TEACHER)
	// ============================================================
	adminGroup := r.Group("/api/admin", AuthMiddleware(), AdminMiddleware())
	r.Run(":8080")
	{
		// Dashboard
		adminGroup.GET("/dashboard", DashboardHandler)

		// Exams management
		adminGroup.GET("/exams", AdminGetExamsHandler)
		adminGroup.POST("/exams", AdminCreateExamHandler)
		adminGroup.GET("/exam-attempts", AdminGetExamAttemptsHandler)
		adminGroup.GET("/exam-attempts/export", AdminExportExamAttemptsHandler)
		adminGroup.GET("/exams/:id/results", AdminGetExamDetailHandler)
		adminGroup.GET("/exams/:id/questions", AdminGetExamQuestionsHandler)
		adminGroup.PUT("/exams/:id/stop", AdminStopExamHandler)
		adminGroup.PUT("/exams/:id/start", AdminStartExamHandler)
		adminGroup.DELETE("/exams/:id", AdminDeleteExamHandler)

		// Courses management
		adminGroup.GET("/courses", AdminGetCoursesHandler)
		adminGroup.GET("/courses/:id/enrollments", AdminGetCourseEnrollmentsHandler)
		adminGroup.POST("/courses", AdminCreateCourseHandler)

		// Quizzes management
		adminGroup.GET("/quizzes", AdminGetQuizzesHandler)
		adminGroup.POST("/quizzes", AdminCreateQuizHandler)

		// Students
		adminGroup.GET("/students", AdminGetStudentsHandler)

		// Feedback management
		adminGroup.GET("/feedback", AdminGetFeedbackHandler)

		// Consultation management
		adminGroup.GET("/consultations", AdminGetConsultationsHandler)
		adminGroup.PUT("/consultations/:id/status", AdminUpdateConsultationStatusHandler)
		adminGroup.DELETE("/consultations/:id", AdminDeleteConsultationHandler)

		// Contact forms management
		adminGroup.GET("/contact-forms", AdminGetContactFormsHandler)
		adminGroup.DELETE("/contact-forms/:id", AdminDeleteContactFormHandler)

		// Survey results
		adminGroup.GET("/survey-results", AdminGetSurveyResultsHandler)

		// General export
		adminGroup.GET("/export", AdminExportHandler)
	}

	log.Println("Server starting on port 8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
