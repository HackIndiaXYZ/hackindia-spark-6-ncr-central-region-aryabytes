/**
 * AI Processing Module - Core Intelligence Engine
 * Converts unstructured text into actionable tasks
 */

const { v4: uuidv4 } = require('crypto');

// Category keyword mappings
const CATEGORY_KEYWORDS = {
  Academic: ['exam', 'assignment', 'class', 'lecture', 'semester', 'course', 'study', 'homework', 'thesis', 'project', 'grade', 'gpa', 'university', 'college', 'school', 'professor', 'tuition', 'enrollment', 'registration', 'syllabus', 'quiz', 'test', 'midterm', 'final'],
  Financial: ['bill', 'payment', 'invoice', 'tax', 'rent', 'loan', 'emi', 'insurance', 'electricity', 'water', 'gas', 'credit', 'debit', 'salary', 'refund', 'fine', 'fee', 'dues', 'mortgage', 'subscription', 'premium'],
  Medical: ['doctor', 'hospital', 'medicine', 'prescription', 'appointment', 'checkup', 'health', 'dental', 'therapy', 'vaccine', 'lab', 'report', 'surgery', 'clinic', 'pharmacy', 'diagnosis', 'treatment', 'blood test', 'x-ray', 'mri'],
  Personal: []
};

/**
 * Extract dates from text using multiple regex patterns
 */
function extractDates(text) {
  const dates = [];
  const now = new Date();

  // Pattern: "5 April 2026", "5th April 2026", "05 Apr 2026"
  const monthNames = {
    january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
    jan: 0, feb: 1, mar: 2, apr: 3, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
  };

  // "5 April 2026" or "5th April 2026"
  const pattern1 = /(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\s+(\d{4})/gi;
  let match;
  while ((match = pattern1.exec(text)) !== null) {
    const day = parseInt(match[1]);
    const month = monthNames[match[2].toLowerCase()];
    const year = parseInt(match[3]);
    if (month !== undefined) {
      dates.push(new Date(year, month, day));
    }
  }

  // "April 5, 2026" or "April 5th, 2026"
  const pattern1b = /(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/gi;
  while ((match = pattern1b.exec(text)) !== null) {
    const month = monthNames[match[1].toLowerCase()];
    const day = parseInt(match[2]);
    const year = parseInt(match[3]);
    if (month !== undefined) {
      dates.push(new Date(year, month, day));
    }
  }

  // "10/04/2026" or "10-04-2026" (DD/MM/YYYY)
  const pattern2 = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/g;
  while ((match = pattern2.exec(text)) !== null) {
    const day = parseInt(match[1]);
    const month = parseInt(match[2]) - 1;
    const year = parseInt(match[3]);
    dates.push(new Date(year, month, day));
  }

  // "2026-04-10" (ISO format)
  const pattern3 = /(\d{4})-(\d{2})-(\d{2})/g;
  while ((match = pattern3.exec(text)) !== null) {
    const year = parseInt(match[1]);
    const month = parseInt(match[2]) - 1;
    const day = parseInt(match[3]);
    dates.push(new Date(year, month, day));
  }

  // Relative dates: "tomorrow", "next week", "in X days"
  if (/tomorrow/i.test(text)) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    dates.push(tomorrow);
  }
  if (/next week/i.test(text)) {
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    dates.push(nextWeek);
  }
  const inDaysMatch = text.match(/in\s+(\d+)\s+days?/i);
  if (inDaysMatch) {
    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + parseInt(inDaysMatch[1]));
    dates.push(futureDate);
  }
  const daysLeftMatch = text.match(/(\d+)\s+days?\s+left/i);
  if (daysLeftMatch) {
    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + parseInt(daysLeftMatch[1]));
    dates.push(futureDate);
  }

  return dates;
}

/**
 * Detect category from text based on keyword matching
 */
function detectCategory(text) {
  const lowerText = text.toLowerCase();
  let bestCategory = 'Personal';
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'Personal') continue;
    let score = 0;
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return bestCategory;
}

/**
 * Calculate urgency based on deadline proximity
 */
function calculateUrgency(deadline) {
  if (!deadline) return 'Low';

  const now = new Date();
  const diffMs = new Date(deadline) - now;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays <= 2) return 'High';
  if (diffDays <= 5) return 'Medium';
  return 'Low';
}

/**
 * Generate a smart title from text
 */
function generateTitle(text, category) {
  const lowerText = text.toLowerCase();

  // Try to extract a meaningful title
  const titlePatterns = [
    /(?:your|the)\s+(.+?)\s+(?:is|are|has|was)\s+(?:due|scheduled|pending)/i,
    /(?:pay|submit|attend|complete|renew)\s+(?:your\s+)?(.+?)(?:\s+(?:by|before|on|within))/i,
    /(.+?)\s+(?:deadline|due date|expiry|expiration)/i,
    /(?:reminder|notice|alert)(?:\s*:\s*|\s+for\s+)(.+?)(?:\.|$)/i,
  ];

  for (const pattern of titlePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      let title = match[1].trim();
      // Capitalize first letter of each word
      title = title.replace(/\b\w/g, l => l.toUpperCase());
      if (title.length > 5 && title.length < 60) {
        return title;
      }
    }
  }

  // Fallback: Generate title from keywords
  const categoryTitles = {
    Academic: 'Academic Task',
    Financial: 'Financial Task',
    Medical: 'Medical Appointment',
    Personal: 'Personal Task'
  };

  // Try to find a subject in the text
  const words = text.split(/\s+/).slice(0, 6).join(' ');
  if (words.length > 10) {
    return words.replace(/\b\w/g, l => l.toUpperCase()).substring(0, 50);
  }

  return categoryTitles[category] || 'New Task';
}

