🎀 PinkNotes
AI-Powered Learning & Study Platform

🌐 Live Demo · ⚙️ Backend API · 📚 API Docs

Collect. Understand. Practice. Improve.

PinkNotes is a full-stack AI-powered learning platform designed to help students collect, understand, practice, and improve their learning.

It combines smart note management, OCR-powered document processing, AI assistance, AI-based content validation, quiz generation, bookmarks, performance analytics, learning streaks, and personalized practice recommendations into one platform.

✨ Highlights
🤖 AI Doubt Solver for explanations, examples, summaries, key concepts, and revision notes
🔎 OCR-powered document processing for scanned PDFs
🛡️ AI-powered note validation before resources enter the approved library
📚 Personal and community note library
📄 Dedicated Note Detail pages
🔖 Bookmarks / Save Notes
🧪 AI-generated quizzes
🎯 Topic-based and subject-based quizzes
🎚️ Easy, Medium, Hard, and Mixed difficulty
🔀 Server-side randomized answer positions
📝 Quiz history and attempt tracking
📊 Subject and topic performance analytics
🔥 Learning streak tracking
🧠 Personalized learning recommendations
📅 Learning Today dashboard
🔐 Supabase Authentication
🔒 PostgreSQL Row Level Security
☁️ Private cloud file storage with signed URLs
📤 File validation and upload quotas
🚀 Production deployment with Vercel and Render
🌸 How PinkNotes Works

PinkNotes is built around a continuous learning cycle:

┌─────────────┐
│   COLLECT   │
│             │
│ Upload and  │
│ organize    │
│ notes       │
└──────┬──────┘
       ↓
┌─────────────┐
│  UNDERSTAND │
│             │
│ Ask AI and  │
│ learn       │
└──────┬──────┘
       ↓
┌─────────────┐
│   PRACTICE  │
│             │
│ Generate    │
│ quizzes     │
└──────┬──────┘
       ↓
┌─────────────┐
│   IMPROVE   │
│             │
│ Track       │
│ performance │
└──────┬──────┘
       ↓
       └──────────────→ Personalized Practice
🚀 Features
🔐 Authentication

PinkNotes uses Supabase Authentication for secure user accounts.

User registration
Login/logout
Email verification
Persistent sessions
Protected workflows
User-specific resources
Authenticated backend API requests
📚 Smart Note Management

Students can upload and manage their own study resources.

Supported formats
PDF
DOCX
TXT
Upload features
Drag-and-drop upload
File extension validation
File size validation
Daily upload quota
Text extraction
OCR for scanned PDFs
AI-powered content validation
Upload status tracking
Secure cloud storage
Current limits
Maximum file size: 10 MB
Maximum uploads per day: 10
🔎 OCR-Powered Document Processing

PinkNotes supports both text-based and scanned/image-based PDFs.

Processing pipeline:-

Uploaded Document
       ↓
File Validation
       ↓
Text Extraction
       ↓
Enough Text?
   ↙          ↘
 YES           NO
 ↓              ↓
Use Text       OCR
                ↓
          Extracted Text
                ↓
         AI Validation
                ↓
       Store / Flag / Reject

OCR processing uses:

PyMuPDF
PaddleOCR
PaddlePaddle

OCR processing is controlled through page and text limits to keep document processing predictable.

🤖 AI Doubt Solver:

PinkNotes includes an AI-powered learning assistant using Groq.

Students can ask questions about:

Academic concepts
Difficult topics
Uploaded notes
Examples
Revision material
Key concepts
AI capabilities
Explain concepts
Explain concepts simply
Give examples
Summarize material
Extract key concepts
Create revision notes
Quiz the student
Note-aware AI

When studying a specific note, the AI can use extracted note content as learning context.

Example actions:

"Explain this in simple terms."

"Give me an example."

"What are the key concepts?"

"Make revision notes."

"Quiz me on this."

Uploaded documents are treated as untrusted reference material rather than executable instructions.

🛡️ AI-Powered Note Validation:

Uploaded resources are analyzed before entering the approved note library.

The validation system can classify content into categories such as:

Academic
Personal
Promotional
Spam
Malicious
Entertainment
Other

Possible decisions:

Approved
Flagged
Rejected

