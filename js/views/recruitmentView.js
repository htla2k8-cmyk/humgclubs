import { formatDate } from '../utils.js';
import { facultiesList } from '../data.js';

export function renderRecruitment(data, activeTab = 'list', filterStatus = 'all') {
  const { recruitments = [], clubs = [] } = data;

  const total = recruitments.length;
  const pending = recruitments.filter(r => r.status === 'pending').length;
  const interviewing = recruitments.filter(r => r.status === 'interviewing').length;
  const accepted = recruitments.filter(r => r.status === 'accepted').length;

  const filtered = recruitments.filter(r => filterStatus === 'all' || r.status === filterStatus);

  return `
    <!-- Recruitment Campaign Header -->
    <div class="glass-panel" style="padding: 24px; margin-bottom: 24px; background: linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(245, 158, 11, 0.1)); border: 1px solid var(--border-hover);">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div>
          <span class="badge badge-warning" style="margin-bottom: 8px;">📢 ĐỢT TUYỂN THÀNH VIÊN K69 - KỲ 1 NĂM HỌC 2026-2027</span>
          <h2 style="font-size: 1.45rem; font-weight: 800; color: var(--text-main); margin-bottom: 6px;">Cổng Tuyển Quân & Duyệt Hồ Sơ Gia Nhập CLB</h2>
          <p style="font-size: 0.88rem; color: var(--text-secondary); max-width: 720px;">
            Quy trình tiếp nhận, phỏng vấn và phê duyệt trực tuyến tân hội viên cho các CLB, Đội, Nhóm trực thuộc Đoàn Thanh niên - Hội Sinh viên HUMG.
          </p>
        </div>

        <div style="display: flex; gap: 10px;">
          <button class="btn ${activeTab === 'list' ? 'btn-primary' : 'btn-secondary'}" id="tab-recruitment-list">
            <span>📋</span> Danh sách hồ sơ (${total})
          </button>
          <button class="btn ${activeTab === 'form' ? 'btn-gold' : 'btn-secondary'}" id="tab-recruitment-form">
            <span>✍️</span> Gửi đơn đăng ký mới
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Bar -->
    <div class="stats-grid" style="margin-bottom: 22px;">
      <div class="stat-card glass-panel" style="padding: 16px;">
        <div class="stat-info">
          <span class="stat-label">Tổng hồ sơ ứng tuyển</span>
          <span class="stat-value" style="font-size: 1.6rem;">${total}</span>
        </div>
        <div class="stat-icon-wrapper stat-icon-blue" style="width: 44px; height: 44px; font-size: 1.2rem;">📝</div>
      </div>

      <div class="stat-card glass-panel" style="padding: 16px;">
        <div class="stat-info">
          <span class="stat-label">Hồ sơ chờ duyệt sơ tuyển</span>
          <span class="stat-value" style="font-size: 1.6rem; color: var(--humg-gold);">${pending}</span>
        </div>
        <div class="stat-icon-wrapper stat-icon-gold" style="width: 44px; height: 44px; font-size: 1.2rem;">⏳</div>
      </div>

      <div class="stat-card glass-panel" style="padding: 16px;">
        <div class="stat-info">
          <span class="stat-label">Đang xếp lịch phỏng vấn</span>
          <span class="stat-value" style="font-size: 1.6rem; color: var(--accent-cyan);">${interviewing}</span>
        </div>
        <div class="stat-icon-wrapper stat-icon-purple" style="width: 44px; height: 44px; font-size: 1.2rem;">🎤</div>
      </div>

      <div class="stat-card glass-panel" style="padding: 16px;">
        <div class="stat-info">
          <span class="stat-label">Đã trúng tuyển chính thức</span>
          <span class="stat-value" style="font-size: 1.6rem; color: var(--accent-emerald);">${accepted}</span>
        </div>
        <div class="stat-icon-wrapper stat-icon-emerald" style="width: 44px; height: 44px; font-size: 1.2rem;">🎉</div>
      </div>
    </div>

    ${activeTab === 'list' ? `
      <!-- Candidate List & Filters -->
      <div class="filter-bar">
        <div class="filter-chips">
          <button class="filter-chip ${filterStatus === 'all' ? 'active' : ''}" data-status="all">Tất cả (${total})</button>
          <button class="filter-chip ${filterStatus === 'pending' ? 'active' : ''}" data-status="pending">⏳ Chờ duyệt (${pending})</button>
          <button class="filter-chip ${filterStatus === 'interviewing' ? 'active' : ''}" data-status="interviewing">🎤 Phỏng vấn (${interviewing})</button>
          <button class="filter-chip ${filterStatus === 'accepted' ? 'active' : ''}" data-status="accepted">✅ Trúng tuyển (${accepted})</button>
        </div>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Ứng viên / MSV</th>
              <th>CLB & Ban Ứng tuyển</th>
              <th>Khoa & Khoá</th>
              <th>Lý do & Kinh nghiệm</th>
              <th>Ngày nộp</th>
              <th>Trạng thái & Lịch hẹn</th>
              <th style="text-align: right;">Quyết định</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0 ? `
              <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
                  Không có hồ sơ nào trong trạng thái này.
                </td>
              </tr>
            ` : filtered.map(item => {
              let statusBadge = '<span class="badge badge-warning">Chờ sơ tuyển</span>';
              if (item.status === 'interviewing') statusBadge = '<span class="badge badge-primary">Đã hẹn PV</span>';
              if (item.status === 'accepted') statusBadge = '<span class="badge badge-success">Đã trúng tuyển</span>';
              if (item.status === 'rejected') statusBadge = '<span class="badge badge-danger">Không đạt</span>';

              return `
                <tr>
                  <td>
                    <div style="font-weight: 700; color: var(--text-main);">${item.fullName}</div>
                    <div style="font-size: 0.72rem; font-family: var(--font-mono); color: var(--text-muted);">
                      MSV: ${item.studentId} &bull; ${item.phone}
                    </div>
                  </td>
                  <td>
                    <strong style="color: var(--text-main);">${item.targetClubName}</strong>
                    <div style="font-size: 0.74rem; color: var(--primary); font-weight: 600;">
                      ${item.departmentPreference || 'Ban Kỹ thuật'}
                    </div>
                  </td>
                  <td>
                    <div style="font-weight: 600; font-size: 0.82rem;">${item.classYear}</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">${item.faculty}</div>
                  </td>
                  <td style="max-width: 260px;">
                    <div style="font-size: 0.8rem; color: var(--text-main); font-weight: 600;">${item.reason}</div>
                    <div style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 2px;">
                      <em>Kinh nghiệm:</em> ${item.experience}
                    </div>
                  </td>
                  <td>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">${formatDate(item.appliedDate)}</span>
                  </td>
                  <td>
                    <div>${statusBadge}</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px;">
                      ${item.interviewTime || 'Chưa xếp lịch'}
                    </div>
                  </td>
                  <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 6px;">
                      ${item.status !== 'accepted' ? `
                        <button class="btn btn-primary btn-sm btn-accept-applicant" data-id="${item.id}" title="Duyệt trúng tuyển và kết nạp">
                          <span>✅ Kết nạp</span>
                        </button>
                      ` : `
                        <span class="badge badge-success">Đã vào CLB</span>
                      `}
                      ${item.status === 'pending' ? `
                        <button class="btn btn-secondary btn-sm btn-schedule-interview" data-id="${item.id}" title="Hẹn phỏng vấn">
                          <span>🎤 Hẹn PV</span>
                        </button>
                      ` : ''}
                      ${item.status !== 'rejected' && item.status !== 'accepted' ? `
                        <button class="btn btn-danger btn-sm btn-reject-applicant" data-id="${item.id}" title="Từ chối">
                          <span>❌</span>
                        </button>
                      ` : ''}
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    ` : `
      <!-- Recruitment Application Form -->
      <div class="glass-panel" style="padding: 32px; max-width: 800px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 2.2rem;">✍️</span>
          <h3 style="font-size: 1.3rem; font-weight: 800; color: var(--text-main); margin-top: 6px;">
            Đơn Đăng Ký Gia Nhập Câu Lạc Bộ Sinh Viên HUMG
          </h3>
          <p style="font-size: 0.85rem; color: var(--text-muted);">
            Điền đầy đủ thông tin để Ban Chủ nhiệm CLB liên hệ và xếp lịch gặp mặt phỏng vấn.
          </p>
        </div>

        <form id="recruitment-application-form">
          <div class="form-grid-2" style="margin-bottom: 16px;">
            <div class="form-group">
              <label class="form-label">Họ và tên sinh viên *</label>
              <input type="text" id="app-fullname" class="form-control" placeholder="Ví dụ: Nguyễn Văn An" required />
            </div>
            <div class="form-group">
              <label class="form-label">Mã số sinh viên (MSV) *</label>
              <input type="text" id="app-studentid" class="form-control" placeholder="Ví dụ: 2421060188 (10 chữ số)" maxlength="10" required />
            </div>
          </div>

          <div class="form-grid-2" style="margin-bottom: 16px;">
            <div class="form-group">
              <label class="form-label">Email trường / cá nhân *</label>
              <input type="email" id="app-email" class="form-control" placeholder="annv.k69@humg.edu.vn" required />
            </div>
            <div class="form-group">
              <label class="form-label">Số điện thoại / Zalo *</label>
              <input type="tel" id="app-phone" class="form-control" placeholder="0987.xxx.xxx" required />
            </div>
          </div>

          <div class="form-grid-2" style="margin-bottom: 16px;">
            <div class="form-group">
              <label class="form-label">Khoa đang theo học *</label>
              <select id="app-faculty" class="form-control" required>
                ${facultiesList.map(f => `<option value="${f}">${f}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Khoá / Lớp niên chế *</label>
              <input type="text" id="app-classyear" class="form-control" placeholder="Ví dụ: K69 - Công nghệ thông tin A" required />
            </div>
          </div>

          <div class="form-grid-2" style="margin-bottom: 16px;">
            <div class="form-group">
              <label class="form-label">Câu lạc bộ muốn gia nhập *</label>
              <select id="app-club" class="form-control" required>
                ${clubs.map(c => `<option value="${c.id}">${c.name} (${c.acronym})</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Ban / Phân ban nguyện vọng *</label>
              <select id="app-department" class="form-control" required>
                <option value="Ban Chuyên môn & Kỹ thuật">Ban Chuyên môn & Kỹ thuật</option>
                <option value="Ban Truyền thông & Media">Ban Truyền thông & Media</option>
                <option value="Ban Sự kiện & Hoạt náo">Ban Sự kiện & Hoạt náo</option>
                <option value="Ban Đối ngoại & Tài trợ">Ban Đối ngoại & Tài trợ</option>
                <option value="Ban Hậu cần & Kỹ thuật sân khấu">Ban Hậu cần & Kỹ thuật sân khấu</option>
              </select>
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 16px;">
            <label class="form-label">Lý do muốn gia nhập câu lạc bộ *</label>
            <textarea id="app-reason" class="form-control" placeholder="Chia sẻ mục tiêu, kỳ vọng và niềm đam mê của bạn khi tham gia..." required></textarea>
          </div>

          <div class="form-group" style="margin-bottom: 24px;">
            <label class="form-label">Kỹ năng đặc biệt hoặc kinh nghiệm đã có (nếu có)</label>
            <textarea id="app-experience" class="form-control" placeholder="Ví dụ: Biết chơi guitar, biết thiết kế Photoshop, kỹ năng MC, kinh nghiệm hoạt động Đoàn trường cấp 3..."></textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 12px;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-app">Hủy bỏ</button>
            <button type="submit" class="btn btn-gold" style="font-weight: 700; padding: 10px 24px;">
              <span>🚀</span> Nộp Hồ Sơ Đăng Ký
            </button>
          </div>
        </form>
      </div>
    `}
  `;
}

export function setupRecruitmentEvents(container, state, updateState, handleApplicantAction, handleNewApplication) {
  // Tabs
  const listTab = container.querySelector('#tab-recruitment-list');
  const formTab = container.querySelector('#tab-recruitment-form');
  const cancelBtn = container.querySelector('#btn-cancel-app');

  if (listTab) {
    listTab.addEventListener('click', () => {
      state.recruitmentTab = 'list';
      updateState();
    });
  }

  if (formTab) {
    formTab.addEventListener('click', () => {
      state.recruitmentTab = 'form';
      updateState();
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      state.recruitmentTab = 'list';
      updateState();
    });
  }

  // Filter chips
  container.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      state.recruitmentStatus = chip.getAttribute('data-status');
      updateState();
    });
  });

  // Accept applicant (automatically adds to member roster!)
  container.querySelectorAll('.btn-accept-applicant').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      handleApplicantAction(id, 'accept');
    });
  });

  // Schedule interview
  container.querySelectorAll('.btn-schedule-interview').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      handleApplicantAction(id, 'interview');
    });
  });

  // Reject applicant
  container.querySelectorAll('.btn-reject-applicant').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      handleApplicantAction(id, 'reject');
    });
  });

  // Form submit
  const form = container.querySelector('#recruitment-application-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const appData = {
        fullName: form.querySelector('#app-fullname').value.trim(),
        studentId: form.querySelector('#app-studentid').value.trim(),
        email: form.querySelector('#app-email').value.trim(),
        phone: form.querySelector('#app-phone').value.trim(),
        faculty: form.querySelector('#app-faculty').value,
        classYear: form.querySelector('#app-classyear').value.trim(),
        targetClubId: form.querySelector('#app-club').value,
        departmentPreference: form.querySelector('#app-department').value,
        reason: form.querySelector('#app-reason').value.trim(),
        experience: form.querySelector('#app-experience').value.trim()
      };
      handleNewApplication(appData);
    });
  }
}
