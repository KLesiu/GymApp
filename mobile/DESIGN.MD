# LiftContext — Nordic Coach

**Obowiązujący kierunek UI:** wariant **02 Nordic Coach**, wybrany przez autora projektu Inżynierka. Specyfikacja doprecyzowana 7 listopada 2026 na podstawie przekazanych makiet 36 ekranów aplikacji mobilnej podopiecznego.

Ten dokument opisuje docelowy interfejs. Zastępuje wcześniejszą zielono-żółtą paletę i nawigację Workout / History / Coach / More. Aktualizacja dokumentacji nie oznacza, że nowe UI jest już wdrożone. Wspólne komponenty, nawigację, Start i Profil realizuje [#36](https://github.com/KLesiu/GymApp/issues/36); ekrany modułów mają właścicieli w tabeli poniżej, a odbiór całości prowadzi [#22](https://github.com/KLesiu/GymApp/issues/22).

## 1. Instrukcja dla agenta i źródła makiet

**Cały design aplikacji znajduje się na komputerze autora w katalogu:**

```text
C:\Users\kubax\Desktop\Inżynierka\Inżynierka Design
```

Przed implementacją przeczytaj ten dokument oraz treść właściwego issue, następnie obejrzyj atlas i odpowiednią planszę szczegółową. To ścieżka lokalna wskazana przez autora, a nie adres HTTP ani zasób aplikacji. Agent na innym komputerze lub w CI powinien korzystać z dostarczonej kopii tych plików. Jeśli jej nie ma, zgłasza brak potrzebnej referencji; nie deklaruje obejrzenia niedostępnego katalogu. Ścieżki Windows nie umieszcza się w kodzie produkcyjnym ani w konfiguracji runtime.

### 1.1. Pliki referencyjne

Nazwy poniżej odpowiadają załącznikom przekazanym w rozmowie. W katalogu autora identyfikuj planszę także po nagłówku oraz numerach ekranów, jeżeli plik został lokalnie przemianowany.

| Oznaczenie | Ekrany | Plik | Rola |
| --- | --- | --- | --- |
| Atlas | 01–36 | `36-screen Nordic Coach app atlas-12.png` | Przegląd zakresu i hierarchii całej aplikacji |
| A | 01–06 | `LiftContext Nordic Coach app screens-6.png` | Konto, Start i plany |
| B | 07–12 | `LiftContext plans and exercise library-4.png` | Edytory planów i biblioteka ćwiczeń |
| C | 13–18 | `Nordic Coach Screen 13 Navigation Fix-9.png` | Siłownie i trening; poprawiony rodzic ekranu 13 |
| D | 19–24 | `Nordic Coach six-screen progress board-11.png` | Historia, pomiary i rating; poprawione ekrany 19, 20 i 24 |
| E | 25–30 | `LiftContext trainer collaboration screen board-8.png` | Relacja, współpraca i dieta |
| F | 31–36 | `LiftContext trainer reports and profile screens-7.png` | Raporty oraz profil |

Pozostałe dostarczone wersje zachowują wartość historycznej referencji: `LiftContext 36-screen mobile app atlas-1.png`, `Nordic Coach 36-screen fitness atlas-2.png`, `Nordic Coach Atlas Navigation Fix-10.png`, `LiftContext gym training screen board-3.png` i `LiftContext progress and ranking screens-5.png`. Szczegóły z tabeli oraz jawne korekty z §8 mają pierwszeństwo nad ich rozbieżnymi elementami. Sama liczba w nazwie pliku nie ustala pierwszeństwa wszystkich detali.

### 1.2. Kolejność rozstrzygania rozbieżności

1. Aktualne ustalenia autora, wymagania funkcjonalne i kontrola dostępu zapisane w issues.
2. Jawne reguły tego DESIGN.MD, w szczególności nawigacja, stany i korekty artefaktów.
3. Poprawione plansze C i D oraz szczegółowe plansze A–F.
4. Atlas jako mapa ekranów i ogólnego układu.

Makieta obrazuje wygląd. Nie zmienia algorytmu ratingu, kontraktu API, wersjonowania raportów, reguł historii ani decyzji o opcjonalnych modułach. Przykładowe imiona, kody, daty, wyniki i liczby tygodni nie mogą zostać zaszyte jako dane aplikacji. Ramki telefonów, nagłówki plansz, tło pomiędzy telefonami oraz narysowana godzina i bateria nie należą do UI produktu.

## 2. Marka i charakter interfejsu

Nazwa produktu i aplikacji: **LiftContext**. „Nordic Coach” to nazwa kierunku wizualnego, nie dodatkowa nazwa aplikacji. Opis projektu: aplikacja mobilna do ewidencji treningowej, kontekstowego porównywania wyników i współpracy trener–podopieczny. Hasło pomocnicze: „Porównuj wyniki we właściwym kontekście.”

Interfejs jest jasny, spokojny i czytelny: chłodna biel, jasny błękit, granatowy tekst, mocny niebieski dla głównej akcji i aktywnego wyboru. Karty mają delikatne obrysy, miękkie narożniki i dużo oddechu. Duże liczby porządkują trening i postępy. Zieleń i mięta oznaczają potwierdzenie lub status sukcesu; nie są głównym kolorem marki.

Nie dodawaj neonów, płomieni, ciężkich cieni, fotografii siłowni jako tła ani nieczytelnych dekoracji. Podstawowy wariant objęty makietami jest jasny. Nie wprowadzaj osobnego ciemnego motywu jako domniemanego zakresu tego zadania.

### 2.1. Identyfikatory techniczne

| Element | Wartość |
| --- | --- |
| Display name / nazwa produktu | `LiftContext` |
| Folder aplikacji w monorepo | `mobile` |
| npm package / Expo slug | `liftcontext-mobile` |
| URL scheme | `liftcontext` |
| Android application ID / namespace | `pl.jakubleskiewicz.liftcontext` |
| iOS bundle identifier | `pl.jakubleskiewicz.liftcontext` |
| iOS product/display name | `LiftContext` |
| Orval config key | `liftContextApi` |
| Generated API directory | `src/api/generated` |
| Public API URL variable | `EXPO_PUBLIC_API_URL` |

Zmiana wyglądu nie wymaga zmiany tych identyfikatorów. Nadal obowiązuje własna identyfikacja LiftContext i audyt pochodzenia zasobów w [#4](https://github.com/KLesiu/GymApp/issues/4).

### 2.2. Logo i ikony

Istniejące źródło wektorowe logo: `mobile/assets/brand/liftcontext-icon.svg`. Przy migracji użyj własnego niebieskiego znaku LiftContext i granatowego wordmarku zgodnie z planszami A/F; odnotuj pochodzenie oraz ewentualną zmianę geometrii w #4. Stary żółty punkt i turkus nie są obowiązującymi akcentami Nordic Coach. Nie wycinaj logo ani ikon z niskorozdzielczej planszy.

Zachowaj proporcje znaku, minimum 24 × 24 dp w UI i margines ochronny. Nie dodawaj 3D ani zdjęć do logo. Eksporty generuj bezpośrednio z własnego SVG: `icon.png` i `adaptive-icon.png` 1024 × 1024, `splash-icon.png` minimum 512 × 512, opcjonalny `favicon.png` 48 × 48. Ikona adaptacyjna musi zachować bezpieczny obszar.

Używaj jednego spójnego zestawu ikon konturowych, optyczna grubość około 2 dp, standardowo 24 dp. W repo istnieje użycie Ionicons; dobieraj spójne odpowiedniki z istniejącego zestawu. Trener otrzymuje ikonę osób, Profil pojedynczej osoby, Trening hantla/sztangi. Unikaj dwóch identycznych ikon Trener i Profil. Własna prosta odznaka rangi jest dopuszczalna jako element ratingu.

## 3. Paleta implementacyjna

**Poniższe wartości są normatywną paletą dobraną do wyglądu przekazanych PNG.** Raster zawiera gradienty i wygładzanie; nie dostarcza oryginalnych tokenów ani wiarygodnej nazwy fontu. Kolory błędów, ostrzeżeń, fokusu i disabled uzupełniają stany niepokazane na makietach. Implementacja korzysta z tokenów, a nie z niezależnego próbkowania każdego ekranu.

| Token | HEX | Zastosowanie |
| --- | --- | --- |
| `canvas` | `#F8FBFE` | Główne chłodne tło |
| `surface` | `#FFFFFF` | Pola, karty neutralne, modale, dolna nawigacja |
| `surfaceMuted` | `#E6F3FF` | Błękitne karty, segmenty nieaktywne, informacje |
| `surfaceSelected` | `#CFE6FC` | Zaznaczona karta, benchmark, wiersz użytkownika |
| `ink` | `#0B1224` | Tekst główny, ikony neutralne i liczby |
| `textMuted` | `#475569` | Tekst pomocniczy, opisy i etykiety osi |
| `border` | `#C4D9EC` | Dekoracyjne obrysy kart, separatory, siatka wykresu |
| `controlBorder` | `#64748B` | Granice pól wymagające wyraźnego kontrastu |
| `primary` | `#0057E8` | Główne CTA, aktywna zakładka/segment, link, seria wykresu |
| `primaryPressed` | `#003FD4` | Wciśnięcie, mocniejszy akcent niebieski |
| `onPrimary` | `#FFFFFF` | Tekst i ikony na głównym CTA |
| `focusRing` | `#0057E8` | Wyraźny fokus wraz z obrysem i odstępem |
| `success` | `#047857` | Potwierdzenie zapisu, aktywna współpraca, dodatnia zmiana ratingu |
| `successSurface` | `#DDF6EB` | Tło potwierdzenia i statusu sukcesu |
| `warning` | `#92400E` | Ostrzeżenie, wymagające uwagi zaległe działanie |
| `warningSurface` | `#FEF3C7` | Tło ostrzeżenia |
| `danger` | `#B42318` | Błąd i akcja destrukcyjna |
| `dangerSurface` | `#FEE4E2` | Tło błędu |
| `disabledSurface` | `#E2E8F0` | Nieaktywna kontrolka |
| `disabledInk` | `#64748B` | Tekst nieaktywnej kontrolki |

Główne CTA ma jednolite `primary`; stan wciśnięty `primaryPressed`. Delikatne przejścia tonalne widoczne na planszach nie uzasadniają innych odcieni przycisku na każdym ekranie. Benchmark używa `surfaceSelected` + `ink` z akcentem `primary`, a nie starego żółtego koloru.

### 3.1. Migracja istniejących tokenów

Wspólne źródło mobilne to `mobile/src/theme/` (`colors.ts`, `typography.ts`, `spacing.ts`, `radii.ts`, `index.ts`, `tokens.ts`). Rozszerz i zaktualizuj je w #36. Jeżeli stary kod używa nazw `context`, `contextDark`, `reference` i `info`, przejściowo mapuj je odpowiednio na `primary`, `primaryPressed`, `surfaceSelected` i `primary`, a następnie sprawdź semantykę komponentów. Jasny `reference` nie nadaje się jako sam kolor małego tekstu. Nie pozostawiaj odrębnej zielono-żółtej palety w komponentach.

Przy migracji istniejące główne przyciski używające `contextDark` należy przełączyć na `primary` w stanie zwykłym oraz `primaryPressed` podczas wciśnięcia; samo przemapowanie aliasów nie kończy migracji.

Panel trenera korzysta ze wspólnej identyfikacji przez [jego specyfikację](../liftcontext-coach/DESIGN.MD); telefoniczne układy nie definiują układu panelu desktopowego.

### 3.2. Kontrast i znaczenie koloru

Przyjmujemy progi odbioru projektu: minimum 4,5:1 dla zwykłego tekstu, 3:1 dla dużego tekstu oraz istotnych granic kontrolek/fokusu. Dekoracyjny `border` jest celowo jasny; nie może być jedynym sygnałem granicy interaktywnego pola. Używaj `controlBorder`, etykiety i widocznego fokusu.

Obliczenia dla pełnych, nieprzezroczystych kolorów dają około 5,95:1 dla bieli na `primary`, 6,72:1 dla `textMuted` na `surfaceMuted` i 4,82:1 dla `success` na `successSurface`. To kontrola tokenów, nie dowód dostępności wszystkich ekranów; kompozycję i realne stany trzeba odebrać w #22.

Status zawsze ma tekst i ikonę. Spadek masy ciała lub obwodu nie jest automatycznie sukcesem; pomiary prezentuj neutralnie. Dla ratingu pokazuj znak zmiany i wartość, także zero oraz wartości ujemne. Kolor nie może sugerować wyniku sprzecznego z API.

## 4. Typografia i liczby

Zachowujemy **Sora** dla nagłówków i dużych metryk oraz **Inter** dla tekstu, formularzy i nawigacji, z systemowym sans-serif jako fallbackiem. To decyzja z dotychczasowej specyfikacji projektu, nie rozpoznanie fontu z PNG. Używaj faktycznie załadowanych wag; nie opieraj hierarchii na nieobecnej wadze 650.

| Styl | Rozmiar / interlinia | Waga |
| --- | --- | --- |
| `display` | 36 / 42 | 700 |
| `metricLarge` | 32 / 38 | 700 |
| `heading1` | 28 / 34 | 700 |
| `heading2` | 22 / 28 | 700 |
| `heading3` | 18 / 24 | 600 |
| `body` | 16 / 24 | 400 |
| `bodyStrong` | 16 / 24 | 600 |
| `caption` | 13 / 18 | 500 |
| `label` | 12 / 16 | 600 |

Rozmiary oznaczają logiczne jednostki mobilne i uwzględniają systemowe skalowanie tekstu. W tabelach serii i metrykach stosuj cyfry tabelaryczne, jeśli font je obsługuje. Jednostka jest zawsze widoczna, ale mniejsza niż główna liczba. Bazowa makieta mobilna i etykiety w tej specyfikacji są po polsku; pełne PL/EN wymaga D02 w #28.

Wprowadzanie liczby musi obsługiwać przecinek dziesiętny w polskim interfejsie. Formatowanie nie zmienia znaczenia jednostek KG/LB, długości ani PERCENT. Brak pomiaru nie jest zerem. Rating to „LiftContext Rating” / „Rating”, nie deklaracja klasycznego Elo ani ocena treningu 1–5.

## 5. Układ i komponenty wspólne

Rozmiary z atlasu nie są wymiarami docelowych ekranów. Siatka odstępów: **4, 8, 12, 16, 24, 32, 40, 48 dp**. Domyślny margines poziomy 20 dp (16 dp na wąskim ekranie), padding karty 16 dp, odstęp sekcji 24 dp. Pole i przycisk mają co najmniej 48 dp wysokości; główny CTA standardowo 52 dp. Każda ikona będąca samodzielnym przyciskiem otrzymuje obszar dotyku co najmniej 48 × 48 dp.

Promienie: małe kontrolki 8 dp, pola 12 dp, przyciski 14 dp, karty 16 dp, większe arkusze 24 dp, pill 999. Obrys standardowo 1 dp; stan aktywny/fokus może otrzymać 2 dp. Hierarchię buduj odstępem, powierzchnią i tekstem. Cień jest opcjonalny, subtelny, bez 3D.

| Komponent | Wymaganie |
| --- | --- |
| Główny przycisk | `primary` + biel, czytelny czasownik, stabilny rozmiar podczas loading, jedna dominująca akcja w danym kontekście |
| Dodatkowy przycisk | Błękitna powierzchnia i tekst `primary` albo biała powierzchnia z obrysem |
| Akcja destrukcyjna | Jednoznaczny tekst, `danger`, potwierdzenie dla usunięcia/zakończenia współpracy lub odrzucenia niezapisanego szkicu |
| Pole formularza | Stała etykieta, wartość, odpowiedni typ klawiatury, komunikat błędu przy polu; placeholder nie zastępuje etykiety |
| Stepper | Ręczna edycja wartości i osobne przyciski minus/plus z etykietami; obsługa separatora i ograniczeń wartości |
| Karta/wiersz | Ikona i tekst, opcjonalna metryka/status oraz chevron; cały właściwy obszar reaguje na dotyk |
| Segmenty i chipy | Aktywny element niebieski z białą etykietą, pozostałe jasne; stan selected dostępny dla czytnika |
| Status | Tekst + ikona + kolor; warianty neutralny, aktywny, zapisany, szkic, oczekujący, wysłany, po terminie, błąd |
| Awatar | Zdjęcie tylko jeśli funkcja jest obsługiwana; bazowo inicjały na błękitnym tle, bez wymuszania uploadu |
| Benchmark | Jasnoniebieska karta bezpośrednio przy polach bieżącej serii: siłownia, numer serii, data źródła, ciężar, powtórzenia i jednostka |
| Wykres | `primary`, dyskretne błękitne wypełnienie, czytelne osie/jednostki, wspólny dataset z listą i sumą, tekstowe podsumowanie |

Wspólne komponenty nie powinny zależeć bezpośrednio od konkretnych DTO. Istniejące prymitywy należy wykorzystać i ujednolicić, zamiast budować osobne style dla każdej planszy.

### 5.1. Stany i zachowanie

- **Loading:** skeleton lub spinner przy właściwej sekcji; brak skoków rozmiaru CTA i wprowadzania fikcyjnych danych.
- **Empty:** jasny opis przyczyny oraz sensowna akcja, np. dodaj siłownię, utwórz plan, dodaj pomiar, połącz z trenerem.
- **Błąd:** zrozumiały komunikat, ponowienie i zachowanie wpisanych danych. Utrata sieci nie pokazuje sukcesu.
- **Disabled:** wyjaśnienie brakującego warunku, jeśli nie wynika z kontekstu. Wysłanie trwa, więc ponowny tap nie tworzy drugiej operacji.
- **Sukces:** dopiero po potwierdzeniu zapisu; dane formularza/szkicu usuwa się zgodnie z kontraktem operacji.
- **Brak uprawnień/relacji:** właściwy stan sekcji i usunięcie niedozwolonych danych z cache; kontrola nawigacji nie zastępuje autoryzacji serwera.

Ekran przewija treść przy małej wysokości, powiększonym tekście i otwartej klawiaturze. Stały dolny CTA nie zasłania ostatniego pola; uwzględnij safe area, insety klawiatury i dolną nawigację. Nie wstawiaj sztucznego paska iOS do widoku Androida. Krótkie animacje 150–240 ms mogą potwierdzać działanie; respektuj ograniczenie ruchu.

## 6. Nawigacja

Stała kolejność głównych zakładek:

**Start · Trening · Postępy · Trener · Profil**

| Zakładka | Główna ikona | Właścicielstwo ekranów |
| --- | --- | --- |
| Start | Dom | 03 |
| Trening | Hantel/sztanga | 04–17 |
| Postępy | Słupki | 18–24; 24 wyłącznie po zatwierdzeniu D03 |
| Trener | Osoby | 25–33 |
| Profil | Pojedyncza osoba | 34–36 |

01–02 należą do stosu uwierzytelniania i nie mają dolnej nawigacji. Aktywna zakładka ma niebieską ikonę, etykietę i krótkie podkreślenie; pozostałe są neutralne. Jeden ekran ma jednego właściciela sekcji. Przejście ze Start do treningu wybiera Trening; przejście ze Współpracy do planu wybiera Trening; przejście z potwierdzenia zapisu do szczegółów historycznych wybiera Postępy.

Podstrony zachowują rodzica również wtedy, gdy pasek jest ukryty. Bazowo pasek jest widoczny na ekranach sekcji i list. Pełnoekranowe edytory 08, 11, 14, aktywna sesja 16 oraz formularze 22, 32 i 35 ukrywają go zgodnie z planszami, udostępniając powrót i kontrolę niezapisanego szkicu. Inne ekrany szczegółowe mogą zachować pasek; nie wolno zmieniać aktywnej sekcji tylko dlatego, że ukryto go na danej podstronie. Android Back, przycisk wstecz, ponowne otwarcie i bezpośrednie wejście muszą prowadzić do spójnego stosu.

### 6.1. Trening

Na poziomie sekcji: **Plany · Ćwiczenia · Siłownie**. Plany obejmują tygodnie, dni i ćwiczenia. Siłownia jest jawnym kontekstem przygotowania i prowadzenia treningu. Zmiana siłowni musi odświeżyć benchmark; wynik z innej lokalizacji nie może pozostać widoczny jako bieżące odniesienie.

### 6.2. Trener

Sekcja obejmuje trzy części: **Dieta · Raporty · Współpraca**. Ekran 27 jest wejściem do tych części, a podsekcje korzystają ze wspólnych segmentów. Raporty nie są główną zakładką, częścią Profilu ani samodzielną funkcją Postępów.

Bez aktywnego trenera pokaż ekran 25 lub oczekujące zaproszenie 26. Dostęp do funkcji raportowych, pobieranie treści i wysyłanie wymagają aktywnej współpracy, także przy bezpośrednim wejściu. Po jej zakończeniu ekran połączenia zastępuje aktywne funkcje. Nie usuwaj historii z bazy; polityka ewentualnego archiwalnego odczytu po odłączeniu wymaga jawnego ustalenia w #16/#21 i nie może potajemnie ponownie otwierać funkcji raportowych.

Dieta należy do zatwierdzonego D07 (#35). Brak przypisanej diety przy aktywnej relacji daje neutralny stan „Trener nie przypisał jeszcze diety”. Współpraca pokazuje status, trenera, przypisany plan i harmonogram raportów, jeśli istnieją. Dowolna edycja celów/notatek jest osobnym D06; przykładowe pole „Cel: Siła” nie zatwierdza tego dodatku.

## 7. Mapa 36 ekranów i issues

Litery oznaczają pliki referencyjne z §1.1. Powiązanie służy do podziału implementacji, nie do oznaczania zadań jako wykonanych.

| Nr | Ekran | Sekcja / plansza | Zadania | Najważniejsze wymaganie |
| --- | --- | --- | --- | --- |
| 01 | Logowanie | Konto / A | [#6](https://github.com/KLesiu/GymApp/issues/6) | E-mail, hasło z podglądem, błędy, loading i przejście do rejestracji |
| 02 | Rejestracja | Konto / A | [#6](https://github.com/KLesiu/GymApp/issues/6) | Nazwa, e-mail, hasło, walidacja i brak samodzielnego nadawania roli trenera |
| 03 | Dzisiaj | Start / A | [#36](https://github.com/KLesiu/GymApp/issues/36), [#9](https://github.com/KLesiu/GymApp/issues/9), [#10](https://github.com/KLesiu/GymApp/issues/10) | Siłownia, tydzień, plan/dzień, rozpocznij lub wznów, ostatnia aktywność |
| 04 | Moje plany | Trening / A | [#9](https://github.com/KLesiu/GymApp/issues/9), [#18](https://github.com/KLesiu/GymApp/issues/18) | Plany własne i od trenera; widoczny aktywny plan |
| 05 | Szczegóły planu | Trening / A | [#9](https://github.com/KLesiu/GymApp/issues/9), [#18](https://github.com/KLesiu/GymApp/issues/18) | Źródło planu, tygodnie i dni |
| 06 | Dzień planu | Trening / A | [#9](https://github.com/KLesiu/GymApp/issues/9) | Lista ćwiczeń i serii, rozpoczęcie właściwego dnia |
| 07 | Edytuj plan | Trening / B | [#9](https://github.com/KLesiu/GymApp/issues/9) | Nazwa, liczba tygodni, tygodnie/dni, bez zmiany historii |
| 08 | Edytuj dzień | Trening / B | [#9](https://github.com/KLesiu/GymApp/issues/9) | Kolejność, ćwiczenia, liczba serii i powtórzenia |
| 09 | Biblioteka ćwiczeń | Trening / B | [#8](https://github.com/KLesiu/GymApp/issues/8) | Wyszukiwarka, grupy, ćwiczenia własne/globalne |
| 10 | Szczegóły ćwiczenia | Trening / B | [#8](https://github.com/KLesiu/GymApp/issues/8), [#11](https://github.com/KLesiu/GymApp/issues/11), [#14](https://github.com/KLesiu/GymApp/issues/14) | Wynik i historia w wybranej siłowni, jednostki, rekordy |
| 11 | Edytuj ćwiczenie | Trening / B | [#8](https://github.com/KLesiu/GymApp/issues/8), [#13](https://github.com/KLesiu/GymApp/issues/13) | Nazwa, grupa, jednostka, dozwolona konfiguracja punktacji |
| 12 | Grupy mięśniowe | Trening / B | [#8](https://github.com/KLesiu/GymApp/issues/8) | Lista i edycja własnych grup |
| 13 | Moje siłownie | Trening / C | [#7](https://github.com/KLesiu/GymApp/issues/7) | Wybór, dodanie i ostatnia wizyta; aktywna zakładka Trening |
| 14 | Edytuj siłownię | Trening / C | [#7](https://github.com/KLesiu/GymApp/issues/7) | Nazwa i objaśnienie porównania w tej samej siłowni |
| 15 | Przygotuj trening | Trening / C | [#10](https://github.com/KLesiu/GymApp/issues/10), [#7](https://github.com/KLesiu/GymApp/issues/7), [#9](https://github.com/KLesiu/GymApp/issues/9) | Plan, dzień, siłownia, podsumowanie |
| 16 | Aktywny trening | Trening / C | [#10](https://github.com/KLesiu/GymApp/issues/10), [#11](https://github.com/KLesiu/GymApp/issues/11), [#12](https://github.com/KLesiu/GymApp/issues/12) | Benchmark przy serii, ciężar/powtórzenia, stan zapisu, edycja i odzyskanie szkicu |
| 17 | Trening zapisany | Trening / C | [#12](https://github.com/KLesiu/GymApp/issues/12), [#14](https://github.com/KLesiu/GymApp/issues/14) | Potwierdzona finalizacja, porównanie, zmiana ratingu, przejście do historii |
| 18 | Historia treningów | Postępy / C | [#14](https://github.com/KLesiu/GymApp/issues/14) | Data, filtr siłowni i szczegóły; filtr listy nie zmienia benchmarku |
| 19 | Szczegóły treningu | Postępy / D | [#14](https://github.com/KLesiu/GymApp/issues/14), [#13](https://github.com/KLesiu/GymApp/issues/13) | Wszystkie serie, jednostki, benchmark i zmiana ratingu |
| 20 | Twoje postępy | Postępy / D | [#14](https://github.com/KLesiu/GymApp/issues/14) | Liczba treningów i wykres z tego samego zakresu, wejścia do historii/rekordów/pomiarów/ratingu |
| 21 | Pomiary ciała | Postępy / D | [#15](https://github.com/KLesiu/GymApp/issues/15) | Typ, okres, ostatnia wartość, wykres i chronologiczna lista |
| 22 | Dodaj pomiar | Postępy / D | [#15](https://github.com/KLesiu/GymApp/issues/15) | Typ, wartość, jednostka i data; także obwody oraz PERCENT z zakresu API |
| 23 | Rating i ranga | Postępy / D | [#13](https://github.com/KLesiu/GymApp/issues/13), [#14](https://github.com/KLesiu/GymApp/issues/14) | Wartość, zmiana, ranga, trend, historia i objaśnienie |
| 24 | Ranking | Postępy / D | [#29](https://github.com/KLesiu/GymApp/issues/29) | Warunkowy D03; pseudonim, wynik i wyróżnienie własnego wiersza |
| 25 | Połącz z trenerem | Trener / E | [#16](https://github.com/KLesiu/GymApp/issues/16) | Stan bez relacji, kod podopiecznego, kopiowanie |
| 26 | Zaproszenie | Trener / E | [#16](https://github.com/KLesiu/GymApp/issues/16) | Tożsamość trenera, akceptacja/odrzucenie, status operacji |
| 27 | Twój trener | Trener / E | [#16](https://github.com/KLesiu/GymApp/issues/16), [#21](https://github.com/KLesiu/GymApp/issues/21), [#35](https://github.com/KLesiu/GymApp/issues/35) | Aktywna relacja i wejścia Dieta/Raporty/Współpraca |
| 28 | Współpraca | Trener / E | [#16](https://github.com/KLesiu/GymApp/issues/16), [#18](https://github.com/KLesiu/GymApp/issues/18), [#20](https://github.com/KLesiu/GymApp/issues/20) | Status, przypisany plan, rzeczywisty harmonogram, zakończenie relacji |
| 29 | Dieta od trenera | Trener / E | [#35](https://github.com/KLesiu/GymApp/issues/35) | Przypisany plan, wybór dnia, lista posiłków, zalecenia |
| 30 | Szczegóły posiłku | Trener / E | [#35](https://github.com/KLesiu/GymApp/issues/35) | Składniki, ilości/jednostki, przygotowanie i uwagi |
| 31 | Raporty dla trenera | Trener / F | [#20](https://github.com/KLesiu/GymApp/issues/20), [#21](https://github.com/KLesiu/GymApp/issues/21) | Oddzielne listy Do zrobienia/Wysłane, terminy i statusy |
| 32 | Wypełnij raport | Trener / F | [#19](https://github.com/KLesiu/GymApp/issues/19), [#21](https://github.com/KLesiu/GymApp/issues/21) | Dynamiczne pola z utrwalonej wersji, szkic, walidacja, wysyłka |
| 33 | Szczegóły raportu | Trener / F | [#19](https://github.com/KLesiu/GymApp/issues/19), [#21](https://github.com/KLesiu/GymApp/issues/21) | Odpowiedzi właściwej wersji, data wysyłki i feedback |
| 34 | Mój profil | Profil / F | [#36](https://github.com/KLesiu/GymApp/issues/36), [#6](https://github.com/KLesiu/GymApp/issues/6) | Dane konta, inicjały, edycja, ustawienia i prywatność |
| 35 | Edytuj profil | Profil / F | [#36](https://github.com/KLesiu/GymApp/issues/36) | Nazwa wyświetlana, informacje konta, zapis rzeczywistej zmiany |
| 36 | Ustawienia | Profil / F | [#36](https://github.com/KLesiu/GymApp/issues/36), [#6](https://github.com/KLesiu/GymApp/issues/6), [#28](https://github.com/KLesiu/GymApp/issues/28), [#29](https://github.com/KLesiu/GymApp/issues/29) | Jednostki, prywatność i wylogowanie; języki/profil publiczny tylko w zatwierdzonym zakresie |

Pełna lista oznacza koncepcję 36 ekranów. Odbiór obowiązkowego wydania obejmuje faktycznie zatwierdzony zakres; warunkowego rankingu nie należy wdrażać wyłącznie dlatego, że występuje na planszy. Ekrany dodatkowe potrzebne do błędów, potwierdzeń i pustych stanów korzystają z powyższych komponentów, nawet jeśli nie mają osobnego numeru na atlasie.

## 8. Jawne poprawki względem wygenerowanych obrazów

| Rozbieżność | Obowiązująca reguła |
| --- | --- |
| 13 zaznacza Start w starszej planszy C | Właścicielem jest Trening; użyć C9 |
| 24 zaznacza Profil w starszej planszy D | Właścicielem są Postępy; użyć D11 |
| 19 pokazuje „Ocena treningu 4/5” | Pokazać zmianę ratingu wynikającą z zapisanej sesji; D11 poprawia tę etykietę |
| Krzywa 20 nie zgadza się z podpisami | Wykres, suma i opis korzystają z jednego datasetu; poprawiona ilustracja pokazuje 2+3+4+3=12, ale to tylko przykład |
| Atlas numeruje szczegóły posiłku jako 33 | Posiłek to 30; szczegóły raportu to 33 |
| Ekran 36 ma tytuł Trener lub błędną aktywną zakładkę | Tytuł Ustawienia, właściciel Profil |
| Wartości/datowanie wykresu 21 różnią się od listy | Jeden rzeczywisty zbiór pomiarów i ten sam wybrany zakres; nie kopiować sprzecznych liczb |
| Lista Do zrobienia na 31 zawiera wysłany raport | Wysłane trafiają do Wysłane; szkic/oczekujący/po terminie do Do zrobienia |
| 32 pokazuje tylko samopoczucie, sen i tekst | To przykładowy szablon; renderować wszystkie TEXT/NUMBER/SCALE/CHOICE z utrwalonej wersji |
| „Cel: Siła”, publiczny profil, język, edycja zdjęcia są widoczne na ilustracji | Nie zatwierdzają samodzielnie nowych modułów ani nieobsługiwanych operacji |

Własne wyniki, rekordy, benchmark i rating zachowują reguły #11/#13/#14. Filtr „Wszystkie siłownie” na liście historii nie włącza porównywania wyników pomiędzy siłowniami (D05).

## 9. Granice funkcji pokazanych w makietach

- **D07 = TAK:** dieta i posiłki w #35, w sekcji Trener.
- **D03 nadal do decyzji:** publiczny ranking 24 i przełącznik profilu publicznego w 36. Do decyzji brak aktywnego przepływu publikowania; osobisty rating 23 pozostaje w bazie.
- **D02 nadal do decyzji:** pełne PL/EN i onboarding. Nie pokazuj działającego wyboru języka, którego aplikacja nie obsługuje.
- **D06 nadal do decyzji:** edycja prywatnych notatek i celów; informacja o współpracy może prezentować istniejące dane bez dodawania tego modułu.
- **D08 nadal do decyzji:** zdjęcia raportowe/sylwetki. Inicjały wystarczają jako awatar bazowy; makieta ołówka przy awatarze nie określa nowej usługi uploadu.
- Zakres pomiarów obejmuje typy istniejącego API i #15, także PERCENT. Makieta masy ciała nie ogranicza wymagania do WEIGHT/KG.

Aktualne wybory pozostają w [#2](https://github.com/KLesiu/GymApp/issues/2) i [DECYZJE.md](../docs/plan/DECYZJE.md). Nowy layout nie jest potwierdzeniem dodatkowego zakresu.

## 10. Wymagania dla PR implementującego design

1. Wskaż numer ekranu, plik referencyjny i właściwe issue; zacznij od wspólnych tokenów/nawigacji #36, potem komponentów modułu.
2. Dołącz zrzuty rzeczywistej aplikacji na Androidzie i iOS, SHA, urządzenie/symulator, rozmiar logiczny i syntetyczne dane. Porównuj ekran do odpowiadającego fragmentu planszy, nie cały atlas do jednego telefonu.
3. Pokaż podstawowy stan oraz istotne dla tego przepływu loading, empty, error, disabled, zapis i brak uprawnień. Dla formularzy sprawdź klawiaturę, długie etykiety i większy tekst.
4. Potwierdź poprawną aktywną zakładkę, powrót, wejście bezpośrednie i utrzymanie szkicu tam, gdzie wymagają tego issues.
5. Sprawdź kontrast realnych kombinacji, etykiety dostępności, czytnik ekranu, obszary dotyku i jednostki. Wykres ma opis tekstowy i dane zgodne z listą.
6. Zweryfikuj przepływ użytkownika i API stosownie do ryzyka modułu. Zrzut wyglądu lub test obecności tekstu w kodzie nie dowodzi poprawnego zapisu, autoryzacji czy finalizacji.
7. Odnotuj uzasadnione odstępstwa od rastra, zwłaszcza wynikające z dostępności, platformy lub wymagań domenowych. Aktualizuj wspólną specyfikację przy zmianie tokenów; nie twórz drugiego motywu w jednym ekranie.

Końcowa kontrola wizualna i platformowa: #22. Zachowanie przekrojowe: #23. Demo: #25. Zrzuty i opis w pracy: #27. Wszystkie kryteria oznaczają pracę do wykonania; makiety koncepcyjne nie są dowodem ukończenia implementacji.
