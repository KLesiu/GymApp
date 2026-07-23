# LiftContext — system identyfikacji i UI

## 1. Marka

**Nazwa produktu:** LiftContext  
**Nazwa aplikacji mobilnej:** LiftContext  
**Opis do pracy inżynierskiej:** aplikacja mobilna do ewidencji treningowej, kontekstowego porównywania wyników i współpracy trener–podopieczny.  
**Hasło pomocnicze:** „Porównuj wyniki we właściwym kontekście.”

Nazwa łączy:

- `Lift` — trening siłowy i pracę z obciążeniem;
- `Context` — najważniejszy wyróżnik systemu: benchmark zależny od ćwiczenia, użytkownika i wybranej siłowni.

Marka powinna wyglądać technicznie i sportowo, ale nie agresywnie. Nie używamy estetyki kulturystycznej, neonów, płomieni, tarcz, sylwetek zawodników ani zdjęć siłowni jako głównego motywu.

## 2. Nazewnictwo techniczne

| Element | Wartość |
| --- | --- |
| Display name | `LiftContext` |
| Repozytorium / folder | `liftcontext-mobile` |
| npm package name | `liftcontext-mobile` |
| Expo slug | `liftcontext-mobile` |
| URL scheme | `liftcontext` |
| Android application ID | `pl.jakubleskiewicz.liftcontext` |
| Android namespace | `pl.jakubleskiewicz.liftcontext` |
| iOS bundle identifier | `pl.jakubleskiewicz.liftcontext` |
| iOS product/display name | `LiftContext` |
| Orval config key | `liftContextApi` |
| Generated API directory | `src/api/generated` |
| Public API URL variable | `EXPO_PUBLIC_API_URL` |

Identyfikatory są przeznaczone do projektu akademickiego. Jeśli aplikacja kiedykolwiek stanie się produktem komercyjnym, należy zastąpić je identyfikatorami opartymi na kontrolowanej domenie.

## 3. Logo i ikona

Źródło wektorowe: `assets/brand/liftcontext-icon.svg`.

Znak składa się z:

- sztangi — trening siłowy;
- nawiasów — kontekst, filtrowanie i porównanie;
- żółtego punktu — aktualny pomiar lub punkt odniesienia.

### Zasady

- Nie zmieniaj proporcji znaku.
- Nie obracaj symbolu.
- Nie dodawaj gradientów, cieni 3D ani obrysów.
- Nie umieszczaj fotografii wewnątrz znaku.
- Minimalna czytelna wielkość symbolu w UI: `24×24 px`.
- Minimalny margines ochronny: szerokość żółtego punktu z każdej strony.
- Na małych powierzchniach stosuj sam znak, bez wordmarku.

### Eksporty mobilne

SVG jest plikiem źródłowym. Expo wymaga również rastrowych eksportów:

- `assets/brand/icon.png` — `1024×1024`;
- `assets/brand/adaptive-icon.png` — `1024×1024`, znak w bezpiecznym centralnym obszarze;
- `assets/brand/splash-icon.png` — minimum `512×512`;
- opcjonalnie `assets/brand/favicon.png` — `48×48`.

Nie skaluj małego PNG do większego rozmiaru. Każdy PNG należy wygenerować bezpośrednio z SVG.

## 4. Paleta kolorów

### Kolory podstawowe

| Token | Hex | Zastosowanie |
| --- | --- | --- |
| `canvas` | `#FAFAF7` | główne tło aplikacji i tło ikony |
| `surface` | `#FFFFFF` | karty, arkusze i modale |
| `surfaceMuted` | `#F1F3F2` | drugorzędne powierzchnie |
| `ink` | `#1D2225` | główny tekst i sztanga w logo |
| `textMuted` | `#667176` | tekst pomocniczy |
| `border` | `#D9DEDC` | obramowania i separatory |
| `context` | `#15988F` | główna marka, aktywna nawigacja |
| `contextDark` | `#0F6F69` | główne przyciski z białym tekstem |
| `reference` | `#FFC928` | benchmark, punkt odniesienia |

### Kolory semantyczne

| Token | Hex | Zastosowanie |
| --- | --- | --- |
| `success` | `#248A5B` | zapis zakończony, dodatnia zmiana |
| `warning` | `#B77900` | ostrzeżenia i brakujące dane |
| `danger` | `#D64343` | błędy i operacje destrukcyjne |
| `info` | `#2563EB` | informacje niezwiązane z benchmarkiem |

### Reguły dostępności

- Tekst podstawowy: `ink` na `canvas` albo `surface`.
- Główny CTA: biały tekst na `contextDark`.
- Na żółtym `reference` używaj wyłącznie `ink`; nie używaj białego tekstu.
- `context` może być ikoną lub elementem dekoracyjnym na jasnym tle; dla małego tekstu używaj `contextDark`.
- Stanów nie komunikujemy wyłącznie kolorem — dodajemy ikonę i tekst.

## 5. Typografia

### Fonty

