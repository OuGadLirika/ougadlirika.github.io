## Počítačová grafika, multimediálne systémy

### 17. Vektorová a rastrová grafika. Krivky v počítačovej grafike. (vlastnosti a spôsob vykresľovania rastrového a vektorového obrázku, formáty, prevody medzi rastr. a vekt. obrázkom, algoritmy na vykresľovanie rastrovej úsečky, rasterizácia kružnice, interpolačná a aproximačná krivka).

#### Vektorová grafika

Vektorová grafika reprezentuje obraz pomocou **matematicky opísaných objektov**. Obrázok je zložený z bodov, úsečiek, kriviek, mnohouholníkov, textu a ich vlastností, napríklad farby, výplne alebo hrúbky čiary.

Najdôležitejšia vlastnosť je **nezávislosť od rozlíšenia**, teda **škálovateľnosť**. Keď vektorový obrázok zväčšíme, nezväčšujú sa existujúce pixely, ale tvary sa znova prepočítajú z geometrického opisu. Preto sa logo, ikona, font, diagram alebo technický výkres dá použiť v malej aj veľkej veľkosti bez straty ostrosti. Praktická výhoda je aj to, že jednotlivé objekty alebo vrstvy sa dajú upravovať samostatne, napríklad zmeniť farbu, tvar, veľkosť alebo polohu bez zásahu do zvyšku obrázka.

Vektor nie je vhodná reprezentácia pre **fotografie, skeny a obraz s množstvom jemných farebných prechodov**, pretože takýto typ obrazu je prirodzenejšie uložiť ako raster. Pred zobrazením na monitore alebo vytlačením sa navyše aj vektorový obrázok musí previesť na pixely, teda **rasterizovať**.

#### Rastrová grafika

Rastrová grafika reprezentuje obraz ako **mriežku pixelov**. Každý pixel má svoju polohu a farbu, takže celý obraz je v podstate dvojrozmerná mapa obrazových bodov.

Kvalita rastrového obrázka závisí hlavne od **rozlíšenia** a **farebnej hĺbky**. Rozlíšenie určuje počet pixelov, napríklad `1920 × 1080`, a farebná hĺbka určuje, koľko informácie sa používa na uloženie farby jedného pixelu. Pri bežnom RGB obraze je to často 24 bitov, teda 8 bitov pre červenú, zelenú a modrú zložku.

Raster je vhodný najmä na obraz s veľkým množstvom detailov a farebných prechodov, typicky na **fotografie**, skeny, textúry alebo webové obrázky. Je prirodzený aj preto, že monitor sám zobrazuje obraz ako mriežku pixelov.

Z toho vyplýva, že raster má **pevne dané množstvo obrazovej informácie**. Ak obrázok zväčšíme nad pôvodné rozlíšenie, nové pixely sa musia dopočítať interpoláciou, takže obraz môže stratiť ostrosť a vzniká **pixelácia**. Pri rotácii, skosení alebo zmene mierky treba obraz zase prevzorkovať, teda prepočítať jeho pixely do novej mriežky.

Pri vysokom rozlíšení a veľkej farebnej hĺbke môže mať rastrový obrázok vyššie pamäťové nároky. Pri **stratovej kompresii** sa navyše časť informácie nenávratne zahodí, čo môže vytvoriť viditeľné artefakty.

#### Krivky v počítačovej grafike

Krivky sú jeden zo základných prvkov vektorovej grafiky. Používajú sa tam, kde nechceme tvar skladať iba z úsečiek, ale potrebujeme plynulý priebeh – napríklad pri písmach, logách, CAD tvaroch, animáciách alebo grafických editoroch.

V počítačovej grafike sa krivky najčastejšie opisujú **parametricky**. Parameter `t` si môžeme predstaviť ako posúvač po krivke: pri rôznych hodnotách `t` dostaneme rôzne body krivky. Typicky sa používa interval od `0` po `1`, kde `t = 0` znamená začiatok a `t = 1` koniec.

Jednoduchý príklad je úsečka medzi bodmi `A = (0, 0)` a `B = (10, 0)`. Keď sa `t` mení, bod sa posúva zľava doprava:

| `t` | bod na úsečke |
|---:|---|
| `0` | `(0, 0)` |
| `0.5` | `(5, 0)` |
| `1` | `(10, 0)` |

Všeobecne sa to zapisuje napríklad ako `q(t) = (x(t), y(t), z(t))`, čo znamená, že poloha bodu na krivke sa vypočíta z hodnoty parametra `t`. Dá sa to predstaviť ako **dráha pohybujúceho sa bodu**. Dotykový vektor potom určuje smer krivky v danom bode.

Pri modelovaní kriviek sa definujú **riadiace body**, na základe ktorých sa určí tvar krivky. Podľa toho, ako sa ku nim krivka správa, rozlišujeme dva základné typy:

- **interpolačná krivka** – prechádza danými **uzlovými bodmi**,
- **aproximačná krivka** – riadiace body iba ovplyvňujú jej tvar, ale krivka nimi nemusí prechádzať.

V praxi sa často používajú kubické krivky, teda krivky tretieho stupňa, pretože ponúkajú dosť možností tvarovania, pričom sú výpočtovo stále rozumné.

#### Vlastnosti a spôsob vykresľovania rastrového a vektorového obrázku

**Raster = hotová mriežka pixelov.** Každý pixel má svoju farbu, takže kvalitu určujú najmä **rozlíšenie**, **farebná hĺbka** a **kompresia**. Pri zobrazení sa pixely iba mapujú na výstupné zariadenie.

Pri zmene mierky, rotácii alebo inom geometrickom zásahu sa raster musí **prevzorkovať**. Nové pixely sa dopočítavajú **interpoláciou**, preto môže raster pri transformáciách stratiť ostrosť, vytvárať zubaté hrany alebo kompresné artefakty.

**Vektor = geometrický opis objektov.** Neukladá pixely, ale body, úsečky, krivky, výplne a transformácie. Pri vykreslení sa najprv vypočíta geometria scény a až potom sa prevedie na pixely konkrétneho zariadenia.

Tento prevod sa volá **rasterizácia**. Jej jadro je: **určiť, ktoré pixely patria grafickému prvku, a priradiť im správnu farbu**.

Vektor sa dá škálovať bez straty kvality, lebo pri zväčšení sa neťahajú staré pixely, ale znova sa počíta geometria. Pred zobrazením na monitore alebo vytlačením sa však aj vektor musí skončiť ako raster, lebo bežné výstupné zariadenia pracujú s bodmi/pixelmi.

#### Formáty

Pri grafických formátoch rozlišujeme dve veci: **reprezentáciu obrazu** a **spôsob kompresie**. Podľa reprezentácie môžu byť formáty rastrové, vektorové alebo hybridné. Podľa kompresie môže byť uloženie stratové alebo bezstratové. Napríklad `WebP` je rastrový formát, ale môže používať stratovú aj bezstratovú kompresiu. `PDF` je skôr **hybridný dokumentový formát**, pretože môže obsahovať text, vektorovú grafiku aj rastrové obrázky.

**Rastrové formáty:**

- `JPEG` – stratová kompresia, vhodný najmä na fotografie, nepodporuje transparentnosť,
- `PNG` – bezstratová kompresia, podporuje transparentnosť, vhodný na webovú grafiku,
- `GIF` – 256 farieb, jednoduché animácie,
- `BMP` – jednoduchý, často nekomprimovaný formát, preto máva veľké súbory,
- `TIFF` – kvalitný formát pre skenovanie, tlač a DTP,
- `RAW` – surové dáta zo snímača fotoaparátu, vhodné na profesionálne spracovanie fotografie,
- `WebP`, `HEIC`, `AVIF` – modernejšie formáty s efektívnejšou kompresiou.

**Vektorové formáty:**

- `SVG` – otvorený webový formát založený na XML, vhodný na ikony, logá a ilustrácie,
- `AI`, `CDR` – pracovné formáty grafických editorov Adobe Illustrator a CorelDRAW,
- `DXF`, `DWG` – CAD formáty používané pri technických výkresoch,
- `EPS` – PostScriptový formát používaný najmä v tlači a DTP.

#### Prevody medzi rastrovým a vektorovým obrázkom

Prevod z vektora na raster je jednoduchší, pretože z matematického opisu vieme vypočítať pixely. Prevod z rastra na vektor je ťažší, lebo z hotovej mriežky pixelov sa musí spätne odhadnúť, aké tvary obraz pôvodne obsahoval.

