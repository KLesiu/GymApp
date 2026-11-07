# Instrukcje dla agenta — Inżynierka / LiftContext

Projekt obejmuje aplikację mobilną podopiecznego (`mobile`), panel trenera (`liftcontext-coach`) i API (`express-api`). Zachowaj istniejący stack i wymagania funkcjonalne opisane w odpowiednich issues.

## Design aplikacji mobilnej

Wybrany przez autora styl to **02 Nordic Coach**. Przed zmianami UI przeczytaj [mobile/DESIGN.MD](mobile/DESIGN.MD) oraz zadanie modułu. W dokumencie znajdują się normatywne kolory, typografia, komponenty, mapa 36 ekranów, nazwy właściwych plansz i poprawki artefaktów generowania.

**Cały design aplikacji znajduje się na komputerze autora w:**

```text
C:\Users\kubax\Desktop\Inżynierka\Inżynierka Design
```

Obejrzyj atlas `36-screen Nordic Coach app atlas-12.png` i właściwą planszę szczegółową. Dla siłowni/treningu używaj `Nordic Coach Screen 13 Navigation Fix-9.png`, dla historii/postępów `Nordic Coach six-screen progress board-11.png`. Pełny spis w DESIGN.MD.

Ścieżka wskazuje lokalny katalog autora. Jeśli Twoje środowisko go nie udostępnia, korzystaj z dostarczonej kopii plików albo odnotuj brak potrzebnej referencji. Nie twierdź, że sprawdziłeś niedostępny katalog, i nie dodawaj tej ścieżki do kodu aplikacji.

## Reguły wdrożenia

- Nawigacja główna: **Start · Trening · Postępy · Trener · Profil**.
- Trening zawiera **Plany · Ćwiczenia · Siłownie**. Ekran Moje siłownie należy do Treningu.
- Trener zawiera **Dieta · Raporty · Współpraca**. Raporty wymagają aktywnej współpracy i są dostępne wyłącznie w tej sekcji, z kontrolą dostępu również w API.
- Zastosuj paletę Nordic Coach z DESIGN.MD; stare zielono-żółte tokeny opisują poprzedni kierunek i wymagają migracji.
- Poprawione reguły dokumentu mają pierwszeństwo nad sprzecznymi detalami wygenerowanych obrazów. Nie kopiuj przykładowych danych ani błędów nawigacji z PNG.
- Formularz raportu jest dynamiczny (wersjonowane TEXT/NUMBER/SCALE/CHOICE); trzy pola pokazane na makiecie są przykładem.
- Dieta D07 jest zatwierdzona. Ranking publiczny D03, pełne PL/EN D02 i pozostałe dodatki mają własne decyzje; obecność na makiecie nie oznacza ich zatwierdzenia.
- Wspólne tokeny/nawigację, Start i Profil realizuje [#36](https://github.com/KLesiu/GymApp/issues/36). Końcowy odbiór wizualny prowadzi [#22](https://github.com/KLesiu/GymApp/issues/22).
- W PR implementacyjnym podaj referencyjne ekrany, SHA, zrzuty działającej aplikacji i adekwatną weryfikację zachowania. Sama specyfikacja lub koncepcyjny PNG nie oznacza ukończenia funkcji.

Panel trenera stosuje [liftcontext-coach/DESIGN.MD](liftcontext-coach/DESIGN.MD) i wspólne zasady marki; makiety telefoniczne nie definiują jego układu desktopowego.
