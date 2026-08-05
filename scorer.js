let currentScore = 0;
let currentWickets = 0;
let legalBalls = 0;

let currentStriker = "";
let currentNonStriker = "";
let currentBowler = "";
let lastBowler = ""; // છેલ્લી ઓવર નાખનાર બોલર યાદ રાખવા માટે
let playerStats = {};  // Batsman stats
let bowlerStats = {};  // Bowler stats
let outPlayers = []; 

document.addEventListener("DOMContentLoaded", function () {
    let matchInfo = JSON.parse(localStorage.getItem("currentMatch"));

    if (!matchInfo) {
        alert("Phela Match Setup karo!");
        location.href = "match.html";
        return;
    }

    document.getElementById("displayBattingTeam").textContent = matchInfo.battingTeam;
    document.getElementById("displayBowlingTeam").textContent = matchInfo.bowlingTeam;

    let inningsNumber = localStorage.getItem("inningsNumber") ? parseInt(localStorage.getItem("inningsNumber")) : 1;
    if (inningsNumber === 2) {
        let target = localStorage.getItem("matchTarget");
        let titleEl = document.getElementById("matchTitle");
        if (titleEl) {
            titleEl.innerHTML = "2nd Innings (Target: " + target + ")";
        }
    }

    let savedScoreData = JSON.parse(localStorage.getItem("liveMatchScore"));
    if (savedScoreData) {
        currentScore = savedScoreData.score;
        currentWickets = savedScoreData.wickets;
        legalBalls = savedScoreData.balls;
        currentStriker = savedScoreData.striker || "";
        currentNonStriker = savedScoreData.nonStriker || "";
        currentBowler = savedScoreData.bowler || "";
        lastBowler = savedScoreData.lastBowler || "";
        playerStats = savedScoreData.playerStats || {};
        bowlerStats = savedScoreData.bowlerStats || {};
        outPlayers = savedScoreData.outPlayers || [];
    }

    updateScoreboard();
    updatePlayerDisplay();
    renderLivePermanentScoreboard();
});

function openPlayerSelection() {
    let matchInfo = JSON.parse(localStorage.getItem("currentMatch"));
    let teams = JSON.parse(localStorage.getItem("teams")) || [];

    let battingTeamObj = teams.find(t => t.name === matchInfo.battingTeam);
    let bowlingTeamObj = teams.find(t => t.name === matchInfo.bowlingTeam);

    let strikerSelect = document.getElementById("selectStriker");
    let nonStrikerSelect = document.getElementById("selectNonStriker");
    let bowlerSelect = document.getElementById("selectBowler");

    strikerSelect.innerHTML = "";
    nonStrikerSelect.innerHTML = `<option value="">-- None (Last Man Standing) --</option>`;
    bowlerSelect.innerHTML = "";

    if (battingTeamObj && battingTeamObj.players) {
        battingTeamObj.players.forEach(player => {
            if (!outPlayers.includes(player)) {
                strikerSelect.innerHTML += `<option value="${player}">${player}</option>`;
                nonStrikerSelect.innerHTML += `<option value="${player}">${player}</option>`;
            }
        });
    }

    if (bowlingTeamObj && bowlingTeamObj.players) {
        bowlingTeamObj.players.forEach(player => {
            if (player !== lastBowler) {
                bowlerSelect.innerHTML += `<option value="${player}">${player}</option>`;
            }
        });
    }

    if (currentStriker) strikerSelect.value = currentStriker;
    if (currentNonStriker) nonStrikerSelect.value = currentNonStriker;
    if (currentBowler && currentBowler !== lastBowler) {
        bowlerSelect.value = currentBowler;
    } else {
        bowlerSelect.value = "";
    }

    document.getElementById("playerModal").style.display = "flex";
}

function closePlayerSelection() {
    document.getElementById("playerModal").style.display = "none";
}

