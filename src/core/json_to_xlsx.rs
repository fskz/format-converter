use anyhow::{Context, Result};
use rust_xlsxwriter::Workbook;
use serde_json::Value;
use std::collections::HashSet;

pub fn json_to_xlsx(input: &str, output: &str) -> Result<(usize, usize)> {
    let content = std::fs::read_to_string(input).context("无法读取 JSON 文件")?;
    let data: Value = serde_json::from_str(&content).context("JSON 解析失败")?;

    let records = data
        .as_array()
        .ok_or_else(|| anyhow::anyhow!("JSON 顶层必须是数组"))?;

    if records.is_empty() {
        anyhow::bail!("JSON 数组为空，无数据可转换");
    }

    let mut seen: HashSet<&str> = HashSet::new();
    let mut headers: Vec<String> = Vec::new();
    for record in records {
        if let Value::Object(map) = record {
            for key in map.keys() {
                if seen.insert(key.as_str()) {
                    headers.push(key.clone());
                }
            }
        }
    }

    let mut workbook = Workbook::new();
    let worksheet = workbook.add_worksheet();

    // 写入表头
    for (col, header) in headers.iter().enumerate() {
        worksheet
            .write_string(0, col as u16, header)
            .context("写入表头失败")?;
    }

    // 写入数据行
    for (row_idx, record) in records.iter().enumerate() {
        let row = (row_idx + 1) as u32;
        if let Value::Object(map) = record {
            for (col, key) in headers.iter().enumerate() {
                let value = map.get(key).unwrap_or(&Value::Null);
                write_value(worksheet, row, col as u16, value)?;
            }
        }
    }

    workbook
        .save(output)
        .context("无法保存 Excel 文件")?;

    Ok((records.len(), headers.len()))
}

fn write_value(
    worksheet: &mut rust_xlsxwriter::Worksheet,
    row: u32,
    col: u16,
    value: &Value,
) -> Result<()> {
    match value {
        Value::Null => {}
        Value::Bool(b) => {
            worksheet.write_boolean(row, col, *b).context("写入布尔值失败")?;
        }
        Value::Number(n) => {
            if let Some(i) = n.as_i64() {
                worksheet.write_number(row, col, i as f64).context("写入数字失败")?;
            } else if let Some(f) = n.as_f64() {
                worksheet.write_number(row, col, f).context("写入数字失败")?;
            }
        }
        Value::String(s) => {
            worksheet.write_string(row, col, s).context("写入字符串失败")?;
        }
        // 嵌套对象/数组序列化为 JSON 字符串
        _ => {
            let s = value.to_string();
            worksheet.write_string(row, col, &s).context("写入复合值失败")?;
        }
    }
    Ok(())
}
