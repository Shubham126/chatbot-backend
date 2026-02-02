const axios = require('axios');

class EmailService {
    constructor() {
        this.apiUrl = "https://api.emailit.com/v1/emails";
        this.apiKey = "em_api_cVn89uzyQdX84Fm5AdMjpF1QjfWXtvKT";
        this.fromEmail = "Notification <support@status.digitalguru.buzz>";
        this.replyToEmail = "support@status.digitalguru.buzz";
    }

    async sendScrapingCompleteNotification(userEmail, userName, scrapingData) {
        try {
            const emailData = {
                from: this.fromEmail,
                to: userEmail,
                reply_to: this.replyToEmail,
                subject: "🎉 Website Scraping Completed Successfully",
                html: this.generateScrapingCompleteHTML(userName, scrapingData)
            };

            console.log(`📧 Sending scraping completion email to: ${userEmail}`);

            const response = await axios.post(this.apiUrl, emailData, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json",
                },
            });

            console.log("✅ Scraping completion email sent successfully:", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ Error sending scraping completion email:", error.response?.data || error.message);
            throw error;
        }
    }

    generateScrapingCompleteHTML(userName, scrapingData) {
        const {
            url,
            title,
            timestamp,
            totalUrlsScraped,
            headingsCount,
            paragraphsCount,
            linksCount,
            listsCount,
            tablesCount,
            articlesCount,
            sectionsCount,
            scrapingMethod,
            theme
        } = scrapingData;

        const formatDate = (dateString) => {
            return new Date(dateString).toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZoneName: 'short'
            });
        };

        const getScrapingMethodBadge = (method) => {
            // Removed badge display as per user request
            return '';
        };

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Scraping Complete</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa; line-height: 1.6;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 600;">🎉 Scraping Complete!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Your website data has been successfully processed</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 30px 20px;">
            <!-- Greeting -->
            <div style="margin-bottom: 25px;">
                <p style="font-size: 18px; color: #2c3e50; margin: 0 0 10px 0;">Hello ${userName || 'there'}! 👋</p>
                <p style="color: #6c757d; margin: 0; font-size: 14px;">We've successfully scraped and processed your website data. Here's what we found:</p>
            </div>

            <!-- Website Info Card -->
            <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #667eea;">
                <h3 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 18px;">📄 ${title || 'Website Data'}</h3>
                <p style="margin: 0 0 8px 0; color: #6c757d; font-size: 14px;"><strong>URL:</strong> <a href="${url}" style="color: #667eea; text-decoration: none;">${url}</a></p>
                <p style="margin: 0 0 8px 0; color: #6c757d; font-size: 14px;"><strong>Completed:</strong> ${formatDate(timestamp)}</p>
                <p style="margin: 0; color: #6c757d; font-size: 14px;"><strong>Pages Scraped:</strong> ${totalUrlsScraped || 1}</p>
            </div>

            <!-- Statistics Grid -->
            <div style="margin-bottom: 25px;">
                <h3 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 16px;">📊 Content Statistics</h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                    <div style="background: #fff; border: 1px solid #e9ecef; border-radius: 6px; padding: 15px; text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #667eea; margin-bottom: 5px;">${headingsCount || 0}</div>
                        <div style="font-size: 12px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px;">Headings</div>
                    </div>
                    <div style="background: #fff; border: 1px solid #e9ecef; border-radius: 6px; padding: 15px; text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #28a745; margin-bottom: 5px;">${paragraphsCount || 0}</div>
                        <div style="font-size: 12px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px;">Paragraphs</div>
                    </div>
                    <div style="background: #fff; border: 1px solid #e9ecef; border-radius: 6px; padding: 15px; text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #ffc107; margin-bottom: 5px;">${linksCount || 0}</div>
                        <div style="font-size: 12px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px;">Links</div>
                    </div>
                    <div style="background: #fff; border: 1px solid #e9ecef; border-radius: 6px; padding: 15px; text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #17a2b8; margin-bottom: 5px;">${(listsCount || 0) + (tablesCount || 0)}</div>
                        <div style="font-size: 12px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px;">Lists & Tables</div>
                    </div>
                </div>
            </div>

            <!-- Additional Content Info -->
            ${articlesCount > 0 || sectionsCount > 0 ? `
            <div style="background: #e8f5e8; border-radius: 6px; padding: 15px; margin-bottom: 25px;">
                <h4 style="margin: 0 0 10px 0; color: #155724; font-size: 14px;">✨ Additional Content Discovered</h4>
                <div style="font-size: 13px; color: #155724;">
                    ${articlesCount > 0 ? `• ${articlesCount} Article${articlesCount > 1 ? 's' : ''}<br>` : ''}
                    ${sectionsCount > 0 ? `• ${sectionsCount} Section${sectionsCount > 1 ? 's' : ''}` : ''}
                </div>
            </div>
            ` : ''}


            <!-- Call to Action -->
            <div style="text-align: center; margin-bottom: 20px;">
                <a href="https://your-dashboard-url.com/dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block; transition: opacity 0.3s;">
                    View in Dashboard →
                </a>
            </div>

            <!-- Footer Message -->
            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e9ecef;">
                <p style="margin: 0; color: #6c757d; font-size: 13px;">
                    Your scraped data is now ready to use with our AI chatbot integration.<br>
                    Need help? <a href="mailto:support@status.digitalguru.buzz" style="color: #667eea;">Contact our support team</a>
                </p>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px; color: #6c757d; font-size: 12px;">
        <p style="margin: 0;">© 2024 ChatFlow AI. All rights reserved.</p>
        <p style="margin: 5px 0 0 0;">
            <a href="#" style="color: #6c757d; text-decoration: none; margin: 0 10px;">Unsubscribe</a>
            <a href="#" style="color: #6c757d; text-decoration: none; margin: 0 10px;">Privacy Policy</a>
        </p>
    </div>
