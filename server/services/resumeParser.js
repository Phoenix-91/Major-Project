const pdfParse = require('pdf-parse');
const fs = require('fs').promises;

/**
 * Parse PDF resume and extract text content
 * @param {string} filePath - Path to PDF file
 * @returns {Promise<Object>} Parsed resume data
 */
async function parseResume(filePath) {
    try {
        const dataBuffer = await fs.readFile(filePath);
        const pdfData = await pdfParse(dataBuffer);

        // Extract basic information
        const text = pdfData.text;
        const lines = text.split('\n').filter(line => line.trim());

        // Simple extraction (can be enhanced with NLP)
        const resumeData = {
            rawText: text,
            lines: lines,
            pageCount: pdfData.numpages,
            metadata: pdfData.info,
            // Basic parsing
            email: extractEmail(text),
            phone: extractPhone(text),
            skills: extractSkills(text),
            sections: identifySections(lines),
        };

        return resumeData;
    } catch (error) {
        throw new Error(`Failed to parse resume: ${error.message}`);
    }
}

/**
 * Extract email from text
 */
function extractEmail(text) {
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
    const matches = text.match(emailRegex);
    return matches ? matches[0] : null;
}

/**
 * Extract phone number from text
 */
function extractPhone(text) {
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const matches = text.match(phoneRegex);
    return matches ? matches[0] : null;
}

/**
 * Extract skills (basic keyword matching)
 */
function extractSkills(text) {
    const commonSkills = [
        'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'MongoDB',
        'SQL', 'AWS', 'Docker', 'Kubernetes', 'Git', 'Machine Learning',
        'Data Science', 'TypeScript', 'Angular', 'Vue', 'Express', 'Django',
        'Flask', 'TensorFlow', 'PyTorch', 'REST API', 'GraphQL', 'Redis',
        'PostgreSQL', 'MySQL', 'Firebase', 'CI/CD', 'Agile', 'Scrum'
    ];

    const foundSkills = commonSkills.filter(skill =>
        text.toLowerCase().includes(skill.toLowerCase())
    );

    return foundSkills;
}

/**
 * Identify resume sections
 */
function identifySections(lines) {
    const sections = {};
    const sectionHeaders = [
        'experience', 'education', 'skills', 'projects', 'certifications',
        'summary', 'objective', 'achievements', 'awards'
    ];

    let currentSection = 'header';
    let currentContent = [];

    lines.forEach(line => {
        const lowerLine = line.toLowerCase();
        const isHeader = sectionHeaders.some(header =>
            lowerLine.includes(header) && line.length < 50
        );

        if (isHeader) {
            if (currentContent.length > 0) {
                sections[currentSection] = currentContent.join('\n');
            }
            currentSection = lowerLine.trim();
            currentContent = [];
        } else {
            currentContent.push(line);
        }
    });

    // Add last section
    if (currentContent.length > 0) {
        sections[currentSection] = currentContent.join('\n');
    }

    return sections;
}

module.exports = { parseResume };
