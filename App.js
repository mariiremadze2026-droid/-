/* ===========================
   LMS CORE — app.js
   State, Auth, Toast, Utils
   =========================== */

// ===== FAKE DATABASE (localStorage) =====
const DB = {
  get(key, fallback = []) {
    try { return JSON.parse(localStorage.getItem('lms_' + key)) ?? fallback; }
    catch { return fallback; }
  },
  set(key, val) { localStorage.setItem('lms_' + key, JSON.stringify(val)); },
  remove(key)   { localStorage.removeItem('lms_' + key); }
};

// Seed initial data
(function seedDB() {
  if (DB.get('seeded', false)) return;

  DB.set('users', [
    { id: 1, username: 'admin',   email: 'admin@lms.ge',   password: 'admin123',   role: 'admin' },
    { id: 2, username: 'student', email: 'student@lms.ge', password: 'student123', role: 'student' },
    { id: 3, username: 'teacher', email: 'teacher@lms.ge', password: 'teacher123', role: 'admin' }
  ]);

  DB.set('courses', [
    { id: 1, title: 'JavaScript — საფუძვლებიდან პრო-მდე', description: 'სრული JavaScript კურსი — ცვლადებიდან async/await-მდე. ყველა ბრაუზერი, ყველა გარემო.', instructor_id: 3, category: 'frontend', level: 'დამწყები', duration: '42 საათი', lessons: 28, thumbnail: '🟡', enrolled: 234 },
    { id: 2, title: 'React + Hooks სრული სახელმძღვანელო',  description: 'React 18, Hooks, Context API, React Router და state მენეჯმენტი პრაქტიკული პროექტებით.',     instructor_id: 3, category: 'frontend', level: 'საშუალო', duration: '38 საათი', lessons: 24, thumbnail: '🔵', enrolled: 189 },
    { id: 3, title: 'Node.js + Express REST API',           description: 'ბექენდ სერვისების აგება Node.js-ით. JWT, middleware, PostgreSQL ინტეგრაცია.',                    instructor_id: 3, category: 'backend',  level: 'საშუალო', duration: '30 საათი', lessons: 20, thumbnail: '🟢', enrolled: 156 },
    { id: 4, title: 'Python მონაცემთა ანალიზი',            description: 'Pandas, NumPy, Matplotlib — მონაცემების დამუშავება და ვიზუალიზაცია.',                            instructor_id: 1, category: 'data',    level: 'დამწყები', duration: '26 საათი', lessons: 18, thumbnail: '🐍', enrolled: 201 },
    { id: 5, title: 'SQL + PostgreSQL',                     description: 'Queries, joins, indexes, transactions — ყველაფერი, რაც საჭიროა პროფესიონალი DBA-სთვის.',        instructor_id: 1, category: 'backend',  level: 'დამწყები', duration: '20 საათი', lessons: 15, thumbnail: '🗄️', enrolled: 143 },
    { id: 6, title: 'UX/UI Design Figma-ში',               description: 'პროდუქტის დიზაინი ნულიდან. Wireframe, Prototype, Design System — ყველა ეტაპი.',                 instructor_id: 1, category: 'design',  level: 'დამწყები', duration: '24 საათი', lessons: 16, thumbnail: '🎨', enrolled: 178 },
  ]);

  DB.set('lessons', [
    { id: 1,  course_id: 1, title: 'ცვლადები და ტიპები',        content_url: '#', duration: '45 წთ', order: 1 },
    { id: 2,  course_id: 1, title: 'ფუნქციები და სკოუფი',       content_url: '#', duration: '52 წთ', order: 2 },
    { id: 3,  course_id: 1, title: 'Arrays და Objects',          content_url: '#', duration: '60 წთ', order: 3 },
    { id: 4,  course_id: 1, title: 'DOM მანიპულაცია',           content_url: '#', duration: '55 წთ', order: 4 },
    { id: 5,  course_id: 1, title: 'Promises და async/await',   content_url: '#', duration: '68 წთ', order: 5 },
    { id: 6,  course_id: 2, title: 'React-ის შესავალი',         content_url: '#', duration: '40 წთ', order: 1 },
    { id: 7,  course_id: 2, title: 'useState და useEffect',     content_url: '#', duration: '55 წთ', order: 2 },
    { id: 8,  course_id: 2, title: 'Props და Component Tree',   content_url: '#', duration: '48 წთ', order: 3 },
    { id: 9,  course_id: 3, title: 'Node.js შესავალი',          content_url: '#', duration: '38 წთ', order: 1 },
    { id: 10, course_id: 3, title: 'Express Routing',           content_url: '#', duration: '50 წთ', order: 2 },
  ]);

  DB.set('enrollments', [
    { id: 1, user_id: 2, course_id: 1, progress: 60, enrolled_at: '2024-01-10' },
    { id: 2, user_id: 2, course_id: 2, progress: 30, enrolled_at: '2024-01-20' },
    { id: 3, user_id: 2, course_id: 4, progress: 85, enrolled_at: '2024-01-05' },
  ]);

  DB.set('submissions', [
    { id: 1, assignment_id: 1, student_id: 2, grade: 92, submitted_at: '2024-01-15', content: 'ჩემი პასუხი...' },
    { id: 2, assignment_id: 2, student_id: 2, grade: 78, submitted_at: '2024-01-22', content: 'ჩემი პასუხი...' },
  ]);

  DB.set('seeded', true);
})();

