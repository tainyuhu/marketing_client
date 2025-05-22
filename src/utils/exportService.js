// utils/exportService.js
import XLSX from "xlsx";

export const exportToFile = exportData => {
  // 保留原始解構，增加批次數量相關參數
  let {
    format = "xlsx",
    filename = "data-export",
    mainColumns = [],
    subColumns = [],
    selectedRows = [],
    subItems = [], // 保留舊結構的 subItems 變量
    sheetConfig = "separate", // 確保這裡有默認值
    rowKey = "id",
    // 新增批次數量相關參數
    batchColumns = [],
    batchQuantityData = [],
    totalQuantity = 0,
    hasBatchData = false
  } = exportData;

  // 建立工作簿
  const workbook = XLSX.utils.book_new();

  // 安全檢查
  if (!selectedRows || !Array.isArray(selectedRows)) {
    selectedRows = [];
  }

  if (!mainColumns || !Array.isArray(mainColumns)) {
    mainColumns = [];
  }

  // 處理新結構 (allSubTables)，確保舊結構仍然有效
  const additionalSubTables = [];

  if (
    exportData.allSubTables &&
    Array.isArray(exportData.allSubTables) &&
    exportData.allSubTables.length > 0
  ) {
    // 使用第一個子表格作為默認子表格 (兼容原有邏輯)
    const firstSubTable = exportData.allSubTables.find(
      st => st && st.items && Array.isArray(st.items) && st.items.length > 0
    );

    if (firstSubTable) {
      // 如果 subItems 為空或未定義，使用新結構的數據
      if (!subItems || !Array.isArray(subItems) || subItems.length === 0) {
        subItems = firstSubTable.items || [];
        if (
          firstSubTable.columns &&
          Array.isArray(firstSubTable.columns) &&
          firstSubTable.columns.length > 0
        ) {
          subColumns = firstSubTable.columns;
        }
      }
    }

    // 收集其他子表格(第二個及之後的)供後續處理
    for (let i = 0; i < exportData.allSubTables.length; i++) {
      const subTable = exportData.allSubTables[i];
      // 跳過無效的子表格或第一個已處理的子表格
      if (
        !subTable ||
        !subTable.items ||
        !Array.isArray(subTable.items) ||
        subTable.items.length === 0 ||
        (firstSubTable && subTable === firstSubTable)
      ) {
        continue;
      }
      additionalSubTables.push(subTable);
    }
  }

  // 處理主項目資料
  if (
    selectedRows.length > 0 &&
    (sheetConfig === "separate" || !subItems || subItems.length === 0)
  ) {
    const mainData = selectedRows.map(row => {
      const item = {};
      mainColumns.forEach(column => {
        // 使用列的標籤作為欄位名稱
        item[column.label] = formatValue(row, column);
      });
      return item;
    });

    const mainWorksheet = XLSX.utils.json_to_sheet(mainData);

    // 調整欄位寬度
    const mainColWidths = mainColumns.map(col => ({
      wch: Math.max(col.label.length * 2, 12)
    }));
    mainWorksheet["!cols"] = mainColWidths;

    // 添加格線
    addGridLines(mainWorksheet, mainData.length, mainColumns.length);

    XLSX.utils.book_append_sheet(workbook, mainWorksheet, "主項目");
  }

  // 處理子項目資料 (原有邏輯，使用 subItems)
  if (
    subItems &&
    Array.isArray(subItems) &&
    subItems.length > 0 &&
    sheetConfig === "separate"
  ) {
    const subData = subItems.map(subItem => {
      const item = {};
      // 添加父項目參考
      item["所屬主項目"] = subItem._parentTitle || "";

      subColumns.forEach(column => {
        item[column.label] = formatValue(subItem, column);
      });
      return item;
    });

    const subWorksheet = XLSX.utils.json_to_sheet(subData);

    // 調整欄位寬度
    const subColWidths = [{ wch: 20 }].concat(
      subColumns.map(col => ({ wch: Math.max(col.label.length * 2, 12) }))
    );
    subWorksheet["!cols"] = subColWidths;

    // 添加格線
    addGridLines(subWorksheet, subData.length, subColumns.length + 1); // +1 是為了計入「所屬主項目」列

    XLSX.utils.book_append_sheet(workbook, subWorksheet, "子項目");
  }

  // 新增處理批次數量數據
  if (
    hasBatchData &&
    batchQuantityData &&
    Array.isArray(batchQuantityData) &&
    batchQuantityData.length > 0 &&
    batchColumns &&
    Array.isArray(batchColumns) &&
    batchColumns.length > 0
  ) {
    const batchData = batchQuantityData.map(batchItem => {
      const item = {};
      batchColumns.forEach(column => {
        item[column.label] = batchItem[column.prop];
      });
      return item;
    });

    // 如果有總數量，添加到最後一行
    if (totalQuantity > 0) {
      const totalRow = {};
      batchColumns.forEach(column => {
        if (column.prop === "quantity") {
          totalRow[column.label] = totalQuantity;
        } else if (column.prop === "batchNumber") {
          totalRow[column.label] = "總計";
        } else {
          totalRow[column.label] = "";
        }
      });
      batchData.push(totalRow);
    }

    const batchWorksheet = XLSX.utils.json_to_sheet(batchData);

    // 調整欄位寬度
    const batchColWidths = batchColumns.map(col => ({
      wch: Math.max(col.label.length * 2, 12)
    }));
    batchWorksheet["!cols"] = batchColWidths;

    // 添加格線
    addGridLines(batchWorksheet, batchData.length, batchColumns.length);

    // 如果有總數量，為最後一行添加特殊樣式
    if (totalQuantity > 0) {
      const range = XLSX.utils.decode_range(batchWorksheet["!ref"]);
      const lastRow = range.e.r;

      for (let c = range.s.c; c <= range.e.c; c++) {
        const cellRef = XLSX.utils.encode_cell({ r: lastRow, c });

        if (!batchWorksheet[cellRef].s) batchWorksheet[cellRef].s = {};

        batchWorksheet[cellRef].s = {
          ...batchWorksheet[cellRef].s,
          font: { bold: true },
          fill: {
            patternType: "solid",
            fgColor: { rgb: "E6F7FF" } // 淺藍色背景
          }
        };
      }
    }

    XLSX.utils.book_append_sheet(workbook, batchWorksheet, "出貨單總量");
  }

  // 處理額外的子表格 (第二個開始)
  if (additionalSubTables.length > 0 && sheetConfig === "separate") {
    additionalSubTables.forEach((subTable, index) => {
      const items = subTable.items || [];
      const columns = subTable.columns || [];

      if (columns.length === 0) return;

      const subData = items.map(subItem => {
        const item = {};
        // 添加父項目參考
        item["所屬主項目"] = subItem._parentTitle || "";

        columns.forEach(column => {
          item[column.label] = formatValue(subItem, column);
        });
        return item;
      });

      const subWorksheet = XLSX.utils.json_to_sheet(subData);

      // 調整欄位寬度
      const subColWidths = [{ wch: 20 }].concat(
        columns.map(col => ({ wch: Math.max(col.label.length * 2, 12) }))
      );
      subWorksheet["!cols"] = subColWidths;

      // 添加格線
      addGridLines(subWorksheet, subData.length, columns.length + 1);

      const sheetName = subTable.subTableName || `子表格 ${index + 1}`;
      XLSX.utils.book_append_sheet(workbook, subWorksheet, sheetName);
    });
  }

  // 合併表單 - 把主項目和子項目資料整合到一個表單中 (優化後的邏輯)
  if (
    sheetConfig === "combined" &&
    selectedRows.length > 0 &&
    ((subItems && Array.isArray(subItems) && subItems.length > 0) ||
      additionalSubTables.length > 0)
  ) {
    const combinedData = [];

    // 依據主項目和子項目組織資料 - 優化後每個主項目只出現一次
    selectedRows.forEach(mainRow => {
      // 創建一個包含主項目數據的基本記錄
      const baseMainItem = {};

      // 填充主項目數據
      mainColumns.forEach(column => {
        baseMainItem[`主項目_${column.label}`] = formatValue(mainRow, column);
      });

      // 追蹤是否有找到相關的子項目
      let hasSubItems = false;

      // 收集此主項目的所有子項目數據
      const allRelatedSubItems = [];

      // 處理原始子項目 (subItems)
      if (subItems && Array.isArray(subItems) && subItems.length > 0) {
        // 找出此主項目所有相關的子項目
        const relatedSubItems = subItems.filter(
          subItem =>
            subItem._parentId === mainRow.id ||
            subItem._parentId === mainRow[rowKey]
        );

        if (relatedSubItems.length > 0) {
          hasSubItems = true;

          // 為每個子項目創建一個記錄
          relatedSubItems.forEach(subItem => {
            const subItemRecord = {};

            // 填充子項目數據
            subColumns.forEach(column => {
              subItemRecord[`子項目_${column.label}`] = formatValue(
                subItem,
                column
              );
            });

            allRelatedSubItems.push(subItemRecord);
          });
        }
      }

      // 處理額外的子表格
      additionalSubTables.forEach((subTable, tableIndex) => {
        const items = subTable.items || [];
        const columns = subTable.columns || [];
        const tableName = subTable.subTableName || `子表格 ${tableIndex + 1}`;

        // 找出此主項目在當前子表格中的相關子項目
        const relatedSubItems = items.filter(
          subItem =>
            subItem._parentId === mainRow.id ||
            subItem._parentId === mainRow[rowKey]
        );

        if (relatedSubItems.length > 0) {
          hasSubItems = true;

          // 為每個子項目創建一個記錄
          relatedSubItems.forEach(subItem => {
            const subItemRecord = {};

            // 填充子項目數據
            columns.forEach(column => {
              subItemRecord[`${tableName}_${column.label}`] = formatValue(
                subItem,
                column
              );
            });

            allRelatedSubItems.push(subItemRecord);
          });
        }
      });

      // 如果有子項目，則合併主項目和子項目數據
      if (hasSubItems && allRelatedSubItems.length > 0) {
        // 如果有多個子項目記錄，將主項目數據與第一個子項目記錄合併
        const firstSubRecord = allRelatedSubItems.shift();
        const firstCombinedItem = { ...baseMainItem, ...firstSubRecord };
        combinedData.push(firstCombinedItem);

        // 對於剩餘的子項目記錄，創建空的主項目數據行
        allRelatedSubItems.forEach(subRecord => {
          const emptiedMainItem = {};

          // 用空值填充主項目欄位
          mainColumns.forEach(column => {
            emptiedMainItem[`主項目_${column.label}`] = "";
          });

          // 合併空主項目和子項目數據
          const combinedItem = { ...emptiedMainItem, ...subRecord };
          combinedData.push(combinedItem);
        });
      } else {
        // 沒有子項目的情況，只添加主項目數據
        const combinedItem = { ...baseMainItem };

        // 子項目欄位設為空 (原始子項目)
        if (subColumns && Array.isArray(subColumns)) {
          subColumns.forEach(column => {
            combinedItem[`子項目_${column.label}`] = "";
          });
        }

        // 額外子表格的欄位也設為空
        additionalSubTables.forEach((subTable, tableIndex) => {
          const columns = subTable.columns || [];
          const tableName = subTable.subTableName || `子表格 ${tableIndex + 1}`;

          columns.forEach(column => {
            combinedItem[`${tableName}_${column.label}`] = "";
          });
        });

        combinedData.push(combinedItem);
      }
    });

    const combinedWorksheet = XLSX.utils.json_to_sheet(combinedData);

    // 計算所有欄位寬度
    const combinedColWidths = [];

    // 主項目欄位寬度
    mainColumns.forEach(col => {
      combinedColWidths.push({
        wch: Math.max(`主項目_${col.label}`.length * 1.5, 12)
      });
    });

    // 原始子項目欄位寬度
    if (subColumns && Array.isArray(subColumns)) {
      subColumns.forEach(col => {
        combinedColWidths.push({
          wch: Math.max(`子項目_${col.label}`.length * 1.5, 12)
        });
      });
    }

    // 額外子表格欄位寬度
    additionalSubTables.forEach((subTable, tableIndex) => {
      const columns = subTable.columns || [];
      const tableName = subTable.subTableName || `子表格 ${tableIndex + 1}`;

      columns.forEach(col => {
        combinedColWidths.push({
          wch: Math.max(`${tableName}_${col.label}`.length * 1.5, 12)
        });
      });
    });

    combinedWorksheet["!cols"] = combinedColWidths;

    // 添加格線
    const totalColumns = combinedColWidths.length;
    addGridLines(combinedWorksheet, combinedData.length, totalColumns);

    // 添加適當的表格樣式以區分每個主項目組
    styleMainGroupsInCombinedSheet(
      combinedWorksheet,
      combinedData,
      mainColumns.length
    );

    XLSX.utils.book_append_sheet(workbook, combinedWorksheet, "合併資料");
  }

  // 輸出檔案
  if (format === "xlsx") {
    XLSX.writeFile(workbook, `${filename}.xlsx`);
    return true;
  } else if (format === "csv") {
    // CSV只支援單個工作表
    // 如果有多個工作表，優先選擇合併工作表，其次是主項目工作表
    let sheetName = workbook.SheetNames[0];
    if (workbook.SheetNames.includes("合併資料")) {
      sheetName = "合併資料";
    } else if (workbook.SheetNames.includes("主項目")) {
      sheetName = "主項目";
    }

    const sheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(sheet);

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
    return true;
  }

  return false;
};

