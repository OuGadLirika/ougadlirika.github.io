## Počítačové architektúry

### 5. Zobrazenie informácie v počítači a vyjadrenie čísel v počítači, pozičné a nepozičné číselné sústavy, algoritmy prevodov medzi sústavami (binárna, decimálna, hexadecimálna), Byte (prevody jednotiek), základné časti počítača, popis a princíp jednotlivých komponentov

#### Zobrazenie informácie v počítači

Počítač pracuje s binárnou reprezentáciou, teda s jednotkami a nulami. Jeden taký stav je **bit**. Aby mohol pracovať s komplexnejšími informáciami, každý typ dát musí byť **zakódovaný do binárnej podoby**:

- **Čísla** – priamy binárny zápis.
- **Text** – každý znak má **číselný kód**:
  - `ASCII` – 7-bitové kódovanie, 128 znakov.
  - **Unicode / UTF-8** – premenlivá dĺžka 1–4 bajty, pokrýva svetové abecedy.
- **Obraz** – rastrovo ako **mriežka pixelov**, pričom každý pixel nesie farebnú hodnotu (napr. RGB 3 × 8 bit = 24 bit na pixel).
- **Zvuk** – **vzorkovanie analógového signálu v čase**.

#### Vyjadrenie čísel v počítači

**Celé čísla bez znamienka** sa ukladajú ako obyčajný binárny zápis. Napríklad pri 8 bitoch je rozsah `0` až `255`.

