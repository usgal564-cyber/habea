package main

import "time"

// ============================================================
// Core User
// ============================================================

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

// ============================================================
// Admin Account (multiple admin codes with roles)
// ============================================================

type AdminAccount struct {
        ID    string `gorm:"primaryKey;size:36" json:"id"`
        Code  string `gorm:"uniqueIndex" json:"code"`
        Name  string `json:"name"`
        Email string `json:"email"`
        Role  string `json:"role"` // ADMIN, MANAGER, TEACHER
}

// ============================================================
// Courses (Training / Сургалт)
// ============================================================

type Course struct {
        ID          string    `gorm:"primaryKey;size:36" json:"id"`
        Title       string    `json:"title"`
        Category    string    `json:"category"`
        Description string    `json:"description"`
        Duration    string    `json:"duration"`
        Price       float64   `json:"price"`
        Schedule    string    `json:"schedule"`
        Location    string    `json:"location"`
        StartDate   string    `json:"startDate"`
        MaxStudents int       `json:"maxStudents"`
        CreatedAt   time.Time `json:"createdAt"`
}

// ============================================================
// Quiz (Мэдлэг сорих)
// ============================================================

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
        OptionA  string `json:"optionA"`
        OptionB  string `json:"optionB"`
        OptionC  string `json:"optionC"`
        OptionD  string `json:"optionD"`
        Correct  int    `json:"-"` // 0=A, 1=B, 2=C, 3=D
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

// ============================================================
// Exam (Шалгалт)
// ============================================================

type Exam struct {
        ID            string    `gorm:"primaryKey;size:36" json:"id"`
        Title         string    `json:"title"`
        Code          string    `gorm:"uniqueIndex" json:"code"`
        Duration      int       `json:"duration"`
        QuestionCount int       `json:"questionCount"`
        IsActive      bool      `gorm:"default:false" json:"isActive"`
        EndDate       *time.Time `json:"endDate"`
        CreatedAt     time.Time `json:"createdAt"`
}

type ExamQuestion struct {
        ID       string `gorm:"primaryKey;size:36" json:"id"`
        ExamID   string `json:"examId"`
        Question string `json:"question"`
        OptionA  string `json:"optionA"`
        OptionB  string `json:"optionB"`
        OptionC  string `json:"optionC"`
        OptionD  string `json:"optionD"`
        Correct  int    `json:"-"` // 0=A, 1=B, 2=C, 3=D
        Index    int    `json:"index"`
}

type ExamAttempt struct {
        ID        string    `gorm:"primaryKey;size:36" json:"id"`
        UserID    string    `json:"userId"`
        ExamID    string    `json:"examId"`
        Score     int       `json:"score"`
        Total     int       `json:"total"`
        Passed    bool      `json:"passed"`
        Answers   string    `json:"answers" gorm:"type:text"`
        TimeSpent int       `json:"timeSpent"`
        CreatedAt time.Time `json:"createdAt"`
}

// ============================================================
// Enrollment (Course registration)
// ============================================================

type Enrollment struct {
        ID        string    `gorm:"primaryKey;size:36" json:"id"`
        UserID    string    `json:"userId"`
        CourseID  string    `json:"courseId"`
        Paid      bool      `gorm:"default:false" json:"paid"`
        CreatedAt time.Time `json:"createdAt"`
}

// ============================================================
// Consultation (Зөвлөх үйлчилгээ)
// ============================================================

type Consultation struct {
        ID           string    `gorm:"primaryKey;size:36" json:"id"`
        UserID       string    `json:"userId"`
        Name         string    `json:"name"`
        Email        string    `json:"email"`
        Phone        string    `json:"phone"`
        Company      string    `json:"company"`
        ServiceType  string    `json:"serviceType"`
        Message      string    `json:"message"`
        ConsultantID string    `json:"consultantId"`
        Status       string    `gorm:"default:pending" json:"status"` // pending, in_progress, completed
        CreatedAt    time.Time `json:"createdAt"`
}

// ============================================================
// Forms (Contact, Feedback, Survey, Service Order)
// ============================================================

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