// 為合併工作表中的主項目組添加樣式
function styleMainGroupsInCombinedSheet(worksheet, data, mainColumnCount) {
  if (!worksheet || !data || !data.length) return;

  const range = XLSX.utils.decode_range(worksheet["!ref"]);

  // 追蹤當前正在處理的主項目
  let currentGroup = null;
  let groupStartRow = 0;

  // 為每一行添加適當的樣式
  for (let r = range.s.r + 1; r <= range.e.r; r++) {
    // 從第二行開始（跳過標題行）
    const isMainRow = isMainItemRow(data[r - 1], mainColumnCount);

    // 如果是新的主項目行，標記新組的開始
    if (isMainRow) {
      // 如果之前已有組，處理之前組的樣式
      if (currentGroup !== null) {
        addGroupStyle(worksheet, groupStartRow, r - 1);
      }

      // 開始新的組
      currentGroup = r;
      groupStartRow = r;

      // 為主項目行添加樣式
      for (let c = range.s.c; c < range.s.c + mainColumnCount; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c });

        if (!worksheet[cellRef].s) worksheet[cellRef].s = {};

        // 主項目欄位用粗體和淺灰背景
        worksheet[cellRef].s = {
          ...worksheet[cellRef].s,
          font: { bold: true },
          fill: {
            patternType: "solid",
            fgColor: { rgb: "F2F2F2" }
          }
        };
      }
    }
  }

  // 處理最後一個組
  if (currentGroup !== null) {
    addGroupStyle(worksheet, groupStartRow, range.e.r);
  }
}

