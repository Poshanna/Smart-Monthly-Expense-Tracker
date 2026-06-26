import easyocr
from PIL import Image
import io

print("Testing EasyOCR initialization...")
try:
    reader = easyocr.Reader(['en'], gpu=False)
    print("EasyOCR initialized successfully!")
    
    # Test with a simple in-memory image (just a white image)
    img = Image.new('RGB', (200, 100), color='white')
    buf = io.BytesIO()
    img.save(buf, format='JPEG')
    buf.seek(0)
    
    test_image = Image.open(buf)
    print("Testing OCR on dummy image...")
    results = reader.readtext(test_image)
    print(f"OCR results: {results}")
    print("EasyOCR works fine!")
    
except Exception as e:
    print(f"Error initializing EasyOCR: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
