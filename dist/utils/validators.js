"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateYoutubeUrl = validateYoutubeUrl;
function validateYoutubeUrl(url) {
    if (!url || typeof url !== 'string') {
        return false;
    }
    const trimmedUrl = url.trim();
    if (trimmedUrl === '') {
        return false;
    }
    try {
        const urlObj = new URL(trimmedUrl);
        const hostname = urlObj.hostname.toLowerCase();
        return hostname === 'youtube.com' ||
            hostname === 'www.youtube.com' ||
            hostname === 'youtu.be' ||
            hostname === 'www.youtu.be';
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=validators.js.map