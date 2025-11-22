const API_BASE_URL = '/api';

export async function initTeacherDashboard() {
    console.log('Initializing Teacher Dashboard...');
    updateDate();
    await loadDashboardStats();
    await loadStudentList();
}

function updateDate() {
    const dateEl = document.getElementById('current-date');
    if (dateEl) {
        const now = new Date();
        dateEl.textContent = now.toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/teacher/dashboard`);
        const data = await response.json();

        if (data) {
            // Update stats
            const totalStudentsEl = document.getElementById('total-students');
            if (totalStudentsEl) totalStudentsEl.textContent = data.totalStudents || 0;

            const avgScoreEl = document.getElementById('class-avg-score');
            if (avgScoreEl) avgScoreEl.textContent = (data.averageScore || 0) + '%';

            const assessmentsCountEl = document.getElementById('assessments-count');
            if (assessmentsCountEl) assessmentsCountEl.textContent = data.recentActivity ? data.recentActivity.length : 0;

            // Update Activity List
            const activityList = document.getElementById('activity-list');
            if (activityList && data.recentActivity) {
                activityList.innerHTML = '';
                if (data.recentActivity.length === 0) {
                    activityList.innerHTML = '<div class="empty-state">No recent activity</div>';
                } else {
                    data.recentActivity.forEach(activity => {
                        const item = document.createElement('div');
                        item.className = 'activity-item';
                        const timeAgo = getTimeAgo(new Date(activity.completed_at));
                        item.innerHTML = `
                            <div class="activity-icon">📝</div>
                            <div class="activity-details">
                                <span class="activity-student">${activity.student_name || 'Student'}</span>
                                <span class="activity-action">completed ${activity.subject} assessment</span>
                                <span class="activity-time">${timeAgo}</span>
                            </div>
                            <div class="activity-score ${getScoreClass(activity.score)}">
                                ${Math.round(activity.score)}%
                            </div>
                        `;
                        activityList.appendChild(item);
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error loading teacher stats:', error);
    }
}

async function loadStudentList() {
    try {
        // For now, create sample students based on the seeded data
        // In a real app, you'd fetch from /api/students endpoint
        const tbody = document.getElementById('student-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        const sampleStudents = [
            { name: 'Rajesh Kumar', grade: 5, level: 'Beginner', language: 'Hindi' },
            { name: 'Priya Sharma', grade: 6, level: 'Intermediate', language: 'English' },
            { name: 'Arun Patel', grade: 5, level: 'Advanced', language: 'Hindi' },
            { name: 'Meera Reddy', grade: 7, level: 'Intermediate', language: 'Telugu' },
            { name: 'Vikram Singh', grade: 6, level: 'Beginner', language: 'English' },
            { name: 'Lakshmi Iyer', grade: 8, level: 'Advanced', language: 'Tamil' },
            { name: 'Amit Verma', grade: 5, level: 'Intermediate', language: 'Hindi' },
            { name: 'Sneha Desai', grade: 7, level: 'Advanced', language: 'Marathi' }
        ];

        sampleStudents.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="student-info">
                        <span class="student-avatar">👤</span>
                        ${student.name}
                    </div>
                </td>
                <td>${student.grade}</td>
                <td>${student.level}</td>
                <td>${student.language}</td>
            `;
            tbody.appendChild(row);
        });

    } catch (error) {
        console.error('Error loading student list:', error);
    }
}

function getScoreClass(score) {
    if (score >= 80) return 'score-high';
    if (score >= 50) return 'score-medium';
    return 'score-low';
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
}
