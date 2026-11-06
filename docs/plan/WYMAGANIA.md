# Macierz wymagań i odbioru

Źródło bazowe: praca LiftContext §3.2 tabela 3.1, §3.3 tabela 3.2 oraz §5.2 tabela 5.1. Rozwinięcia z §1.2 i §4 uzupełniają krótkie wymagania. Statusy poniżej opisują audyt kodu, nie wyniki testów uruchomionych w tej sesji.

## Wymagania funkcjonalne

| ID | Zakres | Stan początkowy i dowód odbioru | Issues |
|---|---|---|---|
| F-01 | Rejestracja i logowanie | Implementacja obecna; potrzebny pełny odbiór sesji i ról | [LC-04 #6](https://github.com/KLesiu/GymApp/issues/6) |
| F-02 | Tworzenie/wybór siłowni | Implementacja obecna; test własności i archiwizacji z historią | [LC-05 #7](https://github.com/KLesiu/GymApp/issues/7) |
| F-03 | Plany własne i otrzymywane | Implementacja obecna; scenariusz wielotygodniowy i przypisanie | [LC-06 #8](https://github.com/KLesiu/GymApp/issues/8), [LC-07 #9](https://github.com/KLesiu/GymApp/issues/9), [LC-16 #18](https://github.com/KLesiu/GymApp/issues/18) |
| F-04 | Start według dnia planu | Obecny, brak pełnego wznowienia | [LC-08 #10](https://github.com/KLesiu/GymApp/issues/10) |
| F-05 | Ostatnie wyniki z wybranej siłowni | Częściowe; niespójna referencja i jednostki | [LC-09 #11](https://github.com/KLesiu/GymApp/issues/11) |
| F-06 | Add/remove/swap ćwiczenia i zmiana serii | Ekran istnieje; test wszystkich edycji i utrwalenia | [LC-08 #10](https://github.com/KLesiu/GymApp/issues/10) |
| F-07 | Walidacja ciężaru/powtórzeń | Obecna częściowo; brak ≠ zero, jednostki, NaN, przecinek | [LC-08 #10](https://github.com/KLesiu/GymApp/issues/10), [LC-10 #12](https://github.com/KLesiu/GymApp/issues/12), [LC-11 #13](https://github.com/KLesiu/GymApp/issues/13) |
| F-08 | Sesja, serie, punkty, podsumowanie | Backend istnieje; retry i podsumowanie do naprawy | [LC-10 #12](https://github.com/KLesiu/GymApp/issues/12), [LC-11 #13](https://github.com/KLesiu/GymApp/issues/13), [LC-12 #14](https://github.com/KLesiu/GymApp/issues/14) |
| F-09 | Historia, rekordy, masa i obwody | Częściowe; mobile tylko masa, potrzebne pełne typy/trendy | [LC-12 #14](https://github.com/KLesiu/GymApp/issues/14), [LC-13 #15](https://github.com/KLesiu/GymApp/issues/15) |
| F-10 | Kod relacji i dane aktywnego podopiecznego | Relacja po e-mailu, konflikt wymagań | [LC-14 #16](https://github.com/KLesiu/GymApp/issues/16), [LC-15 #17](https://github.com/KLesiu/GymApp/issues/17) |
| F-11 | Plan wielotygodniowy i szablon raportu | Struktury obecne; wymagany pełny obieg | [LC-16 #18](https://github.com/KLesiu/GymApp/issues/18), [LC-17 #19](https://github.com/KLesiu/GymApp/issues/19), [LC-18 #20](https://github.com/KLesiu/GymApp/issues/20) |
| F-12 | Wypełnienie okresowego raportu w mobile | Atrapa odpowiedzi zamiast formularza | [LC-19 #21](https://github.com/KLesiu/GymApp/issues/21) |
| F-13 | Punkty i rangi pomocnicze | Obecne; specyfikacja, normalizacja i UX do odbioru | [LC-11 #13](https://github.com/KLesiu/GymApp/issues/13), [LC-12 #14](https://github.com/KLesiu/GymApp/issues/14) |
| F-14 | Niezmienna przypisana wersja | Model obecny; kontrakt i odczyt mobile niepełne | [LC-17 #19](https://github.com/KLesiu/GymApp/issues/19), [LC-18 #20](https://github.com/KLesiu/GymApp/issues/20), [LC-19 #21](https://github.com/KLesiu/GymApp/issues/21) |

Dodatkowy jawny zakres tekstu: własne ćwiczenia i grupy (§1.2) → LC-06; miękkie usuwanie siłowni (§3.6) → LC-05; feedback i cykliczność (§4.6) → LC-17–19; wszystkie obsługiwane pomiary, także procent tkanki tłuszczowej wskazany w sprawozdaniu → LC-13.

## Wymagania jakościowe

| ID | Kryterium | Zadanie i dowód |
|---|---|---|
| NF-01 | Benchmark przy serii bez przełączania do historii | [LC-09 #11](https://github.com/KLesiu/GymApp/issues/11), [LC-20 #22](https://github.com/KLesiu/GymApp/issues/22), pomiar P1 |
| NF-02 | Percentyle czasu w określonym środowisku | [LC-22 #24](https://github.com/KLesiu/GymApp/issues/24); progi w issue są propozycją, a nie wynikiem |
| NF-03 | Atomowy zapis | [LC-10 #12](https://github.com/KLesiu/GymApp/issues/12); test rollback/retry/współbieżności |
| NF-04 | Token i uprawnienia | [LC-04 #6](https://github.com/KLesiu/GymApp/issues/6), [LC-14 #16](https://github.com/KLesiu/GymApp/issues/16); testy negatywne API |
| NF-05 | Dostęp tylko w aktywnej relacji | [LC-14 #16](https://github.com/KLesiu/GymApp/issues/16), [LC-15 #17](https://github.com/KLesiu/GymApp/issues/17), [LC-19 #21](https://github.com/KLesiu/GymApp/issues/21); odłączenie i odczyt obcego użytkownika |
| NF-06 | Android i iOS | [LC-20 #22](https://github.com/KLesiu/GymApp/issues/22), [LC-23 #25](https://github.com/KLesiu/GymApp/issues/25); instalacja i przebieg na obu platformach |
| NF-07 | Rozdział odpowiedzialności | [LC-03 #5](https://github.com/KLesiu/GymApp/issues/5), [LC-25 #27](https://github.com/KLesiu/GymApp/issues/27); przegląd architektury, kontraktów i ADR |
| NF-08 | Testowalne reguły | [LC-01 #3](https://github.com/KLesiu/GymApp/issues/3), [LC-21 #23](https://github.com/KLesiu/GymApp/issues/23); testy jednostkowe/integracyjne z prawdziwym PostgreSQL |
| NF-09 | Etykiety, kontrast, status poza kolorem | [LC-20 #22](https://github.com/KLesiu/GymApp/issues/22); test klawiatury/czytnika i przegląd UI |

## Testy z pracy

| Test | Warunek | Issues |
|---|---|---|
| T-01 | Równoważne KG i LB dają ten sam rating | [LC-11 #13](https://github.com/KLesiu/GymApp/issues/13) |
| T-02 | Pierwsze wykonanie bez fikcyjnej referencji/punktów | [LC-09 #11](https://github.com/KLesiu/GymApp/issues/11), [LC-11 #13](https://github.com/KLesiu/GymApp/issues/13) |
| T-03 | Retry tej samej treści i klucza | [LC-10 #12](https://github.com/KLesiu/GymApp/issues/12) |
| T-04 | Równoległe żądania i konflikt treści | [LC-10 #12](https://github.com/KLesiu/GymApp/issues/12) |
| T-05 | Ta sama nazwa ćwiczenia, dwie siłownie | [LC-05 #7](https://github.com/KLesiu/GymApp/issues/7), [LC-09 #11](https://github.com/KLesiu/GymApp/issues/11) |
| T-06 | Aktywny/obcy trener | [LC-04 #6](https://github.com/KLesiu/GymApp/issues/6), [LC-14 #16](https://github.com/KLesiu/GymApp/issues/16), [LC-15 #17](https://github.com/KLesiu/GymApp/issues/17) |
| T-07 | Cudzy plan/dzień/ćwiczenie bez zapisu | [LC-04 #6](https://github.com/KLesiu/GymApp/issues/6), [LC-10 #12](https://github.com/KLesiu/GymApp/issues/12) |
| T-08 | Zmiana kontekstu odświeża benchmark | [LC-09 #11](https://github.com/KLesiu/GymApp/issues/11), [LC-20 #22](https://github.com/KLesiu/GymApp/issues/22) |
| T-09 | Dane właściwego podopiecznego i jednolite id | [LC-03 #5](https://github.com/KLesiu/GymApp/issues/5), [LC-15 #17](https://github.com/KLesiu/GymApp/issues/17) |
| T-10 | Pełne typowane odpowiedzi OpenAPI | [LC-03 #5](https://github.com/KLesiu/GymApp/issues/5) |

Uzupełnienie macierzy testów: niezmienność raportów V1/V2, równoległe wersjonowanie, cykliczność/DST/restart, dynamiczne formularze i feedback, pełne pomiary, zachowanie historii po archiwizacji, odtwarzanie szkicu, retry po utracie odpowiedzi, obie platformy i dostępność. Zbiorczy odbiór: [LC-21 #23](https://github.com/KLesiu/GymApp/issues/23).

## Warunek zamknięcia issue

Kryteria szczegółowe w issue są proponowanymi warunkami odbioru wynikającymi z wymagań i analizy ryzyk. Issue zamykamy po implementacji, przeglądzie zmiany i odpowiednim teście, wskazując PR/commit, polecenie lub scenariusz, wynik i artefakt. Sam endpoint, ekran, nazwa testu lub wpis „Done” nie wystarcza. Testu nie oznacza się PASS bez wykonania. Wymagania i wyniki mają odnosić się do tego samego wydania.
