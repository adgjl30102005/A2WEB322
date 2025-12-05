require('dotenv').config(); 

require('pg');              
const Sequelize = require('sequelize');

let sequelize = new Sequelize(
  process.env.PGDATABASE,
  process.env.PGUSER,
  process.env.PGPASSWORD,
  {
    host: process.env.PGHOST,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

// model

const Sector = sequelize.define("Sector", {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  sector_name: Sequelize.STRING
}, { timestamps: false });

const Project = sequelize.define("Project", {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  title: Sequelize.STRING,
  feature_img_url: Sequelize.STRING,
  summary_short: Sequelize.TEXT,
  intro_short: Sequelize.TEXT,
  impact: Sequelize.TEXT,
  original_source_url: Sequelize.STRING,
  sector_id: Sequelize.INTEGER     
}, { timestamps: false });

Project.belongsTo(Sector, { foreignKey: 'sector_id' });

// function

// initialize()
function initialize() {
  return sequelize.sync()
    .then(() => {})
    .catch(err => { throw err; });
}

// getAllProjects()
function getAllProjects() {
  return Project.findAll({
    include: [Sector]
  });
}

// getProjectById(id)
function getProjectById(id) {
  return Project.findAll({
    include: [Sector],
    where: { id: id }
  })
  .then(data => {
    if (data.length > 0) return data[0];
    throw "Unable to find requested project";
  });
}

// getProjectsBySector(sector)
function getProjectsBySector(sector) {
  return Project.findAll({
    include: [Sector],
    where: {
      '$Sector.sector_name$': {
        [Sequelize.Op.iLike]: `%${sector}%`
      }
    }
  })
  .then(data => {
    if (data.length > 0) return data;
    throw "Unable to find requested projects";
  });
}

// addProject(data)
function addProject(projectData) {
  return Project.create(projectData)
    .catch(err => {
      throw err.errors[0].message;
    });
}

// editProject(id, data)
function editProject(id, projectData) {
  return Project.update(projectData, { where: { id } })
    .catch(err => {
      throw err.errors[0].message;
    });
}

// deleteProject(id)
function deleteProject(id) {
  return Project.destroy({ where: { id } })
    .catch(err => {
      throw err.errors[0].message;
    });
}

// getAllSectors()
function getAllSectors() {
  return Sector.findAll();
}

module.exports = {
  initialize,
  getAllProjects,
  getProjectById,
  getProjectsBySector,
  addProject,
  editProject,
  deleteProject,
  getAllSectors
};