**Prevod z vektora na raster** voláme **rasterizácia**. Ide o bežný proces pri zobrazovaní vektorovej grafiky na monitore alebo pri tlači. Nevýhoda je, že po prevode sa stratí informácia o spojitosti objektov – z kriviek a tvarov zostane iba sústava pixelov v konkrétnom rozlíšení.

**Prevod z rastra na vektor** voláme **vektorizácia**. Algoritmus musí v pixeloch rozpoznať hrany, oblasti a tvary a nahradiť ich geometrickými objektmi, napríklad úsečkami alebo krivkami. Výsledok závisí od nastavení, napríklad od počtu farieb, miery vyhladenia a počtu riadiacich bodov.

#### Algoritmy na vykresľovanie rastrovej úsečky

Pri rasterizácii úsečky chceme z ideálnej matematickej čiary vybrať také pixely, ktoré ju v mriežke čo najlepšie napodobnia. Výsledkom teda nie je spojitá čiara, ale **postupnosť pixelov**.

Jednoducho povedané: algoritmus ide po mriežke a v každom kroku vyberá pixel, ktorý je najbližšie k ideálnej úsečke.

Na obrázku je princíp **Bresenhamovho algoritmu**: v každom kroku sa vyberá pixel, ktorý najlepšie približuje ideálnu úsečku.

![Bresenhamov algoritmus rasterizácie úsečky](images/05-grafika-a-multimedia/rasterizacia-usecky.gif)

Pri miernej úsečke postupujeme typicky zľava doprava po stĺpcoch. V každom stĺpci treba rozhodnúť, ktorý riadok pixelu najlepšie zodpovedá priebehu čiary. Pri strmej úsečke je to opačne – postupuje sa skôr po riadkoch.

**DDA (Digital Differential Analyzer)** je jednoduchý prírastkový algoritmus. V každom kroku sa posunie o jeden pixel v hlavnom smere a druhú súradnicu dopočíta ako reálne číslo. Výsledok potom zaokrúhli na najbližší pixel. Je intuitívny, ale pracuje s reálnymi číslami a zaokrúhľovaním.

**Bresenhamov algoritmus** robí podobné rozhodnutie efektívnejšie. Namiesto počítania reálnych súradníc si udržiava rozhodovaciu hodnotu a podľa nej vyberá medzi dvoma možnými susednými pixelmi. Je rýchly, pretože používa hlavne **celočíselnú aritmetiku**.

![Porovnanie DDA a Bresenhamovho algoritmu](images/05-grafika-a-multimedia/dda-vs-bresenham.svg)

<div class="raster-visualizer"></div>

Rozdiel sa dá povedať krátko: **DDA počíta a zaokrúhľuje**, Bresenham **rozhoduje medzi kandidátskymi pixelmi celočíselne**.

#### Rasterizácia kružnice

Pri rasterizácii kružnice nahrádzame dokonalý geometrický tvar **pixelmi v mriežke**. Kružnica je daná stredom a polomerom, ale na obrazovke sa musí zobraziť ako množina vhodne vybraných pixelov.

Pri rasterizácii využívame **osovú súmernosť kružnice**. Nemusíme počítať celú kružnicu bod po bode. Stačí vypočítať jeden oktant a ostatné body získame zrkadlením do zvyšných častí kružnice.

Najčastejšie sa používa **Bresenhamov algoritmus pre kružnicu**, nazývaný aj stredový algoritmus. Myšlienka je podobná ako pri úsečke: v každom kroku sa rozhodujeme medzi dvoma možnými pixelmi a vyberáme ten, ktorý je bližšie k ideálnej kružnici. Algoritmus je efektívny, pretože rozhodovanie robí pomocou **celočíselných výpočtov**.

<div class="circle-visualizer"></div>

#### Interpolačná a aproximačná krivka

Základný rozdiel je v tom, či krivka musí prechádzať zadanými bodmi.

**Interpolačná krivka** prechádza presne zadanými, tzv. uzlovými bodmi. Typickým príkladom je **Fergusonova kubika**, ktorá je určená dvoma krajnými bodmi a dotykovými vektormi v týchto bodoch. Krajné body určujú, kde krivka začína a končí, a dotykové vektory určujú smer a mieru zakrivenia. Čím je dotykový vektor väčší, tým viac sa k nemu krivka približuje. Ak sú oba dotykové vektory nulové, krivka sa správa ako úsečka.

![Fergusonova kubika s krajnými bodmi a dotykovými vektormi](images/05-grafika-a-multimedia/fergusonova-kubika.svg)

<div class="ferguson-visualizer"></div>

**Aproximačná krivka** nemusí prechádzať všetkými riadiacimi bodmi. Riadiace body vytvárajú riadiaci polygón, ktorý ovplyvňuje výsledný tvar krivky. Výhodou je jednoduchšia interaktívna editácia a hladší priebeh.

Typické aproximačné krivky:

- **Bézierova krivka** – veľmi používaná vo vektorovej grafike, fontoch, PostScripte a grafických editoroch – prechádza krajnými bodmi a leží v konvexnej obálke riadiaceho polygónu,
- **B-splajn** – zovšeobecňuje Bézierove krivky a je vhodný pri zložitejších tvaroch, lebo zmena jedného riadiaceho bodu ovplyvňuje len časť krivky,
- **NURBS** – rozšírenie B-splajnov, používané najmä v CAD a 3D modelovaní.

<div class="bezier-visualizer"></div>

### 18. Dvojrozmerné transformácie v počítačovej grafike. (posunutie, zrkadlenie, zmena mierky, skosenie, rotácia, matematické vyjadrenie transformácií, skladanie transformácií).

#### Dvojrozmerné transformácie v počítačovej grafike

Dvojrozmerné transformácie opisujú, ako sa mení poloha, veľkosť alebo tvar objektu v rovine, teda v súradniciach `x` a `y`. Používajú sa pri manipulácii s grafickými objektmi, napríklad pri ich posúvaní, otáčaní, zväčšovaní alebo deformovaní.

Pri **vektorových objektoch** sa transformácie aplikujú najmä na vrcholy, riadiace body alebo iné geometrické body objektu. Pri **rastrových objektoch** sa pracuje s bodmi rastra, teda s pixelmi, čo môže pri zmene mierky alebo rotácii viesť k potrebe prevzorkovania.

Medzi základné 2D transformácie patria **posunutie, zrkadlenie, zmena mierky, skosenie a rotácia**. Tieto transformácie sa často zapisujú pomocou matíc, pretože potom vieme viac transformácií skladať do jednej výslednej transformácie. Pri skladaní je dôležité poradie, lebo napríklad rotácia a posunutie vo všeobecnosti nedajú rovnaký výsledok, keď ich vymeníme.

#### Posunutie

Posunutie je transformácia, ktorá mení **polohu objektu** v rovine. Je dané vektorom posunutia `p = (px, py)`, ktorý sa pripočíta ku každému bodu objektu:

`x' = x + px`, `y' = y + py`.

Posunutie nemení tvar, veľkosť ani orientáciu objektu – iba ho presunie na iné miesto.

V homogénnych súradniciach sa dá zapísať transformačnou maticou:

```txt
| 1  0  px |
| 0  1  py |
| 0  0   1 |
```

V klasických kartézskych súradniciach by posunutie bolo sčítaním vektorov, nie násobením matíc. Homogénne súradnice umožňujú zapísať aj posunutie ako maticu, a tým ho skladať s ostatnými transformáciami.

#### Zrkadlenie

Zrkadlenie je transformácia, ktorá vytvára **zrkadlový obraz objektu** vzhľadom na os alebo stred súradnicovej sústavy. V 2D sa najčastejšie rieši zrkadlenie podľa osi `x`, podľa osi `y` alebo podľa počiatku.

Zrkadlenie podľa osi `x`:

`x' = x`, `y' = -y`

```txt
| 1   0   0 |
| 0  -1   0 |
| 0   0   1 |
```

Zrkadlenie podľa osi `y`:

`x' = -x`, `y' = y`

```txt
| -1   0   0 |
|  0   1   0 |
|  0   0   1 |
```

Zrkadlenie podľa stredu súradnicovej sústavy:

`x' = -x`, `y' = -y`

```txt
| -1   0   0 |
|  0  -1   0 |
|  0   0   1 |
```

Zrkadlenie sa dá chápať aj ako špeciálny prípad zmeny mierky so záporným koeficientom. Napríklad `sx = -1`, `sy = 1` zodpovedá zrkadleniu podľa osi `y`.

