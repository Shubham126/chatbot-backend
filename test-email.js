// Test script for email notification functionality
const emailService = require('./services/emailService');

async function testSuccessEmail() {
    console.log('🧪 Testing success email notification...');
    
    const testUserData = {
        email: 'test@example.com', // Replace with a real email for testing
        name: 'John Doe'
    };
    
    const testScrapingData = {
        url: 'https://example.com',
        title: 'Example Website',
        timestamp: new Date().toISOString(),
        totalUrlsScraped: 5,
        headingsCount: 15,
        paragraphsCount: 42,
        linksCount: 18,
        listsCount: 6,
        tablesCount: 2,
        articlesCount: 3,
        sectionsCount: 8,
        scrapingMethod: 'enhanced',
        theme: {
            colors: {
                primary: '#007bff',
                secondary: '#6c757d'
            }
        }
    };
    
    try {
        const result = await emailService.sendScrapingCompleteNotification(
            testUserData.email,
            testUserData.name,
            testScrapingData
        );
        console.log('✅ Success email sent successfully:', result);
    } catch (error) {
        console.error('❌ Failed to send success email:', error.message);
    }
}

async function testErrorEmail() {
    console.log('🧪 Testing error email notification...');
    
    const testUserData = {
        email: 'test@example.com', // Replace with a real email for testing
        name: 'John Doe'
    };
    
    const testErrorData = {
        url: 'https://example.com',
        error: 'Website not found (404): The URL "https://example.com" doesn\'t exist or has been moved.',
        timestamp: new Date().toISOString()
    };
    
    try {
        const result = await emailService.sendErrorNotification(
            testUserData.email,
            testUserData.name,
            testErrorData
        );
        console.log('✅ Error email sent successfully:', result);
    } catch (error) {
        console.error('❌ Failed to send error email:', error.message);
    }
}

async function runTests() {
    console.log('🚀 Starting email notification tests...\n');
    
    // Test success email
    await testSuccessEmail();
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test error email
    await testErrorEmail();
    
    console.log('\n✅ Email notification tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
    runTests().catch(error => {
        console.error('❌ Test execution failed:', error);
        process.exit(1);
    });
}

module.exports = { testSuccessEmail, testErrorEmail, runTests };

