use crate::commands::ConvertResult;

#[tauri::command]
pub fn convert_file(
    input: String,
    output: String,
    direction: String,
) -> Result<ConvertResult, String> {
    let result = match direction.as_str() {
        "xlsx2json" => crate::core::xlsx_to_json(&input, &output)
            .map(|count| ConvertResult {
                success: true,
                output_path: output,
                record_count: count,
                error: None,
            }),
        "json2xlsx" => crate::core::json_to_xlsx(&input, &output)
            .map(|(rows, _)| ConvertResult {
                success: true,
                output_path: output,
                record_count: rows,
                error: None,
            }),
        _ => Err(anyhow::anyhow!("未知的转换方向: {}", direction)),
    };

    match result {
        Ok(r) => Ok(r),
        Err(e) => Ok(ConvertResult {
            success: false,
            output_path: String::new(),
            record_count: 0,
            error: Some(e.to_string()),
        }),
    }
}