Example structured AI response:

{
  "decision": "approved",
  "category": "academic",
  "confidence": 0.95,
  "reason": "Academic study material."
}

If validation fails, the system fails closed and flags the content rather than automatically approving it.

📖 Browse Notes:

PinkNotes includes an approved resource library where students can discover study material.

Features
Search notes
Filter by subject
Sort by newest
Sort by oldest
Sort alphabetically
View resource details
Download resources securely
Generate quizzes
Save notes

Only approved notes are displayed through the shared resource library.

📄 Note Detail:

Each approved note has a dedicated detail page.

Students can:

Read extracted content
View subject and file information
Save/unsave the note
Download the original file
Generate a quiz
Ask the AI about the note

OCR-generated text is cleaned before being presented to the user to remove unnecessary scanner-related artifacts and excessive blank lines.

🔖 Bookmarks:

Students can save useful study resources for later.

Bookmark features
Save a note
Remove a bookmark
View saved notes
Search bookmarks
Filter by subject
Sort bookmarks
Open saved notes
Download saved notes
Generate quizzes from saved notes

Bookmarks are isolated per authenticated user.

🧪 AI Quiz Generator:

PinkNotes dynamically generates multiple-choice quizzes using AI.

Quizzes can be generated using different learning contexts.

Specific Topic

Example:

Subject: Data Structures
Topic: Trees

Topic quizzes assess established academic knowledge related to the selected topic rather than simply copying questions from a particular note.

For example, a Trees quiz may cover:

Terminology
Binary trees
Tree traversals
Binary Search Trees
Searching
Insertion/deletion
Balanced trees
AVL trees
Heaps where relevant
Complexity
Applications
Exam/interview concepts
Entire Subject

Students can generate comprehensive practice for an entire subject.

Example:

Data Structures

Potential areas include:

Arrays
Linked Lists
Stacks
Queues
Trees
Graphs
Hashing
Sorting
Searching
Heaps

The quiz is therefore not restricted to a single uploaded document.

General Subject Practice

Students can also generate quizzes using a subject without relying on a specific uploaded note.

🎯 Quiz Difficulty:

PinkNotes supports four difficulty modes.

Difficulty	Focus
Easy	Fundamentals, terminology and basic understanding
Medium	Application, comparison and moderate reasoning
Hard	Deeper reasoning, edge cases, complexity and multi-step problems
Mixed	Balanced combination of difficulties

Students can also choose the number of questions.

🔀 Randomized Answer Options:

Correct answer positions are randomized server-side using secure randomness.

This prevents predictable answer placement.

Question
   ↓
Generate options
   ↓
Identify correct answer
   ↓
Randomize option positions
   ↓
Store correct position
   ↓
Present quiz

📝 Quiz History & Attempts:

Completed quizzes are stored so students can track their learning over time.

Tracked information includes:

Quiz score
Number of questions
Subject
Topic
Difficulty
Completion status
Completion timestamp
Answers
Performance history

📊 Learning Analytics:

PinkNotes analyzes completed quiz attempts to provide learning insights.

Analytics include:

Overall quiz performance
Score history
Subject performance
Topic performance
Questions attempted
Questions answered correctly
Completed quizzes
Learning streak
Active learning days
Longest streak
Personalized recommendations

🔥 Learning Streak:

PinkNotes tracks consecutive learning activity based on completed quiz attempts.

The dashboard displays:

Current Streak
Longest Streak
Active Days — Last 7 Days
Last Activity

🎯 Personalized Learning Recommendations:

PinkNotes analyzes quiz performance and identifies areas where additional practice may be useful.

Recommendations can be generated at:

Topic level
       OR
Subject level

Example:

Recommended Practice

Trees
Data Structures

Based on your recent quiz performance,
this topic could use additional practice.

[ Practice Now ]

The Practice Now action opens the quiz workflow with the relevant learning context already selected.

📅 Learning Today:

The dashboard includes a dedicated learning section showing:

Current streak
Recommended practice
Active learning days
Longest streak
Practice Now action

This creates a continuous learning loop:

Performance
    ↓
Recommendation
    ↓
Practice
    ↓
New Performance Data
🧭 Product Flow
1. Collect
Build Your Library

Upload your study material and keep your resources organized.

