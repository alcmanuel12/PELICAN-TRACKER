const ESCAPE_MAP = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' };

const sanitize = (str) => String(str || '').replace(/[<>&"']/g, c => ESCAPE_MAP[c]);

module.exports = { sanitize };
