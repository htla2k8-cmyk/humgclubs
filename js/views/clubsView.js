import { formatVND, renderRatingStars } from '../utils.js';

export function renderClubs(data, activeFilter = 'all', searchQuery = '', statusFilter = 'all') {
  const { clubs = [] } = data;

  const categories = [
    { id: 'all', label: 'Tất cả lĩnh vực' },
    { id: 'Học thuật & NCKH', label: '💻 Học thuật & NCKH' },
    { id: 'Tình nguyện & Xã hội', label: '🤝 Tình nguyện & Xã hội' },
    { id: 'Văn hoá & Nghệ thuật', label: '🎸 Văn hoá & Nghệ thuật' },
    { id: 'Thể dục Thể thao', label: '⚽ Thể dục Thể thao' },
    { id: 'Kỹ năng & Khởi nghiệp', label: '💡 Kỹ năng & Khởi nghiệp' }
  ];

  // Filtering
  let filtered = clubs.filter(c => {
    const matchCat = activeFilter === 'all' || c.category === activeFilter;
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q ||
      c.name.toLowerCase().includes(q) ||
      c.acronym.toLowerCase().includes(q) ||
      c.leader.toLowerCase().includes(q) ||
      c.faculty.toLowerCase().includes(q) ||
      c.slogan.toLowerCase().includes(q);

    return matchCat && matchStatus && matchSearch;
  });

  return `
    <div class="filter-bar">
      <div class="filter-chips">
        ${categories.map(cat => `
          <button class="filter-chip ${activeFilter === cat.id ? 'active' : ''}" data-cat="${cat.id}">
            ${cat.label}
          </button>
        `).join('')}
      </div>

      <div class="filter-actions">
        <select id="select-status-filter" class="form-control" style="width: auto; padding: 7px 12px; font-size: 0.82rem;">
          <option value="all" ${statusFilter === 'all' ? 'selected' : ''}>Tất cả trạng thái</option>
          <option value="active" ${statusFilter === 'active' ? 'selected' : ''}>🟢 Đang hoạt động</option>
          <option value="recruiting" ${statusFilter === 'recruiting' ? 'selected' : ''}>📢 Đang tuyển quân</option>
          <option value="paused" ${statusFilter === 'paused' ? 'selected' : ''}>⏸️ Tạm nghỉ</option>
        </select>

        <button class="btn btn-primary" id="btn-add-club-modal">
          <span>➕</span> Thành lập CLB Mới
        </button>
      </div>
    </div>

    <!-- Results Count -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; font-size: 0.85rem; color: var(--text-secondary);">
      <span>Tìm thấy <strong>${filtered.length}</strong> đội, nhóm, câu lạc bộ tại Trường ĐH Mỏ - Địa chất</span>
      <span style="font-size: 0.78rem; color: var(--text-muted);">Cập nhật học kỳ 1 năm học 2026-2027</span>
    </div>

    <!-- Clubs Grid -->
    ${filtered.length === 0 ? `
      <div class="glass-panel" style="padding: 48px; text-align: center;">
        <span style="font-size: 3rem;">🔍</span>
        <h3 style="font-size: 1.2rem; color: var(--text-main); margin: 12px 0 6px 0;">Không tìm thấy câu lạc bộ phù hợp</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 18px;">Vui lòng thử tìm kiếm với từ khoá khác hoặc bỏ lọc lĩnh vực.</p>
        <button class="btn btn-secondary" id="btn-clear-club-filters">Đặt lại bộ lọc</button>
      </div>
    ` : `
      <div class="clubs-grid">
        ${filtered.map(club => {
          let statusBadge = '';
          if (club.status === 'recruiting') {
            statusBadge = '<span class="club-status-indicator status-recruiting">📢 Đang tuyển quân</span>';
          } else if (club.status === 'active') {
            statusBadge = '<span class="club-status-indicator status-active">🟢 Đang hoạt động</span>';
          } else {
            statusBadge = '<span class="club-status-indicator status-paused">⏸️ Tạm dừng</span>';
          }

          return `
            <div class="club-card" data-club-id="${club.id}">
              <div class="club-card-banner" style="background: ${club.bannerColor || 'linear-gradient(135deg, #1e3a8a, #0f172a)'};">
                <span class="club-badge-category">${club.category}</span>
                ${statusBadge}
              </div>

              <div class="club-card-body">
                <div class="club-header-row">
                  <div class="club-avatar" style="background: ${club.avatarBg || 'var(--primary)'};">
                    ${club.icon || '🏛️'}
                  </div>
                  <div class="club-title-info">
                    <h3 class="club-name" title="${club.name}">${club.name}</h3>
                    <div class="club-acronym">${club.acronym} &bull; ${club.faculty}</div>
                  </div>
                </div>

                <div class="club-slogan">"${club.slogan || 'Cùng nhau phát triển vì sinh viên Mỏ - Địa chất'}"</div>

                <div class="club-metrics">
                  <div class="club-metric-item">
                    <span class="club-metric-label">Chủ nhiệm / Trưởng ban</span>
                    <span class="club-metric-val">${club.leader}</span>
                  </div>
                  <div class="club-metric-item">
                    <span class="club-metric-label">Số thành viên</span>
                    <span class="club-metric-val">👥 ${club.membersCount} SV</span>
                  </div>
                  <div class="club-metric-item">
                    <span class="club-metric-label">Quỹ phong trào</span>
                    <span class="club-metric-val" style="color: var(--humg-gold);">${formatVND(club.fundBalance)}</span>
                  </div>
                  <div class="club-metric-item">
                    <span class="club-metric-label">Đánh giá thi đua</span>
                    <span class="club-metric-val">${renderRatingStars(club.rating)}</span>
                  </div>
                </div>

                <div style="font-size: 0.76rem; color: var(--text-muted); margin-bottom: 14px; display: flex; flex-direction: column; gap: 4px;">
                  <div>📅 <strong>Lịch sinh hoạt:</strong> ${club.meetingSchedule || 'Định kỳ hàng tuần'}</div>
                  <div>📍 <strong>Địa điểm:</strong> ${club.room || 'Phòng sinh hoạt Đoàn - Hội'}</div>
                </div>

                <div class="club-card-footer">
                  <button class="btn btn-primary btn-sm btn-view-club-detail" data-id="${club.id}">
                    <span>🔍</span> Chi tiết & Nhân sự
                  </button>
                  <div style="display: flex; gap: 6px;">
                    <button class="btn btn-secondary btn-sm btn-edit-club" data-id="${club.id}" title="Chỉnh sửa thông tin">
                      <span>✏️</span>
                    </button>
                    <button class="btn btn-danger btn-sm btn-delete-club" data-id="${club.id}" title="Xoá CLB">
                      <span>🗑️</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `}
  `;
}

export function setupClubsEvents(container, state, updateState, openModal, showToast) {
  // Category chip clicks
  const chips = container.querySelectorAll('.filter-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      state.activeFilter = chip.getAttribute('data-cat');
      updateState();
    });
  });

  // Status dropdown filter
  const statusSelect = container.querySelector('#select-status-filter');
  if (statusSelect) {
    statusSelect.addEventListener('change', (e) => {
      state.statusFilter = e.target.value;
      updateState();
    });
  }

  // Clear filters
  const clearBtn = container.querySelector('#btn-clear-club-filters');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      state.activeFilter = 'all';
      state.statusFilter = 'all';
      state.searchQuery = '';
      updateState();
    });
  }

  // Add club button
  const addBtn = container.querySelector('#btn-add-club-modal');
  if (addBtn) {
    addBtn.addEventListener('click', () => openModal('addClub'));
  }

  // View club details
  container.querySelectorAll('.btn-view-club-detail').forEach(btn => {
    btn.addEventListener('click', () => {
      const clubId = btn.getAttribute('data-id');
      openModal('viewClubDetail', clubId);
    });
  });

  // Edit club
  container.querySelectorAll('.btn-edit-club').forEach(btn => {
    btn.addEventListener('click', () => {
      const clubId = btn.getAttribute('data-id');
      openModal('editClub', clubId);
    });
  });

  // Delete club
  container.querySelectorAll('.btn-delete-club').forEach(btn => {
    btn.addEventListener('click', () => {
      const clubId = btn.getAttribute('data-id');
      openModal('deleteClub', clubId);
    });
  });
}