- Nagłówki i duże metryki: **Sora**.
- Tekst, formularze i nawigacja: **Inter**.
- Fallback: systemowy sans-serif.

### Skala

| Styl | Rozmiar / interlinia | Waga |
| --- | --- | --- |
| `display` | `36 / 42` | 700 |
| `metricLarge` | `32 / 36` | 700 |
| `heading1` | `28 / 34` | 700 |
| `heading2` | `22 / 28` | 650 |
| `heading3` | `18 / 24` | 600 |
| `body` | `16 / 24` | 400 |
| `bodyStrong` | `16 / 24` | 600 |
| `caption` | `13 / 18` | 500 |
| `label` | `12 / 16` | 600 |

Duże liczby ciężaru, powtórzeń i Elo wykorzystują `Sora`, ale jednostki zawsze są mniejsze i spokojniejsze.

## 6. Układ

### Siatka odstępów

`4, 8, 12, 16, 24, 32, 40, 48`

Domyślny padding ekranu: `20`.  
Odstęp między sekcjami: `24`.  
Odstęp wewnątrz karty: `16`.

### Promienie

| Token | Wartość |
| --- | --- |
| `radiusSmall` | `8` |
| `radiusMedium` | `14` |
| `radiusLarge` | `20` |
| `radiusPill` | `999` |

Karty używają `radiusMedium` albo `radiusLarge`. Pola formularza używają `radiusSmall`.

### Cienie

Cienie powinny być minimalne. Hierarchię budujemy przede wszystkim powierzchnią, obramowaniem i odstępem. Karty mogą używać:

```ts
{
  shadowColor: '#1D2225',
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
}
```

## 7. Nawigacja

Główne zakładki:

1. **Dzisiaj**
2. **Trening**
3. **Postęp**
4. **Współpraca**
5. **Więcej**

Aktywna zakładka używa `contextDark`. Nieaktywne ikony używają `textMuted`. Centralna akcja treningowa może być mocniej wyróżniona, ale nie może wyglądać jak osobny branding.

## 8. Komponenty

### Przycisk główny

- tło `contextDark`;
- biały tekst;
- wysokość minimum `48`;
- promień `14`;
- loading nie zmienia szerokości przycisku.

### Przycisk dodatkowy

- przezroczyste lub białe tło;
- tekst `contextDark`;
- obramowanie `border`.

### Przycisk destrukcyjny

- `danger` jako tekst lub tło;
- zawsze wymaga jednoznacznej etykiety;
- usunięcie treningu, planu albo siłowni wymaga potwierdzenia.

### Karta benchmarku

Benchmark jest kluczowym komponentem LiftContext:

- etykieta: „Punkt odniesienia”;
- nazwa siłowni;
- data poprzedniej sesji;
- ciężar i powtórzenia;
- akcent `reference`;
- opcjonalna akcja „Użyj wartości”;
- brak historii pokazuje neutralny empty state, nie błąd.

### Pola serii

- ciężar i powtórzenia są widoczne jednocześnie;
- duże pola dotykowe;
- numer serii jako spokojna etykieta;
- benchmark bezpośrednio pod aktualną serią;
- zapis i błąd sygnalizowane tekstem oraz ikoną.

### Wykresy

- główna seria danych: `context`;
- benchmark/referencja: `reference`;
- dodatkowa seria: `info`;
- dodatnia zmiana: `success`;
- siatka: `border`;
- wykres zawsze ma tekstowe podsumowanie.

## 9. Ikonografia i ilustracje

- Ikony liniowe, grubość optyczna około `2 px`.
- Zaokrąglone zakończenia linii.
- Nie mieszaj kilku bibliotek ikon na jednym ekranie.
- Unikaj płomieni, piorunów, koron, tarcz i agresywnych symboli kulturystycznych.
- Fotografie nie są częścią podstawowej identyfikacji.

## 10. Ruch

- Animacje `150–240 ms`.
- Używaj ruchu do potwierdzenia zapisu, przejścia między krokami lub rozwinięcia danych.
- Nie animuj każdej karty.
- Respektuj ustawienie ograniczenia ruchu w systemie.

## 11. Ton komunikacji

Język jest rzeczowy, pomocny i pozbawiony oceniania.

Stosuj:

- „Punkt odniesienia z tej lokalizacji”
- „Trening zapisany”
- „Nie masz jeszcze wyniku dla tej siłowni”
- „Połącz się z trenerem”

Unikaj:

- agresywnej motywacji;
- zawstydzania użytkownika;
- obietnic medycznych;
- niespójnych tekstów marketingowych;
- nadmiaru wykrzykników.

## 12. Zakazane pozostałości starego brandingu

W nowej aplikacji nie mogą występować stare nazwy produktu, cudze identyfikatory pakietów, ani nieaktualne assety.

- stare logo, splash, tło i favicon;
- stary EAS Project ID;
- nazwy assetów zawierające stare oznaczenia;
- stare marketingowe teksty i układ ekranów.

Końcowy audyt powinien być pusty.
