/**
 * 防抖函數 - 將高頻觸發的事件延遲處理，避免頻繁重複操作
 *
 * @param {Function} func - 需要防抖的函數
 * @param {Number} wait - 等待時間，單位為毫秒(ms)
 * @param {Boolean} immediate - 是否立即執行，若為true則首次調用會立即執行而非等待
 * @returns {Function} 返回防抖處理後的函數
 */
export function debounce(func, wait = 300, immediate = false) {
  let timeout;

  const debounced = function(...args) {
    const context = this;
    const callNow = immediate && !timeout;

    clearTimeout(timeout);

    timeout = setTimeout(() => {
      timeout = null;
      if (!immediate) func.apply(context, args);
    }, wait);

    if (callNow) func.apply(context, args);
  };

  // 添加取消方法
  debounced.cancel = function() {
    clearTimeout(timeout);
    timeout = null;
  };

  return debounced;
}

export default debounce;
