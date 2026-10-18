import { loadData, saveData, resetData, exportJSON, importJSON, subscribe } from './storage.js';
import { facultiesList, clubCategories } from './data.js';
import { formatVND, formatDate, generateId, showToast, sanitizeHTML } from './utils.js';

import { renderDashboard, setupDashboardEvents } from './views/dashboardView.js';
import { renderClubs, setupClubsEvents } from './views/clubsView.js';
import { renderMembers, setupMembersEvents } from './views/membersView.js';
import { renderRecruitment, setupRecruitmentEvents } from './views/recruitmentView.js';
import { renderEvents, setupEventsHandlers } from './views/eventsView.js';
import { renderFinance, setupFinanceHandlers } from './views/financeView.js';
import { renderCertificate, setupCertificateHandlers } from './views/certificateView.js';

// Application State
const appState = {
  currentRoute: 'dashboard',
  theme: (typeof localStorage !== 'undefined' ? localStorage.getItem('humg_theme') : null) || 'dark',
  searchQuery: '',

  // Clubs view state
  activeFilter: 'all',
  statusFilter: 'all',

  // Members view state
  memberSearch: '',
  memberClub: 'all',
  memberFaculty: 'all',
  memberStatus: 'all',

  // Recruitment view state
  recruitmentTab: 'list',
  recruitmentStatus: 'all',

  // Events view state
  eventFilter: 'all',

  // Finance view state
  financeClub: 'all',
  financeType: 'all',

  // Certificate view state
  selectedCertMemberId: null,

  // Global database
  data: loadData()
};

// Initialize Theme
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('humg_theme', theme);
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
    themeBtn.title = theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối';
  }
}

// Router Navigation
export function navigateTo(route, params = {}) {
  appState.currentRoute = route;
  if (params.memberId) {
    appState.selectedCertMemberId = params.memberId;
  }

  // Update navigation link active state
  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.getAttribute('data-route') === route) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Update Header title & breadcrumb
  const pageTitles = {
    dashboard: { title: 'Tổng Quan & Thống Kê', breadcrumb: 'Trang chủ / Tổng quan CLB' },
    clubs: { title: 'Quản Lý Đội, Nhóm & CLB', breadcrumb: 'Trang chủ / Danh mục CLB' },
    members: { title: 'Quản Lý Hội Viên & Đoàn Viên', breadcrumb: 'Trang chủ / Nhân sự' },
    recruitment: { title: 'Cổng Tuyển Thành Viên K69', breadcrumb: 'Trang chủ / Tuyển quân' },
    events: { title: 'Sự Kiện & Lịch Hoạt Động', breadcrumb: 'Trang chủ / Sự kiện' },
    finance: { title: 'Quản Lý Tài Chính & Sổ Quỹ', breadcrumb: 'Trang chủ / Tài chính phong trào' },
    certificate: { title: 'Cấp Giấy Khen & Chứng Nhận', breadcrumb: 'Trang chủ / Chứng nhận ĐRL' },
    settings: { title: 'Cài Đặt & Dữ Liệu Hệ Thống', breadcrumb: 'Trang chủ / Cấu hình' }
  };

  const info = pageTitles[route] || { title: 'Quản Lý CLB HUMG', breadcrumb: 'Trang chủ' };
  const titleEl = document.getElementById('header-page-title');
  const breadcrumbEl = document.getElementById('header-page-breadcrumb');
  if (titleEl) titleEl.textContent = info.title;
  if (breadcrumbEl) breadcrumbEl.textContent = info.breadcrumb;

  // Close mobile sidebar
  const sidebar = document.getElementById('app-sidebar');
  if (sidebar) sidebar.classList.remove('mobile-open');

  // Render content
  renderApp();
}

// Main Render Function
function renderApp() {
  const container = document.getElementById('app-content');
  if (!container) return;

  const { currentRoute, data } = appState;

  if (currentRoute === 'dashboard') {
    container.innerHTML = renderDashboard(data, navigateTo);
    setupDashboardEvents(container, navigateTo, openModal);
  } else if (currentRoute === 'clubs') {
    container.innerHTML = renderClubs(data, appState.activeFilter, appState.searchQuery, appState.statusFilter);
    setupClubsEvents(container, appState, renderApp, openModal, showToast);
  } else if (currentRoute === 'members') {
    container.innerHTML = renderMembers(data, {
      searchQuery: appState.memberSearch,
      clubFilter: appState.memberClub,
      facultyFilter: appState.memberFaculty,
      statusFilter: appState.memberStatus
    });
    setupMembersEvents(container, {
      get searchQuery() { return appState.memberSearch; },
      set searchQuery(v) { appState.memberSearch = v; },
      get clubFilter() { return appState.memberClub; },
      set clubFilter(v) { appState.memberClub = v; },
      get facultyFilter() { return appState.memberFaculty; },
      set facultyFilter(v) { appState.memberFaculty = v; },
      get statusFilter() { return appState.memberStatus; },
      set statusFilter(v) { appState.memberStatus = v; }
    }, renderApp, openModal, showToast, data);
  } else if (currentRoute === 'recruitment') {
    container.innerHTML = renderRecruitment(data, appState.recruitmentTab, appState.recruitmentStatus);
    setupRecruitmentEvents(
      container,
      appState,
      renderApp,
      handleApplicantAction,
      handleNewApplication
    );
  } else if (currentRoute === 'events') {
    container.innerHTML = renderEvents(data, appState.eventFilter, appState.searchQuery);
    setupEventsHandlers(container, appState, renderApp, openModal);
  } else if (currentRoute === 'finance') {
    container.innerHTML = renderFinance(data, {
      clubFilter: appState.financeClub,
      typeFilter: appState.financeType
    });
    setupFinanceHandlers(container, {
      get financeClub() { return appState.financeClub; },
      set financeClub(v) { appState.financeClub = v; },
      get financeType() { return appState.financeType; },
      set financeType(v) { appState.financeType = v; }
    }, renderApp, openModal, showToast, data);
  } else if (currentRoute === 'certificate') {
    container.innerHTML = renderCertificate(data, appState.selectedCertMemberId);
    setupCertificateHandlers(container, data, showToast);
  } else if (currentRoute === 'settings') {
    container.innerHTML = renderSettingsView(data);
    setupSettingsHandlers(container);
  }
}

