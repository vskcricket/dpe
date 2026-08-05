document.addEventListener("DOMContentLoaded", function () {
    let historyList = document.getElementById("historyList");
    let SavedMatches= JSON.parse(localStorage.getItem("SavedMatches")) || [];

    historyList.innerHTML = "";

    if (SavedMatches.length === 0) {
        historyList.innerHTML = "<p style='text-align: center; color: #666;'>Koi match history available nathi.</p>";
        return;
    }

    SavedMatches.reverse().forEach(function (match, index) {
        let div = document.createElement("div");
        div.style.background = "#f8f9fa";
        div.style.padding = "15px";
        div.style.marginBottom = "15px";
        div.style.borderRadius = "6px";
        div.style.borderLeft = "5px solid #28a745";
        div.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";

        let totalOversText = match.totalOvers ? ` (${match.totalOvers} Overs Match)` : "";
        let momText = match.manOfTheMatch ? `<div style="font-size: 14px; color: #d35400; margin-top: 5px;">⭐ <b>Man of the Match:</b> ${match.manOfTheMatch}</div>` : "";

        let htmlContent = `
            <div style="font-size: 14px; color: #666; margin-bottom: 5px;">📅 ${match.date}${totalOversText}</div>
            <div style="font-size: 16px; font-weight: bold; color: #2c3e50; margin-bottom: 4px;">🏆 ${match.result}</div>
            ${momText}
            <hr style="border: 0; border-top: 1px solid #ddd; margin: 8px 0;">
            <div style="font-size: 15px;"><strong>Team 1:</strong> ${match.team1} - ${match.firstInningsScore || 'N/A'}</div>
            <div style="font-size: 15px; margin-bottom: 10px;"><strong>Team 2:</strong> ${match.team2} - ${match.secondInningsScore || 'N/A'}</div>
        `;

        // Batsman Summary (આઉટ થયા હોય કે નોટ આઉટ, બધા રમેલા ખેલાડીઓનું લિસ્ટ)
        if (match.playerStats && Object.keys(match.playerStats).length > 0) {
            htmlContent += `<div style="margin-top: 10px; background: #fff; padding: 8px; border-radius: 4px; border: 1px solid #ddd;">
                <strong style="font-size: 13px; color: #007bff;">Batting Summary:</strong><ul style="margin: 5px 0 0 15px; padding: 0; font-size: 13px;">`;
            
            for (let player in match.playerStats) {
                let p = match.playerStats[player];
                let isOut = match.outPlayers && match.outPlayers.includes(player);
                let statusText = isOut ? " (Out)" : " (Not Out)";
                htmlContent += `<li>${player}${statusText}: <b>${p.runs}</b> runs (${p.balls} balls) [4s: ${p.fours}, 6s: ${p.sixes}]</li>`;
            }
            htmlContent += `</ul></div>`;
        }

        // Bowler Summary
        if (match.bowlerStats && Object.keys(match.bowlerStats).length > 0) {
            htmlContent += `<div style="margin-top: 8px; background: #fff; padding: 8px; border-radius: 4px; border: 1px solid #ddd;">
                <strong style="font-size: 13px; color: #d35400;">Bowling Summary:</strong><ul style="margin: 5px 0 0 15px; padding: 0; font-size: 13px;">`;
            
            for (let bowler in match.bowlerStats) {
                let b = match.bowlerStats[bowler];
                let bOvers = Math.floor(b.ballsBowled / 6) + "." + (b.ballsBowled % 6);
                htmlContent += `<li>${bowler}: <b>${b.wicketsTaken}-${b.runsGiven}</b> (${bOvers} Overs)</li>`;
            }
            htmlContent += `</ul></div>`;
        }

        div.innerHTML = htmlContent;
        historyList.appendChild(div);
    });
});