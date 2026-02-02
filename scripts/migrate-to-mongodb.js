const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const database = require('../config/database');
const ScrapedData = require('../models/ScrapedData');
const Session = require('../models/Session');

class DataMigration {
    constructor() {
        this.storageDir = path.join(__dirname, '../storage/scraped-data');
        this.indexFile = path.join(__dirname, '../storage/index.json');
        this.dataFile = path.join(__dirname, '../storage/data.json');
    }

    async migrate() {
        try {
            console.log('🚀 Starting migration to MongoDB...\n');
            
            // Connect to database
            await database.connect();
            
            // Check if migration has already been done
            const existingScrapedData = await ScrapedData.countDocuments();
            const existingSessions = await Session.countDocuments();
            
            if (existingScrapedData > 0 || existingSessions > 0) {
                console.log('⚠️  MongoDB already contains data:');
                console.log(`   - ${existingScrapedData} scraped data documents`);
                console.log(`   - ${existingSessions} session documents`);
                console.log('\n❓ Do you want to continue? This will add to existing data.');
                console.log('   (To start fresh, please clear MongoDB collections first)');
                
                // For now, we'll continue with migration
                console.log('📝 Continuing with migration...\n');
            }
            
            // Migrate scraped data files
            await this.migrateScrapedData();
            
            // Migrate session data
            await this.migrateSessions();
            
            console.log('\n✅ Migration completed successfully!');
            console.log('🎉 All your data has been transferred to MongoDB Atlas');
            console.log('\n📊 Migration Summary:');
            
            const finalScrapedCount = await ScrapedData.countDocuments();
            const finalSessionCount = await Session.countDocuments();
            
            console.log(`   - Total scraped data documents: ${finalScrapedCount}`);
            console.log(`   - Total session documents: ${finalSessionCount}`);
            
            // Optionally create backup of local files
            await this.createBackup();
            
        } catch (error) {
            console.error('❌ Migration failed:', error);
            throw error;
        } finally {
            await database.disconnect();
        }
    }

    async migrateScrapedData() {
        try {
            console.log('📂 Migrating scraped data files...');
            
            // Check if storage directory exists
            try {
                await fs.access(this.storageDir);
            } catch (error) {
                console.log('   ℹ️  No scraped data directory found - skipping scraped data migration');
                return;
            }

            // Read all JSON files from storage directory
            const files = await fs.readdir(this.storageDir);
            const jsonFiles = files.filter(file => file.endsWith('.json'));
            
            if (jsonFiles.length === 0) {
                console.log('   ℹ️  No scraped data files found - skipping scraped data migration');
                return;
            }

            console.log(`   📁 Found ${jsonFiles.length} files to migrate`);
            
            let successCount = 0;
            let errorCount = 0;

            for (const fileName of jsonFiles) {
                try {
                    const filePath = path.join(this.storageDir, fileName);
                    const fileContent = await fs.readFile(filePath, 'utf8');
                    const fileData = JSON.parse(fileContent);
                    
                    // Extract scraped data from file format
                    const scrapedData = fileData.scrapedData || fileData;
                    
                    // Check if this data already exists (by URL and approximate timestamp)
                    const existing = await ScrapedData.findOne({
                        url: scrapedData.url,
                        title: scrapedData.title
                    });
                    
                    if (existing) {
                        console.log(`   ⏭️  Skipping duplicate: ${fileName}`);
                        continue;
                    }
                    
                    // Create MongoDB document
                    const document = ScrapedData.createFromScrapedData(scrapedData);
                    
                    // Preserve original timestamps if available
                    if (fileData.savedAt) {
                        document.savedAt = new Date(fileData.savedAt);
                    }
                    if (fileData.id) {
                        document.fileId = fileData.id;
                    }
                    if (fileData.fileName) {
                        document.fileName = fileData.fileName;
                    }
                    
                    await document.save();
                    
                    console.log(`   ✅ Migrated: ${fileName}`);
                    successCount++;
                    
                } catch (fileError) {
                    console.error(`   ❌ Failed to migrate ${fileName}:`, fileError.message);
                    errorCount++;
                }
            }
            
            console.log(`   📊 Scraped data migration: ${successCount} successful, ${errorCount} failed`);
            
        } catch (error) {
            console.error('Error migrating scraped data:', error);
            throw error;
        }
    }

