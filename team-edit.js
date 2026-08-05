document.addEventListener("DOMContentLoaded", function () {
    let editTeamId = localStorage.getItem("editTeamId");
    let teams = JSON.parse(localStorage.getItem("teams")) || [];
    let allPlayers = JSON.parse(localStorage.getItem("players")) || [];

    let team = teams.find(function (t) {
        return t.id == editTeamId;
    });

    if (!team) {
        alert("Team mali nathi!");
        location.href = "teams.html";
        return;
    }

    // Set Team Name
    document.getElementById("editTeamName").value = team.name;

    let selectBox = document.getElementById("editTeamPlayers");
    selectBox.innerHTML = "";

    allPlayers.forEach(function (player) {
        let playerName = "";
        
        if (typeof player === "object" && player !== null) {
            playerName = player.name || player.playerName || JSON.stringify(player);
        } else {
            playerName = player;
        }

        let option = document.createElement("option");
        option.value = playerName;
        option.textContent = playerName;

        // જો આ Player આ જ Team માં હોય તો સિલેક્ટ રાખવો
        if (team.players.includes(playerName)) {
            option.selected = true;
        }

        // જો Player બીજી Team માં હોય તો પણ Select કરી શકાય તેવું રાખવું અને નામ આગળ દર્શાવવું
        let currentAssignedTeam = teams.find(function (t) {
            return t.id != editTeamId && t.players.includes(playerName);
        });

        if (currentAssignedTeam) {
            option.textContent += " (Currently in: " + currentAssignedTeam.name + ")";
        }

        selectBox.appendChild(option);
    });
});

function saveTeamEdit() {
    let editTeamId = localStorage.getItem("editTeamId");
    let teams = JSON.parse(localStorage.getItem("teams")) || [];
    
    let newTeamName = document.getElementById("editTeamName").value.trim();
    let selectBox = document.getElementById("editTeamPlayers");

    if (newTeamName === "") {
        alert("Team Name lakhvu anivary chhe!");
        return;
    }

    let selectedPlayers = [];
    for (let i = 0; i < selectBox.options.length; i++) {
        if (selectBox.options[i].selected) {
            selectedPlayers.push(selectBox.options[i].value);
        }
    }

    if (selectedPlayers.length === 0) {
        alert("Ochu ma ochu 1 player pasand karo!");
        return;
    }

    // જો કોઈ Player બીજી Team માંથી આ Team માં લાવ્યા હોઈએ, 
    // તો બીજી Team ના players ની યાદીમાંથી તે Player ને દૂર કરવો
    teams = teams.map(function (t) {
        if (t.id == editTeamId) {
            t.name = newTeamName;
            t.players = selectedPlayers;
        } else {
            // બાકીની ટીમોમાંથી આ નવા સિલેક્ટ થયેલા ખેલાડીઓને કાઢી નાખવા જેથી ડુપ્લિકેટ ન થાય
            t.players = t.players.filter(function (p) {
                return !selectedPlayers.includes(p);
            });
        }
        return t;
    });

    localStorage.setItem("teams", JSON.stringify(teams));
    localStorage.removeItem("editTeamId");

    alert("Team safaltapurvak update thai gai chhe!");
    location.href = "teams.html";
}