// TODO:
//    - Make the website responsive to keyboard strokes
//    - Refactor overall code to simplifly it
//    - Accessibility overall
//    - Wrap API calls in promises that dont proceed with showing page until they are resolved
//    - Create a loading spinner

// ASK: Does .remove() get rid of the event listener on the close icon as well?
// ASK: Check if caps is good with mentors
// ASK: How to make js files split into multiple files?

const NBACodeStars = {};

// 1. init method that kicks everything off
NBACodeStars.init = () => {
  NBACodeStars.getTeamsData();
  NBACodeStars.getUserSelections();
  NBACodeStars.getSelection();
};

// Global variables
NBACodeStars.dropdownElem = document.getElementsByClassName("dropdown")[0];
NBACodeStars.cardsContainerElem =
  document.getElementsByClassName("teamCards")[0];
NBACodeStars.teamsSelected = ["all"]; // default state is all teams are selected
NBACodeStars.teamsData = null;
NBACodeStars.playerByTeamBiodata = null;
NBACodeStars.playerByTeamStatsData = null;
NBACodeStars.defaultSeason = 2021;

// Team details API
NBACodeStars.url = "https://fly.sportsdata.io";
NBACodeStars.endpoints = {
  teams: "/v3/nba/scores/json/teams",
  playersBio: "/v3/nba/stats/json/Players",
  playersSeasonStats: `/v3/nba/stats/json/PlayerSeasonStatsByTeam/${NBACodeStars.defaultSeason}`,
};
NBACodeStars.apiKey = "44c04f59b59b46e0b83d9f530f7c8e27";

// Function that makes the API call get get teams data
NBACodeStars.getTeamsData = async () => {
  const url = new URL(`${NBACodeStars.url}${NBACodeStars.endpoints.teams}`);
  url.search = new URLSearchParams({
    key: NBACodeStars.apiKey,
  });

  // TODO: Add a throw and catch block
  fetch(url)
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error(res);
      }
    })
    .then((data) => {
      console.log(data);
      NBACodeStars.teamsData = data;
      NBACodeStars.displayOptions(NBACodeStars.teamsData);
    })
    .catch((error) => {
      console.log(error);
      NBACodeStars.displaySiteLoadError();

      // TODO: Error handling
    });
};
// Error handle function
NBACodeStars.displaySiteLoadError = () => {
  // Refactor with displayPlayerDetails
  // Create close icon -> refactor code from above to manage close icon functionality
  const errorMessage = document.createElement("p");
  errorMessage.textContent = "Could not load data. Please try again later!";
  console.log("YOU MAD BRUH??");
  const playerDetailsContainerElem = document.createElement("div");
  playerDetailsContainerElem.classList.add("playerDetailsContainer");
  playerDetailsContainerElem.append(errorMessage);

  const playerDetailsOuterElem = document.createElement("div");
  playerDetailsOuterElem.classList.add("playerDetailsOuterContainer");
  playerDetailsOuterElem.append(playerDetailsContainerElem);

  const bodyElem = document.querySelector("body");
  bodyElem.prepend(playerDetailsOuterElem);
};

// Function that makes the API call get get players data
NBACodeStars.getPlayersByTeamBiodata = async (teamAbbreviation) => {
  const url = new URL(
    `${NBACodeStars.url}${NBACodeStars.endpoints.playersBio}/${teamAbbreviation}`
  );
  url.search = new URLSearchParams({
    key: NBACodeStars.apiKey,
  });

  // TODO: Add a throw and catch block
  return fetch(url)
    .then((res) => res.json())
    .then((data) => {
      NBACodeStars.playerByTeamBiodata = data;
    })
    .catch(() => {
      // TODO: Error handling
    });
};

NBACodeStars.getPlayersByTeamStatsData = async (teamAbbreviation) => {
  const url = new URL(
    `${NBACodeStars.url}${NBACodeStars.endpoints.playersSeasonStats}/${teamAbbreviation}`
  );
  url.search = new URLSearchParams({
    key: NBACodeStars.apiKey,
  });

  // TODO: Add a throw and catch block
  return fetch(url)
    .then((res) => res.json())
    .then((data) => {
      NBACodeStars.playerByTeamStatsData = data;
    })
    .catch(() => {
      // TODO: Error handling
    });
};

// Function that displays the teams in the dropdown
NBACodeStars.displayOptions = (teams) => {
  teams.forEach((team) => {
    const teamName = `${team["City"]} ${team["Name"]}`;
    const id = team["TeamID"];
    const optionLi = document.createElement("li");

    // This could be any header element or a button
    optionLi.textContent = teamName;

    // Do we still need a value here if they are not option elements
    optionLi.value = id;
    optionLi.tabIndex = "0";
    optionLi.setAttribute("id", id);
    optionLi.setAttribute("role", "option");
    optionLi.setAttribute("aria-selected", "false");
    optionLi.classList.add("dropdownOption");

    // This will be the css class background color toggled on or off
    NBACodeStars.dropdownElem.append(optionLi);

    // This still needs to be called
    NBACodeStars.displayTeamCard(team);
  });
};

