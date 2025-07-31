# Python-script til gratis AI-introduktionsvideo

Dette eksempel viser, hvordan du kan generere en kort introvideo til en datingprofil ved hjælp af et gratis AI‑tilbud.  
Eksemplet anvender [gTTS](https://pypi.org/project/gTTS/) til at lave tale fra tekst og [moviepy](https://pypi.org/project/moviepy/) til at samle lyd og billede til en video.  
Du skal selv levere et portrætbillede (f.eks. `maria.jpg`) og en kort tekst, som læses op.

```bash
pip install gtts moviepy
```

```python
from gtts import gTTS
from moviepy.editor import ImageClip, AudioFileClip

# Teksten som Maria skal sige
txt = "Hej, jeg hedder Maria. Jeg er 49 \u00E5r og gl\u00E6der mig til at m\u00F8de nye mennesker!"

# Lav mp3 med tts (kan bruge andre sprog med lang='da')
tts = gTTS(txt, lang='da')

audio_path = "maria_intro.mp3"
tts.save(audio_path)

# Saml billede og lyd til en 10 sekunders video
image_path = "maria.jpg"  # stien til portr\u00E6t
clip = ImageClip(image_path).set_duration(10)
audio = AudioFileClip(audio_path)

video = clip.set_audio(audio)
video.write_videofile("maria_intro.mp4", fps=24)
```

Dette giver en simpel video med Marias billede og hendes introduktion som lydspor.  
Hvis du vil have en mere avanceret animeret avatar, kan du bruge en API som f.eks. D-ID eller HeyGen.  
Begge tilbyder begr\u00E6nsede gratis pr\u00F8ver, hvorefter du skal tilmelde dig en betalt plan.  
API'en fungerer typisk ved, at du sender et billede og en tekst til tjenesten og f\u00E5r et videolink tilbage.

**Husk** at tjekke licens- og brugsbetingelser for den tjeneste du v\u00E6lger, s\u00E5 du sikrer dig rettighederne til at bruge videoen i din datingprofil.