2. Understand
Learn With AI

Ask questions, simplify concepts, generate examples, and create revision material.

3. Practice
Start Practicing

Generate quizzes based on topics, subjects, or notes.

4. Improve
View Your Progress

Use analytics, learning streaks, and personalized recommendations to identify what to practice next.

🏗️ System Architecture:
                         ┌─────────────────┐
                         │     Student     │
                         └────────┬────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │   Vercel React App      │
                    │                         │
                    │ React + Tailwind CSS    │
                    └────────────┬────────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                ▼                ▼                ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │ Supabase     │ │ Supabase     │ │ FastAPI      │
        │ Auth         │ │ PostgreSQL   │ │ Backend      │
        │              │ │ + Storage    │ │              │
        └──────────────┘ └──────────────┘ └──────┬───────┘
                                                 │
                         ┌───────────────────────┼────────────────────┐
                         │                       │                    │
                         ▼                       ▼                    ▼
                  Document/OCR            AI Validation         Quiz + AI
                  Processing              & Classification       Generation
                         │                       │                    │
                         └───────────────────────┼────────────────────┘
                                                 │
                                                 ▼
                                        ┌─────────────────┐
                                        │      Groq       │
                                        │  AI Inference   │
                                        └─────────────────┘
🧩 Technology Stack:

Frontend
React
JavaScript
Tailwind CSS
Axios
Supabase JavaScript SDK
React Markdown
Remark GFM
Lucide React
Backend
Python
FastAPI
Uvicorn
Pydantic
Supabase Python SDK
Groq SDK
python-docx
pypdf
PyMuPDF
PaddleOCR
PaddlePaddle
Cloud & Infrastructure
Vercel — Frontend deployment
Render — Backend deployment
Supabase — Authentication, PostgreSQL and Storage
Groq — AI inference
🗄️ Database Design

PinkNotes uses PostgreSQL through Supabase.

Core tables
notes
upload_usage
quizzes
quiz_questions
quiz_attempts
note_bookmarks
Notes

Stores uploaded resources and processing information.

id
user_id
title
subject
file_name
file_path
file_type
character_count
extracted_text
status
validation_reason
created_at
Quizzes

Stores quiz metadata.

id
user_id
title
subject
source_type
source_note_id
difficulty
question_count
score
completed
topic
completed_at
created_at
Quiz Questions

Stores generated questions.

id
quiz_id
question_order
question
option_a
option_b
option_c
option_d
correct_answer
explanation
created_at
Quiz Attempts

Stores completed attempts.

id
quiz_id
user_id
score
total_questions
answers
started_at
completed_at
Note Bookmarks

Stores user-specific saved resources.

id
user_id
note_id
created_at

🔒 Security:

Security is implemented across the application rather than relying only on frontend restrictions.

Row Level Security

Supabase Row Level Security protects user-owned records.

User-specific operations are restricted using:

auth.uid() = user_id

RLS is used for resources including:

Notes
Bookmarks
Quizzes
Quiz questions
Quiz attempts
Upload usage

🔐 Private File Storage:

Uploaded files are stored in a private Supabase Storage bucket.

Files are not exposed through permanent public URLs.

Authorized downloads use short-lived signed URLs.

Authenticated User
       ↓
Request Resource
       ↓
Authorization Check
       ↓
Signed URL
       ↓
Secure Download

🛡️ Backend Authentication:

Protected FastAPI endpoints require an authenticated Supabase access token.

The backend validates the supplied token before allowing access to protected resources.

📤 Upload Protection:

Uploads are protected using multiple layers.

Authentication
      ↓
File Extension Check
      ↓
File Size Check
      ↓
Upload Quota
      ↓
Text Extraction / OCR
      ↓
AI Validation
      ↓
Storage + Database

Current limits:

Maximum file size: 10 MB
Maximum uploads per day: 10

🧠 AI Safety:

Uploaded documents are treated as untrusted data.

AI workflows are designed so that instructions contained inside uploaded documents are not automatically treated as system-level instructions.

The validation system also fails closed:

AI Validation Failure
        ↓
      Flag
        ↓
Do not automatically approve

🔑 Environment Variables:

Frontend

