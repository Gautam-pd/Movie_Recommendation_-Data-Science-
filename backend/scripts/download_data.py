import os
import urllib.request
import zipfile
import shutil

URL = "https://files.grouplens.org/datasets/movielens/ml-latest-small.zip"
RAW_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "raw")
ZIP_PATH = os.path.join(RAW_DIR, "ml-latest-small.zip")

def main():
    # Ensure raw directory exists
    os.makedirs(RAW_DIR, exist_ok=True)

    print(f"Downloading dataset from {URL}...")
    try:
        # Download file
        urllib.request.urlretrieve(URL, ZIP_PATH)
        print("Download complete.")
    except Exception as e:
        print(f"Error downloading the dataset: {e}")
        return

    print("Extracting files...")
    try:
        with zipfile.ZipFile(ZIP_PATH, 'r') as zip_ref:
            # Extract to RAW_DIR (creates raw/ml-latest-small/ directory)
            zip_ref.extractall(RAW_DIR)
        print("Extraction complete.")
    except Exception as e:
        print(f"Error extracting files: {e}")
        return

    # Move files from raw/ml-latest-small/ to raw/
    nested_dir = os.path.join(RAW_DIR, "ml-latest-small")
    if os.path.exists(nested_dir):
        print("Flattening directories...")
        for filename in os.listdir(nested_dir):
            src = os.path.join(nested_dir, filename)
            dst = os.path.join(RAW_DIR, filename)
            if os.path.exists(dst):
                os.remove(dst)
            shutil.move(src, dst)
        shutil.rmtree(nested_dir)
        print("Directories flattened.")

    # Cleanup zip
    if os.path.exists(ZIP_PATH):
        os.remove(ZIP_PATH)
        print("Cleaned up temporary zip file.")

    # Verify files
    print("\nVerifying extracted files:")
    expected_files = ["movies.csv", "ratings.csv", "links.csv", "tags.csv"]
    all_ok = True
    for f in expected_files:
        path = os.path.join(RAW_DIR, f)
        if os.path.exists(path):
            # Print row counts (quick check)
            with open(path, 'r', encoding='utf-8') as file:
                lines = sum(1 for _ in file)
            print(f"  [OK] {f} - {lines - 1:,} records (excluding header)")
        else:
            print(f"  [ERROR] {f} is missing!")
            all_ok = False

    if all_ok:
        print("\nAll files successfully ingested and verified!")
    else:
        print("\nIngestion completed with errors.")

if __name__ == "__main__":
    main()