#### Zmena mierky

Zmena mierky je transformácia, pomocou ktorej sa mení **veľkosť objektu**. Je daná koeficientmi mierky `kx` a `ky`, ktoré určujú, koľkokrát sa zmení súradnica v príslušnej osi:

`x' = kx · x`, `y' = ky · y`.

Ak `kx = ky`, ide o rovnomernú zmenu mierky a zachová sa pomer strán objektu. Ak `kx ≠ ky`, objekt sa deformuje, napríklad kružnica sa môže zmeniť na elipsu.

V homogénnych súradniciach má matica zmeny mierky tvar:

```txt
| kx   0   0 |
|  0  ky   0 |
|  0   0   1 |
```

Pri `|k| > 1` sa objekt zväčšuje, pri `0 < |k| < 1` sa zmenšuje. Záporný koeficient zároveň spôsobuje zrkadlenie v príslušnej osi.

#### Skosenie

Skosenie je transformácia, ktorá spôsobuje **deformáciu objektu vo forme naklonenia** v príslušnej osi. Používa sa napríklad pri tvorbe kurzívy alebo pri šikmom posunutí riadkov/stĺpcov objektu.

Skosenie v smere osi `x` mení súradnicu `x` podľa hodnoty `y`:

`x' = x + Sx · y`, `y' = y`

```txt
| 1  Sx   0 |
| 0   1   0 |
| 0   0   1 |
```

Skosenie v smere osi `y` mení súradnicu `y` podľa hodnoty `x`:

`x' = x`, `y' = y + Sy · x`

```txt
|  1   0   0 |
| Sy   1   0 |
|  0   0   1 |
```

Skosenie má zmysel najmä pri celých dvojrozmerných objektoch, nie pri izolovanom bode, pretože vizuálne sa prejaví až ako naklonenie tvaru.

#### Rotácia

Rotácia je transformácia, ktorá otáča objekt o uhol `α` okolo počiatku súradnicovej sústavy. Kladný uhol sa zvyčajne berie proti smeru hodinových ručičiek.

Pre bod `(x, y)` platí:

`x' = x · cos(α) - y · sin(α)`

`y' = x · sin(α) + y · cos(α)`

V homogénnych súradniciach má matica rotácie tvar:

```txt
| cos(α)  -sin(α)   0 |
| sin(α)   cos(α)   0 |
|   0        0      1 |
```

Ak chceme objekt otočiť okolo iného bodu, napríklad okolo jeho stredu, použije sa zložená transformácia: najprv sa bod/stred presunie do počiatku, potom sa vykoná rotácia a nakoniec sa objekt posunie späť.

#### Matematické vyjadrenie transformácií

Geometrické transformácie sa v počítačovej grafike zapisujú pomocou **transformačných matíc**. V 2D sa preto bod neberie iba ako dvojica `(x, y)`, ale v homogénnych súradniciach ako trojica `(x, y, 1)`.

Vďaka homogénnym súradniciam sa dajú všetky základné 2D transformácie zapísať jednotne ako matice `3 × 3`:

```txt
P' = M · P
```

kde `P` je pôvodný bod, `M` je transformačná matica a `P'` je transformovaný bod.

Hlavný dôvod použitia homogénnych súradníc je ten, že aj **posunutie**, ktoré je v klasických kartézskych súradniciach sčítaním vektora, sa dá zapísať ako maticová transformácia. Vďaka tomu môžeme s posunutím, rotáciou, mierkou, skosením aj zrkadlením pracovať rovnakým spôsobom.

Výhodou maticového zápisu je aj to, že viac transformácií vieme skladať násobením matíc a použiť potom jednu výslednú transformačnú maticu.

#### Skladanie transformácií

Pri skladaní transformácií sa jednotlivé transformačné matice násobia do jednej výslednej matice. Výsledok závisí od poradia, pretože násobenie matíc vo všeobecnosti nie je komutatívne.

Prakticky to znamená, že **poradie transformácií mení výsledok**. Posunutie a potom rotácia nedajú rovnaký výsledok ako rotácia a potom posunutie.

Typický príklad je **rotácia okolo vlastného stredu objektu**. Rotácia sa matematicky najjednoduchšie robí okolo počiatku súradnicovej sústavy. Ak teda chceme objekt otočiť okolo jeho stredu, postup je:

1. presunieme stred objektu do počiatku,
2. vykonáme rotáciu,
3. presunieme objekt späť na pôvodné miesto.

![Rotácia okolo vlastného stredu objektu](images/05-grafika-a-multimedia/rotacia-okolo-vlastneho-stredu.gif)

V grafických systémoch sa tieto kroky zvyčajne spoja do jednej výslednej transformácie, aby sa objekt nemusel prepočítavať viackrát. Matice sú teda praktický spôsob, ako si celý postup uložiť a použiť naraz.

<div class="transform-visualizer"></div>

### 19. Digitalizácia a spracovanie farieb (vzorkovanie, kvantizácia, model CIE x,y,z, farebné modely, skladanie farieb v modeloch, gamut výstupných zariadení). Charakteristika a vlastnosti farieb, charakteristika farebných schém.

#### Vzorkovanie

Vzorkovanie (sampling) je prvý krok digitalizácie obrazu. Spojitý obraz, ktorý si môžeme predstaviť ako funkciu `f(x, y)`, sa rozdelí na konečný počet vzoriek – teda na mriežku `N` riadkov a `M` stĺpcov. Prienik riadka a stĺpca tvorí obrazový bod, čiže pixel.

Vzorkovanie určuje, **kde** z obrazu odoberáme hodnoty. Pri digitálnom obraze sa prejaví ako rozlíšenie alebo hustota obrazových bodov, napríklad v DPI.

Základné spôsoby vzorkovania:

- **bodové vzorkovanie** – hodnota pixela sa odoberie z jedného bodu,
- **plošné vzorkovanie** – hodnota pixela sa určí z určitej oblasti, napríklad priemerovaním.

Podľa Shannon-Nyquistovej vety musí byť vzorkovanie dostatočne husté vzhľadom na najmenšie detaily v obraze. Ak je vzoriek málo, vzniká **aliasing**, napríklad zubaté hrany alebo moiré efekt.

#### Kvantizácia

Kvantizácia je druhý krok digitalizácie obrazu. Po vzorkovaní už vieme, **kde** je pixel, a kvantizácia určuje, **akú číselnú hodnotu** mu priradíme, napríklad jas alebo farbu.

Spojitý rozsah hodnôt sa nahradí konečným počtom úrovní. Počet dostupných úrovní závisí od **farebnej hĺbky**, teda od počtu bitov použitých na zakódovanie farby. Napríklad 8 bitov dáva 256 úrovní a 24-bitové RGB dáva približne 16,7 milióna farieb.

Pri kvantizácii sa vyberá zástupná hodnota pre daný interval, napríklad priemerom, váženým priemerom alebo mediánom. Keďže ide o zjednodušenie pôvodnej spojitej hodnoty, môže vzniknúť **kvantizačná chyba**.

V obraze sa kvantizačná chyba prejaví najmä pri jemných farebných alebo jasových prechodoch ako náhle posuny farieb, pásy alebo strata detailov.

#### Model CIE XYZ

**CIE XYZ** je štandardizovaný farebný priestor definovaný Medzinárodnou komisiou pre osvetlenie (CIE). Slúži ako zariadeniami nezávislý spôsob opisu farieb, teda nie je viazaný na konkrétny monitor, tlačiareň alebo fotoaparát.

Vychádza z trichromatického vnímania farieb: ľubovoľnú farbu vieme matematicky opísať pomocou troch zložiek `X`, `Y` a `Z`. Z modelu CIE XYZ sa odvodzuje aj chromatický diagram `x, y`, ktorý zobrazuje farby bez jasovej zložky.

Chromatický diagram CIE sa používa najmä na znázornenie **farebných priestorov** a **gamutov** zariadení. Napríklad gamut monitora sa často zobrazí ako trojuholník vo vnútri diagramu – farby mimo tohto trojuholníka dané zariadenie nevie zobraziť.

Nevýhodou základného CIE XYZ / `x, y` priestoru je, že geometrická vzdialenosť medzi dvoma farbami nemusí zodpovedať tomu, ako veľký rozdiel medzi nimi vníma človek. Preto vznikli neskoršie priestory ako **CIE L*u*v*** a **CIE L*a*b***, ktoré sa snažia lepšie zodpovedať ľudskému vnímaniu farieb.

#### Farebné modely

