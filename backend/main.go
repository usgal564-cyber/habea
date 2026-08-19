package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
)

func main() {
	// Database эхлүүлэх (migration болон seeding)
	InitDB()

	// Release mode тохируулах
	gin.SetMode(gin.ReleaseMode)

	r := gin.Default()

	// Robust CORS Middleware (Vercel & Local cross-origin хүсэлтүүдэд зориулсан)
	r.Use(func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		if origin != "" {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		} else {
			c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		}
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		c.Writer.Header().Set("Access-Control-Max-Age", "86400")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// ============================================================
	// Root & Health Check routes
	// ============================================================
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "success",
			"message": "Backend API is running successfully!",
		})
	})

	r.GET("/api", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "success",
			"message": "API endpoint target reach",
		})
	})

	// ============================================================
	// Public Auth routes (Нэвтрэх, Бүртгүүлэх)
	// ============================================================
	r.POST("/api/auth/register", RegisterHandler)
	r.POST("/api/auth/login", LoginHandler)
	r.GET("/api/auth/me", AuthMiddleware(), MeHandler)

	// Админ нэвтрэх endpoint (Нийтийн буюу middleware-гүй хэсэгт байх ёстой)
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
	r.POST("/api/exam", ExamHandler)
	r.GET("/api/exam", AuthMiddleware(), GetExamQuestionsHandler)
	r.GET("/api/exam/history", AuthMiddleware(), GetExamHistoryHandler)
	r.GET("/api/exam/export/:attemptId", AuthMiddleware(), ExportExamHandler)

	// ============================================================
	// Course routes (Сургалт)
	// ============================================================
	r.GET("/api/courses", GetCoursesHandler)
	r.POST("/api/courses/payment", AuthMiddleware(), CoursePaymentHandler)
	r.POST("/api/courses/:id/register", AuthMiddleware(), RegisterCourseHandler)

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
	r.GET("/api/consultations/unread-count", AuthMiddleware(), GetUnreadConsultationsCountHandler)
	r.PUT("/api/consultations/:id/read", AuthMiddleware(), MarkConsultationReadHandler)

	r.POST("/api/service-order", ServiceOrderHandler)

	// ============================================================
	// Protected Admin routes (зөвхөн Токентой + Админ эрхтэй хэрэглэгчид)
	// ============================================================
	adminGroup := r.Group("/api/admin", AuthMiddleware(), AdminMiddleware())
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
		adminGroup.PUT("/consultations/:id/response", AdminReplyConsultationHandler)
		adminGroup.DELETE("/consultations/:id", AdminDeleteConsultationHandler)

		// Contact forms management
		adminGroup.GET("/contact-forms", AdminGetContactFormsHandler)
		adminGroup.DELETE("/contact-forms/:id", AdminDeleteContactFormHandler)

		// Survey results
		adminGroup.GET("/survey-results", AdminGetSurveyResultsHandler)

		// General export
		adminGroup.GET("/export", AdminExportHandler)
	}

	// Port тохиргоо
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server running on port %s", port)
	if err := r.Run(fmt.Sprintf(":%s", port)); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
