package main

import (
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize database
	InitDB()

	// Set gin to release mode
	gin.SetMode(gin.ReleaseMode)

	r := gin.Default()

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

	// Auth routes
	r.POST("/api/auth/register", RegisterHandler)
	r.POST("/api/auth/login", LoginHandler)
	r.GET("/api/auth/me", AuthMiddleware(), MeHandler)
	r.POST("/api/admin/login", AdminLoginHandler)

	// Quiz routes
	r.GET("/api/quiz", GetQuizzesHandler)
	r.GET("/api/quiz/questions", AuthMiddleware(), GetQuizQuestionsHandler)
	r.POST("/api/quiz/payment", AuthMiddleware(), QuizPaymentHandler)

	// Exam routes
	r.POST("/api/exam", ExamHandler)
	r.GET("/api/exam", AuthMiddleware(), GetExamQuestionsHandler)

	// Course routes
	r.GET("/api/courses", GetCoursesHandler)
	r.POST("/api/courses/payment", AuthMiddleware(), CoursePaymentHandler)
	r.POST("/api/courses/:id/register", AuthMiddleware(), RegisterCourseHandler)

	// Profile routes
	r.GET("/api/profile", AuthMiddleware(), GetProfileHandler)

	// Form routes
	r.POST("/api/feedback", FeedbackHandler)
	r.POST("/api/survey", SurveyHandler)
	r.POST("/api/contact", ContactHandler)
	r.POST("/api/consultations", ConsultationHandler)
	r.POST("/api/service-order", ServiceOrderHandler)

	// Admin routes (require ADMIN role)
	adminGroup := r.Group("/api/admin", AuthMiddleware(), AdminMiddleware())
	{
		adminGroup.GET("/exams", AdminGetExamsHandler)
		adminGroup.POST("/exams", AdminCreateExamHandler)
		adminGroup.POST("/exams/:id/start", AdminStartExamHandler)
		adminGroup.GET("/exams/:id/results", AdminExamResultsHandler)
		adminGroup.GET("/courses", AdminGetCoursesHandler)
		adminGroup.POST("/courses", AdminCreateCourseHandler)
		adminGroup.GET("/students", AdminGetStudentsHandler)
		adminGroup.POST("/seed-quiz", SeedQuizzesHandler)
		adminGroup.GET("/export", AdminExportHandler)
	}

	log.Println("Server starting on port 8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}