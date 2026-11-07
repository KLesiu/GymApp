# Analiza stanu LiftContext i systemu referencyjnego

Data: 7 listopada 2026. GymApp: `master`, commit `d3913e50ed08894a60b541768da30663feeffcc5`.

Plan służy ukończeniu istniejącej aplikacji i całej pracy inżynierskiej. Audyt obejmował drzewo repozytoriów, wybrane ścieżki implementacji, kontrakty, konfigurację, testy i status CI oraz dwa dostarczone DOCX. Nie uruchamiano aplikacji ani testów w tej analizie. Obecność kodu oznacza implementację do sprawdzenia, a nie zakończony odbiór.

## Wniosek i źródła

GymApp ma już API Express/TypeScript/Prisma/PostgreSQL, aplikację Expo React Native i panel Vue. PR #1 jest scalony. Należy domknąć istniejące moduły, zachować stos zgodny z pracą i doprowadzić do przechodzących scenariuszy między wszystkimi trzema aplikacjami.

System referencyjny przeanalizowano wraz z implementacjami wskazanych submodułów. Jego funkcje stanowią materiał do wyboru zachowań produktu, nie gotowy pakiet do skopiowania. Publiczny plan nie zawiera prywatnego kodu, konfiguracji usług ani wewnętrznych ścieżek źródła. Przed adaptacją jakiegokolwiek fragmentu potrzebna jest weryfikacja pochodzenia i uprawnień; domyślna ścieżka to własna implementacja i własne zasoby.

Źródła wymagań: dostarczona praca LiftContext, zwłaszcza §1.2–1.4, §3.2–3.8, §4 i §5; sprawozdanie IPD I, zwłaszcza §2.2, §6–8. Praca opisuje pełny zakres, sprawozdanie jest historycznym checkpointem MVP. Bez zmiany wymagań F-11–F-14 pozostają częścią wydania mimo określenia „wspierające”.

## Porównanie funkcji

| Obszar | Wniosek z analizy systemu referencyjnego | Stan GymApp | Kierunek |
|---|---|---|---|
| Konto i dostęp | Konta, role i przepływy logowania | JWT/role istnieją | Odbiór uprawnień i cyklu życia sesji |
| Ćwiczenia i plany | Katalog, własne ćwiczenia, dni i serie | API i interfejsy istnieją | Dokończenie pełnego przebiegu, nie nowy moduł od zera |
| Siłownia i benchmark | Nazwane miejsca i poprzednie wyniki w kontekście miejsca | Zapytanie i podgląd istnieją | Ujednolicenie „ostatniego wyniku”, daty i jednostek |
| Aktywna sesja | Edycja treningu i lokalny szkic | Rozbudowany ekran, luki odzyskania i retry | Trwałość szkicu i atomowa finalizacja |
| Historia i rekordy | Historia oraz zarządzanie rekordami | Historia jest, podsumowanie jest statyczne | Rzeczywiste serie, porównania i zdefiniowany rekord |
| Pomiary | Masa, obwody i historia | Mobile ograniczone do masy w kg | Wszystkie obsługiwane typy, daty i wykresy |
| Trener i plany | Relacje, podopieczni i przypisywanie | Większość struktur istnieje | Kod zgodny z F-10, kontrola dostępu i historia planów |
| Raporty | Formularze, snapshoty, feedback i cykliczność | Fragmenty API i UI istnieją, pełny przepływ niegotowy | Wielopolowy kreator, dynamiczny mobile, wersje i scheduler |
| Rating i rangi | Funkcja istnieje w systemie referencyjnym | Kod i historia istnieją | Własna specyfikacja, jednostki i wyjaśnienie wyniku |
| Dodatki | Sharing, powiadomienia, notatki, zdjęcia, dieta, OAuth, administracja | Nie stanowią warunku pełnego DOCX | Osobna decyzja D01–D14 |

Nie należy przedstawiać samego benchmarku siłowni, ratingu ani snapshotów raportów jako funkcji nieobecnych w systemie referencyjnym. Wkład własny trzeba wykazać projektem, implementacją, uzasadnionymi decyzjami i pomiarami. Lokalny szkic nie oznacza pełnej synchronizacji offline. Nie potwierdzono potrzeby GPS, modelu sprzętu ani wariantów ćwiczenia w wymaganiach pracy.

## Najważniejsze luki i dowody z GymApp

Ścieżki poniżej odnoszą się do wskazanego wyżej SHA.

