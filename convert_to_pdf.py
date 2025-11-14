#!/usr/bin/env python3
"""
HTML to PDF converter using WeasyPrint
"""

from weasyprint import HTML
import sys

def convert_html_to_pdf(html_file, pdf_file):
    """Convert HTML file to PDF"""
    try:
        print(f"Converting {html_file} to {pdf_file}...")
        HTML(html_file).write_pdf(pdf_file)
        print(f"✓ PDF created successfully: {pdf_file}")
        return True
    except Exception as e:
        print(f"✗ Error converting to PDF: {e}")
        return False

if __name__ == "__main__":
    html_path = "docs/DOCUMENTATION.html"
    pdf_path = "docs/DOCUMENTATION.pdf"

    success = convert_html_to_pdf(html_path, pdf_path)
    sys.exit(0 if success else 1)
