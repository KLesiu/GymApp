# Plan badania i zamknięcia pracy

Najpierw powstaje stabilny, weryfikowalny demonstrator. Dokumentację decyzji i dowody zbieramy podczas implementacji; badań i wniosków nie dopisujemy wstecz. Dostarczona praca jawnie stwierdza, że badanie z użytkownikami nie zostało jeszcze przeprowadzone.

## Przebieg całej inżynierki

1. Uzgodnić zakres i konflikty DOCX, zapisać wymagania oraz ADR. Zachować dokumentację historycznego MVP jako checkpoint.
2. Dokończyć API, mobile i panel trenera według roadmapy. Każdy istotny PR powiązać z wymaganiem i testem.
3. Zamknąć macierz techniczną F/NF/T, uruchomić oba systemy mobilne, zmierzyć wydajność i przygotować release demonstratora.
4. Zamrozić protokół badania i wersję aplikacji, przeprowadzić pilotaż procedury, potem właściwe zadania z uczestnikami.
5. Opracować rzeczywiste wyniki, ograniczenia i odpowiedzi P1–P4, zaktualizować rozdziały implementacji oraz podsumowanie.
6. Sprawdzić format uczelni, bibliografię i odwołania, przygotować prezentację, demo i próbę obrony.

## Badanie

Bazowy protokół §5.3–5.5 zakłada 8–12 osób z doświadczeniem w treningu i zapisie wyników, zrównoważenie kolejności wariantów oraz syntetyczne konta i wspólne dane. Rekrutacja i rezerwacja urządzeń mogą rozpocząć się wcześniej; pomiary dopiero na ustalonym wydaniu.

| Pytanie | Porównanie/zadanie | Pomiar |
|---|---|---|
| P1 | Osobny widok historii vs benchmark przy bieżącej serii | Czas, przejścia, korekty, skuteczność |
| P2 | Interpretacja tego samego ćwiczenia z dwóch siłowni | Poprawność wyboru referencji i oceny progresji |
| P3 | Raport swobodny vs formularz o tych samych potrzebach informacyjnych | Kompletność według wcześniej ustalonej rubryki, brakujące pola, czas |
| P4 | Wyjaśnienie wyniku sesji i punktów na przykładach | Poprawność rozumienia ratingu, rozróżnienie punktów od surowych wyników, komentarze |

Po scenariuszu zastosować SUS zgodnie z ustalonym protokołem. Przed zbieraniem danych określić kryteria wyłączenia obserwacji, sposób anonimizacji, zgodę, retencję i zakres publikacji. Surowych danych identyfikujących uczestników nie publikować w repo; do pracy trafią zanonimizowane zestawienia. Nie kontaktować uczestników automatycznie w ramach tego planu.

Raport analizy powinien pokazać mediany/IQR, wyniki indywidualne w anonimowej postaci, uzasadnienie testu sparowanego i wielkość efektu tam, gdzie ma sens. Mała próba to pilotaż: opisać efekt uczenia, znajomość aplikacji, różnice urządzeń i wpływ obserwatora. Wyniki negatywne są pełnoprawnym wynikiem. Nie zakładać poprawy z góry.

## Dowody do rozdziałów

| Część pracy | Co zbierać |
|---|---|
| Cel i analiza problemu | Źródła i ograniczenia porównań; wkład własny bez twierdzenia, że wszystkie funkcje są nowatorskie |
| Wymagania i architektura | Macierz F/NF, ADR kod/e-mail, benchmark, rating, cykliczność; ERD i diagramy zgodne z kodem |
| Implementacja | Wybrane uzasadnione fragmenty własnego kodu, kontrakt, transakcja, wersje i przepływy klientów |
| Weryfikacja techniczna | Release SHA, środowisko, polecenia, wyniki CI i scenariuszy, percentyle i dataset |
| Badanie | Wersja protokołu, anonimowe dane, metryki, SUS, uwagi i ograniczenia |
| Podsumowanie | Odpowiedzi P1–P4 poparte zebranymi wynikami, niespełnione założenia i przyszły rozwój |
| Obrona | Krótkie demo obu ról, awaryjne nagranie, schemat architektury, argumentacja własnych decyzji |

## Bramka wydania i zakończenia

Wydanie aplikacji jest gotowe, gdy wymagany rdzeń F-01–F-14 i NF ma dowody, krytyczne scenariusze są przechodzące, oba klienty mobilne są sprawdzone, a środowisko da się odtworzyć. Produkcyjna infrastruktura i publikacja sklepowa nie są wymagane przez bazowy zakres.

Praca jest gotowa po uzgodnieniu treści z tym wydaniem i rzeczywistym stanem badania. Dokument nie może jednocześnie deklarować „zakończonej implementacji” i opisywać atrap jako funkcji gotowych. Jeśli część badawcza nie zostanie przeprowadzona, pozostaje jawnie protokołem i ograniczeniem; decyzję o dopuszczalnym zakresie trzeba uzgodnić z promotorem, bez wymyślania wyników.

Zadania: [LC-21 #23](https://github.com/KLesiu/GymApp/issues/23), [LC-22 #24](https://github.com/KLesiu/GymApp/issues/24), [LC-23 #25](https://github.com/KLesiu/GymApp/issues/25), [LC-24 #26](https://github.com/KLesiu/GymApp/issues/26), [LC-25 #27](https://github.com/KLesiu/GymApp/issues/27).
