/**
 * SQLite Database Models (Open Source Alternative to Firebase)
 * No configuration needed - works out of the box!
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create database directory if it doesn't exist
const dbDir = join(__dirname, '..', 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize SQLite database
const dbPath = join(dbDir, 'tutoring.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log('✅ SQLite database initialized at:', dbPath);

/**
 * Initialize database tables
 */
export function initializeDatabase() {
  // Students table
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      grade INTEGER,
      section TEXT,
      school_id TEXT,
      teacher_id TEXT,
      language TEXT DEFAULT 'en',
      learning_level TEXT DEFAULT 'intermediate',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      active INTEGER DEFAULT 1
    )
  `);

  // Progress table
  db.exec(`
    CREATE TABLE IF NOT EXISTS progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      topic TEXT NOT NULL,
      mastery_level INTEGER DEFAULT 0,
      last_practiced DATETIME DEFAULT CURRENT_TIMESTAMP,
      total_attempts INTEGER DEFAULT 0,
      successful_attempts INTEGER DEFAULT 0,
      time_spent INTEGER DEFAULT 0,
      FOREIGN KEY (student_id) REFERENCES students(id)
    )
  `);

  // Assessments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS assessments (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      topics TEXT,
      total_questions INTEGER,
      correct_answers INTEGER,
      score REAL,
      grade TEXT,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      results TEXT,
      FOREIGN KEY (student_id) REFERENCES students(id)
    )
  `);

  // Teachers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS teachers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      school_id TEXT,
      subjects TEXT,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      active INTEGER DEFAULT 1
    )
  `);

  // Session logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS session_logs (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      end_time DATETIME,
      duration INTEGER,
      activities TEXT,
      topics_covered TEXT,
      FOREIGN KEY (student_id) REFERENCES students(id)
    )
  `);

  // Achievements table
  db.exec(`
    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      category TEXT,
      points INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1
    )
  `);

  // Student achievements table
  db.exec(`
    CREATE TABLE IF NOT EXISTS student_achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      achievement_id TEXT NOT NULL,
      earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id),
      FOREIGN KEY (achievement_id) REFERENCES achievements(id)
    )
  `);

  console.log('✅ Database tables initialized');
  return db;
}

/**
 * Student Model
 */
export class StudentModel {
  async create(studentData) {
    const id = studentData.id || `student_${Date.now()}`;
    const stmt = db.prepare(`
      INSERT INTO students (id, name, grade, section, school_id, teacher_id, language, learning_level)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      studentData.name,
      studentData.grade || null,
      studentData.section || null,
      studentData.schoolId || null,
      studentData.teacherId || null,
      studentData.language || 'en',
      studentData.learningLevel || 'intermediate'
    );

    return { id, ...studentData };
  }

  async getById(studentId) {
    const stmt = db.prepare('SELECT * FROM students WHERE id = ?');
    return stmt.get(studentId);
  }

  async update(studentId, updates) {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);

    const stmt = db.prepare(`
      UPDATE students SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `);

    stmt.run(...values, studentId);
    return this.getById(studentId);
  }

  async addProgress(studentId, progressData) {
    const stmt = db.prepare(`
      INSERT INTO progress (student_id, subject, topic, mastery_level, total_attempts, successful_attempts, time_spent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      studentId,
      progressData.subject,
      progressData.topic,
      progressData.masteryLevel || 0,
      progressData.totalAttempts || 0,
      progressData.successfulAttempts || 0,
      progressData.timeSpent || 0
    );
  }

  async getProgress(studentId, subject = null) {
    let query = 'SELECT * FROM progress WHERE student_id = ?';
    const params = [studentId];

    if (subject) {
      query += ' AND subject = ?';
      params.push(subject);
    }

    query += ' ORDER BY last_practiced DESC LIMIT 50';

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }

  async addAssessment(studentId, assessmentData) {
    const id = assessmentData.assessmentId || `assess_${Date.now()}`;
    const stmt = db.prepare(`
      INSERT INTO assessments (id, student_id, subject, topics, total_questions, correct_answers, score, grade, results)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      studentId,
      assessmentData.subject,
      JSON.stringify(assessmentData.topics || []),
      assessmentData.totalQuestions,
      assessmentData.correctAnswers,
      assessmentData.score,
      assessmentData.grade,
      JSON.stringify(assessmentData.results || [])
    );

    return { id, ...assessmentData };
  }

  async getAssessments(studentId, limit = 20) {
    const stmt = db.prepare(`
      SELECT * FROM assessments WHERE student_id = ? ORDER BY completed_at DESC LIMIT ?
    `);

    const assessments = stmt.all(studentId, limit);

    // Parse JSON fields
    return assessments.map(a => ({
      ...a,
      topics: JSON.parse(a.topics || '[]'),
      results: JSON.parse(a.results || '[]')
    }));
  }
}

/**
 * Teacher Model
 */
export class TeacherModel {
  async create(teacherData) {
    const id = teacherData.id || `teacher_${Date.now()}`;
    const stmt = db.prepare(`
      INSERT INTO teachers (id, name, school_id, subjects, email)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      teacherData.name,
      teacherData.schoolId || null,
      JSON.stringify(teacherData.subjects || []),
      teacherData.email || null
    );

    return { id, ...teacherData };
  }

  async getById(teacherId) {
    const stmt = db.prepare('SELECT * FROM teachers WHERE id = ?');
    const teacher = stmt.get(teacherId);

    if (teacher) {
      teacher.subjects = JSON.parse(teacher.subjects || '[]');
    }

    return teacher;
  }

  async getClassStats(teacherId) {
    // For demo purposes, we'll fetch stats for all students
    // In a real app, we would filter by teacher_id

    const totalStudents = db.prepare('SELECT COUNT(*) as count FROM students').get().count;

    const avgScore = db.prepare('SELECT AVG(score) as avg FROM assessments').get().avg || 0;

    const recentAssessments = db.prepare(`
            SELECT a.*, s.name as student_name 
            FROM assessments a 
            JOIN students s ON a.student_id = s.id 
            ORDER BY a.completed_at DESC 
            LIMIT 10
        `).all();

    // Parse JSON in recentAssessments
    const parsedAssessments = recentAssessments.map(a => ({
      ...a,
      topics: JSON.parse(a.topics || '[]'),
      results: JSON.parse(a.results || '[]')
    }));

    return {
      totalStudents,
      averageScore: Math.round(avgScore * 10) / 10,
      recentActivity: parsedAssessments
    };
  }
}

/**
 * Achievement Model
 */
export class AchievementModel {
  async getAll() {
    const stmt = db.prepare('SELECT * FROM achievements WHERE active = 1');
    return stmt.all();
  }

