import re
from datetime import datetime

def test_ocr_parsing(text):
    text_lower = text.lower()
    
    # Parse merchant name
    merchant_name = None
    merchant_candidates = [
        r"Merchant:\s*(.+)",
        r"Store:\s*(.+)",
        r"From:\s*(.+)",
        r"([A-Z][A-Za-z0-9\s&]+)\s*Ltd",
        r"([A-Z][A-Za-z0-9\s&]+)\s*Inc",
    ]
    for pattern in merchant_candidates:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            merchant_name = match.group(1).strip()
            break
    if not merchant_name:
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        for line in lines:
            if not re.match(r"^[\d\s.,\-]+$", line) and len(line) > 2:
                merchant_name = line
                break
    
    # Parse date
    date = None
    date_patterns = [
        r"(\d{4}[-/]\d{2}[-/]\d{2})",
        r"(\d{2}[-/]\d{2}[-/]\d{4})",
        r"(\d{2}[-/]\d{2}[-/]\d{2})"
    ]
    for pattern in date_patterns:
        match = re.search(pattern, text)
        if match:
            date = match.group(1)
            break
    if not date:
        date = datetime.now().strftime("%d/%m/%Y")
    
    # Parse amount and currency
    amount = None
    currency = "INR"
    amount_patterns = [
        r"Total[:\s]*[$₹€£]?([\d,]+\.?\d{0,2})",
        r"Grand Total[:\s]*[$₹€£]?([\d,]+\.?\d{0,2})",
        r"Amount[:\s]*[$₹€£]?([\d,]+\.?\d{0,2})",
        r"Rs[:.\s]*([\d,]+\.?\d{0,2})",
        r"INR[:.\s]*([\d,]+\.?\d{0,2})",
        r"([\d,]+\.?\d{0,2})\s*Rs",
        r"([\d,]+\.?\d{0,2})\s*INR",
    ]
    for pattern in amount_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            amount_str = match.group(1).replace(",", "")
            amount = float(amount_str)
            if "₹" in text or "rs" in text_lower or "inr" in text_lower:
                currency = "INR"
            elif "€" in text:
                currency = "EUR"
            elif "£" in text:
                currency = "GBP"
            elif "$" in text:
                currency = "USD"
            break
    
    print("Test Results:")
    print(f"Merchant Name: {merchant_name}")
    print(f"Date: {date}")
    print(f"Amount: {amount}")
    print(f"Currency: {currency}")
    return {
        "merchant_name": merchant_name,
        "date": date,
        "amount": amount,
        "currency": currency
    }

if __name__ == "__main__":
    test_text = """Test Merchant
Date: 24/06/2026
Total: Rs 415.00"""
    print("Testing with text:", test_text)
    test_ocr_parsing(test_text)
