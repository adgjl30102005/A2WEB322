const projectData = require("../data/projectData");
const sectorData = require("../data/sectorData");
let projects = [];

function initialize() {
    try {
        // Merge sector_name into projectData using find and forEach
        projects = [];
        projectData.forEach(project => {
            const sector = sectorData.find(sector => sector.id === project.sector_id);
            projects.push({
                ...project,
                sector: sector ? sector.sector_name : 'Unknown'
            });
        });

        return projects;
    } catch (error) {
        console.error("Error initializing data:", error);
        return null;
    }
}
function getAllProjects() {
    return projects;
}

function getProjectById(projectId) {
    return projects.find(project => project.id === projectId) || null;
}

function getProjectsBySector(sector) {
    return projects.filter(project => 
        project.sector.toLowerCase().includes(sector.toLowerCase())
    );
}

module.exports = { initialize, getAllProjects, getProjectById, getProjectsBySector }