REACT_APP_API_URL=
REACT_APP_SUPABASE_URL=
REACT_APP_SUPABASE_ANON_KEY=

Backend

GROQ_MODEL=
SUPABASE_URL=
FRONTEND_URL=

The Supabase anonymous/public key is intended for browser-side use and is protected through Supabase Auth and Row Level Security.

🔌 API Overview:

Health Check
GET /health

Response:

{
  "status": "healthy"
}
AI Doubt Solver
POST /api/ai/ask

Example:

{
  "question": "Explain binary search trees in simple terms."
}
Notes
GET /api/notes

Returns notes accessible to the authenticated user.

Extract Note
POST /api/notes/extract

Extracts text from an uploaded document.

Upload Note
POST /api/notes/upload

Processes and uploads an authenticated user's note.

Generate Quiz
POST /api/quiz/generate

Example:

{
  "source_type": "browse_note",
  "source_note_id": "NOTE_ID",
  "subject": "Data Structures",
  "topic": "Trees",
  "difficulty": "mixed",
  "question_count": 10
}
Quiz Statistics
GET /api/quiz/stats

Returns learning analytics including:

Quiz statistics
Score history
Subject performance
Topic performance
Learning streak
Personalized recommendations

📁 Project Structure:

PinkNotes/
│
├── public/
│   └── index.html
│
├── src/
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── LoadingState.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   └── ErrorState.jsx
│   │   │
│   │   ├── AIDoubtSolver.jsx
│   │   ├── BrowseNotes.jsx
│   │   ├── Bookmarks.jsx
│   │   ├── LearningToday.jsx
│   │   ├── NoteDetail.jsx
│   │   ├── Quiz.jsx
│   │   ├── QuizHistory.jsx
│   │   ├── RecentActivity.jsx
│   │   ├── StatsCard.jsx
│   │   ├── UploadNotes.jsx
│   │   └── UserStats.jsx
│   │
│   ├── services/
│   │   └── api.js
│   │
│   ├── App.js
│   ├── index.css
│   └── supabase.js
│
├── backend/
│   │
│   ├── models/
│   │   └── schemas.py
│   │
│   ├── routes/
│   │   ├── ai.py
│   │   ├── notes.py
│   │   ├── quiz.py
│   │   └── validation.py
│   │
│   ├── services/
│   │   ├── ai_service.py
│   │   ├── groq_service.py
│   │   ├── pdf_service.py
│   │   └── quiz_service.py
│   │
│   ├── auth.py
│   ├── config.py
│   ├── main.py
│   ├── requirements.txt
│   └── .python-version
│
├── .gitignore
├── package.json
└── README.md

💻 Local Development:

Prerequisites-

Node.js
npm
Python 3.10
Git
Supabase account
Groq API key

1. Clone the repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd PinkNotes
2. Install frontend dependencies
npm install
3. Configure frontend

Create a .env file in the project root:

REACT_APP_API_URL=http://127.0.0.1:8000
REACT_APP_SUPABASE_URL=YOUR_SUPABASE_URL
REACT_APP_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

4. Setup backend
cd backend

Create a Python 3.10 virtual environment:

python3.10 -m venv venv

macOS / Linux
source venv/bin/activate

Windows
venv\Scripts\activate

Install dependencies:

pip install -r requirements.txt

5. Configure backend

Create:

backend/.env

Add:

GROQ_API_KEY=YOUR_GROQ_API_KEY
GROQ_MODEL=openai/gpt-oss-20b

SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

FRONTEND_URL=http://localhost:3000

6. Start backend
uvicorn main:app --reload

Backend:

http://127.0.0.1:8000

Swagger:

http://127.0.0.1:8000/docs

7. Start frontend

From the project root:

npm start

Frontend:

http://localhost:3000

☁️ Production Deployment:

PinkNotes uses a separated frontend/backend cloud architecture.

                    INTERNET
                       │
                       ▼
             ┌───────────────────┐
             │      Vercel       │
             │ React Frontend    │
             └─────────┬─────────┘
                       │
                       ▼
             ┌───────────────────┐
             │      Render       │
             │  FastAPI Backend  │
             └───────┬─────┬─────┘
                     │     │
          ┌──────────┘     └──────────┐
          ▼                           ▼
 ┌─────────────────┐          ┌─────────────────┐
 │    Supabase     │          │      Groq       │
 │                 │          │                 │
 │ Auth            │          │ AI Inference    │
 │ PostgreSQL      │          │                 │
 │ Storage         │          │                 │
 └─────────────────┘          └─────────────────┘
 
