/**
 * Utility functions for HUMG Clubs Manager
 */

export function formatVND(amount) {
  if (typeof amount !== 'number') {
    amount = Number(amount) || 0;
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function generateId(prefix = 'item') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
}

export function sanitizeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  };

  const icon = iconMap[type] || '🔔';

  toast.innerHTML = `
    <span style="font-size: 1.2rem;">${icon}</span>
    <div style="flex: 1;">${sanitizeHTML(message)}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease-out';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
}

export function exportToCSV(filename, rows, headers) {
  // Add UTF-8 BOM so Microsoft Excel renders Vietnamese characters correctly
  let csvContent = "\uFEFF";
  csvContent += headers.join(",") + "\r\n";

  rows.forEach(row => {
    const formattedRow = row.map(cell => {
      let cellStr = cell === null || cell === undefined ? "" : String(cell);
      // Escape double quotes
      cellStr = cellStr.replace(/"/g, '""');
      if (cellStr.search(/("|,|\n)/g) >= 0) {
        cellStr = `"${cellStr}"`;
      }
      return cellStr;
    });
    csvContent += formattedRow.join(",") + "\r\n";
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function renderRatingStars(rating) {
  const num = parseFloat(rating) || 5.0;
  const fullStars = Math.floor(num);
  let starsHtml = '';
  for (let i = 0; i < fullStars; i++) {
    starsHtml += '⭐';
  }
  return `<span title="${num}/5.0 sao">${starsHtml} <strong style="color: var(--humg-gold);">${num.toFixed(1)}</strong></span>`;
}
