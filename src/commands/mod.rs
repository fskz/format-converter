pub mod convert;
pub mod preview;
pub mod batch;

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct ConvertResult {
    pub success: bool,
    pub output_path: String,
    pub record_count: usize,
    pub error: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct PreviewData {
    pub file_type: String,
    pub headers: Vec<String>,
    pub rows: Vec<Vec<String>>,
    pub total_rows: usize,
}

#[derive(Serialize, Deserialize)]
pub struct BatchItem {
    pub input: String,
    pub output: String,
    pub direction: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct BatchProgress {
    pub current: usize,
    pub total: usize,
    pub current_file: String,
    pub status: String,
}
