import json
import time

import yt_dlp
import torch
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline
from openai import OpenAI
from langchain_text_splitters import RecursiveCharacterTextSplitter
from tqdm import tqdm

llm_client = OpenAI(base_url="http://localhost:11434/v1", api_key="api")
LLM_MODEL = "gpt-oss:20b"

MAX_RETRIES = 3
RETRY_BACKOFF_SECONDS = 2

device = "cuda"
torch_dtype = torch.float16

model_id = "openai/whisper-medium"
whisper_model = AutoModelForSpeechSeq2Seq.from_pretrained(
    model_id, torch_dtype=torch_dtype, low_cpu_mem_usage=True, use_safetensors=True
)
whisper_model.to(device)

processor = AutoProcessor.from_pretrained(model_id)

pipe = pipeline(
    "automatic-speech-recognition",
    model=whisper_model,
    tokenizer=processor.tokenizer,
    feature_extractor=processor.feature_extractor,
    torch_dtype=torch_dtype,
    device=device,
)

def download_video_audio(video_id: int, url: str) -> str:
    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": f"downloads/{video_id}.%(ext)s"
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)

    return f"downloads/{video_id}.{info['ext']}"

def transcribe_audio(audio_path: str) -> dict:
    return pipe(audio_path, return_timestamps=True)

def _call_llm_with_retry(**kwargs):
    last_error = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            return llm_client.chat.completions.create(**kwargs)
        except Exception as e:
            last_error = e
            if attempt < MAX_RETRIES:
                time.sleep(RETRY_BACKOFF_SECONDS * (2 ** (attempt - 1)))

    raise last_error

def translate_text(text: str, existing_progress: list[str] | None = None, on_progress=None) -> str:
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1500, chunk_overlap=0)
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

        response = _call_llm_with_retry(model=LLM_MODEL, temperature=0, messages=messages)
        translations.append(response.choices[0].message.content.strip())

        if on_progress:
            on_progress(translations)

    return "".join(translations)

def summarize_text(text: str, existing_chunk_progress: list[str] | None = None, on_chunk_progress=None) -> str:
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1500, chunk_overlap=100)
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

        response = _call_llm_with_retry(model=LLM_MODEL, messages=messages)
        summaries.append(response.choices[0].message.content)

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

    response = _call_llm_with_retry(model=LLM_MODEL, messages=final_messages)
    return response.choices[0].message.content

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

    response = _call_llm_with_retry(model=LLM_MODEL, messages=messages)
    return response.choices[0].message.content

QUIZ_QUESTION_COUNT = 5

def generate_quiz(summary: str, num_questions: int = QUIZ_QUESTION_COUNT) -> list[dict]:
    messages = [
        {"role": "system", "content": f"""You are creating a quiz from a lecture summary.

            Create exactly {num_questions} multiple-choice questions that test understanding of the material below.

            Rules:
            - Every question and its correct answer must be fully supported by the summary — do not invent facts, numbers, or claims that aren't in it.
            - Questions may be worded differently from the summary (don't just copy sentences), but the concept being tested must be covered in the summary.
            - Provide exactly 4 options per question, with exactly one correct answer.
            - Return ONLY a JSON array, no prose, no markdown code fences.
            - Each item must have exactly these keys: "question" (string), "options" (array of 4 strings), "answer" (string that exactly matches one of the options).
        """},
        {"role": "user", "content": summary}
    ]

    last_error = None
    for attempt in range(MAX_RETRIES):
        response = _call_llm_with_retry(model=LLM_MODEL, temperature=0, messages=messages)
        content = _strip_json_fences(response.choices[0].message.content.strip())

        try:
            questions = json.loads(content)
            _validate_quiz_questions(questions)
            return questions
        except (json.JSONDecodeError, ValueError) as e:
            last_error = e

    raise ValueError(f"LLM did not return a valid quiz after {MAX_RETRIES} attempts") from last_error

def _strip_json_fences(text: str) -> str:
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else ""
        if text.endswith("```"):
            text = text.rsplit("```", 1)[0]
    return text.strip()

def _validate_quiz_questions(questions):
    if not isinstance(questions, list) or not questions:
        raise ValueError("quiz response was not a non-empty list")

    for q in questions:
        if not isinstance(q, dict) or not all(k in q for k in ("question", "options", "answer")):
            raise ValueError("quiz question missing required keys")
        if not isinstance(q["options"], list) or len(q["options"]) != 4:
            raise ValueError("quiz question must have exactly 4 options")
        if q["answer"] not in q["options"]:
            raise ValueError("quiz answer must match one of the options")