  async awardToStudent(studentId, achievementId) {
    const stmt = db.prepare(`
      INSERT INTO student_achievements (student_id, achievement_id)
      VALUES (?, ?)
    `);

    stmt.run(studentId, achievementId);
  }

  async getStudentAchievements(studentId) {
    const stmt = db.prepare(`
      SELECT sa.*, a.name, a.description, a.icon, a.points
      FROM student_achievements sa
      JOIN achievements a ON sa.achievement_id = a.id
      WHERE sa.student_id = ?
      ORDER BY sa.earned_at DESC
    `);

    return stmt.all(studentId);
  }
}

/**
 * Session Log Model
 */
export class SessionLogModel {
  async create(sessionData) {
    const id = sessionData.id || `session_${Date.now()}`;
    const stmt = db.prepare(`
      INSERT INTO session_logs (id, student_id, activities, topics_covered)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(
      id,
      sessionData.studentId,
      JSON.stringify(sessionData.activities || []),
      JSON.stringify(sessionData.topicsCovered || [])
    );

    return { id, ...sessionData };
  }

  async endSession(sessionId, endData) {
    const stmt = db.prepare(`
      UPDATE session_logs SET end_time = CURRENT_TIMESTAMP, duration = ? WHERE id = ?
    `);

    stmt.run(endData.duration || 0, sessionId);
  }

  async getStudentSessions(studentId, limit = 30) {
    const stmt = db.prepare(`
      SELECT * FROM session_logs WHERE student_id = ? ORDER BY start_time DESC LIMIT ?
    `);

    const sessions = stmt.all(studentId, limit);

    return sessions.map(s => ({
      ...s,
      activities: JSON.parse(s.activities || '[]'),
      topicsCovered: JSON.parse(s.topics_covered || '[]')
    }));
  }
}

// Placeholder models for compatibility
export class SchoolModel {
  async getById() { return null; }
  async getAll() { return []; }
}

export class AnalyticsModel {
  async create() { return {}; }
  async getBySchool() { return []; }
}

export class ContentModel {
  async getById() { return null; }
  async getBySubjectAndGrade() { return []; }
}

/**
 * Get all models
 */
export function getModels() {
  return {
    Student: new StudentModel(),
    Teacher: new TeacherModel(),
    School: new SchoolModel(),
    Analytics: new AnalyticsModel(),
    Achievement: new AchievementModel(),
    Content: new ContentModel(),
    SessionLog: new SessionLogModel(),
  };
}

// Initialize database on import
initializeDatabase();

export default { initializeDatabase, getModels, db };
