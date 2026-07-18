import os
from docx import Document
from PIL import Image
from google import genai
import fitz  # PyMuPDF
from langchain.text_splitter import RecursiveCharacterTextSplitter
from matching.vector_store import embed_chunks

# =========================
# Gemini client
# =========================
def get_gemini_client():
    api_key = os.getenv("APP_API_KEY")
    if not api_key:
        raise RuntimeError("APP_API_KEY not set")
    return genai.Client(api_key=api_key)

# =========================
# File type detection
# =========================
def f_type(path):
    ext = os.path.splitext(path)[1].lower()
    if ext == ".pdf":
        return "pdf"
    if ext == ".docx":
        return "docx"
    if ext in [".png", ".jpg", ".jpeg"]:
        return "image"
    return "unknown"

# =========================
# PDF extraction
# =========================
def extract_from_pdf(path):
    doc = fitz.open(path)
    return "".join(page.get_text() for page in doc)

# =========================
# DOCX extraction
# =========================
def extract_from_docx(path):
    doc = Document(path)
    return "\n".join(
        p.text.strip() for p in doc.paragraphs if p.text.strip()
    )

# =========================
# Image extraction (Gemini Vision)
# =========================
def extract_from_image(path):
    client = get_gemini_client()
    img = Image.open(path)

    from tenacity import retry, stop_after_attempt, wait_exponential

    @retry(stop=stop_after_attempt(5), wait=wait_exponential(multiplier=1, min=2, max=10))
    def _call_gemini():
        return client.models.generate_content(
            model="gemini-3.5-flash",
            contents=[
                img,
                "Extract all text from this image. Return ONLY plain text."
            ]
        )
    response = _call_gemini()
    return response.text.strip()

# =========================
# Main resume processing (Langchain Integration)
# =========================
def extract_resume_chunks(file_path, session_id):
    t = f_type(file_path)

    if t == "pdf":
        extracted_text = extract_from_pdf(file_path)
    elif t == "docx":
        extracted_text = extract_from_docx(file_path)
    elif t == "image":
        extracted_text = extract_from_image(file_path)
    else:
        raise ValueError("Unsupported resume file type")

    # Langchain Text Splitter
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        separators=["\n\n", "\n", ".", " ", ""]
    )
    
    chunks = text_splitter.split_text(extracted_text)
    
    formatted_chunks = [{"chunk_text": chunk, "section": "resume"} for chunk in chunks]
    
    # Store in ChromaDB
    embed_chunks(formatted_chunks, session_id, "resume")

    return extracted_text
