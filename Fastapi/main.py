from fastapi import FastAPI
from apscheduler.schedulers.background import BackgroundScheduler
from controller.fetchAudioScheduler import process_pending_download
from controller.transcribeScheduler import process_pending_transcription
from controller.translateScheduler import process_pending_translation
from controller.summaryScheduler import process_pending_summary
from controller.quizScheduler import process_pending_quiz

app = FastAPI()

scheduler = BackgroundScheduler()
scheduler.add_job(process_pending_download, "interval", minutes=5, id="process_pending_download")
scheduler.add_job(process_pending_transcription, "interval", minutes=2, id="process_pending_transcription")
scheduler.add_job(process_pending_translation, "interval", minutes=1, id="process_pending_translation")
scheduler.add_job(process_pending_summary, "interval", minutes=1, id="process_pending_summary")
scheduler.add_job(process_pending_quiz, "interval", minutes=1, id="process_pending_quiz")

@app.on_event("startup")
def start_scheduler():
    scheduler.start()

@app.on_event("shutdown")
def stop_scheduler():
    scheduler.shutdown()
