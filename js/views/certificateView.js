import { formatDate } from '../utils.js';

export function renderCertificate(data, selectedMemberId = null) {
  const { members = [], clubs = [] } = data;

  const defaultMember = selectedMemberId
    ? members.find(m => m.id === selectedMemberId)
    : members[0];

  const studentName = defaultMember ? defaultMember.fullName : 'Nguyễn Hoàng Long';
  const studentId = defaultMember ? defaultMember.studentId : '2121060129';
  const clubName = defaultMember ? defaultMember.clubName : 'CLB Tin học HUMG';
  const faculty = defaultMember ? defaultMember.faculty : 'Khoa Công nghệ thông tin';
  const classYear = defaultMember ? defaultMember.classYear : 'K66 - Tin học A';
  const role = defaultMember ? defaultMember.role : 'Chủ nhiệm CLB';

  return `
    <!-- Top Action Bar -->
    <div class="glass-panel" style="padding: 20px; margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div>
          <h2 style="font-size: 1.35rem; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
            <span>📜</span> Cấp Giấy Khen & Chứng Nhận Hoạt Động Đoàn - Hội HUMG
          </h2>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">
            Hệ thống cấp chứng nhận điện tử có con dấu số và mã QR xác thực phục vụ cộng Điểm Rèn Luyện (ĐRL) cho sinh viên Trường ĐH Mỏ - Địa chất.
          </p>
        </div>

        <div style="display: flex; gap: 10px;">
          <button class="btn btn-secondary" id="btn-print-certificate">
            <span>🖨️</span> In / Lưu PDF Chứng nhận
          </button>
        </div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 340px 1fr; gap: 24px;">
      <!-- Controls Form -->
      <div class="glass-panel" style="padding: 22px; height: fit-content;">
        <h3 style="font-size: 1.05rem; font-weight: 800; color: var(--text-main); margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
          <span>⚙️</span> Tuỳ chỉnh thông tin
        </h3>

        <div class="form-group" style="margin-bottom: 14px;">
          <label class="form-label">Chọn hội viên từ danh sách</label>
          <select id="cert-select-member" class="form-control">
            ${members.map(m => `
              <option value="${m.id}" ${defaultMember && defaultMember.id === m.id ? 'selected' : ''}>
                ${m.fullName} (${m.studentId}) - ${m.clubName}
              </option>
            `).join('')}
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 14px;">
          <label class="form-label">Loại văn bản chứng nhận</label>
          <select id="cert-type" class="form-control">
            <option value="khen">🏆 GIẤY KHEN THÀNH TÍCH XUẤT SẮC</option>
            <option value="chungnhan">📜 GIẤY CHỨNG NHẬN ĐÓNG GÓP TÍCH CỰC</option>
            <option value="hoanthanh">🎖️ CHỨNG NHẬN HOÀN THÀNH NHIỆM KỲ CLB</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 14px;">
          <label class="form-label">Họ và tên người nhận</label>
          <input type="text" id="cert-input-name" class="form-control" value="${studentName}" />
        </div>

        <div class="form-group" style="margin-bottom: 14px;">
          <label class="form-label">Mã số sinh viên (MSV)</label>
          <input type="text" id="cert-input-msv" class="form-control" value="${studentId}" />
        </div>

        <div class="form-group" style="margin-bottom: 14px;">
          <label class="form-label">Lớp & Khoá</label>
          <input type="text" id="cert-input-class" class="form-control" value="${classYear}" />
        </div>

        <div class="form-group" style="margin-bottom: 14px;">
          <label class="form-label">Khoa</label>
          <input type="text" id="cert-input-faculty" class="form-control" value="${faculty}" />
        </div>

        <div class="form-group" style="margin-bottom: 14px;">
          <label class="form-label">Câu lạc bộ & Chức vụ</label>
          <input type="text" id="cert-input-club" class="form-control" value="${role} - ${clubName}" />
        </div>

        <div class="form-group" style="margin-bottom: 14px;">
          <label class="form-label">Thành tích / Nội dung tuyên dương</label>
          <textarea id="cert-input-reason" class="form-control" style="min-height: 70px;">Đã có thành tích xuất sắc và đóng góp nổi bật trong công tác Đoàn - Hội và phong trào thanh niên sinh viên Trường Đại học Mỏ - Địa chất Năm học 2026 - 2027.</textarea>
        </div>

        <div class="form-group" style="margin-bottom: 18px;">
          <label class="form-label">Ngày ký quyết định</label>
          <input type="date" id="cert-input-date" class="form-control" value="${new Date().toISOString().slice(0, 10)}" />
        </div>

        <button class="btn btn-primary" id="btn-update-cert-preview" style="width: 100%;">
          <span>🔄</span> Cập nhật bản in
        </button>
      </div>

      <!-- Live Certificate Frame -->
      <div class="glass-panel" style="padding: 20px; overflow: hidden; background: rgba(0,0,0,0.2);">
        <div class="certificate-preview-box" id="certificate-print-area">
          <!-- Official Crest -->
          <img src="assets/images/humg_logo.png" alt="HUMG Crest Logo" class="certificate-logo-crest" />

          <div class="certificate-header-sub">
            ĐOÀN TNCS HỒ CHÍ MINH - HỘI SINH VIÊN VIỆT NAM<br>
            BAN CHẤP HÀNH ĐOÀN TRƯỜNG ĐẠI HỌC MỎ - ĐỊA CHẤT
          </div>

          <div style="width: 120px; height: 2px; background: #b45309; margin: 6px auto 14px auto;"></div>

          <div class="certificate-title-large" id="cert-display-title">
            GIẤY KHEN
          </div>

          <div class="certificate-body-text">
            BAN THƯỜNG VỤ ĐOÀN TRƯỜNG ĐẠI HỌC MỎ - ĐỊA CHẤT<br>
            <strong>TẶNG THƯỞNG</strong>
          </div>

          <div class="certificate-recipient" id="cert-display-name">
            ${studentName}
          </div>

          <div style="text-align: center; font-size: 1.05rem; font-style: italic; margin-bottom: 12px; color: #334155;">
            MSV: <span id="cert-display-msv">${studentId}</span> &bull; Lớp: <span id="cert-display-class">${classYear}</span> &bull; <span id="cert-display-faculty">${faculty}</span><br>
            <strong id="cert-display-club" style="color: #0b2545;">${role} - ${clubName}</strong>
          </div>

          <div class="certificate-body-text" id="cert-display-reason" style="max-width: 650px; margin: 0 auto 20px auto; font-size: 1.1rem; line-height: 1.6;">
            Đã có thành tích xuất sắc và đóng góp nổi bật trong công tác Đoàn - Hội và phong trào thanh niên sinh viên Trường Đại học Mỏ - Địa chất Năm học 2026 - 2027.
          </div>

          <!-- Signatures & Official Stamp -->
          <div class="certificate-signatures">
            <div class="cert-sig-block" style="text-align: left;">
              <div style="font-size: 0.8rem; font-family: monospace; color: #475569; margin-bottom: 4px;">
                MÃ XÁC THỰC: <strong>HUMG-CERT-2026-${studentId}</strong>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 60px; height: 60px; background: #f1f5f9; border: 1px solid #cbd5e1; display: flex; align-items: center; justify-content: center; font-size: 1.8rem;">
                  🏁
                </div>
                <div style="font-size: 0.75rem; color: #64748b; line-height: 1.3;">
                  Quét mã QR để kiểm tra tính hợp lệ<br>
                  trên Cổng thông tin Hội Sinh viên HUMG
                </div>
              </div>
            </div>

            <div class="cert-sig-block" style="text-align: center;">
              <div style="font-size: 0.92rem; font-style: italic; margin-bottom: 4px;">
                Hà Nội, <span id="cert-display-date">ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}</span>
              </div>
              <div class="cert-sig-title">
                TM. BAN CHẤP HÀNH ĐOÀN TRƯỜNG<br>
                BÍ THƯ ĐOÀN THANH NIÊN
              </div>

              <!-- Digital Red Seal Stamp -->
              <div style="position: relative; height: 65px; margin: 10px auto; display: flex; align-items: center; justify-content: center;">
                <div style="border: 2px solid #dc2626; border-radius: 50%; width: 75px; height: 75px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #dc2626; font-size: 0.55rem; font-weight: bold; transform: rotate(-10deg); opacity: 0.85; pointer-events: none;">
                  <span>ĐOÀN TNCS</span>
                  <span>ĐH MỎ - ĐỊA CHẤT</span>
                  <span>★ HÀ NỘI ★</span>
                </div>
              </div>

              <div class="cert-sig-name">
                TS. Nguyễn Tuấn Cường
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function setupCertificateHandlers(container, data, showToast) {
  const memberSelect = container.querySelector('#cert-select-member');
  const typeSelect = container.querySelector('#cert-type');
  const nameInput = container.querySelector('#cert-input-name');
  const msvInput = container.querySelector('#cert-input-msv');
  const classInput = container.querySelector('#cert-input-class');
  const facultyInput = container.querySelector('#cert-input-faculty');
  const clubInput = container.querySelector('#cert-input-club');
  const reasonInput = container.querySelector('#cert-input-reason');
  const dateInput = container.querySelector('#cert-input-date');
  const updateBtn = container.querySelector('#btn-update-cert-preview');
  const printBtn = container.querySelector('#btn-print-certificate');

  // Change member from select dropdown
  if (memberSelect) {
    memberSelect.addEventListener('change', (e) => {
      const selected = data.members.find(m => m.id === e.target.value);
      if (selected) {
        nameInput.value = selected.fullName;
        msvInput.value = selected.studentId;
        classInput.value = selected.classYear || 'K67';
        facultyInput.value = selected.faculty;
        clubInput.value = `${selected.role} - ${selected.clubName}`;
        refreshPreview();
      }
    });
  }

  function refreshPreview() {
    container.querySelector('#cert-display-name').textContent = nameInput.value;
    container.querySelector('#cert-display-msv').textContent = msvInput.value;
    container.querySelector('#cert-display-class').textContent = classInput.value;
    container.querySelector('#cert-display-faculty').textContent = facultyInput.value;
    container.querySelector('#cert-display-club').textContent = clubInput.value;
    container.querySelector('#cert-display-reason').textContent = reasonInput.value;

    const certTitle = typeSelect.value === 'chungnhan' ? 'GIẤY CHỨNG NHẬN' : typeSelect.value === 'hoanthanh' ? 'CHỨNG NHẬN NHIỆM KỲ' : 'GIẤY KHEN';
    container.querySelector('#cert-display-title').textContent = certTitle;

    if (dateInput.value) {
      const d = new Date(dateInput.value);
      container.querySelector('#cert-display-date').textContent = `ngày ${d.getDate()} tháng ${d.getMonth() + 1} năm ${d.getFullYear()}`;
    }
  }

  if (updateBtn) {
    updateBtn.addEventListener('click', () => {
      refreshPreview();
      showToast('Đã cập nhật bản xem trước chứng nhận!', 'success');
    });
  }

  if (typeSelect) {
    typeSelect.addEventListener('change', refreshPreview);
  }

  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
}
