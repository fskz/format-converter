use anyhow::Result;

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
        "xlsx2json" => {
            let count = format_converter::core::xlsx_to_json(input, output)?;
            println!("转换完成: {} -> {} ({} 条记录)", input, output, count);
        }
        "json2xlsx" => {
            let (rows, cols) = format_converter::core::json_to_xlsx(input, output)?;
            println!("转换完成: {} -> {} ({} 条记录, {} 列)", input, output, rows, cols);
        }
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
