// Utilidades generales
export class Utils {
    static stringToHash(str) {
        if (!str) return 0;
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

    static formatDate(date) {
        return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    static deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    static async loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    static isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    static parseCSV(text) {
        const lines = text.split('\n');
        const result = [];
        const headers = lines[0].split(',');
        
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i]) continue;
            const obj = {};
            const currentline = lines[i].split(',');
            
            for (let j = 0; j < headers.length; j++) {
                obj[headers[j]] = currentline[j];
            }
            result.push(obj);
        }
        return result;
    }

    static sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    static getContrastColor(hexColor) {
        // Convierte hex a RGB
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);
        
        // Calcula luminosidad
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#000000' : '#ffffff';
    }

    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback para navegadores más antiguos
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        }
    }

    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    static isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    static getOS() {
        const userAgent = window.navigator.userAgent;
        const platform = window.navigator.platform;
        
        if (/Mac/.test(platform)) return 'macOS';
        if (/Win/.test(platform)) return 'Windows';
        if (/Linux/.test(platform)) return 'Linux';
        if (/Android/.test(userAgent)) return 'Android';
        if (/iPhone|iPad|iPod/.test(userAgent)) return 'iOS';
        
        return 'Unknown';
    }

    static async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static randomColor() {
        return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
    }

    static calculatePercentage(part, total) {
        if (total === 0) return 0;
        return Math.round((part / total) * 100);
    }

    static groupBy(array, key) {
        return array.reduce((result, current) => {
            (result[current[key]] = result[current[key]] || []).push(current);
            return result;
        }, {});
    }

    static flattenArray(array) {
        return array.reduce((flat, toFlatten) => {
            return flat.concat(Array.isArray(toFlatten) ? this.flattenArray(toFlatten) : toFlatten);
        }, []);
    }

    static uniqueArray(array) {
        return [...new Set(array)];
    }

    static chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    static sortBy(array, key, order = 'asc') {
        return array.sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];
            
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            }
            
            return order === 'asc' ? aVal - bVal : bVal - aVal;
        });
    }

    static filterBy(array, filters) {
        return array.filter(item => {
            return Object.entries(filters).every(([key, value]) => {
                if (Array.isArray(value)) {
                    return value.includes(item[key]);
                }
                return item[key] === value;
            });
        });
    }

    static searchInArray(array, query, keys) {
        const lowerQuery = query.toLowerCase();
        return array.filter(item => {
            return keys.some(key => {
                const value = item[key];
                if (typeof value === 'string') {
                    return value.toLowerCase().includes(lowerQuery);
                }
                return false;
            });
        });
    }

    static calculateAverage(array, key) {
        if (array.length === 0) return 0;
        const sum = array.reduce((acc, item) => acc + (item[key] || 0), 0);
        return sum / array.length;
    }

    static formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    static formatNumber(number) {
        return new Intl.NumberFormat('es-ES').format(number);
    }

    static parseJSONSafe(str, fallback = {}) {
        try {
            return JSON.parse(str);
        } catch (error) {
            return fallback;
        }
    }

    static async hashString(str) {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    static createBlobUrl(data, type = 'application/json') {
        const blob = new Blob([data], { type });
        return URL.createObjectURL(blob);
    }

    static revokeBlobUrl(url) {
        URL.revokeObjectURL(url);
    }

    static downloadFile(data, filename, type = 'application/json') {
        const blob = new Blob([data], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    static async readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    static async readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    static async readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    static validateRequiredFields(object, requiredFields) {
        const missing = requiredFields.filter(field => !object[field]);
        if (missing.length > 0) {
            throw new Error(`Campos requeridos faltantes: ${missing.join(', ')}`);
        }
        return true;
    }

    static getQueryParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    static setQueryParam(name, value) {
        const url = new URL(window.location);
        url.searchParams.set(name, value);
        window.history.pushState({}, '', url);
    }

    static removeQueryParam(name) {
        const url = new URL(window.location);
        url.searchParams.delete(name);
        window.history.pushState({}, '', url);
    }

    static getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    static setCookie(name, value, days = 365) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value}; ${expires}; path=/`;
    }

    static deleteCookie(name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }

    static createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        // Set attributes
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else if (key.startsWith('on') && typeof value === 'function') {
                element.addEventListener(key.substring(2).toLowerCase(), value);
            } else if (value !== null && value !== undefined) {
                element.setAttribute(key, value);
            }
        });
        
        // Add children
        if (Array.isArray(children)) {
            children.forEach(child => {
                if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                } else if (child instanceof Node) {
                    element.appendChild(child);
                }
            });
        }
        
        return element;
    }

    static measurePerformance(fn, ...args) {
        const start = performance.now();
        const result = fn(...args);
        const end = performance.now();
        return {
            result,
            time: end - start
        };
    }

    static async retry(fn, retries = 3, delay = 1000) {
        try {
            return await fn();
        } catch (error) {
            if (retries === 0) throw error;
            await this.sleep(delay);
            return this.retry(fn, retries - 1, delay * 2);
        }
    }

    static memoize(fn) {
        const cache = new Map();
        return (...args) => {
            const key = JSON.stringify(args);
            if (cache.has(key)) {
                return cache.get(key);
            }
            const result = fn(...args);
            cache.set(key, result);
            return result;
        };
    }

    static createUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    static getBrowserInfo() {
        const ua = navigator.userAgent;
        let browserName;
        let browserVersion;
        
        if (ua.includes('Chrome') && !ua.includes('Edge')) {
            browserName = 'Chrome';
            browserVersion = ua.match(/Chrome\/(\d+)/)?.[1] || '';
        } else if (ua.includes('Firefox')) {
            browserName = 'Firefox';
            browserVersion = ua.match(/Firefox\/(\d+)/)?.[1] || '';
        } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
            browserName = 'Safari';
            browserVersion = ua.match(/Version\/(\d+)/)?.[1] || '';
        } else if (ua.includes('Edge')) {
            browserName = 'Edge';
            browserVersion = ua.match(/Edge\/(\d+)/)?.[1] || '';
        } else {
            browserName = 'Unknown';
            browserVersion = '';
        }
        
        return {
            name: browserName,
            version: browserVersion,
            userAgent: ua
        };
    }

    static isOnline() {
        return navigator.onLine;
    }

    static async checkInternetConnection() {
        try {
            const response = await fetch('https://www.google.com', { 
                method: 'HEAD',
                mode: 'no-cors',
                cache: 'no-store'
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    static getDevicePixelRatio() {
        return window.devicePixelRatio || 1;
    }

    static getViewportSize() {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        };
    }

    static getScrollPosition() {
        return {
            x: window.scrollX,
            y: window.scrollY
        };
    }

    static scrollTo(element, options = {}) {
        const defaultOptions = {
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
        };
        
        element.scrollIntoView({ ...defaultOptions, ...options });
    }

    static scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    static scrollToBottom() {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }

    static disableScroll() {
        document.body.style.overflow = 'hidden';
    }

    static enableScroll() {
        document.body.style.overflow = '';
    }

    static addClass(element, className) {
        if (element && className) {
            element.classList.add(className);
        }
    }

    static removeClass(element, className) {
        if (element && className) {
            element.classList.remove(className);
        }
    }

    static toggleClass(element, className) {
        if (element && className) {
            element.classList.toggle(className);
        }
    }

    static hasClass(element, className) {
        return element && element.classList.contains(className);
    }

    static getParents(element, selector) {
        const parents = [];
        let current = element.parentElement;
        
        while (current) {
            if (selector) {
                if (current.matches(selector)) {
                    parents.push(current);
                }
            } else {
                parents.push(current);
            }
            current = current.parentElement;
        }
        
        return parents;
    }

    static getSiblings(element, selector) {
        const siblings = [];
        let sibling = element.parentElement.firstChild;
        
        while (sibling) {
            if (sibling.nodeType === 1 && sibling !== element) {
                if (selector) {
                    if (sibling.matches(selector)) {
                        siblings.push(sibling);
                    }
                } else {
                    siblings.push(sibling);
                }
            }
            sibling = sibling.nextSibling;
        }
        
        return siblings;
    }

    static getChildren(element, selector) {
        const children = Array.from(element.children);
        
        if (selector) {
            return children.filter(child => child.matches(selector));
        }
        
        return children;
    }

    static getOffset(element) {
        const rect = element.getBoundingClientRect();
        return {
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            height: rect.height
        };
    }

    static isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    static getMousePosition(event) {
        return {
            x: event.clientX,
            y: event.clientY
        };
    }

    static getTouchPosition(event) {
        const touch = event.touches[0] || event.changedTouches[0];
        return {
            x: touch.clientX,
            y: touch.clientY
        };
    }

    static preventDefault(event) {
        event.preventDefault();
    }

    static stopPropagation(event) {
        event.stopPropagation();
    }

    static addEventListener(element, event, handler, options) {
        element.addEventListener(event, handler, options);
        return () => element.removeEventListener(event, handler, options);
    }

    static removeEventListener(element, event, handler, options) {
        element.removeEventListener(event, handler, options);
    }

    static dispatchEvent(element, eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        element.dispatchEvent(event);
    }

    static createEvent(eventName, detail = {}) {
        return new CustomEvent(eventName, { detail });
    }

    static waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }

            const observer = new MutationObserver(() => {
                if (document.querySelector(selector)) {
                    observer.disconnect();
                    resolve(document.querySelector(selector));
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element ${selector} not found`));
            }, timeout);
        });
    }

    static waitForEvent(element, eventName, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                element.removeEventListener(eventName, handler);
                reject(new Error(`Event ${eventName} not fired`));
            }, timeout);

            const handler = (event) => {
                clearTimeout(timer);
                resolve(event);
            };

            element.addEventListener(eventName, handler, { once: true });
        });
    }

    static async loadScript(src, options = {}) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            
            Object.entries(options).forEach(([key, value]) => {
                script[key] = value;
            });

            script.onload = () => resolve(script);
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));

            document.head.appendChild(script);
        });
    }

    static async loadStyle(href) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            
            link.onload = () => resolve(link);
            link.onerror = () => reject(new Error(`Failed to load stylesheet: ${href}`));

            document.head.appendChild(link);
        });
    }

    static removeScript(src) {
        const scripts = document.querySelectorAll(`script[src="${src}"]`);
        scripts.forEach(script => script.remove());
    }

    static removeStyle(href) {
        const links = document.querySelectorAll(`link[href="${href}"]`);
        links.forEach(link => link.remove());
    }

    static injectCSS(css) {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
        return style;
    }

    static injectScript(code) {
        const script = document.createElement('script');
        script.textContent = code;
        document.head.appendChild(script);
        return script;
    }

    static removeInjectedElement(element) {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }

    static createDataURI(data, mimeType) {
        return `data:${mimeType};base64,${btoa(data)}`;
    }

    static parseDataURI(dataURI) {
        const matches = dataURI.match(/^data:([^;]+);base64,(.+)$/);
        if (!matches) {
            throw new Error('Invalid data URI');
        }
        return {
            mimeType: matches[1],
            data: atob(matches[2])
        };
    }

    static getBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    static blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    static base64ToBlob(base64, mimeType) {
        const byteCharacters = atob(base64.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
    }

    static getFileExtension(filename) {
        return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
    }

    static getFileNameWithoutExtension(filename) {
        return filename.replace(/\.[^/.]+$/, '');
    }

    static sanitizeFilename(filename) {
        return filename.replace(/[^a-z0-9.\-_]/gi, '_').toLowerCase();
    }

    static getMimeType(extension) {
        const mimeTypes = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'svg': 'image/svg+xml',
            'webp': 'image/webp',
            'pdf': 'application/pdf',
            'zip': 'application/zip',
            'json': 'application/json',
            'txt': 'text/plain',
            'csv': 'text/csv',
            'html': 'text/html',
            'css': 'text/css',
            'js': 'application/javascript'
        };
        
        return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
    }

    static getExtensionFromMimeType(mimeType) {
        const extensions = {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/svg+xml': 'svg',
            'image/webp': 'webp',
            'application/pdf': 'pdf',
            'application/zip': 'zip',
            'application/json': 'json',
            'text/plain': 'txt',
            'text/csv': 'csv',
            'text/html': 'html',
            'text/css': 'css',
            'application/javascript': 'js'
        };
        
        return extensions[mimeType] || 'bin';
    }

    static isImageFile(filename) {
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'tiff'];
        const extension = this.getFileExtension(filename).toLowerCase();
        return imageExtensions.includes(extension);
    }

    static isVideoFile(filename) {
        const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'];
        const extension = this.getFileExtension(filename).toLowerCase();
        return videoExtensions.includes(extension);
    }

    static isAudioFile(filename) {
        const audioExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'];
        const extension = this.getFileExtension(filename).toLowerCase();
        return audioExtensions.includes(extension);
    }

    static isDocumentFile(filename) {
        const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf'];
        const extension = this.getFileExtension(filename).toLowerCase();
        return documentExtensions.includes(extension);
    }

    static isArchiveFile(filename) {
        const archiveExtensions = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'];
        const extension = this.getFileExtension(filename).toLowerCase();
        return archiveExtensions.includes(extension);
    }

    static getFileCategory(filename) {
        if (this.isImageFile(filename)) return 'image';
        if (this.isVideoFile(filename)) return 'video';
        if (this.isAudioFile(filename)) return 'audio';
        if (this.isDocumentFile(filename)) return 'document';
        if (this.isArchiveFile(filename)) return 'archive';
        return 'other';
    }

    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static validatePhone(phone) {
        const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
        return re.test(phone);
    }

    static validateURL(url) {
        try {
            new URL(url);
            return true;
        } catch (error) {
            return false;
        }
    }

    static validateIP(ip) {
        const re = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return re.test(ip);
    }

    static validateCreditCard(cardNumber) {
        // Luhn algorithm
        let sum = 0;
        let isEven = false;
        
        for (let i = cardNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cardNumber.charAt(i), 10);
            
            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            
            sum += digit;
            isEven = !isEven;
        }
        
        return sum % 10 === 0;
    }

    static getCreditCardType(cardNumber) {
        const patterns = {
            visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
            mastercard: /^5[1-5][0-9]{14}$/,
            amex: /^3[47][0-9]{13}$/,
            diners: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
            discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
            jcb: /^(?:2131|1800|35\d{3})\d{11}$/
        };
        
        for (const [type, pattern] of Object.entries(patterns)) {
            if (pattern.test(cardNumber)) {
                return type;
            }
        }
        
        return 'unknown';
    }

    static formatCreditCard(cardNumber) {
        const type = this.getCreditCardType(cardNumber);
        
        switch (type) {
            case 'amex':
                return cardNumber.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');
            default:
                return cardNumber.replace(/(\d{4})/g, '$1 ').trim();
        }
    }

    static maskCreditCard(cardNumber) {
        const last4 = cardNumber.slice(-4);
        return `**** **** **** ${last4}`;
    }

    static maskEmail(email) {
        const [local, domain] = email.split('@');
        const maskedLocal = local.charAt(0) + '***' + local.charAt(local.length - 1);
        return `${maskedLocal}@${domain}`;
    }

    static maskPhone(phone) {
        return phone.replace(/\d(?=\d{4})/g, '*');
    }

    static generatePassword(length = 12, options = {}) {
        const defaults = {
            uppercase: true,
            lowercase: true,
            numbers: true,
            symbols: true
        };
        
        const config = { ...defaults, ...options };
        
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        let chars = '';
        if (config.uppercase) chars += uppercase;
        if (config.lowercase) chars += lowercase;
        if (config.numbers) chars += numbers;
        if (config.symbols) chars += symbols;
        
        if (chars.length === 0) {
            throw new Error('At least one character type must be selected');
        }
        
        let password = '';
        for (let i = 0; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return password;
    }

    static calculatePasswordStrength(password) {
        let strength = 0;
        
        // Length
        if (password.length >= 8) strength += 1;
        if (password.length >= 12) strength += 1;
        if (password.length >= 16) strength += 1;
        
        // Character types
        if (/[a-z]/.test(password)) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^a-zA-Z0-9]/.test(password)) strength += 1;
        
        // Deductions for patterns
        if (/(.)\1{2,}/.test(password)) strength -= 1; // Repeated characters
        if (/^[a-zA-Z]+$/.test(password)) strength -= 1; // Letters only
        if (/^[0-9]+$/.test(password)) strength -= 1; // Numbers only
        
        // Normalize to 0-10 scale
        strength = Math.max(0, Math.min(10, strength * 2));
        
        return {
            score: strength,
            percentage: strength * 10,
            label: strength < 4 ? 'Weak' : strength < 7 ? 'Fair' : strength < 9 ? 'Good' : 'Strong'
        };
    }

    static getColorFromString(str) {
        const hash = this.stringToHash(str);
        const hue = hash % 360;
        return `hsl(${hue}, 70%, 60%)`;
    }

    static getInitials(name) {
        return name
            .split(' ')
            .map(part => part.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }

    static capitalize(str) {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    }

    static camelCase(str) {
        return str
            .replace(/[^a-zA-Z0-9]+/g, ' ')
            .split(' ')
            .map((word, index) => {
                if (index === 0) {
                    return word.toLowerCase();
                }
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join('');
    }

    static snakeCase(str) {
        return str
            .replace(/[^a-zA-Z0-9]+/g, '_')
            .replace(/([a-z])([A-Z])/g, '$1_$2')
            .toLowerCase();
    }

    static kebabCase(str) {
        return str
            .replace(/[^a-zA-Z0-9]+/g, '-')
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .toLowerCase();
    }

    static pascalCase(str) {
        return str
            .replace(/[^a-zA-Z0-9]+/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('');
    }

    static truncate(str, length, suffix = '...') {
        if (str.length <= length) return str;
        return str.substring(0, length - suffix.length) + suffix;
    }

    static stripHtml(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || '';
    }

    static escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    static unescapeHtml(str) {
        const div = document.createElement('div');
        div.innerHTML = str;
        return div.textContent || div.innerText || '';
    }

    static parseQueryString(queryString) {
        const params = new URLSearchParams(queryString);
        const result = {};
        
        for (const [key, value] of params) {
            result[key] = value;
        }
        
        return result;
    }

    static buildQueryString(params) {
        return new URLSearchParams(params).toString();
    }

    static getCurrentUrl() {
        return window.location.href;
    }

    static getCurrentPath() {
        return window.location.pathname;
    }

    static getCurrentHost() {
        return window.location.host;
    }

    static getCurrentProtocol() {
        return window.location.protocol;
    }

    static getCurrentPort() {
        return window.location.port;
    }

    static redirect(url, newTab = false) {
        if (newTab) {
            window.open(url, '_blank');
        } else {
            window.location.href = url;
        }
    }

    static reload() {
        window.location.reload();
    }

    static goBack() {
        window.history.back();
    }

    static goForward() {
        window.history.forward();
    }

    static pushState(state, title, url) {
        window.history.pushState(state, title, url);
    }

    static replaceState(state, title, url) {
        window.history.replaceState(state, title, url);
    }

    static getHistoryLength() {
        return window.history.length;
    }

    static getReferrer() {
        return document.referrer;
    }

    static getUserLanguage() {
        return navigator.language || navigator.userLanguage;
    }

    static getUserTimezone() {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    static getUserCountry() {
        // Nota: Esto es una aproximación basada en el idioma
        const language = this.getUserLanguage();
        return language.split('-')[1] || 'unknown';
    }

    static getUserAgent() {
        return navigator.userAgent;
    }

    static getScreenResolution() {
        return {
            width: screen.width,
            height: screen.height,
            availWidth: screen.availWidth,
            availHeight: screen.availHeight,
            colorDepth: screen.colorDepth,
            pixelDepth: screen.pixelDepth
        };
    }

    static getWindowSize() {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            outerWidth: window.outerWidth,
            outerHeight: window.outerHeight
        };
    }

    static getScrollbarWidth() {
        const outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.overflow = 'scroll';
        outer.style.width = '100px';
        document.body.appendChild(outer);

        const inner = document.createElement('div');
        inner.style.width = '100%';
        outer.appendChild(inner);

        const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

        outer.parentNode.removeChild(outer);

        return scrollbarWidth;
    }

    static isFullscreen() {
        return !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
        );
    }

    static requestFullscreen(element = document.documentElement) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }

    static exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    static toggleFullscreen(element = document.documentElement) {
        if (this.isFullscreen()) {
            this.exitFullscreen();
        } else {
            this.requestFullscreen(element);
        }
    }

    static vibrate(pattern) {
        if (navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }

    static share(data) {
        if (navigator.share) {
            return navigator.share(data);
        }
        return Promise.reject(new Error('Web Share API not supported'));
    }

    static async getClipboardText() {
        try {
            return await navigator.clipboard.readText();
        } catch (error) {
            throw new Error('Failed to read clipboard');
        }
    }

    static async setClipboardText(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            throw new Error('Failed to write to clipboard');
        }
    }

    static async getClipboardImage() {
        try {
            const items = await navigator.clipboard.read();
            for (const item of items) {
                for (const type of item.types) {
                    if (type.startsWith('image/')) {
                        const blob = await item.getType(type);
                        return URL.createObjectURL(blob);
                    }
                }
            }
            throw new Error('No image found in clipboard');
        } catch (error) {
            throw new Error('Failed to read clipboard image');
        }
    }

    static getGeolocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                position => resolve(position.coords),
                error => reject(error),
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        });
    }

    static async getAddressFromCoords(latitude, longitude) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            return data.address;
        } catch (error) {
            throw new Error('Failed to get address');
        }
    }

    static async getCoordsFromAddress(address) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
            );
            const data = await response.json();
            if (data.length > 0) {
                return {
                    latitude: parseFloat(data[0].lat),
                    longitude: parseFloat(data[0].lon)
                };
            }
            throw new Error('Address not found');
        } catch (error) {
            throw new Error('Failed to get coordinates');
        }
    }

    static calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in kilometers
    }

    static deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

    static rad2deg(rad) {
        return rad * (180 / Math.PI);
    }

    static formatDistance(distance, unit = 'km') {
        if (unit === 'km') {
            if (distance < 1) {
                return `${Math.round(distance * 1000)} m`;
            }
            return `${distance.toFixed(1)} km`;
        } else if (unit === 'mi') {
            const miles = distance * 0.621371;
            if (miles < 1) {
                return `${Math.round(miles * 1760)} yd`;
            }
            return `${miles.toFixed(1)} mi`;
        }
        return distance.toFixed(1);
    }

    static getBearing(lat1, lon1, lat2, lon2) {
        const φ1 = this.deg2rad(lat1);
        const φ2 = this.deg2rad(lat2);
        const Δλ = this.deg2rad(lon2 - lon1);

        const y = Math.sin(Δλ) * Math.cos(φ2);
        const x = Math.cos(φ1) * Math.sin(φ2) -
                Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
        const θ = Math.atan2(y, x);

        return (this.rad2deg(θ) + 360) % 360;
    }

    static getCardinalDirection(bearing) {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const index = Math.round(bearing / 45) % 8;
        return directions[index];
    }

    static getSunriseSunset(latitude, longitude, date = new Date()) {
        const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
        
        // Solar declination
        const declination = 23.45 * Math.sin((2 * Math.PI / 365) * (dayOfYear - 81));
        
        // Sunrise/sunset calculation (simplified)
        const latRad = this.deg2rad(latitude);
        const decRad = this.deg2rad(declination);
        
        const hourAngle = Math.acos(-Math.tan(latRad) * Math.tan(decRad));
        const sunrise = 12 - (this.rad2deg(hourAngle) / 15) - (longitude / 15);
        const sunset = 12 + (this.rad2deg(hourAngle) / 15) - (longitude / 15);
        
        return {
            sunrise: new Date(date.getFullYear(), date.getMonth(), date.getDate(), Math.floor(sunrise), (sunrise % 1) * 60),
            sunset: new Date(date.getFullYear(), date.getMonth(), date.getDate(), Math.floor(sunset), (sunset % 1) * 60)
        };
    }

    static getMoonPhase(date = new Date()) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        // Simplified moon phase calculation
        const c = (year % 100) * 365.25;
        const e = (month + 1) * 30.6;
        const jd = c + e + day - 694039.09;
        const phase = (jd / 29.5305882) % 1;
        
        if (phase < 0.0625) return 'New Moon';
        if (phase < 0.1875) return 'Waxing Crescent';
        if (phase < 0.3125) return 'First Quarter';
        if (phase < 0.4375) return 'Waxing Gibbous';
        if (phase < 0.5625) return 'Full Moon';
        if (phase < 0.6875) return 'Waning Gibbous';
        if (phase < 0.8125) return 'Last Quarter';
        if (phase < 0.9375) return 'Waning Crescent';
        return 'New Moon';
    }

    static getTidalCoefficient(date = new Date()) {
        // Simplified tidal coefficient (random for demo)
        const base = 40;
        const variation = 60;
        const cycle = Math.sin((2 * Math.PI / 14.77) * (date.getTime() / 86400000));
        return Math.round(base + (variation * cycle));
    }

    static getWeatherIcon(condition) {
        const icons = {
            'clear': '☀️',
            'clouds': '☁️',
            'rain': '🌧️',
            'snow': '❄️',
            'thunderstorm': '⛈️',
            'drizzle': '🌦️',
            'mist': '🌫️'
        };
        
        return icons[condition.toLowerCase()] || '🌈';
    }

    static celsiusToFahrenheit(celsius) {
        return (celsius * 9/5) + 32;
    }

    static fahrenheitToCelsius(fahrenheit) {
        return (fahrenheit - 32) * 5/9;
    }

    static metersToFeet(meters) {
        return meters * 3.28084;
    }

    static feetToMeters(feet) {
        return feet / 3.28084;
    }

    static kilometersToMiles(km) {
        return km * 0.621371;
    }

    static milesToKilometers(miles) {
        return miles / 0.621371;
    }

    static kilogramsToPounds(kg) {
        return kg * 2.20462;
    }

    static poundsToKilograms(lb) {
        return lb / 2.20462;
    }

    static litersToGallons(liters) {
        return liters * 0.264172;
    }

    static gallonsToLiters(gallons) {
        return gallons / 0.264172;
    }

    static formatTemperature(temp, unit = 'C') {
        if (unit === 'C') {
            return `${Math.round(temp)}°C`;
        } else {
            return `${Math.round(this.celsiusToFahrenheit(temp))}°F`;
        }
    }

    static formatSpeed(speed, unit = 'km/h') {
        if (unit === 'km/h') {
            return `${Math.round(speed)} km/h`;
        } else {
            return `${Math.round(speed * 0.621371)} mph`;
        }
    }

    static formatPressure(pressure, unit = 'hPa') {
        if (unit === 'hPa') {
            return `${Math.round(pressure)} hPa`;
        } else {
            return `${Math.round(pressure * 0.02953)} inHg`;
        }
    }

    static getWindDirection(degrees) {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round(degrees / 22.5) % 16;
        return directions[index];
    }

    static calculateWindChill(temp, windSpeed, unit = 'C') {
        // Wind chill formula (in metric)
        if (temp > 10 || windSpeed < 4.8) return temp;
        
        const windChill = 13.12 + 0.6215 * temp - 11.37 * Math.pow(windSpeed, 0.16) + 0.3965 * temp * Math.pow(windSpeed, 0.16);
        
        if (unit === 'F') {
            return this.celsiusToFahrenheit(windChill);
        }
        
        return windChill;
    }

    static calculateHeatIndex(temp, humidity, unit = 'C') {
        // Heat index formula (in metric)
        if (temp < 27 || humidity < 40) return temp;
        
        const c1 = -8.78469475556;
        const c2 = 1.61139411;
        const c3 = 2.33854883889;
        const c4 = -0.14611605;
        const c5 = -0.012308094;
        const c6 = -0.0164248277778;
        const c7 = 0.002211732;
        const c8 = 0.00072546;
        const c9 = -0.000003582;
        
        const T = temp;
        const R = humidity;
        
        const heatIndex = c1 + c2*T + c3*R + c4*T*R + c5*T*T + c6*R*R + c7*T*T*R + c8*T*R*R + c9*T*T*R*R;
        
        if (unit === 'F') {
            return this.celsiusToFahrenheit(heatIndex);
        }
        
        return heatIndex;
    }

    static getUVIndexLevel(uvIndex) {
        if (uvIndex <= 2) return { level: 'Low', color: '#3EA72D' };
        if (uvIndex <= 5) return { level: 'Moderate', color: '#FFF300' };
        if (uvIndex <= 7) return { level: 'High', color: '#F18B00' };
        if (uvIndex <= 10) return { level: 'Very High', color: '#E53210' };
        return { level: 'Extreme', color: '#B567A4' };
    }

    static calculateDewPoint(temp, humidity, unit = 'C') {
        // Magnus formula
        const a = 17.27;
        const b = 237.7;
        
        const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
        const dewPoint = (b * alpha) / (a - alpha);
        
        if (unit === 'F') {
            return this.celsiusToFahrenheit(dewPoint);
        }
        
        return dewPoint;
    }

    static getHumidityLevel(humidity) {
        if (humidity < 30) return 'Dry';
        if (humidity < 50) return 'Comfortable';
        if (humidity < 70) return 'Moderate';
        if (humidity < 90) return 'Humid';
        return 'Very Humid';
    }

    static getAirQualityIndex(pm25) {
        if (pm25 <= 12) return { level: 'Good', color: '#00E400' };
        if (pm25 <= 35.4) return { level: 'Moderate', color: '#FFFF00' };
        if (pm25 <= 55.4) return { level: 'Unhealthy for Sensitive Groups', color: '#FF7E00' };
        if (pm25 <= 150.4) return { level: 'Unhealthy', color: '#FF0000' };
        if (pm25 <= 250.4) return { level: 'Very Unhealthy', color: '#8F3F97' };
        return { level: 'Hazardous', color: '#7E0023' };
    }

    static calculateVisibility(distance, unit = 'km') {
        if (unit === 'km') {
            if (distance < 1) {
                return `${Math.round(distance * 1000)} m`;
            }
            return `${distance.toFixed(1)} km`;
        } else {
            const miles = distance * 0.621371;
            if (miles < 1) {
                return `${Math.round(miles * 1760)} yd`;
            }
            return `${miles.toFixed(1)} mi`;
        }
    }

    static getVisibilityLevel(visibility) {
        if (visibility >= 10) return 'Excellent';
        if (visibility >= 5) return 'Good';
        if (visibility >= 2) return 'Moderate';
        if (visibility >= 1) return 'Poor';
        return 'Very Poor';
    }

    static getCloudCoverLevel(cloudCover) {
        if (cloudCover < 10) return 'Clear';
        if (cloudCover < 25) return 'Mostly Clear';
        if (cloudCover < 50) return 'Partly Cloudy';
        if (cloudCover < 85) return 'Mostly Cloudy';
        return 'Overcast';
    }

    static getPrecipitationIntensity(precipitation) {
        if (precipitation < 0.1) return 'None';
        if (precipitation < 2.5) return 'Light';
        if (precipitation < 7.6) return 'Moderate';
        if (precipitation < 50) return 'Heavy';
        return 'Violent';
    }

    static calculateTotalPrecipitation(rain, snow) {
        // Convert snow to rain equivalent (10:1 ratio)
        return rain + (snow / 10);
    }

    static getSnowDepthLevel(snowDepth) {
        if (snowDepth < 1) return 'None';
        if (snowDepth < 10) return 'Light';
        if (snowDepth < 25) return 'Moderate';
        if (snowDepth < 50) return 'Heavy';
        return 'Extreme';
    }

    static calculateGrowingDegreeDays(baseTemp, maxTemp, minTemp, unit = 'C') {
        const avgTemp = (maxTemp + minTemp) / 2;
        const gdd = Math.max(0, avgTemp - baseTemp);
        
        if (unit === 'F') {
            return this.celsiusToFahrenheit(gdd);
        }
        
        return gdd;
    }

    static calculateChillHours(temps, threshold = 7.2) {
        return temps.filter(temp => temp <= threshold).length;
    }

    static getGrowingSeason(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    static getFrostDates(lastFrost, firstFrost) {
        return {
            lastFrost: new Date(lastFrost),
            firstFrost: new Date(firstFrost),
            growingSeason: this.getGrowingSeason(lastFrost, firstFrost)
        };
    }

    static calculateSoilMoisture(precipitation, evapotranspiration, previousMoisture = 0) {
        const netMoisture = precipitation - evapotranspiration;
        return Math.max(0, previousMoisture + netMoisture);
    }

    static getSoilMoistureLevel(moisture) {
        if (moisture < 10) return 'Very Dry';
        if (moisture < 25) return 'Dry';
        if (moisture < 40) return 'Moderate';
        if (moisture < 60) return 'Moist';
        return 'Very Moist';
    }

    static calculateEvapotranspiration(temp, humidity, windSpeed, solarRadiation) {
        // Simplified Penman-Monteith equation
        const delta = 4098 * (0.6108 * Math.exp((17.27 * temp) / (temp + 237.3))) / Math.pow((temp + 237.3), 2);
        const gamma = 0.665 * 0.001 * 101.3;
        const es = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
        const ea = es * (humidity / 100);
        const vaporPressureDeficit = es - ea;
        
        const radiationTerm = (0.408 * delta * solarRadiation) / (delta + gamma * (1 + 0.34 * windSpeed));
        const windTerm = (gamma * (900 / (temp + 273)) * windSpeed * vaporPressureDeficit) / (delta + gamma * (1 + 0.34 * windSpeed));
        
        return radiationTerm + windTerm;
    }

    static getSolarRadiationLevel(radiation) {
        if (radiation < 100) return 'Very Low';
        if (radiation < 300) return 'Low';
        if (radiation < 500) return 'Moderate';
        if (radiation < 700) return 'High';
        return 'Very High';
    }

    static calculateSunshineHours(dayLength, cloudCover) {
        return dayLength * (1 - (cloudCover / 100));
    }

    static getDayLength(latitude, date = new Date()) {
        const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
        const declination = 23.45 * Math.sin((2 * Math.PI / 365) * (dayOfYear - 81));
        
        const latRad = this.deg2rad(latitude);
        const decRad = this.deg2rad(declination);
        
        const hourAngle = Math.acos(-Math.tan(latRad) * Math.tan(decRad));
        return (2 * this.rad2deg(hourAngle) / 15);
    }

    static getCivilTwilight(latitude, date = new Date()) {
        const dayLength = this.getDayLength(latitude, date);
        return {
            dawn: 6 - (dayLength / 2),
            dusk: 18 + (dayLength / 2)
        };
    }

    static getAstronomicalTwilight(latitude, date = new Date()) {
        const civil = this.getCivilTwilight(latitude, date);
        return {
            dawn: civil.dawn - 1,
            dusk: civil.dusk + 1
        };
    }

    static calculateMoonIllumination(date = new Date()) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        const c = (year % 100) * 365.25;
        const e = (month + 1) * 30.6;
        const jd = c + e + day - 694039.09;
        const phase = (jd / 29.5305882) % 1;
        
        return Math.abs(phase - 0.5) * 2;
    }

    static getTideType(coefficient) {
        if (coefficient >= 95) return 'Spring Tide';
        if (coefficient <= 45) return 'Neap Tide';
        return 'Normal Tide';
    }

    static calculateWaveHeight(windSpeed, fetch, duration) {
        // Simplified wave height calculation
        return 0.0248 * Math.pow(windSpeed, 2) * Math.sqrt(fetch) * Math.sqrt(duration);
    }

    static getWaveHeightLevel(height) {
        if (height < 0.5) return 'Calm';
        if (height < 1.25) return 'Smooth';
        if (height < 2.5) return 'Slight';
        if (height < 4) return 'Moderate';
        if (height < 6) return 'Rough';
        return 'Very Rough';
    }

    static calculateSwellPeriod(waveHeight, windSpeed) {
        // Simplified swell period calculation
        return 0.56 * Math.sqrt(waveHeight) * windSpeed;
    }

    static getSwellDirection(swellAngle) {
        return this.getWindDirection(swellAngle);
    }

    static calculateWaterTemperature(airTemp, solarRadiation, previousWaterTemp = 15) {
        // Simplified water temperature calculation
        const heating = solarRadiation * 0.001;
        const cooling = (airTemp - previousWaterTemp) * 0.1;
        return previousWaterTemp + heating + cooling;
    }

    static getWaterTemperatureLevel(temp) {
        if (temp < 10) return 'Very Cold';
        if (temp < 15) return 'Cold';
        if (temp < 20) return 'Cool';
        if (temp < 25) return 'Warm';
        if (temp < 30) return 'Hot';
        return 'Very Hot';
    }

    static calculateDiveTime(depth, airSupply, consumptionRate = 20) {
        // Simplified dive time calculation
        const ambientPressure = 1 + (depth / 10);
        const airConsumption = consumptionRate * ambientPressure;
        return (airSupply * 1000) / airConsumption;
    }

    static getDiveTimeLevel(time) {
        if (time < 30) return 'Short';
        if (time < 60) return 'Moderate';
        if (time < 90) return 'Long';
        return 'Very Long';
    }

    static calculateNoDecompressionLimit(depth) {
        // Simplified NDL calculation (recreational diving)
        const limits = {
            10: 219, 12: 147, 14: 97, 16: 72, 18: 56,
            20: 45, 22: 37, 24: 32, 26: 28, 28: 25,
            30: 22, 32: 20, 34: 18, 36: 17, 38: 16,
            40: 15
        };
        
        for (const [key, value] of Object.entries(limits)) {
            if (depth <= parseInt(key)) {
                return value;
            }
        }
        
        return 0;
    }

    static calculateSurfaceInterval(pressureGroup, targetGroup = 'A') {
        // Simplified surface interval calculation
        const groups = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        const startIndex = groups.indexOf(pressureGroup);
        const targetIndex = groups.indexOf(targetGroup);
        
        if (startIndex <= targetIndex) return 0;
        
        const interval = (startIndex - targetIndex) * 10; // minutes
        return interval;
    }

    static getPressureGroup(depth, bottomTime) {
        // Simplified pressure group calculation
        const groups = [
            [10, 219], [12, 147], [14, 97], [16, 72], [18, 56],
            [20, 45], [22, 37], [24, 32], [26, 28], [28, 25],
            [30, 22], [32, 20], [34, 18], [36, 17], [38, 16],
            [40, 15]
        ];
        
        for (let i = 0; i < groups.length; i++) {
            if (depth <= groups[i][0] && bottomTime <= groups[i][1]) {
                return String.fromCharCode(65 + i); // A, B, C, etc.
            }
        }
        
        return 'Z'; // Exceeds limits
    }

    static calculateRequiredSurfaceInterval(pressureGroup1, pressureGroup2) {
        const groups = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        const index1 = groups.indexOf(pressureGroup1);
        const index2 = groups.indexOf(pressureGroup2);
        
        if (index1 <= index2) return 0;
        
        const minutes = (index1 - index2) * 10;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        
        return { hours, minutes: remainingMinutes, totalMinutes: minutes };
    }

    static calculateEANxO2Percentage(depth, po2 = 1.4) {
        const ambientPressure = 1 + (depth / 10);
        return (po2 / ambientPressure) * 100;
    }

    static calculateMOD(o2Percentage, po2 = 1.4) {
        return ((po2 / (o2Percentage / 100)) - 1) * 10;
    }

    static calculateBestMix(depth, po2 = 1.4) {
        const ambientPressure = 1 + (depth / 10);
        return (po2 / ambientPressure) * 100;
    }

    static calculateEquivalentAirDepth(depth, o2Percentage) {
        const fn2 = 1 - (o2Percentage / 100);
        return ((depth + 10) * fn2 / 0.79) - 10;
    }

    static calculateCNS(totalO2, depth, time) {
        const otu = (0.5 / (0.5 / 0.79)) * Math.pow((depth / 10 + 1) * (o2Percentage / 100), 0.83) * time;
        return (totalO2 + otu) / 300 * 100;
    }

    static getCNSToxicityLevel(cns) {
        if (cns < 50) return 'Low';
        if (cns < 80) return 'Moderate';
        if (cns < 100) return 'High';
        return 'Extreme';
    }

    static calculateOTU(o2Percentage, depth, time) {
        const po2 = (depth / 10 + 1) * (o2Percentage / 100);
        return Math.pow(po2, 0.83) * time;
    }

    static calculateEND(depth, o2Percentage, heliumPercentage = 0) {
        const fn2 = 1 - (o2Percentage / 100) - (heliumPercentage / 100);
        return ((depth + 10) * fn2 / 0.79) - 10;
    }

    static calculateGasDensity(depth, o2Percentage, heliumPercentage = 0) {
        const ambientPressure = depth / 10 + 1;
        const n2Percentage = 100 - o2Percentage - heliumPercentage;
        
        const o2Density = 1.429 * (o2Percentage / 100) * ambientPressure;
        const n2Density = 1.251 * (n2Percentage / 100) * ambientPressure;
        const heDensity = 0.1785 * (heliumPercentage / 100) * ambientPressure;
        
        return o2Density + n2Density + heDensity;
    }

    static getGasDensityLevel(density) {
        if (density < 5) return 'Low';
        if (density < 6) return 'Moderate';
        if (density < 7) return 'High';
        return 'Very High';
    }

    static calculateWOB(density, breathingRate = 20) {
        return density * breathingRate * 0.001;
    }

    static getWOBLevel(wob) {
        if (wob < 0.5) return 'Easy';
        if (wob < 1) return 'Moderate';
        if (wob < 1.5) return 'Hard';
        return 'Very Hard';
    }

    static calculateRMV(cylinderSize, pressureStart, pressureEnd, time) {
        const gasUsed = (pressureStart - pressureEnd) * cylinderSize;
        return gasUsed / time;
    }

    static calculateSAC(rmv, depth) {
        const ambientPressure = depth / 10 + 1;
        return rmv / ambientPressure;
    }

    static calculateGasRequirements(depth, time, sac, safetyFactor = 1.5) {
        const ambientPressure = depth / 10 + 1;
        const gasNeeded = sac * ambientPressure * time;
        return gasNeeded * safetyFactor;
    }

    static calculateTurnPressure(depth, time, sac, reserve = 50) {
        const gasNeeded = this.calculateGasRequirements(depth, time, sac);
        return reserve + gasNeeded;
    }

    static calculateDecoStop(depth, time) {
        // Simplified decompression calculation
        if (depth <= 10 && time <= 60) return { stops: [] };
        
        const stops = [];
        let currentDepth = Math.min(depth, 40);
        
        while (currentDepth > 0) {
            if (currentDepth > 30) {
                stops.push({ depth: 30, time: 1 });
                currentDepth -= 10;
            } else if (currentDepth > 20) {
                stops.push({ depth: 20, time: 3 });
                currentDepth -= 10;
            } else if (currentDepth > 10) {
                stops.push({ depth: 10, time: 5 });
                currentDepth -= 10;
            } else {
                stops.push({ depth: 3, time: 8 });
                currentDepth = 0;
            }
        }
        
        return { stops };
    }

    static calculateTotalDecoTime(stops) {
        return stops.reduce((total, stop) => total + stop.time, 0);
    }

    static calculateRequiredGas(decoStops, sac, o2Percentage = 21) {
        let totalGas = 0;
        
        for (const stop of decoStops) {
            const ambientPressure = stop.depth / 10 + 1;
            const gasNeeded = sac * ambientPressure * stop.time * (o2Percentage / 21);
            totalGas += gasNeeded;
        }
        
        return totalGas;
    }

    static calculateGasSwitches(depth, decoStops, availableMixes) {
        const switches = [];
        
        for (const mix of availableMixes) {
            const mod = this.calculateMOD(mix.o2Percentage);
            if (mod >= depth) {
                switches.push({
                    depth: mod,
                    mix: mix,
                    reason: 'Deepest possible with this mix'
                });
            }
        }
        
        return switches;
    }

    static calculateBubbleGrowthRate(depth, time, ascentRate = 10) {
        // Simplified bubble growth model
        const saturation = time / (depth * 10);
        const supersaturation = Math.max(0, saturation - 1);
        return supersaturation * ascentRate * 0.01;
    }

    static getBubbleRiskLevel(growthRate) {
        if (growthRate < 0.1) return 'Low';
        if (growthRate < 0.3) return 'Moderate';
        if (growthRate < 0.5) return 'High';
        return 'Very High';
    }

    static calculateGF(gradientFactor, depth) {
        const ambientPressure = depth / 10 + 1;
        return gradientFactor * (ambientPressure - 1);
    }

    static calculateFirstStop(gfLow, gfHigh, depth, time) {
        // Simplified first stop calculation
        const gf = this.calculateGF(gfLow, depth);
        if (gf > 0.3) {
            return Math.max(3, depth - 10);
        }
        return null;
    }

    static calculateTissueLoading(depth, time, halfTime = 5) {
        const saturation = 1 - Math.exp(-Math.log(2) * time / halfTime);
        return saturation * (depth / 10 + 1);
    }

    static calculateMValue(tissueLoading, gfLow, gfHigh) {
        return tissueLoading * (gfHigh - gfLow) + gfLow;
    }

    static calculateSurfGF(tissueLoading, gfLow) {
        return tissueLoading + gfLow;
    }

    static getDivePlan(depth, time, gasMixes, sac = 20, gfLow = 0.3, gfHigh = 0.85) {
        const plan = {
            depth,
            time,
            noDecoLimit: this.calculateNoDecompressionLimit(depth),
            isNoDeco: time <= this.calculateNoDecompressionLimit(depth),
            gasRequirements: {},
            decoStops: [],
            totalDecoTime: 0,
            requiredGas: 0,
            surfaceInterval: 0,
            pressureGroup: this.getPressureGroup(depth, time)
        };
        
        if (!plan.isNoDeco) {
            plan.decoStops = this.calculateDecoStop(depth, time).stops;
            plan.totalDecoTime = this.calculateTotalDecoTime(plan.decoStops);
            plan.requiredGas = this.calculateRequiredGas(plan.decoStops, sac);
        }
        
        // Calculate gas requirements for each mix
        for (const mix of gasMixes) {
            plan.gasRequirements[mix.name] = this.calculateGasRequirements(
                depth,
                time + plan.totalDecoTime,
                sac,
                mix.o2Percentage
            );
        }
        
        return plan;
    }

    static formatDivePlan(plan) {
        return {
            summary: `Dive to ${plan.depth}m for ${plan.time}min`,
            noDeco: plan.isNoDeco ? `No decompression required` : `Decompression required`,
            decoInfo: plan.isNoDeco ? '' : `Total deco time: ${plan.totalDecoTime}min`,
            gasInfo: Object.entries(plan.gasRequirements)
                .map(([name, amount]) => `${name}: ${Math.round(amount)}L`)
                .join(', '),
            pressureGroup: `Pressure group: ${plan.pressureGroup}`
        };
    }

    static calculateDiveScore(plan, execution, conditions) {
        let score = 100;
        
        // Penalty for exceeding no-deco limit
        if (!plan.isNoDeco && execution.actualTime > plan.noDecoLimit) {
            score -= 20;
        }
        
        // Penalty for fast ascent
        if (execution.ascentRate > 10) {
            score -= Math.min(30, (execution.ascentRate - 10) * 3);
        }
        
        // Bonus for good buoyancy
        if (execution.buoyancyControl < 1) {
            score += 10;
        }
        
        // Penalty for poor conditions
        if (conditions.visibility < 5) {
            score -= 10;
        }
        if (conditions.current > 1) {
            score -= Math.min(20, conditions.current * 10);
        }
        
        return Math.max(0, Math.min(100, score));
    }

    static getDiveScoreLevel(score) {
        if (score >= 90) return 'Excellent';
        if (score >= 80) return 'Good';
        if (score >= 70) return 'Fair';
        if (score >= 60) return 'Poor';
        return 'Dangerous';
    }

    static calculateDiveCost(plan, gasPrice = 0.1, boatCost = 50, guideCost = 30) {
        let cost = boatCost + guideCost;
        
        // Add gas cost
        for (const [mix, amount] of Object.entries(plan.gasRequirements)) {
            cost += amount * gasPrice;
        }
        
        // Add deco gas cost if applicable
        if (!plan.isNoDeco) {
            cost += plan.requiredGas * gasPrice * 1.5; // Deco gas is usually more expensive
        }
        
        return cost;
    }

    static formatDiveCost(cost) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(cost);
    }

    static calculateDiveValue(plan, experience, photos = 0, wildlife = 0) {
        let value = 100;
        
        // Base value based on depth and time
        value += plan.depth * 2;
        value += plan.time;
        
        // Add value for experience
        value += experience * 10;
        
        // Add value for photos and wildlife
        value += photos * 5;
        value += wildlife * 10;
        
        // Reduce value for decompression
        if (!plan.isNoDeco) {
            value -= plan.totalDecoTime * 2;
        }
        
        return Math.max(0, value);
    }

    static getDiveValueLevel(value) {
        if (value >= 200) return 'Exceptional';
        if (value >= 150) return 'Excellent';
        if (value >= 100) return 'Good';
        if (value >= 50) return 'Fair';
        return 'Poor';
    }

    static calculateDiveROI(cost, value) {
        if (cost === 0) return 0;
        return (value / cost) * 100;
    }

    static getDiveROILevel(roi) {
        if (roi >= 200) return 'Excellent';
        if (roi >= 150) return 'Very Good';
        if (roi >= 100) return 'Good';
        if (roi >= 50) return 'Fair';
        return 'Poor';
    }

    static generateDiveReport(plan, execution, conditions, cost, value) {
        const score = this.calculateDiveScore(plan, execution, conditions);
        const roi = this.calculateDiveROI(cost, value);
        
        return {
            summary: {
                date: new Date().toLocaleDateString('es-ES'),
                location: conditions.location,
                depth: `${plan.depth}m`,
                time: `${plan.time}min`,
                score: `${score}/100 (${this.getDiveScoreLevel(score)})`,
                value: `${Math.round(value)} (${this.getDiveValueLevel(value)})`,
                cost: this.formatDiveCost(cost),
                roi: `${Math.round(roi)}% (${this.getDiveROILevel(roi)})`
            },
            details: {
                plan: this.formatDivePlan(plan),
                execution: {
                    actualDepth: `${execution.actualDepth}m`,
                    actualTime: `${execution.actualTime}min`,
                    ascentRate: `${execution.ascentRate}m/min`,
                    buoyancyControl: `${execution.buoyancyControl}/5`
                },
                conditions: {
                    visibility: `${conditions.visibility}m`,
                    current: `${conditions.current}kt`,
                    temperature: `${conditions.temperature}°C`,
                    weather: conditions.weather
                }
            },
            recommendations: this.generateDiveRecommendations(score, plan, execution, conditions)
        };
    }

    static generateDiveRecommendations(score, plan, execution, conditions) {
        const recommendations = [];
        
        if (score < 80) {
            recommendations.push('Consider taking a refresher course');
        }
        
        if (execution.ascentRate > 10) {
            recommendations.push('Practice slower ascents (max 10m/min)');
        }
        
        if (!plan.isNoDeco && execution.actualTime > plan.noDecoLimit) {
            recommendations.push('Plan dives within no-decompression limits');
        }
        
        if (conditions.current > 1) {
            recommendations.push('Consider drift diving techniques');
        }
        
        if (conditions.visibility < 5) {
            recommendations.push('Use a dive light and stay close to buddy');
        }
        
        return recommendations.length > 0 ? recommendations : ['Great dive! Keep up the good work!'];
    }

    static calculateDiveLogStats(logs) {
        const stats = {
            totalDives: logs.length,
            totalTime: 0,
            maxDepth: 0,
            avgDepth: 0,
            avgTime: 0,
            locations: new Set(),
            conditions: {},
            scores: []
        };
        
        for (const log of logs) {
            stats.totalTime += log.time;
            stats.maxDepth = Math.max(stats.maxDepth, log.depth);
            stats.avgDepth += log.depth;
            stats.avgTime += log.time;
            stats.locations.add(log.location);
            stats.scores.push(log.score || 0);
            
            // Track conditions
            for (const [key, value] of Object.entries(log.conditions || {})) {
                if (!stats.conditions[key]) {
                    stats.conditions[key] = {};
                }
                if (!stats.conditions[key][value]) {
                    stats.conditions[key][value] = 0;
                }
                stats.conditions[key][value]++;
            }
        }
        
        if (logs.length > 0) {
            stats.avgDepth /= logs.length;
            stats.avgTime /= logs.length;
        }
        
        // Calculate average score
        if (stats.scores.length > 0) {
            const sum = stats.scores.reduce((a, b) => a + b, 0);
            stats.avgScore = sum / stats.scores.length;
        }
        
        return stats;
    }

    static formatDiveLogStats(stats) {
        return {
            summary: `${stats.totalDives} dives totaling ${stats.totalTime} minutes`,
            depth: `Max: ${stats.maxDepth}m, Avg: ${Math.round(stats.avgDepth)}m`,
            time: `Avg: ${Math.round(stats.avgTime)}min per dive`,
            locations: `${stats.locations.size} different locations`,
            score: `Avg score: ${Math.round(stats.avgScore || 0)}/100`,
            commonConditions: Object.entries(stats.conditions)
                .map(([key, values]) => {
                    const mostCommon = Object.entries(values).sort((a, b) => b[1] - a[1])[0];
                    return `${key}: ${mostCommon[0]} (${mostCommon[1]} times)`;
                })
                .join(', ')
        };
    }

    static generateDiveCertification(dives, requirements) {
        const stats = this.calculateDiveLogStats(dives);
        const metRequirements = [];
        
        for (const req of requirements) {
            let met = false;
            
            switch (req.type) {
                case 'minDives':
                    met = stats.totalDives >= req.value;
                    break;
                case 'minTime':
                    met = stats.totalTime >= req.value;
                    break;
                case 'maxDepth':
                    met = stats.maxDepth >= req.value;
                    break;
                case 'avgScore':
                    met = (stats.avgScore || 0) >= req.value;
                    break;
            }
            
            metRequirements.push({
                requirement: req.description,
                met,
                actual: req.type === 'minDives' ? stats.totalDives :
                        req.type === 'minTime' ? stats.totalTime :
                        req.type === 'maxDepth' ? stats.maxDepth :
                        req.type === 'avgScore' ? Math.round(stats.avgScore || 0) : 0,
                required: req.value
            });
        }
        
        const allMet = metRequirements.every(req => req.met);
        
        return {
            certified: allMet,
            stats: this.formatDiveLogStats(stats),
            requirements: metRequirements,
            recommendation: allMet ? 
                'Congratulations! You meet all requirements for certification.' :
                'Continue practicing. You need to meet the following requirements:'
        };
    }

    static calculateDiveProgress(currentStats, targetStats) {
        const progress = {};
        
        for (const [key, target] of Object.entries(targetStats)) {
            const current = currentStats[key] || 0;
            progress[key] = {
                current,
                target,
                progress: Math.min(100, Math.round((current / target) * 100)),
                remaining: Math.max(0, target - current)
            };
        }
        
        return progress;
    }

    static formatDiveProgress(progress) {
        return Object.entries(progress)
            .map(([key, data]) => 
                `${key}: ${data.current}/${data.target} (${data.progress}%) - ${data.remaining} remaining`
            )
            .join('\n');
    }

    static generateDivePlanTimeline(plan, startTime = new Date()) {
        const timeline = [];
        let currentTime = new Date(startTime);
        
        // Descent
        const descentTime = plan.depth / 10; // 1 minute per 10 meters
        timeline.push({
            time: currentTime.toLocaleTimeString('es-ES'),
            action: 'Start descent',
            depth: 'Surface',
            duration: `${descentTime}min`
        });
        currentTime = new Date(currentTime.getTime() + descentTime * 60000);
        
        // Bottom time
        timeline.push({
            time: currentTime.toLocaleTimeString('es-ES'),
            action: 'Bottom time',
            depth: `${plan.depth}m`,
            duration: `${plan.time}min`
        });
        currentTime = new Date(currentTime.getTime() + plan.time * 60000);
        
        // Ascent and decompression stops
        if (!plan.isNoDeco) {
            for (const stop of plan.decoStops) {
                timeline.push({
                    time: currentTime.toLocaleTimeString('es-ES'),
                    action: 'Decompression stop',
                    depth: `${stop.depth}m`,
                    duration: `${stop.time}min`
                });
                currentTime = new Date(currentTime.getTime() + stop.time * 60000);
            }
        }
        
        // Final ascent to surface
        const finalAscentTime = 3; // Safety stop at 3m
        timeline.push({
            time: currentTime.toLocaleTimeString('es-ES'),
            action: 'Safety stop',
            depth: '3m',
            duration: `${finalAscentTime}min`
        });
        currentTime = new Date(currentTime.getTime() + finalAscentTime * 60000);
        
        timeline.push({
            time: currentTime.toLocaleTimeString('es-ES'),
            action: 'Surface',
            depth: 'Surface',
            duration: 'Dive complete'
        });
        
        return timeline;
    }

    static formatDiveTimeline(timeline) {
        return timeline.map(entry => 
            `${entry.time} - ${entry.action} at ${entry.depth} for ${entry.duration}`
        ).join('\n');
    }

    static calculateDiveGasConsumption(plan, sac, gasMixes) {
        const consumption = {};
        
        for (const mix of gasMixes) {
            let total = 0;
            
            // Bottom gas
            const bottomTime = plan.isNoDeco ? plan.time : plan.noDecoLimit;
            total += this.calculateGasRequirements(plan.depth, bottomTime, sac, mix.o2Percentage);
            
            // Deco gas if applicable
            if (!plan.isNoDeco) {
                for (const stop of plan.decoStops) {
                    total += this.calculateGasRequirements(stop.depth, stop.time, sac, mix.o2Percentage);
                }
            }
            
            consumption[mix.name] = Math.round(total);
        }
        
        return consumption;
    }

    static formatGasConsumption(consumption) {
        return Object.entries(consumption)
            .map(([name, amount]) => `${name}: ${amount}L`)
            .join(', ');
    }

    static calculateDiveBuddySeparation(time, current, visibility) {
        // Simplified separation calculation
        const drift = current * time / 60; // nautical miles
        const separation = drift * 1852; // convert to meters
        
        if (separation > visibility) {
            return {
                separated: true,
                distance: Math.round(separation),
                visibility,
                recommendation: 'Use buddy lines or stay closer together'
            };
        }
        
        return {
            separated: false,
            distance: Math.round(separation),
            visibility,
            recommendation: 'Maintain visual contact'
        };
    }

    static calculateDiveEmergencyAscent(depth, gasLeft, sac, reserve = 50) {
        const timeToSurface = depth / 10; // 1 minute per 10 meters
        const gasNeeded = this.calculateGasRequirements(depth, timeToSurface, sac);
        
        if (gasLeft < gasNeeded + reserve) {
            return {
                emergency: true,
                gasLeft,
                gasNeeded: Math.round(gasNeeded),
                reserve,
                timeToSurface: Math.round(timeToSurface),
                action: 'Make controlled emergency ascent or use alternate air source'
            };
        }
        
        return {
            emergency: false,
            gasLeft,
            gasNeeded: Math.round(gasNeeded),
            reserve,
            timeToSurface: Math.round(timeToSurface),
            action: 'Normal ascent'
        };
    }

    static calculateDiveLostBuddyProcedure(separation, conditions) {
        const procedures = [];
        
        if (separation.distance > conditions.visibility * 2) {
            procedures.push('Search for 1 minute at current depth');
            procedures.push('Ascend to 3m and search for 1 minute');
            procedures.push('Surface and establish visual contact');
            procedures.push('If not found after 5 minutes, initiate emergency procedures');
        } else {
            procedures.push('Search spiral pattern at current depth');
            procedures.push('If not found within 2 minutes, ascend together');
        }
        
        return procedures;
    }

    static generateDiveSafetyChecklist(plan, conditions, equipment) {
        const checklist = {
            preDive: [
                'Medical fitness confirmation',
                'Dive plan reviewed with buddy',
                'Weather and conditions checked',
                'Emergency procedures reviewed',
                'Dive flags/signals confirmed'
            ],
            equipment: [
                'BCD inflated/deflated properly',
                'Regulators breathing smoothly',
                'Air supply confirmed (>200 bar)',
                'Weight system secure',
                'Exposure protection adequate',
                'Dive computer functioning',
                'Surface marker buoy ready',
                'Cutting tool accessible',
                'Dive light/torch working'
            ].filter(item => equipment[item.replace(/ .*/, '').toLowerCase()] !== false),
            buddyCheck: [
                'Begin With Review And Friend',
                'Buoyancy',
                'Weights',
                'Releases',
                'Air',
                'Final OK'
            ],
            entry: [
                'Site survey completed',
                'Entry/exit points identified',
                'Current direction confirmed',
                'Descent/ascent lines available',
                'Emergency equipment accessible'
            ],
            inWater: [
                'Buoyancy check at surface',
                'Equalization practiced',
                'Buddy contact established',
                'Descent/ascent signals agreed',
                'No-deco/time limits confirmed'
            ],
            postDive: [
                'Safety stop completed',
                'Equipment rinsed',
                'Dive log completed',
                'Any issues documented',
                'Hydration and rest'
            ]
        };
        
        // Add condition-specific items
        if (conditions.current > 1) {
            checklist.preDive.push('Drift dive procedures reviewed');
            checklist.equipment.push('Dive reel/surface float');
        }
        
        if (conditions.visibility < 5) {
            checklist.preDive.push('Low visibility procedures reviewed');
            checklist.equipment.push('Dive light/torch');
            checklist.equipment.push('Buddy line');
        }
        
        if (plan.depth > 30) {
            checklist.preDive.push('Deep dive procedures reviewed');
            checklist.equipment.push('Depth gauge/timer');
        }
        
        if (!plan.isNoDeco) {
            checklist.preDive.push('Decompression procedures reviewed');
            checklist.equipment.push('Deco gas analyzed and labeled');
            checklist.equipment.push('Deco tables/computer set');
        }
        
        return checklist;
    }

    static formatSafetyChecklist(checklist) {
        const sections = [];
        
        for (const [section, items] of Object.entries(checklist)) {
            sections.push(`\n${section.toUpperCase()}:`);
            sections.push(...items.map(item => `  ✓ ${item}`));
        }
        
        return sections.join('\n');
    }

    static calculateDiveRiskAssessment(plan, conditions, diverExperience) {
        let riskScore = 0;
        const riskFactors = [];
        
        // Depth risk
        if (plan.depth > 40) {
            riskScore += 30;
            riskFactors.push(`Deep dive (>40m): +30`);
        } else if (plan.depth > 30) {
            riskScore += 20;
            riskFactors.push(`Moderate depth (30-40m): +20`);
        } else if (plan.depth > 20) {
            riskScore += 10;
            riskFactors.push(`Shallow dive (20-30m): +10`);
        }
        
        // Time risk
        if (!plan.isNoDeco) {
            riskScore += 25;
            riskFactors.push(`Decompression required: +25`);
        } else if (plan.time > 40) {
            riskScore += 15;
            riskFactors.push(`Long bottom time (>40min): +15`);
        }
        
        // Conditions risk
        if (conditions.current > 2) {
            riskScore += 30;
            riskFactors.push(`Strong current (>2kt): +30`);
        } else if (conditions.current > 1) {
            riskScore += 20;
            riskFactors.push(`Moderate current (1-2kt): +20`);
        }
        
        if (conditions.visibility < 3) {
            riskScore += 25;
            riskFactors.push(`Poor visibility (<3m): +25`);
        } else if (conditions.visibility < 10) {
            riskScore += 15;
            riskFactors.push(`Limited visibility (3-10m): +15`);
        }
        
        if (conditions.temperature < 10) {
            riskScore += 20;
            riskFactors.push(`Cold water (<10°C): +20`);
        }
        
        // Experience modifier
        const experienceModifier = Math.max(0, 50 - (diverExperience * 10));
        riskScore += experienceModifier;
        riskFactors.push(`Experience level (${diverExperience}/10): +${experienceModifier}`);
        
        // Calculate risk level
        let riskLevel, recommendation;
        if (riskScore >= 80) {
            riskLevel = 'Very High';
            recommendation = 'Reconsider dive plan or cancel dive';
        } else if (riskScore >= 60) {
            riskLevel = 'High';
            recommendation = 'Extensive planning and experienced team required';
        } else if (riskScore >= 40) {
            riskLevel = 'Moderate';
            recommendation = 'Good planning and buddy awareness needed';
        } else if (riskScore >= 20) {
            riskLevel = 'Low';
            recommendation = 'Standard procedures apply';
        } else {
            riskLevel = 'Very Low';
            recommendation = 'Enjoy your dive!';
        }
        
        return {
            score: riskScore,
            level: riskLevel,
            factors: riskFactors,
            recommendation,
            mitigation: this.generateRiskMitigation(riskScore, plan, conditions)
        };
    }

    static generateRiskMitigation(riskScore, plan, conditions) {
        const mitigations = [];
        
        if (riskScore >= 40) {
            mitigations.push('Dive with experienced guide/instructor');
            mitigations.push('Use redundant equipment (pony bottle, spare mask)');
            mitigations.push('Plan conservative gas reserves (+50%)');
        }
        
        if (conditions.current > 1) {
            mitigations.push('Use drift diving techniques');
            mitigations.push('Deploy surface marker buoy');
            mitigations.push('Plan upstream entry and downstream exit');
        }
        
        if (conditions.visibility < 5) {
            mitigations.push('Use buddy lines');
            mitigations.push('Stay in physical contact');
            mitigations.push('Use audible signals (tank bangers)');
        }
        
        if (plan.depth > 30) {
            mitigations.push('Monitor no-deco time closely');
            mitigations.push('Consider using nitrox');
            mitigations.push('Plan shallower safety stop');
        }
        
        if (!plan.isNoDeco) {
            mitigations.push('Carry deco gas (50% or 100% O2)');
            mitigations.push('Use redundant dive computers');
            mitigations.push('Plan extended safety stops');
        }
        
        return mitigations.length > 0 ? mitigations : ['Standard safety procedures sufficient'];
    }

    static formatRiskAssessment(assessment) {
        return `
Risk Score: ${assessment.score}/100
Risk Level: ${assessment.level}
Recommendation: ${assessment.recommendation}

Risk Factors:
${assessment.factors.map(factor => `  • ${factor}`).join('\n')}

Mitigation Strategies:
${assessment.mitigation.map(strategy => `  • ${strategy}`).join('\n')}
        `.trim();
    }

    static calculateDiveInsuranceRequirements(plan, conditions, diverProfile) {
        const requirements = {
            medical: false,
            liability: false,
            equipment: false,
            emergency: false,
            special: []
        };
        
        // Medical insurance for technical dives
        if (plan.depth > 40 || !plan.isNoDeco) {
            requirements.medical = true;
            requirements.special.push('Technical dive medical coverage');
        }
        
        // Liability insurance for guiding/instructing
        if (diverProfile.isProfessional) {
            requirements.liability = true;
            requirements.special.push('Professional liability insurance');
        }
        
        // Equipment insurance for valuable gear
        if (diverProfile.equipmentValue > 5000) {
            requirements.equipment = true;
            requirements.special.push('Equipment insurance (>€5000)');
        }
        
        // Emergency evacuation for remote locations
        if (conditions.remote) {
            requirements.emergency = true;
            requirements.special.push('Emergency evacuation coverage');
        }
        
        // Special conditions
        if (conditions.cold) {
            requirements.special.push('Cold water diving coverage');
        }
        
        if (conditions.wreck) {
            requirements.special.push('Wreck diving coverage');
        }
        
        if (conditions.cave) {
            requirements.special.push('Cave diving coverage (special policy required)');
        }
        
        return requirements;
    }

    static formatInsuranceRequirements(requirements) {
        const sections = [];
        
        sections.push('REQUIRED INSURANCE:');
        
        if (requirements.medical) {
            sections.push('  • Medical insurance (including hyperbaric treatment)');
        }
        
        if (requirements.liability) {
            sections.push('  • Liability insurance (minimum €1,000,000)');
        }
        
        if (requirements.equipment) {
            sections.push('  • Equipment insurance (replacement value)');
        }
        
        if (requirements.emergency) {
            sections.push('  • Emergency evacuation and repatriation');
        }
        
        if (requirements.special.length > 0) {
            sections.push('\nSPECIAL COVERAGE REQUIRED:');
            sections.push(...requirements.special.map(item => `  • ${item}`));
        }
        
        return sections.join('\n');
    }

    static calculateDiveCostBreakdown(plan, conditions, duration = 1) {
        const breakdown = {
            equipment: {
                rental: 0,
                consumables: 0,
                maintenance: 0
            },
            travel: {
                transportation: 0,
                accommodation: 0,
                meals: 0
            },
            services: {
                boat: 0,
                guide: 0,
                fills: 0,
                permits: 0
            },
            insurance: 0,
            training: 0,
            miscellaneous: 0
        };
        
        // Equipment costs
        breakdown.equipment.rental = 50 * duration;
        breakdown.equipment.consumables = 20 * duration;
        breakdown.equipment.maintenance = 10 * duration;
        
        // Travel costs (estimated)
        breakdown.travel.transportation = 100;
        breakdown.travel.accommodation = 80 * duration;
        breakdown.travel.meals = 40 * duration;
        
        // Service costs
        breakdown.services.boat = conditions.boatDive ? 60 : 0;
        breakdown.services.guide = 40;
        breakdown.services.fills = 15 * Math.ceil((plan.time + (plan.totalDecoTime || 0)) / 60);
        breakdown.services.permits = conditions.park ? 20 : 0;
        
        // Insurance (estimated annual cost prorated)
        breakdown.insurance = 300 / 365 * duration;
        
        // Training (if needed)
        if (plan.depth > 30 && !diverProfile.deepCertified) {
            breakdown.training = 400;
        }
        
        if (!plan.isNoDeco && !diverProfile.decoCertified) {
            breakdown.training = 600;
        }
        
        // Calculate totals
        breakdown.total = Object.values(breakdown).reduce((sum, category) => {
            if (typeof category === 'number') {
                return sum + category;
            }
            return sum + Object.values(category).reduce((catSum, value) => catSum + value, 0);
        }, 0);
        
        breakdown.daily = breakdown.total / duration;
        
        return breakdown;
    }

    static formatCostBreakdown(breakdown) {
        const sections = [];
        
        sections.push('COST BREAKDOWN:');
        sections.push(`Total Cost: €${breakdown.total.toFixed(2)}`);
        sections.push(`Daily Cost: €${breakdown.daily.toFixed(2)}`);
        
        sections.push('\nEquipment:');
        for (const [item, cost] of Object.entries(breakdown.equipment)) {
            if (cost > 0) {
                sections.push(`  ${item}: €${cost.toFixed(2)}`);
            }
        }
        
        sections.push('\nTravel:');
        for (const [item, cost] of Object.entries(breakdown.travel)) {
            if (cost > 0) {
                sections.push(`  ${item}: €${cost.toFixed(2)}`);
            }
        }
        
        sections.push('\nServices:');
        for (const [item, cost] of Object.entries(breakdown.services)) {
            if (cost > 0) {
                sections.push(`  ${item}: €${cost.toFixed(2)}`);
            }
        }
        
        if (breakdown.insurance > 0) {
            sections.push(`\nInsurance: €${breakdown.insurance.toFixed(2)}`);
        }
        
        if (breakdown.training > 0) {
            sections.push(`Training: €${breakdown.training.toFixed(2)}`);
        }
        
        return sections.join('\n');
    }

    static calculateDiveEnvironmentalImpact(plan, conditions, groupSize = 2) {
        const impact = {
            physical: 0,
            biological: 0,
            chemical: 0,
            social: 0,
            total: 0
        };
        
        // Physical impact (anchoring, contact)
        if (conditions.boatDive && !conditions.mooring) {
            impact.physical += 30;
        }
        
        if (groupSize > 6) {
            impact.physical += 20;
        }
        
        // Biological impact (marine life disturbance)
        if (conditions.sensitiveArea) {
            impact.biological += 40;
        }
        
        if (plan.time > 60) {
            impact.biological += 20;
        }
        
        // Chemical impact (sunscreen, emissions)
        impact.chemical += 10;
        
        if (conditions.boatDive) {
            impact.chemical += 20;
        }
        
        // Social impact (crowding, cultural)
        if (conditions.popularSite) {
            impact.social += 30;
        }
        
        // Calculate total
        impact.total = Object.values(impact).reduce((sum, value) => sum + value, 0) / 4;
        
        // Determine impact level
        let level, recommendation;
        if (impact.total >= 70) {
            level = 'High';
            recommendation = 'Consider alternative site or smaller group';
        } else if (impact.total >= 40) {
            level = 'Moderate';
            recommendation = 'Follow best practices strictly';
        } else {
            level = 'Low';
            recommendation = 'Good environmental practices';
        }
        
        return {
            scores: impact,
            level,
            recommendation,
            mitigation: this.generateEnvironmentalMitigation(impact)
        };
    }

    static generateEnvironmentalMitigation(impact) {
        const mitigations = [];
        
        if (impact.physical > 30) {
            mitigations.push('Use permanent moorings or drift dive');
            mitigations.push('Maintain good buoyancy control');
            mitigations.push('Avoid contact with marine life');
        }
        
        if (impact.biological > 30) {
            mitigations.push('Avoid sensitive habitats');
            mitigations.push('Maintain distance from marine life');
            mitigations.push('Do not feed or touch animals');
        }
        
        if (impact.chemical > 20) {
            mitigations.push('Use reef-safe sunscreen');
            mitigations.push('Choose eco-friendly dive operators');
            mitigations.push('Properly dispose of waste');
        }
        
        if (impact.social > 20) {
            mitigations.push('Visit during off-peak times');
            mitigations.push('Respect local customs and regulations');
            mitigations.push('Support local conservation efforts');
        }
        
        return mitigations.length > 0 ? mitigations : ['Follow standard environmental guidelines'];
    }

    static formatEnvironmentalImpact(assessment) {
        return `
Environmental Impact Assessment:
Total Score: ${assessment.scores.total.toFixed(1)}/100
Impact Level: ${assessment.level}

Impact Categories:
  Physical: ${assessment.scores.physical}/100
  Biological: ${assessment.scores.biological}/100
  Chemical: ${assessment.scores.chemical}/100
  Social: ${assessment.scores.social}/100

Recommendation: ${assessment.recommendation}

Mitigation Strategies:
${assessment.mitigation.map(strategy => `  • ${strategy}`).join('\n')}
        `.trim();
    }

    static calculateDiveSustainabilityScore(plan, conditions, practices) {
        let score = 100;
        const deductions = [];
        
        // Equipment practices
        if (!practices.ecoFriendlyProducts) {
            score -= 15;
            deductions.push('Non-eco-friendly products: -15');
        }
        
        if (!practices.properWasteDisposal) {
            score -= 20;
            deductions.push('Improper waste disposal: -20');
        }
        
        // Dive practices
        if (!practices.goodBuoyancy) {
            score -= 25;
            deductions.push('Poor buoyancy control: -25');
        }
        
        if (!practices.noContact) {
            score -= 30;
            deductions.push('Contact with marine life: -30');
        }
        
        // Site selection
        if (conditions.sensitiveArea && !practices.experiencedGuide) {
            score -= 20;
            deductions.push('Sensitive area without guide: -20');
        }
        
        // Group size
        if (conditions.groupSize > 8) {
            score -= 15;
            deductions.push('Large group size (>8): -15');
        }
        
        // Local support
        if (!practices.supportLocal) {
            score -= 10;
            deductions.push('Does not support local economy: -10');
        }
        
        // Determine sustainability level
        let level, rating;
        if (score >= 80) {
            level = 'Excellent';
            rating = '🌿🌿🌿🌿🌿';
        } else if (score >= 60) {
            level = 'Good';
            rating = '🌿🌿🌿🌿';
        } else if (score >= 40) {
            level = 'Fair';
            rating = '🌿🌿🌿';
        } else if (score >= 20) {
            level = 'Poor';
            rating = '🌿🌿';
        } else {
            level = 'Unsustainable';
            rating = '🌿';
        }
        
        return {
            score: Math.max(0, score),
            level,
            rating,
            deductions,
            recommendations: this.generateSustainabilityRecommendations(score)
        };
    }

    static generateSustainabilityRecommendations(score) {
        const recommendations = [];
        
        if (score < 80) {
            recommendations.push('Use reef-safe sunscreen and biodegradable products');
        }
        
        if (score < 60) {
            recommendations.push('Practice buoyancy control before diving sensitive sites');
            recommendations.push('Maintain distance from marine life (2m minimum)');
        }
        
        if (score < 40) {
            recommendations.push('Take a buoyancy specialty course');
            recommendations.push('Dive with eco-certified operators');
            recommendations.push('Participate in beach cleanups or coral restoration');
        }
        
        if (score < 20) {
            recommendations.push('Consider not diving until skills improve');
            recommendations.push('Complete environmental awareness training');
        }
        
        return recommendations.length > 0 ? recommendations : ['Excellent sustainable practices!'];
    }

    static formatSustainabilityScore(assessment) {
        return `
Sustainability Score: ${assessment.score}/100
Rating: ${assessment.rating}
Level: ${assessment.level}

Areas for Improvement:
${assessment.deductions.length > 0 ? 
  assessment.deductions.map(deduction => `  • ${deduction}`).join('\n') : 
  '  • No deductions - excellent!'}

Recommendations:
${assessment.recommendations.map(rec => `  • ${rec}`).join('\n')}
        `.trim();
    }

    static generateDiveReportCard(plan, execution, conditions, safety, environment, sustainability) {
        const report = {
            date: new Date().toLocaleDateString('es-ES'),
            location: conditions.location,
            depth: plan.depth,
            time: plan.time,
            score: this.calculateDiveScore(plan, execution, conditions),
            safety: safety.score,
            environment: environment.scores.total,
            sustainability: sustainability.score,
            overall: 0
        };
        
        // Calculate overall grade (weighted average)
        report.overall = Math.round(
            (report.score * 0.3) +
            (safety.score * 0.3) +
            (environment.scores.total * 0.2) +
            (sustainability.score * 0.2)
        );
        
        // Convert scores to letter grades
        const getGrade = (score) => {
            if (score >= 90) return 'A+';
            if (score >= 85) return 'A';
            if (score >= 80) return 'A-';
            if (score >= 75) return 'B+';
            if (score >= 70) return 'B';
            if (score >= 65) return 'B-';
            if (score >= 60) return 'C+';
            if (score >= 55) return 'C';
            if (score >= 50) return 'C-';
            if (score >= 40) return 'D';
            return 'F';
        };
        
        report.grades = {
            execution: getGrade(report.score),
            safety: getGrade(safety.score),
            environment: getGrade(environment.scores.total),
            sustainability: getGrade(sustainability.score),
            overall: getGrade(report.overall)
        };
        
        // Generate comments
        report.comments = this.generateReportComments(report, safety, environment, sustainability);
        
        return report;
    }

    static generateReportComments(report, safety, environment, sustainability) {
        const comments = [];
        
        // Execution comments
        if (report.grades.execution === 'A' || report.grades.execution === 'A+') {
            comments.push('Excellent dive execution and buddy awareness');
        } else if (report.grades.execution === 'B' || report.grades.execution === 'B+') {
            comments.push('Good dive execution with minor areas for improvement');
        } else if (report.grades.execution === 'C' || report.grades.execution === 'C+') {
            comments.push('Acceptable dive execution, focus on skill development');
        } else {
            comments.push('Needs significant improvement in dive execution');
        }
        
        // Safety comments
        if (safety.level === 'Very Low' || safety.level === 'Low') {
            comments.push('Excellent safety planning and risk management');
        } else if (safety.level === 'Moderate') {
            comments.push('Good safety practices, consider additional precautions');
        } else {
            comments.push('Safety planning needs improvement');
        }
        
        // Environmental comments
        if (environment.level === 'Low') {
            comments.push('Minimal environmental impact, excellent practices');
        } else if (environment.level === 'Moderate') {
            comments.push('Moderate environmental impact, follow best practices');
        } else {
            comments.push('High environmental impact, review and improve practices');
        }
        
        // Sustainability comments
        if (sustainability.level === 'Excellent') {
            comments.push('Outstanding sustainable diving practices');
        } else if (sustainability.level === 'Good') {
            comments.push('Good sustainability practices, room for minor improvements');
        } else {
            comments.push('Focus on improving sustainable diving practices');
        }
        
        // Overall comment
        if (report.grades.overall === 'A' || report.grades.overall === 'A+') {
            comments.push('Overall: Exceptional dive - keep up the great work!');
        } else if (report.grades.overall === 'B' || report.grades.overall === 'B+') {
            comments.push('Overall: Good dive with solid performance');
        } else if (report.grades.overall === 'C' || report.grades.overall === 'C+') {
            comments.push('Overall: Acceptable dive, focus on skill development');
        } else {
            comments.push('Overall: Needs improvement across multiple areas');
        }
        
        return comments;
    }

    static formatReportCard(report) {
        return `
DIVE REPORT CARD
Date: ${report.date}
Location: ${report.location}
Depth: ${report.depth}m | Time: ${report.time}min

GRADES:
Execution: ${report.grades.execution} (${report.score}/100)
Safety: ${report.grades.safety} (${report.safety}/100)
Environment: ${report.grades.environment} (${report.environment}/100)
Sustainability: ${report.grades.sustainability} (${report.sustainability}/100)

OVERALL GRADE: ${report.grades.overall} (${report.overall}/100)

COMMENTS:
${report.comments.map(comment => `• ${comment}`).join('\n')}
        `.trim();
    }

    static calculateDiveCareerPath(currentLevel, goals, experience) {
        const path = {
            current: currentLevel,
            nextSteps: [],
            timeline: {},
            requirements: {},
            certifications: []
        };
        
        // Define certification paths
        const paths = {
            'Open Water': {
                next: 'Advanced Open Water',
                requirements: {
                    dives: 5,
                    skills: ['Buoyancy', 'Navigation', 'Deep Dive'],
                    time: '1-2 months'
                },
                certifications: ['Open Water Diver']
            },
            'Advanced Open Water': {
                next: 'Rescue Diver',
                requirements: {
                    dives: 20,
                    skills: ['Night Dive', 'Deep Dive', 'Navigation'],
                    time: '3-6 months'
                },
                certifications: ['Advanced Open Water', 'Deep Diver', 'Night Diver']
            },
            'Rescue Diver': {
                next: 'Divemaster',
                requirements: {
                    dives: 40,
                    skills: ['Rescue Skills', 'Emergency Management'],
                    time: '6-12 months'
                },
                certifications: ['Rescue Diver', 'Emergency First Response']
            },
            'Divemaster': {
                next: 'Instructor',
                requirements: {
                    dives: 60,
                    skills: ['Leadership', 'Teaching', 'Supervision'],
                    time: '1-2 years'
                },
                certifications: ['Divemaster']
            },
            'Instructor': {
                next: 'Course Director',
                requirements: {
                    dives: 100,
                    skills: ['Course Development', 'Staff Training'],
                    time: '2-5 years'
                },
                certifications: ['Open Water Instructor', 'Specialty Instructor']
            }
        };
        
        // Calculate progress
        if (paths[currentLevel]) {
            const nextLevel = paths[currentLevel].next;
            path.nextSteps.push(`Progress to ${nextLevel}`);
            
            // Check requirements
            const reqs = paths[currentLevel].requirements;
            path.requirements = {
                ...reqs,
                currentDives: experience.dives || 0,
                progress: Math.min(100, Math.round((experience.dives || 0) / reqs.dives * 100))
            };
            
            // Estimate timeline
            const months = parseInt(reqs.time);
            path.timeline = {
                estimated: reqs.time,
                start: new Date(),
                end: new Date(new Date().setMonth(new Date().getMonth() + months))
            };
            
            // Recommended certifications
            path.certifications = paths[currentLevel].certifications;
        }
        
        // Add specialty paths based on goals
        if (goals.includes('Technical Diving')) {
            path.nextSteps.push('Consider Technical Diver path (TDI/SDI)');
            path.certifications.push('Advanced Nitrox', 'Deco Procedures');
        }
        
        if (goals.includes('Commercial Diving')) {
            path.nextSteps.push('Explore commercial diving certifications');
            path.certifications.push('Surface Supplied Diving', 'Closed Bell Diving');
        }
        
        if (goals.includes('Scientific Diving')) {
            path.nextSteps.push('Pursue scientific diving training');
            path.certifications.push('AAUS Scientific Diver');
        }
        
        return path;
    }

    static formatCareerPath(path) {
        return `
DIVING CAREER PATH
Current Level: ${path.current}

NEXT STEPS:
${path.nextSteps.map(step => `• ${step}`).join('\n')}

REQUIREMENTS:
• Dives: ${path.requirements.currentDives}/${path.requirements.dives} (${path.requirements.progress}%)
• Skills: ${path.requirements.skills.join(', ')}
• Timeline: ${path.requirements.time}

TIMELINE:
• Start: ${path.timeline.start.toLocaleDateString('es-ES')}
• Estimated Completion: ${path.timeline.end.toLocaleDateString('es-ES')}

RECOMMENDED CERTIFICATIONS:
${path.certifications.map(cert => `• ${cert}`).join('\n')}
        `.trim();
    }

    static calculateDiveInvestmentROI(careerPath, costs, earningPotential) {
        const investment = {
            training: 0,
            equipment: 0,
            travel: 0,
            time: 0,
            total: 0
        };
        
        // Estimate costs based on career path
        const costEstimates = {
            'Open Water': { training: 400, equipment: 1000, travel: 500 },
            'Advanced Open Water': { training: 300, equipment: 500, travel: 1000 },
            'Rescue Diver': { training: 400, equipment: 500, travel: 1500 },
            'Divemaster': { training: 800, equipment: 1000, travel: 3000 },
            'Instructor': { training: 1500, equipment: 2000, travel: 5000 }
        };
        
        // Calculate cumulative investment
        let totalTraining = 0;
        let totalEquipment = 0;
        let totalTravel = 0;
        
        for (const level of Object.keys(costEstimates)) {
            if (this.isLevelAchieved(level, careerPath.current)) {
                totalTraining += costEstimates[level].training;
                totalEquipment += costEstimates[level].equipment;
                totalTravel += costEstimates[level].travel;
            }
        }
        
        investment.training = totalTraining;
        investment.equipment = totalEquipment;
        investment.travel = totalTravel;
        investment.time = careerPath.yearsExperience * 1000; // Opportunity cost
        investment.total = totalTraining + totalEquipment + totalTravel + investment.time;
        
        // Calculate ROI
        const roi = {
            recreational: 0,
            professional: 0,
            breakEven: 0
        };
        
        // Recreational ROI (enjoyment value)
        roi.recreational = (careerPath.dives * 100) / investment.total;
        
        // Professional ROI
        if (earningPotential.annual > 0) {
            roi.professional = (earningPotential.annual * careerPath.yearsExperience) / investment.total;
            roi.breakEven = investment.total / earningPotential.annual;
        }
        
        return {
            investment,
            roi,
            analysis: this.generateInvestmentAnalysis(investment, roi, careerPath)
        };
    }

    static isLevelAchieved(targetLevel, currentLevel) {
        const levels = ['Open Water', 'Advanced Open Water', 'Rescue Diver', 'Divemaster', 'Instructor'];
        const targetIndex = levels.indexOf(targetLevel);
        const currentIndex = levels.indexOf(currentLevel);
        return targetIndex <= currentIndex;
    }

    static generateInvestmentAnalysis(investment, roi, careerPath) {
        const analysis = [];
        
        analysis.push(`Total Investment: €${investment.total.toFixed(2)}`);
        analysis.push(`Training: €${investment.training.toFixed(2)} (${Math.round(investment.training / investment.total * 100)}%)`);
        analysis.push(`Equipment: €${investment.equipment.toFixed(2)} (${Math.round(investment.equipment / investment.total * 100)}%)`);
        analysis.push(`Travel: €${investment.travel.toFixed(2)} (${Math.round(investment.travel / investment.total * 100)}%)`);
        analysis.push(`Time Opportunity Cost: €${investment.time.toFixed(2)} (${Math.round(investment.time / investment.total * 100)}%)`);
        
        analysis.push(`\nRecreational ROI: ${roi.recreational.toFixed(1)}%`);
        if (roi.recreational > 100) {
            analysis.push('Excellent recreational value!');
        } else if (roi.recreational > 50) {
            analysis.push('Good recreational value');
        } else {
            analysis.push('Consider focusing on specific diving interests');
        }
        
        if (roi.professional > 0) {
            analysis.push(`\nProfessional ROI: ${roi.professional.toFixed(1)}%`);
            analysis.push(`Break-even point: ${roi.breakEven.toFixed(1)} years`);
            
            if (roi.professional > 200) {
                analysis.push('Excellent professional investment!');
            } else if (roi.professional > 100) {
                analysis.push('Good professional investment');
            } else if (roi.professional > 0) {
                analysis.push('Professional diving may not be financially optimal');
            }
        }
        
        // Recommendations
        analysis.push('\nRECOMMENDATIONS:');
        if (roi.recreational < 50 && roi.professional === 0) {
            analysis.push('• Focus on local diving to reduce travel costs');
            analysis.push('• Consider equipment rental instead of purchase');
            analysis.push('• Join a dive club for group discounts');
        } else if (roi.professional > 0 && roi.professional < 100) {
            analysis.push('• Specialize in high-demand areas (tech, photography)');
            analysis.push('• Consider seasonal work in popular destinations');
            analysis.push('• Develop additional skills (marine biology, photography)');
        }
        
        return analysis;
    }

    static formatInvestmentROI(analysis) {
        return `
DIVING INVESTMENT ANALYSIS
${analysis.investment ? `
INVESTMENT BREAKDOWN:
Total: €${analysis.investment.total.toFixed(2)}
${Object.entries(analysis.investment)
    .filter(([key]) => key !== 'total')
    .map(([key, value]) => `• ${key}: €${value.toFixed(2)}`)
    .join('\n')}
` : ''}

${analysis.roi ? `
RETURN ON INVESTMENT:
${Object.entries(analysis.roi)
    .map(([key, value]) => `• ${key}: ${typeof value === 'number' ? value.toFixed(1) + '%' : value}`)
    .join('\n')}
` : ''}

${analysis.analysis ? `
ANALYSIS & RECOMMENDATIONS:
${analysis.analysis.join('\n')}
` : ''}
        `.trim();
    }

    static calculateDiveEquipmentDepreciation(equipment, purchaseDate, usage) {
        const depreciation = {};
        const currentDate = new Date();
        const ageYears = (currentDate - new Date(purchaseDate)) / (1000 * 60 * 60 * 24 * 365);
        
        for (const [item, details] of Object.entries(equipment)) {
            const baseRate = details.lifespan || 5;
            const usageFactor = usage[item] || 1;
            
            // Calculate depreciation
            const effectiveAge = ageYears * usageFactor;
            const remainingLife = Math.max(0, baseRate - effectiveAge);
            const depreciationPercent = Math.min(100, (effectiveAge / baseRate) * 100);
            const currentValue = details.cost * (1 - (depreciationPercent / 100));
            
            depreciation[item] = {
                cost: details.cost,
                age: ageYears.toFixed(1),
                effectiveAge: effectiveAge.toFixed(1),
                remainingLife: remainingLife.toFixed(1),
                depreciation: depreciationPercent.toFixed(1) + '%',
                currentValue: Math.round(currentValue),
                replacementYear: new Date(purchaseDate).getFullYear() + Math.ceil(baseRate / usageFactor),
                status: this.getEquipmentStatus(remainingLife, details.lastService)
            };
        }
        
        // Calculate totals
        depreciation.total = {
            original: Object.values(equipment).reduce((sum, item) => sum + item.cost, 0),
            current: Object.values(depreciation).reduce((sum, item) => sum + (item.currentValue || 0), 0),
            depreciation: Object.values(depreciation).reduce((sum, item) => {
                if (item.depreciation) {
                    const percent = parseFloat(item.depreciation);
                    return sum + (item.cost * percent / 100);
                }
                return sum;
            }, 0)
        };
        
        return depreciation;
    }

    static getEquipmentStatus(remainingLife, lastService) {
        const monthsSinceService = lastService ? 
            (new Date() - new Date(lastService)) / (1000 * 60 * 60 * 24 * 30) : 12;
        
        if (remainingLife < 1) {
            return 'CRITICAL - Needs replacement';
        } else if (remainingLife < 2) {
            return 'POOR - Plan replacement soon';
        } else if (monthsSinceService > 24) {
            return 'NEEDS SERVICE - Overdue for maintenance';
        } else if (monthsSinceService > 12) {
            return 'FAIR - Due for service';
        } else if (remainingLife < 5) {
            return 'GOOD - Regular maintenance needed';
        } else {
            return 'EXCELLENT - Well maintained';
        }
    }

    static formatEquipmentDepreciation(depreciation) {
        const sections = [];
        
        sections.push('EQUIPMENT DEPRECIATION REPORT');
        sections.push(`Total Original Value: €${depreciation.total.original}`);
        sections.push(`Total Current Value: €${depreciation.total.current}`);
        sections.push(`Total Depreciation: €${Math.round(depreciation.total.depreciation)}`);
        
        sections.push('\nITEM DETAILS:');
        for (const [item, details] of Object.entries(depreciation)) {
            if (item !== 'total') {
                sections.push(`\n${item.toUpperCase()}:`);
                sections.push(`  Cost: €${details.cost}`);
                sections.push(`  Age: ${details.age} years (effective: ${details.effectiveAge} years)`);
                sections.push(`  Remaining Life: ${details.remainingLife} years`);
                sections.push(`  Depreciation: ${details.depreciation}`);
                sections.push(`  Current Value: €${details.currentValue}`);
                sections.push(`  Replacement Year: ${details.replacementYear}`);
                sections.push(`  Status: ${details.status}`);
            }
        }
        
        sections.push('\nRECOMMENDATIONS:');
        const criticalItems = Object.entries(depreciation)
            .filter(([key, item]) => key !== 'total' && item.status.includes('CRITICAL'));
        
        const serviceItems = Object.entries(depreciation)
            .filter(([key, item]) => key !== 'total' && item.status.includes('SERVICE'));
        
        if (criticalItems.length > 0) {
            sections.push('IMMEDIATE ACTION REQUIRED:');
            criticalItems.forEach(([item]) => sections.push(`  • Replace ${item}`));
        }
        
        if (serviceItems.length > 0) {
            sections.push('SCHEDULE SERVICE FOR:');
            serviceItems.forEach(([item]) => sections.push(`  • ${item}`));
        }
        
        if (criticalItems.length === 0 && serviceItems.length === 0) {
            sections.push('All equipment in good condition. Continue regular maintenance.');
        }
        
        return sections.join('\n');
    }

    static calculateDiveTravelCarbonFootprint(travel, diving, duration) {
        const footprint = {
            transportation: 0,
            accommodation: 0,
            activities: 0,
            total: 0
        };
        
        // Transportation emissions (kg CO2)
        const transportEmissions = {
            plane: 0.25, // kg CO2 per passenger-km
            car: 0.12,   // kg CO2 per km
            boat: 0.15,  // kg CO2 per km
            train: 0.04  // kg CO2 per km
        };
        
        for (const [mode, distance] of Object.entries(travel.distances || {})) {
            if (transportEmissions[mode]) {
                footprint.transportation += distance * transportEmissions[mode];
            }
        }
        
        // Accommodation emissions
        footprint.accommodation = duration * 20; // kg CO2 per night
        
        // Diving activities emissions
        footprint.activities = diving.boatTrips * 50; // kg CO2 per boat trip
        footprint.activities += diving.dives * 5;     // kg CO2 per dive (compressor, etc.)
        
        // Calculate total
        footprint.total = footprint.transportation + footprint.accommodation + footprint.activities;
        
        // Calculate offset requirements
        const treesNeeded = Math.ceil(footprint.total / 21); // One tree absorbs ~21kg CO2 per year
        const costToOffset = footprint.total * 0.02; // €0.02 per kg CO2
        
        return {
            footprint,
            treesNeeded,
            costToOffset,
            comparison: this.compareCarbonFootprint(footprint.total, duration),
            recommendations: this.generateCarbonReductionRecommendations(footprint, travel, diving)
        };
    }

    static compareCarbonFootprint(totalCO2, duration) {
        const averageTourist = 200 * duration; // kg CO2 per day for average tourist
        const comparison = {
            vsAverage: ((totalCO2 / averageTourist) * 100).toFixed(1),
            equivalent: {
                carKm: Math.round(totalCO2 / 0.12),
                treesYear: Math.round(totalCO2 / 21),
                smartphones: Math.round(totalCO2 / 50) // manufacturing emissions
            }
        };
        
        return comparison;
    }

    static generateCarbonReductionRecommendations(footprint, travel, diving) {
        const recommendations = [];
        
        if (footprint.transportation > 1000) {
            recommendations.push('Consider train travel instead of flying for shorter distances');
            recommendations.push('Choose direct flights to reduce emissions from takeoffs/landings');
            recommendations.push('Offset flight emissions through certified programs');
        }
        
        if (footprint.accommodation > 100) {
            recommendations.push('Choose eco-certified accommodations');
            recommendations.push('Reduce energy consumption in accommodation');
            recommendations.push('Consider longer stays to reduce per-day travel emissions');
        }
        
        if (footprint.activities > 50) {
            recommendations.push('Consolidate boat trips to reduce fuel consumption');
            recommendations.push('Choose dive operators with eco-friendly practices');
            recommendations.push('Consider shore diving to reduce boat usage');
        }
        
        // General recommendations
        recommendations.push('Pack light to reduce transportation emissions');
        recommendations.push('Use reef-safe sunscreen to protect marine ecosystems');
        recommendations.push('Support local conservation efforts');
        
        return recommendations;
    }

    static formatCarbonFootprint(analysis) {
        return `
CARBON FOOTPRINT ANALYSIS
Total Emissions: ${analysis.footprint.total.toFixed(1)} kg CO2

BREAKDOWN:
• Transportation: ${analysis.footprint.transportation.toFixed(1)} kg CO2
• Accommodation: ${analysis.footprint.accommodation.toFixed(1)} kg CO2
• Activities: ${analysis.footprint.activities.toFixed(1)} kg CO2

COMPARISON:
• ${analysis.comparison.vsAverage}% of average tourist emissions
• Equivalent to ${analysis.comparison.equivalent.carKm} km by car
• Would require ${analysis.treesNeeded} trees to offset for one year
• Offset cost: €${analysis.costToOffset.toFixed(2)}

RECOMMENDATIONS:
${analysis.recommendations.map(rec => `• ${rec}`).join('\n')}
        `.trim();
    }

    static calculateDiveHealthBenefits(dives, frequency, conditions) {
        const benefits = {
            physical: 0,
            mental: 0,
            social: 0,
            total: 0
        };
        
        // Physical benefits
        benefits.physical += Math.min(50, dives * 5); // Exercise
        benefits.physical += conditions.cold ? 10 : 5; // Cold adaptation
        benefits.physical += Math.min(20, frequency * 2); // Regular exercise
        
        // Mental benefits
        benefits.mental += Math.min(40, dives * 4); // Stress reduction
        benefits.mental += conditions.clearWater ? 15 : 5; // Visual stimulation
        benefits.mental += 10; // Mindfulness during dive
        
        // Social benefits
        benefits.social += Math.min(30, frequency * 3); // Social interaction
        benefits.social += conditions.groupDiving ? 15 : 5; // Team building
        benefits.social += 10; // Community engagement
        
        // Calculate total
        benefits.total = benefits.physical + benefits.mental + benefits.social;
        
        // Health impact assessment
        const impact = {
            level: benefits.total >= 100 ? 'Excellent' : 
                   benefits.total >= 70 ? 'Good' : 
                   benefits.total >= 40 ? 'Moderate' : 'Low',
            equivalent: this.calculateHealthEquivalents(benefits.total),
            recommendations: this.generateHealthRecommendations(benefits, frequency)
        };
        
        return {
            benefits,
            impact
        };
    }

    static calculateHealthEquivalents(benefitScore) {
        return {
            gymSessions: Math.round(benefitScore / 10),
            meditationHours: Math.round(benefitScore / 15),
            therapySessions: Math.round(benefitScore / 20),
            socialEvents: Math.round(benefitScore / 8)
        };
    }

    static generateHealthRecommendations(benefits, frequency) {
        const recommendations = [];
        
        if (benefits.physical < 30) {
            recommendations.push('Increase dive frequency to 2-3 times per month');
            recommendations.push('Incorporate surface swimming before/after dives');
            recommendations.push('Consider cold water diving for additional benefits');
        }
        
        if (benefits.mental < 25) {
            recommendations.push('Practice mindfulness during safety stops');
            recommendations.push('Try night diving for new mental challenges');
            recommendations.push('Keep a dive journal to reflect on experiences');
        }
        
        if (benefits.social < 20) {
            recommendations.push('Join a local dive club or community');
            recommendations.push('Participate in group conservation dives');
            recommendations.push('Consider becoming a dive guide or instructor');
        }
        
        if (frequency < 2) {
            recommendations.push('Aim for regular diving (at least monthly) for maximum benefits');
        }
        
        // General health recommendations
        recommendations.push('Stay hydrated before and after dives');
        recommendations.push('Maintain good physical fitness for diving');
        recommendations.push('Get regular medical checkups for diving fitness');
        
        return recommendations;
    }

    static formatHealthBenefits(analysis) {
        return `
DIVING HEALTH BENEFITS ANALYSIS
Total Benefit Score: ${analysis.benefits.total}/150

BREAKDOWN:
• Physical: ${analysis.benefits.physical}/60
• Mental: ${analysis.benefits.mental}/50
• Social: ${analysis.benefits.social}/40

HEALTH IMPACT: ${analysis.impact.level}

EQUIVALENT TO:
• ${analysis.impact.equivalent.gymSessions} gym sessions
• ${analysis.impact.equivalent.meditationHours} hours of meditation
• ${analysis.impact.equivalent.therapySessions} therapy sessions
• ${analysis.impact.equivalent.socialEvents} social events

RECOMMENDATIONS:
${analysis.impact.recommendations.map(rec => `• ${rec}`).join('\n')}
        `.trim();
    }

    static calculateDiveLifeBalance(diving, otherActivities, timeAvailable) {
        const balance = {
            diving: 0,
            other: 0,
            balanceScore: 0,
            recommendations: []
        };
        
        // Calculate time allocation
        const totalDivingTime = diving.timePerMonth * 12;
        const totalOtherTime = otherActivities.reduce((sum, activity) => sum + activity.timePerMonth, 0) * 12;
        const totalTime = totalDivingTime + totalOtherTime;
        
        balance.diving = (totalDivingTime / totalTime) * 100;
        balance.other = (totalOtherTime / totalTime) * 100;
        
        // Calculate balance score (0-100)
        const idealBalance = 30; // 30% diving, 70% other activities
        const balanceDeviation = Math.abs(balance.diving - idealBalance);
        balance.balanceScore = Math.max(0, 100 - (balanceDeviation * 2));
        
        // Generate recommendations
        if (balance.diving > 50) {
            balance.recommendations.push('Consider reducing diving time to maintain life balance');
            balance.recommendations.push('Ensure you maintain other hobbies and social connections');
            balance.recommendations.push('Monitor for signs of diving obsession or burnout');
        } else if (balance.diving < 20) {
            balance.recommendations.push('You have room to increase diving time if desired');
            balance.recommendations.push('Consider setting specific diving goals');
            balance.recommendations.push('Look for diving opportunities that fit your schedule');
        } else {
            balance.recommendations.push('Good balance between diving and other activities');
            balance.recommendations.push('Continue enjoying diving as part of a balanced lifestyle');
        }
        
        // Time management recommendations
        if (totalTime > timeAvailable * 0.8) {
            balance.recommendations.push('Your schedule appears quite full - consider prioritizing');
        } else if (totalTime < timeAvailable * 0.5) {
            balance.recommendations.push('You have available time for additional activities');
        }
        
        return balance;
    }

    static formatLifeBalance(balance) {
        return `
DIVING LIFE BALANCE ANALYSIS
Balance Score: ${balance.balanceScore.toFixed(1)}/100

TIME ALLOCATION:
• Diving: ${balance.diving.toFixed(1)}%
• Other Activities: ${balance.other.toFixed(1)}%

INTERPRETATION:
${balance.balanceScore >= 80 ? 'Excellent balance between diving and life' :
  balance.balanceScore >= 60 ? 'Good balance with room for optimization' :
  balance.balanceScore >= 40 ? 'Moderate balance - consider adjustments' :
  'Poor balance - needs significant adjustment'}

RECOMMENDATIONS:
${balance.recommendations.map(rec => `• ${rec}`).join('\n')}
        `.trim();
    }

    static generateDiveLifeIntegrationPlan(currentSituation, goals, constraints) {
        const plan = {
            current: currentSituation,
            goals: goals,
            timeline: {},
            steps: [],
            milestones: [],
            challenges: [],
            support: []
        };
        
        // Define integration levels
        const levels = [
            { name: 'Casual Diver', dives: '<10/year', time: '<5%', focus: 'Recreation' },
            { name: 'Active Diver', dives: '10-30/year', time: '5-15%', focus: 'Skill Development' },
            { name: 'Advanced Diver', dives: '30-60/year', time: '15-30%', focus: 'Specialization' },
            { name: 'Semi-Professional', dives: '60-100/year', time: '30-50%', focus: 'Teaching/Guiding' },
            { name: 'Professional', dives: '100+/year', time: '50%+', focus: 'Career' }
        ];
        
        // Determine current and target levels
        plan.currentLevel = this.determineDivingLevel(currentSituation);
        plan.targetLevel = this.determineTargetLevel(goals);
        
        // Create timeline
        const yearsNeeded = Math.abs(
            levels.indexOf(plan.targetLevel) - levels.indexOf(plan.currentLevel)
        ) + 1;
        
        plan.timeline = {
            start: new Date(),
            end: new Date(new Date().setFullYear(new Date().getFullYear() + yearsNeeded)),
            duration: `${yearsNeeded} year${yearsNeeded > 1 ? 's' : ''}`
        };
        
        // Create steps
        const stepCount = levels.indexOf(plan.targetLevel) - levels.indexOf(plan.currentLevel);
        if (stepCount > 0) {
            for (let i = 1; i <= stepCount; i++) {
                const targetIndex = levels.indexOf(plan.currentLevel) + i;
                if (targetIndex < levels.length) {
                    const nextLevel = levels[targetIndex];
                    plan.steps.push({
                        year: i,
                        level: nextLevel.name,
                        actions: this.generateLevelActions(nextLevel, constraints)
                    });
                }
            }
        }
        
        // Identify challenges
        plan.challenges = this.identifyIntegrationChallenges(constraints, goals);
        
        // Suggest support systems
        plan.support = this.generateSupportSystems(goals, constraints);
        
        return plan;
    }

    static determineDivingLevel(situation) {
        if (situation.divesPerYear >= 100) return 'Professional';
        if (situation.divesPerYear >= 60) return 'Semi-Professional';
        if (situation.divesPerYear >= 30) return 'Advanced Diver';
        if (situation.divesPerYear >= 10) return 'Active Diver';
        return 'Casual Diver';
    }

    static determineTargetLevel(goals) {
        if (goals.includes('Professional Diving Career')) return 'Professional';
        if (goals.includes('Become Dive Instructor')) return 'Semi-Professional';
        if (goals.includes('Technical Diving')) return 'Advanced Diver';
        if (goals.includes('Regular Recreational Diving')) return 'Active Diver';
        return 'Casual Diver';
    }

    static generateLevelActions(level, constraints) {
        const actions = [];
        
        switch (level.name) {
            case 'Active Diver':
                actions.push('Complete Advanced Open Water certification');
                actions.push('Invest in personal diving equipment');
                actions.push('Join local dive club or community');
                actions.push('Plan 2-3 dive trips per year');
                break;
                
            case 'Advanced Diver':
                actions.push('Complete Rescue Diver certification');
                actions.push('Specialize in 2-3 diving disciplines');
                actions.push('Invest in technical equipment');
                actions.push('Mentor new divers');
                break;
                
            case 'Semi-Professional':
                actions.push('Complete Divemaster certification');
                actions.push('Gain experience assisting with classes');
                actions.push('Develop teaching and leadership skills');
                actions.push('Network with dive professionals');
                break;
                
            case 'Professional':
                actions.push('Complete Instructor certification');
                actions.push('Develop business plan for diving career');
                actions.push('Build professional network');
                actions.push('Consider additional specialties (tech, medical, etc.)');
                break;
        }
        
        // Adjust for constraints
        if (constraints.budget === 'low') {
            actions.push('Look for budget-friendly training options');
            actions.push('Consider equipment rental instead of purchase');
            actions.push('Focus on local diving to reduce travel costs');
        }
        
        if (constraints.time === 'limited') {
            actions.push('Schedule diving around existing commitments');
            actions.push('Consider intensive training courses');
            actions.push('Focus on quality over quantity of dives');
        }
        
        return actions;
    }

    static identifyIntegrationChallenges(constraints, goals) {
        const challenges = [];
        
        if (constraints.budget === 'low' && goals.includes('Professional Diving Career')) {
            challenges.push('Significant financial investment required for professional training');
        }
        
        if (constraints.time === 'limited' && goals.includes('Regular Recreational Diving')) {
            challenges.push('Time management needed to fit diving into busy schedule');
        }
        
        if (constraints.location === 'inland' && goals.includes('Regular Recreational Diving')) {
            challenges.push('Travel required for ocean diving - consider local alternatives');
        }
        
        if (constraints.health && goals.includes('Technical Diving')) {
            challenges.push('Medical clearance required for technical diving');
        }
        
        return challenges;
    }

    static generateSupportSystems(goals, constraints) {
        const support = [];
        
        support.push('Local dive shop or club for equipment and community');
        support.push('Diving mentor or instructor for guidance');
        support.push('Online diving communities and forums');
        
        if (goals.includes('Professional Diving Career')) {
            support.push('Professional diving associations (PADI, SSI, etc.)');
            support.push('Business networking groups for dive professionals');
            support.push('Continuing education programs');
        }
        
        if (constraints.budget === 'low') {
            support.push('Second-hand equipment markets');
            support.push('Dive club group discounts');
            support.push('Volunteer opportunities for dive access');
        }
        
        if (constraints.time === 'limited') {
            support.push('Online training modules for flexible learning');
            support.push('Weekend diving trips and courses');
            support.push('Local dive sites for quick access');
        }
        
        return support;
    }

    static formatIntegrationPlan(plan) {
        return `
DIVING LIFE INTEGRATION PLAN

CURRENT SITUATION:
• Level: ${plan.currentLevel.name}
• Dives/Year: ${plan.current.divesPerYear}
• Time Allocation: ${plan.current.timePercentage}%

GOALS:
${plan.goals.map(goal => `• ${goal}`).join('\n')}

TIMELINE:
• Start: ${plan.timeline.start.toLocaleDateString('es-ES')}
• Target Completion: ${plan.timeline.end.toLocaleDateString('es-ES')}
• Duration: ${plan.timeline.duration}

IMPLEMENTATION STEPS:
${plan.steps.map((step, index) => `
Year ${step.year} - ${step.level}:
${step.actions.map(action => `  • ${action}`).join('\n')}
`).join('\n')}

ANTICIPATED CHALLENGES:
${plan.challenges.length > 0 ? 
  plan.challenges.map(challenge => `• ${challenge}`).join('\n') : 
  '• No major challenges anticipated'}

SUPPORT SYSTEMS:
${plan.support.map(system => `• ${system}`).join('\n')}

SUCCESS METRICS:
• Regular diving activity maintained
• Steady progression through certification levels
• Balanced integration with other life areas
• Personal satisfaction and enjoyment
        `.trim();
    }

    static calculateDiveLegacyImpact(career, contributions, influence) {
        const legacy = {
            direct: 0,
            indirect: 0,
            environmental: 0,
            educational: 0,
            total: 0
        };
        
        // Direct impact (students taught, dives guided)
        legacy.direct += career.studentsTaught * 10;
        legacy.direct += career.divesGuided * 5;
        legacy.direct += career.certificationsIssued * 15;
        
        // Indirect impact (influence on others)
        legacy.indirect += influence.mentees * 20;
        legacy.indirect += influence.communityLeadership * 30;
        legacy.indirect += influence.onlinePresence * 15;
        
        // Environmental impact
        legacy.environmental += contributions.conservationProjects * 40;
        legacy.environmental += contributions.cleanupDives * 25;
        legacy.environmental += contributions.researchParticipation * 35;
        
        // Educational impact
        legacy.educational += contributions.coursesDeveloped * 50;
        legacy.educational += contributions.articlesPublished * 30;
        legacy.educational += contributions.presentationsGiven * 20;
        
        // Calculate total
        legacy.total = legacy.direct + legacy.indirect + legacy.environmental + legacy.educational;
        
        // Legacy assessment
        const assessment = {
            level: legacy.total >= 500 ? 'Legendary' :
                   legacy.total >= 300 ? 'Significant' :
                   legacy.total >= 150 ? 'Notable' :
                   legacy.total >= 50 ? 'Moderate' : 'Developing',
            highlights: this.generateLegacyHighlights(legacy, career, contributions),
            continuation: this.generateLegacyContinuation(legacy, career)
        };
        
        return {
            legacy,
            assessment
        };
    }

    static generateLegacyHighlights(legacy, career, contributions) {
        const highlights = [];
        
        if (legacy.direct > 100) {
            highlights.push(`Trained ${career.studentsTaught} divers who continue the tradition`);
        }
        
        if (legacy.environmental > 50) {
            highlights.push(`Contributed to ${contributions.conservationProjects} conservation projects`);
        }
        
        if (legacy.educational > 50) {
            highlights.push(`Developed educational materials used by ${career.studentsTaught * 2} people`);
        }
        
        if (legacy.indirect > 100) {
            highlights.push(`Mentored ${Math.floor(legacy.indirect / 20)} diving professionals`);
        }
        
        return highlights;
    }

    static generateLegacyContinuation(legacy, career) {
        const continuation = [];
        
        if (career.yearsExperience >= 10) {
            continuation.push('Consider writing a book or memoir about diving experiences');
            continuation.push('Establish a scholarship fund for aspiring dive professionals');
            continuation.push('Create a diving mentorship program');
        }
        
        if (legacy.total >= 300) {
            continuation.push('Donate to marine conservation organizations');
            continuation.push('Establish an annual diving award or competition');
            continuation.push('Create a diving education foundation');
        }
        
        if (career.studentsTaught >= 100) {
            continuation.push('Organize alumni events and reunions');
            continuation.push('Create an online community for former students');
            continuation.push('Develop advanced training for former students');
        }
        
        return continuation;
    }

    static formatLegacyImpact(analysis) {
        return `
DIVING LEGACY IMPACT ASSESSMENT
Total Legacy Score: ${analysis.legacy.total}/1000

IMPACT BREAKDOWN:
• Direct Impact: ${analysis.legacy.direct}/300
  (Students taught, dives guided, certifications issued)
• Indirect Impact: ${analysis.legacy.indirect}/300
  (Mentorship, community leadership, online influence)
• Environmental Impact: ${analysis.legacy.environmental}/200
  (Conservation projects, cleanups, research)
• Educational Impact: ${analysis.legacy.educational}/200
  (Course development, publications, presentations)

LEGACY LEVEL: ${analysis.assessment.level}

HIGHLIGHTS:
${analysis.assessment.highlights.length > 0 ? 
  analysis.assessment.highlights.map(highlight => `• ${highlight}`).join('\n') : 
  '• Legacy still developing - continue your diving journey'}

CONTINUATION SUGGESTIONS:
${analysis.assessment.continuation.length > 0 ? 
  analysis.assessment.continuation.map(suggestion => `• ${suggestion}`).join('\n') : 
  '• Focus on building your diving legacy through consistent contributions'}

YOUR DIVING LEGACY:
${analysis.legacy.total >= 500 ? 
  'You have created an enduring legacy in the diving community that will inspire generations to come.' :
  analysis.legacy.total >= 300 ?
  'Your significant contributions have made a lasting impact on diving and conservation.' :
  analysis.legacy.total >= 150 ?
  'Your notable efforts have positively influenced many divers and marine environments.' :
  analysis.legacy.total >= 50 ?
  'You are building a meaningful legacy through your diving activities.' :
  'Your diving legacy is just beginning - every dive contributes to your impact.'}
        `.trim();
    }
}

// Instancia singleton
export const utils = new Utils();
