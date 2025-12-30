const { sequelize, Team } = require('./src/models');

async function testDB() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');
    
    // Get all teams
    const teams = await Team.findAll({ raw: true });
    console.log('\n=== ALL TEAMS ===');
    teams.forEach(t => {
      console.log(`ID: ${t.id}, Name: ${t.name}, isActive: ${t.isActive || t.is_active}, Created: ${t.createdAt}`);
    });
    
    // Try to update a team
    if (teams.length > 0) {
      const firstTeam = teams[0];
      console.log(`\n=== TESTING UPDATE ===`);
      console.log(`Updating team ${firstTeam.id} (${firstTeam.name})`);
      
      const team = await Team.findByPk(firstTeam.id);
      console.log(`Before update - isActive: ${team.isActive}`);
      
      await team.update({ isActive: false });
      console.log(`After update - isActive: ${team.isActive}`);
      
      // Verify in database
      const verified = await Team.findByPk(firstTeam.id);
      console.log(`After verify fetch - isActive: ${verified.isActive}`);
      
      // Reset
      await verified.update({ isActive: true });
      console.log(`Reset - isActive: ${verified.isActive}`);
    }
    
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

testDB();
