/********************************************************************************
*  WEB322 – Assignment 02
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Thien Phuc Ngo Student ID: 115294233 Date: 07/11/2025
*  Published URL:https://a3-m0dp.onrender.com/
*
********************************************************************************/

const projectData = require("./modules/projects");
const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// Middleware to serve static files from the "public" folder
app.use(express.static('public'));
app.use(express.json()); // Middleware to parse JSON request bodies

require('dotenv').config();
const clientSessions = require("client-sessions");

app.use(clientSessions({
    cookieName: "session",
    secret: process.env.SESSIONSECRET,
    duration: 2 * 60 * 60 * 1000,      // 2 hours
    activeDuration: 1000 * 60 * 5      // extend by 5 min
}));

// Make session available in all views
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

const projects = projectData.initialize()

function ensureLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    next();
}

// Routes
app.get('/', (req, res) => {

    res.render('home', { projects: [
        projectData.getProjectById(1),
        projectData.getProjectById(2),
        projectData.getProjectById(3)
    ] });
});

app.get('/about', (req, res) => {
     res.render('about'); // res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/solutions/projects', (req, res) => {
    const sector = req.query.sector;
    if (sector) {
        const filteredProjects = projectData.getProjectsBySector(sector);

        if (filteredProjects.length === 0) {
            return res.status(404).render('404', { message: `Sorry, no projects found for the sector: ${sector}` });
        }

        return res.render('projects', { projects: filteredProjects });
    }

    // If no sector filter is applied, show all projects
    res.render('projects', { projects: projects });
});

app.get('/solutions/projects/:id', (req, res) => {
    const projectId = parseInt(req.params.id);
    const project = projectData.getProjectById(projectId);

    if (!project) {
        return res.status(404).render('404', { message: `Sorry, we can't find the project with the correspond ID: ${projectId}` });
    }

    res.render('project', { project: project });
});

app.get("/solutions/addProject", ensureLogin, (req, res) => {
    projects.getAllSectors()
        .then(sectors => {
            res.render("addProject", { sectors });
        })
        .catch(err => {
            res.render("500", { message: err });
        });
});

app.post("/solutions/addProject", ensureLogin, (req, res) => {
    projects.addProject(req.body)
        .then(() => {
            res.redirect("/solutions/projects");
        })
        .catch(err => {
            res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
        });
});

app.get("/solutions/editProject/:id", ensureLogin, (req, res) => {
    const projectId = req.params.id;

    Promise.all([
        projects.getProjectById(projectId),
        projects.getAllSectors()
    ])
    .then(([project, sectors]) => {
        res.render("editProject", { project, sectors });
    })
    .catch(err => {
        res.status(404).render("404", { message: err });
    });
});


app.post("/solutions/editProject", ensureLogin, (req, res) => {
    projects.editProject(req.body.id, req.body)
        .then(() => res.redirect("/solutions/projects"))
        .catch(err => {
            res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
        });
});

app.get("/login", (req, res) => {
    res.render("login", { 
        errorMessage: "", 
        userName: "" 
    });
});

app.post("/login", (req, res) => {
    const { userName, password } = req.body;

    if (userName === process.env.ADMINUSER && password === process.env.ADMINPASSWORD) {

        req.session.user = { userName };

        return res.redirect("/solutions/projects");
    }

    res.render("login", {
        errorMessage: "Invalid User Name or Password",
        userName: userName
    });
});

app.get("/logout", (req, res) => {
    req.session.reset();
    res.redirect("/");
});
// 404 Route
app.use((req, res) => {
    res.status(404).render('404', { message: "Sorry, we can't find the page you're looking for." });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