// Function that updates the dropdown and team cards based on the selections made
NBACodeStars.getUserSelections = () => {
  NBACodeStars.dropdownElem.addEventListener("click", (event) => {
    // Get the element selected
    const selectedEl = event.target.closest("li");

    NBACodeStars.updateDropdown(selectedEl);
    NBACodeStars.updateTeamCards();
  });

  NBACodeStars.dropdownElem.addEventListener("keyup", (event) => {
    if (event.code === "Space" || event.code === "Enter") {
      // Get the element selected
      const selectedEl = event.target.closest("li");

      NBACodeStars.updateDropdown(selectedEl);
      NBACodeStars.updateTeamCards();
    }

    console.log("pressed");
  });

  // Prevents the dropdown from scrolling when spacebar is selected
  NBACodeStars.dropdownElem.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
      event.preventDefault();
    }
  });
};

// Function updates the dropdown itself each time the user makes a selection from the dropdown
NBACodeStars.updateDropdown = (selectedEl) => {
  // Store the user's selection
  const teamId = selectedEl.id;
  const isSelected = selectedEl.getAttribute("aria-selected") === "false"; // true if its being selected; false if de-selected

  // Toggle the highlight class and aria-selected values on the element selected
  selectedEl.classList.toggle("highlight");
  selectedEl.setAttribute("aria-selected", isSelected ? "true" : "false");

  // update the attribute for dropdown element for accessibility
  document
    .querySelector(".dropdown")
    .setAttribute("aria-activedescendant", teamId);

  // Add the team selected
  if (isSelected) {
    // Scenario 1: All teams is selected
    // empty selections if all teams is selected
    if (teamId === "all") {
      // Empty all the teams
      NBACodeStars.teamsSelected = [];

      // Remove highlight from all the teams and update aria-selected attribute
      const highlightedEl =
        NBACodeStars.dropdownElem.querySelectorAll(".highlight");

      highlightedEl.forEach((element) => {
        if (element.id !== "all") {
          element.classList.remove("highlight");
          element.setAttribute("aria-selected", "false");
        }
      });
    }

    // Scenario 2: A specific team is selected
    else {
      // remove "all" selection if a specific team is selected
      const index = NBACodeStars.teamsSelected.indexOf("all");
      index !== -1 && NBACodeStars.teamsSelected.splice(index, 1);

      // remove highlight from "all" selection and update aria-selected attribute
      const allSelectionEl = NBACodeStars.dropdownElem.querySelector("#all");
      allSelectionEl.classList.remove("highlight");
      allSelectionEl.setAttribute("aria-selected", "false");
    }

    // Update the teamsSelected array
    NBACodeStars.teamsSelected.push(teamId);
  }

  // Scenario 3: User deselects
  else {
    // Remove team
    const index = NBACodeStars.teamsSelected.indexOf(teamId);
    NBACodeStars.teamsSelected.splice(index, 1);

    // Scenario 3.1: User deselects and does not have any teams selected
    // Add "all" teams if the teamsSelected is empty after removing the most recent team
    if (NBACodeStars.teamsSelected.length === 0) {
      NBACodeStars.teamsSelected.push("all");

      // Add highlight from "all" selection
      const allSelectionEl = NBACodeStars.dropdownElem.querySelector("#all");
      allSelectionEl.classList.add("highlight");
      allSelectionEl.setAttribute("aria-selected", "true");
    }
  }
};

// Function updated the team cards shown on the screen each time the user makes a selection from the dropdown
NBACodeStars.updateTeamCards = () => {
  // Display team card's based on user's selection from the dropdown
  NBACodeStars.cardsContainerElem.innerHTML = "";

  // Display all the teams by looping through all 30 NBA teams
  if (NBACodeStars.teamsSelected[0] === "all") {
    NBACodeStars.teamsData.forEach((team) => {
      NBACodeStars.displayTeamCard(team);
    });
  }
  // Display only the teams selected by looping through the specific team selected
  else {
    NBACodeStars.teamsSelected.forEach((id) => {
      const team = NBACodeStars.teamsData.find((team) => {
        return team["TeamID"] === parseInt(id);
      });
      NBACodeStars.displayTeamCard(team);
    });
  }
};

