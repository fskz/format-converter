use crate::commands::PreviewData;
use calamine::{open_workbook_auto, Reader};
use std::collections::HashSet;
use std::path::Path;

#[tauri::command]
pub fn preview_file(path: String) -> Result<PreviewData, String> {
    let ext = Path::new(&path)
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();

    match ext.as_str() {
        "xlsx" | "xls" => preview_xlsx(&path),
        "json" => preview_json(&path),
        _ => Err(format!("不支持的文件格式: {}", ext)),
    }
}

fn preview_xlsx(path: &str) -> Result<PreviewData, String> {
    let mut workbook = open_workbook_auto(path).map_err(|e| e.to_string())?;

    let sheet_names = workbook.sheet_names().to_vec();
    let sheet_name = sheet_names
        .first()
        .ok_or("Excel 文件中没有工作表")?
        .clone();

    let range = workbook
        .worksheet_range(&sheet_name)
        .ok_or_else(|| "工作表不存在".to_string())?
        .map_err(|e| e.to_string())?;

    let mut rows_iter = range.rows();

    let headers: Vec<String> = rows_iter
        .next()
        .map(|row| {
            row.iter()
                .enumerate()
                .map(|(i, cell)| {
                    if cell.is_empty() {
                        format!("column_{}", i)
                    } else {
                        cell.to_string()
                    }
                })
                .collect()
        })
        .unwrap_or_default();

    // 只转换前100行到字符串，其余仅计数
    let preview_rows: Vec<Vec<String>> = rows_iter
        .by_ref()
        .take(100)
        .map(|row| row.iter().map(|cell| cell.to_string()).collect())
        .collect();

    let total_rows = preview_rows.len() + rows_iter.count();

    Ok(PreviewData {
        file_type: "xlsx".to_string(),
        headers,
        rows: preview_rows,
        total_rows,
    })
}

fn preview_json(path: &str) -> Result<PreviewData, String> {
    let content = std::fs::read_to_string(path).map_err(|e| e.to_string())?;
    let data: serde_json::Value = serde_json::from_str(&content).map_err(|e| e.to_string())?;

    let records = data.as_array().ok_or("JSON 顶层必须是数组")?;
    let total_rows = records.len();

    if records.is_empty() {
        return Ok(PreviewData {
            file_type: "json".to_string(),
            headers: vec![],
            rows: vec![],
            total_rows: 0,
        });
    }

    let mut seen: HashSet<&str> = HashSet::new();
    let mut headers: Vec<String> = Vec::new();
    for record in records {
        if let serde_json::Value::Object(map) = record {
            for key in map.keys() {
                if seen.insert(key.as_str()) {
                    headers.push(key.clone());
                }
            }
        }
    }

    let preview_rows: Vec<Vec<String>> = records
        .iter()
        .take(100)
        .map(|record| {
            if let serde_json::Value::Object(map) = record {
                headers
                    .iter()
                    .map(|key| {
                        map.get(key)
                            .map(|v| json_value_to_string(v))
                            .unwrap_or_default()
                    })
                    .collect()
            } else {
                vec![]
            }
        })
        .collect();

    Ok(PreviewData {
        file_type: "json".to_string(),
        headers,
        rows: preview_rows,
        total_rows,
    })
}

fn json_value_to_string(value: &serde_json::Value) -> String {
    match value {
        serde_json::Value::Null => String::new(),
        serde_json::Value::Bool(b) => b.to_string(),
        serde_json::Value::Number(n) => n.to_string(),
        serde_json::Value::String(s) => s.clone(),
        _ => value.to_string(),
    }
}