Production URLs:

Frontend-

https://pink-notes-nine.vercel.app

Backend-

https://pinknotes-b1z9.onrender.com

API Documentation-

https://pinknotes-b1z9.onrender.com/docs

🎨 UI / UX

PinkNotes uses a responsive student-focused interface with:

Responsive layouts
Dark mode
Consistent design system
Reusable loading states
Reusable empty states
Reusable error states
Skeleton loading
Drag-and-drop upload
Responsive mobile layouts
Accessible focus states
Contextual actions
Secure error handling
Purposeful micro-interactions

💡 Engineering Highlights:

PinkNotes was developed as a full-stack AI application rather than a frontend-only project.

Frontend engineering
React component architecture
Tailwind CSS design system
Axios API abstraction
Supabase Auth integration
Responsive UI
Dark mode
Reusable UI states
Quiz state management
Personalized navigation
Backend engineering
REST API development with FastAPI
Authentication middleware
Access-token validation
Pydantic request validation
File upload handling
Document extraction
OCR processing
AI integration
Structured AI responses
Upload quotas
Error handling
Database engineering
PostgreSQL schema design
Foreign-key relationships
Row Level Security
User-specific data isolation
Quiz/attempt relationships
Bookmark relationships
Database RPC for upload quotas
AI engineering
Groq integration
AI note validation
Structured JSON responses
Quiz generation
Difficulty-aware generation
Topic-aware generation
Subject-aware generation
Personalized recommendations
Prompt-injection-aware document handling
Deployment
Vercel frontend deployment
Render backend deployment
Environment-based configuration
Production CORS
Supabase production configuration
Secure backend secrets

📸 Screenshots:

screenshots/
│
├── landing.png
├── dashboard.png
├── ai-solver.png
├── upload-notes.png
├── browse-notes.png
├── note-detail.png
├── quiz.png
├── quiz-history.png
├── analytics.png
└── bookmarks.png


🔮 Future Improvements:

Potential future additions include:

Flashcard generation
Spaced repetition
AI-generated study plans
Topic mastery scores
More advanced recommendation algorithms
Collaborative study spaces
Real-time discussions
Voice-based AI assistance
More document formats
Advanced OCR for complex layouts
Mobile application
Teacher/instructor dashboards
Study reminders and notifications

📌 Project Status:

Feature	                           Status

React Frontend      	          ✅ Complete
FastAPI Backend	                ✅ Complete
Supabase Authentication	        ✅ Complete
PostgreSQL Database	            ✅ Complete
Private Storage	                ✅ Complete
Row Level Security	            ✅ Complete
Note Upload	                    ✅ Complete
PDF/DOCX/TXT Support	          ✅ Complete
OCR	                            ✅ Complete
AI Note Validation	            ✅ Complete
AI Doubt Solver	                ✅ Complete
Browse Notes	                  ✅ Complete
Note Detail	                    ✅ Complete
Bookmarks                     	✅ Complete
AI Quiz Generation	            ✅ Complete
Topic-Based Quizzes	            ✅ Complete
Subject-Based Quizzes	          ✅ Complete
Difficulty Selection	          ✅ Complete
Randomized Answer Options	      ✅ Complete
Quiz History	                  ✅ Complete
Quiz Attempts	                  ✅ Complete
Learning Analytics	            ✅ Complete
Learning Streaks	              ✅ Complete
Personalized Recommendations	  ✅ Complete
Learning Today	                ✅ Complete
Production Deployment	          ✅ Complete

👩‍💻 Author:

Harshita Talwar

B.Tech — Computer Science Engineering (Artificial Intelligence)

PinkNotes was developed as a full-stack AI learning platform combining modern web development, cloud infrastructure, document processing, OCR, AI integration, database security, analytics, and personalized learning.

⭐ PinkNotes
Collect. Understand. Practice. Improve.

Built with React · FastAPI · Supabase · Groq · PostgreSQL · PaddleOCR · Tailwind CSS
