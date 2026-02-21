// Módulo para parsear y detectar equipos
import { appState } from './state.js';

export class TeamParser {
    constructor() {
        this.teamCache = new Map();
    }

    detectTeamFromStyle(style) {
        if (!style || typeof style !== 'string') return '';
        
        const upperStyle = style.toUpperCase();
        const teams = appState.getTeams();
        
        if (!teams) return '';
        
        // Buscar en todas las ligas
        for (const league of Object.values(teams)) {
            for (const [teamCode, teamData] of Object.entries(league)) {
                // Verificar código del equipo
                if (upperStyle.includes(teamCode)) {
                    return teamData.name;
                }
                
                // Verificar abreviaturas
                if (teamData.abbreviations) {
                    for (const abbr of teamData.abbreviations) {
                        if (upperStyle.includes(abbr.toUpperCase())) {
                            return teamData.name;
                        }
                    }
                }
                
                // Verificar palabras clave del nombre
                const nameWords = teamData.name.toUpperCase().split(' ');
                for (const word of nameWords) {
                    if (word.length > 3 && upperStyle.includes(word)) {
                        return teamData.name;
                    }
                }
            }
        }
        
        return '';
    }

    extractGenderFromStyle(style) {
        if (!style) return '';
        
        const upperStyle = style.toUpperCase();
        
        if (upperStyle.includes('MENS') || upperStyle.includes('MEN') || 
            upperStyle.includes('HOMBRE') || upperStyle.includes('MALE')) {
            return 'MENS';
        }
        
        if (upperStyle.includes('WOMENS') || upperStyle.includes('WOMEN') || 
            upperStyle.includes('LADIES') || upperStyle.includes('DAMA')) {
            return 'WOMENS';
        }
        
        if (upperStyle.includes('YOUTH') || upperStyle.includes('KIDS') || 
            upperStyle.includes('NIÑO') || upperStyle.includes('NIÑA')) {
            return 'YOUTH';
        }
        
        return '';
    }

    findTeamByAbbreviation(abbr) {
        if (!abbr) return null;
        
        // Verificar cache primero
        if (this.teamCache.has(abbr)) {
            return this.teamCache.get(abbr);
        }
        
        const teams = appState.getTeams();
        if (!teams) return null;
        
        const upperAbbr = abbr.toUpperCase().trim();
        
        for (const league of Object.values(teams)) {
            for (const teamData of Object.values(league)) {
                // Verificar código exacto
                if (teamData.code?.toUpperCase() === upperAbbr) {
                    this.teamCache.set(abbr, teamData);
                    return teamData;
                }
                
                // Verificar abreviaturas
                if (teamData.abbreviations?.some(a => a.toUpperCase() === upperAbbr)) {
                    this.teamCache.set(abbr, teamData);
                    return teamData;
                }
                
                // Verificar en el nombre
                if (teamData.name?.toUpperCase().includes(upperAbbr)) {
                    this.teamCache.set(abbr, teamData);
                    return teamData;
                }
            }
        }
        
        return null;
    }

    getTeamColors(teamName) {
        const teams = appState.getTeams();
        if (!teams) return {};
        
        for (const league of Object.values(teams)) {
            for (const teamData of Object.values(league)) {
                if (teamData.name === teamName && teamData.colors) {
                    return teamData.colors;
                }
            }
        }
        
        return {};
    }

    // Método para procesar datos de Excel y detectar información del equipo
    processExcelData(data, sheetName = '') {
        const result = {
            team: '',
            gender: '',
            isGearForSport: false
        };
        
        if (!data || !Array.isArray(data)) return result;
        
        // Detectar Gear for Sport
        const isSWOSheet = sheetName.includes('SWO');
        const isPPSSheet = sheetName.includes('PPS');
        
        if (isSWOSheet || isPPSSheet) {
            for (let i = 0; i < data.length; i++) {
                const row = data[i];
                if (!row || row.length < 2) continue;
                
                const label = String(row[1] || '').trim();
                const val = String(row[2] || '').trim();
                
                if (label.includes('CUSTOMER:')) {
                    const customer = val.toUpperCase();
                    if (customer.includes('GEAR FOR SPORT') || 
                        customer.includes('GEARFORSPORT') ||
                        customer.includes('GFS')) {
                        result.isGearForSport = true;
                    }
                }
                
                if (label.includes('STYLE:')) {
                    result.team = this.detectTeamFromStyle(val);
                    result.gender = this.extractGenderFromStyle(val);
                }
            }
        } else {
            // Buscar en todo el sheet
            for (let i = 0; i < data.length; i++) {
                const row = data[i];
                if (!row) continue;
                
                for (let j = 0; j < row.length; j++) {
                    const cell = String(row[j] || '').trim();
                    
                    if (cell.includes('STYLE:')) {
                        const style = String(row[j + 1] || '').trim();
                        result.team = this.detectTeamFromStyle(style);
                        break;
                    }
                }
            }
        }
        
        return result;
    }

    // Limpiar cache
    clearCache() {
        this.teamCache.clear();
    }
}

// Instancia singleton
export const teamParser = new TeamParser();