// Function that displays the teams card
NBACodeStars.displayTeamCard = (team) => {
  const teamName = `${team["City"]} ${team["Name"]}`;

  const h3Elem = document.createElement("h3");
  h3Elem.innerText = teamName;
  h3Elem.classList.add("cardTeamName");

  const imageURL = team["WikipediaLogoUrl"];
  const imgElem = document.createElement("img");
  imgElem.src = imageURL;
  imgElem.alt = `${teamName} team logo`;
  imgElem.classList.add("cardImg");

  const cardInnerContainerElem = document.createElement("div");
  cardInnerContainerElem.classList.add("cardInnerContainer");
  cardInnerContainerElem.append(imgElem);

  const aElem = document.createElement("a");
  aElem.innerHTML = "Team details";
  aElem.classList.add("btn");
  aElem.classList.add("btnTeamDetails");
  aElem.ariaRole = "button";
  aElem.tabIndex = "0";

  NBACodeStars.teamDetailsListener(aElem);

  const liElem = document.createElement("li");
  liElem.classList.add("card");
  liElem.id = `card-${team["TeamID"]}`;
  liElem.append(cardInnerContainerElem);
  liElem.append(aElem);
  liElem.append(h3Elem);

  NBACodeStars.cardsContainerElem.append(liElem);
};

// Function to set up event listener on the select dropdown
NBACodeStars.getSelection = () => {
  NBACodeStars.dropdownElem.addEventListener("change", () => {
    const options = document.querySelectorAll("li");
    let noSelection = true;

    NBACodeStars.cardsContainerElem.innerHTML = "";

    // Display all the team cards selected
    for (const option in options) {
      // Only show the card if there is an actual team selected
      if (options[option].ariaSelected && options[option].value !== "all") {
        const id = parseInt(options[option].id);

        console.log(typeof id);

        noSelection = false;

        const teamData = NBACodeStars.teamsData.find((team) => {
          console.log(team["TeamID"]);
          console.log(typeof team["TeamID"]);

          return team["TeamID"] === id && team;
        });
        NBACodeStars.displayTeamCard(teamData);
      }
    }

    // Display all team cards if no specific team is selected
    if (noSelection) {
      NBACodeStars.teamsData.forEach((team) => {
        NBACodeStars.displayTeamCard(team);
      });
    }
  });
};

// Add event listener to the team details buttons populated
// Call the function when team details button has been created
NBACodeStars.teamDetailsListener = (btnElement) => {
  btnElement.addEventListener("click", (e) => {
    // Determine which team was selected based on the id of the card it is in
    const cardId = e.target.closest(".card").id;
    const teamId = cardId.split("-")[1];

    // Collect team details in a variable
    const teamDetailsObj = NBACodeStars.teamsData.find(
      (team) => team["TeamID"] === parseInt(teamId)
    );

    // Create team details card

    // Create elements to hold team details

    // TODO: REFACTOR THIS CODE TO INNER HTML
    const closeIconElem = document.createElement("i");
    closeIconElem.classList.add("fas", "fa-times", "closeIcon");
    closeIconElem.tabIndex = "0";

    const cityElem = document.createElement("p");
    cityElem.innerHTML = teamDetailsObj["City"];
    cityElem.classList.add("city");

    const cityLabelElem = document.createElement("p");
    cityLabelElem.innerHTML = "City";
    cityLabelElem.classList.add("teamDetailsLabel");

    const conferenceElem = document.createElement("p");
    conferenceElem.innerHTML = teamDetailsObj["Conference"];
    conferenceElem.classList.add("conference");

    const conferenceLabelElem = document.createElement("p");
    conferenceLabelElem.innerHTML = "Conference";
    conferenceLabelElem.classList.add("teamDetailsLabel");

    const divisionElem = document.createElement("p");
    divisionElem.innerHTML = teamDetailsObj["Division"];
    divisionElem.classList.add("division");

    const divisionLabelElem = document.createElement("p");
    divisionLabelElem.innerHTML = "Division";
    divisionLabelElem.classList.add("teamDetailsLabel");

    // Create an overlay container to hold team details and append details into it
    const teamDetailsCardElem = document.createElement("div");
    teamDetailsCardElem.classList.add("teamDetailsCard");
    teamDetailsCardElem.append(closeIconElem);
    teamDetailsCardElem.append(cityLabelElem);
    teamDetailsCardElem.append(cityElem);

    teamDetailsCardElem.append(conferenceLabelElem);
    teamDetailsCardElem.append(conferenceElem);

    teamDetailsCardElem.append(divisionLabelElem);
    teamDetailsCardElem.append(divisionElem);

    // append overlay to card inner div for the card selected
    const cardElem = document.getElementById(cardId);
    const cardInnerContainer =
      cardElem.getElementsByClassName("cardInnerContainer")[0];

    cardInnerContainer.append(teamDetailsCardElem);

    // Event listener to close the team details card when close icon is clicked
    // ASK: Does .remove() get rid of the event listener on the close icon as well?
    closeIconElem.addEventListener("click", (e) => {
      const teamDetailsCard = e.target.closest(".teamDetailsCard");

      // Refactor to create a general fadeout animation
      teamDetailsCard.classList.add("fadeOut");
      setTimeout(function () {
        teamDetailsCard.remove();
      }, 500);

      // Remove the team details button and add the player details button
      // Refactor with team details button being removed and player details being added
      const playerDetailsBtn =
        cardElem.getElementsByClassName("btnPlayerDetails")[0];
      playerDetailsBtn.remove();

      const aElem = document.createElement("a");
      aElem.innerHTML = "Team details";
      aElem.classList.add("btn");
      aElem.classList.add("btnTeamDetails");
      aElem.ariaRole = "button";
      aElem.tabIndex = "0";

      cardInnerContainer.parentNode.insertBefore(
        aElem,
        cardInnerContainer.nextSibling
      );

      // Add event listener to the team details button
      NBACodeStars.teamDetailsListener(aElem);
    });

    // Remove the team details button and add the player details button
    // Refactor this code with the player details event listener code
    const teamDetailsBtn = cardElem.getElementsByClassName("btnTeamDetails")[0];
    teamDetailsBtn.remove();

    const aElem = document.createElement("a");
    aElem.innerHTML = "Roster";
    aElem.classList.add("btn");
    aElem.classList.add("btnPlayerDetails");
    aElem.ariaRole = "button";
    aElem.tabIndex = "0";

    aElem.addEventListener("click", (e) => {
      const cardId = e.target.closest(".card").id;
      const teamId = cardId.split("-")[1];

      NBACodeStars.displayPlayerDetails(teamId);
    });
    aElem.addEventListener("keyup", (e) => {
      if (e.code === "Enter") {
        const cardId = e.target.closest(".card").id;
        const teamId = cardId.split("-")[1];
        NBACodeStars.displayPlayerDetails(teamId);
      }
    });

    cardInnerContainer.parentNode.insertBefore(
      aElem,
      cardInnerContainer.nextSibling
    );
  });
};

