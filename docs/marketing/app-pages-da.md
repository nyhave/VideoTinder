# Beskrivelse af appens sider

## Brugerens profil
- **Overordnede aktioner**
  - Log ud og vend tilbage til loginskærmen.
  - Vis offentlig profil som andre ser den.
  - Gå til siden "Om RealDate".
  - Boost din profil for øget synlighed (1, 2 eller 4 gange pr. måned afhængigt af abonnement).
- **Informationer der kan uploades efter redigering**
  - Profilbillede
  - Videoklip 1 ("Introduktion")
  - Kort tekst om brugeren ("clip")
  - Videoklip 2 og 3
- En hjælpefunktion i toppen guider brugeren gennem disse skridt.
- Brugeren kan slette sin profil.
- Videoklip kan maksimalt vare 10 sekunder (15 sekunder med Gold, 25 sekunder med Platinum); en timer tæller ned under optagelsen, og Gold/Platinum kan tilføje baggrundsmusik.
- inden en optagelse vises brugerens video illede og der tælles ned 3-2-1.
- Gold og Platinum kan verificere profilen og få et badge.
- **Indstillinger**
  - Vælg køn og aldersinterval for kandidater. Gold og Platinum får adgang til alle avancerede filtre.
  - Markér op til fem interesser, der kan bruges i interessechatten og kan øge march score
  - Aktiver incognito-tilstand for anonym browsing (kun Platinum).

## Dagens klip
- Ved indgang vises listen med kandidatprofiler samt eventuelle ratede eller likede profiler.
- Listen indeholder aktive profiler fra tidligere dage plus dagens nye (3 gratis, 5 med Silver, 8 med Gold og 10 med Platinum).
- Hvis serveren returnerer for få nye profiler, vises kun de profiler, der er tilgængelige.
- Gratis brugere ser bannerannoncer; Silver og opefter er reklamefri.
- Brugeren kan skrive en privat refleksion, og Gold samt Platinum kan også give en rating på 1–4 stjerner.
- Refleksioner gemmes for alle, mens ratings for Gold og Platinum vises sammen med refleksionskalenderen.
- **Handlinger på kandidatlisten**
  - Åbn en profil for at se den offentlige kandidatprofil.
  - Vælg "Like" (kan blive til et match).
  - Vælg "Super like" for at signalere ekstra interesse (1, 3 eller 5 pr. uge afhængigt af abonnement).
  - Vælg "Remove" for at fjerne profilen helt, medmindre rating 3 eller 4 er givet
    (så vises den under ratede eller likede profiler).
  - Silver kan fortryde den seneste "Remove"; Gold og Platinum kan fortryde flere.
  - Brugeren kan én gang dagligt købe ekstra profiler (gratis nu - betaling ikke implementeret).

### Offentlig kandidatprofil
- Brugerens clip er altid tilgængeligt, men videoen afsløres gradvist:
  - Dag 1: kun video 1
  - Dag 2: video 1 og 2
  - Efterfølgende dage: alt materiale
- Brugeren kan se tilgængeligt materiale og skrive en refleksion med rating 1–4 (med rette subacription)
  samt give et like.
- Verificerede profiler (Gold og Platinum) viser et badge.

## Dagens reflektion
- Kalender med oversigt over egne refleksioner.
- Brugeren kan skrive en kort, privat tekst for hver dag.
- Refleksioner kan knyttes til profiler og vises sammen med eventuelle ratings.

## Chat
- Matchede profiler vises på en liste.
- Chat med matchede brugere.
- Start videokald.
- Mulighed for at unmatche.
- Gold og Platinum får læsekvitteringer og skriverindikatorer.

## Interessechat og Realetten
- Chat i grupper baseret på valgte interesser (kræver mindst Silver).
- Gold og Platinum får prioriteret placering i chatlisterne (Platinum med topprioritet).
- Mulighed for at starte Realetten – et turbaseret spil kombineret med fælles videokald (kun for Silver+).
- Realetten kan spilles sammen med andre brugere eller mod en indbygget AI.

## Notifikationer
- Viser systembeskeder og invitationer sorteret efter dato.
- Kort tilbageknap til forrige skærm.

## Om RealDate
- Fejlmelding med mulighed for vedhæftet skærmbillede.
- Inviter op til ti venner og tilbyd gratis premium-abonnement.
  Når en invitation er sendt, følges der med i, om brugeren opretter profil.

## Du er blevet liket
- Viser en liste over kandidatprofiler, hvis brugeren har Gold eller Platinum.
- Uden Gold/Platinum er listen sløret, og brugeren får tilbud om at opgradere.

## Login og opret bruger
- Log ind med e-mail eller Google.

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
