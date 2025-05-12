// Súbor: questions.js
// Tento súbor obsahuje pole s otázkami pre kvíz z predmetu Počítačové siete 2.
// Každá otázka má 'type': 'multiple-choice'.
// 'multiple-choice' používa pole 'answers'.

const questions = [
    {
        type: 'multiple-choice',
        question: "Internet je postavený na protokoloch:",
        answers: [
            { text: "IPX/SPX", correct: false },
            { text: "TCP/IP", correct: true },
            { text: "WWW a HTTP", correct: false },
            { text: "HTTP A FTP", correct: false }
        ]
    },
    {
        type: 'multiple-choice',
        question: "Akého typu je sieť s maskou 255.0.0.0",
        answers: [
            { text: "A", correct: true },
            { text: "C", correct: false }
        ]
    },
    {
        type: 'multiple-choice',
        question: "Protokol POP sa nachádza v modeli TCP/IP na vrstve:",
        answers: [
            { text: "Internetovej", correct: false },
            { text: "Transportnej", correct: false },
            { text: "Aplikačnej", correct: true },
            { text: "Prezentačnej", correct: false }
        ]
    },
    {
        type: 'multiple-choice',
        question: "Čo znamená zápis 193.87.59.10/24",
        answers: [
            { text: "Uzol s adresou 193.87.59.10 na sieti 193.87.59.0", correct: true },
            { text: "Uzol s adresou 193.87.59.24 na sieti 193.87.59.0", correct: false },
            { text: "Broadcast", correct: false },
            { text: "Multicast", correct: false }
        ]
    },
    {
        type: 'multiple-choice',
        question: "RFC dokumenty popisujú štandardy protokolov TCP/IP",
        answers: [
            { text: "Je to pravda", correct: true },
            { text: "Nie je to pravda", correct: false }
        ]
    },
    {
        type: 'multiple-choice',
        question: "192.168.1.0/26 je subnetom siete 192.168.54.0/24",
        answers: [
            { text: "Je to pravda", correct: false },
            { text: "Nie je to pravda", correct: true }
        ]
    },
    {
        type: 'multiple-choice',
        question: "Koreňovým DNS serverom sa zvykne hovoriť aj TLD (Top Level Domain)",
        answers: [
            { text: "Je to pravda", correct: false },
            { text: "Nie je to pravda", correct: true }
        ],
        // ---> NOVÉ POLE PRE VYSVETLENIE <---
        explanation: "Koreňové DNS servery ('root servers') sú na najvyššej úrovni hierarchie DNS (symbol '.'). TLD (Top-Level Domain) servery spravujú domény ako .com, .org, .sk a sú o úroveň nižšie pod koreňovými servermi."
    },
    {
        type: 'multiple-choice',
        question: "TXT záznam pre doménu aaa.sk ukazuje na adresu SMTP servera prijímajúceho poštu pre doménu aaa.sk",
        answers: [
            { text: "Je to pravda", correct: false },
            { text: "Nie je to pravda", correct: true }
        ],
        explanation: "Na určenie serverov prijímajúcich poštu pre doménu sa používa DNS záznam typu MX (Mail Exchanger). TXT záznamy slúžia na iné účely (napr. SPF, DKIM)."
    },
    {
        type: 'multiple-choice',
        question: "Pomocou digitálnych otlačkov všetkých binárnych súborov v systéme môžem určiť či ich úspešný útočník nemodifikoval.",
        answers: [
            { text: "Je to pravda", correct: true },
            { text: "Nie je to pravda", correct: false }
        ]
    },
    {
        type: 'multiple-choice',
        question: "1Aké IP adresy je vhodné používať v lokálnych sieťach, ktoré nie sú priamo pripojené do Internetu?",
        answers: [
            { text: "Súkromné (privátne)", correct: true },
            { text: "Verejné", correct: false },
            { text: "Nezáleží na tom", correct: false },
            { text: "Tie, ktoré dostaneme od providera", correct: false }
        ]
    },
    {
        type: 'multiple-choice',
        question: "147.175.130.12 je verejná IP adresa",
        answers: [
            { text: "Je to pravda", correct: true }, // Nepatrí do privátnych rozsahov RFC 1918
            { text: "Nie je to pravda", correct: false }
        ]
    },
    {
        type: 'multiple-choice',
        question: "Domény .sk, .com a podobne:",
        answers: [
            { text: "Označujeme ako TLD", correct: true },
            { text: "Označujeme ako koreňové", correct: false }
        ]
    },
    {
        type: 'multiple-choice',
        question: "Zaoberá sa kryptografia analýzou šifrovaných správ?",
        answers: [
            { text: "Áno", correct: false },
            { text: "Nie", correct: true }
        ],
        explanation: "Kryptografia sa primárne zaoberá vytváraním šifier a bezpečných systémov. Analýzou šifrovaných správ s cieľom ich dešifrovania alebo pochopenia sa zaoberá odbor kryptanalýza."
    },
    {
        type: 'multiple-choice',
        question: "Základom elektronického podpisu sú hashovacie funkcie",
        answers: [
            { text: "Je to pravda", correct: true }, // Hashovanie je kľúčové pre integritu a podpis
            { text: "Nie je to pravda", correct: false }
        ]
    },
    {
        type: 'multiple-choice',
        question: "Pomocou sieťového systému na detekciu prieniku (NIDS) chránim LAN pred útokmi:",
        answers: [
            { text: "Je to pravda", correct: false },
            { text: "Nie je to pravda", correct: true }
        ],
        explanation: "NIDS (Network Intrusion Detection System) primárne monitoruje sieť a *deteguje* podozrivé aktivity alebo útoky, na ktoré upozorní (alert). Samotný NIDS útoky *neblokuje*. Aktívnu ochranu (blokovanie útokov) poskytujú systémy ako NIPS (Prevention) alebo firewall."
    },
    {
        type: 'show-answer',
        question: "Vysvetlite princíp práce IDS s detekciou nesprávneho použitia.",
        answerText: "• IDS s detekciou nesprávneho použitia (Misuse Detection) funguje na princípe monitorovania a analyzovania sieťovej prevádzky s cieľom identifikovať podozrivú aktivitu \n• používa databázu známych vzorcov nesprávneho použitia (napríklad signatúry útokov) a porovnáva aktuálnu aktivitu siete s týmito vzorcami \n• ak sa zistí zhoda, systém vydá varovanie, že došlo k možnému narušeniu bezpečnosti \n• účinné pre detekciu známych útokov, ale môže mať problémy s identifikáciou nových alebo neznámych hrozieb"
    },
    {
        type: 'show-answer',
        question: "Vysvetlite pojem broadcast v TCP/IP sieťach, smerovateľný, nesmerovateľný.",
        answerText: '• V TCP/IP sieťach je broadcast typ komunikácie, ktorý umožňuje odoslanie správy všetkým zariadeniam v rámci danej siete.\n' +
                    '• Pojmy smerovateľný a nesmerovateľný sa týkajú schopnosti paketov prechádzať cez rôzne siete.\n\n' +
                    '• Smerovateľný broadcast môže prechádzať cez routre a zasielať správy všetkým zariadeniam v cieľovej sieti, ktorá môže byť odosielaná do iných podsietí.\n' +
                    '• Adresa smerovateľného broadcastu je posledná adresa v rozsahu danej podsiete. Napríklad, ak máme 192.168.1.0/24, smerovateľná broadcast adresa je 192.168.1.255. Ak máme 10.0.0.0/8, smerovateľná broadcast adresa je 10.255.255.255. Adresa sa vždy určí podľa masky podsiete.\n\n' +
                    '• Nesmerovateľný broadcast zostáva v lokálnej sieti a nedokáže prechádzať cez routre do iných podsietí. Je obmedzený na lokálnu sieť.\n' +
                    '• má vždy adresu 255.255.255.255'
    },
    {
        type: 'show-answer',
        question: "Protokoly elektronickej pošty. Vysvetlite princíp práce.",
        answerText: '• SMTP je zodpovedný za odosielanie e-mailov z klienta na server a medzi servermi\n' +
                    '• používa port 25 a SMTPS používa 587 (šifrované spojenie TLS/SSL)\n\n' +
                    '  1. Klient odošle e-mail (cez klientsky program ako Outlook) cez SMTP server.\n' +
                    '  2. SMTP server overí odosielateľa.\n' +
                    '  3. Správa sa posiela medzi servermi až k serveru príjemcu.\n' +
                    '  4. E-mail sa uloží na serveri príjemcu.\n\n' +
                    '• POP3 slúži na stiahnutie e-mailov zo servera na klienta\n' +
                    '• používa port 110 a POP3S používa 995 (šifrované spojenie cez TLS/SSL)\n\n' +
                    '  1. Klient sa pripojí k POP3 serveru a autentifikuje sa.\n' +
                    '  2. Stiahne nové e-maily do lokálneho úložiska.\n' +
                    '  3. Správy sa zvyčajne zmažú zo servera po stiahnutí.\n\n' +
                    '• IMAP umožňuje prístup k e-mailom priamo na serveri bez ich stiahnutia\n' +
                    '• používa port 143 a IMAPS používa 993 (šifrované spojenie TLS/SSL)\n\n' +
                    '  1. Klient sa pripojí k IMAP serveru pomocou autentifikačných údajov.\n' +
                    '  2. Synchronizuje e-maily medzi serverom a lokálnym zariadením.\n' +
                    '  3. Správy sa spravujú na serveri, zmeny sú viditeľné na všetkých zariadeniach.'
    },
    {
        type: 'show-answer',
        question: "SYN TCP segment prichádza na zavretý port, vysvetlite odpoveď.",
        answerText: '• Keď SYN (Synchronize) TCP segment prichádza na zavretý port, cieľový server odpovie resetom spojenia (TCP RST).\n\n' +
                    '  1. Klient odošle TCP SYN segment, aby inicioval spojenie na konkrétny port.\n' +
                    '  2. Ak je port zavretý (nie je tam žiadna služba), server to zistí.\n' +
                    '  3. Server odpovie TCP segmentom s RST (reset) príznakom.\n\n' +
                    '• Bezpečnosť: Rýchle odmietnutie spojenia chráni pred útokmi ako napr. skenovanie portov alebo pokusy o vyčerpanie zdrojov servera.\n' +
                    '• Efektivita: Šetrí sieťové zdroje tým, že okamžite ukončí nepovolené pokusy o pripojenie.\n' +
                    '• Informácia pre klienta: Klient vie, že port je nedostupný a môže skúsiť iný port.'
    },
    {
        type: 'show-answer',
        question: "SPOOFING, čo to je, možnosti ochrany.",
        answerText: '· Spoofing je útok, pri ktorom útočník predstiera, že je dôveryhodné zariadenie alebo osoba, aby získal neoprávnený prístup.\n\n' +
                    '· IP spoofing – manipulácia s IP adresou, aby sa paket zdal byť z dôveryhodného zdroja, používa sa na uskutočnenie DDoS útokov\n' +
                    '· Ochrana – konfigurácia routerov a brán firewallu na detekciu a blokovanie\n\n' +
                    '· E-mail spoofing: Útočník falšuje e-mailovú adresu odosielateľa, aby sa zdalo, že e-mail pochádza z dôveryhodného zdroja. Cieľom môže byť napr. phishing či šírenie malvéru.\n' +
                    '· Ochrana – SPF – určenie oprávnených serverov na odosielanie e-mailov z domény\n' +
                    '· Ochrana – DKIM – pridanie digitálnych podpisov do e-mailov\n' +
                    '· Ochrana – DMARC – kombinácia SPF a DKIM na spracovanie neoverených e-mailov\n\n' +
                    '· DNS spoofing („webová adresa spoofing v Šimonovej prezentácií“): Modifikácia DNS záznamov na presmerovanie užívateľov na falošné webové stránky – to môže viesť k phishingovým útokom, kde sú užívatelia podvedení a zadajú svoje citlivé údaje na falošných stránkach\n' +
                    '· Ochrana – DNSSEC – pridáva digitálne podpisy k DNS záznamom, čím zabezpečuje ich autentickosť\n' +
                    '· Overovanie DNS záznamov: Použitie techník na úrovni DNS resolverov na overenie integrity DNS záznamov'
    },
    // 3 random otázky čo som mal sám zapísané
    {
        type: 'multiple-choice',
        question: "PPTP poskytuje väčšiu bezpečnosť ako IPsec. Je to pravda?",
        answers: [
            { text: "Je to pravda", correct: false },
            { text: "Nie je to pravda", correct: true }
        ],
        explanation: "IPsec (Internet Protocol Security) je považovaný za výrazne bezpečnejší štandard ako starší PPTP (Point-to-Point Tunneling Protocol). PPTP má známe bezpečnostné slabiny, zatiaľ čo IPsec ponúka silnejšie šifrovanie a robustnejšie mechanizmy autentifikácie."
    },
    {
        type: 'multiple-choice',
        question: "Blokové symetrické šifrovanie je využívané najmä pre zabezpečenie siete. Je to pravda?",
        answers: [
            { text: "Je to pravda", correct: false },
            { text: "Nie je to pravda", correct: true }
        ],
        explanation: "Blokové šifry spracúvajú dáta v pevných blokoch a často sa používajú na šifrovanie uložených dát (napr. súbory, disky). Pre sieťovú komunikáciu, kde dáta prúdia kontinuálne, sú často vhodnejšie prúdové šifry alebo blokové šifry v špecifických módoch (napr. CTR, GCM), ktoré sa správajú podobne ako prúdové."
    },
    {
        type: 'multiple-choice',
        question: "Pri nadviazanom TCP spojení má každý paket aký príznak?",
        answers: [
            { text: "PSH", correct: false },
            { text: "ACK", correct: true }
        ]
    },
    // random otázky z transkriptu
    {
        type: 'multiple-choice',
        question: "Adresácia komunikujúceho procesu pomocou čísla portu je definovaná na transportnej vrstve.",
        answers: [
            { text: "Je to pravda", correct: true },
            { text: "Nie je to pravda", correct: false }
        ]
    },
    {
        type: 'multiple-choice',
        question: "Protokol FTP (File Transfer Protocol) operuje na akej vrstve?",
        answers: [
            { text: "Transportná vrstva", correct: false },
            { text: "Aplikačná vrstva", correct: true },
            { text: "Sieťová vrstva", correct: false }
        ]
    },
    {
        type: 'multiple-choice',
        question: "Inicializačný segment pri nadväzovaní TCP spojenia má nastavený aký príznak?",
        answers: [
            { text: "SYN", correct: true },
            { text: "ACK", correct: false },
            { text: "FIN", correct: false }
        ]
    },
    {
        type: 'multiple-choice',
        question: "Blokové symetrické šifrovanie sa používa hlavne pri komunikácií?",
        answers: [
            { text: "Nie je to pravda", correct: true },
            { text: "Je to pravda", correct: false }
        ],
        explanation: "Blokové šifry spracúvajú dáta v pevných blokoch a často sa používajú na šifrovanie uložených dát (napr. súbory, disky). Pre sieťovú komunikáciu, kde dáta prúdia kontinuálne, sú často vhodnejšie prúdové šifry alebo blokové šifry v špecifických módoch (napr. CTR, GCM), ktoré sa správajú podobne ako prúdové."
    },
    {
        type: 'multiple-choice',
        question: "Blokové symetrické šifrovanie sa používa hlavne pri šifrovaní dát ktoré stoja?",
        answers: [
            { text: "Nie je to pravda", correct: false },
            { text: "Je to pravda", correct: true }
        ]
    },
    {
        type: 'multiple-choice',
        question: "Prúdové šifrovanie sa používa hlavne pri komunikácií?",
        answers: [
            { text: "Je to pravda", correct: true },
            { text: "Nie je to pravda", correct: false }
        ]
    },
    {
        type: 'multiple-choice',
        question: "HTTP komunikáciu, keď zabezpečím SSL alebo TLS, aký port používa?",
        answers: [
            { text: "443", correct: true },
            { text: "80", correct: false },
            { text: "8080", correct: false }
        ]
    },
    {
        type: 'multiple-choice',
        question: "Pomocou masky siete sa v IP adrese rozlišuje adresa siete od adresy konkrétneho hostiteľa (uzla) v danej sieti.",
        answers: [
            { text: "Je to pravda", correct: true },
            { text: "Nie je to pravda", correct: false }
        ]
    },
    {
        type: 'multiple-choice',
        question: "Aplikačná brána (Application Gateway) pracuje na akej vrstve?",
        answers: [
            { text: "Aplikačná vrstva", correct: true },
            { text: "Linková", correct: false },
            { text: "Transportná vrstva", correct: false }
        ]
    },
    {
        type: 'multiple-choice',
        question: "Môže mať chybovosť vplyv na metriku?",
        answers: [
            { text: "Je to pravda", correct: true },
            { text: "Nie je to pravda", correct: false }
        ]
    },
    {
        type: 'multiple-choice',
        question: "Hlavička UDP datagramu obsahuje položku IP adresy.",
        answers: [
            { text: "Je to pravda", correct: false },
            { text: "Nie je to pravda", correct: true }
        ],
        explanation: "Hlavička UDP obsahuje iba polia pre zdrojový port, cieľový port, dĺžku a kontrolný súčet. Zdrojová a cieľová IP adresa sú súčasťou hlavičky IP paketu na sieťovej vrstve, ktorá zapuzdruje UDP datagram."
    },
    {
        type: 'multiple-choice',
        question: "Transportná vrstva zabezpečuje smerovanie. Je to pravda?",
        answers: [
            { text: "Je to pravda", correct: false },
            { text: "Nie je to pravda", correct: true }
        ],
        explanation: "Úlohou transportnej vrstvy (TCP/UDP) je segmentácia dát, adresácia procesov pomocou portov a zabezpečenie spoľahlivosti (TCP). Smerovanie paketov cez sieť na základe IP adries je zodpovednosťou sieťovej vrstvy (IP)."
    },
    {
        type: 'multiple-choice',
        question: "Stav TCP spojenia \"CLOSED\" indikuje, že spojenie bolo úspešne nadviazané a prebieha aktívna komunikácia.",
        answers: [
            { text: "Je to pravda", correct: false },
            { text: "Nie je to pravda", correct: true }
        ],
        explanation: "Stav \"CLOSED\" znamená, že spojenie buď neexistuje (je to počiatočný stav pred pokusom o nadviazanie) alebo bolo riadne ukončené. Stav, kedy prebieha aktívna komunikácia po úspešnom nadviazaní, sa nazýva \"ESTABLISHED\"."
    },
    {
        type: 'multiple-choice',
        question: "IP adresu na doménové meno prekladá:",
        answers: [
            { text: "DNS server", correct: true },
            { text: "DHCP server", correct: false },
            { text: "Gateway (Brána)", correct: false }
        ]
    },
    {
        type: 'multiple-choice',
        question: "Kešovací DNS server spravuje verejné domény.",
        answers: [
            { text: "Je to pravda.", correct: false },
            { text: "Nie je to pravda.", correct: true }
        ],
        explanation: "Kešovací DNS server (resolver) si dočasne ukladá (kešuje) odpovede získané od iných DNS serverov, aby urýchlil budúce požiadavky. Samotnú správu záznamov pre verejné domény vykonávajú autoritatívne DNS servery (napr. primárny server domény)."
    },
    {
        type: 'multiple-choice',
        question: "Odpoveď získaná od kešovacieho DNS servera sa považuje za autoritatívnu.",
        answers: [
            { text: "Je to pravda", correct: false },
            { text: "Nie je to pravda", correct: true }
        ],
        explanation: "Odpovede z kešovacích serverov sú neautoritatívne, lebo pochádzajú z dočasnej pamäte (cache). Autoritatívnu (záväznú) odpoveď poskytuje len DNS server, ktorý priamo spravuje záznamy pre danú doménu (tzv. autoritatívny server)."
    },
    {
        type: 'multiple-choice',
        question: "Autoritatívnu DNS odpoveď poskytuje primárny alebo sekundárny DNS server zodpovedný za danú doménu.",
        answers: [
            { text: "Je to pravda", correct: true },
            { text: "Nie je to pravda", correct: false }
        ]
    },
    {
        type: 'multiple-choice',
        question: "Sekundárny server si celú zónu sťahuje od primárneho.",
        answers: [
            { text: "Je to pravda", correct: true },
            { text: "Nie je to pravda", correct: false }
        ]
    },
    //otázky z prednášky sietí zo 7. marca 2024
    {
        type: 'multiple-choice',
        question: "Transportná vrstva TCP/IP zabezpečuje smerovanie.",
        answers: [
            { text: "Je to pravda", correct: false },
            { text: "Nie je to pravda", correct: true }
        ],
        explanation: "Úlohou transportnej vrstvy (TCP/UDP) je segmentácia dát, adresácia procesov pomocou portov a zabezpečenie spoľahlivosti (TCP). Smerovanie paketov cez sieť na základe IP adries je zodpovednosťou sieťovej vrstvy (IP)."
    },
    {
        type: 'multiple-choice',
        question: "Hlavička TCP segmentu obsahuje číslo portu.",
        answers: [
            { text: "Je to pravda", correct: true },
            { text: "Nie je to pravda", correct: false }
        ]
    },
    {
        type: 'multiple-choice',
        question: "Paket ukončujúci spojenie v TCP spojení má v hlavičke TCP segmentu príznak STOP.",
        answers: [
            { text: "Je to pravda", correct: false },
            { text: "Nie je to pravda", correct: true }
        ],
        explanation: "TCP používa na signalizáciu žiadosti o ukončenie spojenia príznak FIN (Finish), nie STOP. Proces ukončenia spojenia zvyčajne zahŕňa výmenu segmentov s nastavenými príznakmi FIN a ACK."
    },
    {
        type: 'multiple-choice',
        question: "Uzol, ktorý z nejakého dôvodu zahodí paket o tomto informuje odosielateľa pomocou UDP.",
        answers: [
            { text: "Je to pravda", correct: false },
            { text: "Nie je to pravda", correct: true }
        ],
        explanation: "Na signalizáciu chýb pri doručovaní IP paketov (napr. cieľ nedostupný, čas vypršal) sa používa protokol ICMP (Internet Control Message Protocol), nie UDP. ICMP správy informujú odosielateľa o probléme."
    },
    {
        type: 'multiple-choice',
        question: "Internet protokol (IP) poskytuje nespojovanú datagramovú službu.",
        answers: [
            { text: "Je to pravda", correct: true },
            { text: "Nie je to pravda", correct: false }
        ]
    },
    {
        type: 'multiple-choice',
        question: "Autonómny systém je systém pod správou jednej organizácie.",
        answers: [
            { text: "Je to pravda", correct: true },
            { text: "Nie je to pravda", correct: false }
        ]
    },
    {
        type: 'multiple-choice',
        question: "Hlavička UDP datagramu obsahuje číslo portu.",
        answers: [
            { text: "Je to pravda", correct: true },
            { text: "Nie je to pravda", correct: false }
        ]
    },
    {
        type: 'multiple-choice',
        question: "Vlastníkom licencie na TCP/IP je RFC.",
        answers: [
            { text: "Je to pravda", correct: false },
            { text: "Nie je to pravda", correct: true }
        ],
        explanation: "RFC (Request for Comments) sú dokumenty popisujúce internetové štandardy, vrátane TCP/IP, nie sú to vlastníci licencií. TCP/IP je sada otvorených štandardov spravovaná komunitou IETF a je voľne implementovateľná bez potreby licencie od jedného vlastníka."
    },
    {
        type: 'multiple-choice',
        question: "Pomocou masky siete rozlišujem v IP adrese adresu siete a adresu uzla.",
        answers: [
            { text: "Je to pravda", correct: true },
            { text: "Nie je to pravda", correct: false }
        ]
    },
    {
        type: 'multiple-choice',
        question: "Pri statickom smerovaní smerovač podľa potreby mení smerovanie.",
        answers: [
            { text: "Je to pravda", correct: false },
            { text: "Nie je to pravda", correct: true }
        ],
        explanation: "Pri statickom smerovaní sú trasy v smerovacej tabuľke nastavené manuálne administrátorom a nemenia sa automaticky. Smerovač ich používa presne tak, ako boli zadané, bez ohľadu na aktuálny stav siete. Automatické prispôsobovanie sa zmenám je vlastnosťou dynamického smerovania."
    },
    {
        type: 'multiple-choice',
        question: "Socket jednoznačne identifikuje komunikujúcu stranu.",
        answers: [
            { text: "Je to pravda", correct: true },
            { text: "Nie je to pravda", correct: false }
        ]
    },
    {
        type: 'multiple-choice',
        question: "Inicializačný paket v UDP spojení má v hlavičke UDP datagramu príznak SYN.",
        answers: [
            { text: "Je to pravda", correct: false },
            { text: "Nie je to pravda", correct: true }
        ],
        explanation: "UDP je nespojovaný (connectionless) protokol, čo znamená, že nenadväzuje spojenie pred odoslaním dát. Preto nemá koncept \"inicializačného paketu\" ani príznaky na riadenie spojenia ako SYN, ACK alebo FIN, ktoré používa TCP. Hlavička UDP neobsahuje pole pre príznaky."
    },
    {
        type: 'multiple-choice',
        question: "192.168.54.0/26 je subnetom siete 192.168.52.0/24",
        answers: [
            { text: "Je to pravda", correct: false },
            { text: "Nie je to pravda", correct: true }
        ],
        explanation: "Sieť 192.168.52.0/24 pokrýva adresy od 192.168.52.0 do 192.168.52.255. Sieť 192.168.54.0/26 pokrýva adresy od 192.168.54.0 do 192.168.54.63. Keďže adresný rozsah siete /26 leží mimo rozsahu siete /24 (majú odlišný tretí oktet: 54 vs 52), nemôže byť jej subnetom."
    },
    {
        type: 'multiple-choice',
        question: "10.241.99.17 je privátna IP adresa.",
        answers: [
            { text: "Je to pravda", correct: true },
            { text: "Nie je to pravda", correct: false }
        ]
    },
    {
        type: 'multiple-choice',
        question: "Pri dynamickom smerovaní smerovač podľa stavu linky mení smerovanie.",
        answers: [
            { text: "Je to pravda", correct: true },
            { text: "Nie je to pravda", correct: false }
        ]
    },
    {
        type: 'multiple-choice',
        question: "255.255.255.255 je smerovateľný broadcast.",
        answers: [
            { text: "Je to pravda", correct: false },
            { text: "Nie je to pravda", correct: true }
        ],
        explanation: "Adresa 255.255.255.255 je tzv. \"Limited Broadcast\". Je určená len pre lokálny sieťový segment a smerovače (routre) ju nikdy neposielajú ďalej do iných sietí. Preto je z definície *nesmerovateľná*."
    },
    {
        type: 'multiple-choice',
        question: "193.87.59.2.25 je ekvivalentom 193.87.59.2/255.255.255.0",
        answers: [
            { text: "Je to pravda", correct: false },
            { text: "Nie je to pravda", correct: true }
        ],
        explanation: "Formát IPv4 adresy pozostáva presne zo štyroch čísel (oktetov) oddelených bodkami. Zápis `193.87.59.2.25` má päť čísel, a preto nie je platnou IPv4 adresou. Zápis `/255.255.255.0` predstavuje sieťovú masku a pripája sa k platnej IP adrese, nie je súčasťou jej štruktúry s piatimi číslami."
    },
    {
        type: 'multiple-choice',
        question: "Pri dynamickom smerovaní smerovač nepoužíva smerovaciu tabuľku.",
        answers: [
            { text: "Je to pravda", correct: false },
            { text: "Nie je to pravda", correct: true }
        ],
        explanation: "Smerovač vždy používa smerovaciu tabuľku na rozhodovanie, kam poslať pakety. Dynamické smerovacie protokoly (napr. OSPF, RIP) slúžia práve na to, aby smerovače *automaticky* vytvárali a aktualizovali obsah tejto smerovacej tabuľky na základe informácií získaných od susedných smerovačov a stavu siete."
    },
    {
        type: 'multiple-choice',
        question: "192.169.159.145 je verejná IP adresa.",
        answers: [
            { text: "Je to pravda", correct: true },
            { text: "Nie je to pravda", correct: false }
        ]
    },
    {
        type: 'multiple-choice',
        question: "193.87.59.0 je smerovateľný broadcast.",
        answers: [
            { text: "Je to pravda", correct: false },
            { text: "Nie je to pravda", correct: true }
        ],
        explanation: "Adresa končiaca na `.0` (pri bežných maskách ako /24) zvyčajne označuje adresu celej siete (network address), nie broadcast. Broadcast adresa siete je posledná adresa v jej rozsahu (napr. pre sieť 193.87.59.0/24 by broadcast bol 193.87.59.255)."
    },
    // vzorový test
    {
        type: 'multiple-choice',
        question: "Čo je to port v TCP/IP ?",
        answers: [
            { text: "číslo identifikujúce komunikujúci proces", correct: true },
            { text: "adresa uzla v sieti", correct: false },
            { text: "náhodné číslo bez ďalšieho významu", correct: false },
            { text: "číslo verzie TCP/IP", correct: false }
        ]
    },
    {
        type: 'multiple-choice',
        question: "Paket filter pracuje na aplikačnej vrstve.",
        answers: [
            { text: "je to pravda", correct: false },
            { text: "nie je to pravda", correct: true }
        ],
        explanation: "Tradičný paketový filter pracuje na sieťovej vrstve (kontrola IP adries) a transportnej vrstve (kontrola portov a protokolu TCP/UDP). Nerozumie dátam na aplikačnej vrstve. Zariadenia pracujúce na aplikačnej vrstve sú napr. aplikačné brány alebo proxy servery."
    },
    {
        type: 'multiple-choice',
        question: "Pri zavádzaní bezpečnostnej politiky je najdôležitejšie:",
        answers: [
            { text: "mať podporu autority", correct: true },
            { text: "silné šifrovanie", correct: false },
            { text: "organizované školenie pre užívateľov", correct: false },
            { text: "zorganizovať školenie pre správcov", correct: false }
        ]
    },
    {
        type: 'multiple-choice',
        question: "Algoritmus stavu linky zostavuje metriku na základe",
        answers: [
            { text: "počtu smerovačov do cieľa", correct: false },
            { text: "počtu hopov", correct: false },
            { text: "počtu hopov a stavov spojenia", correct: false },
            { text: "napr. šírky prenosového pásma", correct: true }
        ]
    },
    {
        type: 'multiple-choice',
        question: "Vlastníkom licencie na TCP/IP je DARPA.",
        answers: [
            { text: "je to pravda", correct: false },
            { text: "nie je to pravda", correct: true }
        ],
        explanation: "Hoci DARPA (Agentúra pre pokročilé obranné výskumné projekty) financovala raný vývoj technológií, ktoré viedli k TCP/IP, nevlastní na ne licenciu. TCP/IP je sada otvorených štandardov spravovaná IETF a je voľne dostupná na implementáciu."
    },
    {
        type: 'multiple-choice',
        question: "Spoľahlivý aj spojovaný prenos zaisťuje:",
        answers: [
            { text: "UDP protokol", correct: false },
            { text: "TCP protokol", correct: true }
        ]
    },
    {
        type: 'multiple-choice',
        question: "Odpoveď na inicializačný paket v TCP spojení má v hlavičke TCP segmentu príznak:",
        answers: [
            { text: "SYN", correct: false },
            { text: "SYN ACK", correct: true }
        ]
    },
    {
        type: 'multiple-choice',
        question: "Znakové (prúdové) symetrické šifrovanie sa používa hlavne pri šifrovaní dát na HDD.",
        answers: [
            { text: "je to pravda", correct: false },
            { text: "nie je to pravda", correct: true }
        ],
        explanation: "Prúdové šifry šifrujú dáta priebežne (napr. bit po bite) a sú ideálne pre komunikáciu v reálnom čase (napr. TLS). Na šifrovanie celých pevných diskov (HDD/SSD), kde sa pristupuje k dátam v blokoch, sa bežne používajú blokové šifry v špecializovaných módoch (napr. XTS)."
    },
    {
        type: 'multiple-choice',
        question: "Pri dynamickom smerovaní smerovač podľa stavu linky mení smerovanie",
        answers: [
            { text: "je to pravda", correct: true },
            { text: "nie je to pravda", correct: false }
        ]
    },
    {
        type: 'multiple-choice',
        question: "Preklad hardvérovej adresy na IP adresu v modeli TCP/IP zabezpečuje protokol:",
        answers: [
            { text: "DNS", correct: false },
            { text: "RIP", correct: false },
            { text: "ARP", correct: false },
            { text: "RARP", correct: true }
        ]
    },
    {
        type: 'multiple-choice',
        question: "Pohľad správcu systému na bezpečnostnú politiku sa:",
        answers: [
            { text: "zhoduje s pohľadom používateľa systému", correct: false },
            { text: "nezhoduje s pohľadom používateľa systému", correct: true }
        ]
    },
    {
        type: 'multiple-choice',
        question: "Príklad koncového systému je bežný smerovač.",
        answers: [
            { text: "je to pravda", correct: false },
            { text: "nie je to pravda", correct: true }
        ],
        explanation: "Koncové systémy (hostitelia) sú zariadenia, ktoré sú zdrojom alebo cieľom dát (napr. PC, server, smartfón). Smerovač (router) je sieťové zariadenie, ktoré prepája siete a smeruje dáta *medzi* koncovými systémami, nie je teda koncovým systémom."
    },
    {
        type: 'multiple-choice',
        question: "Môže mať dĺžka cesty vplyv na metriku?",
        answers: [
            { text: "áno", correct: true },
            { text: "nie", correct: false }
        ]
    },
    {
        type: 'multiple-choice',
        question: "PPTP poskytuje vyššiu bezpečnosť ako IPsec.",
        answers: [
            { text: "je to pravda", correct: false },
            { text: "nie je to pravda", correct: true }
        ],
        explanation: "IPsec (Internet Protocol Security) je považovaný za výrazne bezpečnejší štandard ako starší PPTP (Point-to-Point Tunneling Protocol). PPTP má známe bezpečnostné slabiny, zatiaľ čo IPsec ponúka silnejšie šifrovanie a robustnejšie mechanizmy autentifikácie."
    },
    {
        type: 'multiple-choice',
        question: "Zariadenie na oddelenie nechránenej siete od chránenej označujeme ako firepoint.",
        answers: [
            { text: "je to pravda", correct: false },
            { text: "nie je to pravda", correct: true }
        ],
        explanation: "Správne označenie pre zariadenie, ktoré oddeľuje siete a kontroluje premávku medzi nimi podľa bezpečnostných pravidiel, je Firewall. Termín \"firepoint\" sa v tomto kontexte štandardne nepoužíva."
    },
    {
        type: 'multiple-choice',
        question: "Zariadenie na oddelenie nechránenej siete od chránenej označujeme ako firewall.",
        answers: [
            { text: "je to pravda", correct: true },
            { text: "nie je to pravda", correct: false }
        ]
    }
];

// Dôležité: Tento súbor nesmie obsahovať nič iné ako definíciu premennej 'questions'.
// Žiadne volania funkcií, žiadna iná logika.