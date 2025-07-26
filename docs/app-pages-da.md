# Beskrivelse af appens sider

## Brugerens profil
- **Overordnede aktioner**
  - Log ud og vend tilbage til loginskærmen.
  - Vis offentlig profil som andre ser den.
  - Gå til siden "Om RealDate".
- **Informationer der kan uploades efter redigering**
  - Profilbillede
  - Videoklip 1 ("Introduktion")
  - Kort tekst om brugeren ("clip")
  - Videoklip 2 og 3
- En hjælpefunktion i toppen guider brugeren gennem disse skridt.
- Brugeren kan slette sin profil.
- Videoklip kan maksimalt vare 10 sekunder, og en timer tæller ned under optagelsen.

## Dagens klip
- Ved indgang vises listen med kandidatprofiler samt eventuelle arkiverede profiler.
- Listen indeholder aktive profiler fra tidligere dage plus dagens nye (3 eller 6).
- Hvis serveren returnerer for få nye profiler, kan brugeren udvide maks-afstanden.
- **Handlinger på kandidatlisten**
  - Åbn en profil for at se den offentlige kandidatprofil.
  - Vælg "Like" (kan blive til et match).
  - Vælg "Remove" for at fjerne profilen helt, medmindre rating 3 eller 4 er givet 
    (så vises den under arkiverede profiler).
- Brugeren kan én gang dagligt købe ekstra profiler.

### Offentlig kandidatprofil
- Brugerens clip er altid tilgængeligt, men videoen afsløres gradvist:
  - Dag 1: kun video 1
  - Dag 2: video 1 og 2
  - Efterfølgende dage: alt materiale
- Brugeren kan se tilgængeligt materiale og skrive en refleksion med rating 1–4
  samt give et like.

## Chat
- Matchede profiler vises på en liste.
- Chat med matchede brugere.
- Start videokald.
- Mulighed for at unmatche.

## Om RealDate
- Fejlmelding med mulighed for vedhæftet skærmbillede.
- Inviter op til fem venner og tilbyd gratis premium-abonnement. 
  Når en invitation er sendt, følges der med i, om brugeren opretter profil.

## Du er blevet liket
- Viser en liste over kandidatprofiler, hvis brugeren har premium.
- Uden premium er listen sløret, og brugeren får tilbud om at købe premium.

## Login og opret bruger
- Log ind med e-mail, Facebook eller Google.

## Uden for app’en hos Netlify
- Hjemmeside med baggrund og link til appen.
- Pushnotifikationer håndteres herfra.
- Funktion til at hente dagens profiler fra databasen og score dem.
- **Scoresystem**
  - Udfyldt profil
  - Fælles interesser

## Adminsiden
- **Daglig administration**
  - Håndtering af anmeldt materiale og sletning af brugere.
- **Business og statistik**
  - Grafer over udvikling i brugerantal, uploads, likes, matches, chats,
    refleksioner og ratings.
  - Øjebliksbillede af aldersfordeling.
- **Testere**
  - Mulighed for at se appen som en bestemt bruger.
  - Mulighed for at sætte datoen frem og tilbage lokalt for at teste dagsflowet.
  - Bemærk at refleksioner gemmes i fremtiden, hvis funktionen benyttes.
- **Udviklere**
  - Verifikation af teknisk opsætning, eksempelvis pushnotifikationer.