</body>
</html>
        `;
    }

    async sendErrorNotification(userEmail, userName, errorData) {
        try {
            const emailData = {
                from: this.fromEmail,
                to: userEmail,
                reply_to: this.replyToEmail,
                subject: "❌ Website Scraping Failed",
                html: this.generateErrorHTML(userName, errorData)
            };

            console.log(`📧 Sending scraping error email to: ${userEmail}`);

            const response = await axios.post(this.apiUrl, emailData, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json",
                },
            });

            console.log("✅ Scraping error email sent successfully:", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ Error sending scraping error email:", error.response?.data || error.message);
            throw error;
        }
    }

    generateErrorHTML(userName, errorData) {
        const { url, error, timestamp } = errorData;

        const formatDate = (dateString) => {
            return new Date(dateString).toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZoneName: 'short'
            });
        };

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Scraping Failed</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa; line-height: 1.6;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 600;">❌ Scraping Failed</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">We encountered an issue while processing your website</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 30px 20px;">
            <!-- Greeting -->
            <div style="margin-bottom: 25px;">
                <p style="font-size: 18px; color: #2c3e50; margin: 0 0 10px 0;">Hello ${userName || 'there'},</p>
                <p style="color: #6c757d; margin: 0; font-size: 14px;">We're sorry, but we encountered an issue while trying to scrape your website. Here are the details:</p>
            </div>

            <!-- Error Info Card -->
            <div style="background: #f8d7da; border-radius: 8px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #dc3545;">
                <h3 style="margin: 0 0 15px 0; color: #721c24; font-size: 18px;">Error Details</h3>
                <p style="margin: 0 0 8px 0; color: #721c24; font-size: 14px;"><strong>URL:</strong> ${url}</p>
                <p style="margin: 0 0 8px 0; color: #721c24; font-size: 14px;"><strong>Time:</strong> ${formatDate(timestamp)}</p>
                <p style="margin: 0; color: #721c24; font-size: 14px;"><strong>Error:</strong> ${error}</p>
            </div>

            <!-- Troubleshooting -->
            <div style="background: #d1ecf1; border-radius: 6px; padding: 20px; margin-bottom: 25px;">
                <h4 style="margin: 0 0 15px 0; color: #0c5460; font-size: 16px;">💡 Troubleshooting Tips</h4>
                <ul style="margin: 0; padding-left: 20px; color: #0c5460; font-size: 14px;">
                    <li style="margin-bottom: 8px;">Verify that the URL is correct and accessible</li>
                    <li style="margin-bottom: 8px;">Check if the website requires authentication or has anti-scraping measures</li>
                    <li style="margin-bottom: 8px;">Ensure the website is not temporarily down or experiencing issues</li>
                    <li style="margin-bottom: 0;">Try again in a few minutes in case of temporary connectivity issues</li>
                </ul>
            </div>

            <!-- Call to Action -->
            <div style="text-align: center; margin-bottom: 20px;">
                <a href="https://your-dashboard-url.com/dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block; margin-right: 10px;">
                    Try Again
                </a>
                <a href="mailto:support@status.digitalguru.buzz" style="background: transparent; color: #667eea; border: 2px solid #667eea; padding: 10px 28px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block;">
                    Get Support
                </a>
            </div>

            <!-- Footer Message -->
            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e9ecef;">
                <p style="margin: 0; color: #6c757d; font-size: 13px;">
                    If this issue persists, please contact our support team and we'll help you resolve it.<br>
                    <a href="mailto:support@status.digitalguru.buzz" style="color: #667eea;">support@status.digitalguru.buzz</a>
                </p>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px; color: #6c757d; font-size: 12px;">
        <p style="margin: 0;">© 2025 ChatFlow AI. All rights reserved.</p>
    </div>
</body>
</html>
        `;
    }
}

module.exports = new EmailService();