    async migrateSessions() {
        try {
            console.log('\n💬 Migrating session data...');
            
            // Check if data file exists
            try {
                await fs.access(this.dataFile);
            } catch (error) {
                console.log('   ℹ️  No session data file found - skipping session migration');
                return;
            }

            const fileContent = await fs.readFile(this.dataFile, 'utf8');
            const data = JSON.parse(fileContent);
            
            if (!data.sessions || data.sessions.length === 0) {
                console.log('   ℹ️  No sessions found - skipping session migration');
                return;
            }

            console.log(`   📁 Found ${data.sessions.length} sessions to migrate`);
            
            let successCount = 0;
            let errorCount = 0;

            for (const sessionData of data.sessions) {
                try {
                    // Check if session already exists
                    const existing = await Session.findOne({
                        sessionId: sessionData.id
                    });
                    
                    if (existing) {
                        console.log(`   ⏭️  Skipping duplicate session: ${sessionData.id}`);
                        continue;
                    }
                    
                    // Create MongoDB document
                    const session = Session.createFromSessionData(sessionData);
                    await session.save();
                    
                    console.log(`   ✅ Migrated session: ${sessionData.id}`);
                    successCount++;
                    
                } catch (sessionError) {
                    console.error(`   ❌ Failed to migrate session ${sessionData.id}:`, sessionError.message);
                    errorCount++;
                }
            }
            
            console.log(`   📊 Session migration: ${successCount} successful, ${errorCount} failed`);
            
        } catch (error) {
            console.error('Error migrating sessions:', error);
            throw error;
        }
    }

    async createBackup() {
        try {
            console.log('\n💾 Creating backup of local files...');
            
            const backupDir = path.join(__dirname, '../storage/backup-' + Date.now());
            
            // Create backup directory
            await fs.mkdir(backupDir, { recursive: true });
            
            // Copy files to backup
            const files = ['index.json', 'data.json'];
            for (const file of files) {
                const sourcePath = path.join(__dirname, '../storage', file);
                const backupPath = path.join(backupDir, file);
                
                try {
                    await fs.copyFile(sourcePath, backupPath);
                    console.log(`   ✅ Backed up: ${file}`);
                } catch (error) {
                    if (error.code !== 'ENOENT') {
                        console.log(`   ⚠️  Could not backup ${file}: ${error.message}`);
                    }
                }
            }
            
            // Copy scraped-data directory
            try {
                const scrapedDataBackup = path.join(backupDir, 'scraped-data');
                await fs.mkdir(scrapedDataBackup, { recursive: true });
                
                const files = await fs.readdir(this.storageDir);
                for (const file of files) {
                    const sourcePath = path.join(this.storageDir, file);
                    const backupPath = path.join(scrapedDataBackup, file);
                    await fs.copyFile(sourcePath, backupPath);
                }
                
                console.log(`   ✅ Backed up scraped-data directory`);
            } catch (error) {
                if (error.code !== 'ENOENT') {
                    console.log(`   ⚠️  Could not backup scraped-data: ${error.message}`);
                }
            }
            
            console.log(`   📁 Backup created at: ${backupDir}`);
            console.log('   💡 You can safely delete local storage files after verifying MongoDB data');
            
        } catch (error) {
            console.error('Error creating backup:', error);
        }
    }
}

// Run migration if this script is executed directly
if (require.main === module) {
    const migration = new DataMigration();
    migration.migrate()
        .then(() => {
            console.log('\n🎯 Migration script completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Migration script failed:', error);
            process.exit(1);
        });
}

module.exports = DataMigration; 