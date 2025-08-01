"""Create a short intro video from a portrait image using gTTS and moviepy."""

from gtts import gTTS
from moviepy.editor import AudioFileClip, ImageClip


def make_intro(
    text: str,
    image_path: str,
    duration: int = 10,
    language: str = "da",
    movement: bool = True,
) -> str:
    """Generate an mp4 video with the given text read aloud over the image.

    Adds a gentle zoom and pan effect when ``movement`` is True so the
    resulting video feels more dynamic.

    Args:
        text: The text to read.
        image_path: Path to the portrait image.
        duration: Video length in seconds.
        language: gTTS language code (default "da" for Danish).
        movement: Apply a simple Ken Burns style animation.

    Returns:
        Path to the created mp4 file.
    """
    tts = gTTS(text, lang=language)
    audio_file = "intro_audio.mp3"
    tts.save(audio_file)

    clip = ImageClip(image_path).set_duration(duration)
    if movement:
        # Zoom in 10% over the duration and pan slightly upward
        clip = clip.resize(lambda t: 1 + 0.1 * t / duration)
        clip = clip.set_position(lambda t: ("center", int(-20 * t)))

    audio = AudioFileClip(audio_file)
    video = clip.set_audio(audio)

    out_file = "intro_video.mp4"
    video.write_videofile(out_file, fps=24)
    return out_file


if __name__ == "__main__":
    MESSAGE = (
        "Hej, jeg hedder Maria. Jeg er 49 \u00E5r og gl\u00E6der mig til at m\u00F8de nye mennesker!"
    )
    IMAGE = "maria.jpg"
    print(f"Creating video using {IMAGE}...")
    result = make_intro(MESSAGE, IMAGE)
    print(f"Video gemt som {result}")