function saveSelectedPlayers() {
    let newStriker = document.getElementById("selectStriker").value;
    let newNonStriker = document.getElementById("selectNonStriker").value;
    let newBowler = document.getElementById("selectBowler").value;

    if (!newStriker) {
        alert("Striker select karvo anivary chhe!");
        return;
    }

    if (!newBowler) {
        alert("Bowler select karvo anivary chhe!");
        return;
    }

    if (newBowler === lastBowler) {
        alert("Je bowler e chhetti over nakhi hati e salang biji over na naxi sake!");
        return;
    }

    if (newNonStriker && newStriker === newNonStriker) {
        alert("Striker and Non-Striker alag-alag hova joiye!");
        return;
    }

    currentStriker = newStriker;
    currentNonStriker = newNonStriker; 
    currentBowler = newBowler;

    if (currentStriker && !playerStats[currentStriker]) {
        playerStats[currentStriker] = { runs: 0, balls: 0, fours: 0, sixes: 0 };
    }
    if (currentNonStriker && !playerStats[currentNonStriker]) {
        playerStats[currentNonStriker] = { runs: 0, balls: 0, fours: 0, sixes: 0 };
    }
    if (currentBowler && !bowlerStats[currentBowler]) {
        bowlerStats[currentBowler] = { runsGiven: 0, ballsBowled: 0, wicketsTaken: 0 };
    }

    closePlayerSelection();
    saveAndCheck();
    updatePlayerDisplay();
}

function updatePlayerDisplay() {
    document.getElementById("strikerName").textContent = currentStriker || "Select";
    document.getElementById("nonStrikerName").textContent = currentNonStriker || "None (Last Man)";
    document.getElementById("bowlerName").textContent = currentBowler || "Select";

    if (currentStriker && playerStats[currentStriker]) {
        let s = playerStats[currentStriker];
        document.getElementById("strikerScore").textContent = s.runs + " (" + s.balls + ")";
    } else {
        document.getElementById("strikerScore").textContent = "0 (0)";
    }

    if (currentNonStriker && playerStats[currentNonStriker]) {
        let ns = playerStats[currentNonStriker];
        document.getElementById("nonStrikerScore").textContent = ns.runs + " (" + ns.balls + ")";
    } else {
        document.getElementById("nonStrikerScore").textContent = "0 (0)";
    }

    if (currentBowler && bowlerStats[currentBowler]) {
        let b = bowlerStats[currentBowler];
        let bOvers = Math.floor(b.ballsBowled / 6) + "." + (b.ballsBowled % 6);
        document.getElementById("bowlerScore").textContent = b.wicketsTaken + "-" + b.runsGiven + " (" + bOvers + ")";
    } else {
        document.getElementById("bowlerScore").textContent = "0-0 (0.0)";
    }
}

function addRuns(runs) {
    if (!currentStriker || !currentBowler) {
        alert("Phela Striker ane Bowler select karo!");
        openPlayerSelection();
        return;
    }

    let matchInfo = JSON.parse(localStorage.getItem("currentMatch"));
    let maxOvers = matchInfo.totalOvers || 5;

    let currentOversCount = Math.floor(legalBalls / 6);
    if (currentOversCount >= maxOvers) {
        alert("Overs પૂરી થઈ ગઈ છે! Innings સમાપ્ત.");
        handleInningsEnd();
        return;
    }

    currentScore += runs;
    legalBalls += 1;

    if (!playerStats[currentStriker]) {
        playerStats[currentStriker] = { runs: 0, balls: 0, fours: 0, sixes: 0 };
    }
    playerStats[currentStriker].runs += runs;
    playerStats[currentStriker].balls += 1;
    if (runs === 4) playerStats[currentStriker].fours += 1;
    if (runs === 6) playerStats[currentStriker].sixes += 1;

    if (!bowlerStats[currentBowler]) {
        bowlerStats[currentBowler] = { runsGiven: 0, ballsBowled: 0, wicketsTaken: 0 };
    }
    bowlerStats[currentBowler].runsGiven += runs;
    bowlerStats[currentBowler].ballsBowled += 1;

    if (runs % 2 !== 0 && currentNonStriker) {
        let temp = currentStriker;
        currentStriker = currentNonStriker;
        currentNonStriker = temp;
    }

    if (legalBalls % 6 === 0) {
        if (currentNonStriker) {
            let temp = currentStriker;
            currentStriker = currentNonStriker;
            currentNonStriker = temp;
        }
        lastBowler = currentBowler;
        alert("Over Complete! Now select a new Bowler.");
        openPlayerSelection();
    }

    saveAndCheck();

    let inningsNumber = localStorage.getItem("inningsNumber") ? parseInt(localStorage.getItem("inningsNumber")) : 1;
    let target = localStorage.getItem("matchTarget") ? parseInt(localStorage.getItem("matchTarget")) : 0;

    if (inningsNumber === 2 && currentScore >= target) {
        alert("Target Achieved! Team jiti gai chhe!");
        handleInningsEnd();
        return;
    }

    if (Math.floor(legalBalls / 6) >= maxOvers) {
        alert("Overs પૂરી થઈ ગઈ છે!");
        handleInningsEnd();
    }
}

