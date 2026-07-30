package main

import "time"

type User struct {
	ID             string    `gorm:"primaryKey;size:36" json:"userId"`
	FirstName      string    `json:"firstName"`
	LastName       string    `json:"lastName"`
	Email          string    `gorm:"uniqueIndex" json:"email"`
	Phone          string    `json:"phone"`
	Password       string    `json:"-"`
	Address        string    `json:"address"`
	SecondaryPhone string    `json:"secondaryPhone"`
	Role           string    `gorm:"default:USER" json:"role"`
	CreatedAt      time.Time `json:"createdAt"`
}

type Course struct {
	ID          string    `gorm:"primaryKey;size:36" json:"id"`
	Title       string    `json:"title"`
	Category    string    `json:"category"`
	Description string    `json:"description"`
	Duration    string    `json:"duration"`
	Price       float64   `json:"price"`
	Schedule    string    `json:"schedule"`
	Location    string    `json:"location"`
	MaxStudents int       `json:"maxStudents"`
	CreatedAt   time.Time `json:"createdAt"`
}

type Quiz struct {
	ID            string    `gorm:"primaryKey;size:36" json:"id"`
	Title         string    `json:"title"`
	Description   string    `json:"description"`
	Category      string    `json:"category"`
	QuestionCount int       `json:"questionCount"`
	CreatedAt     time.Time `json:"createdAt"`
}

type QuizQuestion struct {
	ID       string `gorm:"primaryKey;size:36" json:"id"`
	QuizID   string `json:"quizId"`
	Question string `json:"question"`
	Options  string `json:"-" gorm:"type:text"`
	Correct  int    `json:"-"`
	Index    int    `json:"index"`
}

type QuizAttempt struct {
	ID        string    `gorm:"primaryKey;size:36" json:"id"`
	UserID    string    `json:"userId"`
	QuizID    string    `json:"quizId"`
	Score     int       `json:"score"`
	Total     int       `json:"total"`
	Answers   string    `json:"answers" gorm:"type:text"`
	CreatedAt time.Time `json:"createdAt"`
}

type Exam struct {
	ID            string    `gorm:"primaryKey;size:36" json:"id"`
	Title         string    `json:"title"`
	Code          string    `gorm:"uniqueIndex" json:"code"`
	Duration      int       `json:"duration"`
	QuestionCount int       `json:"questionCount"`
	IsActive      bool      `gorm:"default:false" json:"isActive"`
	CreatedAt     time.Time `json:"createdAt"`
}

type ExamAttempt struct {
	ID        string    `gorm:"primaryKey;size:36" json:"id"`
	UserID    string    `json:"userId"`
	ExamID    string    `json:"examId"`
	Score     int       `json:"score"`
	Total     int       `json:"total"`
	Passed    bool      `json:"passed"`
	Answers   string    `json:"answers" gorm:"type:text"`
	CreatedAt time.Time `json:"createdAt"`
}

type Enrollment struct {
	ID        string    `gorm:"primaryKey;size:36" json:"id"`
	UserID    string    `json:"userId"`
	CourseID  string    `json:"courseId"`
	Paid      bool      `gorm:"default:false" json:"paid"`
	CreatedAt time.Time `json:"createdAt"`
}

type ContactForm struct {
	ID        string    `gorm:"primaryKey;size:36" json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Phone     string    `json:"phone"`
	Subject   string    `json:"subject"`
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"createdAt"`
}

type Feedback struct {
	ID        string    `gorm:"primaryKey;size:36" json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Phone     string    `json:"phone"`
	Message   string    `json:"message"`
	Rating    int       `json:"rating"`
	CreatedAt time.Time `json:"createdAt"`
}

type SurveyResponse struct {
	ID        string    `gorm:"primaryKey;size:36" json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Phone     string    `json:"phone"`
	Responses string    `json:"responses" gorm:"type:text"`
	CreatedAt time.Time `json:"createdAt"`
}

type ServiceOrder struct {
	ID          string    `gorm:"primaryKey;size:36" json:"id"`
	Name        string    `json:"name"`
	Email       string    `json:"email"`
	Phone       string    `json:"phone"`
	Company     string    `json:"company"`
	ServiceType string    `json:"serviceType"`
	Message     string    `json:"message"`
	Date        string    `json:"date"`
	CreatedAt   time.Time `json:"createdAt"`
}
