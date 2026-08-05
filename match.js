document.addEventListener("DOMContentLoaded", function () {
    let teams = JSON.parse(localStorage.getItem("teams")) || [];

    let team1Select = document.getElementById("matchTeam1");
    let team2Select = document.getElementById("matchTeam2");
    let tossWinnerSelect = document.getElementById("tossWinner");

    team1Select.innerHTML = "";
    team2Select.innerHTML = "";
    tossWinnerSelect.innerHTML = "";

    if (teams.length < 2) {
        alert("Match sharu karva mate kam se ma kam 2 team hovi anivary chhe!");
        location.href = "teams.html";
        return;
    }

    teams.forEach(function (team) {
        let opt1 = document.createElement("option");
        opt1.value = team.name;
        opt1.textContent = team.name;
        team1Select.appendChild(opt1);

        let opt2 = document.createElement("option");
        opt2.value = team.name;
        opt2.textContent = team.name;
        team2Select.appendChild(opt2);
    });

    // Default select different teams if possible
    if (teams.length > 1) {
        team2Select.selectedIndex = 1;
    }

    updateTossOptions();

    team1Select.addEventListener("change", updateTossOptions);
    team2Select.addEventListener("change", updateTossOptions);
});

function updateTossOptions() {
    let team1 = document.getElementById("matchTeam1").value;
    let team2 = document.getElementById("matchTeam2").value;
    let tossWinnerSelect = document.getElementById("tossWinner");

    tossWinnerSelect.innerHTML = "";

    let opt1 = document.createElement("option");
    opt1.value = team1;
    opt1.textContent = team1;
    tossWinnerSelect.appendChild(opt1);

    let opt2 = document.createElement("option");
    opt2.value = team2;
    opt2.textContent = team2;
    tossWinnerSelect.appendChild(opt2);
}

function startMatch() {
    let team1 = document.getElementById("matchTeam1").value;
    let team2 = document.getElementById("matchTeam2").value;
    let tossWinner = document.getElementById("tossWinner").value;
    let tossChoice = document.getElementById("tossChoice").value;
    let totalOvers = document.getElementById("matchOvers").value; // ઓવરની સંખ્યા લીધી

    if (team1 === team2) {
        alert("Banve team alag-alag hovi joiye!");
        return;
    }

    if (!totalOvers || totalOvers <= 0) {
        alert("Ochu ma ochu 1 over nakhvi anivary chhe!");
        return;
    }

    let battingTeam = "";
    let bowlingTeam = "";

    if (tossChoice === "bat") {
        battingTeam = tossWinner;
        bowlingTeam = (tossWinner === team1) ? team2 : team1;
    } else {
        bowlingTeam = tossWinner;
        battingTeam = (tossWinner === team1) ? team2 : team1;
    }

    let matchInfo = {
        team1: team1,
        team2: team2,
        tossWinner: tossWinner,
        tossChoice: tossChoice,
        battingTeam: battingTeam,
        bowlingTeam: bowlingTeam,
        totalOvers: parseInt(totalOvers) // મેચ ઇન્ફોમાં ઓવર સેવ કરી
    };

    localStorage.setItem("currentMatch", JSON.stringify(matchInfo));
    localStorage.setItem("inningsNumber", 1); // પહેલી ઇનિંગ્સ ફિક્સ કરી

    alert("Match sharu thai gai chhe! Overs: " + totalOvers + ", Batting: " + battingTeam);
    location.href = "scorer.html";
}