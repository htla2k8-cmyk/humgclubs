import { formatVND, formatDate } from '../utils.js';

export function renderEvents(data, filter = 'all', searchQuery = '') {
  const { events = [] } = data;

  let filtered = events.filter(e => {
    const matchFilter = filter === 'all' || e.status === filter;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q ||
      e.title.toLowerCase().includes(q) ||
      e.clubName.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q);

    return matchFilter && matchSearch;
  });

  return `
    <div class="filter-bar">
      <div class="filter-chips">
        <button class="filter-chip ${filter === 'all' ? 'active' : ''}" data-filter="all">Tất cả sự kiện (${events.length})</button>
        <button class="filter-chip ${filter === 'upcoming' ? 'active' : ''}" data-filter="upcoming">⏳ Sắp diễn ra</button>
        <button class="filter-chip ${filter === 'completed' ? 'active' : ''}" data-filter="completed">✅ Đã hoàn thành</button>
      </div>

      <div class="filter-actions">
        <button class="btn btn-gold" id="btn-qr-checkin-modal">
          <span>📲</span> Điểm danh QR Code
        </button>
        <button class="btn btn-primary" id="btn-add-event-modal">
          <span>➕</span> Tạo Sự Kiện Mới
        </button>
      </div>
    </div>

    <!-- Events Grid -->
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 24px;">
      ${filtered.length === 0 ? `
        <div class="glass-panel" style="grid-column: 1 / -1; padding: 48px; text-align: center;">
          <span style="font-size: 3rem;">📅</span>
          <h3 style="color: var(--text-main); margin-top: 10px;">Không có sự kiện nào</h3>
          <p style="color: var(--text-muted); font-size: 0.88rem;">Hãy tạo sự kiện mới hoặc thay đổi bộ lọc tìm kiếm.</p>
        </div>
      ` : filtered.map(ev => {
        let statusBadge = '<span class="badge badge-primary">Sắp diễn ra</span>';
        if (ev.status === 'completed') statusBadge = '<span class="badge badge-success">Đã hoàn thành</span>';
        if (ev.status === 'ongoing') statusBadge = '<span class="badge badge-warning">Đang diễn ra</span>';

        const attendeesPct = Math.min(100, Math.round(((ev.attendeesCount || 0) / (ev.maxAttendees || 100)) * 100));

        return `
          <div class="glass-panel" style="display: flex; flex-direction: column; padding: 22px; position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
              <span class="badge badge-purple">${ev.category || 'Học thuật'}</span>
              ${statusBadge}
            </div>

            <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main); line-height: 1.35; margin-bottom: 10px;">
              ${ev.title}
            </h3>

            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--primary); font-weight: 700; margin-bottom: 12px;">
              <span>🏛️ Chủ trì:</span>
              <span>${ev.clubName}</span>
            </div>

            <p style="font-size: 0.84rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 16px; flex: 1;">
              ${ev.description}
            </p>

            <div style="background: var(--bg-badge); padding: 12px; border-radius: var(--radius-md); font-size: 0.8rem; margin-bottom: 16px; display: flex; flex-direction: column; gap: 6px;">
              <div>📅 <strong>Thời gian:</strong> ${formatDate(ev.date)} &bull; ${ev.time || 'Cả ngày'}</div>
              <div>📍 <strong>Địa điểm:</strong> ${ev.location}</div>
              <div>💰 <strong>Kinh phí tổ chức:</strong> ${formatVND(ev.budget)}</div>
              <div>⭐ <strong>Điểm rèn luyện tích luỹ:</strong> <span style="color: var(--accent-emerald); font-weight: 700;">+${ev.trainingPointsReward || 10} điểm</span></div>
            </div>

            <!-- Capacity progress bar -->
            <div style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 600; margin-bottom: 4px;">
                <span style="color: var(--text-secondary);">Số lượng người tham gia</span>
                <span style="color: var(--text-main);">${ev.attendeesCount} / ${ev.maxAttendees} SV (${attendeesPct}%)</span>
              </div>
              <div style="height: 6px; background: var(--bg-badge); border-radius: var(--radius-full); overflow: hidden;">
                <div style="width: ${attendeesPct}%; height: 100%; background: ${attendeesPct >= 90 ? 'var(--humg-gold)' : 'var(--primary)'}; border-radius: var(--radius-full);"></div>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid var(--border-subtle);">
              <button class="btn btn-secondary btn-sm btn-qr-single-event" data-id="${ev.id}">
                <span>📲</span> Quét điểm danh
              </button>
              <div style="display: flex; gap: 6px;">
                <button class="btn btn-secondary btn-sm btn-edit-event" data-id="${ev.id}" title="Sửa sự kiện">
                  <span>✏️</span>
                </button>
                <button class="btn btn-danger btn-sm btn-delete-event" data-id="${ev.id}" title="Xoá sự kiện">
                  <span>🗑️</span>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

export function setupEventsHandlers(container, state, updateState, openModal) {
  // Filter chips
  container.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      state.eventFilter = chip.getAttribute('data-filter');
      updateState();
    });
  });

  // Add event button
  const addBtn = container.querySelector('#btn-add-event-modal');
  if (addBtn) {
    addBtn.addEventListener('click', () => openModal('addEvent'));
  }

  // QR Checkin modal
  const qrBtn = container.querySelector('#btn-qr-checkin-modal');
  if (qrBtn) {
    qrBtn.addEventListener('click', () => openModal('qrCheckin'));
  }

  // Single event QR checkin
  container.querySelectorAll('.btn-qr-single-event').forEach(btn => {
    btn.addEventListener('click', () => {
      const eventId = btn.getAttribute('data-id');
      openModal('qrCheckin', eventId);
    });
  });

  // Edit event
  container.querySelectorAll('.btn-edit-event').forEach(btn => {
    btn.addEventListener('click', () => {
      const eventId = btn.getAttribute('data-id');
      openModal('editEvent', eventId);
    });
  });

  // Delete event
  container.querySelectorAll('.btn-delete-event').forEach(btn => {
    btn.addEventListener('click', () => {
      const eventId = btn.getAttribute('data-id');
      openModal('deleteEvent', eventId);
    });
  });
}