function addWicket() {
    if (!currentStriker || !currentBowler) {
        alert("Phela Striker ane Bowler select karo!");
        openPlayerSelection();
        return;
    }

    let matchInfo = JSON.parse(localStorage.getItem("currentMatch"));
    let teams = JSON.parse(localStorage.getItem("teams")) || [];
    let maxOvers = matchInfo.totalOvers || 5;

    if (Math.floor(legalBalls / 6) >= maxOvers) {
        alert("Overs પૂરી થઈ ગઈ છે!");
        handleInningsEnd();
        return;
    }

    let battingTeamObj = teams.find(t => t.name === matchInfo.battingTeam);
    let totalPlayers = battingTeamObj ? battingTeamObj.players.length : 10;
    let maxWickets = totalPlayers;

    if (currentWickets >= maxWickets) {
        alert("All Out! Badha players out થઈ ગયા છે.");
        handleInningsEnd();
        return;
    }

    legalBalls += 1;
    currentWickets += 1;

    if (playerStats[currentStriker]) {
        playerStats[currentStriker].balls += 1;
    }

    if (!bowlerStats[currentBowler]) {
        bowlerStats[currentBowler] = { runsGiven: 0, ballsBowled: 0, wicketsTaken: 0 };
    }
    bowlerStats[currentBowler].ballsBowled += 1;
    bowlerStats[currentBowler].wicketsTaken += 1;

    if (!outPlayers.includes(currentStriker)) {
        outPlayers.push(currentStriker);
    }

    alert(currentStriker + " Out thaya!");
    currentStriker = ""; 

    saveAndCheck();
    updatePlayerDisplay();

    if (currentWickets >= maxWickets) {
        alert("All Out! Innings સમાપ્ત.");
        handleInningsEnd();
        return;
    }

    if (Math.floor(legalBalls / 6) >= maxOvers) {
        alert("Overs પૂરી થઈ ગઈ છે!");
        handleInningsEnd();
        return;
    }

    let remainingPlayers = battingTeamObj.players.filter(p => !outPlayers.includes(p));
    if (remainingPlayers.length === 0) {
        alert("All players out! Innings samapt.");
        handleInningsEnd();
        return;
    }

    openPlayerSelection();
}

function saveAndCheck() {
    let scoreData = {
        score: currentScore,
        wickets: currentWickets,
        balls: legalBalls,
        striker: currentStriker,
        nonStriker: currentNonStriker,
        bowler: currentBowler,
        lastBowler: lastBowler,
        playerStats: playerStats,
        bowlerStats: bowlerStats,
        outPlayers: outPlayers
    };
    localStorage.setItem("liveMatchScore", JSON.stringify(scoreData));
    updateScoreboard();
    updatePlayerDisplay();
    renderLivePermanentScoreboard();
}

function updateScoreboard() {
    let matchInfo = JSON.parse(localStorage.getItem("currentMatch"));
    let maxOvers = matchInfo ? (matchInfo.totalOvers || 5) : 5;

    let overs = Math.floor(legalBalls / 6);
    let balls = legalBalls % 6;
    let oversString = overs + "." + balls;

    document.getElementById("scoreDisplay").textContent = currentScore + " / " + currentWickets;
    document.getElementById("oversDisplay").textContent = "Overs: " + oversString + " / " + maxOvers;
}

