import { formatDate, exportToCSV } from '../utils.js';
import { facultiesList } from '../data.js';

export function renderMembers(data, state = {}) {
  const { members = [], clubs = [] } = data;
  const {
    searchQuery = '',
    clubFilter = 'all',
    facultyFilter = 'all',
    statusFilter = 'all'
  } = state;

  // Filter members
  const filtered = members.filter(m => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q ||
      m.fullName.toLowerCase().includes(q) ||
      m.studentId.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      (m.classYear && m.classYear.toLowerCase().includes(q));

    const matchClub = clubFilter === 'all' || m.clubId === clubFilter;
    const matchFaculty = facultyFilter === 'all' || m.faculty === facultyFilter;
    const matchStatus = statusFilter === 'all' || m.status === statusFilter;

    return matchSearch && matchClub && matchFaculty && matchStatus;
  });

  const avgPoints = filtered.length > 0
    ? (filtered.reduce((sum, m) => sum + (m.trainingPoints || 0), 0) / filtered.length).toFixed(1)
    : 0;

  return `
    <!-- Top Filter & Actions Bar -->
    <div class="glass-panel" style="padding: 20px; margin-bottom: 22px;">
      <div style="display: flex; gap: 14px; flex-wrap: wrap; align-items: center; justify-content: space-between;">
        <div style="display: flex; gap: 12px; flex-wrap: wrap; flex: 1; min-width: 280px;">
          <!-- Search box -->
          <div style="position: relative; flex: 1; min-width: 220px;">
            <input type="text" id="member-search-input" class="form-control" placeholder="Tìm theo Mã SV, Họ tên, Lớp..." value="${searchQuery}" />
            <span style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none;">🔍</span>
          </div>

          <!-- Club filter -->
          <select id="member-club-select" class="form-control" style="width: auto; min-width: 180px;">
            <option value="all" ${clubFilter === 'all' ? 'selected' : ''}>Tất cả CLB / Đội nhóm</option>
            ${clubs.map(c => `
              <option value="${c.id}" ${clubFilter === c.id ? 'selected' : ''}>${c.name} (${c.acronym})</option>
            `).join('')}
          </select>

          <!-- Faculty filter -->
          <select id="member-faculty-select" class="form-control" style="width: auto; min-width: 180px;">
            <option value="all" ${facultyFilter === 'all' ? 'selected' : ''}>Tất cả các Khoa</option>
            ${facultiesList.map(f => `
              <option value="${f}" ${facultyFilter === f ? 'selected' : ''}>${f}</option>
            `).join('')}
          </select>

          <!-- Status filter -->
          <select id="member-status-select" class="form-control" style="width: auto;">
            <option value="all" ${statusFilter === 'all' ? 'selected' : ''}>Tất cả trạng thái</option>
            <option value="official" ${statusFilter === 'official' ? 'selected' : ''}>🟢 Chính thức</option>
            <option value="probation" ${statusFilter === 'probation' ? 'selected' : ''}>🟡 Dự bị</option>
            <option value="alumni" ${statusFilter === 'alumni' ? 'selected' : ''}>⚪ Đã tốt nghiệp</option>
          </select>
        </div>

        <div style="display: flex; gap: 10px;">
          <button class="btn btn-secondary" id="btn-export-members-csv" title="Tải file Excel danh sách sinh viên">
            <span>📊</span> Xuất Excel (CSV)
          </button>
          <button class="btn btn-primary" id="btn-add-member-modal">
            <span>➕</span> Thêm Hội Viên Mới
          </button>
        </div>
      </div>
    </div>

    <!-- Summary Metrics -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; font-size: 0.88rem; color: var(--text-secondary);">
      <div>
        Hiển thị <strong>${filtered.length}</strong> / ${members.length} sinh viên tham gia CLB
      </div>
      <div style="display: flex; gap: 14px; font-size: 0.82rem;">
        <span class="badge badge-success">⭐ ĐRL trung bình: <strong>${avgPoints}</strong> / 100</span>
        <span class="badge badge-primary">🎓 Khoá K65 - K69</span>
      </div>
    </div>

    <!-- Members Table -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 40px; text-align: center;">STT</th>
            <th>Sinh viên / Mã SV</th>
            <th>Câu lạc bộ & Vai trò</th>
            <th>Khoá & Khoa</th>
            <th>Ngày gia nhập</th>
            <th>Điểm rèn luyện</th>
            <th>Trạng thái</th>
            <th style="text-align: right;">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.length === 0 ? `
            <tr>
              <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-muted);">
                <div style="font-size: 2rem; margin-bottom: 8px;">👥</div>
                Không tìm thấy hội viên nào phù hợp với bộ lọc hiện tại.
              </td>
            </tr>
          ` : filtered.map((m, idx) => {
            let statusBadge = '<span class="badge badge-success">Chính thức</span>';
            if (m.status === 'probation') statusBadge = '<span class="badge badge-warning">Dự bị</span>';
            if (m.status === 'alumni') statusBadge = '<span class="badge" style="background: rgba(148, 163, 184, 0.2); color: #94a3b8;">Đã tốt nghiệp</span>';

            const initials = m.fullName.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase();

            return `
              <tr>
                <td style="text-align: center; font-weight: 700; color: var(--text-muted);">${idx + 1}</td>
                <td>
                  <div class="student-pill">
                    <div class="student-avatar">${initials}</div>
                    <div class="student-info">
                      <span class="student-name">${m.fullName}</span>
                      <span class="student-id">MSV: ${m.studentId} &bull; ${m.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <strong style="color: var(--text-main); font-size: 0.86rem;">${m.clubName}</strong>
                  <div style="font-size: 0.74rem; color: var(--primary); font-weight: 600;">${m.role}</div>
                </td>
                <td>
                  <div style="font-weight: 600;">${m.classYear || 'K67'}</div>
                  <div style="font-size: 0.74rem; color: var(--text-muted);">${m.faculty}</div>
                </td>
                <td>
                  <span style="font-size: 0.82rem; color: var(--text-secondary);">${formatDate(m.joinDate)}</span>
                </td>
                <td>
                  <span class="badge ${m.trainingPoints >= 90 ? 'badge-success' : 'badge-primary'}">
                    ⭐ ${m.trainingPoints || 80} ĐRL
                  </span>
                </td>
                <td>${statusBadge}</td>
                <td style="text-align: right;">
                  <div style="display: inline-flex; gap: 6px;">
                    <button class="btn btn-secondary btn-sm btn-cert-member" data-id="${m.id}" title="Cấp Giấy chứng nhận đóng góp">
                      <span>📜</span>
                    </button>
                    <button class="btn btn-secondary btn-sm btn-edit-member" data-id="${m.id}" title="Sửa thông tin">
                      <span>✏️</span>
                    </button>
                    <button class="btn btn-danger btn-sm btn-delete-member" data-id="${m.id}" title="Xoá thành viên">
                      <span>🗑️</span>
                    </button>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

export function setupMembersEvents(container, state, updateState, openModal, showToast, data) {
  // Search input
  const searchInput = container.querySelector('#member-search-input');
  if (searchInput) {
    let timeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        state.searchQuery = e.target.value;
        updateState();
      }, 250);
    });
  }

  // Club select
  const clubSelect = container.querySelector('#member-club-select');
  if (clubSelect) {
    clubSelect.addEventListener('change', (e) => {
      state.clubFilter = e.target.value;
      updateState();
    });
  }

  // Faculty select
  const facultySelect = container.querySelector('#member-faculty-select');
  if (facultySelect) {
    facultySelect.addEventListener('change', (e) => {
      state.facultyFilter = e.target.value;
      updateState();
    });
  }

  // Status select
  const statusSelect = container.querySelector('#member-status-select');
  if (statusSelect) {
    statusSelect.addEventListener('change', (e) => {
      state.statusFilter = e.target.value;
      updateState();
    });
  }

  // Export CSV
  const exportBtn = container.querySelector('#btn-export-members-csv');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const headers = ['STT', 'Mã Sinh Viên', 'Họ Và Tên', 'Email', 'Số Điện Thoại', 'Câu Lạc Bộ', 'Vai Trò', 'Lớp Niên Chế', 'Khoa', 'Ngày Tham Gia', 'Điểm Rèn Luyện', 'Trạng Thái'];
      const rows = data.members.map((m, i) => [
        i + 1,
        m.studentId,
        m.fullName,
        m.email,
        m.phone || '',
        m.clubName,
        m.role,
        m.classYear || '',
        m.faculty,
        m.joinDate || '',
        m.trainingPoints || 80,
        m.status === 'official' ? 'Chính thức' : m.status === 'probation' ? 'Dự bị' : 'Đã tốt nghiệp'
      ]);
      exportToCSV(`Danh_Sach_Thanh_Vien_CLB_HUMG_${new Date().toISOString().slice(0, 10)}`, rows, headers);
      showToast('Đã xuất file Excel danh sách thành viên thành công!', 'success');
    });
  }

  // Add member modal
  const addBtn = container.querySelector('#btn-add-member-modal');
  if (addBtn) {
    addBtn.addEventListener('click', () => openModal('addMember'));
  }

  // Edit member
  container.querySelectorAll('.btn-edit-member').forEach(btn => {
    btn.addEventListener('click', () => {
      const memberId = btn.getAttribute('data-id');
      openModal('editMember', memberId);
    });
  });

  // Delete member
  container.querySelectorAll('.btn-delete-member').forEach(btn => {
    btn.addEventListener('click', () => {
      const memberId = btn.getAttribute('data-id');
      openModal('deleteMember', memberId);
    });
  });

  // Quick certificate for member
  container.querySelectorAll('.btn-cert-member').forEach(btn => {
    btn.addEventListener('click', () => {
      const memberId = btn.getAttribute('data-id');
      openModal('quickCertificate', memberId);
    });
  });
}
