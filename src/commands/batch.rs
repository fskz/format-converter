use crate::commands::{BatchItem, BatchProgress};
use tauri::Emitter;

#[tauri::command]
pub async fn batch_convert(
    files: Vec<BatchItem>,
    app: tauri::AppHandle,
) -> Result<(), String> {
    let total = files.len();

    for (idx, item) in files.iter().enumerate() {
        let progress = BatchProgress {
            current: idx + 1,
            total,
            current_file: item.input.clone(),
            status: "processing".to_string(),
        };
        let _ = app.emit("batch-progress", &progress);

        let result: Result<(), anyhow::Error> = match item.direction.as_str() {
            "xlsx2json" => crate::core::xlsx_to_json(&item.input, &item.output).map(|_| ()),
            "json2xlsx" => crate::core::json_to_xlsx(&item.input, &item.output).map(|_| ()),
            _ => Err(anyhow::anyhow!("未知的转换方向: {}", item.direction)),
        };

        let status = match result {
            Ok(_) => "success".to_string(),
            Err(e) => format!("error: {}", e),
        };

        let progress = BatchProgress {
            current: idx + 1,
            total,
            current_file: item.input.clone(),
            status,
        };
        let _ = app.emit("batch-progress", &progress);
    }

    Ok(())
}

#[tauri::command]
pub fn show_in_folder(path: String) -> Result<(), String> {
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(
                std::path::Path::new(&path)
                    .parent()
                    .unwrap_or(std::path::Path::new(".")),
            )
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    Ok(())
}
