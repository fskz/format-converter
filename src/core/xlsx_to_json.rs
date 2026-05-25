use anyhow::{Context, Result};
use calamine::{open_workbook_auto, DataType, Reader};
use serde_json::{Map, Value};
use std::path::Path;

pub fn xlsx_to_json(input: &str, output: &str) -> Result<usize> {
    let path = Path::new(input);
    let mut workbook = open_workbook_auto(path).context("无法打开 Excel 文件")?;

    // 读取第一个 sheet
    let sheet_names = workbook.sheet_names().to_vec();
    let sheet_name = sheet_names
        .first()
        .ok_or_else(|| anyhow::anyhow!("Excel 文件中没有工作表"))?
        .clone();

    let range = workbook
        .worksheet_range(&sheet_name)
        .context("无法读取工作表")??;

    let mut rows = range.rows();

    // 第一行作为表头
    let headers: Vec<String> = rows
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

    // 后续行作为数据
    let records: Vec<Value> = rows
        .map(|row| {
            let mut map = Map::new();
            for (i, cell) in row.iter().enumerate() {
                let key = headers.get(i).cloned().unwrap_or_else(|| format!("column_{}", i));
                let value = cell_to_value(cell);
                map.insert(key, value);
            }
            Value::Object(map)
        })
        .collect();

    let count = records.len();

    let json = serde_json::to_string_pretty(&records).context("JSON 序列化失败")?;
    std::fs::write(output, json).context("无法写入 JSON 文件")?;

    Ok(count)
}

fn cell_to_value(cell: &DataType) -> Value {
    match cell {
        DataType::Empty => Value::Null,
        DataType::Bool(b) => Value::Bool(*b),
        DataType::Float(f) => {
            if *f == (*f as i64) as f64 {
                Value::Number((*f as i64).into())
            } else {
                serde_json::Number::from_f64(*f)
                    .map(Value::Number)
                    .unwrap_or(Value::Null)
            }
        }
        DataType::Int(i) => Value::Number((*i).into()),
        DataType::String(s) => Value::String(s.clone()),
        _ => Value::String(cell.to_string()),
    }
}