// Render Settings View
function renderSettingsView(data) {
  return `
    <div style="max-width: 860px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px;">
      <div class="glass-panel" style="padding: 28px;">
        <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-main); margin-bottom: 8px;">
          💾 Sao lưu & Phục hồi dữ liệu
        </h3>
        <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 20px;">
          Dữ liệu được lưu trữ tự động trên trình duyệt (LocalStorage). Bạn có thể xuất file sao lưu JSON hoặc nhập dữ liệu mới bất cứ lúc nào.
        </p>

        <div style="display: flex; gap: 14px; flex-wrap: wrap;">
          <button class="btn btn-primary" id="btn-backup-export">
            <span>📥</span> Tải File Sao Lưu (JSON)
          </button>
          <label class="btn btn-secondary" style="cursor: pointer; margin: 0;">
            <span>📤</span> Nhập File Sao Lưu
            <input type="file" id="input-backup-import" accept=".json" style="display: none;" />
          </label>
          <button class="btn btn-danger" id="btn-backup-reset">
            <span>🔄</span> Khôi phục dữ liệu gốc HUMG
          </button>
        </div>
      </div>

      <div class="glass-panel" style="padding: 28px;">
        <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-main); margin-bottom: 8px;">
          🏫 Thông tin hệ thống & Bản quyền
        </h3>
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
          <img src="assets/images/humg_logo.png" alt="HUMG Logo" style="width: 58px; height: 58px; border-radius: 50%;" />
          <div>
            <div style="font-weight: 800; font-size: 1.05rem; color: var(--text-main);">Trường Đại học Mỏ - Địa chất (HUMG)</div>
            <div style="font-size: 0.84rem; color: var(--primary); font-weight: 700;">Đoàn TNCS Hồ Chí Minh - Hội Sinh viên Việt Nam</div>
            <div style="font-size: 0.76rem; color: var(--text-muted);">Địa chỉ: Số 18 Phố Viên, Phường Đức Thắng, Quận Bắc Từ Liêm, Hà Nội</div>
          </div>
        </div>
        <p style="font-size: 0.84rem; color: var(--text-secondary); line-height: 1.6;">
          Phần mềm Quản lý Toàn diện Đội, Nhóm, CLB Sinh viên được thiết kế với tiêu chuẩn công nghệ hiện đại, đáp ứng đầy đủ yêu cầu quản lý nhân sự, sự kiện, tuyển quân, tài chính và khen thưởng phong trào học sinh sinh viên.
        </p>
      </div>
    </div>
  `;
}

function setupSettingsHandlers(container) {
  const exportBtn = container.querySelector('#btn-backup-export');
  const importInput = container.querySelector('#input-backup-import');
  const resetBtn = container.querySelector('#btn-backup-reset');

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      exportJSON();
      showToast('Đã xuất file sao lưu hệ thống thành công!', 'success');
    });
  }

  if (importInput) {
    importInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const ok = importJSON(event.target.result);
        if (ok) {
          appState.data = loadData();
          showToast('Nhập dữ liệu thành công!', 'success');
          renderApp();
        } else {
          showToast('File JSON không hợp lệ!', 'error');
        }
      };
      reader.readAsText(file);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Bạn có chắc chắn muốn đặt lại dữ liệu về trạng thái mẫu ban đầu của HUMG?')) {
        appState.data = resetData();
        showToast('Đã khôi phục dữ liệu gốc thành công!', 'success');
        renderApp();
      }
    });
  }
}

// Handle Applicant Actions
function handleApplicantAction(id, action) {
  const applicant = appState.data.recruitments.find(r => r.id === id);
  if (!applicant) return;

  if (action === 'accept') {
    applicant.status = 'accepted';
    // Add applicant to members list automatically!
    const newMember = {
      id: generateId('mem'),
      studentId: applicant.studentId,
      fullName: applicant.fullName,
      email: applicant.email,
      phone: applicant.phone,
      clubId: applicant.targetClubId,
      clubName: applicant.targetClubName,
      role: `Hội viên mới (${applicant.departmentPreference})`,
      faculty: applicant.faculty,
      classYear: applicant.classYear,
      joinDate: new Date().toISOString().slice(0, 10),
      trainingPoints: 85,
      status: 'official'
    };
    appState.data.members.unshift(newMember);

    // Increase club member count
    const targetClub = appState.data.clubs.find(c => c.id === applicant.targetClubId);
    if (targetClub) targetClub.membersCount = (targetClub.membersCount || 0) + 1;

    saveData(appState.data);
    showToast(`Đã duyệt trúng tuyển và kết nạp ${applicant.fullName} vào ${applicant.targetClubName}!`, 'success');
    renderApp();
  } else if (action === 'interview') {
    const time = prompt('Nhập thời gian và địa điểm phỏng vấn:', '19h30, Thứ Năm tại Phòng sinh hoạt Đoàn Trường');
    if (time) {
      applicant.status = 'interviewing';
      applicant.interviewTime = time;
      saveData(appState.data);
      showToast(`Đã xếp lịch phỏng vấn cho ${applicant.fullName}!`, 'info');
      renderApp();
    }
  } else if (action === 'reject') {
    if (confirm(`Bạn có chắc muốn từ chối hồ sơ của ${applicant.fullName}?`)) {
      applicant.status = 'rejected';
      saveData(appState.data);
      showToast(`Đã cập nhật trạng thái từ chối hồ sơ.`, 'warning');
      renderApp();
    }
  }
}

// Handle New Application Submission
function handleNewApplication(formData) {
  const targetClub = appState.data.clubs.find(c => c.id === formData.targetClubId);
  const newRecruitment = {
    id: generateId('rec'),
    ...formData,
    targetClubName: targetClub ? targetClub.name : 'CLB HUMG',
    status: 'pending',
    appliedDate: new Date().toISOString().slice(0, 10),
    interviewTime: 'Chờ xét duyệt'
  };

  appState.data.recruitments.unshift(newRecruitment);
  saveData(appState.data);
  showToast('Nộp hồ sơ thành công! Ban Chủ nhiệm sẽ liên hệ sớm nhất.', 'success');
  appState.recruitmentTab = 'list';
  renderApp();
}