// Display player details on the screen
NBACodeStars.displayPlayerDetails = (teamId) => {
  // Create player details modal
  // Create close icon -> refactor code from above to manage close icon functionality
  const closeIconElem = document.createElement("i");
  closeIconElem.classList.add("fas", "fa-times", "closeIcon");
  closeIconElem.tabIndex = "0";

  const playerDetailsContainerElem = document.createElement("div");
  playerDetailsContainerElem.classList.add("playerDetailsContainer");
  playerDetailsContainerElem.append(closeIconElem);

  const playerDetailsOuterElem = document.createElement("div");
  playerDetailsOuterElem.classList.add("playerDetailsOuterContainer");
  playerDetailsOuterElem.append(playerDetailsContainerElem);

  const bodyElem = document.querySelector("body");
  bodyElem.prepend(playerDetailsOuterElem);

  closeIconElem.addEventListener("click", (e) => {
    const playerDetailsOuterContainerElem = e.target.closest(
      ".playerDetailsOuterContainer"
    );

    // Refactor to create a general fadeout animation
    playerDetailsOuterContainerElem.classList.add("fadeOut");
    setTimeout(function () {
      playerDetailsOuterContainerElem.remove();
    }, 500);
  });

  // Determine which team was selected
  const teamDetailsObj = NBACodeStars.teamsData.find(
    (team) => team["TeamID"] === parseInt(teamId)
  );

  const teamAbbreviation = teamDetailsObj["Key"];

  // Make async api call to get player details on page load
  const promise = [];
  promise.push(NBACodeStars.getPlayersByTeamBiodata(teamAbbreviation));
  promise.push(NBACodeStars.getPlayersByTeamStatsData(teamAbbreviation));

  const promises = Promise.all(promise);
  promises
    .then(() => {
      console.log(NBACodeStars.playerByTeamBiodata);
      console.log(NBACodeStars.playerByTeamStatsData);
    })
    .then(() => NBACodeStars.displayPlayerBio());

  // REMOVE: Temp bio data
  const tempBioData = [
    {
      PlayerID: 20000618,
      SportsDataID: "",
      Status: "Active",
      TeamID: 1,
      Team: "WAS",
      Jersey: 15,
      PositionCategory: "C",
      Position: "C",
      FirstName: "Robin",
      LastName: "Lopez",
      Height: 84,
      Weight: 281,
      BirthDate: "1988-04-01T00:00:00",
      BirthCity: "North Hollywood",
      BirthState: "CA",
      BirthCountry: "USA",
      HighSchool: null,
      College: "Stanford",
      Salary: 7300000,
      PhotoUrl:
        "https://s3-us-west-2.amazonaws.com/static.fantasydata.com/headshots/nba/low-res/20000618.png",
      Experience: 12,
      SportRadarPlayerID: "e521ef3c-7892-4f14-a560-df320872d59a",
      RotoworldPlayerID: 1494,
      RotoWirePlayerID: 2919,
      FantasyAlarmPlayerID: 200125,
      StatsPlayerID: 330050,
      SportsDirectPlayerID: 733290,
      XmlTeamPlayerID: 1950,
      InjuryStatus: "Scrambled",
      InjuryBodyPart: "Scrambled",
      InjuryStartDate: null,
      InjuryNotes: "Scrambled",
      FanDuelPlayerID: 9873,
      DraftKingsPlayerID: 330050,
      YahooPlayerID: 4477,
      FanDuelName: "Robin Lopez",
      DraftKingsName: "Robin Lopez",
      YahooName: "Robin Lopez",
      DepthChartPosition: "C",
      DepthChartOrder: 3,
      GlobalTeamID: 20000001,
      FantasyDraftName: "Robin Lopez",
      FantasyDraftPlayerID: 330050,
      UsaTodayPlayerID: 8247563,
      UsaTodayHeadshotUrl:
        "http://cdn.usatsimg.com/api/download/?imageID=13477370",
      UsaTodayHeadshotNoBackgroundUrl:
        "http://cdn.usatsimg.com/api/download/?imageID=13515111",
      UsaTodayHeadshotUpdated: "2019-10-09T17:16:12",
      UsaTodayHeadshotNoBackgroundUpdated: "2019-10-14T10:08:52",
      NbaDotComPlayerID: 201577,
    },
    {
      PlayerID: 20000901,
      SportsDataID: "",
      Status: "Active",
      TeamID: 1,
      Team: "WAS",
      Jersey: 14,
      PositionCategory: "G",
      Position: "PG",
      FirstName: "Ish",
      LastName: "Smith",
      Height: 72,
      Weight: 175,
      BirthDate: "1988-07-05T00:00:00",
      BirthCity: "Charlotte",
      BirthState: "NC",
      BirthCountry: "USA",
      HighSchool: null,
      College: "Wake Forest",
      Salary: 6000000,
      PhotoUrl:
        "https://s3-us-west-2.amazonaws.com/static.fantasydata.com/headshots/nba/low-res/20000901.png",
      Experience: 10,
      SportRadarPlayerID: "05a90cd6-73de-43d5-9d30-bc2588d03262",
      RotoworldPlayerID: 1781,
      RotoWirePlayerID: 3175,
      FantasyAlarmPlayerID: 200472,
      StatsPlayerID: 329873,
      SportsDirectPlayerID: 732747,
      XmlTeamPlayerID: 2930,
      InjuryStatus: "Scrambled",
      InjuryBodyPart: "Scrambled",
      InjuryStartDate: null,
      InjuryNotes: "Scrambled",
      FanDuelPlayerID: 12511,
      DraftKingsPlayerID: 329873,
      YahooPlayerID: 4800,
      FanDuelName: "Ish Smith",
      DraftKingsName: "Ish Smith",
      YahooName: "Ish Smith",
      DepthChartPosition: "PG",
      DepthChartOrder: 3,
      GlobalTeamID: 20000001,
      FantasyDraftName: "Ish Smith",
      FantasyDraftPlayerID: 329873,
      UsaTodayPlayerID: 8247574,
      UsaTodayHeadshotUrl:
        "http://cdn.usatsimg.com/api/download/?imageID=13477350",
      UsaTodayHeadshotNoBackgroundUrl:
        "http://cdn.usatsimg.com/api/download/?imageID=13514928",
      UsaTodayHeadshotUpdated: "2019-10-09T17:16:12",
      UsaTodayHeadshotNoBackgroundUpdated: "2019-10-14T10:01:44",
      NbaDotComPlayerID: 202397,
    },
    {
      PlayerID: 20001434,
      SportsDataID: "",
      Status: "Active",
      TeamID: 1,
      Team: "WAS",
      Jersey: 19,
      PositionCategory: "G",
      Position: "PG",
      FirstName: "Raul",
      LastName: "Neto",
      Height: 73,
      Weight: 180,
      BirthDate: "1992-05-19T00:00:00",
      BirthCity: "Belo Horizonte",
      BirthState: null,
      BirthCountry: "Brazil",
      HighSchool: null,
      College: "None",
      Salary: 1620564,
      PhotoUrl:
        "https://s3-us-west-2.amazonaws.com/static.fantasydata.com/headshots/nba/low-res/20001434.png",
      Experience: 5,
      SportRadarPlayerID: "8e7ffd66-f779-418c-bf18-b9f746a1c5fe",
      RotoworldPlayerID: 2216,
      RotoWirePlayerID: 3526,
      FantasyAlarmPlayerID: 200657,
      StatsPlayerID: 739966,
      SportsDirectPlayerID: 755629,
      XmlTeamPlayerID: null,
      InjuryStatus: "Scrambled",
      InjuryBodyPart: "Scrambled",
      InjuryStartDate: null,
      InjuryNotes: "Scrambled",
      FanDuelPlayerID: 40208,
      DraftKingsPlayerID: 739966,
      YahooPlayerID: 5217,
      FanDuelName: "Raul Neto",
      DraftKingsName: "Raul Neto",
      YahooName: "Raul Neto",
      DepthChartPosition: "SG",
      DepthChartOrder: 1,
      GlobalTeamID: 20000001,
      FantasyDraftName: "Raul Neto",
      FantasyDraftPlayerID: 739966,
      UsaTodayPlayerID: 8247567,
      UsaTodayHeadshotUrl:
        "http://cdn.usatsimg.com/api/download/?imageID=14627408",
      UsaTodayHeadshotNoBackgroundUrl:
        "http://cdn.usatsimg.com/api/download/?imageID=14627407",
      UsaTodayHeadshotUpdated: "2020-07-28T19:01:12",
      UsaTodayHeadshotNoBackgroundUpdated: "2020-07-28T19:01:11",
      NbaDotComPlayerID: 203526,
    },
    {
      PlayerID: 20001668,
      SportsDataID: "",
      Status: "Active",
      TeamID: 1,
      Team: "WAS",
      Jersey: 42,
      PositionCategory: "F",
      Position: "SF",
      FirstName: "Davis",
      LastName: "Bertans",
      Height: 82,
      Weight: 225,
      BirthDate: "1992-11-12T00:00:00",
      BirthCity: "Valmiera",
      BirthState: null,
      BirthCountry: "Latvia",
      HighSchool: null,
      College: "None",
      Salary: 15000000,
      PhotoUrl:
        "https://s3-us-west-2.amazonaws.com/static.fantasydata.com/headshots/nba/low-res/20001668.png",
      Experience: 4,
      SportRadarPlayerID: "c1bb78ed-4ce7-4e8c-b30c-06f8148d550a",
      RotoworldPlayerID: 1867,
      RotoWirePlayerID: 3215,
      FantasyAlarmPlayerID: 200918,
      StatsPlayerID: 599814,
      SportsDirectPlayerID: 749277,
      XmlTeamPlayerID: null,
      InjuryStatus: "Scrambled",
      InjuryBodyPart: "Scrambled",
      InjuryStartDate: null,
      InjuryNotes: "Scrambled",
      FanDuelPlayerID: 14543,
      DraftKingsPlayerID: 599814,
      YahooPlayerID: 4926,
      FanDuelName: "Davis Bertans",
      DraftKingsName: "Davis Bertans",
      YahooName: "Davis Bertans",
      DepthChartPosition: "SF",
      DepthChartOrder: 3,
      GlobalTeamID: 20000001,
      FantasyDraftName: "Davis Bertans",
      FantasyDraftPlayerID: 599814,
      UsaTodayPlayerID: 8247541,
      UsaTodayHeadshotUrl:
        "http://cdn.usatsimg.com/api/download/?imageID=13477422",
      UsaTodayHeadshotNoBackgroundUrl:
        "http://cdn.usatsimg.com/api/download/?imageID=13514935",
      UsaTodayHeadshotUpdated: "2019-10-09T17:16:12",
      UsaTodayHeadshotNoBackgroundUpdated: "2019-10-14T10:02:02",
      NbaDotComPlayerID: 202722,
    },
    {
      PlayerID: 20001852,
      SportsDataID: "",
      Status: "Active",
      TeamID: 1,
      Team: "WAS",
      Jersey: 13,
      PositionCategory: "C",
      Position: "C",
      FirstName: "Thomas",
      LastName: "Bryant",
      Height: 82,
      Weight: 248,
      BirthDate: "1997-07-31T00:00:00",
      BirthCity: "Rochester",
      BirthState: "NY",
      BirthCountry: "USA",
      HighSchool: null,
      College: "Indiana",
      Salary: 8333333,
      PhotoUrl:
        "https://s3-us-west-2.amazonaws.com/static.fantasydata.com/headshots/nba/low-res/20001852.png",
      Experience: 3,
      SportRadarPlayerID: "030424b9-7367-45e1-b9d4-c8dee3a89e53",
      RotoworldPlayerID: 2825,
      RotoWirePlayerID: 4155,
      FantasyAlarmPlayerID: 200978,
      StatsPlayerID: 896601,
      SportsDirectPlayerID: 766664,
      XmlTeamPlayerID: null,
      InjuryStatus: "Scrambled",
      InjuryBodyPart: "Scrambled",
      InjuryStartDate: null,
      InjuryNotes: "Scrambled",
      FanDuelPlayerID: 67312,
      DraftKingsPlayerID: 896601,
      YahooPlayerID: 5855,
      FanDuelName: "Thomas Bryant",
      DraftKingsName: "Thomas Bryant",
      YahooName: "Thomas Bryant",
      DepthChartPosition: null,
      DepthChartOrder: null,
      GlobalTeamID: 20000001,
      FantasyDraftName: "Thomas Bryant",
      FantasyDraftPlayerID: 896601,
      UsaTodayPlayerID: 8247548,
      UsaTodayHeadshotUrl:
        "http://cdn.usatsimg.com/api/download/?imageID=13477375",
      UsaTodayHeadshotNoBackgroundUrl:
        "http://cdn.usatsimg.com/api/download/?imageID=13514946",
      UsaTodayHeadshotUpdated: "2019-10-09T17:16:12",
      UsaTodayHeadshotNoBackgroundUpdated: "2019-10-14T10:02:30",
      NbaDotComPlayerID: 1628418,
    },
    {
      PlayerID: 20001852,
      SportsDataID: "",
      Status: "Active",
      TeamID: 1,
      Team: "WAS",
      Jersey: 13,
      PositionCategory: "C",
      Position: "C",
      FirstName: "Thomas",
      LastName: "Bryant",
      Height: 82,
      Weight: 248,
      BirthDate: "1997-07-31T00:00:00",
      BirthCity: "Rochester",
      BirthState: "NY",
      BirthCountry: "USA",
      HighSchool: null,
      College: "Indiana",
      Salary: 8333333,
      PhotoUrl:
        "https://s3-us-west-2.amazonaws.com/static.fantasydata.com/headshots/nba/low-res/20001852.png",
      Experience: 3,
      SportRadarPlayerID: "030424b9-7367-45e1-b9d4-c8dee3a89e53",
      RotoworldPlayerID: 2825,
      RotoWirePlayerID: 4155,
      FantasyAlarmPlayerID: 200978,
      StatsPlayerID: 896601,
      SportsDirectPlayerID: 766664,
      XmlTeamPlayerID: null,
      InjuryStatus: "Scrambled",
      InjuryBodyPart: "Scrambled",
      InjuryStartDate: null,
      InjuryNotes: "Scrambled",
      FanDuelPlayerID: 67312,
      DraftKingsPlayerID: 896601,
      YahooPlayerID: 5855,
      FanDuelName: "Thomas Bryant",
      DraftKingsName: "Thomas Bryant",
      YahooName: "Thomas Bryant",
      DepthChartPosition: null,
      DepthChartOrder: null,
      GlobalTeamID: 20000001,
      FantasyDraftName: "Thomas Bryant",
      FantasyDraftPlayerID: 896601,
      UsaTodayPlayerID: 8247548,
      UsaTodayHeadshotUrl:
        "http://cdn.usatsimg.com/api/download/?imageID=13477375",
      UsaTodayHeadshotNoBackgroundUrl:
        "http://cdn.usatsimg.com/api/download/?imageID=13514946",
      UsaTodayHeadshotUpdated: "2019-10-09T17:16:12",
      UsaTodayHeadshotNoBackgroundUpdated: "2019-10-14T10:02:30",
      NbaDotComPlayerID: 1628418,
    },
  ];
  // NBACodeStars.playerByTeamBiodata = tempBioData;
  // NBACodeStars.displayPlayerBio();

  //  - Stats data shown (2020-2021 Regular Season stats)
  //    - Games
  //    - Started
  //    - Minutes / Games
  //    - FieldGoalsPercentage
  //    - ThreePointersPercentage
  //    - FreeThrowsPercentage
  //    - Points / Games
  //    - Rebounds / Games
  //    - Assists / Games
  //    - Steals / Games
  //    - BlockedShots / Games
  //    - Turnovers / Games
  //    - FantasyPointsDraftKings
  //    - FantasyPointsFanDuel
  //    - FantasyPointsFantasyDraft
  //    - FantasyPointsYahoo

  // Internal table fixed with same elements for player img, name
  //  - make div position absolute
};

