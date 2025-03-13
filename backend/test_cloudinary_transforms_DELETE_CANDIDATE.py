import os
import requests
from io import BytesIO
from cloud_storage import upload_file, get_optimized_url, get_transformed_url, delete_file

def download_sample_image():
    """Download a sample image for testing"""
    print("Downloading sample image...")
    sample_url = "https://res.cloudinary.com/demo/image/upload/sample.jpg"
    response = requests.get(sample_url)
    if response.status_code == 200:
        return BytesIO(response.content)
    else:
        raise Exception(f"Failed to download sample image: {response.status_code}")

def test_image_transformations():
    """Test Cloudinary image transformations"""
    print("\n=== Testing Cloudinary Image Transformations ===\n")
    
    try:
        # Download a sample image
        image_data = download_sample_image()
        
        # Upload the image to Cloudinary
        print("Uploading image to Cloudinary...")
        upload_result = upload_file(image_data, folder="timeline_forum/test")
        
        if not upload_result['success']:
            print(f"[ERROR] Upload failed: {upload_result['error']}")
            return
        
        public_id = upload_result['public_id']
        original_url = upload_result['url']
        
        print(f"[SUCCESS] Image uploaded successfully!")
        print(f"Original URL: {original_url}")
        
        # Get optimized URL
        print("\nGenerating optimized URL...")
        optimized_url = get_optimized_url(public_id)
        print(f"Optimized URL: {optimized_url}")
        
        # Get transformed URLs with different options
        print("\nGenerating transformed URLs...")
        
        # Resize to 300x300 with fill crop
        fill_url = get_transformed_url(public_id, width=300, height=300, crop="fill")
        print(f"300x300 fill crop: {fill_url}")
        
        # Resize to width 500, maintain aspect ratio
        scale_url = get_transformed_url(public_id, width=500, crop="scale")
        print(f"Width 500, scale: {scale_url}")
        
        # Apply a sepia effect
        effect_url = get_transformed_url(public_id, width=400, effect="sepia")
        print(f"Sepia effect: {effect_url}")
        
        # Round corners
        rounded_url = get_transformed_url(public_id, width=400, radius=50)
        print(f"Rounded corners: {rounded_url}")
        
        # Clean up
        print("\nCleaning up test image from Cloudinary...")
        delete_result = delete_file(public_id)
        
        if delete_result['success']:
            print("[SUCCESS] Test image cleaned up successfully!")
        else:
            print(f"[ERROR] Cleanup failed: {delete_result['error']}")
            
    except Exception as e:
        print(f"[ERROR] Error during test: {str(e)}")

if __name__ == "__main__":
    test_image_transformations()
