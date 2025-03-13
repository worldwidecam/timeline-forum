import os
import cloudinary
import cloudinary.uploader
from cloud_storage import upload_file
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_cloudinary_connection():
    """Test the Cloudinary connection and configuration"""
    print("Testing Cloudinary connection...")
    
    # Check if Cloudinary is configured
    config = cloudinary.config()
    print(f"Cloudinary is configured with cloud name: {config.cloud_name}")
    
    # Try to upload a test file
    try:
        # Create a simple test file
        test_file_path = "test_upload.txt"
        with open(test_file_path, "w") as f:
            f.write("This is a test file for Cloudinary upload.")
        
        print("Uploading test file to Cloudinary...")
        with open(test_file_path, "rb") as f:
            result = upload_file(f, folder="timeline_forum/test")
        
        if result['success']:
            print("[SUCCESS] Test file uploaded successfully!")
            print(f"URL: {result['url']}")
            print(f"Public ID: {result['public_id']}")
            
            # Clean up the test file from Cloudinary
            print("Cleaning up test file from Cloudinary...")
            cloudinary.uploader.destroy(result['public_id'])
            print("[SUCCESS] Test file cleaned up successfully!")
        else:
            print(f"[ERROR] Upload failed: {result['error']}")
    
    except Exception as e:
        print(f"[ERROR] Error during test: {str(e)}")
    
    finally:
        # Clean up local test file
        if os.path.exists(test_file_path):
            os.remove(test_file_path)
            print("Local test file removed.")

if __name__ == "__main__":
    test_cloudinary_connection()
