const API_BASE_URL = '/api';

export async function initTeacherDashboard() {
    console.log('Initializing Teacher Dashboard...');
    updateDate();
    await loadDashboardStats();
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
                        item.innerHTML = `
                            <div class="activity-icon">📝</div>
                            <div class="activity-details">
                                <span class="activity-student">${activity.student_name || 'Student'}</span>
                                <span class="activity-action">completed ${activity.subject} assessment</span>
                                <span class="activity-time">${new Date(activity.completed_at).toLocaleTimeString()}</span>
                            </div>
                            <div class="activity-score ${getScoreClass(activity.score)}">
                                ${Math.round(activity.score)}%
                            </div>
                        `;
                        activityList.appendChild(item);
                    });
                }
            }

            // Update Student Table (Mock data for now)
            const tbody = document.getElementById('student-table-body');
            if (tbody) {
                tbody.innerHTML = '';
                // Demo row
                const demoRow = document.createElement('tr');
                demoRow.innerHTML = `
                    <td><div class="student-info"><span class="student-avatar">👤</span> Demo Student</div></td>
                    <td>5</td>
                    <td>Intermediate</td>
                    <td>English</td>
                 `;
                tbody.appendChild(demoRow);
            }
        }
    } catch (error) {
        console.error('Error loading teacher stats:', error);
    }
}

function getScoreClass(score) {
    if (score >= 80) return 'score-high';
    if (score >= 50) return 'score-medium';
    return 'score-low';
}
