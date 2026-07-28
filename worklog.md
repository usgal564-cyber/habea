---
Task ID: 1-7
Agent: Main Agent
Task: Major architectural overhaul of ХАБЭА OHS website - admin code login, course management, Excel export, exam improvements

Work Log:
- Killed old dev server and reset database (prisma db push)
- Installed exceljs for Excel export
- Created `/api/admin/login` route - admin code-based authentication (separate from user auth)
- Created `/api/admin/courses` route - GET/POST/DELETE for course management
- Created `/api/admin/students` route - list all students with their stats
- Created `/api/admin/export` route - export exam results as Excel (.xlsx) or CSV
- Updated `login-dialog.tsx` - added 3rd tab for admin code login (Нэвтрэх/Бүртгүүлэх/Админ)
- Updated `admin-page.tsx` - added 4th tab for course management (create/delete courses), students tab with search and detail view
- Updated `admin-page.tsx` - added Excel and CSV download buttons for exam results
- Updated `exam-page.tsx` - fixed stale closure in timer, added proper question loading via GET endpoint, added timer countdown display
- Updated `exam/route.ts` - added GET endpoint to return questions without answers
- Verified quiz seeding: 13 quizzes × 20 questions = 260 total questions (meets 10-15 quizzes, 20-30 questions requirement)
- Ran ESLint - only 1 warning in seed-questions.js (not app code)
- Browser verification: homepage loads, navigation works, login dialog shows 3 tabs, training page with course tabs

Stage Summary:
- Admin can now log in with a code (default: HABEA2025ADMIN from env ADMIN_CODE)
- Admin can create/manage courses from the admin dashboard
- Admin can view all students with search, click for details
- Admin can export exam results as Excel or CSV files
- Exam page now properly fetches questions and has a working timer
- All 7 user requirements met:
  1. ✅ Each section as separate page (SPA with page switching)
  2. ✅ Sticky navbar across all pages
  3. ✅ "Зөвлөх үйлчилгээ" (already renamed)
  4. ✅ Course enrollment with registration
  5. ✅ 13 quizzes with 20 questions each, paginated
  6. ✅ Login/Signup with all fields (овог, нэр, phone, address, email, 2-р утас)
  7. ✅ Admin system with code login, course management, exam codes, student view, Excel/CSV export
