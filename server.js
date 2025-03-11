/********************************************************************************
*  WEB322 – Assignment 04
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Thien Phuc Ngo Student ID: 115294233 Date: 10/03/2025
*
********************************************************************************/

const projectData = require("./modules/projects");
const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Middleware to serve static files from the "public" folder
app.use(express.static('public'));
app.use(express.json()); // Middleware to parse JSON request bodies

// Sample project data
const projects = [
    { id: 1, title: "Solar Panels Initiative", sector: "energy", feature_img_url: "/images/solar.jpg", summary_short: "Harnessing solar power for a greener future." },
    { id: 2, title: "Green Manufacturing", sector: "industry", feature_img_url: "/images/industry.jpg", summary_short: "Sustainable production practices." },
    { id: 3, title: "Urban Reforestation", sector: "environment", feature_img_url: "/images/trees.jpg", summary_short: "Planting trees to combat climate change." }
];

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/solutions/projects', (req, res) => {
    const sector = req.query.sector;
    let filteredProjects = projects;

    if (sector) {
        filteredProjects = projects.filter(p => p.sector === sector);
        if (filteredProjects.length === 0) {
            return res.status(404).json({ message: "No projects found for this sector.", student: "Your Name", student_id: "Your ID", timestamp: new Date().toISOString() });
        }
    }

    res.json({ projects: filteredProjects, student: "Your Name", student_id: "Your ID", timestamp: new Date().toISOString() });
});

app.get('/solutions/projects/:id', (req, res) => {
    const projectId = parseInt(req.params.id);
    const project = projects.find(p => p.id === projectId);

    if (!project) {
        return res.status(404).json({ message: "Project not found.", student: "Your Name", student_id: "Your ID", timestamp: new Date().toISOString() });
    }

    res.json({ project, student: "Your Name", student_id: "Your ID", timestamp: new Date().toISOString() });
});

// POST route at /post-request
app.post('/post-request', (req, res) => {
    res.json({
        student: "Your Name",
        student_id: "Your ID",
        timestamp: new Date().toISOString(),
        request_body: req.body
    });
});

// 404 Route
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
