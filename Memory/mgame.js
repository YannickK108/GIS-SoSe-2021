"use strict";
var mgame;
(function (mgame) {
    //Konstanten
    const DISPLAYCARD = 1;
    const DISPLAYBACKSIDE = 0;
    const DISPLAYNONE = -1;
    const UNASSIGNED = -1;
    const DISPLAY_ADMIN_PAGE = 1;
    const DISPLAY_HIGHSCORE_PAGE = 2;
    const DISPLAY_PLAY_PAGE = 3;
    //Zum Test sind hier die Element, die aus der Datenbank kommen (imagelinks und highscores) 
    //in einer Datensammlung zusammengefasst
    let mem = { imagelinks: ["media/pictures/img11.jpg", "media/pictures/img12.jpg", "media/pictures/img13.jpg", "media/pictures/img14.jpg",
            "media/pictures/img1.jpg", "media/pictures/img2.jpg", "media/pictures/img3.jpg", "media/pictures/img4.jpg"],
        highscores: [{ nicname: "Sepp1", clicks: 100, time: 67 }, { nicname: "Sepp2", clicks: 200, time: 78 },
            { nicname: "Sepp3", clicks: 300, time: 77 }, { nicname: "Sepp4", clicks: 400, time: 88 },
            { nicname: "Sepp5", clicks: 500, time: 67 }, { nicname: "Sepp6", clicks: 600, time: 99 },
            { nicname: "Sepp7", clicks: 700, time: 97 }, { nicname: "Sepp8", clicks: 800, time: 66 },
            { nicname: "Sepp9", clicks: 900, time: 57 }, { nicname: "Sepp10", clicks: 990, time: 44 }] };
    //Vorinitialisiertes Obkelt game
    let game = {
        duration: -1,
        startTime: -1,
        clicks: -1,
        player: "ich",
        mapcards: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        mapdisplaymode: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        clickedcard: -1,
        memorydata: { imagelinks: ["media/pictures/img2.jpg", "media/pictures/img1.jpg", "media/pictures/img3.jpg", "media/pictures/img4.jpg",
                "media/pictures/img11.jpg", "media/pictures/img12.jpg", "media/pictures/img13.jpg", "media/pictures/img14.jpg"],
            highscores: [{ nicname: "Sepp1", clicks: 100, time: 67 }, { nicname: "Sepp2", clicks: 200, time: 78 },
                { nicname: "Sepp3", clicks: 300, time: 77 }, { nicname: "Sepp4", clicks: 400, time: 88 },
                { nicname: "Sepp5", clicks: 500, time: 67 }, { nicname: "Sepp6", clicks: 600, time: 99 },
                { nicname: "Sepp7", clicks: 700, time: 97 }, { nicname: "Sepp8", clicks: 800, time: 66 },
                { nicname: "Sepp9", clicks: 900, time: 57 }, { nicname: "Sepp10", clicks: 990, time: 44 }] }
    };
    //Zurücksetzen des "mapdisplaymode"
    //Dieses Array hat die doppelte Anzahl wie Bilder verfügbar sind (Interface Memorygame.imagelinks)
    //Die Einträge bestimmen ob eine Karte mit der Vorderseite, Rückseite oder ein Bild für "aus dem Spiel"
    //angezeigt wird
    function ResetDisplaymodeMap(_game) {
        for (let index = 0; index < _game.mapdisplaymode.length; index++) {
            _game.mapdisplaymode[index] = DISPLAYBACKSIDE;
        }
    }
    //Zurücksetzen des mapcards Array
    //Ebenfalls doppelt so groß wie die Anzahl vorhandener Bilder (jede Karte als Pärchen)
    //Hier steht die Referenz (Index) im Bildarray (Interface Memorygame.imagelinks) drin
    function ResetCardsMap(_game) {
        for (let index = 0; index < _game.mapcards.length; index++) {
            _game.mapcards[index] = UNASSIGNED;
        }
    }
    //Spiel initialisieren
    function initTheGame(_game, _mem) {
        console.log("Start");
        console.log(_mem);
        _game.memorydata = _mem;
        ResetDisplaymodeMap(_game);
        ResetCardsMap(_game);
        MixTheImageMap(_game);
        createPlayground(_game);
        refreshPlayground(_game);
        _game.clicks = 0; //Anzahl clicks null setzen
        _game.startTime = Math.floor(Date.now() / 1000); //Aktuelle Zeit in Sekunden holen
        //Testausgaben auf der Console        
        console.log(_game);
        console.log("End");
    }
    //Hier werden die Karten gemischt.
    //Jede Karte aus game.memorydata.imagelinks wird mit Ihrem Index 2 mal in
    //der Kartenmap (_game.mapcards) eingetragen
    function MixTheImageMap(_game) {
        for (let index = 0; index < _game.memorydata.imagelinks.length; index++) {
            PlaceCardRandom(index, _game); //Jede Karte 2 mal im Spiel vorhanden
            PlaceCardRandom(index, _game);
        }
    }
    //Zufälliges plazieren einer Karte im _game.mapcards Array
    function PlaceCardRandom(_imageIndex, _game) {
        let num;
        let done = false;
        do {
            num = Math.floor(Math.random() * (2 * _game.memorydata.imagelinks.length)); //Zufallszahl 0 - 15
            console.log(num);
            if (_game.mapcards[num] === -1) {
                _game.mapcards[num] = _imageIndex;
                done = true;
            }
        } while (done === false);
    }
    //Eventlistener für click die Überschrift
    //Um Platz zu sparen kommt man mit einem Klick auf die oberste Zeile immer in das Übersichtsmenu (quasi Startseite)
    //zurück.
    function onClickHeadline() {
        console.log("EXIT"); //Testausgabe 
        startPage();
    }
    //Eventlistener für click auf Karte beim Spiel
    //Hier wird das Umdrehen der Karten, Timeout für Ansehen durch Benutzer, also das Spielen
    //abgehandelt
    function onClickCardFunc(_game, _cardindex) {
        console.log("NEW CLICK"); //Testausgabe
        console.log("Index: " + _cardindex); //Testausgabe des Index
        if (_game.mapdisplaymode[_cardindex] === DISPLAYBACKSIDE) {
            _game.mapdisplaymode[_cardindex] = DISPLAYCARD; //Karte anzeigen
            _game.clicks = _game.clicks + 1;
            refreshPlayground(_game);
            if (_game.clickedcard === UNASSIGNED) {
                _game.clickedcard = _cardindex; //geklickte Karte merken
            }
            else {
                if (_game.mapcards[_game.clickedcard] === _game.mapcards[_cardindex]) {
                    _game.mapdisplaymode[_cardindex] = DISPLAYNONE;
                    _game.mapdisplaymode[_game.clickedcard] = DISPLAYNONE;
                }
                else {
                    _game.mapdisplaymode[_cardindex] = DISPLAYBACKSIDE;
                    _game.mapdisplaymode[_game.clickedcard] = DISPLAYBACKSIDE;
                }
                _game.clickedcard = UNASSIGNED;
                setTimeout(function () { TimeoutFunc(_game); }, 2000); //Timeout 2000 ms
            }
        }
        console.log(_game);
    }
    //Timeout: Karten werden wieder verdeckt oder aus dem Spiel genommen
    //Verzweigen auf Ergebnisseite (displayResult) wenn alle Karten gespielt
    function TimeoutFunc(_game) {
        let timeInSeconds;
        refreshPlayground(_game);
        console.log("Timeout");
        if (checkAllCardsPlayed(_game) === true) {
            timeInSeconds = Math.floor(Date.now() / 1000);
            _game.duration = timeInSeconds - _game.startTime;
            console.log("READY");
            displayResult(game);
        }
    }
    //Check ob alle Karten gespielt wurden
    function checkAllCardsPlayed(_game) {
        let allCardsPlayed = true;
        for (let index = 0; index < _game.mapdisplaymode.length; index++) {
            if (_game.mapdisplaymode[index] != DISPLAYNONE) {
                allCardsPlayed = false;
            }
        }
        return allCardsPlayed;
    }
    //###############################################################
    //######################### Main ################################
    //###############################################################
    setExit(); //Exit durch Eventlistener einhängen
    ReadCardsFromDatabase();
    ReadScoresFromDatabase();
    startPage(); //Startseite anzeigen
    //Testsend();
    //displayHighscores(game);
    //initTheGame(game, mem);
    //displayResult(game);
    //displayAdmin(game);
    //Da es nur eine einzige HTML-Seite gibt, deren DIV mit der id "general" immer neue Kinder bekommt
    //je nachdem welche Seite angezeigt werden soll werden hier alle Kinder unter "general" gelöscht
    //und ein neues Kind (DIV) mit der id = _id (Übergbeparameter) erstellt.
    function setupNewSite(_id) {
        cleanGeneral();
        let div = document.createElement("div");
        div.setAttribute("id", _id);
        document.getElementById("general").appendChild(div);
    }
    //##################################################################################
    //Erzeugen des Spielfeldes
    function createPlayground(_game) {
        setupNewSite("playground");
        createAllTheCards(_game);
    }
    //Alle Kinder unter div mit id "general" löschen
    function cleanGeneral() {
        let element = document.getElementById("general");
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }
    // //Erzeugen eines einzelnen Bildes unter dem <div> mit Id = playground
    function createOneCard(_game, _id) {
        let image = document.createElement("img");
        image.setAttribute("src", _game.memorydata.imagelinks[_game.mapcards[_id]]);
        image.setAttribute("id", "img" + _id);
        image.addEventListener("click", function () { onClickCardFunc(_game, _id); });
        document.getElementById("playground").appendChild(image);
    }
    // Erzeugt alle Karten zum Spielen
    function createAllTheCards(_game) {
        for (let index = 0; index < _game.mapcards.length; index++) {
            createOneCard(_game, index);
        }
    }
    //Ändert den Link (src attribut) der endsprechenden id (_item)
    function changeImageLink(_item, _newlink) {
        let element = document.getElementById(_item);
        element.setAttribute("src", _newlink);
    }
    function setExit() {
        let element = document.getElementById("headline2");
        element.addEventListener("click", function () { onClickHeadline(); });
    }
    //Spielfeld neu zeichnen durch Anpassen der Bildlinks
    function refreshPlayground(_game) {
        for (let index = 0; index < _game.mapdisplaymode.length; index++) {
            if (_game.mapdisplaymode[index] === DISPLAYCARD) {
                changeImageLink("img" + index, _game.memorydata.imagelinks[_game.mapcards[index]]);
            }
            if (_game.mapdisplaymode[index] === DISPLAYBACKSIDE) {
                changeImageLink("img" + index, "media/pictures/backside.jpg");
            }
            if (_game.mapdisplaymode[index] === DISPLAYNONE) {
                changeImageLink("img" + index, "media/pictures/none.jpg");
            }
        }
    }
    //========================================================================================
    //=============================== Highscores Seite =======================================
    //========================================================================================
    function displayHighscores(_game) {
        setupNewSite("list");
        //Überschrift
        let element = document.createElement("h1");
        element.setAttribute("id", "table_h1");
        element.innerText = "Highscores - Nochmal versuchen ?  -  Klick in die Tabelle";
        document.getElementById("list").appendChild(element);
        createTable(_game);
    }
    //Tabelle auf Highscoreseite erzeugen
    function createTable(_game) {
        let element = document.createElement("table");
        element.setAttribute("id", "scorelist");
        element.addEventListener("click", function () { onClickTable(); });
        document.getElementById("list").appendChild(element);
        //first row (Kopfzeile der Tabelle)
        element = document.createElement("tr");
        element.setAttribute("id", "thead");
        document.getElementById("scorelist").appendChild(element);
        element = document.createElement("th");
        element.innerText = "nicname";
        document.getElementById("thead").appendChild(element);
        element = document.createElement("th");
        element.innerText = "time";
        document.getElementById("thead").appendChild(element);
        element = document.createElement("th");
        element.innerText = "clicks";
        document.getElementById("thead").appendChild(element);
        //Datenreihen erzeugen ()
        for (let index = 0; index < _game.memorydata.highscores.length; index++) {
            element = document.createElement("tr");
            element.setAttribute("id", "tr" + index);
            document.getElementById("scorelist").appendChild(element);
        }
        //Datenreichen ausfüllen
        for (let index = 0; index < _game.memorydata.highscores.length; index++) {
            element = document.createElement("td");
            element.setAttribute("id", "td" + index);
            element.innerText = _game.memorydata.highscores[index].nicname;
            document.getElementById("tr" + index).appendChild(element);
            element = document.createElement("td");
            element.setAttribute("id", "td" + index);
            element.innerText = "" + _game.memorydata.highscores[index].time;
            document.getElementById("tr" + index).appendChild(element);
            element = document.createElement("td");
            element.setAttribute("id", "td" + index);
            element.innerText = "" + _game.memorydata.highscores[index].clicks;
            document.getElementById("tr" + index).appendChild(element);
        }
    }
    //Eventlistener für neues Spiel beim klicken auf die Highscoretabelle
    function onClickTable() {
        initTheGame(game, mem);
    }
    //========================================================================================
    //=============================== Result Seite =======================================
    //========================================================================================
    function displayResult(_game) {
        setupNewSite("result");
        //Überschrift
        let element = document.createElement("h1");
        element.setAttribute("id", "result_h1");
        element.innerText = "Ergebnis ";
        document.getElementById("result").appendChild(element);
        //Time
        element = document.createElement("h1");
        element.setAttribute("id", "result_time");
        element.innerText = "Spieldauer war" + _game.duration + "Sekunden";
        document.getElementById("result").appendChild(element);
        //Clicks
        element = document.createElement("h1");
        element.setAttribute("id", "result_clicks");
        element.innerText = "Sie haben" + _game.clicks + "mal geclickt";
        document.getElementById("result").appendChild(element);
        //Eingabeaufforderung anzeigen
        element = document.createElement("h2");
        element.setAttribute("id", "result_user");
        element.innerText = "Geben Sie einen Nicname ein";
        document.getElementById("result").appendChild(element);
        //Spielername einlesen
        getPlayerName(_game);
    }
    //Erzeugen eines Form-Objekts und eines Button um den Namen des Spielers zu holen
    function getPlayerName(_game) {
        let element = document.createElement("form");
        element.setAttribute("id", "user_form");
        document.getElementById("result").appendChild(element);
        element = document.createElement("label");
        //element.setAttribute("id", "username");
        element.setAttribute("for", "player");
        //element.innerText = "Usernamen";
        document.getElementById("user_form").appendChild(element);
        element = document.createElement("input");
        element.setAttribute("type", "text");
        element.setAttribute("id", "player");
        element.setAttribute("name", "player");
        document.getElementById("user_form").appendChild(element);
        //Button
        element = document.createElement("button");
        element.setAttribute("id", "saveplayer");
        element.innerText = "Speichern in Datenbank";
        element.addEventListener("click", function () { onClickSaveResults(_game); });
        document.getElementById("result").appendChild(element);
    }
    //Eventlistener um Spielername und Ergebnis zu speichern
    async function onClickSaveResults(_game) {
        let formData = new FormData(document.forms[0]);
        console.log(formData.get("player"));
        _game.player = formData.get("player");
        console.log(_game);
        await SendResultsToDatabase(_game);
        displayHighscores(game);
    }
    //========================================================================================
    //==================================== Admin Seite =======================================
    //========================================================================================
    function displayAdmin(_game) {
        setupNewSite("admin");
        //Überschrift
        let element = document.createElement("h1");
        element.setAttribute("id", "admin_h1");
        element.innerText = "Bilder verwalten";
        document.getElementById("admin").appendChild(element);
        //Anweisung
        element = document.createElement("h3");
        element.setAttribute("id", "admin_h3");
        element.innerText = "Bild anclicken um es zu löschen oder im Eingabefeld eine URL eintragen um ein neues Bild hinzuzufügen";
        document.getElementById("admin").appendChild(element);
        displayAllTheCards(_game);
        getNewImageLink(_game);
    }
    //Ein Bild aus _game.memorydata.imagelinks darstellen
    function displayOneImage(_game, _id) {
        let image = document.createElement("img");
        image.setAttribute("src", _game.memorydata.imagelinks[_id]);
        image.setAttribute("id", "imglink" + _id);
        image.addEventListener("click", function () { onClickDeleteImageFunc(_game, _id); });
        document.getElementById("admin").appendChild(image);
    }
    //Alle Bilder aus _game.memorydata.imagelinks darstellen
    function displayAllTheCards(_game) {
        for (let index = 0; index < _game.memorydata.imagelinks.length; index++) {
            displayOneImage(_game, index);
        }
    }
    //Form-Element um URL eine neuen Bildes zu holen
    function getNewImageLink(_game) {
        let element = document.createElement("form");
        element.setAttribute("id", "img_form");
        document.getElementById("admin").appendChild(element);
        element = document.createElement("label");
        element.setAttribute("for", "newimage");
        document.getElementById("img_form").appendChild(element);
        element = document.createElement("input");
        element.setAttribute("type", "text");
        element.setAttribute("id", "newimage");
        element.setAttribute("name", "newimage");
        document.getElementById("img_form").appendChild(element);
        //Button
        element = document.createElement("button");
        element.setAttribute("id", "saveimage");
        element.innerText = "Bild in Datenbank einfügen";
        element.addEventListener("click", function () { onClickSaveImage(_game); });
        document.getElementById("admin").appendChild(element);
    }
    //Eventlistener auf den Butten zum Speicher eines neuen Bildes (Adminseite)
    async function onClickSaveImage(_game) {
        let formData = new FormData(document.forms[0]);
        console.log(formData.get("newimage"));
        await SendImageToDatabase(formData.get("newimage"));
        displayAdmin(_game);
    }
    //Eventlistener bei Anklicken eines Bildes auf der Adminseite um es zu löschen
    async function onClickDeleteImageFunc(_game, _id) {
        console.log(_id);
        await SendDeleteImageToDatabase(_game.memorydata.imagelinks[_id]);
        displayAdmin(_game);
    }
    //========================================================================================
    //==================================== Start Seite =======================================
    //========================================================================================
    function startPage() {
        setupNewSite("startpage");
        //Button admin
        let element = document.createElement("button");
        element.setAttribute("id", "button_admin");
        element.innerText = "Administration";
        element.addEventListener("click", function () { onClickStart(DISPLAY_ADMIN_PAGE); });
        document.getElementById("startpage").appendChild(element);
        //Button highscor
        element = document.createElement("button");
        element.setAttribute("id", "button_highscore");
        element.innerText = "Highscores";
        element.addEventListener("click", function () { onClickStart(DISPLAY_HIGHSCORE_PAGE); });
        document.getElementById("startpage").appendChild(element);
        //Button spielen
        element = document.createElement("button");
        element.setAttribute("id", "button_play");
        element.innerText = "Spielen";
        element.addEventListener("click", function () { onClickStart(DISPLAY_PLAY_PAGE); });
        document.getElementById("startpage").appendChild(element);
    }
    //Eventlistener auf Buttons auf der Startseite
    //Anhand von _select auswählen der anzuzeigenden Seite
    function onClickStart(_select) {
        if (_select === DISPLAY_ADMIN_PAGE) {
            displayAdmin(game);
        }
        if (_select === DISPLAY_HIGHSCORE_PAGE) {
            displayHighscores(game);
        }
        if (_select === DISPLAY_PLAY_PAGE) {
            initTheGame(game, mem);
        }
    }
    //============================ session save and restore ========================
    //Mal vorbereitet aber vermutlich nicht nötig durch das Konzept von nur einer HTML
    //Seite
    //     function saveSession(): void {
    //     sessionStorage.setItem("my", JSON.stringify(game)); 
    // }
    //     function restoreFromSession(): void {
    // let gameFromJson: TheGame;
    // gameFromJson = JSON.parse(sessionStorage.getItem("my"));
    // if (gameFromJson) {
    //    game =  gameFromJson; 
    // }
    // }
    //#################################################################################
    //################################# Database ######################################
    //#################################################################################
    let myServerResponseIs;
    let images;
    async function ReadCardsFromDatabase() {
        //await sendReadRequest ("https://yannicksgis.herokuapp.com");
        await sendCardReadRequest("http://localhost:8100");
    }
    async function sendCardReadRequest(_myRequest) {
        _myRequest = _myRequest + "/rd_links";
        myServerResponseIs = await (await fetch(_myRequest)).text();
        console.log("Serverantwort: ");
        console.log(myServerResponseIs);
        console.log("Als JSON: ");
        adaptCardsArray(myServerResponseIs);
    }
    function adaptCardsArray(_resp) {
        images = JSON.parse(_resp);
        console.log(images);
        console.log(mem);
        let dbImageLinks = new Array(images.length);
        for (let index = 0; index < images.length; index++) {
            dbImageLinks[index] = (images[index].imagelinks);
        }
        console.log(dbImageLinks);
        mem.imagelinks = dbImageLinks;
        game.memorydata.imagelinks = dbImageLinks;
        //arrays in game anpassen
        let dbarray = new Array(2 * images.length);
        let dbarray2 = new Array(2 * images.length);
        game.mapcards = dbarray;
        game.mapdisplaymode = dbarray2;
        console.log(dbarray);
        ResetDisplaymodeMap(game);
        console.log(game.mapdisplaymode);
        ResetCardsMap(game);
    }
    async function ReadScoresFromDatabase() {
        //await sendReadRequest ("https://yannicksgis.herokuapp.com");
        await sendScoresReadRequest("http://localhost:8100");
    }
    async function sendScoresReadRequest(_myRequest) {
        _myRequest = _myRequest + "/rd_score";
        myServerResponseIs = await (await fetch(_myRequest)).text();
        console.log("Serverantwort: ");
        console.log(myServerResponseIs);
        let dbScores = JSON.parse(myServerResponseIs);
        console.log(dbScores);
        mem.highscores = dbScores;
        game.memorydata.highscores = dbScores;
        console.log(mem);
        console.log(game);
    }
    // async function Testsend (): Promise<void> {
    //     let score: Highscore = {clicks: 10, nicname: "Horst", time: 111};
    //     await sendPlayResult ("http://localhost:8100", score);   
    // }
    async function SendResultsToDatabase(_game) {
        let score = { nicname: _game.player, clicks: _game.clicks, time: _game.duration };
        // score.clicks = _game.clicks;
        // score.nicname = game.player;
        // score.time = _game.duration;
        await sendPlayResult("http://localhost:8100", score);
    }
    async function sendPlayResult(_myRequest, _playresult) {
        _myRequest = _myRequest + "/wr_score" + "?" + JSON.stringify(_playresult);
        myServerResponseIs = await (await fetch(_myRequest)).text();
        let dbScores = JSON.parse(myServerResponseIs);
        console.log(dbScores);
        mem.highscores = dbScores;
        game.memorydata.highscores = dbScores;
        console.log(mem);
        console.log(game);
    }
    async function SendImageToDatabase(_link) {
        await sendImageLink("http://localhost:8100", _link);
    }
    async function sendImageLink(_myRequest, _link) {
        _myRequest = _myRequest + "/wr_link" + "?" + _link;
        myServerResponseIs = await (await fetch(_myRequest)).text();
        adaptCardsArray(myServerResponseIs);
    }
    async function SendDeleteImageToDatabase(_link) {
        await sendDeleteImage("http://localhost:8100", _link);
    }
    async function sendDeleteImage(_myRequest, _link) {
        _myRequest = _myRequest + "/wr_delete" + "?" + _link;
        myServerResponseIs = await (await fetch(_myRequest)).text();
        adaptCardsArray(myServerResponseIs);
    }
})(mgame || (mgame = {}));
//# sourceMappingURL=mgame.js.map