/**
 * 格式化日期
 * @param {Date|string|number} date
 * @param {string} [format='YYYY-MM-DD HH:mm:ss']
 * @returns {string}
 */
export function formatDate(date, format = "YYYY-MM-DD HH:mm:ss") {
  if (!date) return "";
  const d = new Date(date);

  if (isNaN(d.getTime())) {
    console.warn("Invalid date input:", date);
    return "";
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  return format
    .replace("YYYY", year)
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes)
    .replace("ss", seconds);
}

/**
 * 格式化日期為簡短格式 (MM/DD)
 * @param {Date|string|number} date - 日期
 * @returns {string} 格式化後的日期字符串
 */
export function formatShortDate(date) {
  if (!date) return "";
  return formatDate(date, "MM/DD");
}

/**
 * 格式化貨幣
 * @param {number} amount
 * @param {string} [currency='TWD']
 * @returns {string}
 */
export function formatCurrency(amount, currency = "TWD") {
  if (typeof amount !== "number") return "";
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0
  }).format(amount);
}

/**
 * 簡單格式化價格 (使用固定前綴)
 * @param {Number} price - 價格
 * @param {String} currency - 貨幣符號，默認為 NT$
 * @returns {String} 格式化後的價格字符串
 */
export function formatPrice(price, currency = "NT$") {
  if (price === undefined || price === null) return "";
  return `${currency} ${price.toLocaleString()}`;
}

/**
 * 根據進度百分比獲取對應的顏色
 * @param {Number} progress - 進度百分比 (0-100)
 * @returns {String} 顏色代碼
 */
export function getProgressColor(progress) {
  if (progress < 30) return "#909399"; // 灰色
  if (progress < 70) return "#409EFF"; // 藍色
  return "#67C23A"; // 綠色
}

/**
 * 計算折扣百分比
 * @param {Number} currentPrice - 當前價格
 * @param {Number} originalPrice - 原價
 * @returns {String} 折扣百分比字符串
 */
export function calculateDiscount(currentPrice, originalPrice) {
  if (!currentPrice || !originalPrice || currentPrice >= originalPrice) {
    return "";
  }

  const discount = Math.round((1 - currentPrice / originalPrice) * 100);
  return `-${discount}%`;
}

/**
 * 格式化剩餘時間（天/小時/分鐘）
 * @param {Date|String} endDate - 結束日期
 * @returns {String} 格式化後的剩餘時間
 */
export function formatRemainingTime(endDate) {
  const end = new Date(endDate);
  const now = new Date();

  if (isNaN(end.getTime())) {
    return "";
  }

  // 計算時間差（毫秒）
  const diff = end - now;

  if (diff <= 0) {
    return "已結束";
  }

  // 計算天數、小時和分鐘
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `剩餘 ${days} 天`;
  } else if (hours > 0) {
    return `剩餘 ${hours} 小時`;
  } else {
    return `剩餘 ${minutes} 分鐘`;
  }
}

/**
 * 計算兩個日期之間的天數差
 * @param {Date|String} startDate - 開始日期
 * @param {Date|String} endDate - 結束日期
 * @returns {Number} 天數差
 */
export function getDaysDifference(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 0;
  }

  // 將時間設為當天的 00:00:00 以計算完整天數
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  // 計算毫秒差並轉換為天數
  const diff = Math.abs(end - start);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * 判斷日期是否在指定範圍內
 * @param {Date|String} date - 待檢查的日期
 * @param {Date|String} startDate - 開始日期
 * @param {Date|String} endDate - 結束日期
 * @returns {Boolean} 是否在範圍內
 */
export function isDateInRange(date, startDate, endDate) {
  const checkDate = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (
    isNaN(checkDate.getTime()) ||
    isNaN(start.getTime()) ||
    isNaN(end.getTime())
  ) {
    return false;
  }

  return checkDate >= start && checkDate <= end;
}

/**
 * 判斷活動是否進行中
 * @param {Object} activity - 活動對象
 * @param {Date|String} activity.startDate - 活動開始日期
 * @param {Date|String} activity.endDate - 活動結束日期
 * @returns {Boolean} 是否進行中
 */
export function isActivityActive(activity) {
  if (!activity || !activity.startDate || !activity.endDate) {
    return false;
  }

  const now = new Date();
  return isDateInRange(now, activity.startDate, activity.endDate);
}

/**
 * 獲取活動狀態文本
 * @param {Object} activity - 活動對象
 * @param {Date|String} activity.startDate - 活動開始日期
 * @param {Date|String} activity.endDate - 活動結束日期
 * @returns {String} 狀態文本
 */
export function getActivityStatusText(activity) {
  if (!activity || !activity.startDate || !activity.endDate) {
    return "未知";
  }

  const now = new Date();
  const startDate = new Date(activity.startDate);
  const endDate = new Date(activity.endDate);

  if (now < startDate) {
    return "即將開始";
  } else if (now > endDate) {
    return "已結束";
  } else {
    return "進行中";
  }
}
