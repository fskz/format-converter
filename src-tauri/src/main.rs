#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            format_converter::commands::convert::convert_file,
            format_converter::commands::preview::preview_file,
            format_converter::commands::batch::batch_convert,
            format_converter::commands::batch::show_in_folder,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