// Function to create and display the table that displays player bio data
NBACodeStars.displayPlayerBio = () => {
  // Mapping array used to align table heading / table data / api keys for loops
  const bioTableMap = [
    { header: "Player", className: "player", key: null },
    { header: "Position", className: "position", key: "Position" },
    { header: "Jersey", className: "jersey", key: "Jersey" },
    { header: "Birthday", className: "birthday", key: "BirthDate" },
    { header: "Country", className: "birthCountry", key: "BirthCountry" },
    { header: "Experience", className: "experience", key: "Experience" },
    { header: "Salary", className: "salary", key: "Salary" },
  ];

  // table header data
  const tableHeadEl = NBACodeStars.createBioTableHead(bioTableMap);
  tableHeadEl.classList.add("rosterTableHead");

  // table body data
  const tableBodyEl = NBACodeStars.createBioTableBody(bioTableMap);
  tableBodyEl.classList.add("rosterTableBody");

  // table
  const tableEl = document.createElement("table");
  tableEl.append(tableHeadEl);
  tableEl.append(tableBodyEl);

  // table vertical scrollbar
  const tableScrollEl = document.createElement("div");
  tableScrollEl.classList.add("rosterTableScroll");
  tableScrollEl.append(tableEl);

  // table container
  const tableContainerEl = document.createElement("div");
  tableContainerEl.classList.add("rosterTableContainer");
  tableContainerEl.append(tableScrollEl);

  // roster header
  const headerEl = document.createElement("div");
  headerEl.classList.add("rosterHeader");

  // roster container
  const playerDetailsContainerEl = document.querySelector(
    ".playerDetailsContainer"
  );
  playerDetailsContainerEl.append(headerEl);
  playerDetailsContainerEl.append(tableContainerEl);
};

