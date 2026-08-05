// બધી જ જરૂરી કી (Keys) માં ડેટા સિન્ક રહે તે માટે લોડ કરો
let players = JSON.parse(localStorage.getItem("players")) || JSON.parse(localStorage.getItem("cricket_players_list")) || [];

// શરૂઆતમાં જ ડેટાને પરમેનન્ટ લોકલ સ્ટોરેજમાં સેવ કરી દો
syncPlayerStorage();

function syncPlayerStorage() {
    localStorage.setItem("players", JSON.stringify(players));
    localStorage.setItem("cricket_players_list", JSON.stringify(players.map(p => typeof p === 'object' ? p.name : p)));
}

function addPlayer(){
    let nameInput = document.getElementById("playerName");
    if (!nameInput) return;
    let name = nameInput.value.trim();

    if(name === ""){
        alert("Player name lakho");
        return;
    }

    let check = players.find(function(p){
        let pName = typeof p === 'object' ? p.name : p;
        return pName.toLowerCase() === name.toLowerCase();
    });

    if(check){
        alert("Aa Player already add chhe");
        return;
    }

    players.push({
        id: Date.now(),
        name: name
    });

    syncPlayerStorage();

    nameInput.value = "";
    showPlayers();
}

function showPlayers(){
    // સેફ સોર્ટિંગ માટે ચેક
    players.sort(function(a,b){
        let nameA = (typeof a === 'object' ? a.name : a) || "";
        let nameB = (typeof b === 'object' ? b.name : b) || "";
        return nameA.localeCompare(nameB);
    });

    let list = "";

    players.forEach(function(player){
        let pId = player.id || Date.now();
        let pName = typeof player === 'object' ? player.name : player;

        list += `
        <div class="player-card">
        <h3>${pName}</h3>

        <button onclick="editPlayer(${pId})">
        ✏ Edit
        </button>

        <button onclick="deletePlayer(${pId})">
        🗑 Delete
        </button>
        </div>
        `;
    });

    let playerListEl = document.getElementById("playerList");
    let playerCountEl = document.getElementById("playerCount");

    if (playerListEl) playerListEl.innerHTML = list;
    if (playerCountEl) playerCountEl.innerHTML = "Total Players : " + players.length;
}

function deletePlayer(id){
    players = players.filter(function(p){
        return p.id != id;
    });

    syncPlayerStorage();
    showPlayers();
}

function editPlayer(id){
    let player = players.find(function(p){
        return p.id == id;
    });

    if (!player) return;

    let pName = typeof player === 'object' ? player.name : player;
    let newName = prompt(
        "New Player Name",
        pName
    );

    if(newName && newName.trim() !== ""){
        if (typeof player === 'object') {
            player.name = newName.trim();
        } else {
            let index = players.indexOf(player);
            if (index !== -1) {
                players[index] = { id: id, name: newName.trim() };
            }
        }

        syncPlayerStorage();
        showPlayers();
    }
}

// પેજ લોડ થતાં જ ખેલાડીઓ સ્ક્રીન પર બતાવવા માટે
document.addEventListener("DOMContentLoaded", function() {
    showPlayers();
});

function searchPlayer(){
    let searchInput = document.getElementById("searchPlayer");
    if (!searchInput) return;
    let text = searchInput.value.toLowerCase();

    let list = "";

    players.filter(function(player){
        let pName = typeof player === 'object' ? player.name : player;
        return pName.toLowerCase().includes(text);
    }).forEach(function(player){
        let pId = player.id || Date.now();
        let pName = typeof player === 'object' ? player.name : player;

        list += `
        <div class="player-card">
        <h3>${pName}</h3>

        <button onclick="editPlayer(${pId})">
        ✏ Edit
        </button>

        <button onclick="deletePlayer(${pId})">
        🗑 Delete
        </button>
        </div>
        `;
    });

    let playerListEl = document.getElementById("playerList");
    if (playerListEl) playerListEl.innerHTML = list;
}

// 🏆 Professional Man of the Match Calculation (Both Innings Batting & Bowling)
function calculateManOfTheMatch() {
    let firstInnings = JSON.parse(localStorage.getItem("firstInnings")) || { playerStats: {}, bowlerStats: {} };
    let currentInnings = { playerStats: typeof playerStats !== 'undefined' ? playerStats : {}, bowlerStats: typeof bowlerStats !== 'undefined' ? bowlerStats : {} };
    
    let playerPoints = {};

    function addPoints(name, pts) {
        if (!name || name === "Select" || name === "None") return;
        if (!playerPoints[name]) playerPoints[name] = 0;
        playerPoints[name] += pts;
    }

    // Batting Points (1 Run = 1 Pts, 4s = 1 Pts, 6s = 2 Pts, 50+ = 10 Pts, 100+ = 25 Pts)
    [firstInnings.playerStats, currentInnings.playerStats].forEach(stats => {
        if (stats) {
            for (let player in stats) {
                let p = stats[player];
                let pts = (p.runs || 0) + ((p.fours || 0) * 1) + ((p.sixes || 0) * 2);
                if (p.runs >= 50) pts += 10;
                if (p.runs >= 100) pts += 25;
                addPoints(player, pts);
            }
        }
    });

    // Bowling Points (1 Wicket = 20 Pts)
    [firstInnings.bowlerStats, currentInnings.bowlerStats].forEach(stats => {
        if (stats) {
            for (let bowler in stats) {
                let b = stats[bowler];
                let pts = (b.wicketsTaken || 0) * 20;
                addPoints(bowler, pts);
            }
        }
    });

    let bestPlayer = "None";
    let maxPts = -999;
    for (let player in playerPoints) {
        if (playerPoints[player] > maxPts) {
            maxPts = playerPoints[player];
            bestPlayer = player;
        }
    }

    return bestPlayer !== "None" ? `${bestPlayer} (${Math.round(maxPts)} Pts)` : "Yet to decide";
}

// 💾 Professional Match Save Function
function saveCompletedMatch() {
    let matchInfo = JSON.parse(localStorage.getItem("currentMatch")) || { battingTeam: "Team A", bowlingTeam: "Team B" };
    let firstInnings = JSON.parse(localStorage.getItem("firstInnings")) || {};
    
    let matchRecord = {
        id: Date.now(),
        date: new Date().toLocaleDateString('en-GB'),
        teams: `${matchInfo.battingTeam} vs ${matchInfo.bowlingTeam}`,
        scoreSummary: `${typeof currentScore !== 'undefined' ? currentScore : 0}/${typeof currentWickets !== 'undefined' ? currentWickets : 0}`,
        manOfTheMatch: calculateManOfTheMatch(),
        firstInningsScore: firstInnings.score ? `${firstInnings.score}/${firstInnings.wickets}` : "N/A"
    };

    let savedMatches = JSON.parse(localStorage.getItem("savedMatches")) || [];
    savedMatches.unshift(matchRecord);
    localStorage.setItem("savedMatches", JSON.stringify(savedMatches));
}

// ⚡ Auto-detect and bind Match Over button
document.addEventListener("DOMContentLoaded", function () {
    let allButtons = document.querySelectorAll("button");
    allButtons.forEach(btn => {
        let text = btn.innerText.toLowerCase();
        if (text.includes("over") || text.includes("finish") || text.includes("save") || text.includes("end")) {
            btn.addEventListener("click", function (e) {
                e.preventDefault();
                if (typeof executeMatchSave === "function") {
                    executeMatchSave();
                } else {
                    saveCompletedMatch();
                }
            });
        }
    });
});