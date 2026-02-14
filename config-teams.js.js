// config-teams.js - Configuración de equipos por liga
const TeamsConfig = {
    NCAA: {
        teams: {
            "ALA": { "name": "Alabama Crimson Tide" },
            "ARI": { "name": "Arizona Wildcats" },
            "AUB": { "name": "Auburn Tigers" },
            "BAY": { "name": "Baylor Bears" },
            "CLE": { "name": "Clemson Tigers" },
            "DUK": { "name": "Duke Blue Devils" },
            "FLA": { "name": "Florida Gators" },
            "FSU": { "name": "Florida State Seminoles" },
            "GEO": { "name": "Georgia Bulldogs" },
            "IND": { "name": "Indiana Hoosiers" },
            "IOW": { "name": "Iowa Hawkeyes" },
            "KAN": { "name": "Kansas Jayhawks" },
            "KEN": { "name": "Kentucky Wildcats" },
            "LSU": { "name": "LSU Tigers" },
            "MRY": { "name": "Maryland Terrapins" },
            "MIC": { "name": "Michigan Wolverines" },
            "MSU": { "name": "Michigan State Spartans" },
            "NDM": { "name": "Notre Dame Fighting Irish" },
            "UNC": { "name": "North Carolina Tar Heels" },
            "OSU": { "name": "Ohio State Buckeyes" },
            "OKL": { "name": "Oklahoma Sooners" },
            "ORE": { "name": "Oregon Ducks" },
            "PSU": { "name": "Penn State Nittany Lions" },
            "SYR": { "name": "Syracuse Orange" },
            "TAM": { "name": "Texas A&M Aggies" },
            "TEX": { "name": "Texas Longhorns" },
            "TEN": { "name": "Tennessee Volunteers" },
            "UCLA": { "name": "UCLA Bruins" },
            "USC": { "name": "USC Trojans" },
            "UVA": { "name": "Virginia Cavaliers" },
            "WAS": { "name": "Washington Huskies" },
            "WIS": { "name": "Wisconsin Badgers" }
        }
    },
    
    NBA: {
        teams: {
            "ATL": { "name": "Atlanta Hawks" },
            "BOS": { "name": "Boston Celtics" },
            "BRK": { "name": "Brooklyn Nets" },
            "CHA": { "name": "Charlotte Hornets" },
            "CHI": { "name": "Chicago Bulls" },
            "CLE": { "name": "Cleveland Cavaliers" },
            "DAL": { "name": "Dallas Mavericks" },
            "DEN": { "name": "Denver Nuggets" },
            "DET": { "name": "Detroit Pistons" },
            "GSW": { "name": "Golden State Warriors" },
            "HOU": { "name": "Houston Rockets" },
            "IND": { "name": "Indiana Pacers" },
            "LAC": { "name": "Los Angeles Clippers" },
            "LAL": { "name": "Los Angeles Lakers" },
            "MEM": { "name": "Memphis Grizzlies" },
            "MIA": { "name": "Miami Heat" },
            "MIL": { "name": "Milwaukee Bucks" },
            "MIN": { "name": "Minnesota Timberwolves" },
            "NOP": { "name": "New Orleans Pelicans" },
            "NYK": { "name": "New York Knicks" },
            "OKC": { "name": "Oklahoma City Thunder" },
            "ORL": { "name": "Orlando Magic" },
            "PHI": { "name": "Philadelphia 76ers" },
            "PHX": { "name": "Phoenix Suns" },
            "POR": { "name": "Portland Trail Blazers" },
            "SAC": { "name": "Sacramento Kings" },
            "SAS": { "name": "San Antonio Spurs" },
            "TOR": { "name": "Toronto Raptors" },
            "UTA": { "name": "Utah Jazz" },
            "WAS": { "name": "Washington Wizards" }
        }
    },
    
    NFL: {
        teams: {
            "ARI": { "name": "Arizona Cardinals" },
            "ATL": { "name": "Atlanta Falcons" },
            "BAL": { "name": "Baltimore Ravens" },
            "BUF": { "name": "Buffalo Bills" },
            "CAR": { "name": "Carolina Panthers" },
            "CHI": { "name": "Chicago Bears" },
            "CIN": { "name": "Cincinnati Bengals" },
            "CLE": { "name": "Cleveland Browns" },
            "DAL": { "name": "Dallas Cowboys" },
            "DEN": { "name": "Denver Broncos" },
            "DET": { "name": "Detroit Lions" },
            "GBP": { "name": "Green Bay Packers" },
            "HOU": { "name": "Houston Texans" },
            "IND": { "name": "Indianapolis Colts" },
            "JAG": { "name": "Jacksonville Jaguars" },
            "KCC": { "name": "Kansas City Chiefs" },
            "LAC": { "name": "Los Angeles Chargers" },
            "LVR": { "name": "Las Vegas Raiders" },
            "MIA": { "name": "Miami Dolphins" },
            "MIN": { "name": "Minnesota Vikings" },
            "NEP": { "name": "New England Patriots" },
            "NOS": { "name": "New Orleans Saints" },
            "NYG": { "name": "New York Giants" },
            "NYJ": { "name": "New York Jets" },
            "PHI": { "name": "Philadelphia Eagles" },
            "PIT": { "name": "Pittsburgh Steelers" },
            "RAM": { "name": "Los Angeles Rams" },
            "SEA": { "name": "Seattle Seahawks" },
            "SF9": { "name": "San Francisco 49ers" },
            "TBB": { "name": "Tampa Bay Buccaneers" },
            "TEN": { "name": "Tennessee Titans" },
            "WAS": { "name": "Washington Commanders" }
        }
    }
};

// Función helper para buscar equipos
TeamsConfig.findTeam = function(code) {
    const leagues = ['NCAA', 'NBA', 'NFL'];
    for (const league of leagues) {
        if (this[league] && this[league].teams && this[league].teams[code]) {
            return {
                name: this[league].teams[code].name,
                league: league
            };
        }
    }
    return null;
};

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.TeamsConfig = TeamsConfig;
}

// Exportar para Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TeamsConfig;
}