Farebný model určuje, pomocou akých zložiek farbu opisujeme a ako z týchto zložiek výsledná farba vzniká. Rôzne modely sa používajú podľa toho, či farbu vytvára svetlo, tlačová farba alebo či chceme farbu nastavovať intuitívne podľa odtieňa, sýtosti a jasu.

- **RGB / RGBA** – aditívny model používaný pri zariadeniach, ktoré farbu vytvárajú svetlom, napríklad monitor alebo projektor. Každý pixel je zložený z červenej, zelenej a modrej zložky, často v rozsahu `0–255`. Čierna je `(0, 0, 0)`, biela je `(255, 255, 255)`. `RGBA` pridáva alfa kanál pre priehľadnosť.
- **CMY / CMYK** – subtraktívny model používaný pri tlači. Farby vznikajú tým, že pigmenty odoberajú zložky svetla odrazeného od papiera. Model CMY funguje voči RGB inverzne – v praxi sa pridáva samostatná čierna zložka `K`, pretože kombinácia CMY nedáva ideálnu čiernu a tlač samostatnou čiernou je praktickejšia.
- **HSV / HSL** – modely bližšie ľudskému vnímaniu farby. Nepopisujú farbu priamo cez červenú, zelenú a modrú, ale cez odtieň (`Hue`), sýtosť (`Saturation`) a jasovú zložku (`Value` alebo `Lightness`). Používajú sa najmä vo výberoch farieb v grafických editoroch.
- **CIE L*a*b*** – perceptuálne orientovaný farebný priestor, ktorý sa snaží lepšie zodpovedať ľudskému vnímaniu rozdielov medzi farbami. Používa sa pri presnej práci s farbami, korekciách a prevodoch medzi zariadeniami.

#### Skladanie farieb v modeloch

**Aditívne skladanie** sa používa pri svetelných zdrojoch, napríklad v modeli `RGB`. Farby vznikajú pridávaním svetla. Ak nesvieti žiadna zložka, výsledkom je čierna – ak svietia všetky tri zložky naplno, výsledkom je biela.

**Subtraktívne skladanie** sa používa pri tlači, teda v modeloch `CMY` a `CMYK`. Farba nevzniká pridávaním svetla, ale odoberaním zložiek z bieleho svetla odrazeného od papiera. `C` odoberá červenú, `M` zelenú a `Y` modrú zložku.

Model `CMY` funguje voči RGB inverzne, zjednodušene:

- `C = 255 - R`,
- `M = 255 - G`,
- `Y = 255 - B`.

Teoreticky by kombinácia `C + M + Y` mala dať čiernu, ale v praxi vzniká skôr špinavá tmavá farba. Preto sa v tlači používa `CMYK`, kde `K` predstavuje samostatnú čiernu zložku.

Rozdiel medzi aditívnym a subtraktívnym skladaním je jeden z dôvodov, prečo farba na monitore a farba po vytlačení nemusia vyzerať rovnako.

#### Gamut výstupných zariadení

**Gamut** je rozsah farieb, ktoré zariadenie dokáže zaznamenať alebo reprodukovať. Pri výstupných zariadeniach ide napríklad o farby, ktoré vie zobraziť monitor alebo vytlačiť tlačiareň.

Gamut sa často znázorňuje ako podmnožina **CIE chromatického diagramu**. Pri RGB zariadeniach, napríklad monitoroch, sa zobrazuje ako trojuholník určený ich primárnymi farbami. Farby mimo tohto trojuholníka sú **mimo gamut** a zariadenie ich nevie presne zobraziť.

Na obrázku celý farebný diagram predstavuje vnímateľné farebnosti v rovine `x, y`. Trojuholník ukazuje gamut konkrétneho RGB priestoru – teda iba tú časť farieb, ktorú vie daný systém vytvoriť alebo zobraziť.

![CIE 1931 chromatický diagram s gamut trojuholníkom CIE RGB](images/05-grafika-a-multimedia/cie-1931-cie-rgb.svg)

Tlačiarne pracujúce v modeli `CMYK` majú zvyčajne menší a tvarovo komplikovanejší gamut než monitory. Navyše sa ich gamut môže meniť podľa jasu, papiera, atramentu alebo technológie tlače.

Farebný rozsah a farebná odozva zariadenia sú popísané v **ICC profiloch**. Pri prenose obrazu medzi zariadeniami, napríklad z monitora do tlače, sa farby musia prepočítať alebo premapovať. Preto výtlačok nemusí vyzerať presne rovnako ako obraz na displeji.

#### Charakteristika a vlastnosti farieb

Farbu môžeme opísať tromi základnými vlastnosťami: **odtieňom, jasom a sýtosťou**.

- **Odtieň (hue)** – určuje, akú farbu vnímame, napríklad červenú, zelenú alebo modrú. Súvisí s dominantnou vlnovou dĺžkou svetla a vo farebných modeloch sa často vyjadruje uhlom na farebnom kruhu.
- **Jas / svetlosť** – vyjadruje intenzitu svetla, teda prechod od čiernej po bielu. Ľudské oko je na zmeny jasu veľmi citlivé.
- **Sýtosť (saturation)** – vyjadruje čistotu farby. Čím je sýtosť vyššia, tým je farba výraznejšia – čím je nižšia, tým viac sa blíži k šedej.

Z iného pohľadu môžeme farby deliť na:

- **chromatické** – farebné farby, napríklad červená, modrá, zelená,
- **achromatické** – biela, čierna a všetko medzi nimi, teda odtiene sivej,
- **lomené** – chromatické farby zmiešané s achromatickou zložkou.

Farbu nevnímame absolútne, ale v kontexte. Výsledný dojem ovplyvňuje zdroj svetla, pozadie, uhol dopadu svetla, veľkosť objektu aj podmienky pozorovania.

Fyziologicky farbu vníma ľudské oko cez čapíky. Existujú tri typy čapíkov citlivé približne na červenú, zelenú a modrú oblasť spektra, čo je základ **trichromatického videnia** a aj digitálnych modelov typu RGB.

#### Charakteristika farebných schém

Farebné schémy vychádzajú z usporiadania farieb na **farebnom kruhu**. Farebný kruh pomáha znázorniť vzťahy medzi farbami, napríklad susedné farby, protikladné farby alebo rovnomerne rozložené kombinácie. V prednáškach sa spomína najmä **Ittenov farebný kruh**, ktorý má 12 farieb rozdelených na primárne, sekundárne a terciálne.

Základné typy farebných schém:

- **Monochromatická** – jedna základná farba v rôznych odtieňoch, jasoch a sýtostiach. Pôsobí jednotne a pokojne.
- **Analogická** – farby ležiace vedľa seba na farebnom kruhu. Pôsobí prirodzene a harmonicky, často bez veľkého kontrastu.
- **Komplementárna** – dvojica farieb oproti sebe na farebnom kruhu. Má výrazný kontrast – pri svetelných zdrojoch môžu komplementárne farby spolu vytvoriť biele svetlo.
- **Triadická** – tri farby rovnomerne rozložené na farebnom kruhu, približne po 120°. Pôsobí vyvážene, ale výraznejšie než analogická schéma.
- **Tetradická** – štyri farby, zvyčajne dve dvojice komplementárnych farieb.
- **Split-komplementárna** – základná farba a dve farby susediace s jej komplementom. Má kontrast, ale je menej ostrá než priama komplementárna schéma.

### 20. Technické zariadenia na vykresľovanie obrazu v počítačovej grafike a multimédiách (vstupné, výstupné, vstupno-výstupné, porty, parametre, spôsob vykreslenia obrazu, ergonómia zariadení)

#### Vstupné zariadenia

Vstupné zariadenia slúžia na zadávanie grafickej informácie do počítača. Najčastejšie ide o polohu bodu, zmenu polohy, dotyk, kresbu alebo digitalizovaný obraz.