| Ustalenie | Dowód | Zadanie |
|---|---|---|
| CI nie jest w całości zielone | [Run CI](https://github.com/KLesiu/GymApp/actions/runs/30220256803): api/mobile success, coach failure przy generate:api, contract failure przy git diff | [LC-01 #3](https://github.com/KLesiu/GymApp/issues/3), [LC-03 #5](https://github.com/KLesiu/GymApp/issues/5) |
| Generator coach zależy od mobile, job instaluje tylko coach | `liftcontext-coach/package.json`, `.github/workflows/ci.yml`; trop statyczny, wygasłe logi nie pozwalają potwierdzić całej przyczyny | [LC-01 #3](https://github.com/KLesiu/GymApp/issues/3) |
| Wznowienie formularza ustawia puste ciężary/powtórzenia | `mobile/app/(app)/(tabs)/workout-session/[workoutId].tsx`, inicjalizacja lokalnego stanu | [LC-08 #10](https://github.com/KLesiu/GymApp/issues/10) |
| PATCH przed finalize może blokować replay po utracie odpowiedzi | Ten sam ekran: najpierw update sets, potem finalize; backend odrzuca modyfikację FINALIZED | [LC-10 #12](https://github.com/KLesiu/GymApp/issues/12) |
| Referencja benchmarku i ratingu jest różna | `exercise.repository.ts`: ostatnie serie; `workout.repository.ts`: największy ciężar historyczny | [LC-09 #11](https://github.com/KLesiu/GymApp/issues/11), [LC-11 #13](https://github.com/KLesiu/GymApp/issues/13) |
| Brak konwersji KG/LB w ratingu; klient wyświetla kg | `workouts/elo.ts`, `workout.repository.ts`, ekrany sesji i historii | [LC-11 #13](https://github.com/KLesiu/GymApp/issues/13) |
| Podsumowanie nie odczytuje danych sesji | `mobile/app/(app)/(tabs)/workout-summary/[workoutId].tsx` | [LC-12 #14](https://github.com/KLesiu/GymApp/issues/14) |
| Pomiary mobilne tylko WEIGHT/KG | `mobile/app/(app)/(tabs)/measurements.tsx` | [LC-13 #15](https://github.com/KLesiu/GymApp/issues/15) |
| E-mail zamiast kodu wymaganego F-10 | `trainer.schemas.ts`, mobilny `coach.tsx`, panel podopiecznych | [LC-14 #16](https://github.com/KLesiu/GymApp/issues/16) |
| Raport mobilny wysyła stałe mood=4 | `mobile/app/(app)/(tabs)/coach.tsx` | [LC-19 #21](https://github.com/KLesiu/GymApp/issues/21) |
| Podopieczny nie dostaje pełnego snapshotu wersji formularza | `report.repository.ts`, `listAssignmentsForTrainee`; `mobile/src/api/domain.ts` | [LC-03 #5](https://github.com/KLesiu/GymApp/issues/5), [LC-17 #19](https://github.com/KLesiu/GymApp/issues/19) |
| Kreator tworzy jedno pole | `liftcontext-coach/src/features/reports/ReportTemplateEditorView.vue` | [LC-17 #19](https://github.com/KLesiu/GymApp/issues/19) |
| Cykliczność kończy się na konfiguracji | `docs/adr-recurring-report-materialization.md`, zapis `nextRunAt` w repozytorium | [LC-18 #20](https://github.com/KLesiu/GymApp/issues/20) |
| Macierz deklaruje Done szerzej niż kod | `docs/thesis-compliance.md` | [LC-01 #3](https://github.com/KLesiu/GymApp/issues/3), [LC-21 #23](https://github.com/KLesiu/GymApp/issues/23), [LC-25 #27](https://github.com/KLesiu/GymApp/issues/27) |

Ryzyka statyczne do testu: utrata aktualizacji ratingu przy finalizacji dwóch różnych sesji jednego użytkownika, konflikty numeracji wersji raportu, cykl re-invite/reject relacji i cache po zmianie konta. Nie są tu przedstawiane jako wyniki odtworzonego exploitu.

Testy API obejmują 33 przypadki acceptance w trzech plikach. Testy mobile w znacznej części badają tekst źródła lub odtworzone funkcje; webowy test E2E obejmuje ekran logowania. Sam zielony job mobile nie dowodzi działania pełnego przepływu ani obu platform. Historyczne zrzuty testów w DOCX nie mają SHA i nie zastępują aktualnego odbioru.

## Decyzje architektoniczne do utrwalenia

1. Zachować modularne API Express i PostgreSQL z Prisma oraz obecnych klientów. Nie przepisywać backendu na stos systemu referencyjnego.
2. Kontrakt OpenAPI ma być wspólną podstawą generatorów, z konkretnymi DTO i jednolitym `id`.
3. API jest źródłem reguł dostępu, benchmarku, finalizacji i ratingu. Klient odpowiada za formularz, stan szkicu i czytelny wynik.
4. Przyjąć snapshot ostatniej zakończonej sesji w tej samej siłowni jako proponowaną semantykę benchmarku. Brak serii pozostaje brakiem; nie sklejać niejawnie kilku treningów.
5. Atomowa finalizacja, trwałe replay i współbieżność mają osobne testy DB i klienta.
6. Wersja raportu i przypisanie są trwałe. Harmonogram ma jawne reguły czasu, nadrabiania i deduplikacji.
7. Dla podstawy wystarcza odtwarzalny demonstrator. Produkcyjna chmura, pełne offline, sklepy, płatności i dodatkowe integracje nie są warunkiem bazowego wydania.
