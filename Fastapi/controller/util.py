import json
import re
import time

import yt_dlp
import requests
from langchain_text_splitters import RecursiveCharacterTextSplitter
from tqdm import tqdm
from faster_whisper import WhisperModel, BatchedInferencePipeline

# Ollama's OpenAI-compatible endpoint (/v1/chat/completions) silently ignores
# "think" — the request succeeds but the whole response ends up in a "reasoning"
# field with empty content, since qwen3.5 is a thinking model by default. Its
# native /api/chat endpoint does honor "think": false, so we talk to that
# directly instead of going through the openai SDK.
OLLAMA_CHAT_URL = "http://localhost:11434/api/chat"
LLM_MODEL = "qwen3.5:9b"

MAX_RETRIES = 3
RETRY_BACKOFF_SECONDS = 2
QUIZ_QUESTION_COUNT = 5

model = WhisperModel(
    "large-v3",
    device="cuda",
    compute_type="float16"
)

batched_model = BatchedInferencePipeline(model=model)

def download_video_audio(video_id: int, url: str) -> str:
    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": f"downloads/{video_id}.%(ext)s"
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)

    return f"downloads/{video_id}.{info['ext']}"

def transcribe_audio(audio_path: str) -> dict:
    segments, _info = batched_model.transcribe(
        audio_path,
        beam_size=3,
        batch_size=16
    )

    transcript = []
    chunks = []
    for segment in segments:
        transcript.append(segment.text)
        # Kept per-segment so the frontend can show a timestamped transcript,
        # not just one giant block of text — transcribeScheduler.py stores
        # this as Transcribe.chunks (JSON) alongside the plain-text version.
        chunks.append({"timestamp": [segment.start, segment.end], "text": segment.text})

    return {"text": " ".join(transcript), "chunks": chunks}

def _call_llm_with_retry(messages, model=LLM_MODEL, temperature=None):
    payload = {"model": model, "messages": messages, "think": False, "stream": False}
    if temperature is not None:
        payload["options"] = {"temperature": temperature}

    last_error = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = requests.post(OLLAMA_CHAT_URL, json=payload, timeout=180)
            response.raise_for_status()
            return response.json()["message"]["content"]
        except Exception as e:
            last_error = e
            if attempt < MAX_RETRIES:
                time.sleep(RETRY_BACKOFF_SECONDS * (2 ** (attempt - 1)))

    raise last_error

def translate_text(text: str, existing_progress: list[str] | None = None, on_progress=None) -> str:
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=2500, chunk_overlap=200)
    chunks = text_splitter.split_text(text)

    translations = list(existing_progress or [])

    for chunk in tqdm(chunks[len(translations):], desc="Translating", unit="chunk"):
        messages = [
            {
                "role": "system",
                "content": """You are a professional translator.

                    Translate the user's text into natural English.

                    Rules:
                    - Preserve meaning exactly.
                    - Do not summarize.
                    - Do not explain.
                    - Return only the translation."""
            },
            {
                "role": "user",
                "content": f"""
                    {chunk}
                """
            }
        ]

        content = _call_llm_with_retry(model=LLM_MODEL, temperature=0, messages=messages)
        translations.append(content.strip())

        if on_progress:
            on_progress(translations)

    return "".join(translations)

def summarize_text(text: str, existing_chunk_progress: list[str] | None = None, on_chunk_progress=None) -> str:
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=3500, chunk_overlap=200)
    chunks = text_splitter.split_text(text)

    summaries = list(existing_chunk_progress or [])

    GROUP_SIZE = 5
    for chunk in tqdm(chunks[len(summaries):], desc="Summarizing", unit="chunk"):
        messages = [
            {"role": "system", "content": """Summarize ONLY this portion of the lecture.
                Keep:
                - definitions
                - examples
                - formulas
                - names
                - technical details

                Do not assume knowledge from other sections.
                Do not write a final conclusion.
                Return only the summary.
            """},
            {"role": "user", "content": f"""{chunk}"""}
        ]

        content = _call_llm_with_retry(model=LLM_MODEL, messages=messages)
        summaries.append(content)

        if on_chunk_progress:
            on_chunk_progress(summaries)

    while len(summaries) > 1:
        next_level = []

        for i in tqdm(range(0, len(summaries), GROUP_SIZE)):
            group = summaries[i:i + GROUP_SIZE]
            next_level.append(_summarize_group(group))

        summaries = next_level

    final_messages = [
        {"role": "system", "content": """Produce the final lecture summary.

            Return:
            ## Overview

            ## Key Concepts

            ## Important Takeaways.

        """},
        {"role": "user", "content": f"""{summaries[0]}"""}
    ]

    return _call_llm_with_retry(model=LLM_MODEL, messages=final_messages)