- **Myš** – polohovacie zariadenie, ktoré sníma zmenu polohy v osiach **x** a **y**. Optická alebo laserová myš osvetľuje podložku, **CMOS senzor** sníma zmeny odrazu a výsledok sa vyhodnotí ako pohyb kurzora. Dôležitý parameter je **rozlišovacia schopnosť**, udávaná v **DPI**.
- **Trackball** – pracuje podobne ako obrátená myš. Používateľ nepresúva celé zariadenie, ale otáča guľou – jej pohyb okolo dvoch osí sa prevedie na horizontálny a vertikálny pohyb kurzora.
- **Joystick / gamepad** – pákový alebo tlačidlový ovládač, používaný najmä v hrách a simulátoroch. Poloha sa sníma v osiach **x** a **y** analógovo, napríklad potenciometrami, alebo opticky – analógová hodnota sa následne prevedie cez **A/D prevodník** do digitálnej podoby.
- **Dotyková vrstva displeja** – sníma polohu dotyku na obrazovke. Po dotyku sa kurzor presunie na dané miesto alebo sa vyvolá akcia podobná kliknutiu myšou. Podrobnejšie typy dotykových obrazoviek patria medzi vstupno-výstupné zariadenia.
- **Grafický tablet / digitalizér** – slúži na kreslenie a prevod analógových čiar, kriviek alebo výkresov do počítača. Na rozdiel od myši pracuje s **absolútnymi súradnicami** – sleduje sa veľkosť aktívnej plochy, **LPI**, úrovne prítlaku a náklon pera.
- **Skener** – digitalizuje analógovú predlohu, napríklad obrázok alebo text. Predloha sa osvetlí, senzory zmerajú intenzitu odrazeného svetla v mriežke bodov a hodnoty sa cez **ADC prevodník** prevedú na digitálny raster. Pri texte sa na rozpoznanie znakov používa **OCR**.

Skener môže byť **čiernobiely** alebo **farebný** – farebný sníma zložky **RGB**, typicky s 24-bitovou farebnou hĺbkou. Podľa konštrukcie rozlišujeme napríklad **tuškové**, **plošné**, **bubnové** a **knižné** skenery. Dôležité parametre sú veľkosť skenovanej plochy, **DPI**, farebná hĺbka, typ senzora a spôsob pripojenia.

#### Výstupné zariadenia

Výstupné zariadenia prevádzajú digitálne dáta z počítača na vizuálny výstup. Výstup môže byť dočasný, napríklad obraz na displeji, alebo trvalý, napríklad tlač na papier.

- **Monitor / displej** – základné výstupné zariadenie počítača. Dnes ide prakticky o rastrové zariadenie, ktoré obraz skladá z pixelov. Historicky sa používali **CRT** monitory, dnes najmä **LCD** a **OLED** displeje – pri grafickej práci sú dôležité rozlíšenie, farby, kontrast, gamut, obnovovacia frekvencia a uhol pohľadu.
- **Projektor** – zobrazuje obraz premietaním na plátno alebo inú plochu. Používa sa pri prezentáciách, výučbe, kine alebo väčšom zdieľanom zobrazení.
- **Tlačiareň** – prevádza digitálny dokument alebo obraz na papier, typicky vo farebnom modeli **CMYK**. Môže tlačiť v textovom režime, kde sa posielajú najmä kódy znakov, alebo v grafickom režime, kde sa prenáša informácia o bodoch tlačenej mriežky. Základné typy sú **maticové**, **atramentové** a **laserové / LED** tlačiarne.
- **Plotter** – veľkoformátové výstupné zariadenie používané najmä na technické výkresy, CAD dokumentáciu a plagáty. Pôvodne išlo o typické zariadenie pre **vektorový výstup**, kde sa kresliaca hlava pohybovala po súradniciach – dnes sa používajú aj rastrové atramentové alebo laserové plotre.
- **VR headset** – moderné výstupné zariadenie, ktoré zobrazuje obraz samostatne pre ľavé a pravé oko, čím vytvára priestorový dojem.

Pri výstupných zariadeniach sledujeme najmä kvalitu obrazu, rozlíšenie, farebné podanie, rýchlosť alebo plynulosť výstupu, podporované médiá, spôsob pripojenia a prevádzkové náklady.

#### Vstupno-výstupné zariadenia

Vstupno-výstupné zariadenia dokážu informáciu zároveň zobrazovať aj prijímať. Typický príklad je **dotykový displej**, ktorý funguje ako výstupné zariadenie, pretože zobrazuje obraz, a zároveň ako vstupné zariadenie, pretože sníma polohu dotyku.

- **Dotykový displej** – po dotyku sa kurzor presunie na dané miesto alebo sa vyvolá akcia podobná kliknutiu myšou.
- **Rezistívna dotyková obrazovka** – reaguje na tlak. Pri dotyku sa odporová vrstva pritlačí na vodivú vrstvu a podľa napätia sa určí poloha v osiach **x** a **y**. Dá sa ovládať aj predmetom, ale má horšiu priepustnosť svetla a zvyčajne nepodporuje viac dotykov naraz.
- **Kapacitná dotyková obrazovka** – reaguje na zmenu elektrického poľa pri dotyku vodivým prvkom, typicky prstom. Je citlivá, má dobrý obraz a podporuje multitouch – preto sa používa najmä v smartfónoch, tabletoch a notebookoch.
- **Infračervená dotyková obrazovka** – po okrajoch displeja má infračervené lúče. Dotyk sa určí podľa toho, ktoré horizontálne a vertikálne lúče boli prerušené. Výhodou je odolnosť a citlivosť, nevýhodou možnosť falošných vstupov pri nečistotách.
- **Akustická / ultrazvuková dotyková obrazovka** – využíva šírenie akustickej vlny po skle. Dotyk vlnu naruší a regulátor zistí miesto dotyku. Má dobrú presnosť a priepustnosť svetla, ale môže byť citlivá na prach, vodu alebo tvrdé predmety.

#### Porty

**Komunikačné rozhranie** je spôsob, akým sa zariadenie pripája k počítaču alebo ku komunikačnej zbernici na prenos údajov. Môže byť fyzické, bezdrôtové alebo aj softvérové. **Port** je konkrétny externý konektor počítača, definovaný mechanicky, elektricky aj komunikačne.

Podľa spôsobu prenosu rozlišujeme:

- **sériový prenos** – bity sa prenášajú postupne za sebou,
- **paralelný prenos** – naraz sa prenáša viac bitov vedľa seba.

Všeobecné komunikačné rozhrania:

- **USB** – univerzálne sériové rozhranie pre periférie, napríklad myš, tablet, skener alebo tlačiareň.
- **Bluetooth** – bezdrôtové rozhranie vhodné pre periférie s nižšou dátovou náročnosťou.
- **FireWire (IEEE 1394)** – staršie sériové rozhranie, používané najmä pri digitálnom videu a profesionálnych zariadeniach.

Grafické komunikačné rozhrania:

- **VGA** – staršie analógové rozhranie, prenáša samostatné farebné zložky **RGB** a synchronizačné signály.
- **DVI** – digitálne rozhranie, ktoré nahrádzalo VGA a existovalo vo variantoch `DVI-D`, `DVI-A` a `DVI-I`.
- **HDMI** – digitálne rozhranie na prenos obrazu aj zvuku, typické pre monitory, televízory a projektory.
- **DisplayPort (DP)** – moderné digitálne rozhranie na prenos obrazu a zvuku, používané najmä pri monitoroch s vyšším rozlíšením alebo obnovovacou frekvenciou.

#### Parametre zariadení

**Monitory / displeje:**

- **Rozlíšenie** – počet pixelov obrazu, napríklad `1920 × 1080`, `2560 × 1440` alebo `3840 × 2160`.
- **Natívne rozlíšenie** – fyzické rozlíšenie LCD/OLED panelu – pri inom nastavení sa obraz prepočítava a môže strácať ostrosť.
- **Uhlopriečka a pomer strán** – veľkosť obrazovky a tvar obrazu, napríklad `16:9`, `16:10` alebo historicky `4:3`.
- **Obnovovacia frekvencia** – počet prekreslení obrazu za sekundu, napríklad 60 Hz, 120 Hz alebo 144 Hz – vyššia hodnota znamená plynulejší pohyb.
- **Odozva bodu** – čas, za ktorý pixel zmení stav – dôležitá najmä pri videu a hrách.
- **Jas a kontrast** – ovplyvňujú čitateľnosť a dynamiku obrazu.
- **Farebné podanie a gamut** – určujú, aký rozsah farieb vie displej zobraziť.
- **Uhol pohľadu** – rozsah uhlov, pri ktorých ostáva obraz čitateľný a farebne neskreslený.
- **Rozstup bodov** – fyzická vzdialenosť medzi obrazovými bodmi – menší rozstup znamená jemnejší obraz.
- **Poruchy bodov a spotreba energie** – sledujú sa najmä pri kvalite a prevádzke zariadenia.

**Tlačiarne a plotre:**

