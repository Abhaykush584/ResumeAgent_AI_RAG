import os
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone, ServerlessSpec
from typing import List
from langchain_core.embeddings import Embeddings
from google import genai
import time

class NewGoogleEmbeddings(Embeddings):
    def __init__(self, api_key: str, model: str = "gemini-embedding-2-preview"):
        self.client = genai.Client(api_key=api_key)
        self.model = model

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        from tenacity import retry, stop_after_attempt, wait_exponential

        @retry(stop=stop_after_attempt(5), wait=wait_exponential(multiplier=1, min=2, max=10))
        def _call_gemini(text):
            return self.client.models.embed_content(model=self.model, contents=text)

        all_embeddings = []
        for text in texts:
            # We must process them one by one since `contents=list` treats it as a single multi-part prompt
            res = _call_gemini(text)
            all_embeddings.append(res.embeddings[0].values)
            time.sleep(0.5) # rate limit prevention
        return all_embeddings

    def embed_query(self, text: str) -> List[float]:
        from tenacity import retry, stop_after_attempt, wait_exponential

        @retry(stop=stop_after_attempt(5), wait=wait_exponential(multiplier=1, min=2, max=10))
        def _call_gemini():
            return self.client.models.embed_content(model=self.model, contents=text)

        res = _call_gemini()
        return res.embeddings[0].values

embeddings = NewGoogleEmbeddings(
    api_key=os.getenv("APP_API_KEY"),
    model="gemini-embedding-2-preview"
)

# Initialize Pinecone
pinecone_api_key = os.getenv("PINECONE_API_KEY")
index_name = os.getenv("PINECONE_INDEX_NAME", "resume2job-index")

# We only initialize if the API key is provided, otherwise it will fail
if pinecone_api_key:
    pc = Pinecone(api_key=pinecone_api_key)
    if index_name not in pc.list_indexes().names():
        pc.create_index(
            name=index_name,
            dimension=768, # Gemini embeddings are 768 dimensions
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1")
        )
    vectorstore = PineconeVectorStore(index_name=index_name, embedding=embeddings)
else:
    vectorstore = None
    print("WARNING: PINECONE_API_KEY not set. Vector search will fail.")

def embed_chunks(chunks: list, session_id: str, chunk_type: str):
    """
    chunk_type: 'resume' or 'jd'
    session_id: unique per user session
    """
    texts = []
    metadatas = []
    
    for chunk in chunks:
        if isinstance(chunk, dict):
            text = chunk.get("chunk_text", "").strip()
            if not text:
                continue
            texts.append(text)
            
            meta = {
                "session_id": session_id,
                "type": chunk_type,
                "section": str(chunk.get("section", "unknown"))
            }
            metadatas.append(meta)
            
        elif isinstance(chunk, str):
            text = chunk.strip()
            if not text:
                continue
            texts.append(text)
            metadatas.append({
                "session_id": session_id,
                "type": chunk_type,
                "section": "unknown"
            })
            
    if texts:
        vectorstore.add_texts(texts=texts, metadatas=metadatas)

def get_session_retriever(session_id: str, chunk_type: str = None, k: int = 4):
    """
    Returns a retriever scoped to a specific session.
    """
    filter_dict = {"session_id": session_id}
    if chunk_type:
        filter_dict["type"] = chunk_type
        
    return vectorstore.as_retriever(
        search_kwargs={
            "k": k,
            "filter": filter_dict
        }
    )