// Function to create the table heading for the bio data table
NBACodeStars.createBioTableHead = (bioTableMap) => {
  const tableHeadEl = document.createElement("thead");
  const trEl = document.createElement("tr");

  // Loop through each heading and create a th element with the class name
  bioTableMap.forEach((obj) => {
    const { header, className } = obj;

    const thEl = document.createElement("th");
    thEl.innerText = header;
    thEl.classList.add(className);
    trEl.append(thEl);
  });

  tableHeadEl.append(trEl);
  return tableHeadEl;
};

// Function to create the table body for the bio data table
NBACodeStars.createBioTableBody = (bioTableMap) => {
  const tableBodyEl = document.createElement("tbody");

  // Loop through each player received from the API pull and create a table row for each one
  NBACodeStars.playerByTeamBiodata.forEach((player) => {
    const { PlayerID, PhotoUrl, FirstName, LastName } = player;

    // Player name
    const imgEl = document.createElement("img");
    imgEl.setAttribute("src", PhotoUrl);
    imgEl.setAttribute("alt", `${FirstName} ${LastName}`);

    const imgContainer = document.createElement("div");
    imgContainer.append(imgEl);
    imgContainer.classList.add("playerImg");

    const firstNameEl = document.createElement("span");
    firstNameEl.textContent = FirstName;

    const lastNameEl = document.createElement("span");
    lastNameEl.textContent = LastName;

    const nameContainerEl = document.createElement("div");
    nameContainerEl.append(firstNameEl);
    nameContainerEl.append(lastNameEl);
    nameContainerEl.classList.add("nameContainer");

    const playerNameTdEl = document.createElement("td");
    playerNameTdEl.append(imgContainer);
    playerNameTdEl.append(nameContainerEl);
    playerNameTdEl.classList.add("player");

    // Create the table row for the player
    const trEl = document.createElement("tr");
    trEl.setAttribute("data-playerId", PlayerID);
    trEl.append(playerNameTdEl);

    // Loop through each player bio data point to create and display a td element
    bioTableMap.forEach((obj) => {
      const { className, key } = obj;

      if (key !== null) {
        let data = player[key];
        let formatData = "N/A";
        const tdEl = document.createElement("td");

        // Error handling: proceed if data has a value
        if (data) {
          // Format api data based on the nature of the data
          if (key === "BirthDate") {
            formatData = data.split("T")[0];
          } else if (key === "Salary") {
            formatData = NBACodeStars.numberWithCommas(data);
          } else {
            formatData = data;
          }
        }

        tdEl.textContent = formatData;
        tdEl.classList.add(className);
        trEl.append(tdEl);
      }
    });

    tableBodyEl.append(trEl);
  });

  return tableBodyEl;
};

