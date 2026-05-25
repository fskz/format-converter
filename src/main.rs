use anyhow::{Context, Result};
use calamine::{open_workbook_auto, DataType, Reader};
use rust_xlsxwriter::Workbook;
use serde_json::{Map, Value};
use std::path::Path;

fn main() -> Result<()> {
    let args: Vec<String> = std::env::args().collect();

    if args.len() < 4 {
        print_usage();
        std::process::exit(1);
    }

    let command = &args[1];
    let input = &args[2];
    let output = &args[3];

    match command.as_str() {
        "xlsx2json" => xlsx_to_json(input, output)?,
        "json2xlsx" => json_to_xlsx(input, output)?,
        _ => {
            print_usage();
            std::process::exit(1);
        }
    }

    Ok(())
}

fn print_usage() {
    eprintln!("用法:");
    eprintln!("  format-converter xlsx2json <input.xlsx> <output.json>");
    eprintln!("  format-converter json2xlsx <input.json> <output.xlsx>");
}

fn xlsx_to_json(input: &str, output: &str) -> Result<()> {
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

    let json = serde_json::to_string_pretty(&records).context("JSON 序列化失败")?;
    std::fs::write(output, json).context("无法写入 JSON 文件")?;

    println!("转换完成: {} -> {} ({} 条记录)", input, output, records.len());
    Ok(())
}

fn cell_to_value(cell: &DataType) -> Value {
    match cell {
        DataType::Empty => Value::Null,
        DataType::Bool(b) => Value::Bool(*b),
        DataType::Float(f) => {
            // 如果是整数，输出为整数
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

fn json_to_xlsx(input: &str, output: &str) -> Result<()> {
    let content = std::fs::read_to_string(input).context("无法读取 JSON 文件")?;
    let data: Value = serde_json::from_str(&content).context("JSON 解析失败")?;

    let records = data
        .as_array()
        .ok_or_else(|| anyhow::anyhow!("JSON 顶层必须是数组"))?;

    if records.is_empty() {
        anyhow::bail!("JSON 数组为空，无数据可转换");
    }

    // 从所有记录中收集表头（保持顺序）
    let mut headers: Vec<String> = Vec::new();
    for record in records {
        if let Value::Object(map) = record {
            for key in map.keys() {
                if !headers.contains(key) {
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

    println!(
        "转换完成: {} -> {} ({} 条记录, {} 列)",
        input,
        output,
        records.len(),
        headers.len()
    );
    Ok(())
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
