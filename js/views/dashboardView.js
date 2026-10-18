import { formatVND, formatDate, renderRatingStars } from '../utils.js';

export function renderDashboard(data, navigateTo) {
  const { clubs = [], members = [], events = [], finances = [], activities = [] } = data;

  const totalClubs = clubs.length;
  const activeClubs = clubs.filter(c => c.status === 'active' || c.status === 'recruiting').length;
  const totalMembers = members.length;
  const recruitingClubs = clubs.filter(c => c.status === 'recruiting').length;
  const totalFund = clubs.reduce((acc, c) => acc + (c.fundBalance || 0), 0);
  const upcomingEvents = events.filter(e => e.status === 'upcoming');

  // Category counts
  const categoryCounts = {};
  clubs.forEach(c => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });

  const topClubs = [...clubs].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5);

  return `
    <!-- Hero Showcase Section -->
    <div class="humg-hero-card">
      <img src="assets/images/humg_hero.jpg" alt="Đại học Mỏ - Địa chất Student Clubs" class="humg-hero-img" />
      <div class="humg-hero-overlay">
        <div class="humg-hero-content">
          <span class="humg-hero-badge">🏛️ ĐOÀN THANH NIÊN - HỘI SINH VIÊN HUMG</span>
          <h1 class="humg-hero-title">Hệ Thống Quản Lý Đội, Nhóm & Câu Lạc Bộ Sinh Viên</h1>
          <p class="humg-hero-desc">
            Không gian kết nối, ươm mầm sáng tạo và dẫn dắt phong trào học tập, nghiên cứu khoa học,
            tình nguyện vì cộng đồng của sinh viên Trường Đại học Mỏ - Địa chất.
          </p>
          <div class="humg-hero-actions">
            <button class="btn btn-primary" id="btn-hero-add-club">
              <span>➕</span> Đăng ký thành lập CLB
            </button>
            <button class="btn btn-gold" id="btn-hero-recruitment">
              <span>📢</span> Cổng tuyển thành viên (${recruitingClubs} CLB đang tuyển)
            </button>
            <button class="btn btn-secondary" id="btn-hero-certificate">
              <span>📜</span> Cấp chứng nhận ĐHQG/HUMG
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- KPI Metric Cards -->
    <div class="stats-grid">
      <div class="stat-card glass-panel">
        <div class="stat-info">
          <span class="stat-label">Tổng số Đội / Nhóm / CLB</span>
          <span class="stat-value">${totalClubs}</span>
          <span class="stat-subtext positive">
            <span>🟢</span> ${activeClubs} đơn vị đang hoạt động
          </span>
        </div>
        <div class="stat-icon-wrapper stat-icon-blue">
          <span>🏛️</span>
        </div>
      </div>

      <div class="stat-card glass-panel">
        <div class="stat-info">
          <span class="stat-label">Tổng số Hội viên / Đoàn viên</span>
          <span class="stat-value">${totalMembers * 12 + 450}</span>
          <span class="stat-subtext positive">
            <span>📈</span> +18.5% so với năm học trước
          </span>
        </div>
        <div class="stat-icon-wrapper stat-icon-gold">
          <span>👥</span>
        </div>
      </div>

      <div class="stat-card glass-panel">
        <div class="stat-info">
          <span class="stat-label">Sự kiện & Hoạt động năm học</span>
          <span class="stat-value">${events.length}</span>
          <span class="stat-subtext positive">
            <span>🔥</span> ${upcomingEvents.length} sự kiện sắp diễn ra
          </span>
        </div>
        <div class="stat-icon-wrapper stat-icon-emerald">
          <span>📅</span>
        </div>
      </div>

      <div class="stat-card glass-panel">
        <div class="stat-info">
          <span class="stat-label">Tổng Quỹ Phong trào CLB</span>
          <span class="stat-value" style="font-size: 1.55rem; color: var(--humg-gold);">${formatVND(totalFund)}</span>
          <span class="stat-subtext positive">
            <span>💎</span> Tài trợ & Quỹ đóng góp tích cực
          </span>
        </div>
        <div class="stat-icon-wrapper stat-icon-purple">
          <span>💰</span>
        </div>
      </div>
    </div>

    <!-- Analytics Charts Section -->
    <div class="charts-grid">
      <!-- Category Breakdown Chart -->
      <div class="chart-card glass-panel">
        <div class="chart-header">
          <h3 class="chart-title">
            <span>📊</span> Phân bổ CLB Theo Lĩnh Vực Hoạt Động
          </h3>
          <span class="badge badge-primary">${totalClubs} Đơn vị</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 8px;">
          ${Object.entries(categoryCounts).map(([cat, count]) => {
            const pct = Math.round((count / totalClubs) * 100);
            let barColor = 'var(--primary)';
            if (cat.includes('Tình nguyện')) barColor = 'var(--accent-emerald)';
            if (cat.includes('Văn hoá')) barColor = 'var(--accent-rose)';
            if (cat.includes('Thể dục')) barColor = '#16a34a';
            if (cat.includes('Khởi nghiệp')) barColor = 'var(--humg-gold)';

            return `
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; margin-bottom: 6px;">
                  <span style="color: var(--text-main);">${cat}</span>
                  <span style="color: var(--text-muted);">${count} CLB (${pct}%)</span>
                </div>
                <div style="height: 10px; background: var(--bg-badge); border-radius: var(--radius-full); overflow: hidden;">
                  <div style="width: ${pct}%; height: 100%; background: ${barColor}; border-radius: var(--radius-full); transition: width 0.8s ease;"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="chart-legend">
          <div class="legend-item"><span class="legend-dot" style="background: var(--primary);"></span> Học thuật</div>
          <div class="legend-item"><span class="legend-dot" style="background: var(--accent-emerald);"></span> Tình nguyện</div>
          <div class="legend-item"><span class="legend-dot" style="background: var(--accent-rose);"></span> Nghệ thuật</div>
          <div class="legend-item"><span class="legend-dot" style="background: #16a34a;"></span> Thể thao</div>
          <div class="legend-item"><span class="legend-dot" style="background: var(--humg-gold);"></span> Khởi nghiệp</div>
        </div>
      </div>

      <!-- Events Attendance & Growth Chart -->
      <div class="chart-card glass-panel">
        <div class="chart-header">
          <h3 class="chart-title">
            <span>📈</span> Lượt Sinh Viên Tham Gia Sự Kiện (2026)
          </h3>
          <span class="badge badge-success">Học kỳ 1</span>
        </div>

        <div class="bars-container">
          <div class="bar-group">
            <div class="bar-fill" style="height: 45%; background: linear-gradient(180deg, var(--primary), #1e40af);" data-tooltip="Tháng 8: 420 lượt SV"></div>
            <span class="bar-label">Tháng 8</span>
          </div>
          <div class="bar-group">
            <div class="bar-fill" style="height: 65%; background: linear-gradient(180deg, var(--accent-cyan), #0284c7);" data-tooltip="Tháng 9: 780 lượt SV"></div>
            <span class="bar-label">Tháng 9</span>
          </div>
          <div class="bar-group">
            <div class="bar-fill" style="height: 95%; background: linear-gradient(180deg, var(--humg-gold), #d97706);" data-tooltip="Tháng 10 (Chào K69): 1.650 SV"></div>
            <span class="bar-label">Tháng 10</span>
          </div>
          <div class="bar-group">
            <div class="bar-fill" style="height: 75%; background: linear-gradient(180deg, var(--accent-purple), #7c3aed);" data-tooltip="Tháng 11 (Dự kiến): 1.100 SV"></div>
            <span class="bar-label">Tháng 11</span>
          </div>
          <div class="bar-group">
            <div class="bar-fill" style="height: 60%; background: linear-gradient(180deg, var(--accent-emerald), #059669);" data-tooltip="Tháng 12 (Dự kiến): 850 SV"></div>
            <span class="bar-label">Tháng 12</span>
          </div>
        </div>
        <p style="font-size: 0.78rem; color: var(--text-muted); margin-top: 14px; text-align: center;">
          💡 Tháng 10 đạt đỉnh cao kỷ lục với chuỗi hoạt động chào đón Tân sinh viên K69 và ngày hội Kick-off.
        </p>
      </div>
    </div>

    <!-- Leaderboard and Activity Feed -->
    <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 24px; margin-bottom: 24px;">
      <!-- Top Clubs Leaderboard -->
      <div class="glass-panel" style="padding: 22px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px;">
          <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
            <span>🏆</span> Bảng Xếp Hạng Thi Đua CLB Tiêu Biểu
          </h3>
          <button class="btn btn-secondary btn-sm" id="btn-view-all-clubs">Xem tất cả CLB</button>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Xếp hạng</th>
                <th>Câu lạc bộ / Đội nhóm</th>
                <th>Chủ nhiệm</th>
                <th>Thành viên</th>
                <th>Đánh giá</th>
              </tr>
            </thead>
            <tbody>
              ${topClubs.map((club, idx) => {
                const rankBadge = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
                return `
                  <tr>
                    <td style="font-weight: 800; font-size: 1.1rem; text-align: center; width: 60px;">${rankBadge}</td>
                    <td>
                      <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.3rem;">${club.icon}</span>
                        <div>
                          <strong style="color: var(--text-main);">${club.name}</strong>
                          <div style="font-size: 0.72rem; color: var(--primary); font-weight: 700;">${club.acronym} &bull; ${club.category}</div>
                        </div>
                      </div>
                    </td>
                    <td>${club.leader}</td>
                    <td><strong>${club.membersCount}</strong> SV</td>
                    <td>${renderRatingStars(club.rating)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Activity Feed -->
      <div class="glass-panel" style="padding: 22px; display: flex; flex-direction: column;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px;">
          <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
            <span>🔔</span> Thông Báo & Hoạt Động Mới
          </h3>
          <span class="badge badge-warning">Trực tiếp</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 14px; flex: 1;">
          ${activities.map(act => `
            <div style="display: flex; gap: 12px; padding: 12px; border-radius: var(--radius-md); background: var(--bg-badge); border: 1px solid var(--border-subtle);">
              <span style="font-size: 1.4rem; flex-shrink: 0;">${act.icon}</span>
              <div style="flex: 1; min-width: 0;">
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                  <strong style="font-size: 0.88rem; color: var(--text-main);">${act.title}</strong>
                  <span style="font-size: 0.72rem; color: var(--text-muted);">${act.time}</span>
                </div>
                <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4;">${act.desc}</p>
              </div>
            </div>
          `).join('')}
        </div>

        <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.8rem; color: var(--text-muted);">Hệ thống đồng bộ Đoàn trường HUMG</span>
          <button class="btn btn-primary btn-sm" id="btn-quick-events">
            <span>📅</span> Xem Lịch Sự Kiện
          </button>
        </div>
      </div>
    </div>
  `;
}

export function setupDashboardEvents(container, navigateTo, openModal) {
  const addClubBtn = container.querySelector('#btn-hero-add-club');
  if (addClubBtn) {
    addClubBtn.addEventListener('click', () => openModal('addClub'));
  }

  const recBtn = container.querySelector('#btn-hero-recruitment');
  if (recBtn) {
    recBtn.addEventListener('click', () => navigateTo('recruitment'));
  }

  const certBtn = container.querySelector('#btn-hero-certificate');
  if (certBtn) {
    certBtn.addEventListener('click', () => navigateTo('certificate'));
  }

  const viewAllBtn = container.querySelector('#btn-view-all-clubs');
  if (viewAllBtn) {
    viewAllBtn.addEventListener('click', () => navigateTo('clubs'));
  }

  const quickEventsBtn = container.querySelector('#btn-quick-events');
  if (quickEventsBtn) {
    quickEventsBtn.addEventListener('click', () => navigateTo('events'));
  }
}
