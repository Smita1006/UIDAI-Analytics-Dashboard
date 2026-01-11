#!/usr/bin/env python3
from pathlib import Path
import os

print("Current working directory:", os.getcwd())
print()

data_path = Path("../DATA")
print(f"data_path: {data_path}")
print(f"data_path absolute: {data_path.resolve()}")
print(f"data_path exists: {data_path.exists()}")
print()

if data_path.exists():
    print("Contents of DATA directory:")
    for item in data_path.iterdir():
        print(f"  {item.name}")
    
    print()
    for dataset_type in ['biometric', 'demographic', 'enrolment']:
        file_pattern = f"api_data_aadhar_{dataset_type}/*.csv"
        files = list(data_path.glob(file_pattern))
        print(f"{dataset_type}: {len(files)} files found")
        for file in files:
            print(f"  - {file.name}")
        print()