- **Rozlíšenie v DPI** – počet bodov na palec – čím vyššie DPI, tým jemnejší a ostrejší výstup.
- **Rýchlosť tlače** – počet strán za minútu alebo rýchlosť veľkoformátového výstupu.
- **Režim tlače** – napríklad ekonomický, textový alebo grafický režim.
- **Formát a typ média** – papier, fólia, termopapier alebo veľkoformátová rola.
- **Prevádzkové náklady** – toner, atrament, papier, údržba a spotreba energie.

**Skenery, tablety a digitalizéry:**

- **Rozlíšenie skenera v DPI** – hustota bodov, v ktorých skener sníma predlohu.
- **LPI pri tabletoch a digitalizéroch** – jemnosť snímacej mriežky alebo rozlíšenie snímania polohy.
- **Farebná hĺbka** – počet bitov použitých na uloženie farby alebo odtieňa.
- **Veľkosť aktívnej alebo skenovanej plochy** – napríklad formát papiera alebo pracovná plocha tabletu.
- **Typ senzora a spôsob pripojenia** – napríklad USB, Bluetooth alebo iné rozhranie.

**DPI** vyjadruje počet bodov na palec (*dots per inch*). Používa sa pri tlači, skenovaní aj zobrazovaní. **LPI** vyjadruje počet liniek na palec a používa sa najmä pri tlačovom rastri alebo pri popise jemnosti snímania pri tabletoch a digitalizéroch.

#### Spôsob vykreslenia obrazu

Spôsob vykreslenia závisí od technológie zariadenia. Pri displejoch sa dnes obraz väčšinou vytvára ako **rastrová mriežka pixelov**, pri tlači ako sústava bodov alebo kvapiek farby na papieri.

**Displeje a monitory:**

- **CRT** – stará technológia monitorov a televízorov, kde sa obraz vytváral postupným rozsviecovaním bodov na obrazovke pomocou elektrónového lúča. Takéto displeje boli oproti dnešným veľké, ťažké a mali vyššiu spotrebu.
- **LCD (Liquid Crystal Display)** – pixely samy nesvietia, ale pomocou tekutých kryštálov regulujú svetlo z podsvietenia. Moderné LCD sú väčšinou **TFT** displeje s aktívnou maticou.
  - **TN** – rýchly a lacný panel, ale horšie farby a pozorovacie uhly.
  - **VA** – dobrý kontrast, často hlbšia čierna.
  - **IPS** – lepšie farby a široké pozorovacie uhly. *(môj príklad: AOC Q24G2A/BK)*
- **OLED** – každý pixel svieti samostatne, preto nepotrebuje podsvietenie. Výhodou je vysoký kontrast a skutočná čierna, nevýhodou môže byť cena, životnosť a riziko vypaľovania obrazu. *(môj príklad: iPhone 13 Pro – OLED)*
- **QLED / Mini-LED / Micro-LED** – moderné technológie zamerané najmä na vyšší jas, lepší kontrast a širší farebný gamut. *(môj príklad: MacBook Pro M4 Pro – Mini-LED)*
- **E-ink** – elektronický papier používaný hlavne v čítačkách. Obraz udrží bez neustáleho podsvietenia, preto má veľmi nízku spotrebu a dobre sa číta aj na svetle.

**Projektory:**

- **Projektor** – vytvára obraz projekciou na plátno alebo inú plochu. Podľa technológie môže používať LCD panely, DLP mikrozrkadlá alebo laserový svetelný zdroj.

**Tlačiarne a plotre:**

- **Maticová tlačiareň** – vytvára obraz otláčaním ihličiek cez farbiacu pásku na papier. Je hlučná a má nižšiu kvalitu grafiky, ale je lacná na prevádzku a vie tlačiť na skladaný papier.
- **Atramentová tlačiareň** – vytvára obraz striekaním malých kvapiek atramentu na papier. Je vhodná na farebnú tlač a fotografie.
- **Laserová / LED tlačiareň** – vytvára elektrostatický obraz na valci, na ktorý sa naviaže toner. Toner sa potom prenesie na papier a teplom zapečie. Je vhodná na rýchlu, kontrastnú a stabilnú tlač.
- **Plotter** – pri pôvodných vektorových plotroch sa kresliaca hlava pohybovala po súradniciach a kreslila čiary perom. Dnešné plotre môžu pracovať aj rastrovým spôsobom, podobne ako veľkoformátové atramentové alebo laserové tlačiarne.

#### Ergonómia zariadení

Ergonómia rieši, aby sa grafické a multimediálne zariadenia dali používať pohodlne, bezpečne a bez zbytočnej únavy. Pri tejto otázke ide hlavne o displeje, svetlo, polohu zariadení a dlhodobú prácu používateľa.

- **Poloha monitora** – obrazovka má byť vo vhodnej vzdialenosti od očí a približne vo výške očí, aby používateľ nemusel dlhodobo zakláňať alebo skláňať hlavu.
- **Uhol pohľadu** – displej má mať taký pozorovací uhol, aby sa pri bežnom sedení neskresľovali farby, kontrast ani čitateľnosť obrazu.
- **Jas a osvetlenie prostredia** – jas displeja má zodpovedať okolitému svetlu. Príliš jasný displej v tme alebo príliš tmavý displej v silnom svetle viac namáha zrak.
- **Obnovovacia frekvencia a blikanie** – vyššia a stabilná obnovovacia frekvencia znižuje únavu očí, najmä pri dlhšej práci alebo sledovaní pohybu.
- **Modrá zložka svetla** – pri LED displejoch môže byť nevhodná najmä pri nočnej práci – večer je príjemnejšie teplejšie žlté až červené svetlo.
- **Vstupné zariadenia** – myš, tablet alebo klávesnica majú byť umiestnené tak, aby používateľ zbytočne nenamáhal zápästie, predlaktie a ramená.
- **Prestávky pri práci** – pri dlhom pozeraní do displeja alebo presnej práci s grafikou sú dôležité krátke prestávky, preostrenie zraku a zmena polohy.

### 21. Virtuálna a zmiešaná realita a Motion Capture systémy. Charakteristika, činnosť zobrazovanie obrazu vo virtuálnej a zmiešanej realite, príklady zobrazenia, využitie, prínosy a úskalia. MOCAP charakteristika, klasifikácia, spôsob zaznamenávanie pohybu, využitie, rigovanie, príklady využitia.

#### Virtuálna realita

**Virtuálna realita (VR)** je počítačom vytvorené prostredie, do ktorého je používateľ vizuálne a zvukovo ponorený. Cieľom je vytvoriť ilúziu priestoru, ktorý v danom čase fyzicky neexistuje, ale používateľ ho vníma ako náhradný digitálny svet.

Dôležité je, že VR nie je iba obraz na displeji. Interaguje s ľudskými zmyslami a reaguje na vstupy používateľa, napríklad pohyb hlavy, rúk alebo ovládačov. Vďaka tomu má používateľ pocit, že sa vo virtuálnom priestore môže orientovať a konať.

Typicky sa realizuje cez **head-mounted display** (náhlavný displej), napríklad **Meta Quest**, teda headset, ktorý používateľ nosí na hlave. Ten zobrazuje obraz priamo pred očami, sleduje polohu a orientáciu používateľa a podľa toho mení pohľad vo virtuálnej scéne.

#### Zmiešaná realita

**Zmiešaná realita (mixed reality)** kombinuje reálne prostredie so syntetickými, počítačom vytvorenými objektmi v reálnom čase. Používateľ stále vníma skutočný svet, ale systém doň vkladá virtuálne objekty tak, aby pôsobili ako súčasť priestoru.

Kľúčový rozdiel oproti **VR** je v tom, že MR musí rozumieť okolitému priestoru. Nestačí zobraziť 3D objekt; systém musí vedieť, kde je stôl, stena alebo používateľ, aby virtuálny objekt ostal stabilne ukotvený v reálnom prostredí.

Príbuzný pojem je **augmented reality** (rozšírená realita). V bežnom výklade sa AR chápe ako doplnenie reálneho obrazu o digitálne prvky, napríklad navigáciu, popisky alebo 3D model. Pri zmiešanej realite je dôraz najmä na to, že virtuálne objekty sú priestorovo previazané s reálnym prostredím.

Typický príklad je **Microsoft HoloLens**, ktorý sleduje polohu hlavy, očí a rúk, rekonštruuje reálne prostredie a umožňuje umiestňovať hologramy na reálne povrchy.

#### Činnosť zobrazovania obrazu vo VR/MR

