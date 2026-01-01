// src/models/Team.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Team = sequelize.define('teams', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    seasonId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'season_id'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    shortName: {
      type: DataTypes.STRING(20),
      field: 'short_name'
    },
    logoUrl: {
      type: DataTypes.STRING(255),
      field: 'logo_url'
    },
    ownerId: {
      type: DataTypes.INTEGER,
      field: 'owner_id'
    },
    ownerName: {
      type: DataTypes.STRING(100),
      field: 'owner_name'
    },
    tagline: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    logoImage: {
      type: DataTypes.STRING(255),
      field: 'logo_image'
    },
    sponsors: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('sponsors');
        if (!rawValue) return [];
        try {
          return typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue;
        } catch (e) {
          return [];
        }
      },
      set(value) {
        if (Array.isArray(value)) {
          this.setDataValue('sponsors', JSON.stringify(value));
        } else if (typeof value === 'string') {
          this.setDataValue('sponsors', value);
        } else {
          this.setDataValue('sponsors', '[]');
        }
      }
    },
    initialPurse: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 10000000.00,
      field: 'initial_purse'
    },
    remainingPurse: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 10000000.00,
      field: 'remaining_purse'
    },
    maxSquadSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 15,
      field: 'max_squad_size'
    },
    currentSquadSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'current_squad_size'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    tableName: 'teams',
    timestamps: true,
    underscored: false,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['season_id'] },
      { fields: ['owner_id'] },
      { fields: ['name'] },
      { fields: ['remaining_purse'] },
      { fields: ['owner_name'] }
    ]
  });

  return Team;
};