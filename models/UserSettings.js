const mongoose = require('mongoose');

const UserSettingsSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    integrationSettings: {
        selectedWebsiteId: {
            type: String,
            default: null,
            description: 'ID of the website selected for SDK integration'
        },
        selectedWebsiteUrl: {
            type: String,
            default: null,
            description: 'URL of the selected website for reference'
        },
        themeChoice: {
            type: String,
            enum: ['default', 'website'],
            default: 'default',
            description: 'User\'s theme preference from integration page'
        },
        customizations: {
            title: {
                type: String,
                default: 'ChatFlow AI Assistant'
            },
            placeholder: {
                type: String,
                default: 'Ask me anything about this website...'
            },
            position: {
                type: String,
                enum: ['bottom-right', 'bottom-left'],
                default: 'bottom-right'
            }
        }
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Update lastUpdated on save
UserSettingsSchema.pre('save', function(next) {
    this.lastUpdated = new Date();
    next();
});

// Static method to get or create settings for a user
UserSettingsSchema.statics.getOrCreateSettings = async function(userId) {
    try {
        let settings = await this.findOne({ userId });
        if (!settings) {
            settings = new this({ userId });
            await settings.save();
        }
        return settings;
    } catch (error) {
        throw error;
    }
};

// Static method to update integration settings
UserSettingsSchema.statics.updateIntegrationSettings = async function(userId, settingsUpdate) {
    try {
        const settings = await this.getOrCreateSettings(userId);
        
        // Update integration settings
        Object.keys(settingsUpdate).forEach(key => {
            if (settings.integrationSettings[key] !== undefined) {
                settings.integrationSettings[key] = settingsUpdate[key];
            }
        });
        
        await settings.save();
        return settings;
    } catch (error) {
        throw error;
    }
};

module.exports = mongoose.model('UserSettings', UserSettingsSchema);