/**
 * Generate description from text
 */
function generateDescription(text) {
  // Clean up the text for description
  let desc = text.trim();
  if (desc.length > 200) {
    desc = desc.substring(0, 197) + '...';
  }
  return desc;
}

/**
 * Main AI Processing Function
 * Converts unstructured text into structured task(s)
 */
function processTextToTask(text) {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Split text into potential separate tasks (by newlines or periods with context)
  const segments = text.split(/\n+/).filter(s => s.trim().length > 10);
  const textBlocks = segments.length > 1 ? segments : [text];

  const tasks = [];

  for (const block of textBlocks) {
    const dates = extractDates(block);
    const category = detectCategory(block);
    const deadline = dates.length > 0 ? dates[0].toISOString().split('T')[0] : null;
    const urgency = calculateUrgency(deadline);
    const title = generateTitle(block, category);
    const description = generateDescription(block);

    tasks.push({
      id: generateId(),
      title,
      description,
      deadline: deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category,
      urgency,
      createdAt: new Date().toISOString()
    });
  }

  return tasks;
}

/**
 * Generate unique ID
 */
function generateId() {
  return 'task_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
}

/**
 * Simulate OCR text extraction from a file
 */
function simulateOCR(filename) {
  const extension = filename.split('.').pop().toLowerCase();

  const sampleTexts = {
    pdf: "Your electricity bill of $145.50 is due on 5 April 2026. A late fee of $15 will apply after the due date. Please make the payment through the online portal or visit your nearest payment center.",

    jpg: "UNIVERSITY EXAMINATION NOTICE\nExam registration form submission deadline is 10 April 2026.\nAll students must submit their exam forms along with the required documents. Contact the examination cell for any queries.",

    png: "Dr. Smith's Dental Clinic\nAppointment Reminder: Your dental checkup is scheduled for 8 April 2026 at 10:00 AM.\nPlease bring your previous reports and insurance card.",

    default: "Important Notice: Your subscription renewal is due on 15 April 2026. Please renew to continue services without interruption."
  };

  return sampleTexts[extension] || sampleTexts.default;
}

/**
 * Generate demo/sample tasks
 */
function generateDemoTasks() {
  const now = new Date();

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const in2Days = new Date(now);
  in2Days.setDate(in2Days.getDate() + 2);

  const in4Days = new Date(now);
  in4Days.setDate(in4Days.getDate() + 4);

  const in7Days = new Date(now);
  in7Days.setDate(in7Days.getDate() + 7);

  const in10Days = new Date(now);
  in10Days.setDate(in10Days.getDate() + 10);

  const in1Day = new Date(now);
  in1Day.setDate(in1Day.getDate() + 1);

  return [
    {
      id: generateId(),
      title: 'Exam Form Submission',
      description: 'Submit university exam registration form with all required documents before the deadline.',
      deadline: tomorrow.toISOString().split('T')[0],
      category: 'Academic',
      urgency: 'High',
      createdAt: new Date().toISOString()
    },
    {
      id: generateId(),
      title: 'Electricity Bill Payment',
      description: 'Pay electricity bill of $145.50. Late fee of $15 applies after due date.',
      deadline: in2Days.toISOString().split('T')[0],
      category: 'Financial',
      urgency: 'High',
      createdAt: new Date().toISOString()
    },
    {
      id: generateId(),
      title: 'Dental Checkup Appointment',
      description: 'Visit Dr. Smith\'s Dental Clinic at 10:00 AM. Bring previous reports and insurance card.',
      deadline: in4Days.toISOString().split('T')[0],
      category: 'Medical',
      urgency: 'Medium',
      createdAt: new Date().toISOString()
    },
    {
      id: generateId(),
      title: 'Rent Payment Due',
      description: 'Monthly rent payment of $1,200 due to landlord. Transfer via bank or pay by check.',
      deadline: in7Days.toISOString().split('T')[0],
      category: 'Financial',
      urgency: 'Low',
      createdAt: new Date().toISOString()
    },
    {
      id: generateId(),
      title: 'Project Report Submission',
      description: 'Submit final year project report to the department. Include source code and documentation.',
      deadline: in10Days.toISOString().split('T')[0],
      category: 'Academic',
      urgency: 'Low',
      createdAt: new Date().toISOString()
    },
    {
      id: generateId(),
      title: 'Gym Membership Renewal',
      description: 'Renew annual gym membership before it expires. Check for early renewal discounts.',
      deadline: in1Day.toISOString().split('T')[0],
      category: 'Personal',
      urgency: 'High',
      createdAt: new Date().toISOString()
    }
  ];
}

module.exports = {
  processTextToTask,
  simulateOCR,
  generateDemoTasks,
  extractDates,
  detectCategory,
  calculateUrgency
};
