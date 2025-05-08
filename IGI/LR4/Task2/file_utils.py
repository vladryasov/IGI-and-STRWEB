import os
import zipfile

def read_text_file(filename, base_dir="files"):
    """Read text from a file in the specified task directory."""
    task_path = os.path.join(os.path.dirname(__file__), base_dir)
    full_path = os.path.join(task_path, filename)
    if not os.path.exists(full_path):
        raise FileNotFoundError(f"File {full_path} not found")
    with open(full_path, 'r', encoding='utf-8') as file:
        return file.read()

def save_results(results, filename="results.txt", base_dir="files"):
    """Save analysis results to a file in the specified task directory."""
    task_path = os.path.join(os.path.dirname(__file__), base_dir)
    os.makedirs(task_path, exist_ok=True)
    full_path = os.path.join(task_path, filename)
    with open(full_path, 'w', encoding='utf-8') as file:
        file.write("\n".join(results))
    return full_path

def archive_results(result_file, archive_name="results.zip", base_dir="files"):
    """Archive the results file and provide archive info."""
    task_path = os.path.join(os.path.dirname(__file__), base_dir)
    archive_path = os.path.join(task_path, archive_name)
    with zipfile.ZipFile(archive_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        zipf.write(result_file, os.path.basename(result_file))
    
    # Get archive info
    info = []
    with zipfile.ZipFile(archive_path, 'r') as zipf:
        for file_info in zipf.infolist():
            info.append(f"File in archive: {file_info.filename}")
            info.append(f"Size: {file_info.file_size} bytes")
            info.append(f"Compressed size: {file_info.compress_size} bytes")
    return info