function renderLivePermanentScoreboard() {
    let matchInfo = JSON.parse(localStorage.getItem("currentMatch"));
    let firstInnings = JSON.parse(localStorage.getItem("firstInnings"));
    let inningsNumber = localStorage.getItem("inningsNumber") ? parseInt(localStorage.getItem("inningsNumber")) : 1;

    let container = document.getElementById("livePermanentScoreboard");
    if (!container) return;

    let html = "";

    // Common Table Styling for Professional Look
    let tableStyle = "width: 100%; border-collapse: collapse; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; margin-bottom: 12px; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 6px; overflow: hidden;";
    let thStyle = "background: #1e293b; color: #fff; padding: 8px 10px; text-align: left; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;";
    let thCenter = "background: #1e293b; color: #fff; padding: 8px 6px; text-align: center; font-weight: 600; font-size: 11px; text-transform: uppercase;";
    let tdStyle = "padding: 8px 10px; border-bottom: 1px solid #f1f5f9; color: #334155;";
    let tdCenter = "padding: 8px 6px; border-bottom: 1px solid #f1f5f9; text-align: center; color: #334155;";

    // 1st Innings View
    if (firstInnings) {
        let fOvers = firstInnings.overs || "0.0";
        html += `<div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
            <div style="font-weight: 700; color: #1e293b; font-size: 14px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                <span>📌 1st Innings: <span style="color: #2563eb;">${firstInnings.battingTeam}</span></span>
                <span style="background: #e2e8f0; padding: 2px 8px; border-radius: 4px; font-size: 12px; color: #475569;">${firstInnings.score}/${firstInnings.wickets} (${fOvers} Ov)</span>
            </div>`;

        // 1st Innings Batting Table
        if (firstInnings.playerStats && Object.keys(firstInnings.playerStats).length > 0) {
            html += `<div style="font-size: 11px; font-weight: 600; color: #64748b; margin-bottom: 4px; text-transform: uppercase;">Batting Scorecard</div>`;
            html += `<table style="${tableStyle}">
                <thead>
                    <tr>
                        <th style="${thStyle}">Batter</th>
                        <th style="${thCenter}">R</th>
                        <th style="${thCenter}">B</th>
                        <th style="${thCenter}">4s</th>
                        <th style="${thCenter}">6s</th>
                        <th style="${thCenter}">SR</th>
                    </tr>
                </thead>
                <tbody>`;
            for (let player in firstInnings.playerStats) {
                let p = firstInnings.playerStats[player];
                let isOut = firstInnings.outPlayers && firstInnings.outPlayers.includes(player);
                let statusBadge = isOut ? '<span style="color: #ef4444; font-size: 10px; font-weight: 500;">(out)</span>' : '<span style="color: #10b981; font-size: 10px; font-weight: 500;">(not out)</span>';
                let sr = p.balls > 0 ? ((p.runs / p.balls) * 100).toFixed(1) : "0.0";
                html += `<tr>
                    <td style="${tdStyle}"><strong>${player}</strong> ${statusBadge}</td>
                    <td style="${tdCenter}; font-weight: 700; color: #0f172a;">${p.runs}</td>
                    <td style="${tdCenter}">${p.balls}</td>
                    <td style="${tdCenter}">${p.fours}</td>
                    <td style="${tdCenter}">${p.sixes}</td>
                    <td style="${tdCenter}">${sr}</td>
                </tr>`;
            }
            html += `</tbody></table>`;
        }

        // 1st Innings Bowling Table
        if (firstInnings.bowlerStats && Object.keys(firstInnings.bowlerStats).length > 0) {
            html += `<div style="font-size: 11px; font-weight: 600; color: #64748b; margin-bottom: 4px; text-transform: uppercase;">Bowling Scorecard</div>`;
            html += `<table style="${tableStyle}">
                <thead>
                    <tr>
                        <th style="${thStyle}">Bowler</th>
                        <th style="${thCenter}">O</th>
                        <th style="${thCenter}">R</th>
                        <th style="${thCenter}">W</th>
                        <th style="${thCenter}">Eco</th>
                    </tr>
                </thead>
                <tbody>`;
            for (let bowler in firstInnings.bowlerStats) {
                let b = firstInnings.bowlerStats[bowler];
                let bOvers = Math.floor(b.ballsBowled / 6) + "." + (b.ballsBowled % 6);
                let totalOversDecimal = b.ballsBowled / 6;
                let eco = totalOversDecimal > 0 ? (b.runsGiven / totalOversDecimal).toFixed(1) : "0.0";
                html += `<tr>
                    <td style="${tdStyle}"><strong>${bowler}</strong></td>
                    <td style="${tdCenter}">${bOvers}</td>
                    <td style="${tdCenter}">${b.runsGiven}</td>
                    <td style="${tdCenter}; font-weight: 700; color: #2563eb;">${b.wicketsTaken}</td>
                    <td style="${tdCenter}">${eco}</td>
                </tr>`;
            }
            html += `</tbody></table>`;
        }
        html += `</div>`;
    }

    // Current / Live Innings View
    let currentBattingTeam = matchInfo ? matchInfo.battingTeam : "Batting Team";
    let overs = Math.floor(legalBalls / 6) + "." + (legalBalls % 6);

    html += `<div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 8px;">
        <div style="font-weight: 700; color: #166534; font-size: 14px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
            <span>🔴 ${inningsNumber === 2 ? '2nd Innings' : 'Live Innings'}: <span style="color: #15803d;">${currentBattingTeam}</span></span>
            <span style="background: #dcfce7; padding: 2px 8px; border-radius: 4px; font-size: 12px; color: #166534; border: 1px solid #86efac;">${currentScore}/${currentWickets} (${overs} Ov)</span>
        </div>`;

    // Current Batting Table
    if (Object.keys(playerStats).length > 0) {
        html += `<div style="font-size: 11px; font-weight: 600; color: #15803d; margin-bottom: 4px; text-transform: uppercase;">Batting Scorecard</div>`;
        html += `<table style="${tableStyle}">
            <thead>
                <tr>
                    <th style="${thStyle}">Batter</th>
                    <th style="${thCenter}">R</th>
                    <th style="${thCenter}">B</th>
                    <th style="${thCenter}">4s</th>
                    <th style="${thCenter}">6s</th>
                    <th style="${thCenter}">SR</th>
                </tr>
            </thead>
            <tbody>`;
        for (let player in playerStats) {
            let p = playerStats[player];
            let isOut = outPlayers.includes(player);
            let isCurrent = (player === currentStriker || player === currentNonStriker);
            
            let statusBadge = isOut ? '<span style="color: #ef4444; font-size: 10px; font-weight: 500;">(out)</span>' : 
                              (isCurrent ? '<span style="background: #dbeafe; color: #1d4ed8; padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 600;">batting</span>' : '<span style="color: #10b981; font-size: 10px; font-weight: 500;">(not out)</span>');
            
            let sr = p.balls > 0 ? ((p.runs / p.balls) * 100).toFixed(1) : "0.0";
            html += `<tr>
                <td style="${tdStyle}"><strong>${player}</strong> ${statusBadge}</td>
                <td style="${tdCenter}; font-weight: 700; color: #0f172a;">${p.runs}</td>
                <td style="${tdCenter}">${p.balls}</td>
                <td style="${tdCenter}">${p.fours}</td>
                <td style="${tdCenter}">${p.sixes}</td>
                <td style="${tdCenter}">${sr}</td>
            </tr>`;
        }
        html += `</tbody></table>`;
    } else {
        html += `<div style="font-size: 12px; color: #64748b; margin-bottom: 8px; font-style: italic;">Batting: No players selected yet.</div>`;
    }

    // Current Bowling Table
    if (Object.keys(bowlerStats).length > 0) {
        html += `<div style="font-size: 11px; font-weight: 600; color: #15803d; margin-bottom: 4px; text-transform: uppercase;">Bowling Scorecard</div>`;
        html += `<table style="${tableStyle}">
            <thead>
                <tr>
                    <th style="${thStyle}">Bowler</th>
                    <th style="${thCenter}">O</th>
                    <th style="${thCenter}">R</th>
                    <th style="${thCenter}">W</th>
                    <th style="${thCenter}">Eco</th>
                </tr>
            </thead>
            <tbody>`;
        for (let bowler in bowlerStats) {
            let b = bowlerStats[bowler];
            let bOvers = Math.floor(b.ballsBowled / 6) + "." + (b.ballsBowled % 6);
            let totalOversDecimal = b.ballsBowled / 6;
            let eco = totalOversDecimal > 0 ? (b.runsGiven / totalOversDecimal).toFixed(1) : "0.0";
            html += `<tr>
                <td style="${tdStyle}"><strong>${bowler}</strong></td>
                <td style="${tdCenter}">${bOvers}</td>
                <td style="${tdCenter}">${b.runsGiven}</td>
                <td style="${tdCenter}; font-weight: 700; color: #166534;">${b.wicketsTaken}</td>
                <td style="${tdCenter}">${eco}</td>
            </tr>`;
        }
        html += `</tbody></table>`;
    } else {
        html += `<div style="font-size: 12px; color: #64748b; font-style: italic;">Bowling: No bowler selected yet.</div>`;
    }

    html += `</div>`;
    container.innerHTML = html;
}