Pri VR je najdôležitejší **vizualizačný podsystém**, pretože obraz vytvára hlavný pocit prítomnosti vo virtuálnom svete. Používa sa trojrozmerné zobrazovanie, teda systém vytvára priestorový obraz tak, aby ho človek vnímal prirodzene.

Základné prístupy sú dva. Buď používateľ sleduje obraz na statickej projekčnej ploche, napríklad na monitore, stene alebo v CAVE systéme, alebo má zobrazovaciu jednotku priamo na hlave. Pri náhlavnom displeji sa obraz pohybuje spolu s používateľom, čo zvyčajne vytvára silnejší pocit ponorenia do virtuálneho sveta.

Zariadenie zároveň sleduje pohyb hlavy. Jednoduchšie systémy môžu mať **3DoF** (*degrees of freedom*, stupne voľnosti), teda sledujú hlavne rotáciu hlavy. Pokročilejšie systémy majú **6DoF**, teda sledujú rotáciu aj polohový pohyb používateľa dopredu/dozadu, doľava/doprava a hore/dole. Keď používateľ otočí hlavu alebo sa posunie, systém podľa toho zmení pohľad vo virtuálnej scéne.

Pri stereoskopickom zobrazení dostáva ľavé a pravé oko mierne odlišný obraz, takže vzniká dojem hĺbky.

Pri MR sa digitálny obraz kombinuje s reálnym prostredím. Zariadenie najprv sleduje používateľa a rekonštruuje okolie, napríklad pomocou kamier, hĺbkového snímača a inerciálnej jednotky. Na základe toho vytvorí mapu priestoru a vie umiestniť virtuálny objekt na reálny povrch.

Výsledkom je, že hologram alebo 3D objekt má v priestore stabilnú pozíciu, napríklad leží na stole alebo visí na stene. Používateľ s ním môže interagovať pohľadom, gestom, hlasom alebo pohybom ruky.

#### Príklady zobrazenia

- **Monitor-based VR** – virtuálne prostredie sa zobrazuje na monitore. Je menej pohlcujúce, ale používa sa napríklad pri návrhu, architektúre alebo technických aplikáciách.
- **Wall projector VR** – obraz sa premieta na stenu alebo plátno – často sa používajú stereoskopické okuliare a špecializovaný softvér.
- **ImmersaDesk** – projekčná pracovná plocha alebo „VR tabuľa“, kde používateľ sleduje stereoskopický obraz a systém môže sledovať polohu hlavy.
- **CAVE systém** – miestnosť alebo kocka, kde sa obraz premieta na viac stien. Používateľ má stereoskopické okuliare a systém sleduje jeho polohu, aby sa perspektíva prispôsobila pohľadu.
- **Monocular head-mounted display** – headset zobrazujúci obraz iba pre jedno oko.
- **Binocular head-mounted display** – headset pre obe oči, typický pre moderné VR headsety. Každé oko dostáva vlastný obraz, čím vzniká priestorový dojem.
- **Samostatný VR headset** – zariadenie má výpočtové komponenty priamo v headsete, napríklad **Meta Quest**. Nepotrebuje stále fyzické pripojenie k počítaču.
- **Headset závislý od počítača** – vyžaduje pripojenie k výkonnému PC alebo konzole, napríklad **HTC Vive**, **Valve Index** alebo **PlayStation VR2**. Praktický príklad je **Beat Saber**, ktorý vyšiel najprv pre PC VR headsety a neskôr sa stal jednou z najznámejších VR hier.
- **Vehicle simulation** – simulátory vozidiel, kde sa virtuálne prostredie synchronizuje s pohybom alebo ovládaním vozidla. Praktický príklad je trenažér v autoškole pri príprave na vodičský preukaz.
- **AR/MR okuliare** – napríklad **Microsoft HoloLens**, ktoré zobrazujú virtuálne objekty v reálnom prostredí a umožňujú ich ukotviť na reálne povrchy.
- **Video see-through AR/MR** – kamera sníma reálne prostredie, systém do obrazu vloží virtuálne prvky a výsledok zobrazí na displeji.

#### Využitie VR a MR

VR a MR majú zmysel najmä tam, kde pomáha **priestorová vizualizácia**, **simulácia** alebo doplnenie reálneho prostredia o digitálne informácie. Nejde len o hry, ale aj o tréning, návrh, medicínu, výskum a prácu v priestore.

- **Architektúra a návrh priestoru** – architekt alebo dizajnér si vie prejsť budovu, interiér alebo urbanistický návrh ešte pred fyzickou realizáciou. Praktický AR príklad je **IKEA Place**, kde si používateľ vie vložiť 3D model nábytku v skutočnej mierke do vlastnej izby a pozrieť sa, či sa tam hodí. Prednášky spomínajú aj prácu architektov a projekt **City Scope** z MIT pre územné plánovanie.
- **Vývoj produktov a priemysel** – VR/MR umožňuje kontrolovať tvar, ergonómiu a konštrukciu výrobku ešte pred prototypom. Príklady zo zdrojov sú **Volvo** pri modifikácii auta a **Ford** pri procesoch vývoja.
- **Medicína** – používa sa vizualizácia ľudského tela, tréning zákrokov a inštruktáže pri operáciách. Príkladom je projekt **Živé srdce**, teda virtuálny model srdca, alebo chirurgický tréning pri systéme **DaVinci**.
- **Vzdelávanie a veda** – VR/AR pomáha ukázať javy, ktoré sa v realite ťažko pozorujú, napríklad fyziku, chémiu, astronómiu, anatómiu alebo technické postupy. V zdrojoch sa spomína aj **Qubit Arcade** na vysvetľovanie princípov kvantovej výpočtovej techniky.
- **Armáda, bezpečnosť a simulátory** – výcvik pilotov, vodičov, vojakov alebo záchranárov v situáciách, ktoré by boli v realite drahé, nebezpečné alebo ťažko opakovateľné.
- **Kultúra, história a umenie** – virtuálne prehliadky múzeí, rekonštrukcie historických miest alebo AR prvky v živom predstavení. Príkladom je projekt **Parsifal**, kde sa živé operné predstavenie obohacovalo o prvky AR.
- **Šport, cvičenie a rehabilitácia** – tréning pohybov, rozšírenie možností tréningu a rehabilitačné pomôcky, napríklad pri cvičení alebo obnove pohybových schopností.
- **Sociálna oblasť a konferencie** – zdieľané virtuálne priestory, stretnutia na diaľku a aplikácie proti sociálnej izolácii. Prednáška spomína napríklad projekt **Rendever**.

#### Prínosy a úskalia

**Prínos VR a MR je v tom, že používateľ nevidí len informáciu na ploche, ale pracuje s ňou priestorovo.** Vie sa pozerať okolo seba, meniť uhol pohľadu, skúšať situácie a pri MR vidieť digitálne objekty priamo v reálnom prostredí.

- **Lepšie priestorové pochopenie** – 3D objekt, budova, ľudské telo alebo technický návrh sa dá obísť, zväčšiť, rozobrať alebo zobraziť z iného uhla.
- **Bezpečný tréning** – používateľ môže nacvičovať operáciu, riadenie vozidla, vojenský výcvik alebo servisný postup bez reálneho rizika a bez drahého poškodenia vybavenia.
- **Simulácia ťažko dostupných situácií** – dá sa ukázať prostredie, jav alebo postup, ktorý by bol v realite nebezpečný, drahý, príliš malý, príliš veľký alebo ťažko opakovateľný.
- **Rýchlejšie navrhovanie a testovanie** – pri produktoch, autách, architektúre alebo pracovných postupoch sa dá skôr odhaliť problém v návrhu.
- **MR ako digitálna vrstva nad realitou** – virtuálne objekty, návody alebo informácie sa dajú ukotviť na reálne miesto, napríklad na stôl, súčiastku, stenu alebo stroj.

**Úskalia sú hlavne v tom, že systém musí presvedčivo oklamať zrak, pohyb a rovnováhu človeka.** Ak obraz, tracking alebo odozva nesedia, používateľ to veľmi rýchlo cíti.

