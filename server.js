/********************************************************************************
*  WEB322 – Assignment 03
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Thien Phuc Ngo Student ID: 115294233 Date: 05/12/2025
*  Published URL:https://a3-m0dp.onrender.com/
*
********************************************************************************/

const projectData = require("./modules/projects");
const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

require('dotenv').config();
const clientSessions = require("client-sessions");

app.use(clientSessions({
    cookieName: "session",
    secret: process.env.SESSIONSECRET,
    duration: 2 * 60 * 60 * 1000,
    activeDuration: 1000 * 60 * 5
}));

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

function ensureLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    next();
}

// Routes
app.get('/', (req, res) => {

    projectData.getAllProjects()
    .then(projects => {

        projects.sort((a, b) => a.id - b.id);

        res.render('home', { projects: projects.slice(0, 3) });
    })
    .catch(err => {
        res.render("500", { message: err });
    });

});
app.get('/about', (req, res) => {
     res.render('about');
});

app.get('/solutions/projects', (req, res) => {

    const sector = req.query.sector;

    if (sector) {
        projectData.getProjectsBySector(sector)
        .then(projects => {
            res.render('projects', { projects });
        })
        .catch(err => {
            res.status(404).render('404', { message: err });
        });
    } else {
        projectData.getAllProjects()
        .then(projects => {
            res.render('projects', { projects });
        })
        .catch(err => {
            res.render("500", { message: err });
        });
    }
});

app.get('/solutions/projects/:id', (req, res) => {

    projectData.getProjectById(req.params.id)
    .then(project => {
        res.render('project', { project });
    })
    .catch(err => {
        res.status(404).render('404', { message: err });
    });

});

app.get("/solutions/addProject", ensureLogin, (req, res) => {

    projectData.getAllSectors()
    .then(sectors => {
        res.render("addProject", { sectors });
    })
    .catch(err => {
        res.render("500", { message: err });
    });

});

app.post("/solutions/addProject", ensureLogin, (req, res) => {

    projectData.addProject(req.body)
    .then(() => {
        res.redirect("/solutions/projects");
    })
    .catch(err => {
        res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
    });

});

app.get("/solutions/editProject/:id", ensureLogin, (req, res) => {

    Promise.all([
        projectData.getProjectById(req.params.id),
        projectData.getAllSectors()
    ])
    .then(([project, sectors]) => {
        res.render("editProject", { project, sectors });
    })
    .catch(err => {
        res.status(404).render("404", { message: err });
    });

});

app.post("/solutions/editProject", ensureLogin, (req, res) => {

    projectData.editProject(req.body.id, req.body)
    .then(() => {
        res.redirect("/solutions/projects");
    })
    .catch(err => {
        res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
    });

});

app.get("/logout", (req, res) => {
    req.session.reset();
    res.redirect("/");
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
        userName
    });

});

app.get("/solutions/deleteProject/:id", ensureLogin, (req, res) => {

    projectData.deleteProject(req.params.id)
    .then(() => {
        res.redirect("/solutions/projects");
    })
    .catch(err => {
        res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
    });

});

app.use((req, res) => {
    res.status(404).render('404', { message: "Sorry, we can't find the page you're looking for." });
});

projectData.initialize()
.then(() => {
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
})
.catch(err => {
    console.log("Unable to start server: " + err);
});