function resetMatch() {
    let confirmReset = confirm("Shu tame match reset karva maago cho?");
    if (confirmReset) {
        localStorage.removeItem("liveMatchScore");
        localStorage.removeItem("currentMatch");
        localStorage.removeItem("firstInnings");
        localStorage.removeItem("matchTarget");
        localStorage.removeItem("inningsNumber");
        alert("Match reset thai gai chhe!");
        location.href = "match.html";
    }
}

function getManOfTheMatch(playerStatsObj) {
    let bestPlayer = "None";
    let maxRuns = -1;

    for (let player in playerStatsObj) {
        if (playerStatsObj[player].runs > maxRuns) {
            maxRuns = playerStatsObj[player].runs;
            bestPlayer = player;
        }
    }
    return bestPlayer + " (" + maxRuns + " Runs)";
}

function endMatch() {
    let matchInfo = JSON.parse(localStorage.getItem("currentMatch"));
    if (!matchInfo) {
        alert("Koi active match nathi!");
        return;
    }

    let mom = getManOfTheMatch(playerStats);

    let matchResult = {
        date: new Date().toLocaleDateString(),
        team1: matchInfo.team1,
        team2: matchInfo.team2,
        totalOvers: matchInfo.totalOvers,
        result: "Match Ended Manually",
        firstInningsScore: currentScore + "/" + currentWickets,
        secondInningsScore: "-",
        playerStats: playerStats,
        bowlerStats: bowlerStats,
        outPlayers: outPlayers,
        manOfTheMatch: mom
    };

    let matchHistory = JSON.parse(localStorage.getItem("matchHistory")) || [];
    matchHistory.push(matchResult);
    localStorage.setItem("matchHistory", JSON.stringify(matchHistory));

    localStorage.removeItem("liveMatchScore");
    localStorage.removeItem("currentMatch");
    localStorage.removeItem("firstInnings");
    localStorage.removeItem("matchTarget");
    localStorage.removeItem("inningsNumber");

    alert("Match safaltapurvak save thai gai chhe!");
    location.href = "history.html";
}