def _summarize_group(group: list[str]) -> str:
    combined = "\n\n".join(group)
    messages = [
        {"role": "system", "content": """These are summaries of consecutive sections of the same lecture.
            Merge them into one coherent summary.

            Requirements:
            - Preserve all important information.
            - Remove duplicate ideas.
            - Keep technical terminology.
            - Maintain chronological order.
            - Do not invent new information.
            Return only the merged summary.
        """},
        {"role": "user", "content": f"""{combined}"""}
    ]

    return _call_llm_with_retry(model=LLM_MODEL, messages=messages)

def generate_quiz(summary: str, num_questions: int = QUIZ_QUESTION_COUNT) -> list[dict]:
    messages = [
        {"role": "system", "content": f"""You are creating a quiz from a lecture summary.

            Create exactly {num_questions} multiple-choice questions that test understanding of the material below.

            Rules:
            - Every question and its correct answer must be fully supported by the summary — do not invent facts, numbers, or claims that aren't in it.
            - Questions may be worded differently from the summary (don't just copy sentences), but the concept being tested must be covered in the summary.
            - Always Provide exactly 4 options per question, with exactly one correct answer.
            - Return ONLY a JSON array, no prose, no markdown code fences.
            - Each item must have exactly these keys: "question" (string), "options" (array of 4 strings), "answer" (string that exactly matches one of the options).
            - Write any math in plain text (e.g. x^2, P(x) = Bx + C). Do not use LaTeX notation or backslash commands (no \\(, \\), \\neq, \\sum, etc.) — they break JSON parsing.
        """},
        {"role": "user", "content": summary}
    ]

    last_error = None
    for attempt in range(MAX_RETRIES):
        content = _call_llm_with_retry(model=LLM_MODEL, temperature=0, messages=messages)
        content = _strip_json_fences(content.strip())
        content = _sanitize_json_escapes(content)
        content = _strip_trailing_commas(content)

        try:
            questions = json.loads(content)
        except json.JSONDecodeError as e:
            questions = []
            for obj_text in _extract_json_objects(content):
                try:
                    questions.append(json.loads(obj_text))
                except json.JSONDecodeError:
                    continue
            if not questions:
                last_error = e
                continue

        valid_questions = _filter_valid_quiz_questions(questions)
        if valid_questions:
            return valid_questions

        last_error = ValueError("quiz response had no valid questions")

    raise ValueError(f"LLM did not return a valid quiz after {MAX_RETRIES} attempts") from last_error

def _sanitize_json_escapes(text: str) -> str:
    return re.sub(r'\\(?!["\\/bfnrtu])', r'\\\\', text)

def _strip_trailing_commas(text: str) -> str:
    return re.sub(r',(\s*[\]}])', r'\1', text)

def _extract_json_objects(text: str) -> list[str]:
    objects = []
    depth = 0
    start = None

    for i, ch in enumerate(text):
        if ch == "{":
            if depth == 0:
                start = i
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0 and start is not None:
                objects.append(text[start:i + 1])
                start = None

    return objects

def _strip_json_fences(text: str) -> str:
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else ""
        if text.endswith("```"):
            text = text.rsplit("```", 1)[0]
    return text.strip()

def _filter_valid_quiz_questions(questions):
    if not isinstance(questions, list):
        return []

    valid = []
    for q in questions:
        if not isinstance(q, dict) or not all(k in q for k in ("question", "options", "answer")):
            continue
        if not isinstance(q["options"], list) or len(q["options"]) != 4:
            continue
        if q["answer"] not in q["options"]:
            continue
        valid.append(q)

    return valid