**Celé čísla so znamienkom** sa v počítači najčastejšie ukladajú pomocou **dvojkového doplnku (two's complement)**. Jeden bit tým pádom vyjadruje aj znamienko čísla, takže časť rozsahu ide do záporných a časť do kladných hodnôt. Napríklad pri 8 bitoch je rozsah `-128` až `127`. Výhoda dvojkového doplnku je v tom, že sčítanie a odčítanie môže hardvér robiť prakticky rovnakým spôsobom ako pri číslach bez znamienka.

**Reálne čísla** sa zvyčajne ukladajú vo formáte **s pohyblivou rádovou čiarkou (floating point)** podľa štandardu **IEEE 754**. Číslo sa rozdelí na **znamienko**, **exponent** a **mantisu**. Znamienko určuje, či je číslo kladné alebo záporné, exponent určuje jeho približnú veľkosť a mantisa nesie jeho presné číslice.

Typické formáty sú **float** a **double**. **Float** má 32 bitov, **double** 64 bitov. Dôležité je, že takýto zápis má **obmedzenú presnosť**, takže nie každé desatinné číslo sa dá v binárnej sústave uložiť úplne presne.

#### Pozičné a nepozičné číselné sústavy

**Pozičné sústavy** sú také, kde hodnota cifry závisí od toho, na ktorom mieste v čísle stojí. Napríklad v čísle `222` má tá istá cifra vždy inú hodnotu: raz znamená stovky, raz desiatky a raz jednotky.

V informatike sú dôležité hlavne tieto pozičné sústavy:

- **Decimálna** (z = 10) – cifry 0–9, prirodzená pre človeka.
- **Binárna** (z = 2) – cifry 0, 1, natívna pre hardvér.
- **Hexadecimálna** (z = 16) – cifry 0–9 a písmená A–F, **kompaktný zápis binárnych dát** (MAC adresy, farby, pamäťové adresy).

**Nepozičné sústavy** fungujú inak: symbol má svoju hodnotu danú pevne a nie hlavne podľa pozície. Typický príklad sú **rímske číslice**, kde `I` znamená 1, `V` znamená 5 a `X` znamená 10. Takýto zápis je menej vhodný na výpočty, lebo aritmetika je zložitejšia, chýba prirodzený symbol pre nulu a rozsah zápisu je obmedzený.

#### Algoritmy prevodov medzi sústavami (binárna, decimálna, hexadecimálna)

**DEC → BIN** – opakované delenie číslom 2, zvyšky sa čítajú **odzadu**:

```
13 ÷ 2 = 6, zvyšok 1
 6 ÷ 2 = 3, zvyšok 0
 3 ÷ 2 = 1, zvyšok 1
 1 ÷ 2 = 0, zvyšok 1
→ 1101₂
```

**BIN → DEC** – súčet mocnín dvojky na pozíciách s jednotkou:

```
1101₂ = 1×2³ + 1×2² + 0×2¹ + 1×2⁰ = 8 + 4 + 0 + 1 = 13₁₀
```

**DEC → HEX** – analogicky, **opakované delenie číslom 16**, pričom zvyšky sa prepíšu na cifry 0–9, A–F.

**HEX → DEC** – **súčet mocnín šestnástky** na pozíciách.

**BIN ↔ HEX (rýchly prevod)** – každá hexadecimálna cifra = presne **4 bity**. Stačí zoskupovať alebo rozkladať bity po štvoriciach:

`1010 1111₂ → A F → AF₁₆`

Tento prevod sa v praxi používa najčastejšie – napr. pri čítaní **pamäťových adries** v debuggeri alebo **kódov farieb** v CSS.

#### Byte (prevody jednotiek)

- **Bit (b)** – najmenšia jednotka informácie (0 alebo 1).
- **Byte (B)** – 8 bitov, základná **adresovateľná jednotka pamäte**.

**Binárne (IEC) predpony** sa používajú pre **pamäť a kapacitu v operačnom systéme** – násobia sa **mocninami dvojky**:

| Jednotka | Veľkosť         |
| -------- | --------------- |
| 1 KiB    | 1 024 B         |
| 1 MiB    | 1 048 576 B     |
| 1 GiB    | 1 073 741 824 B |
| 1 TiB    | ≈ 1,1 × 10¹² B  |

**Desiatkové (SI) predpony** sa používajú pre **rýchlosti a výrobné kapacity diskov** – násobia sa **mocninami desiatky**:

- `1 KB = 10³ B = 1 000 B`
- `1 MB = 10⁶ B`
- `1 GB = 10⁹ B`
- `1 TB = 10¹² B`

Rozdiel medzi **SI a IEC** vysvetľuje, prečo **„1 TB disk“ v OS ukazuje len ≈ 931 GiB** (`10¹² / 2³⁰ ≈ 931,3`).

#### Základné časti počítača, popis a princíp jednotlivých komponentov

Počítač pozostáva zo **štyroch podsystémov**, ktoré komunikujú cez **zbernice (buses)**:

- **Procesor** – vykonáva **inštrukcie programu**. Obsahuje **riadiacu jednotku (CU)**, **aritmeticko-logickú jednotku (ALU)** a **registre**.
- **Operačná pamäť** – uchováva **práve spúšťaný program a jeho dáta**. Je priamo adresovateľná procesorom a **volatilná** (po vypnutí obsah zmizne).
- **Sekundárna pamäť (úložisko)** – uchováva **perzistentné dáta**: HDD, SSD, SD karty.
- **I/O zariadenia** – zabezpečujú **vstup a výstup dát** medzi počítačom a perifériami, typicky klávesnica, myš, displej, tlačiareň alebo sieťové rozhranie.

**Zbernice** sú paralelné vodiče, ktoré prepájajú podsystémy:

- **Adresná zbernica** – procesor ňou posiela **adresu pamäte alebo zariadenia**.
- **Dátová zbernica** – prenáša **samotné dáta**.
- **Riadiaca zbernica** – prenáša **synchronizačné signály** (read / write, clock, prerušenia).

Klasická architektúra dnešných osobných počítačov je **Von Neumannova** – má **spoločnú pamäť pre inštrukcie aj dáta**.

### 6. Princíp analógového a digitálneho počítača, generácie počítačov a ich súčiastky, Flynnova klasifikácia (SISD, SIMD, MISD, MIMD), pokročilejšie architektúry (presahovanie, zreťazenie – pipeline, multiprocessing symetrický/asymetrický, SIMD rozšírenia SSE, AVX).

#### Princíp analógového a digitálneho počítača

Analógový počítač pracuje so **spojitými fyzikálnymi veličinami**, napríklad napätím, prúdom, polohou alebo otáčkami. Výpočet neprebieha ako postupnosť binárnych operácií, ale ako **fyzikálny model daného problému**. Typickým príkladom je **diferenciálny analyzátor**, ktorý pomocou mechanických prvkov riešil diferenciálne rovnice.

![Diferenciálny analyzátor](images/02-pocitacove-architektury/diferencialny-analyzator.jpg)

Výhodou analógových počítačov je prirodzené **spracovanie spojitých dejov**, napríklad regulácie, simulácie alebo pohybu. Nevýhodou je **nižšia presnosť**, **citlivosť na rušenie** a slabá univerzálnosť oproti digitálnym počítačom.

Digitálny počítač pracuje s **diskrétnymi hodnotami**, typicky s bitmi **0 a 1**. Informácie nie sú reprezentované plynulou fyzikálnou veličinou, ale **binárnym kódom**. Program aj dáta sú **uložené v pamäti** a procesor ich spracúva ako **postupnosť inštrukcií**.

Výhodou digitálnych počítačov je **vysoká presnosť**, **programovateľnosť**, jednoduché kopírovanie a uchovávanie dát a **univerzálnosť**. Ak má digitálny počítač spracovať spojitý jav z reálneho sveta, musí sa najprv previesť na diskrétne hodnoty, napríklad **vzorkovaním a kvantovaním**.

#### Generácie počítačov a ich súčiastky

**1. generácia (1945–1955)**  
Dominantnou technológiou boli **elektrónky (vákuové trubice)**. Počítače mali **obrovské rozmery**, **vysokú spotrebu** a **nízku spoľahlivosť**. Programovanie bolo veľmi nízkoúrovňové, často cez strojové inštrukcie, prepínače alebo fyzické prepojovanie. Príklad: **ENIAC**.

![Programovanie počítača ENIAC](images/02-pocitacove-architektury/Glen_Beck_and_Betty_Snyder_program_the_ENIAC_in_building_328_at_the_Ballistic_Research_Laboratory.jpg)

**2. generácia (1955–1965)**  
Dominantnou technológiou boli **tranzistory**, ktoré nahradili elektrónky. Počítače boli **menšie**, **spoľahlivejšie** a **energeticky úspornejšie**. Programovalo sa najmä v strojovom kóde alebo assemblerovských jazykoch. Príklad: **IBM 1401**.

![IBM 1401](images/02-pocitacove-architektury/1959c_1401_System_Users2_16x9.avif)

**3. generácia (1965–1975)**  
Dominantnou technológiou boli **integrované obvody**. Do jedného čipu sa integrovali **desiatky až stovky tranzistorov**. Nastupovali **operačné systémy**, **multitasking** a **časovo zdieľané systémy**. Príklad: **IBM System/360**.

![IBM System/360 Model 30](images/02-pocitacove-architektury/IBM_System_360_model_30_profile.agr.jpg)

**4. generácia (1975–súčasnosť)**  
Dominantnou technológiou boli **mikroprocesory** – procesor sa sústredil do **jedného čipu**. To umožnilo výrazné **zmenšenie**, **zlacnenie** a **masové rozšírenie počítačov**, najmä osobných počítačov. Príklady: **Intel 4004**, rodina **x86**.

![Intel 4004](images/02-pocitacove-architektury/Intel_C4004.jpg)

**5. generácia (súčasnosť a budúcnosť)**  
Dôraz je na **paralelné, neurónové a AI procesory**. Patria sem **viacjadrové CPU**, **GPU**, **TPU**, výskum kvantových a optických počítačov a silná orientácia na **umelú inteligenciu**.

| OBDOBIE (CCA) | Technológia | Typické znaky | Príklady |
| -------------------- | -------------------- | ------------- | -------- |
| 1945–1955 | Elektrónky (vákuové trubice) | veľké rozmery, vysoká spotreba, nízka spoľahlivosť | ENIAC, UNIVAC I |
| 1955–1965 | Tranzistory | menšie a spoľahlivejšie stroje, nástup jazykov vyššej úrovne | IBM 1401 |
| 1965–1975 | Integrované obvody | vyššia integrácia, OS, multitasking, time-sharing | IBM System/360 |
| 1975–súčasnosť | Mikroprocesory | PC revolúcia, GUI, siete, masová dostupnosť | Intel 4004, x86 |
| Súčasnosť | Paralelné a AI akcelerátory (CPU/GPU/TPU) | viacjadrovosť, HPC, ML/AI, heterogénne výpočty | moderné CPU, GPU, TPU |

#### Flynnova klasifikácia (SISD, SIMD, MISD, MIMD)

Flynnova klasifikácia rozdeľuje architektúry podľa počtu súčasne spracúvaných **prúdov inštrukcií** a **prúdov dát**.

**SISD (Single Instruction, Single Data)**  
**Jedna inštrukcia** spracúva **jeden dátový prvok**. Typický príklad je **klasický sekvenčný procesor**.

**SIMD (Single Instruction, Multiple Data)**  
**Jedna inštrukcia** sa aplikuje súčasne na **viacero dátových prvkov**. Typické pre **grafiku**, **vektorové operácie**, **GPU** a rozšírenia ako **SSE/AVX**.

**MISD (Multiple Instruction, Single Data)**  
**Viaceré inštrukcie** operujú nad **tým istým dátovým prvkom**. V praxi je to **zriedkavá kategória** – používa sa skôr v špeciálnych redundantných systémoch, kde sa ten istý údaj kontroluje viacerými spôsobmi.

**MIMD (Multiple Instruction, Multiple Data)**  
**Viac procesorov alebo jadier** vykonáva **rôzne inštrukcie** nad **rôznymi dátami** paralelne. Dnes je to **najbežnejší model** pre viacjadrové CPU, klastre a superpočítače.

#### Presahovanie, zreťazenie – pipeline

Obe techniky zvyšujú výkon procesora tým, že jednotlivé fázy **inštrukčného cyklu** vykonávajú **súbežne**, nie striktne sekvenčne.

**Presahovanie (overlap)**  
Jednoduchšia technika, pri ktorej sa **prekrývajú len dve fázy**, napríklad načítanie ďalšej inštrukcie počas vykonávania aktuálnej. Znižuje réžiu, ale v danom okamihu sa stále reálne **dokončuje jedna inštrukcia**.

**Zreťazenie (pipeline)**  
Inštrukčný cyklus je rozdelený na **viacero samostatných etáp**, ktoré môžu súbežne spracúvať rôzne inštrukcie.

- Typické etapy sú **fetch**, **decode**, **execute**, **memory** a **writeback**.
- V ideálnom prípade sa za každý takt **dokončí jedna inštrukcia** (CPI ≈ 1).
- Výkon obmedzujú **hazardy**:
  - **štrukturálne** – konflikt o hardvér,
  - **dátové** – nasledujúca inštrukcia potrebuje výsledok predošlej,
  - **riadiace** – skoky a vetvenie programu.
- Riešia sa technikami ako **forwarding**, **stall** a **branch prediction**.

#### Multiprocessing symetrický/asymetrický

Multiprocessing znamená, že systém používa **viac procesorov alebo jadier**, ktoré spolupracujú na výpočte.

**Symetrický multiprocessing**  
Všetky procesory alebo jadrá sú **rovnocenné**. Zdieľajú **spoločnú operačnú pamäť**, beží nad nimi **jeden operačný systém** a úlohy sa medzi ne prideľujú **dynamicky**. Tento model je typický pre dnešné **viacjadrové počítače**.

**Asymetrický multiprocessing**  
Procesory alebo jadrá **nemajú rovnakú rolu**. Jeden môže byť riadiaci (**master**) a prideľovať prácu ostatným (**slave**), alebo môžu byť jednotlivé procesory **špecializované na rôzne typy úloh**. Tento model sa používa skôr v **embedded**, riadiacich alebo heterogénnych systémoch.

#### SIMD rozšírenia SSE, AVX

SSE a AVX sú **vektorové SIMD rozšírenia inštrukčnej sady x86**. SIMD znamená, že **jedna inštrukcia spracuje viac dát naraz**. Namiesto toho, aby procesor napríklad sčítal prvky poľa po jednom, môže **jednou vektorovou inštrukciou** spracovať viac čísel súčasne.

Pointa SSE a AVX je **zvýšiť výkon** pri úlohách, kde sa **tá istá operácia opakuje nad veľkým množstvom dát**.

**SSE (Streaming SIMD Extensions)**  
**Staršie SIMD rozšírenie** architektúry x86. Používalo sa najmä pri **multimédiách**, **grafike**, spracovaní zvuku a videa.

**AVX (Advanced Vector Extensions)**  
**Novšie a širšie SIMD rozšírenie**. Umožňuje spracovať **viac dát naraz než SSE**, preto je dôležité pri **vedeckých výpočtoch**, **strojovom učení**, šifrovaní alebo spracovaní obrazu.

### 7. Mikroprocesor – základné parametre (takt, šírka slova, efektivita mikrokódu, cache), princíp práce mikroprocesora, Von Neumannova a Harvardská architektúra, ALU, riadiaca jednotka, registre x86 (všeobecné, segmentové, riadiace, špeciálne), prerušenia, typy prerušenia, kontrolér prerušenia, rezidentné programy a ich úloha v systéme.

#### Základné parametre (takt, šírka slova, efektivita mikrokódu, cache)

**Takt (clock frequency)**  
Takt vyjadruje, **ako rýchlo procesor vykonáva jednotlivé kroky** svojej činnosti.

- [[verified: Strojový cyklus je postupnosť niekoľkých taktov.]]
- [[verified: Doba cyklu je čas, ktorý procesor potrebuje na jeden prechod inštrukčným cyklom, a je jedným z kritérií pri hodnotení pracovnej rýchlosti procesora.]]
- [[verified: Množstvo týchto cyklov za jednu sekundu sa nazýva frekvencia procesora. Jednotkou je Hertz (Hz).]]

**Vyšší takt** znamená viac taktov za sekundu, ale **nie automaticky vyšší výkon**. Záleží aj na tom, koľko práce procesor stihne urobiť v jednom takte, ako často čaká na pamäť a akú má architektúru.

**Šírka slova (word size)**  
Šírka slova hovorí, s **akou veľkosťou dát procesor prirodzene pracuje**, napríklad 8, 16, 32 alebo 64 bitov. Súvisí najmä s veľkosťou **registrov**, **operandov** a **adries**, s ktorými vie procesor efektívne pracovať.

[[verified: Procesor 8086 je 16-bitový procesor.]] [[verified: Pracuje s dátami veľkosti 16 alebo 8 bitov a vytvára 20-bitovú adresu pre adresovanie 1 MB fyzickej pamäte.]] [[verified: U novších 32-bitových procesorov sa na prístup k celému 32-bitovému registru používa označenie s `E`, napríklad `EAX`.]]

Prakticky: **32-bitová architektúra** pracuje s 32-bitovými registrami a typicky adresuje najviac približne **4 GB pamäte**, **64-bitová architektúra** pracuje so širšími registrami a umožňuje omnoho väčší adresný priestor.

**Efektivita mikrokódu (CPI – Cycles Per Instruction)**  
Tento parameter hovorí, **koľko taktov procesor potrebuje na vykonanie jednej inštrukcie**. Často sa používa pojem **CPI** (*Cycles Per Instruction*) – počet cyklov na jednu inštrukciu. **Nižšie CPI** znamená, že procesor pri rovnakom takte vykoná viac inštrukcií.

Nejde teda len o **frekvenciu**. Dva procesory s rovnakým taktom môžu mať **rozdielny výkon**, ak jeden potrebuje na rovnakú prácu menej cyklov alebo vie vykonávať viac inštrukcií paralelne.

**Cache**  
Cache je veľmi rýchla **vyrovnávacia pamäť medzi procesorom a operačnou pamäťou**. Ukladá **často používané dáta a inštrukcie**, aby procesor nemusel pri každom prístupe čakať na pomalšiu RAM. Tým znižuje **latenciu prístupu k dátam** a zvyšuje reálny výkon procesora.

Cache pamäť má v moderných procesoroch typicky tri úrovne: **L1**, **L2** a **L3**.

- **L1 cache** – **najmenšia a najrýchlejšia**, priamo pri jadre procesora.
- **L2 cache** – **väčšia**, ale o niečo pomalšia.
- **L3 cache** – **ešte väčšia**, často **zdieľaná medzi viacerými jadrami**.

Praktický príklad: **Ryzen 7 5800X3D** má **512 KB L1 cache**, **4 MB L2 cache** a **96 MB L3 cache**.

#### Princíp práce mikroprocesora

[[verified: Procesor je časť počítača určená na vykonávanie programu. Je to logický obvod, ktorý dokáže spracovávať sadu inštrukcií.]]

[[verified: Program je postupnosť inštrukcií uložených v určitom poradí v pamäti.]]

Mikroprocesor pracuje tak, že tieto inštrukcie postupne **načítava**, **dekóduje** a **vykonáva**. Tento postup sa stále opakuje ako **inštrukčný cyklus**. [[verified: Inštrukčný, resp. strojový cyklus je postupnosť činností riadiacej jednotky, ktorá sa pri spracovaní inštrukcií neustále opakuje, kým sa neobjaví inštrukcia STOP.]]

Zjednodušený priebeh:

1. **Nastavenie čítača inštrukcií** – čítač inštrukcií ukazuje na inštrukciu, ktorá sa má vykonať.
2. **Načítanie inštrukcie** – [[verified: inštrukcia sa načíta do registra inštrukcie (`RI`).]]
3. **Dekódovanie** – [[verified: dekóduje sa operačný kód inštrukcie.]]
4. **Vykonanie operácie** – operáciu vykoná príslušná časť procesora, typicky **ALU** alebo iná vykonávacia jednotka.
5. **Posun na ďalšiu inštrukciu** – [[verified: čítač inštrukcií sa nastaví na ďalšiu inštrukciu (`ČI + 1 → ČI`) alebo sa doň zapíše adresa z inštrukcie.]]

Riadenie tohto procesu zabezpečuje **riadiaca jednotka**. [[verified: Riadiaca jednotka riadi tok údajov vo vnútri CPU medzi registrami, registrami a pamäťovými bunkami, registrami a ALU a riadi časovanie systému.]]

Pri vykonávaní operácií sa využívajú **registre** ako veľmi rýchla pracovná pamäť procesora a **ALU** ako jednotka pre **aritmetické a logické operácie**. [[verified: Pri vykonávaní jednotlivých operácií v ALU sa nastavujú zodpovedajúce bity príznakového registra.]]

Celý cyklus synchronizuje **hodinový signál** (clock).

#### Von Neumannova a Harvardská architektúra

Najdôležitejší rozdiel medzi Von Neumannovou a Harvardskou architektúrou je v **pamäti**. Von Neumannova architektúra ju má pre inštrukcie aj dáta **spoločnú**, zatiaľ čo Harvardská architektúra ju má **oddelenú**.

| Vlastnosť                               | Von Neumann                  | Harvard                      |
| --------------------------------------- | ---------------------------- | ---------------------------- |
| Pamäť pre kód a dáta                    | **spoločná**                 | **oddelená**                 |
| Zbernice                                | jedna spoločná               | dve samostatné               |
| Paralelný prístup k inštrukciám a dátam | nie                          | áno                          |
| Jednoduchosť návrhu                     | jednoduchšia                 | zložitejšia                  |
| Typické využitie                        | osobné počítače (x86, ARM)   | mikrokontroléry, DSP, cache  |

**Von Neumann** je historicky starší (1945) a dnes dominantný vo všeobecných počítačoch. Má **jednoduchší návrh**, ale spoločná zbernica je tzv. **Von Neumann bottleneck**.

**Harvardská** umožňuje **čítať inštrukciu a dáta súčasne**, čím dvojnásobne zvyšuje priepustnosť pamäte. Používa sa v **mikrokontroléroch** (AVR v Arduine, PIC) a v **DSP procesoroch**.

**Moderné CPU sú hybridné** – navonok Von Neumannove (jedna hlavná pamäť), ale **L1 cache je rozdelená na inštrukčnú (I-cache) a dátovú (D-cache)**, čo interne dáva Harvardské výhody.

![Von Neumannova architektúra](images/02-pocitacove-architektury/Von_Neumann_Architecture.svg)

![Harvardská architektúra](images/02-pocitacove-architektury/central_processing_unit234.webp)

#### ALU, riadiaca jednotka

Pri vykonávaní inštrukcií si CPU delí prácu medzi **výpočtovú časť** a **riadiacu časť**: **ALU vykonáva operácie nad dátami**, zatiaľ čo **riadiaca jednotka** určuje, kedy a kadiaľ sa dáta v procesore presúvajú.

##### ALU (Arithmetic Logic Unit)

ALU vykonáva **aritmetické operácie** (sčítanie, odčítanie, násobenie, delenie) a **logické operácie** (`AND`, `OR`, `XOR`, `NOT`, posuny). Nastavuje tiež **príznakové bity** vo flag registri (zero, carry, overflow, sign) podľa výsledku.

##### Riadiaca jednotka (Control Unit, CU)

Riadiaca jednotka **dekóduje inštrukcie** a generuje **riadiace signály**, ktorými určuje, čo sa v ktorom takte v procesore deje.

[[verified: Riadiaca jednotka riadi tok údajov vo vnútri CPU medzi:]]

- [[verified: Registrami]]
- [[verified: Registrami a pamäťovými bunkami]]
- [[verified: Registrami a ALU]]
- [[verified: Riadi časovanie systému]]

#### Registre x86 (všeobecné, segmentové, riadiace, špeciálne)

**Registre** sú malé, veľmi rýchle **pamäťové miesta priamo v procesore**, s ktorými pracujú inštrukcie. Pri základnom výklade x86 registrov sa často vychádza z procesora **8086**.

[[verified: Procesor 8086 obsahuje 14 programátorovi prístupných 16bitových registrov.]]

- **Všeobecné registre** – `AX`, `BX`, `CX`, `DX`. Slúžia na **aritmetiku**, **logické operácie** a **dočasné uloženie dát**.
- **Špeciálne registre** – `SP`, `BP`, `SI`, `DI`. Používajú sa pri práci so **zásobníkom** a pri **adresovaní dát v pamäti**, napríklad pri reťazcových operáciách.
- **Riadiace registre** – `IP`, `F`. `IP` (instruction pointer) ukazuje na **nasledujúcu inštrukciu** a `F` je **príznakový register** so stavovými bitmi po operáciách.
- **Segmentové registre** – `CS`, `DS`, `SS`, `ES`. Určujú **segmenty pamäte** pre kód, dáta, zásobník a extra dáta v segmentovanom pamäťovom modeli.

V novších x86 procesoroch sa tieto registre rozšírili: 16-bitové `AX` má **32-bitovú podobu** `EAX` a v x86-64 aj **64-bitovú podobu** `RAX`. Podobne `IP` prešiel na `EIP` / `RIP` a príznakový register `F` na `EFLAGS` / `RFLAGS`.

#### Prerušenia, typy prerušenia, kontrolér prerušenia

**Prerušenie** je mechanizmus, ktorý **preruší bežiaci program**, aby procesor obslúžil **dôležitejšiu udalosť**, a po obslúžení sa vráti k pôvodnému programu. Delenie podľa zdroja:

- **Hardvérové (externé)** – signalizujú ich **zariadenia**: klávesnica (stlačenie klávesu), časovač, sieťová karta (prišiel paket), dokončenie I/O operácie.
- **Softvérové** – inštrukcia `INT` alebo `SYSCALL` vyvolá prerušenie zámerne, typicky na **vstup do jadra OS** (systémové volanie).
- **Výnimky (exceptions)** – spôsobí ich samotné **vykonávanie inštrukcie**: delenie nulou, prístup na neplatnú adresu (page fault), neplatný opcode.

**Kontrolér prerušenia** je obvod medzi vstupno-výstupnými zariadeniami a procesorom. V klasických PC sa používal [[verified: programovateľný obvod **PIC (Priority Interrupt Controller)**, tzv. kontrolér prerušenia]], [[verified: obyčajne realizovaný obvodom **8259A**]].

Jeho úlohou je:

- [[verified: spracovať až 8 žiadostí IRQi o prerušenie]],
- [[verified: prideľovať a meniť im prioritu]],
- [[verified: zakazovať a povoľovať jednotlivé prerušenia]],
- poslať procesoru signál, že má obslúžiť **maskovateľné prerušenie**.

Jeden PIC vie spracovať **8 liniek** `IRQ0` až `IRQ7`, pri zapojení **master/slave** sa počet rozšíri na **16 základných IRQ liniek**. Pointa je, že **CPU nemusí riešiť všetky externé signály priamo**, ale dostane už vybranú a prioritizovanú požiadavku na obsluhu.

#### Rezidentné programy a ich úloha v systéme

**Rezidentné programy** vznikli hlavne v prostredí **MS-DOS**, kde bolo treba rozšíriť možnosti systému napríklad o **ovládače**, **pomôcky** alebo programy reagujúce na **prerušenia**.

[[verified: Po ukončení rezidentného programu a po odovzdaní riadenia operačnému systému zostane časť alebo celý takýto program v pamäti počítača.]]

Takýto program v pamäti **nebeží stále aktívne**, ale **čaká na svoju aktiváciu**, typicky cez **prerušenie** alebo vopred definovanú kombináciu klávesov.

Rezidentný program má zvyčajne dve časti:

- [[verified: **Prvá časť (tzv. rezidentná časť)** zostane v pamäti aj po ukončení programu.]] V pamäti je až do **reštartu počítača** alebo **odinštalovania z pamäte**.
- **Druhá časť** – slúži na **zavedenie rezidentnej časti** a pri ukončení programu sa z pamäte uvoľní.

Pri načítaní `.com` alebo `.exe` programu vytvorí MS-DOS aj **PSP (Program Segment Prefix)**, teda **pomocnú oblasť s údajmi o stave systému** pri zavádzaní programu.

Typické rezidentné programy:

- **[[verified: Ovládače zariadení]]** – napríklad ovládač myši, tlačiarne, disková cache alebo národný ovládač klávesnice.
- **[[verified: Pop-up programy]]** – kalkulačky, slovníky alebo zápisníky vyvolané klávesovou skratkou.
- **[[verified: Bezpečnostné systémy]]** – ochrana heslom, antivírusové štíty, ale aj vírusy.
- **[[verified: Prepínače úloh]]** – programy umožňujúce prepínať medzi úlohami uloženými v pamäti.

### 8. Inštrukcie počítača – inštrukčný súbor, formát a typy inštrukcií, adresné režimy, spracovanie inštrukcie a sedemtaktový inštrukčný cyklus, CISC, RISC, VLIW – princíp, výhody/nevýhody, meranie výkonnosti počítačov (MIPS, MOPS, FLOPS, latencia, priepustnosť), výpočet teoretického výkonu počítača.

#### Inštrukčný súbor

Inštrukčný súbor je množina strojových inštrukcií, ktoré procesor pozná a vie vykonať. Prakticky je to rozhranie medzi softvérom a hardvérom: kompilátor typicky prekladá zdrojový kód do strojového kódu pre konkrétnu architektúru inštrukčného súboru a hardvér tieto inštrukcie vykonáva.

Príklady:

- **x86 / x86-64** – Intel, AMD.
- **ARM** – mobily, Apple Silicon.
- **RISC-V** – otvorená architektúra.
- **PowerPC**.
- **MIPS**.

[[verified: Na to, aby CPU mohlo vykonávať program, musí mať registre na dočasné uchovávanie informácií, programové počítadlo, inštrukčný register, smerník zásobníka, aritmeticko-logickú jednotku, riadiacu jednotku a jednotku na zápis a čítanie informácie v pamäti a I/O priestore.]]

Tieto časti majú pri vykonávaní programu jasnú úlohu:

- **Registre** – rýchle vnútorné pamäte procesora, uchovávajú operandy, adresy a medzivýsledky. Patria sem napríklad akumulátor, registre pre všeobecné použitie a stavový register.
- **Programové počítadlo (`PC` / `IP`)** – ukazuje, ktorá inštrukcia sa má vykonať ako ďalšia.
- **Inštrukčný register (`IR`)** – drží práve načítanú inštrukciu, ktorú procesor dekóduje a vykonáva.
- **Smerník zásobníka (`SP`)** – ukazuje na vrchol zásobníka, používa sa napríklad pri volaní funkcií, návratoch a ukladaní dočasných hodnôt.
- **ALU** – vykonáva aritmetické a logické operácie.
- **Riadiaca jednotka** – riadi priebeh inštrukčného cyklu a koordinuje ostatné časti procesora.
- **Pamäťová a I/O jednotka** – zabezpečuje čítanie a zápis údajov do pamäte a vstupno-výstupného priestoru.

Okrem samotného vykonávania inštrukcií musí CPU zvládať aj riadiace situácie. [[verified: CPU by malo vedieť dostať sa do definovaného stavu reakciou na signál RESET, dostať sa do stavu HOLD, vetviť program na základe maskovateľných a nemaskovateľných prerušení, signalizovať svoj stav na zbernicu a prispôsobiť sa pomalším zariadeniam na zbernici.]]

Ústne sa to dá zhrnúť takto: inštrukčný súbor hovorí, **aké operácie CPU vie vykonať**, ale aby ich vedelo reálne vykonávať, musí mať registre, počítadlo inštrukcií, ALU, riadiacu logiku a mechanizmy na komunikáciu s pamäťou, I/O zariadeniami a zbernicou.

#### Formát a typy inštrukcií

Formát inštrukcie hovorí, z akých polí sa inštrukcia skladá a ako procesor zistí, čo má vykonať a s akými operandmi má pracovať.

[[verified: Vo všeobecnosti sa inštrukcia skladá z viacerých polí.]]

- [[verified: **OC** – operačný kód; špecifikuje operáciu, ktorá sa má vykonať.]]
- [[verified: **ADDR** – obsahuje adresu operandu alebo operandov pre príslušnú operáciu.]]

Nie každá inštrukcia má všetky polia. [[verified: Nie všetky inštrukcie potrebujú pole `ADDR`, napríklad inštrukcia pre povolenie prerušenia.]]

Podľa počtu operandov sa používajú **jedno-, dvoj- a trojoperandové inštrukcie**. [[verified: Vo všeobecnosti sa používajú jedno-, dvoj-, trojoperandové inštrukcie.]] Pri dvojoperandovej inštrukcii býva jeden operand zároveň cieľom výsledku, napríklad `ADD AX, CX` znamená `AX = AX + CX`. Pri trojoperandovom zápise môže byť cieľ oddelený od zdrojov, napríklad `ADD R1, R2, R3` znamená `R1 = R2 + R3`.

Podľa účelu sa inštrukcie dajú chápať ako niekoľko hlavných skupín:

**Operácie na presun údajov**  
[[verified: Kopírujú obsah pamäťových miest, registrov, pamäťových buniek a registrov I/O zariadení.]] Dôležité je, že tieto inštrukcie nemenia význam dát, iba ich presúvajú, rozširujú alebo vymieňajú.

- `LOAD` – z pamäte do procesora.
- `STORE` – z procesora do pamäte.
- `MOV` – presun zdroja do cieľa.
- `LEA` – načítanie efektívnej adresy.
- `MOVZX` / `MOVSX` – presun s nulovým alebo znamienkovým rozšírením.
- `XCHG` – výmena operandov.

**Aritmeticko-logické operácie**  
[[verified: Menia obsah operandu alebo pamäťovej bunky.]] Aritmetické inštrukcie vykonávajú výpočty a výsledok typicky ukladajú do ľavého operandu.

- `ADD` – sčítanie operandov.
- `SUB` – odčítanie pravého operandu od ľavého.
- `INC` / `DEC` – zvýšenie alebo zníženie hodnoty operandu o 1.
- `NEG` – zmena znamienka operandu pomocou dvojkového doplnku.
- `CMP` – [[verified: pravý operand odčíta od ľavého, nastaví príznakové bity podľa výsledku, ale samotný výsledok nikam neuloží.]]

**Logické inštrukcie**  
Logické inštrukcie pracujú po bitoch. [[verified: Vykonávajú logické operácie nad zodpovedajúcimi bitmi operandov a výsledok uložia do ľavého operandu.]]

- `AND` – logický súčin, používa sa napríklad na vynulovanie vybraných bitov pomocou masky.
- `OR` – logický súčet, používa sa napríklad na nastavenie vybraných bitov na 1.
- `XOR` / `NOT` – ďalšie základné bitové operácie.

**Inštrukcie pre posuv a rotáciu**  
Tieto inštrukcie posúvajú alebo rotujú bity operandu. [[verified: Ľavým operandom je register alebo pamäťové miesto a pravý operand určuje, o koľko miest sa bity posunú.]]

- `SHL` / `SAL` – posun bitov doľava, do najnižšieho bitu sa dopĺňa 0 a najvyšší bit sa posúva do príznaku `CF`.
- Prakticky sa dajú použiť na rýchle násobenie mocninami dvojky.

**Operácie riadenia toku programu**  
[[verified: Zahŕňajú skokové inštrukcie, vetvenie programu, volanie a návrat z podprogramu; menia obsah programového počítadla.]] Slúžia na to, aby program nepokračoval iba lineárne ďalšou inštrukciou.

- `JMP` – nepodmienený skok, do `IP` sa nastaví nová adresa.
- Podmienené skoky – vykonajú sa iba vtedy, keď je splnená podmienka, napríklad výsledok porovnania alebo nastavenie príznakového bitu.
- [[verified: Skokové inštrukcie nemenia príznaky.]]

**Riadiace a systémové inštrukcie**  
Slúžia na špeciálne operácie procesora. [[verified: Sú to napríklad inštrukcie na nastavenie alebo vynulovanie príznakov, povolenie alebo zakázanie externého prerušenia, softvérové prerušenie a podobne.]]

- `HLT` – zastavenie činnosti procesora.
- `WAIT` – procesor nevykonáva program, ale čaká na stav vstupu.
- `LOCK` – rezervácia systémovej zbernice pri viacprocesorových systémoch.

[[verified: Výrobcovia procesorov dopĺňajú inštrukčnú sadu aj o špecializované inštrukcie pre prehrávanie videa, zvuku a grafiky.]] V moderných procesoroch sem patria napríklad SIMD rozšírenia, kde jedna inštrukcia spracuje viac dát naraz.

Na štátnici netreba vymenovať každú konkrétnu inštrukciu. Podstatné je vedieť, že inštrukcie buď **presúvajú dáta**, **počítajú**, **pracujú s bitmi**, **menia tok programu**, alebo **riadia stav procesora**.

#### Adresné režimy

Adresný režim určuje, **ako inštrukcia nájde svoj operand** – či je operand priamo v inštrukcii, v registri, v pamäti, alebo sa jeho adresa musí najprv vypočítať.

[[verified: Operandy môžu byť rôzneho druhu podľa typu procesora a adresovacieho režimu; podľa toho, odkiaľ sa operandy vyberajú, napríklad register alebo pamäť.]]

Pri architektúre 8086 je dôležitý model **segment:offset**. [[verified: Procesor 8086 vytvára 20-bitovú adresu pre adresovanie 1 MB fyzickej pamäte; táto adresa je tvorená z dvoch 16-bitových zložiek označovaných segment a offset.]] Offsetová časť adresy sa v prednáške spomína najmä pri registroch `SP`, `BP`, `SI`, `DI` a pri inštrukcii `LEA`.

Z praktického hľadiska stačí rozumieť týmto režimom:

- **Immediate / konštantný operand** – hodnota je priamo v inštrukcii, napr. `MOV AX, 5`.
- **Registrový operand** – operand je v registri, napr. `MOV AX, BX`.
- **Priamy pamäťový operand** – inštrukcia priamo odkazuje na pamäťové miesto alebo jeho offset, napr. `MOV AX, [1000]` alebo `MOV AX, offset Pocet`.
- **Nepriamy pamäťový operand** – adresa operandu je uložená v registri, napr. `MOV AX, [BX]`. [[verified: Register `BX` sa používa ako ukazovateľ prístupu k rôznym blokom údajov a tabuľkám v pamäti.]]
- **Indexové a bázové adresovanie** – adresa sa tvorí pomocou registrov ako `BP`, `SI`, `DI`. [[verified: `SI` a `DI` sú indexové registre a slúžia ako všeobecný prostriedok na nepriame adresovanie dát.]]
- **Efektívna adresa (`LEA`)** – `LEA` nečíta hodnotu z pamäte, ale vypočíta adresu pamäťového operandu a uloží ju do registra. [[verified: Inštrukcia `LEA` uloží offset pamäťového operandu do univerzálneho registra; na rozdiel od `MOV` sa dá použiť aj v prípade, keď je pamäťový operand adresovaný nepriamo.]]
- **Adresovanie pri skokoch** – skok môže byť priamy alebo nepriamy. [[verified: Ak je operandom inštrukcie skoku návestie, hovoríme o priamom skoku; ak je operandom premenná alebo register, ktorý obsahuje adresu novej inštrukcie, hovoríme o nepriamom skoku.]]

Zmysel adresných režimov je v tom, že procesor nemusí pracovať iba s pevnou adresou v inštrukcii. Vie pracovať aj s registrami, ukazovateľmi, offsetmi a vypočítanými adresami, čo umožňuje napríklad prácu s poľami, zásobníkom, tabuľkami a vetvením programu.

#### Spracovanie inštrukcie a sedemtaktový inštrukčný cyklus

Pri vykonávaní programu procesor stále opakuje **inštrukčný cyklus**. Zjednodušene: najprv zistí, **ktorú inštrukciu má vykonať**, potom ju dekóduje, pripraví jej operandy, vykoná operáciu a uloží výsledok.

`PC` (*Program Counter*, programové počítadlo) alebo `IP` (*Instruction Pointer*, ukazovateľ na inštrukciu) je register, ktorý obsahuje adresu ďalšej inštrukcie, ktorú má procesor vykonať.

Sedemtaktový inštrukčný cyklus:

1. [[verified: **FI – Fetch Instruction (výber inštrukcie)** z operačnej pamäte alebo z virtuálnej pamäte.]]
2. [[verified: **DI – Decode Instruction (dekódovanie inštrukcie)** pomocou logických obvodov.]]
3. [[verified: **FD – Fetch Data (generovanie adresy)** operandu inštrukcie.]]
4. [[verified: **FD – Fetch Data (výber operandu)** inštrukcie z operačnej pamäte alebo z virtuálnej pamäte.]]
5. [[verified: **EI – Execution Instruction (vykonanie inštrukcie)** operačnou jednotkou procesora.]]
6. [[verified: **WD – Write Data (zápis výsledku)** inštrukcie do registra, operačnej pamäte alebo virtuálnej pamäte.]]
7. [[verified: **Inkrementácia IP** – zvýšenie hodnoty `IP` o správny počet bajtov.]]

Ústne sa to dá povedať takto: procesor si najprv **vyberie inštrukciu**, **dekóduje ju**, zistí alebo vypočíta **adresu operandu**, operand **načíta**, operáciu **vykoná**, výsledok **zapíše** a nakoniec posunie `IP` na ďalšiu inštrukciu. Pri skokoch sa `IP` neinkrementuje obyčajne, ale nastaví sa podľa cieľovej adresy skoku.

V moderných procesoroch sa týchto sedem taktov prekrýva cez **pipelining** – každá inštrukcia je v inom takte v inej etape, takže za ideálnych podmienok **dokončíme jednu inštrukciu za takt** (CPI ≈ 1). Pipeline hazardy (dátové, štrukturálne, riadiace) sa riešia technikami forwarding, stall a branch prediction.

#### CISC, RISC, VLIW – princíp, výhody/nevýhody

**CISC (Complex Instruction Set Computer)**

- **Princíp** – veľký inštrukčný súbor, komplexné inštrukcie s rôznou dĺžkou a viacerými adresnými režimami. Jedna inštrukcia môže vykonať zložitú operáciu, napríklad kopírovanie bloku pamäte alebo reťazcové operácie.
- **Výhoda** – kratší kód, jednoduchší kompilátor.
- **Nevýhoda** – zložitejší dekóder, ťažšie sa optimalizuje pipeline.
- **Príklad** – **x86 / x86-64**, teda klasické Intel a AMD procesory v bežných Windows počítačoch a notebookoch. Navonok ide o CISC architektúru, hoci moderné procesory si inštrukcie interne prekladajú na jednoduchšie mikrooperácie.

**RISC (Reduced Instruction Set Computer)**

- **Princíp** – malý inštrukčný súbor, všetky inštrukcie rovnako dlhé a vykonávajú sa za jeden takt. Architektúra **load/store** – s pamäťou sa pracuje len cez `LOAD` a `STORE`, aritmetika nad registrami.
- **Výhoda** – jednoduchší pipelining, nižšie CPI, menšia spotreba.
- **Nevýhoda** – program je dlhší, teda potrebuje viac inštrukcií.
- **Príklady** – **ARM** (Apple Silicon v MacBookoch, čipy Apple A-series v iPhonoch, veľa mobilných zariadení), **RISC-V**, PowerPC, MIPS.

**VLIW (Very Long Instruction Word)**

- **Princíp** – jedna „veľmi dlhá“ inštrukcia obsahuje niekoľko operácií, ktoré sa vykonajú paralelne. Plánovanie robí **kompilátor** (statický rozvrh), nie procesor.
- **Výhoda** – jednoduchší hardvér, explicitný paralelizmus.
- **Nevýhoda** – závislosť od kvality kompilátora, slabá prenositeľnosť medzi generáciami.
- **Príklady** – Intel Itanium, niektoré DSP a AI akcelerátory.

**V praxi sa línia stiera** – moderný x86 procesor má CISC ISA navonok, ale interne si zložité inštrukcie rozkladá na jednoduchšie kroky.

#### Meranie výkonnosti počítačov (MIPS, MOPS, FLOPS, latencia, priepustnosť)

[[verified: Strojový cyklus je postupnosť niekoľkých taktov.]]

[[verified: Doba cyklu je čas, ktorý procesor potrebuje na jeden prechod inštrukčným cyklom, a je jedným z kritérií pri hodnotení pracovnej rýchlosti procesora.]]

[[verified: Množstvo týchto cyklov za jednu sekundu sa nazýva frekvencia procesora. Jednotkou je Hertz (Hz).]]

Výkon počítača sa dá merať viacerými spôsobmi podľa toho, čo presne sledujeme. Pri procesore nás môže zaujímať počet vykonaných inštrukcií, počet operácií, výkon pri výpočtoch s reálnymi číslami, ale aj to, ako dlho trvá jedna úloha alebo koľko práce systém zvládne za čas.

**MIPS (Million Instructions Per Second)**  
Koľko miliónov inštrukcií procesor vykoná za sekundu. Jednoduchá, ale **zavádzajúca** metrika pri porovnávaní rôznych ISA, lebo CISC a RISC nemožno porovnať 1:1 – jedna CISC inštrukcia môže robiť viac práce než jedna RISC inštrukcia.

**MOPS (Million Operations Per Second)**  
Počíta operácie, nie inštrukcie. Je neutrálnejšia pri rôznych ISA, ale stále závisí od toho, čo presne považujeme za jednu operáciu.

**FLOPS (Floating-point Operations Per Second)**  

Počet operácií s reálnymi číslami za sekundu. Presnejšie ide o čísla reprezentované približne vo formáte *floating point*. Táto metrika sa používa najmä pri vedeckých výpočtoch, grafike, HPC a AI.

Bežné násobky:

- **GFLOPS** – gigaFLOPS.
- **TFLOPS** – teraFLOPS.
- **PFLOPS** – petaFLOPS.
- **EFLOPS** – exaFLOPS, pri najvýkonnejších systémoch.

**Latencia**  
Čas od zadania úlohy po jej dokončenie. Pri počítačoch sa tým myslí napríklad, ako dlho trvá prístup do pamäte, obsluha I/O požiadavky alebo získanie výsledku operácie v procesore. Meria sa v časových jednotkách, typicky v milisekundách, pri rýchlejších častiach systému aj v mikrosekundách alebo nanosekundách.

**Priepustnosť (throughput)**  
Množstvo práce, dát alebo operácií, ktoré systém spracuje za jednotku času. Pri procesore môže ísť o počet dokončených inštrukcií za sekundu, pri pamäti alebo zbernici o množstvo prenesených dát za sekundu. Vyššia priepustnosť znamená, že systém zvládne väčší objem práce, aj keď jednotlivá úloha nemusí mať automaticky nižšiu latenciu.

#### Výpočet teoretického výkonu počítača

Teoretický výkon je maximálny výkon, ktorý by počítač alebo procesor dosiahol za ideálnych podmienok. Počíta sa z frekvencie, počtu jadier a počtu operácií, ktoré vie každé jadro vykonať za jeden takt.

`Výkon = počet jadier × operácie za takt × frekvencia`

Ak meriame výkon pri výpočtoch s reálnymi číslami, používame jednotku **FLOPS**:

`FLOPS = počet jadier × FLOP za takt × frekvencia [Hz]`

Príklad: procesor má **8 jadier**, každé jadro vie vykonať **4 FLOP za takt** a beží na frekvencii **3 GHz**.

`8 × 4 × 3 × 10⁹ = 96 × 10⁹ FLOP/s = 96 GFLOPS`

---