// ========================================================
// MODAL MANAGEMENT SYSTEM
// ========================================================
const modalBackdrop = document.getElementById('modal-backdrop');
const modalWindow = document.getElementById('modal-window');

export function openModal(type, targetId = null) {
  if (!modalBackdrop || !modalWindow) return;

  let modalHtml = '';

  if (type === 'addClub' || type === 'editClub') {
    const isEdit = type === 'editClub';
    const club = isEdit ? appState.data.clubs.find(c => c.id === targetId) : {};

    modalHtml = `
      <div class="modal-header">
        <h3 class="modal-title">
          <span>${isEdit ? '✏️' : '🏛️'}</span> ${isEdit ? 'Chỉnh Sửa Câu Lạc Bộ' : 'Thành Lập CLB / Đội Nhóm Mới'}
        </h3>
        <button class="modal-close-btn" id="modal-close-x">&times;</button>
      </div>
      <form id="form-club-save">
        <div class="modal-body">
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Tên đầy đủ CLB *</label>
              <input type="text" id="club-f-name" class="form-control" value="${club.name || ''}" placeholder="Ví dụ: CLB Trắc địa trẻ HUMG" required />
            </div>
            <div class="form-group">
              <label class="form-label">Tên viết tắt (Acronym) *</label>
              <input type="text" id="club-f-acronym" class="form-control" value="${club.acronym || ''}" placeholder="Ví dụ: HITC, HMC" required />
            </div>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Lĩnh vực hoạt động *</label>
              <select id="club-f-category" class="form-control" required>
                ${clubCategories.map(cat => `
                  <option value="${cat}" ${club.category === cat ? 'selected' : ''}>${cat}</option>
                `).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Khoa bảo trợ chuyên môn *</label>
              <select id="club-f-faculty" class="form-control" required>
                ${facultiesList.map(f => `
                  <option value="${f}" ${club.faculty === f ? 'selected' : ''}>${f}</option>
                `).join('')}
              </select>
            </div>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Chủ nhiệm / Đội trưởng *</label>
              <input type="text" id="club-f-leader" class="form-control" value="${club.leader || ''}" placeholder="Họ và tên chủ nhiệm" required />
            </div>
            <div class="form-group">
              <label class="form-label">Số điện thoại liên hệ *</label>
              <input type="text" id="club-f-phone" class="form-control" value="${club.leaderPhone || ''}" placeholder="09xx.xxx.xxx" required />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Khẩu hiệu (Slogan) CLB</label>
            <input type="text" id="club-f-slogan" class="form-control" value="${club.slogan || ''}" placeholder="Ví dụ: Nhiệt huyết áo xanh - Nối vòng tay lớn" />
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Địa điểm / Phòng sinh hoạt</label>
              <input type="text" id="club-f-room" class="form-control" value="${club.room || 'Văn phòng Đoàn - Hội'}" />
            </div>
            <div class="form-group">
              <label class="form-label">Lịch sinh hoạt định kỳ</label>
              <input type="text" id="club-f-schedule" class="form-control" value="${club.meetingSchedule || 'Thứ 7 hàng tuần (18h00)'}" />
            </div>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Quỹ ban đầu (VNĐ)</label>
              <input type="number" id="club-f-fund" class="form-control" value="${club.fundBalance || 5000000}" step="100000" />
            </div>
            <div class="form-group">
              <label class="form-label">Trạng thái hoạt động</label>
              <select id="club-f-status" class="form-control">
                <option value="active" ${club.status === 'active' ? 'selected' : ''}>🟢 Đang hoạt động</option>
                <option value="recruiting" ${club.status === 'recruiting' ? 'selected' : ''}>📢 Đang tuyển quân</option>
                <option value="paused" ${club.status === 'paused' ? 'selected' : ''}>⏸️ Tạm dừng</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Giới thiệu chi tiết CLB</label>
            <textarea id="club-f-desc" class="form-control" placeholder="Mục đích, sứ mệnh và phương hướng hoạt động...">${club.description || ''}</textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="modal-cancel-btn">Hủy bỏ</button>
          <button type="submit" class="btn btn-primary">
            <span>💾</span> ${isEdit ? 'Lưu Thay Đổi' : 'Thành Lập CLB'}
          </button>
        </div>
      </form>
    `;
  } else if (type === 'viewClubDetail') {
    const club = appState.data.clubs.find(c => c.id === targetId);
    if (!club) return;

    const clubMembers = appState.data.members.filter(m => m.clubId === club.id);
    const clubEvents = appState.data.events.filter(e => e.clubId === club.id);

    modalHtml = `
      <div class="modal-header">
        <h3 class="modal-title">
          <span>${club.icon || '🏛️'}</span> ${club.name} (${club.acronym})
        </h3>
        <button class="modal-close-btn" id="modal-close-x">&times;</button>
      </div>
      <div class="modal-body" style="gap: 20px;">
        <div style="background: ${club.bannerColor || 'var(--primary)'}; padding: 20px; border-radius: var(--radius-md); color: #fff;">
          <div style="font-size: 0.8rem; text-transform: uppercase; font-weight: 700; opacity: 0.85;">${club.category} &bull; ${club.faculty}</div>
          <h2 style="font-size: 1.4rem; margin: 4px 0 8px 0; color: #fff;">"${club.slogan || ''}"</h2>
          <p style="font-size: 0.88rem; opacity: 0.95; line-height: 1.5;">${club.description}</p>
        </div>

        <div class="stats-grid" style="margin-bottom: 0;">
          <div class="stat-card glass-panel" style="padding: 14px;">
            <div class="stat-info">
              <span class="stat-label">Chủ nhiệm</span>
              <strong style="color: var(--text-main); font-size: 1.05rem;">${club.leader}</strong>
              <span style="font-size: 0.72rem; color: var(--text-muted);">${club.leaderPhone}</span>
            </div>
          </div>
          <div class="stat-card glass-panel" style="padding: 14px;">
            <div class="stat-info">
              <span class="stat-label">Tổng thành viên</span>
              <strong style="color: var(--text-main); font-size: 1.3rem;">👥 ${clubMembers.length} SV</strong>
            </div>
          </div>
          <div class="stat-card glass-panel" style="padding: 14px;">
            <div class="stat-info">
              <span class="stat-label">Số dư quỹ</span>
              <strong style="color: var(--humg-gold); font-size: 1.15rem;">${formatVND(club.fundBalance)}</strong>
            </div>
          </div>
        </div>

        <div>
          <h4 style="font-size: 0.95rem; font-weight: 800; color: var(--text-main); margin-bottom: 10px;">
            👥 Danh sách thành viên tiêu biểu (${clubMembers.length})
          </h4>
          <div class="table-container" style="max-height: 200px; overflow-y: auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Họ và tên</th>
                  <th>Chức vụ</th>
                  <th>Khoa & Lớp</th>
                  <th>Điểm rèn luyện</th>
                </tr>
              </thead>
              <tbody>
                ${clubMembers.length === 0 ? `
                  <tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Chưa có thành viên nào được kết nạp.</td></tr>
                ` : clubMembers.map(m => `
                  <tr>
                    <td><strong>${m.fullName}</strong> (${m.studentId})</td>
                    <td><span class="badge badge-primary">${m.role}</span></td>
                    <td>${m.faculty}</td>
                    <td>⭐ ${m.trainingPoints} ĐRL</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="modal-cancel-btn">Đóng</button>
        <button class="btn btn-primary" id="btn-modal-edit-this-club" data-id="${club.id}">
          <span>✏️</span> Chỉnh Sửa Thông Tin
        </button>
      </div>
    `;
  } else if (type === 'deleteClub') {
    const club = appState.data.clubs.find(c => c.id === targetId);
    if (!club) return;
    modalHtml = `
      <div class="modal-header">
        <h3 class="modal-title"><span>⚠️</span> Xác nhận giải thể / xoá CLB</h3>
        <button class="modal-close-btn" id="modal-close-x">&times;</button>
      </div>
      <div class="modal-body">
        <p style="font-size: 0.95rem; line-height: 1.6; color: var(--text-main);">
          Bạn có chắc chắn muốn xoá hoặc giải thể câu lạc bộ <strong>${club.name} (${club.acronym})</strong> không?
        </p>
        <p style="font-size: 0.82rem; color: var(--accent-rose);">
          Hành động này sẽ xóa dữ liệu CLB khỏi hệ thống. Các hội viên trực thuộc sẽ cần được chuyển sang CLB khác.
        </p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="modal-cancel-btn">Hủy bỏ</button>
        <button class="btn btn-danger" id="btn-confirm-delete-club" data-id="${club.id}">
          <span>🗑️</span> Xác nhận xoá
        </button>
      </div>
    `;
  } else if (type === 'addMember' || type === 'editMember') {
    const isEdit = type === 'editMember';
    const member = isEdit ? appState.data.members.find(m => m.id === targetId) : {};

    modalHtml = `
      <div class="modal-header">
        <h3 class="modal-title">
          <span>${isEdit ? '✏️' : '👤'}</span> ${isEdit ? 'Sửa Thông Tin Hội Viên' : 'Thêm Hội Viên Mới'}
        </h3>
        <button class="modal-close-btn" id="modal-close-x">&times;</button>
      </div>
      <form id="form-member-save">
        <div class="modal-body">
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Họ và tên sinh viên *</label>
              <input type="text" id="mem-f-name" class="form-control" value="${member.fullName || ''}" placeholder="Ví dụ: Nguyễn Văn An" required />
            </div>
            <div class="form-group">
              <label class="form-label">Mã số sinh viên (MSV) *</label>
              <input type="text" id="mem-f-msv" class="form-control" value="${member.studentId || ''}" placeholder="Ví dụ: 2121060129 (10 chữ số)" maxlength="10" required />
            </div>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Email sinh viên *</label>
              <input type="email" id="mem-f-email" class="form-control" value="${member.email || ''}" placeholder="annv.k67@humg.edu.vn" required />
            </div>
            <div class="form-group">
              <label class="form-label">Số điện thoại</label>
              <input type="text" id="mem-f-phone" class="form-control" value="${member.phone || ''}" placeholder="0987.xxx.xxx" />
            </div>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Câu lạc bộ tham gia *</label>
              <select id="mem-f-club" class="form-control" required>
                ${appState.data.clubs.map(c => `
                  <option value="${c.id}" ${member.clubId === c.id ? 'selected' : ''}>${c.name} (${c.acronym})</option>
                `).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Chức vụ trong CLB *</label>
              <input type="text" id="mem-f-role" class="form-control" value="${member.role || 'Thành viên ban Truyền thông'}" required />
            </div>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Khoa đang theo học *</label>
              <select id="mem-f-faculty" class="form-control" required>
                ${facultiesList.map(f => `
                  <option value="${f}" ${member.faculty === f ? 'selected' : ''}>${f}</option>
                `).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Lớp / Khoá *</label>
              <input type="text" id="mem-f-class" class="form-control" value="${member.classYear || 'K67 - CNTT B'}" required />
            </div>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Điểm rèn luyện tích luỹ</label>
              <input type="number" id="mem-f-points" class="form-control" value="${member.trainingPoints || 88}" min="0" max="100" />
            </div>
            <div class="form-group">
              <label class="form-label">Trạng thái</label>
              <select id="mem-f-status" class="form-control">
                <option value="official" ${member.status === 'official' ? 'selected' : ''}>🟢 Chính thức</option>
                <option value="probation" ${member.status === 'probation' ? 'selected' : ''}>🟡 Dự bị</option>
                <option value="alumni" ${member.status === 'alumni' ? 'selected' : ''}>⚪ Đã tốt nghiệp</option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="modal-cancel-btn">Hủy bỏ</button>
          <button type="submit" class="btn btn-primary">
            <span>💾</span> ${isEdit ? 'Lưu Thay Đổi' : 'Thêm Hội Viên'}
          </button>
        </div>
      </form>
    `;
  } else if (type === 'deleteMember') {
    const member = appState.data.members.find(m => m.id === targetId);
    if (!member) return;
    modalHtml = `
      <div class="modal-header">
        <h3 class="modal-title"><span>⚠️</span> Xác nhận xoá thành viên</h3>
        <button class="modal-close-btn" id="modal-close-x">&times;</button>
      </div>
      <div class="modal-body">
        <p style="font-size: 0.95rem; color: var(--text-main);">
          Bạn có chắc muốn xoá thành viên <strong>${member.fullName}</strong> (${member.studentId}) khỏi ${member.clubName}?
        </p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="modal-cancel-btn">Hủy bỏ</button>
        <button class="btn btn-danger" id="btn-confirm-delete-member" data-id="${member.id}">
          <span>🗑️</span> Xác nhận xoá
        </button>
      </div>
    `;
  } else if (type === 'addEvent' || type === 'editEvent') {
    const isEdit = type === 'editEvent';
    const ev = isEdit ? appState.data.events.find(e => e.id === targetId) : {};

    modalHtml = `
      <div class="modal-header">
        <h3 class="modal-title">
          <span>${isEdit ? '✏️' : '🎉'}</span> ${isEdit ? 'Chỉnh Sửa Sự Kiện' : 'Tạo Sự Kiện Mới'}
        </h3>
        <button class="modal-close-btn" id="modal-close-x">&times;</button>
      </div>
      <form id="form-event-save">
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Tên sự kiện / hoạt động *</label>
            <input type="text" id="ev-f-title" class="form-control" value="${ev.title || ''}" placeholder="Ví dụ: Hội thảo Nghiên cứu Khoa học Sinh viên HUMG 2026" required />
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Đơn vị chủ trì *</label>
              <select id="ev-f-club" class="form-control" required>
                ${appState.data.clubs.map(c => `
                  <option value="${c.id}" ${ev.clubId === c.id ? 'selected' : ''}>${c.name}</option>
                `).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Lĩnh vực hoạt động</label>
              <select id="ev-f-cat" class="form-control">
                ${clubCategories.map(cat => `
                  <option value="${cat}" ${ev.category === cat ? 'selected' : ''}>${cat}</option>
                `).join('')}
              </select>
            </div>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Ngày tổ chức *</label>
              <input type="date" id="ev-f-date" class="form-control" value="${ev.date || new Date().toISOString().slice(0, 10)}" required />
            </div>
            <div class="form-group">
              <label class="form-label">Thời gian</label>
              <input type="text" id="ev-f-time" class="form-control" value="${ev.time || '08:00 - 11:30'}" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Địa điểm tổ chức *</label>
            <input type="text" id="ev-f-location" class="form-control" value="${ev.location || 'Hội trường 300 - Khu A'}" required />
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Dự toán kinh phí (VNĐ)</label>
              <input type="number" id="ev-f-budget" class="form-control" value="${ev.budget || 5000000}" step="500000" />
            </div>
            <div class="form-group">
              <label class="form-label">Số lượng sinh viên tối đa</label>
              <input type="number" id="ev-f-max" class="form-control" value="${ev.maxAttendees || 200}" />
            </div>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Điểm rèn luyện cộng thêm (+ĐRL)</label>
              <input type="number" id="ev-f-points" class="form-control" value="${ev.trainingPointsReward || 10}" min="1" max="25" />
            </div>
            <div class="form-group">
              <label class="form-label">Trạng thái</label>
              <select id="ev-f-status" class="form-control">
                <option value="upcoming" ${ev.status === 'upcoming' ? 'selected' : ''}>⏳ Sắp diễn ra</option>
                <option value="ongoing" ${ev.status === 'ongoing' ? 'selected' : ''}>🔥 Đang diễn ra</option>
                <option value="completed" ${ev.status === 'completed' ? 'selected' : ''}>✅ Đã hoàn thành</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Mô tả nội dung sự kiện</label>
            <textarea id="ev-f-desc" class="form-control" placeholder="Mục đích, thành phần tham gia, chương trình chi tiết...">${ev.description || ''}</textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="modal-cancel-btn">Hủy bỏ</button>
          <button type="submit" class="btn btn-primary">
            <span>💾</span> ${isEdit ? 'Lưu Sự Kiện' : 'Tạo Sự Kiện'}
          </button>
        </div>
      </form>
    `;
  } else if (type === 'deleteEvent') {
    const ev = appState.data.events.find(e => e.id === targetId);
    if (!ev) return;
    modalHtml = `
      <div class="modal-header">
        <h3 class="modal-title"><span>⚠️</span> Xác nhận huỷ sự kiện</h3>
        <button class="modal-close-btn" id="modal-close-x">&times;</button>
      </div>
      <div class="modal-body">
        <p style="font-size: 0.95rem; color: var(--text-main);">
          Bạn có chắc muốn xoá sự kiện <strong>${ev.title}</strong>?
        </p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="modal-cancel-btn">Hủy bỏ</button>
        <button class="btn btn-danger" id="btn-confirm-delete-event" data-id="${ev.id}">
          <span>🗑️</span> Xác nhận xoá
        </button>
      </div>
    `;
  } else if (type === 'qrCheckin') {
    const defaultEvent = targetId ? appState.data.events.find(e => e.id === targetId) : appState.data.events[0];
    modalHtml = `
      <div class="modal-header">
        <h3 class="modal-title"><span>📲</span> Điểm Danh Sự Kiện Bằng Mã QR</h3>
        <button class="modal-close-btn" id="modal-close-x">&times;</button>
      </div>
      <div class="modal-body" style="text-align: center;">
        <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 16px;">
          Sinh viên quét mã QR bằng camera điện thoại hoặc nhập MSV để tự động ghi nhận tham gia và cộng điểm rèn luyện (+ĐRL).
        </p>

        <div style="background: #ffffff; padding: 20px; border-radius: var(--radius-lg); display: inline-block; box-shadow: var(--shadow-md); margin-bottom: 20px;">
          <!-- SVG QR Code Visual -->
          <svg width="180" height="180" viewBox="0 0 100 100" style="display: block;">
            <rect width="100" height="100" fill="#ffffff"/>
            <!-- Top-left position block -->
            <rect x="10" y="10" width="28" height="28" fill="#0b2545"/>
            <rect x="15" y="15" width="18" height="18" fill="#ffffff"/>
            <rect x="19" y="19" width="10" height="10" fill="#0b2545"/>
            <!-- Top-right position block -->
            <rect x="62" y="10" width="28" height="28" fill="#0b2545"/>
            <rect x="67" y="15" width="18" height="18" fill="#ffffff"/>
            <rect x="71" y="19" width="10" height="10" fill="#0b2545"/>
            <!-- Bottom-left position block -->
            <rect x="10" y="62" width="28" height="28" fill="#0b2545"/>
            <rect x="15" y="67" width="18" height="18" fill="#ffffff"/>
            <rect x="19" y="71" width="10" height="10" fill="#0b2545"/>
            <!-- Custom data points -->
            <rect x="42" y="12" width="6" height="6" fill="#0b2545"/>
            <rect x="52" y="18" width="6" height="6" fill="#0b2545"/>
            <rect x="44" y="28" width="6" height="6" fill="#0b2545"/>
            <rect x="12" y="44" width="6" height="6" fill="#0b2545"/>
            <rect x="24" y="48" width="6" height="6" fill="#0b2545"/>
            <rect x="45" y="45" width="10" height="10" fill="#f59e0b"/>
            <rect x="65" y="45" width="6" height="6" fill="#0b2545"/>
            <rect x="75" y="52" width="6" height="6" fill="#0b2545"/>
            <rect x="45" y="65" width="6" height="6" fill="#0b2545"/>
            <rect x="55" y="75" width="6" height="6" fill="#0b2545"/>
            <rect x="70" y="70" width="16" height="16" fill="#0b2545"/>
          </svg>
          <div style="font-family: monospace; font-size: 0.72rem; color: #0b2545; font-weight: bold; margin-top: 6px;">
            HUMG-CHECKIN-2026
          </div>
        </div>

        <div style="text-align: left; background: var(--bg-badge); padding: 16px; border-radius: var(--radius-md); margin-bottom: 18px;">
          <div class="form-group" style="margin-bottom: 12px;">
            <label class="form-label">Chọn sự kiện điểm danh</label>
            <select id="qr-select-event" class="form-control">
              ${appState.data.events.map(e => `
                <option value="${e.id}" ${defaultEvent && defaultEvent.id === e.id ? 'selected' : ''}>
                  ${e.title} (${e.clubName})
                </option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Mã số sinh viên (MSV) quét thẻ điểm danh</label>
            <div style="display: flex; gap: 8px;">
              <select id="qr-select-member" class="form-control">
                ${appState.data.members.map(m => `
                  <option value="${m.id}">${m.fullName} - MSV: ${m.studentId} (${m.faculty})</option>
                `).join('')}
              </select>
              <button class="btn btn-gold" id="btn-trigger-checkin" style="flex-shrink: 0;">
                <span>⚡</span> Quét & Cộng Điểm
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="modal-cancel-btn">Đóng</button>
      </div>
    `;
  } else if (type === 'addFinance') {
    modalHtml = `
      <div class="modal-header">
        <h3 class="modal-title"><span>💰</span> Lập Phiếu Thu / Chi Sổ Quỹ</h3>
        <button class="modal-close-btn" id="modal-close-x">&times;</button>
      </div>
      <form id="form-finance-save">
        <div class="modal-body">
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Loại phiếu *</label>
              <select id="fin-f-type" class="form-control" required>
                <option value="income">🟢 Phiếu Thu (Tiền vào)</option>
                <option value="expense">🔴 Phiếu Chi (Tiền ra)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Câu lạc bộ *</label>
              <select id="fin-f-club" class="form-control" required>
                ${appState.data.clubs.map(c => `
                  <option value="${c.id}">${c.name} (${c.acronym})</option>
                `).join('')}
              </select>
            </div>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Số tiền (VNĐ) *</label>
              <input type="number" id="fin-f-amount" class="form-control" placeholder="Ví dụ: 2500000" min="10000" step="10000" required />
            </div>
            <div class="form-group">
              <label class="form-label">Danh mục thu / chi *</label>
              <select id="fin-f-cat" class="form-control" required>
                <option value="Tài trợ doanh nghiệp">Tài trợ doanh nghiệp</option>
                <option value="Quỹ hội viên">Quỹ hội viên</option>
                <option value="Hỗ trợ Đoàn trường">Hỗ trợ Đoàn trường</option>
                <option value="Mua vật tư sự kiện">Mua vật tư sự kiện</option>
                <option value="In ấn chứng nhận">In ấn chứng nhận</option>
                <option value="Đạo cụ & Âm thanh">Đạo cụ & Âm thanh</option>
                <option value="Khen thưởng & Quà tặng">Khen thưởng & Quà tặng</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Nội dung diễn giải chi tiết *</label>
            <textarea id="fin-f-desc" class="form-control" placeholder="Mục đích chi tiêu hoặc nguồn gốc khoản tài trợ..." required></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Ngày ghi sổ *</label>
            <input type="date" id="fin-f-date" class="form-control" value="${new Date().toISOString().slice(0, 10)}" required />
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="modal-cancel-btn">Hủy bỏ</button>
          <button type="submit" class="btn btn-primary">
            <span>💾</span> Lưu Phiếu Ghi Sổ
          </button>
        </div>
      </form>
    `;
  } else if (type === 'deleteFinance') {
    modalHtml = `
      <div class="modal-header">
        <h3 class="modal-title"><span>⚠️</span> Xác nhận xoá giao dịch</h3>
        <button class="modal-close-btn" id="modal-close-x">&times;</button>
      </div>
      <div class="modal-body">
        <p style="font-size: 0.95rem; color: var(--text-main);">
          Bạn có chắc chắn muốn xoá bản ghi giao dịch này khỏi sổ quỹ phong trào?
        </p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="modal-cancel-btn">Hủy bỏ</button>
        <button class="btn btn-danger" id="btn-confirm-delete-finance" data-id="${targetId}">
          <span>🗑️</span> Xác nhận xoá
        </button>
      </div>
    `;
  } else if (type === 'quickCertificate') {
    closeModal();
    navigateTo('certificate', { memberId: targetId });
    return;
  }

  modalWindow.innerHTML = modalHtml;
  modalBackdrop.classList.add('active');

  // Bind close buttons
  const closeX = modalWindow.querySelector('#modal-close-x');
  const cancelBtn = modalWindow.querySelector('#modal-cancel-btn');
  if (closeX) closeX.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  // Bind forms & specific actions
  bindModalActions(type, targetId);
}

function closeModal() {
  if (modalBackdrop) {
    modalBackdrop.classList.remove('active');
  }
}

function bindModalActions(type, targetId) {
  // Form Save Club
  const clubForm = modalWindow.querySelector('#form-club-save');
  if (clubForm) {
    clubForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const isEdit = type === 'editClub';
      const clubData = {
        name: clubForm.querySelector('#club-f-name').value.trim(),
        acronym: clubForm.querySelector('#club-f-acronym').value.trim(),
        category: clubForm.querySelector('#club-f-category').value,
        faculty: clubForm.querySelector('#club-f-faculty').value,
        leader: clubForm.querySelector('#club-f-leader').value.trim(),
        leaderPhone: clubForm.querySelector('#club-f-phone').value.trim(),
        slogan: clubForm.querySelector('#club-f-slogan').value.trim(),
        room: clubForm.querySelector('#club-f-room').value.trim(),
        meetingSchedule: clubForm.querySelector('#club-f-schedule').value.trim(),
        fundBalance: Number(clubForm.querySelector('#club-f-fund').value) || 0,
        status: clubForm.querySelector('#club-f-status').value,
        description: clubForm.querySelector('#club-f-desc').value.trim()
      };

      if (isEdit) {
        const idx = appState.data.clubs.findIndex(c => c.id === targetId);
        if (idx !== -1) {
          appState.data.clubs[idx] = { ...appState.data.clubs[idx], ...clubData };
          showToast(`Đã cập nhật câu lạc bộ ${clubData.name}!`, 'success');
        }
      } else {
        const newClub = {
          id: generateId('clb'),
          ...clubData,
          membersCount: 1,
          rating: 5.0,
          icon: '🏛️',
          bannerColor: 'linear-gradient(135deg, #1e3a8a, #0284c7)',
          avatarBg: 'var(--primary)'
        };
        appState.data.clubs.unshift(newClub);
        showToast(`Đã thành lập câu lạc bộ mới: ${clubData.name}!`, 'success');
      }

      saveData(appState.data);
      closeModal();
      renderApp();
    });
  }

  // Delete Club confirmation
  const confirmDelClub = modalWindow.querySelector('#btn-confirm-delete-club');
  if (confirmDelClub) {
    confirmDelClub.addEventListener('click', () => {
      appState.data.clubs = appState.data.clubs.filter(c => c.id !== targetId);
      saveData(appState.data);
      closeModal();
      showToast('Đã xoá câu lạc bộ khỏi hệ thống.', 'info');
      renderApp();
    });
  }

  // Button edit from view detail
  const editFromDetail = modalWindow.querySelector('#btn-modal-edit-this-club');
  if (editFromDetail) {
    editFromDetail.addEventListener('click', () => {
      openModal('editClub', targetId);
    });
  }

  // Form Save Member
  const memberForm = modalWindow.querySelector('#form-member-save');
  if (memberForm) {
    memberForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const isEdit = type === 'editMember';
      const clubId = memberForm.querySelector('#mem-f-club').value;
      const targetClub = appState.data.clubs.find(c => c.id === clubId);

      const memberData = {
        fullName: memberForm.querySelector('#mem-f-name').value.trim(),
        studentId: memberForm.querySelector('#mem-f-msv').value.trim(),
        email: memberForm.querySelector('#mem-f-email').value.trim(),
        phone: memberForm.querySelector('#mem-f-phone').value.trim(),
        clubId: clubId,
        clubName: targetClub ? targetClub.name : 'CLB HUMG',
        role: memberForm.querySelector('#mem-f-role').value.trim(),
        faculty: memberForm.querySelector('#mem-f-faculty').value,
        classYear: memberForm.querySelector('#mem-f-class').value.trim(),
        trainingPoints: Number(memberForm.querySelector('#mem-f-points').value) || 85,
        status: memberForm.querySelector('#mem-f-status').value
      };

      if (isEdit) {
        const idx = appState.data.members.findIndex(m => m.id === targetId);
        if (idx !== -1) {
          appState.data.members[idx] = { ...appState.data.members[idx], ...memberData };
          showToast(`Đã cập nhật thông tin ${memberData.fullName}!`, 'success');
        }
      } else {
        const newMember = {
          id: generateId('mem'),
          ...memberData,
          joinDate: new Date().toISOString().slice(0, 10)
        };
        appState.data.members.unshift(newMember);
        if (targetClub) targetClub.membersCount = (targetClub.membersCount || 0) + 1;
        showToast(`Đã thêm hội viên ${memberData.fullName}!`, 'success');
      }

      saveData(appState.data);
      closeModal();
      renderApp();
    });
  }

  // Delete Member confirmation
  const confirmDelMember = modalWindow.querySelector('#btn-confirm-delete-member');
  if (confirmDelMember) {
    confirmDelMember.addEventListener('click', () => {
      appState.data.members = appState.data.members.filter(m => m.id !== targetId);
      saveData(appState.data);
      closeModal();
      showToast('Đã xoá thành viên khỏi danh sách.', 'info');
      renderApp();
    });
  }

  // Form Save Event
  const eventForm = modalWindow.querySelector('#form-event-save');
  if (eventForm) {
    eventForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const isEdit = type === 'editEvent';
      const clubId = eventForm.querySelector('#ev-f-club').value;
      const hostClub = appState.data.clubs.find(c => c.id === clubId);

      const eventData = {
        title: eventForm.querySelector('#ev-f-title').value.trim(),
        clubId: clubId,
        clubName: hostClub ? hostClub.name : 'CLB HUMG',
        category: eventForm.querySelector('#ev-f-cat').value,
        date: eventForm.querySelector('#ev-f-date').value,
        time: eventForm.querySelector('#ev-f-time').value.trim(),
        location: eventForm.querySelector('#ev-f-location').value.trim(),
        budget: Number(eventForm.querySelector('#ev-f-budget').value) || 0,
        maxAttendees: Number(eventForm.querySelector('#ev-f-max').value) || 100,
        trainingPointsReward: Number(eventForm.querySelector('#ev-f-points').value) || 10,
        status: eventForm.querySelector('#ev-f-status').value,
        description: eventForm.querySelector('#ev-f-desc').value.trim()
      };

      if (isEdit) {
        const idx = appState.data.events.findIndex(ev => ev.id === targetId);
        if (idx !== -1) {
          appState.data.events[idx] = { ...appState.data.events[idx], ...eventData };
          showToast(`Đã cập nhật sự kiện ${eventData.title}!`, 'success');
        }
      } else {
        const newEv = {
          id: generateId('evt'),
          ...eventData,
          attendeesCount: 0
        };
        appState.data.events.unshift(newEv);
        showToast(`Đã tạo sự kiện: ${eventData.title}!`, 'success');
      }

      saveData(appState.data);
      closeModal();
      renderApp();
    });
  }

  // Delete Event confirmation
  const confirmDelEvent = modalWindow.querySelector('#btn-confirm-delete-event');
  if (confirmDelEvent) {
    confirmDelEvent.addEventListener('click', () => {
      appState.data.events = appState.data.events.filter(e => e.id !== targetId);
      saveData(appState.data);
      closeModal();
      showToast('Đã huỷ sự kiện.', 'info');
      renderApp();
    });
  }

  // QR Check-in Simulator Trigger
  const triggerCheckinBtn = modalWindow.querySelector('#btn-trigger-checkin');
  if (triggerCheckinBtn) {
    triggerCheckinBtn.addEventListener('click', () => {
      const eventSelect = modalWindow.querySelector('#qr-select-event');
      const memberSelect = modalWindow.querySelector('#qr-select-member');

      const targetEv = appState.data.events.find(e => e.id === eventSelect.value);
      const targetMem = appState.data.members.find(m => m.id === memberSelect.value);

      if (targetEv && targetMem) {
        targetEv.attendeesCount = (targetEv.attendeesCount || 0) + 1;
        const pts = targetEv.trainingPointsReward || 10;
        targetMem.trainingPoints = Math.min(100, (targetMem.trainingPoints || 80) + pts);

        saveData(appState.data);
        showToast(`🎉 Điểm danh thành công! Sinh viên ${targetMem.fullName} được cộng +${pts} Điểm Rèn Luyện!`, 'success', 4500);
        closeModal();
        renderApp();
      }
    });
  }

  // Form Save Finance
  const finForm = modalWindow.querySelector('#form-finance-save');
  if (finForm) {
    finForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const clubId = finForm.querySelector('#fin-f-club').value;
      const targetClub = appState.data.clubs.find(c => c.id === clubId);
      const typeVal = finForm.querySelector('#fin-f-type').value;
      const amountVal = Number(finForm.querySelector('#fin-f-amount').value) || 0;

      const newRecord = {
        id: generateId('fin'),
        type: typeVal,
        clubId: clubId,
        clubName: targetClub ? targetClub.name : 'CLB HUMG',
        amount: amountVal,
        category: finForm.querySelector('#fin-f-cat').value,
        description: finForm.querySelector('#fin-f-desc').value.trim(),
        date: finForm.querySelector('#fin-f-date').value,
        status: 'completed'
      };

      // Update club balance
      if (targetClub) {
        if (typeVal === 'income') {
          targetClub.fundBalance = (targetClub.fundBalance || 0) + amountVal;
        } else {
          targetClub.fundBalance = Math.max(0, (targetClub.fundBalance || 0) - amountVal);
        }
      }

      appState.data.finances.unshift(newRecord);
      saveData(appState.data);
      closeModal();
      showToast(`Đã lập ${typeVal === 'income' ? 'phiếu thu' : 'phiếu chi'} ${formatVND(amountVal)} thành công!`, 'success');
      renderApp();
    });
  }

  // Delete Finance confirmation
  const confirmDelFin = modalWindow.querySelector('#btn-confirm-delete-finance');
  if (confirmDelFin) {
    confirmDelFin.addEventListener('click', () => {
      appState.data.finances = appState.data.finances.filter(f => f.id !== targetId);
      saveData(appState.data);
      closeModal();
      showToast('Đã xoá bản ghi tài chính.', 'info');
      renderApp();
    });
  }
}

