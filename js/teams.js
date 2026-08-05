let teams = JSON.parse(localStorage.getItem("teams")) || [];


function loadPlayers(){

    let players = JSON.parse(localStorage.getItem("players")) || [];

    let teams = JSON.parse(localStorage.getItem("teams")) || [];


    let usedPlayers=[];


    teams.forEach(function(team){

        team.players.forEach(function(p){

            usedPlayers.push(p);

        });

    });


    let option="";


    players.forEach(function(player){


        if(!usedPlayers.includes(player.name)){


            option += `

            <option value="${player.name}">
            ${player.name}
            </option>

            `;


        }


    });


    document.getElementById("teamPlayers").innerHTML=option;

}



function addTeam(){

    let name = document.getElementById("teamName").value.trim();


    if(name==""){

        alert("Team name lakho");
        return;

    }


    let teamPlayers = 
    Array.from(
        document.getElementById("teamPlayers").selectedOptions
    ).map(option=>option.value);



    teams.push({

        id:Date.now(),
        name:name,
        players:teamPlayers

    });


    localStorage.setItem(
        "teams",
        JSON.stringify(teams)
    );


    showTeams();


    document.getElementById("teamName").value="";
    loadPlayers();
}



function showTeams(){

    let list="";


    teams.forEach(function(team){

        list += `

        <div class="player-card">

        <h3>${team.name}</h3>

        <p>
        Players : ${team.players.join(", ")}
        </p>

        <button onclick="editTeam(${team.id})">
        ✏ Edit Name
        </button>

        <button onclick="deleteTeam(${team.id})">
        🗑 Delete
        </button>


        </div>

        `;

    });


    document.getElementById("teamList").innerHTML=list;

}



function deleteTeam(id){

    let confirmDelete = confirm(
        "Team delete karvi chhe?"
    );


    if(confirmDelete){


        teams = teams.filter(function(team){

            return team.id != id;

        });


        localStorage.setItem(
            "teams",
            JSON.stringify(teams)
        );


        showTeams();


        loadPlayers();

    }

}



loadPlayers();

showTeams();
function editTeam(id){

    let team = teams.find(function(t){

        return t.id == id;

    });


    let newName = prompt(
        "New Team Name lakho",
        team.name
    );


    if(newName && newName.trim()!=""){

        team.name = newName.trim();


        localStorage.setItem(
            "teams",
            JSON.stringify(teams)
        );


        showTeams();

    }

}
function editTeam(id){

    let team = teams.find(function(t){

        return t.id == id;

    });


    localStorage.setItem(
        "editTeamId",
        id
    );


    location.href="team-edit.html";

}