// 判斷一行是否為主項目行（判斷依據是主項目欄位是否有值）
function isMainItemRow(dataRow, mainColumnCount) {
  if (!dataRow) return false;

  // 檢查是否至少有一個主項目欄位有值
  const mainItemKeys = Object.keys(dataRow).filter(key =>
    key.startsWith("主項目_")
  );

  for (const key of mainItemKeys) {
    if (dataRow[key] !== "") {
      return true;
    }
  }

  return false;
}

// 為一個主項目組添加樣式
function addGroupStyle(worksheet, startRow, endRow) {
  if (startRow === endRow) return; // 單行不需要特殊處理

  // 可以在這裡添加組樣式，例如輕微的背景色交替等
  // 這裡暫時不添加額外樣式
}

// 格式化值的輔助函數
function formatValue(row, column) {
  if (!row || !column) return "";

  const value = row[column.prop];

  if (value === null || value === undefined) {
    return "";
  }

  if (column.formatter) {
    return column.formatter(value, row);
  }

  if (column.type === "date" && value) {
    // 根據需要格式化日期
    if (typeof value === "string" && value.includes("T")) {
      // 處理ISO格式日期
      return new Date(value).toLocaleDateString("zh-TW");
    } else if (value instanceof Date) {
      return value.toLocaleDateString("zh-TW");
    }
    return value;
  }

  if (column.type === "number" && typeof value === "number") {
    // 數字格式化，例如加上千分位
    return value.toLocaleString("zh-TW");
  }

  return value;
}

// 為工作表添加格線
function addGridLines(worksheet, rowCount, colCount) {
  if (!worksheet || !rowCount || !colCount) return;

  // 獲取欄位索引範圍
  const range = XLSX.utils.decode_range(worksheet["!ref"]);

  // 初始化樣式設定
  worksheet["!sheetFormat"] = {
    defaultRowHeight: 20
  };

  // 設置每個儲存格的格線
  for (let r = range.s.r; r <= range.e.r; r++) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c });

      if (!worksheet[cellRef]) {
        // 如果儲存格不存在，創建一個空儲存格
        worksheet[cellRef] = { v: "", t: "s" };
      }

      // 添加格線樣式
      if (!worksheet[cellRef].s) worksheet[cellRef].s = {};

      worksheet[cellRef].s = {
        ...worksheet[cellRef].s,
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        }
      };

      // 標題行設置粗體和淺灰背景
      if (r === range.s.r) {
        worksheet[cellRef].s.font = { bold: true };
        worksheet[cellRef].s.fill = {
          patternType: "solid",
          fgColor: { rgb: "F2F2F2" }
        };
      }
    }
  }
}
