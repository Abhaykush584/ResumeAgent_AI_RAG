import sys
import os
import traceback

try:
    from app import app, db
    from extraction.extractor import extract_resume_chunks
    from matching.jd_parser import process_jd_and_embed

    with app.app_context():
        resume_file = "/app/uploaded_files/ff4c1987-2972-4606-86d1-e3c4fb452b24/resume.pdf"
        jd_file = "/app/uploaded_files/ff4c1987-2972-4606-86d1-e3c4fb452b24/jd.pdf"
            
        print("Testing resume chunks...")
        try:
            res = extract_resume_chunks(resume_file, "ff4c1987-2972-4606-86d1-e3c4fb452b24")
            print("Result length:", len(res))
        except Exception as e:
            traceback.print_exc()

        print("Testing jd...")
        try:
            jd_res = process_jd_and_embed(jd_file, "ff4c1987-2972-4606-86d1-e3c4fb452b24")
            print("JD Result length:", len(jd_res))
        except Exception as e:
            traceback.print_exc()
            
        print("Testing analysis...")
        try:
            from extraction.analyzer import generate_resume_analysis
            analysis = generate_resume_analysis(res, jd_res)
            print("Analysis complete")
        except Exception as e:
            traceback.print_exc()
except Exception as main_e:
    traceback.print_exc()
