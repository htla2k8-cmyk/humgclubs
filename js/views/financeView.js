import { formatVND, formatDate, exportToCSV } from '../utils.js';

export function renderFinance(data, state = {}) {
  const { finances = [], clubs = [] } = data;
  const { clubFilter = 'all', typeFilter = 'all' } = state;

  const totalIncome = finances
    .filter(f => f.type === 'income')
    .reduce((sum, f) => sum + (f.amount || 0), 0);

  const totalExpense = finances
    .filter(f => f.type === 'expense')
    .reduce((sum, f) => sum + (f.amount || 0), 0);

  const netBalance = totalIncome - totalExpense;

  let filtered = finances.filter(f => {
    const matchClub = clubFilter === 'all' || f.clubId === clubFilter;
    const matchType = typeFilter === 'all' || f.type === typeFilter;
    return matchClub && matchType;
  });

  return `
    <!-- Finance KPI Cards -->
    <div class="stats-grid" style="margin-bottom: 24px;">
      <div class="stat-card glass-panel">
        <div class="stat-info">
          <span class="stat-label">Tổng Thu Phong Trào (Kỳ 1)</span>
          <span class="stat-value" style="color: var(--accent-emerald); font-size: 1.6rem;">${formatVND(totalIncome)}</span>
          <span class="stat-subtext positive">Tài trợ + Quỹ hội viên + Đoàn trường</span>
        </div>
        <div class="stat-icon-wrapper stat-icon-emerald">📈</div>
      </div>

      <div class="stat-card glass-panel">
        <div class="stat-info">
          <span class="stat-label">Tổng Chi Hoạt Động & Sự Kiện</span>
          <span class="stat-value" style="color: var(--accent-rose); font-size: 1.6rem;">${formatVND(totalExpense)}</span>
          <span class="stat-subtext" style="color: var(--text-muted);">Tổ chức sự kiện, đạo cụ & in ấn</span>
        </div>
        <div class="stat-icon-wrapper stat-icon-purple">📉</div>
      </div>

      <div class="stat-card glass-panel">
        <div class="stat-info">
          <span class="stat-label">Số Dư Quỹ Phong Trào Khả Dụng</span>
          <span class="stat-value" style="color: var(--humg-gold); font-size: 1.6rem;">${formatVND(netBalance)}</span>
          <span class="stat-subtext positive">Tài chính an toàn & minh bạch</span>
        </div>
        <div class="stat-icon-wrapper stat-icon-gold">💎</div>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar">
      <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
        <select id="finance-club-select" class="form-control" style="width: auto; min-width: 200px;">
          <option value="all" ${clubFilter === 'all' ? 'selected' : ''}>Tất cả CLB / Đội nhóm</option>
          ${clubs.map(c => `
            <option value="${c.id}" ${clubFilter === c.id ? 'selected' : ''}>${c.name} (${c.acronym})</option>
          `).join('')}
        </select>

        <div class="filter-chips">
          <button class="filter-chip ${typeFilter === 'all' ? 'active' : ''}" data-type="all">Tất cả giao dịch</button>
          <button class="filter-chip ${typeFilter === 'income' ? 'active' : ''}" data-type="income">🟢 Khoản Thu</button>
          <button class="filter-chip ${typeFilter === 'expense' ? 'active' : ''}" data-type="expense">🔴 Khoản Chi</button>
        </div>
      </div>

      <div class="filter-actions">
        <button class="btn btn-secondary" id="btn-export-finance-csv">
          <span>📊</span> Báo Cáo Sổ Quỹ (CSV)
        </button>
        <button class="btn btn-primary" id="btn-add-finance-modal">
          <span>➕</span> Lập Phiếu Thu / Chi Mới
        </button>
      </div>
    </div>

    <!-- Finance Table -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 40px; text-align: center;">STT</th>
            <th>Loại giao dịch</th>
            <th>Câu lạc bộ</th>
            <th>Danh mục thu/chi</th>
            <th>Nội dung diễn giải</th>
            <th>Số tiền (VNĐ)</th>
            <th>Ngày ghi sổ</th>
            <th>Trạng thái</th>
            <th style="text-align: right;">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.length === 0 ? `
            <tr>
              <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-muted);">
                Chưa có giao dịch tài chính nào trong bộ lọc này.
              </td>
            </tr>
          ` : filtered.map((f, i) => {
            const isIncome = f.type === 'income';
            return `
              <tr>
                <td style="text-align: center; font-weight: 700; color: var(--text-muted);">${i + 1}</td>
                <td>
                  <span class="badge ${isIncome ? 'badge-success' : 'badge-danger'}">
                    ${isIncome ? '🟢 Thu vào' : '🔴 Chi ra'}
                  </span>
                </td>
                <td>
                  <strong style="color: var(--text-main); font-size: 0.86rem;">${f.clubName}</strong>
                </td>
                <td>
                  <span style="font-weight: 600; font-size: 0.82rem; color: var(--text-secondary);">${f.category}</span>
                </td>
                <td style="max-width: 320px;">
                  <div style="font-size: 0.84rem; color: var(--text-main);">${f.description}</div>
                </td>
                <td>
                  <strong style="font-size: 0.95rem; font-family: var(--font-mono); color: ${isIncome ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">
                    ${isIncome ? '+' : '-'}${formatVND(f.amount)}
                  </strong>
                </td>
                <td>
                  <span style="font-size: 0.82rem; color: var(--text-muted);">${formatDate(f.date)}</span>
                </td>
                <td>
                  <span class="badge badge-success">Đã đối soát</span>
                </td>
                <td style="text-align: right;">
                  <button class="btn btn-danger btn-sm btn-delete-finance" data-id="${f.id}" title="Xoá bản ghi">
                    <span>🗑️</span>
                  </button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

export function setupFinanceHandlers(container, state, updateState, openModal, showToast, data) {
  // Club select
  const clubSelect = container.querySelector('#finance-club-select');
  if (clubSelect) {
    clubSelect.addEventListener('change', (e) => {
      state.financeClub = e.target.value;
      updateState();
    });
  }

  // Type chips
  container.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      state.financeType = chip.getAttribute('data-type');
      updateState();
    });
  });

  // Add finance modal
  const addBtn = container.querySelector('#btn-add-finance-modal');
  if (addBtn) {
    addBtn.addEventListener('click', () => openModal('addFinance'));
  }

  // Export CSV
  const exportBtn = container.querySelector('#btn-export-finance-csv');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const headers = ['STT', 'Loại Giao Dịch', 'Câu Lạc Bộ', 'Danh Mục', 'Nội Dung', 'Số Tiền (VND)', 'Ngày Ghi Sổ'];
      const rows = data.finances.map((f, i) => [
        i + 1,
        f.type === 'income' ? 'Thu' : 'Chi',
        f.clubName,
        f.category,
        f.description,
        f.amount,
        f.date
      ]);
      exportToCSV(`So_Quy_Tai_Chinh_CLB_HUMG_${new Date().toISOString().slice(0, 10)}`, rows, headers);
      showToast('Đã xuất báo cáo sổ quỹ thành công!', 'success');
    });
  }

  // Delete transaction
  container.querySelectorAll('.btn-delete-finance').forEach(btn => {
    btn.addEventListener('click', () => {
      const finId = btn.getAttribute('data-id');
      openModal('deleteFinance', finId);
    });
  });
}