- **Nevoľnosť a dezorientácia** – pri nesúlade medzi tým, čo používateľ vidí, a tým, čo cíti rovnovážny aparát, môže vzniknúť motion sickness, teda nevoľnosť podobná kinetóze.
- **Latencia a nepresný tracking** – oneskorená reakcia obrazu na pohyb hlavy alebo rúk narúša pocit prítomnosti a zvyšuje únavu.
- **Namáhanie očí a bolesti hlavy** – problémom môžu byť blikajúce prvky, príliš rýchly pohyb, objekty príliš blízko očí, nízke rozlíšenie alebo nevhodné nastavenie headsetu.
- **Ergonómia a únava** – headset môže byť ťažký, zahrievať sa, tlačiť na hlavu alebo obmedzovať používateľa pri dlhšom používaní.
- **Technické a finančné limity** – kvalita závisí od rozlíšenia, zorného poľa, obnovovacej frekvencie, výkonu počítača, presnosti senzorov, mapovania priestoru a výdrže batérie.
- **Zdravotné obmedzenia** – opatrnosť je potrebná pri epilepsii, výrazných zrakových problémoch, tehotenstve, kardiostimulátore alebo u malých detí; prednášky výslovne spomínajú, že VR sa nemá používať u detí do 10 rokov.

#### Motion Capture systémy

**Motion Capture** je proces **záznamu pohybu objektov alebo osôb** do digitálnej podoby. Systém sleduje vybrané body, senzory alebo kĺby v čase a z nameraných údajov vytvára opis pohybu, ktorý vie počítač ďalej spracovať.

Výstupom nie je hotové video, ale **pohybové dáta** – napríklad poloha, orientácia alebo uhol častí tela v jednotlivých časových okamihoch. Tieto dáta sa potom môžu použiť na animáciu 3D postavy, analýzu pohybu, tréning, simuláciu alebo ovládanie virtuálneho systému.

Motion capture má dve základné aplikácie:

- **nahrávka** – pohyb sa zaznamená a spracuje až neskôr, napríklad pri animácii filmu alebo hry,
- **reálny čas** – pohyb sa okamžite prenáša na digitálny model alebo virtuálnu scénu, napríklad pri simulácii, výcviku alebo ovládaní avatara.

#### Klasifikácia

Tradičné Motion Capture systémy sa podľa princípu snímania pohybu delia na **magnetické**, **optické** a **mechanické**.

![Motion Capture systémy](images/05-grafika-a-multimedia/mocap-systemy.png)

**Magnetické systémy**

Používajú senzory umiestnené na tele, ktoré merajú nízkofrekvenčné magnetické pole generované vysielačom. Zvyčajne sa používa viac senzorov na osobu, napríklad približne 6 až 11 alebo viac pri presnejšom zázname. Výhodou sú nižšie náklady, nevýhodou citlivosť na kovové objekty, obmedzený rozsah, latencia, záťaž pre herca a skreslenie pri viacerých hercoch blízko seba. Sú vhodnejšie na zachytávanie pohybu tela než tváre.

**Optické systémy**

Pohyb sa sníma kamerami. Používajú sa buď **pasívne markery**, teda reflexné značky, alebo **aktívne markery**, napríklad LED body. Jednoduchšie snímanie môže vystačiť s menším počtom kamier, pri presnom celotelovom zázname sa používa viac kamier, typicky 8 až 16 alebo viac. Výhodou je dobrá použiteľnosť pri 3D simuláciách a animácii, nevýhodou vyššia cena, potreba väčšieho priestoru, viac energie a pri pasívnych systémoch aj väčšie nároky na čistenie a spracovanie dát.

**Mechanické / elektromechanické systémy**

Používajú konštrukciu alebo oblek so snímačmi v kĺboch, napríklad gyroskopickými prvkami a potenciometrami. Tým priamo určujú uhly kĺbov tela. Nepotrebujú špeciálne kamery, nie sú ovplyvnené kovovými predmetmi a hodia sa na real-time scenáre. Nevýhodou je, že môžu byť ťažkopádne a majú obmedzený rozsah pohybu, napríklad pri gymnastických alebo veľmi dynamických pohyboch.

V modernej praxi sa používajú aj **inerciálne** systémy s IMU senzormi alebo **markerless** prístupy, kde sa poloha tela odhaduje priamo z obrazu kamier.

#### Spôsob zaznamenávania pohybu

Pri Motion Capture sa najprv pripraví snímaný objekt alebo človek. Pri markerových systémoch sa na telo umiestnia **markery**, často na špeciálny oblek a na miesta zodpovedajúce kĺbom alebo dôležitým bodom tela. Pri senzorových systémoch sa namiesto markerov používajú fyzické snímače.

Počas záznamu systém v čase sleduje polohu, orientáciu alebo uhly týchto markerov a senzorov. Výsledkom je časová postupnosť pohybových dát, teda informácia o tom, kde sa jednotlivé časti tela nachádzali a ako sa menili v čase.

Následne sa dáta spracujú. Kontroluje sa, či markery alebo senzory ostali na správnych miestach, opravujú sa výpadky, zámene bodov a medzery v dátach. Až potom sa pohyb pripraví na ďalšie použitie, napríklad na analýzu alebo animáciu digitálnej postavy.

Pri animácii sa pohybové dáta prenášajú na pripravený model postavy. Zjednodušene povedané, systém z reálneho pohybu vytvorí dáta, ktoré potom rozhýbu virtuálnu kostru alebo avatar.

#### Využitie MOCAP

Motion Capture sa používa všade tam, kde potrebujeme presne zaznamenať, analyzovať alebo preniesť pohyb do digitálnej podoby. Základná myšlienka je rovnaká: reálny pohyb človeka alebo objektu sa prevedie na dáta, ktoré sa dajú použiť v animácii, simulácii, tréningu alebo vyhodnocovaní pohybu.

- **Zábava, film a hry** – tvorba realistickej animácie digitálnych postáv a avatarov.
- **Šport a medicína** – analýza pohybu, držania tela, rozsahu pohybu, rehabilitácie alebo techniky športovca.
- **Armáda a simulácie** – výcvik, nácvik situácií a prenášanie pohybu do virtuálneho prostredia.
- **Robotika a počítačové videnie** – získavanie referenčných dát na overovanie systémov, ktoré majú pohyb rozpoznávať, modelovať alebo napodobňovať.

#### Rigovanie

**Rigovanie** je proces, pri ktorom sa statickému 3D modelu pridá vnútorná kostra, aby sa dal ovládať a animovať. Rig je sústava virtuálnych kostí a kĺbov, ktoré určujú, ktoré časti modelu sa budú pri pohybe hýbať.

![Príklad rigovania 3D postavy](images/05-grafika-a-multimedia/rigging-example.jpg)

Kostra sa následne prepojí s povrchom modelu, teda s meshom. Tento krok sa nazýva **skinning** a určuje, ako silno jednotlivé kosti ovplyvňujú konkrétne časti povrchu. Napríklad pri ohnutí lakťa sa musí správne deformovať aj povrch ruky.

Pri Motion Capture sa pohybové dáta prenášajú práve na takto pripravený rig. Najprv sa nastaví základná póza, často **T-póza**, aby bolo jasné, ktorý kĺb reálneho človeka zodpovedá ktorému kĺbu virtuálnej postavy. Potom sa pohyb z markerov alebo senzorov mapuje na kosti digitálneho modelu.

Dôležitý je aj **retargeting**, teda prenos pohybu medzi telami s rôznymi proporciami. Ak sa urobí zle, vznikajú chyby ako neprirodzené deformácie, posunuté ruky alebo **foot sliding**, keď sa nohy postavy kĺžu po zemi namiesto toho, aby pevne stáli.

#### Príklady využitia

- Vo filme sa pohyb herca zaznamená a prenesie na digitálnu postavu. Typický príklad je **Avatar**, kde sa pohyby a mimika hercov prenášali na digitálne postavy Na'vi.
- V hrách sa zaznamenávajú pohyby športovcov, bojovníkov alebo hercov, aby animácie postáv nepôsobili umelo. Napríklad pri hre **Call of Duty: Modern Warfare 2** sa Motion Capture používal na zachytenie pohybov hercov pre animácie postáv.
- Pri futbale sa Motion Capture môže použiť aj na marketingové alebo herné účely. Napríklad **Marcus Rashford** sa objavil v Premier League Primary Stars videách vytvorených technológiou Motion Capture, aká sa používala aj pri sérii **EA SPORTS FIFA**.
- V športe sa dá analyzovať beh, skok, tenisový úder alebo golfový švih a hľadať chyby v technike.
- V medicíne sa Motion Capture používa napríklad pri **analýze chôdze pacienta po úraze alebo operácii**. Systém zachytí pohyb nôh, panvy a kĺbov a lekár alebo fyzioterapeut vie objektívne posúdiť, či sa pohyb zlepšuje.
- V robotike a počítačovom videní môžu pohybové dáta slúžiť ako referenčný záznam pre učenie alebo testovanie algoritmov.

---