// Close modal when clicking backdrop outside
if (modalBackdrop) {
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      closeModal();
    }
  });
}

// Global Keyboard Escape to close modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
  }
});

// App Initialization
export function initApp() {
  applyTheme(appState.theme);

  // Setup theme switcher button
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      appState.theme = appState.theme === 'dark' ? 'light' : 'dark';
      applyTheme(appState.theme);
    });
  }

  // Setup mobile hamburger toggle
  const mobileBtn = document.getElementById('mobile-menu-toggle');
  const sidebar = document.getElementById('app-sidebar');
  if (mobileBtn && sidebar) {
    mobileBtn.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }

  // Setup navigation items
  document.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const route = link.getAttribute('data-route');
      if (route) {
        navigateTo(route);
      }
    });
  });

  // Global header search box
  const headerSearch = document.getElementById('global-search-input');
  if (headerSearch) {
    let searchTimeout;
    headerSearch.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const query = e.target.value.trim();
        appState.searchQuery = query;
        appState.memberSearch = query;
        renderApp();
      }, 300);
    });
  }

  // Notification button alert
  const notifBtn = document.getElementById('header-notif-btn');
  if (notifBtn) {
    notifBtn.addEventListener('click', () => {
      showToast('Bạn có 3 thông báo mới từ Ban Chấp hành Đoàn Trường ĐH Mỏ - Địa chất!', 'info');
    });
  }

  // Listen to Storage Updates
  subscribe((newData) => {
    appState.data = newData;
    renderApp();
  });

  // Initial render
  navigateTo('dashboard');
}

// Run when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
