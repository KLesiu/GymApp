# Decyzje o zakresie LiftContext

Stan: propozycja do decyzji autora. Utworzenie issue nie oznacza wyboru dodatku. Odpowiedzi można wpisać w [LC-00 #2](https://github.com/KLesiu/GymApp/issues/2) jako `D01=TAK, D02=PÓŹNIEJ, D03=NIE`.

## Baza zgodna z DOCX

Rekomendowany zakres obejmuje wszystkie F-01–F-14: konto, siłownie, własne grupy i ćwiczenia, plany wielotygodniowe, aktywną sesję z edycją, benchmark przy serii, niezawodny zapis, historię i rekordy, wszystkie pomiary, trenera, wersjonowane i cykliczne raporty, feedback, osobisty rating i rangi.

F-11–F-14 nazwano w pracy „wspierającymi”, ale raporty i rating są powiązane z P3/P4 oraz tytułem i opisem systemu. Ich usunięcie wymaga jawnej aktualizacji pracy i uzgodnienia zakresu, nie samego odłożenia issue.

## Moduły dodatkowe do wyboru

Szacunki poniżej są orientacyjne, zależą od współdzielonej infrastruktury i nie należy dodawać ich ponownie do wycen zbiorczych issues. Nie zawierają opłat usług. Stan wszystkich: **do decyzji**.

| Kod | Moduł | Co daje | Rekomendacja | Orientacyjny dodatkowy nakład | Zadanie |
|---|---|---|---|---|---|
| D01 | Przypomnienia i push/live refresh | Termin raportu, zaproszenie, odświeżenie feedbacku | Później | 10–20 h | [LC-26 #28](https://github.com/KLesiu/GymApp/issues/28) |
| D02 | Onboarding i pełne PL/EN | Pomoc przy starcie i dwa kompletne języki | Opcjonalnie po rdzeniu | 6–12 h | [LC-26 #28](https://github.com/KLesiu/GymApp/issues/28) |
| D03 | Publiczny ranking/profile | Porównania pomiędzy użytkownikami | Później; osobisty rating zostaje | 6–12 h | [LC-27 #29](https://github.com/KLesiu/GymApp/issues/29) |
| D04 | Ręczne rekordy i estymacja 1RM | Osobne wpisy rekordów oraz jawnie oznaczone estymacje | Później | 6–10 h | [LC-27 #29](https://github.com/KLesiu/GymApp/issues/29) |
| D05 | Wszystkie siłownie i bogatsza analityka | Dodatkowy tryb porównania i wykresy | Później | 6–10 h | [LC-27 #29](https://github.com/KLesiu/GymApp/issues/29) |
| D06 | Notatki trenera i cele | Zapis ustaleń współpracy | Opcjonalnie po rdzeniu | 6–10 h | [LC-28 #30](https://github.com/KLesiu/GymApp/issues/30) |
| D07 | Dieta i posiłki | Dodatkowa domena żywieniowa | Po obronie | 8–16 h | [LC-28 #30](https://github.com/KLesiu/GymApp/issues/30) |
| D08 | Zdjęcia raportowe/sylwetki | Dokumentacja wizualna | Po obronie | 10–18 h | [LC-28 #30](https://github.com/KLesiu/GymApp/issues/30) |
| D09 | Kopiowanie i udostępnianie planów | Przekazanie niezależnej kopii kodem | Opcjonalnie po rdzeniu | 6–10 h | [LC-29 #31](https://github.com/KLesiu/GymApp/issues/31) |
| D10 | Google OAuth | Dodatkowy sposób logowania | Po obronie | 8–14 h | [LC-30 #32](https://github.com/KLesiu/GymApp/issues/32) |
| D11 | Panel administratora | Moderacja i obsługa systemu | Po obronie | 8–16 h | [LC-30 #32](https://github.com/KLesiu/GymApp/issues/32) |
| D12 | Suplementacja | Ewidencja dodatkowych zaleceń | Po obronie; brak potwierdzonego kompletnego UI źródła | Wycena po definicji zakresu | [LC-28 #30](https://github.com/KLesiu/GymApp/issues/30) |
| D13 | Landing informacyjny | Strona opisująca projekt | Po obronie | 4–6 h | [LC-30 #32](https://github.com/KLesiu/GymApp/issues/32) |
| D14 | Timer przerw | Odmierzanie czasu pomiędzy seriami | Opcjonalnie po rdzeniu | 4–8 h | [LC-29 #31](https://github.com/KLesiu/GymApp/issues/31) |

Moduły powyżej wynikają z porównania zachowań systemu referencyjnego; estymacja 1RM jest rozszerzeniem propozycji rekordów, nie stwierdzeniem gotowej implementacji źródła. Pomiary, zwykła historia rekordów, raporty i osobiste rangi należą do bazy i nie są płatnym czasowo dodatkiem do niej.

**Istniejący ranking wymaga świadomej decyzji.** Kod obecnie zawiera publiczny ranking i ustawia widoczność przy rejestracji. D03=NIE/PÓŹNIEJ oznacza wyłączenie/ukrycie tego przepływu w bazowym wydaniu, a nie udawanie, że nic nie trzeba zmienić. Zachowujemy osobistą historię ratingu i rangi.

## Reguły wymagające rozstrzygnięcia

| Decyzja | Rekomendacja i skutek | Zadanie |
|---|---|---|
| Kod czy e-mail w relacji | Kod + akceptacja, zgodnie z F-10. E-mail wymaga uzgodnionej korekty pracy. | [LC-14 #16](https://github.com/KLesiu/GymApp/issues/16) |
| Ostatnia sesja czy historycznie największy ciężar | Jedna ostatnia zakończona sesja w tej samej siłowni; wspólna reguła dla UI i obliczeń. | [LC-09 #11](https://github.com/KLesiu/GymApp/issues/11) |
| Remis w ratingu | Wzór z pracy daje +8 przy identycznym dodatnim wyniku. Świadomie utrzymać i opisać albo zmienić z uzasadnieniem w kodzie i pracy. | [LC-11 #13](https://github.com/KLesiu/GymApp/issues/13) |
| Agregacja ratingu | Ustalić agregację serii do jednego wpisu historii sesja–ćwiczenie; zdefiniować inverse/bodyweight, progi i pierwszy wynik. | [LC-11 #13](https://github.com/KLesiu/GymApp/issues/13) |
| Harmonogram raportów | Jawna reguła okresu, terminu, strefy, nadrabiania i zachowania po odłączeniu; nie kopiować niejawnie reguł źródła. | [LC-18 #20](https://github.com/KLesiu/GymApp/issues/20) |
| Platformy i środowisko | Android i iOS wymagane przez NF-06; zapewnić urządzenie/symulator i sposób dystrybucji demo. | [LC-20 #22](https://github.com/KLesiu/GymApp/issues/22), [LC-23 #25](https://github.com/KLesiu/GymApp/issues/25) |
| Język bazowy | Rekomendacja PL do badania i obrony; pełne dwa języki dopiero po D02. | [LC-20 #22](https://github.com/KLesiu/GymApp/issues/22) |
| Termin i dostępność | Uzupełnić termin oddania, godziny tygodniowo i dostęp do uczestników badania. | [LC-00 #2](https://github.com/KLesiu/GymApp/issues/2) |

Płatności, migracja rzeczywistych danych źródła, pełna synchronizacja offline, sprzęt/warianty ćwiczenia i pełny webowy dziennik nie są częścią bazowego zobowiązania. Można je rozważyć w odrębnej zmianie zakresu.