// Function to add commas to a number
// Credits to stackoverflow author for providing this function: https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
NBACodeStars.numberWithCommas = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// 0. Calling the init to hit it off
NBACodeStars.init();

// TODO:
// Error handling on data not loading or data missing
// Format the bio modal
//  - have a darker hover state over the cell highlighted
//  - add scroll bar to modal
// Create a button on the modal to flip between stats and bio data
// Display stats data when stats button is clicked
//  - Format stats data
// Error handling when trying to retrieve roster stats
// Loading spinner

// STRETCH GOALS
//  1. Show players to the user after they have clicked the show player button.
// 	2. Create event listener to listen for the click on the specific team. Use the event variable to extract the ID of the element that the user clicked.
// 	     a. Filter the player details variable to extract all the players that have the same team ID as what we extracted.
// 	      b. Save the player names in  a separate variable
// 	3. Create html elements to store players first name, last name and position.
// 	4. Display on screen over the team image container. Create link for each player to show their stats.
// 	5. Make API Call to retrieve player headshot and create an html element that displays with player name on the screen.
// FINAL STRETCH GOALS 2 MORE STRETCHY
// 	1. Display player stats
// 		2. Populate the link on each player so their individual stats are shown: points, rebounds, assists, blocks, steals, field goal percentage, turnover.
// FUN STRETCH GOAL
// 	1. Cage Finder!
// 	2. A button in the top right hand corner of the screen with Nicholas Cages face that says CAGE FINDER
// 	3. It throws up 10 movie posters of Nicholas Cage with titles
// 	4. There is a button that says back to basketball which takes us back to the original site.
