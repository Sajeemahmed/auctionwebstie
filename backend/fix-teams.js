const { sequelize, Team } = require('./src/models');

async function fixNullValues() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');
    
    // Fix NULL isActive values
    console.log('\n=== FIXING NULL isActive VALUES ===');
    const result = await sequelize.query(
      `UPDATE teams SET is_active = 1 WHERE is_active IS NULL`,
      { type: 'UPDATE' }
    );
    console.log(`Updated ${result[1].affectedRows} teams with NULL isActive`);
    
    // Verify the fix
    const teams = await Team.findAll({ raw: true });
    console.log('\n=== TEAMS AFTER FIX ===');
    teams.forEach(t => {
      console.log(`ID: ${t.id}, Name: ${t.name}, isActive: ${t.isActive}`);
    });
    
    await sequelize.close();
    console.log('\n✅ Fix completed!');
  } catch (error) {
    console.error('Error:', error);
  }
}

fixNullValues();