function handleInningsEnd() {
    let matchInfo = JSON.parse(localStorage.getItem("currentMatch"));
    let inningsNumber = localStorage.getItem("inningsNumber") ? parseInt(localStorage.getItem("inningsNumber")) : 1;

    if (inningsNumber === 1) {
        let firstInningsData = {
            battingTeam: matchInfo.battingTeam,
            bowlingTeam: matchInfo.bowlingTeam,
            score: currentScore,
            wickets: currentWickets,
            overs: Math.floor(legalBalls / 6) + "." + (legalBalls % 6),
            playerStats: playerStats,
            bowlerStats: bowlerStats,
            outPlayers: outPlayers
        };

        localStorage.setItem("firstInnings", JSON.stringify(firstInningsData));
        
        let target = currentScore + 1;
        localStorage.setItem("matchTarget", target);

        alert("1st Innings Over!\nTarget for " + matchInfo.bowlingTeam + " is: " + target + " runs.");

        let tempTeam = matchInfo.battingTeam;
        matchInfo.battingTeam = matchInfo.bowlingTeam;
        matchInfo.bowlingTeam = tempTeam;

        localStorage.setItem("currentMatch", JSON.stringify(matchInfo));
        localStorage.setItem("inningsNumber", 2);

        currentScore = 0;
        currentWickets = 0;
        legalBalls = 0;
        currentStriker = "";
        currentNonStriker = "";
        currentBowler = "";
        lastBowler = "";
        playerStats = {};
        bowlerStats = {};
        outPlayers = [];
        localStorage.removeItem("liveMatchScore");

        location.reload();

    } else {
        let firstInnings = JSON.parse(localStorage.getItem("firstInnings"));
        let target = parseInt(localStorage.getItem("matchTarget"));

        let winnerMessage = "";
        let chasingTeam = matchInfo.battingTeam;
        let defendingTeam = matchInfo.bowlingTeam;

        if (currentScore >= target) {
            winnerMessage = chasingTeam + " (Chasing Team) Match jiti gai chhe! 🎉";
        } else if (currentScore === target - 1) {
            winnerMessage = "Match Tie થઈ ગઈ છે! 🤝";
        } else {
            let runsNeeded = target - currentScore;
            winnerMessage = defendingTeam + " (Defending Team) Match jiti gai chhe by " + runsNeeded + " runs! 🏆";
        }

        let mom = getManOfTheMatch(playerStats);
        alert("Match Over!\n" + winnerMessage + "\n⭐ Man of the Match: " + mom);

        let matchResult = {
            date: new Date().toLocaleDateString(),
            team1: firstInnings.battingTeam,
            team2: firstInnings.bowlingTeam,
            totalOvers: matchInfo.totalOvers,
            result: winnerMessage,
            firstInningsScore: firstInnings.score + "/" + firstInnings.wickets,
            secondInningsScore: currentScore + "/" + currentWickets,
            playerStats: playerStats,
            bowlerStats: bowlerStats,
            outPlayers: outPlayers,
            manOfTheMatch: mom
        };

        let matchHistory = JSON.parse(localStorage.getItem("matchHistory")) || [];
        matchHistory.push(matchResult);
        localStorage.setItem("matchHistory", JSON.stringify(matchHistory));

        localStorage.removeItem("liveMatchScore");
        localStorage.removeItem("currentMatch");
        localStorage.removeItem("firstInnings");
        localStorage.removeItem("matchTarget");
        localStorage.removeItem("inningsNumber");

        location.href = "history.html";
    }
}
// ==========================================
// 🔗 BATCH ALIAS FUNCTIONS (બધાજ બટન નામો માટે સપોર્ટ)
// ==========================================
function matchHistory() {
    executeMatchSave();
}