// ===== AUTH =====
const Auth = {
  getUser()  { return DB.get('current_user', null); },
  isLoggedIn(){ return !!this.getUser(); },
  isAdmin()  { const u = this.getUser(); return u?.role === 'admin'; },

  login(email, password) {
    const users = DB.get('users');
    const user  = users.find(u => u.email === email && u.password === password);
    if (!user) return { ok: false, error: 'ელ-ფოსტა ან პაროლი არასწორია' };
    const { password: _, ...safeUser } = user;
    DB.set('current_user', safeUser);
    return { ok: true, user: safeUser };
  },

  register(username, email, password) {
    const users = DB.get('users');
    if (users.find(u => u.email === email)) return { ok: false, error: 'ეს ელ-ფოსტა უკვე რეგისტრირებულია' };
    const newUser = { id: Date.now(), username, email, password, role: 'student' };
    users.push(newUser);
    DB.set('users', users);
    const { password: _, ...safe } = newUser;
    DB.set('current_user', safe);
    return { ok: true, user: safe };
  },

  logout() {
    DB.remove('current_user');
    window.location.href = 'index.html';
  }
};

// ===== TOAST =====
function toast(msg, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ===== MODAL =====
function openModal(id)  { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

// Close on overlay click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

// ===== NAVBAR RENDER =====
function renderNavbar({ activePage = '' } = {}) {
  const user = Auth.getUser();
  const nav  = document.getElementById('navbar');
  if (!nav) return;

  const pages = [
    { href: 'index.html',     label: 'კატალოგი',  key: 'home' },
    { href: 'dashboard.html', label: 'Dashboard', key: 'dashboard' },
    ...(user?.role === 'admin' ? [{ href: 'admin.html', label: 'Admin', key: 'admin' }] : []),
  ];

  nav.innerHTML = `
    <a href="index.html" class="nav-logo">
      <span>◈</span> LMS<span>.ge</span>
    </a>
    <ul class="nav-links">
      ${pages.map(p => `
        <li><a href="${p.href}" class="${activePage === p.key ? 'active' : ''}">${p.label}</a></li>
      `).join('')}
    </ul>
    <div class="nav-actions">
      ${user ? `
        <span style="font-size:13px;color:var(--muted);margin-right:4px">
          ${user.username}
          <span class="badge badge-${user.role === 'admin' ? 'amber' : 'green'}" style="margin-left:6px">${user.role}</span>
        </span>
        <button class="btn btn-ghost btn-sm" onclick="Auth.logout()">გასვლა</button>
      ` : `
        <a href="auth.html" class="btn btn-ghost btn-sm">შესვლა</a>
        <a href="auth.html?tab=register" class="btn btn-primary btn-sm">რეგისტრაცია</a>
      `}
    </div>
  `;
}

// ===== COURSE HELPERS =====
const Courses = {
  all()          { return DB.get('courses'); },
  byId(id)       { return this.all().find(c => c.id == id); },
  lessons(courseId) { return DB.get('lessons').filter(l => l.course_id == courseId).sort((a,b) => a.order - b.order); },

  enroll(userId, courseId) {
    const enrollments = DB.get('enrollments');
    if (enrollments.find(e => e.user_id == userId && e.course_id == courseId)) return false;
    enrollments.push({ id: Date.now(), user_id: userId, course_id: courseId, progress: 0, enrolled_at: new Date().toISOString().slice(0,10) });
    DB.set('enrollments', enrollments);
    return true;
  },

  isEnrolled(userId, courseId) {
    return DB.get('enrollments').some(e => e.user_id == userId && e.course_id == courseId);
  },

  enrollment(userId, courseId) {
    return DB.get('enrollments').find(e => e.user_id == userId && e.course_id == courseId);
  },

  updateProgress(userId, courseId, progress) {
    const enrollments = DB.get('enrollments');
    const e = enrollments.find(e => e.user_id == userId && e.course_id == courseId);
    if (e) { e.progress = progress; DB.set('enrollments', enrollments); }
  },

  userEnrollments(userId) {
    const enrollments = DB.get('enrollments').filter(e => e.user_id == userId);
    return enrollments.map(e => ({ ...e, course: this.byId(e.course_id) }));
  },

  addCourse(data) {
    const courses = this.all();
    const newCourse = { id: Date.now(), ...data, enrolled: 0 };
    courses.push(newCourse);
    DB.set('courses', courses);
    return newCourse;
  },

  deleteCourse(id) {
    DB.set('courses', this.all().filter(c => c.id != id));
  }
};

// ===== SUBMISSIONS =====
const Submissions = {
  all()         { return DB.get('submissions'); },
  byStudent(id) { return this.all().filter(s => s.student_id == id); },
  add(data)     {
    const subs = this.all();
    subs.push({ id: Date.now(), ...data, submitted_at: new Date().toISOString().slice(0,10) });
    DB.set('submissions', subs);
  }
};

// ===== URL PARAMS =====
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}
