class ContextBuilder {
    buildContext(scrapedData, question) {
        try {
            let context = '';

            // Add website metadata
            if (scrapedData.url) {
                context += `Website URL: ${scrapedData.url}\n`;
            }

            // Add title
            if (scrapedData.title) {
                context += `Page Title: ${scrapedData.title}\n\n`;
            }

            // Add description and metadata
            if (scrapedData.description) {
                context += `Description: ${scrapedData.description}\n\n`;
            }

            if (scrapedData.keywords) {
                context += `Keywords: ${scrapedData.keywords}\n\n`;
            }

            if (scrapedData.author) {
                context += `Author: ${scrapedData.author}\n\n`;
            }

            // Add ALL content without limitations
            
            // Add articles if present
            if (scrapedData.articles && scrapedData.articles.length > 0) {
                context += 'Articles:\n';
                scrapedData.articles.forEach((article, index) => {
                    context += `Article ${index + 1}: ${article.title}\n${article.content}\n\n`;
                });
            }

            // Add sections if present
            if (scrapedData.sections && scrapedData.sections.length > 0) {
                context += 'Page Sections:\n';
                scrapedData.sections.forEach((section, index) => {
                    context += `Section: ${section.heading}\n${section.content}\n\n`;
                });
            }

            // Add headings for structure
            if (scrapedData.headings && scrapedData.headings.length > 0) {
                context += 'Page Structure (Headings):\n';
                scrapedData.headings.forEach(heading => {
                    context += `${heading.level.toUpperCase()}: ${heading.text}\n`;
                });
                context += '\n';
            }

            // Add ALL tables without limits
            if (scrapedData.tables && scrapedData.tables.length > 0) {
                context += 'Tables:\n';
                scrapedData.tables.forEach((table, index) => {
                    context += `Table ${index + 1}:\n`;
                    if (table.headers.length > 0) {
                        context += `Headers: ${table.headers.join(' | ')}\n`;
                    }
                    table.rows.forEach(row => {
                        context += `${row.join(' | ')}\n`;
                    });
                    context += '\n';
                });
            }

            // Add ALL lists without limits
            if (scrapedData.lists && scrapedData.lists.length > 0) {
                context += 'Lists:\n';
                scrapedData.lists.forEach((list, index) => {
                    context += `${list.type.toUpperCase()} List ${index + 1}:\n`;
                    list.items.forEach(item => {
                        context += `- ${item}\n`;
                    });
                    context += '\n';
                });
            }

            // Add ALL paragraphs without limits
            if (scrapedData.paragraphs && scrapedData.paragraphs.length > 0) {
                context += 'Page Content:\n';
                scrapedData.paragraphs.forEach((paragraph, index) => {
                    context += `${paragraph}\n\n`;
                });
            }

            // Add ALL links without limits
            if (scrapedData.links && scrapedData.links.length > 0) {
                context += 'Important Links:\n';
                scrapedData.links.forEach(link => {
                    context += `- [${link.text}](${link.url})`;
                    if (link.title) {
                        context += ` (${link.title})`;
                    }
                    context += '\n';
                });
                context += '\n';
            }

            // Add ALL images information
            if (scrapedData.images && scrapedData.images.length > 0) {
                context += 'Images:\n';
                scrapedData.images.forEach((image, index) => {
                    context += `Image ${index + 1}: ${image.alt || 'No description'}`;
                    if (image.title) {
                        context += ` - ${image.title}`;
                    }
                    context += ` (${image.src})\n`;
                });
                context += '\n';
            }

            // NO TRUNCATION - Send all data to AI
            console.log(`\n📋 CONTEXT BUILDER SUMMARY:`);
            console.log(`   📄 Total characters: ${context.length.toLocaleString()}`);
            console.log(`   🔗 Links included: ${scrapedData.links ? scrapedData.links.length : 0}`);
            console.log(`   📊 Tables included: ${scrapedData.tables ? scrapedData.tables.length : 0}`);
            console.log(`   📝 Paragraphs included: ${scrapedData.paragraphs ? scrapedData.paragraphs.length : 0}`);
            console.log(`   📋 Lists included: ${scrapedData.lists ? scrapedData.lists.length : 0}`);
            console.log(`   🎯 Sending COMPLETE data to AI for analysis`);
            
            return context;
        } catch (error) {
            console.error('Error building context:', error);
            return 'Error: Unable to process website content.';
        }
    }

    extractRelevantContent(scrapedData, question) {
        const keywords = this.extractKeywords(question);
        const relevantContent = [];

        // Search in paragraphs
        if (scrapedData.paragraphs) {
            scrapedData.paragraphs.forEach(paragraph => {
                const score = this.calculateRelevanceScore(paragraph, keywords);
                if (score > 0) {
                    relevantContent.push({ text: paragraph, score, type: 'paragraph' });
                }
            });
        }

        // Search in lists
        if (scrapedData.lists) {
            scrapedData.lists.forEach(list => {
                list.items.forEach(item => {
                    const score = this.calculateRelevanceScore(item, keywords);
                    if (score > 0) {
                        relevantContent.push({ text: `${list.type} item: ${item}`, score, type: 'list' });
                    }
                });
            });
        }

        // Search in table content
        if (scrapedData.tables) {
            scrapedData.tables.forEach(table => {
                table.rows.forEach(row => {
                    const rowText = row.join(' ');
                    const score = this.calculateRelevanceScore(rowText, keywords);
                    if (score > 0) {
                        relevantContent.push({ text: `Table data: ${rowText}`, score, type: 'table' });
                    }
                });
            });
        }

        // Search in articles
        if (scrapedData.articles) {
            scrapedData.articles.forEach(article => {
                const score = this.calculateRelevanceScore(article.content, keywords);
                if (score > 0) {
                    relevantContent.push({ text: `${article.title}: ${article.content}`, score, type: 'article' });
                }
            });
        }

        // Search in sections
        if (scrapedData.sections) {
            scrapedData.sections.forEach(section => {
                const score = this.calculateRelevanceScore(section.content, keywords);
                if (score > 0) {
                    relevantContent.push({ text: `${section.heading}: ${section.content}`, score, type: 'section' });
                }
            });
        }

        // Sort by relevance and return top content
        return relevantContent
            .sort((a, b) => b.score - a.score)
            .slice(0, 8)
            .map(item => item.text);
    }

    calculateRelevanceScore(text, keywords) {
        const lowerText = text.toLowerCase();
        return keywords.filter(keyword => 
            lowerText.includes(keyword.toLowerCase())
        ).length;
    }

    isImageRelevant(question) {
        const imageKeywords = ['image', 'picture', 'photo', 'visual', 'graphic', 'diagram', 'chart', 'screenshot'];
        const lowerQuestion = question.toLowerCase();
        return imageKeywords.some(keyword => lowerQuestion.includes(keyword));
    }

    extractKeywords(question) {
        // Enhanced keyword extraction
        const commonWords = ['what', 'how', 'when', 'where', 'why', 'who', 'is', 'are', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'can', 'will', 'would', 'should', 'could', 'may', 'might', 'do', 'does', 'did', 'have', 'has', 'had', 'be', 'been', 'being', 'was', 'were', 'am', 'this', 'that', 'these', 'those'];
        const words = question.toLowerCase().split(/\s+/);
        return words.filter(word => 
            word.length > 2 && 
            !commonWords.includes(word) &&
            /^[a-zA-Z]+$/.test(word)
        );
    }
}

module.exports = new ContextBuilder(); 