// 🛠️ અસલી સેવિંગ લોજિક (ફિક્સ કરેલું)
function executeMatchSave() {
    if (confirm("શું તમે મેચ પૂરી કરીને સેવ કરવા માંગો છો?")) {
        try {
            let matchInfo = JSON.parse(localStorage.getItem("currentMatch")) || {};
            let battingTeam = matchInfo.battingTeam || "Team A";
            let bowlingTeam = matchInfo.bowlingTeam || "Team B";

            let firstInnings = JSON.parse(localStorage.getItem("firstInnings")) || {};
            let fScore = firstInnings.score !== undefined ? `${firstInnings.score}/${firstInnings.wickets}` : "N/A";

            let totalOversDone = Math.floor(legalBalls / 6) + "." + (legalBalls % 6);
            let mom = typeof getManOfTheMatch === 'function' ? getManOfTheMatch(playerStats) : "N/A";

            let matchRecord = {
                id: Date.now(),
                date: new Date().toLocaleDateString(),
                team1: matchInfo.team1 || battingTeam,
                team2: matchInfo.team2 || bowlingTeam,
                teams: `${matchInfo.team1 || battingTeam} vs ${matchInfo.team2 || bowlingTeam}`,
                totalOvers: matchInfo.totalOvers || 5,
                result: "Match Ended Manually",
                scoreSummary: `${currentScore}/${currentWickets} (${totalOversDone} Ov)`,
                firstInningsScore: fScore,
                secondInningsScore: currentScore + "/" + currentWickets,
                playerStats: playerStats,
                bowlerStats: bowlerStats,
                outPlayers: outPlayers,
                manOfTheMatch: mom
            };

            // બંને લોકલ સ્ટોરેજ કીમાં સેવ કરો જેથી હિસ્ટ્રી પેજ ગમે તે નામથી ડેટા વાંચતું હોય તો પણ મેચ દેખાઈ જાય
            let matchHistoryArr = JSON.parse(localStorage.getItem("matchHistory")) || [];
            matchHistoryArr.unshift(matchRecord);
            localStorage.setItem("matchHistory", JSON.stringify(matchHistoryArr));

            let savedMatches = JSON.parse(localStorage.getItem("savedMatches")) || [];
            savedMatches.unshift(matchRecord);
            localStorage.setItem("savedMatches", JSON.stringify(savedMatches));

            // લાઈવ ડેટા સાફ કરો
            localStorage.removeItem("liveMatchScore");
            localStorage.removeItem("currentMatch");
            localStorage.removeItem("firstInnings");
            localStorage.removeItem("matchTarget");
            localStorage.removeItem("inningsNumber");

            alert("✅ મેચ સફળતાપૂર્વક સેવ થઈ ગઈ છે!");
            window.location.href = "history.html";
        } catch (error) {
            console.error("Match save error:", error);
            alert("⚠️ મેચ સેવ કરવામાં ભૂલ આવી છે.");
        }
    }
}